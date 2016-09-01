var express = require('express');
var app = express();
var http = require('http');
var _ = require('underscore');

var readings = [
  { user: 'Matus', value: 2 },
  { user: 'Matus', value: 4 },
  { user: 'Nikola', value: 7 },
  { user: 'Nikola', value: 9 },
  { user: 'Srdjan', value: 1 },
  { user: 'Srdjan', value: 0 },
  { user: 'Srdjan', value: 7 },
  { user: 'Srdjan', value: 5 },
  { user: 'Ana', value: 1 },
  { user: 'Ana', value: 0.5 },
  { user: 'Irena', value: 1 },
  { user: 'Irena', value: 3 }
];
var processed = [];

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/read', function (request, response) {
  response.send(processed);
});

// listen for requests :)
var listener = app.listen(8888, function () {
  console.log('Your app is listening on port ' + listener.address().port);
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
    var response = data.contextResponses[data.contextResponses.length - 1];
    var values = response.contextElement.attributes.filter(function (element) {
      return element.name == 'Atmospheric_airParticles';
    });
    var owners = response.contextElement.attributes.filter(function (element) {
      return element.name == 'Owner';
    });

    var value = values[values.length - 1].value;
    var owner = owners[owners.length - 1].value;

    callback({
      value: value,
      user: owner
    });
  };

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

function planUpdate() {
  setTimeout(function () {
    getReadings(function (data) {
      planUpdate();

      if (readings.length && JSON.stringify(data) == JSON.stringify(readings[readings.length - 1]))
        return;

      readings.push(data);
      processReadings();
    });
  }, 1000);
}

function processReadings() {
  var items = [];

  var users = _.uniq(readings.map(function (r) { return r.user; }));
  users.forEach(function (user) {
    var userReadings = readings.filter(function (r) { return r.user == user; });

    var last = userReadings[userReadings.length - 1];
    var sum = 0;
    var max = 0;
    for (var i = 0; i < userReadings.length; i++) {
      var val = parseFloat(userReadings[i].value);
      sum += val;
      if (max < userReadings[i].value) max = val;
    }
    var avg = sum / userReadings.length;

    items.push({
      user: user,
      value: last.value,
      count: userReadings.length,
      average: Math.round(avg * 100) / 100,
      maximum: max
    });
  });

  processed = items;
}

planUpdate();

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
