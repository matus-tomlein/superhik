var express = require('express');
var app = express();
var http = require('http');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

function getReadings(callback) {
  var options = {
    headers: {
      'Community-Token': '00d0e06d10bb4b39a7a29e2fce4700ae',
      'Accept': 'application/json'
    },
    host: 'platform.sociotal.eu',
    port: 3500,
    path: '/SocIoTal_CM_REST_V3/EXTENDED/queryContext/Superhik:CRS4:generic:Ethanol_sensor'
  };

  var responded = function (data) {
    var allItems = [];
    
    var response = data.contextResponses[data.contextResponses.length - 1];
    var items = response.contextElement.attributes.filter(function (element) {
      return element.name == 'Atmospheric_airParticles';
    });
    
    var item = items[items.length - 1];
    
    callback(item.value);
  }

  http.request(options, function(response) {
    var str = '';
    
    response.on('data', function (chunk) {
      str += chunk;
    });
  
    response.on('end', function () {
      responded(JSON.parse(str));
    });
  }).end();
}

app.get("/read", function (request, response) {
  getReadings(function (reading) {
    response.send(reading);
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});