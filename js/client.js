var SERVER_HOST = '192.168.1.5';
var dgram      = require('dgram');
var msg        = {codigo: 1};
var mensaje    = new Buffer(JSON.stringify(msg));
var server;
var client     = dgram.createSocket('udp4');
var start      = 0;
var end        = 0;
var annaLength =0;
var sq = [];
client.on('message', function (message, remote) {
    console.log(JSON.parse(message));
	var message = JSON.parse(message);
	handleData(message,remote);
});

client.on('listening', function() {
	var address = client.address();
	console.log(`cliente listening ${address.address}:${address.port}`);
});

client.bind({
  address: '0.0.0.0',
  port: 34542,
  exclusive: true
});

client.send(mensaje, 0, mensaje.length, 34522, SERVER_HOST, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + SERVER_HOST +':'+ 34522);
});

function handleData(data,remote){
	var response = {};
    switch(data.codigo){
        case 2:
			start      = data.start;
			end        = data.end;
			annaLength = data.annaLength;
			response = annaNumbers(data);
			sendData(response,remote,4);
            break;
        case 3:
        	start      = data.start;
			end        = data.end;
			annaLength = data.annaLength;
        	break;
        case 5: 
        	var string="";
        	string = deconcat(data.seq);
        	response = annaNumbers2(string);
            sendData(response,remote,4);
            break;
         default:
            console.log('Codigo erroneo de JSON');
            break;
    }
}

function annaNumbers(data){
	var seq    = [];
	var anna   = "";
	var string = "";
	for (var i = start; i <= end; i++) {
	    if(string.indexOf(i.toString()) == '-1'){
	      string+=i.toString();
	      seq.push(i.toString());
	    }else{
	      anna+=i.toString()+"-";
	    } 
  	}
  	var arrays = {
  		'seq':seq,
  		'anna':anna
  	}
  	return arrays;
}
function annaNumbers2(string){
	var seq    = [];
	var anna   = "";
	for (var i = start; i <= end; i++) {
	    if(string.indexOf(i.toString()) == '-1'){
	      string+=i.toString();
	      seq.push(i.toString());
	    }else{
	      anna+=i.toString()+"-";
	    } 
  	}
  	var arrays = {
  		'seq':seq,
  		'anna':anna
  	}
  	return arrays;
}
function sendData(data,remote,code){
	var res = {
		'codigo':code,
		'seq':data.seq,
		'anna':data.anna,
	};
	sq = data.seq;
	console.log(res);
	var message = new Buffer(JSON.stringify(res));
	client.send(message,0,message.length, 34522,remote.address, function(err){
		if(err)
			console.log(err);
		console.log("El paquete se envío.");
	client.close();
	})
}
function deconcat(seq){
	var str="";
	for (var i = 0; i < seq.length; i++) {
		str+=seq[i];
	}
	return str;
}
