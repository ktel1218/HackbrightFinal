var pc = new webkitRTCPeerConnection(servers,
    {optional: [{RtpDataChannels: true}]});
//wait for channel
pc.ondatachannel = function(event){
    receiveChannel = event.channel;
    //wait for data on the channel
    receiveChannel.onmessage = function(event){
        document.querySelector("div#receive").innerHTML = event.data;
        
    };
};

sendChannel = pc.createDataChannel("sendDataChannel", {reliable: false});

document.querySelector("button#send").onclick = function(){
    var data = document.querySelector("textarea#send").value;
    sendChannel.send(data);
};