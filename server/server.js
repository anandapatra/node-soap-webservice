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
                    console.log('Received Request..', request);
                    return ( { 'addResponse' :
                                {
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
soap.listen(server,
  {
    path: '/calculator',
    services: calculatorService,
    xml: wsdl
  }
);
