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


/*

SocIoTal requests:

# GET TOKEN

POST /SocIoTal_COMM_V1/TOKEN/simpleRequest HTTP/1.1
Host: platform.sociotal.eu:3500
Content-Type: application/json
Cache-Control: no-cache
Postman-Token: b7d3d8bd-01c8-af91-16cb-7d87e047eb0a

{
   "id":"2462d02cfdsafjkl3f5e0cc319cc-changethis",
   "password":"asfdf-changethis",
   "domainName":"Default",
   "communityName":"Superhik"
}


# SEND DATA

POST /SocIoTal_CM_REST_V3/NGSI10_API/updateContext HTTP/1.1
Host: platform.sociotal.eu:3500
Community-Token: 00d0e06d10bb4b39a7a29e2fce4700ae
Content-Type: application/json
Cache-Control: no-cache
Postman-Token: 5fecfc4a-be2f-d79a-f47e-bd74631b2bb9

{
    "contextElements": [{
        "id": "Superhik:CRS4:generic:Ethanol_sensor",
        "type": "urn:x-org:sociotal:resource:generic",
        "isPattern": "false",
        "attributes": [{
            "name": "Atmospheric_airParticles",
            "value": "41238217",
            "type": "http://sensorml.com/ont/swe/property/Atmospheric_airParticles"
        }]
    }],
    "updateAction": "UPDATE"
}

# ADD NEW MEMBER

PUT /SocIoTal_COMM_V1/COMMUNITIES/assignRole HTTP/1.1
Host: platform.sociotal.eu:3500
Community-Token: 00d0e06d10bb4b39a7a29e2fce4700ae
Content-Type: application/json
Cache-Control: no-cache
Postman-Token: a5b4a0ca-8062-2258-f522-aa0e2974b6a1

{
    "userId":"75c40d8f-dc8a-changethis",
    "roleName":"member"
}

*/