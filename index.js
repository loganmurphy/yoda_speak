var express = require('express')
var app = express();
// const app = require('jovo-framework').Jovo;
// const webhook = require('jovo-framework').Webhook;
const AWS = require('aws-sdk')

var axios = require('axios');
var soap = require('soap');

// var insult = require('shakespeare-insult').random();
// var api_url = 'https://api.chucknorris.io/jokes/random';
var accessKeyId = process.env.KEY
var secretAccessKey = process.env.SECRET

var wisdom = ''
// var yoda_me = wisdom;


var file_name = 'yoda-translation'
let params = {
    'Text': `<speak><amazon:effect name="whispered" vocal-tract-length="-500%"><prosody rate="x-slow" pitch="x-low" volume= "x-loud">${wisdom}<break time=".25s"/></prosody></amazon:effect></speak>`,
    'TextType': "ssml",
    'OutputFormat': 'mp3',
    'VoiceId': 'Matthew'
}

app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules'));

// console.log(insult);

// var joke = ''
// // Get's a random Chuck Norris joke from the API. You can also upload them, so I am going to add that feature as well!
// axios.get(api_url)
//   .then(function (response) {
//     // console.log(response.data);
//     joke = response.data.value;
//     return joke;
//   })
//   .catch(function (error) {
//     console.error(error);
//   });


app.get('/', function(req, res){

  var context = {yoda: wisdom, yoda_talks: file_name, accessKeyId: accessKeyId, secretAccessKey: secretAccessKey};
  res.render('index.hbs', context);
})


app.get('/yoda_speak', function(req, res){
  var url = 'http://www.yodaspeak.co.uk/webservice/yodatalk.php?wsdl';
  var translate = req.query.yoda_speak;
  // console.log(typeof translate);
  var context
  var args = {yodaTalkRequest: translate};
  soap.createClient(url, function(err, client) {
    if(err){console.error(err)}
    client.yodaTalk(args, function (err, result) {
      if(err){console.error(err)}
       wisdom = result.return;
      //  res.send(wisdom)
      //  context = {yoda: wisdom};
      return wisdom;
    });
    res.send(wisdom)

  });
  // res.set('statusCode', 200)
  // res.render('index.hbs', context);
})

// Listen for post requests
var PORT = process.env.PORT || 3000;
app.listen(3000, function() {
    console.log('Local development server listening on port 3000.');
});

// webhook.post('/webhook', function(req, res) {
//     app.handleRequest(req, res, handlers);
//     app.execute();
// });
//
//
// let handlers = {
//     'LAUNCH' : function () {
//     	// this intent is triggered when people open the voice app
//     	// without a specific deep link into an intent
//         app.toIntent('HelloWorldIntent');
//     },
//     'HelloWorldIntent': function() {
//         // app.tell('Here\'s a Chuck Norris joke for ya!' + joke);
//         app.tell(wisdom);
//     },
// };
