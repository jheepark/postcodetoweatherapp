let Twilio = require('twilio');
let got = require('got');
let facts = require('./voice');
var APPID = "970b9600124bb7d909f46b5351782f1a";

exports.handler = function(context, event, callback) {
  twiml.say('hello');
  console.log('here')
  const twiml = new Twilio.twiml.VoiceResponse();

  let results = event.SpeechResult;
  console.log(results, 'here')

  // let resultToNumber = parseInt(results)
  // var uri= "http://api.openweathermap.org/data/2.5/weather";
  // uri += "?zip="+ resultToNumber;
  // uri += "&APPID=" + APPID;
  // uri += ",aud";
  //
  // got(uri).then(response => {
  //   let receivedData = response.body;
  //   let data = JSON.parse(receivedData);
  //   let updatedWeather = "\nIn " + data.name + " I see " + data.weather[0].description + "!";
  //   updatedWeather += "\nTemp: " + Math.floor(data.main.temp) + " degrees(F)";
  //   weather += "\nHumidity: " + data.main.humidity + "%";
  //   weather += "\nWind: " + Math.floor(data.wind.speed) + " mph";
  //   weather += "\nCloud Cover : " + data.clouds.all + "%";

    twiml.say({voice: 'alice'}, `Here is your weather forecast: ${results}`)
  // }).catch(err => {
  //   twiml.say('There was an error fetching your weather forecast. Going back to main menu.');
  //   twiml.redirect(facts);
    callback(null, twiml);
  // });
};
