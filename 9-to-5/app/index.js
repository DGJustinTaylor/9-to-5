/*
 * Entry point for the watch app
 */
import document from "document";
import * as messaging from "messaging";
import { geolocation } from "geolocation";
import clock from "clock";
import document from "document";
import { today } from 'user-activity';
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import { vibration } from "haptics";

const background = document.getElementById("background");
const clockLabel = document.getElementById("clockText");
const tempText = document.getElementById("tempText");
const speedText = document.getElementById("speedText");
let speedRing = document.getElementById("speedRing");
const stepsText = document.getElementById("stepsText");
const floorsText = document.getElementById("floorsText");
const calsText = document.getElementById("calsText");
const calsImage = document.getElementById("calsImage");
const heartEKG = document.getElementById("heartEKG");
const heartText = document.getElementById("heartText");

//Justin's variables
var step = 1, ekg = 1, cals = 1;
//Damon's variables
var lat1 = 0, lon1 = 0, lat2 = 0, lon2 = 0, time1 = 0, time2 = 0, d = 0, speed = 0, conSpeed = 0, i = 1;

var maxSpeed= 70;

stepsText.text = today.adjusted.steps;
floorsText.text = today.adjusted.elevationGain;
calsText.text = today.adjusted.calories;

//Un-comment this for debugging purposes
/*
var loc = geolocation.watchPosition(function(position) {
  fetchWeather();
});
*/

clock.granularity = "minutes";

if (HeartRateSensor) 
{
  const hrm = new HeartRateSensor();
  hrm.addEventListener("reading", () => {
    console.log(`Current heart rate: ${hrm.heartRate}`);
    heartText.text = hrm.heartRate;
  });
  display.addEventListener("change", () => {
    // Automatically stop the sensor when the screen is off to conserve battery
    display.on ? hrm.start() : hrm.stop();
  });
  hrm.start();
}

clock.ontick = (evt) => 
{
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  clockLabel.text = `${hours}:${mins}`;
}

function order() 
{
//var d = new Date();
//var test = d.getSeconds();
    
    if (i % 2 == 0)
    {
      //even
      i = ++i;
      location2();
    }
    else if(i % 2 != 0)
    {
      //odd
      i = ++i;
      location1();
    }
}


function location1() 
{
  geolocation.getCurrentPosition(function (position) {
    lat1 = position.coords.latitude;
    lon1 = position.coords.longitude;
    
    //console.log(lat1 + " lat1");
    //console.log(lon1 + " lon1");
  });
}

function location2()
{
  geolocation.getCurrentPosition(function  (position) {

    lat2 = position.coords.latitude;
    lon2 = position.coords.longitude;
 
    //console.log(lat2 + " lat2");
    //console.log(lon2 + " lon2");
  });
}

function convertSpeed(theSpeed) 
{
  var newSpeed = 0;
  
  newSpeed = theSpeed * 2236.9362920544;
  
  return Math.round(newSpeed);
}

function distanceFrom() 
{
  speedRing.style.fill = "green"
  
  var R = 6371; // km (change this constant to get miles)
	var dLat = (lat2-lat1) * Math.PI / 180;
  
	var dLon = (lon2-lon1) * Math.PI / 180;
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	d = R * c;
  
  var time = 1;
  speed = d / time;
  conSpeed = convertSpeed(speed);
  
  if(conSpeed > maxSpeed)
    {
      speedRing.style.fill = "red";

      vibration.start("bump");
    }
  else
    {
      vibration.stop("bump");
    }
  
  if(conSpeed > 0)
    {
      speedText.text = conSpeed;
      
      if(conSpeed >= 135)
        {
          speedRing.sweepAngle = 270;
        }
      else
        {
          speedRing.sweepAngle = conSpeed * 2; // multiply by 2 because the ring is too small
        }
    }
  else 
    {
      speedText.text = 0;
      speedRing.sweepAngle = 0;
    }
}

function checkMax(data)
{
  maxSpeed = data.maxSpeed;
  //console.log(data.maxSpeed)
}

function updateSteps()
{
  stepsText.text = today.adjusted.steps;
}

function updateFloors()
{
  floorsText.text = today.adjusted.elevationGain;
}

function updateCalories()
{
  calsText.text = today.adjusted.calories;
}

function changeHR()
{
  heartEKG.href = "images/heartrate/" + ekg + ".png";
  
  if(ekg >= 48) {
    ekg = 1;
  }
  else {
    ekg += 1;
  }
}

function changeCals()
{
    calsImage.href = "images/burnedcals/" + cals + ".png";
  
  if(cals >= 11) {
    cals = 1;
  }
  else {
    cals += 1;
  }
}

function fetchWeather() 
{
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion
    messaging.peerSocket.send({
      command: 'weather'
    });
  }
}

// Display the weather data received from the companion
function processWeatherData(data) 
{
  if(data.weather == "Clear") {
    background.href = "images/weather/sunny-day.png" 
  }
  else if(data.weather == "Rain" || data.weather == "Drizzle" || data.weather == "Thunderstorm" || data.weather == "Squall") {
    background.href = "images/weather/rainy-day.jpg";
  }
  else if(data.weather == "Clouds") {
    background.href = "images/weather/cloudy-day.jpg";
  }
  else if(data.weather == "Snow") {
    background.href = "images/weather/snow-day.jpg";
  }
  else if(data.weather == "Fog" || data.weather == "Haze" || data.weather == "Mist" || data.weather == "Smoke") {
    background.href = "images/weather/fog-day.jpg";
  }
  else if(data.weather == "Sand" || data.weather == "Dust") {
    background.href = "images/weather/desert-day.jpg";
  }
  else {
    background.href = "images/weather/extreme-day.jpg";
  }
  
  tempText.text = Math.round(data.temperature) + "°F";
  
  console.log("temp: " + Math.round(data.temperature),
              "weather: " + data.weather,
              "speed: " + speed);
}

// Listen for the onopen event
messaging.peerSocket.onopen = function() 
{
  // Fetch weather when the connection opens
  fetchWeather();
}

// Listen for messages from the companion
messaging.peerSocket.onmessage = function(evt) 
{
  if (evt.data.weather) {
    processWeatherData(evt.data);
  }
  else
    {
      checkMax(evt.data);
    }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) 
{
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}

setInterval(order, 1000);
setInterval(distanceFrom, 2000);

setInterval(changeCals, 100);
setInterval(changeHR, 100);
setInterval(updateSteps, 2000);
setInterval(updateFloors, 10000);
setInterval(updateCalories, 5000);
setInterval(fetchWeather, 15 * 1000 * 60);