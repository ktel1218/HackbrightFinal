// 'use strict'; //what

var isChannelReady;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pc_config = {'iceServers': [{'url':'stun:stun.l.google.com:19302'}]};
var pc_constraints = {'optional':[{'DtlsSrtpKeyAgreement': true}]}; //hmm

//setup audio and video regardless of available devices

var sdpConstraints = {'mandatory': {
    'OffertoReceiveAudio': true,
    'OfferToReceiveVideo': true
}};


var room = location.pathname.substring(1); //get name from link?
if (room === ''){
    // room = prompt('Enter room name: ');
    room = 'foo';//this is dumb
}else{
    //
}

if (room !== '') {
  console.log('Create or join room', room);
  socket.emit('create or join', room);
}

socket.on('created', function (room){
  console.log('Created room ' + room);
  isInitiator = true;
});

socket.on('full', function (room){
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

socket.on('joined', function (room){
  console.log('This peer has joined room ' + room);
  isChannelReady = true;
});

socket.on('log', function (array){
  console.log.apply(console, array);
});

function sendMessage(message){
    console.log('Client sending message: ', message);
    // if (typeof message === 'object') {
      //   message = JSON.stringify(message);
      // }
      socket.emit('message', message);
}