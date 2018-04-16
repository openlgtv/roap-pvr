/**
 * Copyright (C) 2018 Smx <smxdev4@gmail.com
 */
const async = require("async");
const LGRoap = require("./roap/lgroap");

function searchTV(cb){
	const dgram = require("dgram");
	const socket = dgram.createSocket('udp4');
	const search = new Buffer(
		'M-SEARCH * HTTP/1.1\r\n' +
		'HOST: 239.255.255.250:1900\r\n' +
		'MAN: "ssdp:discover"\r\n' +
		'MX: 3\r\n' +
		'ST: urn:schemas-upnp-org:device:MediaRenderer:1\r\n\r\n'
	);

	socket.on('listening', () => {
		//socket.addMembership('239.255.255.250');
		socket.send(search, 0, search.length, 1900, "239.255.255.250");
	});
	socket.on('message', (message, rinfo) => {
		console.log(rinfo);
		console.log(message);
		//console.log(message.toString());
		cb();
		socket.close();
	});
	socket.bind(1900);
}

function streamStop(roap, cb){
	roap.sendCommand({
		name: "2ndTVStreaming",
		device: "Android",
		value: "stop"
		//inputSourceIdx: 1
	}, function(reply){
		if(cb)
			return cb();
	});
}

function getChunk(roap, cb){
	var DURATION = 3000;
	roap.sendCommand({
		name: "2ndTVStreaming",
		device: "Android",
		value: "start",
		duration: DURATION,
		fileNum: 2 //number of segments to create
		//inputSourceIdx: 1
	}, function(reply){
		if(cb)
			return cb();
	});
}

//////// MAIN
var ip;
var roap;
var pKey = 0;

var args = process.argv.slice(2);

if(args.length < 1){
	console.error("No IP Specified!");
	return 1;
}

var express = require("express");
var app = express();

ip = args[0];
roap = new LGRoap(ip);

if(args.length > 1){
	pKey = parseInt(args[1]);
}

/*
if(pKey == 0){
	console.error("No pairing key specified");
	return 1;
}
*/

process.once("SIGINT", function(){
	streamStop(roap);
	roap.clearIntervals();
	if(roap.isPaired()){
		console.log("Sending byebye...");
		roap.sendCommand({
			name: "byebye",
			port: 8080
		}, function(reply){
		});
	}
	process.exit();
});

async.series([
	// Ask for a pairing key
	function(callback){
		return callback(null);
		
		console.log("[CLIENT] Asking for a Pairing Key...");
		roap.askPairingKey(function(){	
			console.log("Now input the pairing key shown on your TV screen");
			process.stdin.once("data", function(pairingKeyText){
				var pairingKey = parseInt(pairingKeyText, 10);
				roap.setPairingKey(pairingKey);
				return callback(null);
			});
		})
	},
	// Manually set a predefined pairing key
	function(callback){
		console.log("[CLIENT] Connecting with Pairing Key...");
		roap.setPairingKey(pKey);
		return callback(null);
	},
	// Get the session ID
	function(callback){
		console.log("[CLIENT] Obtaining Session ID...");
		roap.getSessionId(function(){
			return callback(null);
		});
	},
	// Get the capabilities
	function(callback){
		return callback(null);
		console.log("[CLIENT] Querying capabilities...");
		roap.requestData("caps", function(data){
			return callback(null);
		});
	},
	// Request the securedKey
	function(callback){
		console.log("[CLIENT] Requesting SecuredKey...");
		roap.requestData("securedKey", function(data){
			var securedKey = new Buffer(data.securedKey, "hex");
			roap.setAesKey(securedKey);
			return callback(null);
		});
	},
	// Start KeyServer
	function(callback){
		console.log("[CLIENT] Starting KeyServer...");
		app.get("/aes.key", function(req, res){
			res.end(roap.aesKey);
		});
		app.listen(8060, function(){
			console.log("Key server is running!");
			return callback(null);
		});
	},
	// Stop running stream first
	function(callback){
		console.log("[CLIENT] Stopping previous streams...");
		streamStop(roap, function(){
			return callback(null);
		});
	},
	// KeepAlive event thread
	function(callback){
		console.log("[CLIENT] Starting KeepAlive thread...");
		roap.setInterval("aliveThread", function(){
			roap.triggerEvent({
				event: {
					name: "2ndTVState",
					state: "alive"
				}
			}, function(reply){
			});
		}, 2000);
		return callback(null);
	},
	// Request a new stream
	function(callback){		
		console.log("[CLIENT] Requesting new stream...");
		getChunk(roap, function(){
			return callback(null);
		});
	},
	// Wait for a playable m3u8
	function(callback){
		console.log("[CLIENT] Waiting for index.m3u8 (this may take some time)...");
		function m3u8_cb(err, m3u8){
			if(err){
				setTimeout(function(){
					console.log("M3U8 fetch failed, retrying...");
					return roap.fetchM3U8(m3u8_cb);
				}, 200);
			} else {
				console.log(roap.getStreamUrl());
				return callback(null);
			}
		};
		
		console.log("M3U8 fetch attempt...");
		roap.fetchM3U8(m3u8_cb);
	},
	// Start streaming
	function(callback){
		console.log("[CLIENT] Starting streaming...");
		roap.setInterval("streamThread", function(){
			try {
				getChunk(roap);
			} catch(ex){
				
			}
		}, 200);
		return callback(null);
	}
]);
