const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser')
const {soap} = require('strong-soap');


var publicPath = path.join('__dirname', '../public');
var wsdlPath = path.join('__dirname', '../wsdl');
var port = process.env.PORT || 3000;


var app = express();
var server = http.createServer(app);

app.use(express.static(publicPath));
app.use(bodyParser.json());

var calculatorService = {
     CalculatorService : {
           CalculatorHttpPort : {
                 add : (request) => {
                    if (request.n1 === '2') {
                      throw {
                        Fault: {
                          Code: {
                            Value: 'soap:Sender',
                            Subcode: { value: 'rpc:BadArguments' }
                          },
                          Reason: { Text: 'Processing Error' },
                          statusCode: 500
                        }
                      };
                    }
                    return ( { 'addResponse' : {
                                'return': (parseInt(request.n1) + parseInt(request.n2))
                              }
                             }
                            );
                 }
           }
     }
};

var wsdl = fs.readFileSync(`${wsdlPath}/calculator.wsdl`, 'utf-8');

server.listen(port, () => {
  console.log(`Server started at port ${port}`);
});

var calcservice = soap.listen(server,
  {
    path: '/calculator',
    services: calculatorService,
    xml: wsdl
  }
);

calcservice.log = (type, data) => {
  // console.log(`====================${type}========================`);
  // console.log(data);
};

calcservice.authenticate = function(security) {
   try {
    var created, nonce, password, user, token;
    token = security.UsernameToken, user = token.Username,
            password = token.Password, nonce = token.Nonce, created = token.Created;
     return user === 'test' && password.$value === soap.passwordDigest(nonce, created, 'test');
   } catch (e) {
     console.log(e);
     throw {
       Fault: {
         Code: {
           Value: 'soap:Sender',
           Subcode: { value: 'rpc:BadArguments' }
         },
         Reason: { Text: 'Authentication Failure' },
         statusCode: 500
       }
     };
   }
  };

calcservice.authorizeConnection = function(req) {
    return true; // or false
};
