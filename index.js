var express = require('express')
const app = require('jovo-framework').Jovo;
const webhook = require('jovo-framework').Webhook;
const AWS = require('aws-sdk')

var axios = require('axios');
var soap = require('soap');
var wisdom = ''

// var insult = require('shakespeare-insult').random();
// var api_url = 'https://api.chucknorris.io/jokes/random';


// var yoda_me = wisdom;
var wisdom = ''
var yoda_me = wisdom;


var file_name = 'yoda-translation'
let params = {
    'Text': `<speak><amazon:effect name="whispered" vocal-tract-length="-500%"><prosody rate="x-slow" pitch="x-low" volume= "x-loud">${yoda_me}<break time=".25s"/></prosody></amazon:effect></speak>`,
    'TextType': "ssml",
    'OutputFormat': 'mp3',
    'VoiceId': 'Matthew'
}

// var yoda_says = 'https://s3.amazonaws.com/my-video-project/mp3/' + file_name + '.mp3';



AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
});

// Here is where I send the text input to Polly.
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-east-1'
});

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: BucketName},
});
console.log('Authentication worked');


function add_mp3(data) {
  mp3 = data.AudioStream;
  console.log(mp3)
  s3.upload({
      Key:  `mp3/${file_name}.mp3`,
      Body: data.AudioStream,
      ACL: 'public-read'
    }, function(err, data) {
      if (err) {
        console.log('Dang it all!', err)
      }
      console.log('Successfully uploaded your mp3.');
    });
}

Polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
        console.log(err)
    } else if (data) {
        if (data.AudioStream instanceof Buffer) {
          add_mp3(data);
          console.log(data);
        }
    }
})

// var params = {
//   LanguageCode: "en-IN",
//  };
//  Polly.describeVoices(params, function(err, data) {
//    if (err) console.log(err, err.stack); // an error occurred
//    else     console.log(data);
// });

webhook.use(express.static('public'));
webhook.use('/node_modules', express.static('node_modules'));

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


webhook.get('/', function(req, res){

  var context = {yoda: wisdom, yoda_talks: file_name};
  res.render('index.hbs', context);
})


webhook.get('/yoda_speak', function(req, res){
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
webhook.listen(3000, function() {
    console.log('Local development server listening on port 3000.');
});

webhook.post('/webhook', function(req, res) {
    app.handleRequest(req, res, handlers);
    app.execute();
});


let handlers = {
    'LAUNCH' : function () {
    	// this intent is triggered when people open the voice app
    	// without a specific deep link into an intent
        app.toIntent('HelloWorldIntent');
    },
    'HelloWorldIntent': function() {
        // app.tell('Here\'s a Chuck Norris joke for ya!' + joke);
        app.tell(wisdom);
    },
};
