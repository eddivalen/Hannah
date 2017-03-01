var ip = require('ip');
   var getMyIp = function(){
        return this.ip.address();
    };
var HOST = getMyIp();
var crypto = require('crypto');
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var conexiones = [];
var fareys = [];
var anna="";
var b = [];
var currentClient = 0;
var contClient = 0;

var distributeAnna = function(numberOfClients, annaLength) {
  var div = Math.round(annaLength / numberOfClients)
  var currentAnna = 0;
  var ranges = [];
  for (var i = 0; i < numberOfClients; i++) {
    var range = {};
    range.start = currentAnna+1;
    range.end = currentAnna + div;
    if (i + 1 === numberOfClients) {
      range.end = annaLength;
    }
    ranges.push(range);
    currentAnna += (div);
  }
  return ranges;
};

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(JSON.parse(message));
    var message = JSON.parse(message);
    handleData(message,remote);
});

$("#begin").on('click', function(){
  var annaLength = Number($("#inputAnna").val());
  var tareas = distributeAnna(conexiones.length,annaLength);
  console.log(tareas);
  var c=1;
  var string="";
  var an="";

  var code = 0;
   for(var i = 0; i< conexiones.length; i++) {
      if (i == 0) { 
        code = 2
      }else{
        code = 3
      }
      var data = {
        'codigo':code,
        'start': tareas[i].start,
        'end': tareas[i].end,
        'annaLength': annaLength
      };
      console.log(data);
      var message = new Buffer(JSON.stringify(data));
      server.send(message, 0, message.length, conexiones[i].port, conexiones[i].address, function(err, bytes) {
        if (err) throw err;
        console.log('UDP message sent to ' + HOST +':'+ 34542);
        //server.close();
      });
    }
    currentClient++;

  //}
});
 function handleData( data , remote ){
        switch(data.codigo){
            case 1:
                  clientConnected(data,remote);
                break;
            case 4:
                  receiveFromClient(data,remote);
                break;
            default:
                console.log('Codigo erroneo de JSON');
                break;
        }
    }
server.bind({
  address: '0.0.0.0',
  port: 34522,
  exclusive: true
});

function clientConnected(data,remote){
  contClient++;
   $("#list-conexiones").append("<li class='list-li'>"+remote.address +':'+ remote.port+"</li>");
    conexiones.push({ port: remote.port, id: contClient , address: remote.address });

  var iDiv = document.createElement('div');
  iDiv.id = 'client-'+contClient;
  iDiv.className = 'client col-md-3';
  iDiv.style = 'float:left;';
  document.getElementById('clients').appendChild(iDiv);
}
function receiveFromClient(data,remote){
var seq  = [];
var anna = "";
seq = data.seq;
anna=data.anna;
console.log("cliente actual:"+currentClient);
$("#client-"+(currentClient)).append("<h4> Cliente "+currentClient+"</h4>");
var iDiv = document.createElement('div');
  iDiv.id = 'client-row-'+currentClient;
  iDiv.className = 'col-md-3';
  document.getElementById('client-'+(currentClient)).appendChild(iDiv);
  for (var i = 0; i < seq.length; i++) {
  $("#client-row-"+(currentClient)).append("<li class='list-li'>"+seq[i]+"</li>");
  }
var res = {
  'codigo':5,
  'seq':seq,
  'anna':anna
}
  if(currentClient < conexiones.length){
    currentClient++;
    sendData(res,remote);  
  }
}
function sendData(data,remote){
   console.log(data);
      var message = new Buffer(JSON.stringify(data));
      server.send(message, 0, message.length, conexiones[currentClient-1].port, conexiones[currentClient-1].address, function(err, bytes) {
        if (err) throw err;
        console.log('UDP message sent to ' + HOST +':'+ 34542);
      });
}
