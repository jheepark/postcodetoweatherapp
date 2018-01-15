var mongoose = require('mongoose');
let got = require('got');
var VoiceResponse = require('twilio').twiml.VoiceResponse;
// Define survey response model schema
var SurveyResponseSchema = new mongoose.Schema({
    // phone number of participant
    phone: String,
    city: String,
    state: String,
    zip: Boolean,
    country: String,

    // status of the participant's current survey response
    complete: {
        type: Boolean,
        default: false
    },

    // record of answers
    responses: [mongoose.Schema.Types.Mixed]
});

// For the given phone number and survey, advance the survey to the next
// question
SurveyResponseSchema.statics.advanceSurvey = function(args, cb) {
    var surveyData = args.survey;
    var phone = args.phone;
    let city = args.city;
    let state = args.state;
    let zip = args.zip;
    let country = args.country;
    var input = args.input;
    var surveyResponse;

    // Find current incomplete survey
    SurveyResponse.findOne({
        phone: phone,
        city: city,
        state: state,
        zip: zip,
        country: country,
        complete: false
    }, function(err, doc) {
        surveyResponse = doc || new SurveyResponse({
            phone: phone,
            city: city,
            state: state,
            zip: zip,
            country: country,
        });
        processInput();
    });

    // fill in any answer to the current question, and determine next question
    // to ask
    function processInput() {
        // If we have input, use it to answer the current question
        var responseLength = surveyResponse.responses.length
        var currentQuestion = surveyData[responseLength];

        // if there's a problem with the input, we can re-ask the same question
        function reask() {
            cb.call(surveyResponse, null, surveyResponse, responseLength);
        }

        function weather() {
          let twiml = new VoiceResponse();
          got('http://api.openweathermap.org/data/2.5/weather?q=sydney,aus&appid=970b9600124bb7d909f46b5351782f1a').then(response => {
          let receivedData = response.body;
          console.log('here', receivedData)
          let data = JSON.parse(receivedData);
          console.log('here2', data)
          let updatedWeather = "\nIn " + data.name + " I see " + data.weather[0].description + "!";
          console.log('updatedWeather', updatedWeather)
          twiml.say({voice: 'alice'}, `Here is your weather forecast: ${updatedWeather}`)
           }).catch(err => {
             twiml.say('There was an error fetching your weather forecast');
             reask();
           });
        }



        // If we have no input, ask the current question again
        if (!input) return reask();

        // Otherwise use the input to answer the current question
        var questionResponse = {};
        if (currentQuestion.type === 'boolean') {
            // Anything other than '1' or 'yes' is a false
            var isTrue = input === '1' || input.toLowerCase() === 'yes';
            questionResponse.answer = isTrue;
        } else if (currentQuestion.type === 'number') {
            // Try and cast to a Number
            var num = Number(input);
            if (isNaN(num)) {
                // don't update the survey response, return the same question
                return reask();
            } else {
                weather();
                questionResponse.answer = num;
            }
        } else if (input.indexOf('http') === 0) {
            // input is a recording URL
            questionResponse.recordingUrl = input;
        } else {
            // otherwise store raw value
            questionResponse.answer = input;
        }

        // Save type from question
        questionResponse.type = currentQuestion.type;
        surveyResponse.responses.push(questionResponse);

        // If new responses length is the length of survey, mark as done
        if (surveyResponse.responses.length === surveyData.length) {
            surveyResponse.complete = true;
        }

        // Save response
        surveyResponse.save(function(err) {
            if (err) {
                reask();
            } else {
                cb.call(surveyResponse, err, surveyResponse, responseLength+1);
            }
        });
    }
};

// Export model
delete mongoose.models.SurveyResponse
delete mongoose.modelSchemas.SurveyResponse
var SurveyResponse = mongoose.model('SurveyResponse', SurveyResponseSchema);
module.exports = SurveyResponse;
