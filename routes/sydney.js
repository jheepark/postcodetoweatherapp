let Twilio = require('twilio');
let got = require('got');
let facts = require('./voice');
var APPID = "970b9600124bb7d909f46b5351782f1a";


exports.handler = function(request, response) {
  const got = require('got');
  const twiml = new Twilio.twiml.VoiceResponse();
  let APPID = "970b9600124bb7d909f46b5351782f1a";
  twiml.say('hello');
  console.log('here')

    if(event.SpeechResult == 'menu'){
    twiml.redirect('/facts');
    callback(null, twiml);
    return;
  }

  let results = event.SpeechResult;
  console.log(results, 'here')

  let resultToNumber = parseInt(results)
  var uri= "http://api.openweathermap.org/data/2.5/weather?q=sydney,aus&appid=970b9600124bb7d909f46b5351782f1a"

  got('http://api.openweathermap.org/data/2.5/weather?q=sydney,aus&appid=970b9600124bb7d909f46b5351782f1a').then(response => {
  let receivedData = response.body;
  let data = JSON.parse(receivedData);
  let updatedWeather = "\nIn " + data.name + " I see " + data.weather[0].description + "!";
  updatedWeather += "\nTemp: " + Math.floor(data.main.temp) + " degrees(F)";
  weather += "\nHumidity: " + data.main.humidity + "%";
  weather += "\nWind: " + Math.floor(data.wind.speed) + " mph";
  weather += "\nCloud Cover : " + data.clouds.all + "%";
 twiml.gather({
      input: 'speech',
      hints: 'menu',
      timeout: 3
    }).say({voice: 'alice'}, `Here is your weather forecast: ${updatedWeather}.. say menu for main menu`)
  }).catch(err => {
    twiml.say('There was an error fetching your weather forecast. Going back to main menu.');
     twiml.redirect('https://voicerecognitionapp.herokuapp.com/voice');
    callback(null, twiml);
  });
};
