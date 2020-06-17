/*
 * Entry point for the companion app
 */

// Import the messaging module
import * as messaging from "messaging";
import { geolocation } from "geolocation";
import { settingsStorage } from "settings";
import { me } from "companion";

var lat = 0;
var lon = 0;

var max = settingsStorage.getItem("Speed");

settingsStorage.onchange = function(evt) 
{
  max = evt.newValue;
  prepMax(max);
}

if (me.launchReasons.settingsChanged) {
  // Send the value of the setting
  max = settingsStorage.getItem("Speed");
  prepMax(max);
}

function prepMax(val)
{
  if(val)
    {
      var sData = {
        maxSpeed: val
      }
      returnData(sData);
    }
}

// Fetch the weather from OpenWeather
function queryOpenWeather() {
  var loc = geolocation.getCurrentPosition(locationSuccess, locationError);

  function locationSuccess(position) 
  {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
  }  
  
  function locationError(error) {
      console.log("Error: " + error.code,
                  "Message: " + error.message);
  }
  
  var API_KEY = "bb4b4c958b19572550236010b8d8c259";
  var ENDPOINT = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=bb4b4c958b19572550236010b8d8c259";

  fetch(ENDPOINT + "&APPID=" + API_KEY)
  .then(function (response) {
      response.json()
      .then(function(data) {
        // We just want the current temperature       
        var wdata = {
          temperature: data.main.temp,
          weather: data.weather[0].main
        }
        // Send the weather data to the device
        returnData(wdata);
      });
  })
  .catch(function (err) {
    console.log("Error fetching weather: " + err);
  });
}

// Send the weather data to the device
function returnData(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the device
    messaging.peerSocket.send(data);
  } else {
    console.log("Error: Connection is not open");
  }
}

// Listen for messages from the device
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data && evt.data.command == "weather") {
    // The device requested weather data
    queryOpenWeather();
  }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
    // Handle any errors
    console.log("Connection error: " + err.code + " - " + err.message);
}

//setInterval(checkMax, 2000);