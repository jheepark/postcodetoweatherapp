var VoiceResponse = require('twilio').twiml.VoiceResponse;
var SurveyResponse = require('../models/SurveyResponse');
var survey = require('../survey_data');
let postcodeCommand = require('./postcode-command');

// Main interview loop
exports.interview = function(request, response) {
  var phone = request.body.From;
  var city = request.body.FromCity;
  var state = request.body.FromState;
  var zip = request.body.fromZip;
  var country = request.body.fromCountry;
  var input = request.body.RecordingUrl || request.body.Digits;
  var twiml = new VoiceResponse();

  // helper to append a new "Say" verb with alice voice
  function say(text) {
    twiml.say({
      voice: 'alice'
    }, text);
  }

  // respond with the current TwiML content
  function respond() {
    response.type('text/xml');
    response.send(twiml.toString());
  }

  // Find an in-progess survey if one exists, otherwise create one
  SurveyResponse.advanceSurvey({
    phone: phone,
    city: city,
    state: state,
    zip: zip,
    country: country,
    input: input,
    survey: survey
  }, function(err, surveyResponse, questionIndex) {
    var question = survey[questionIndex];

    if (err || !surveyResponse) {
      say('Sorry, an error has occured, please try again later.');
      return respond();
    }

    // If question is null, we're done!
    if (!question) {
      say('Thank you for calling us today. Goodbye!');
      return respond();
    }

    // Add a greeting if this is the first question
    if (questionIndex === 0) {
      say('Thank you for calling the weather hotline. Please follow the prompts');
    }

    // Otherwise, ask the next question
    say(question.text);

    // Depending on the type of question, we either need to get input via
    // DTMF tones or recorded speech
    if (question.type === 'text') {
      twiml.gather({
        input: 'speech dtmf',
        timeout: 3,
        method: 'POST',
        hints: 'a 4 digit postcode for sydney for example 2000',
        finishOnKey: '#',
        action: 'https://seashell-serval-3400.twil.io/sydney'
      }).say({
        voice: 'alice'
      }, 'Press any key to finish.');
      twiml.record({
        transcribe: true,
        transcribeCallback: '/voice/' + surveyResponse._id + '/transcribe/' + questionIndex,
        maxLength: 60
      })
    } else if (question.type === 'number') {
      say('Press star to finish.');
      twiml.gather({timeout: 10, finishOnKey: '*'})
    }
    // render TwiML response
    respond();
  });
};

// Transcripton callback - called by Twilio with transcript of recording
// Will update survey response outside the interview call flow
exports.transcription = function(request, response) {
  var responseId = request.params.responseId;
  var questionIndex = request.params.questionIndex;
  var transcript = request.body.TranscriptionText;

  SurveyResponse.findById(responseId, function(err, surveyResponse) {
    if (err || !surveyResponse || !surveyResponse.responses[questionIndex])
      return response.status(500).end();

    // Update appropriate answer field
    surveyResponse.responses[questionIndex].answer = transcript;
    surveyResponse.markModified('responses');
    surveyResponse.save(function(err, doc) {
      return response.status(
        err
        ? 500
        : 200).end();
    });
  });
};
