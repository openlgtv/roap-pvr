/**
 * Copyright (C) 2018 Smx <smxdev4@gmail.com
 */
const request = require("request");
const stream = require("stream");
const util = require("util");
const xml2js = require("xml2js");
const parser = new xml2js.Parser({
	explicitArray: false
});
const builder = new xml2js.Builder({
	xmldec: {
		version: '1.0',
		encoding: 'UTF-8'
	}
});
const m3u8 = require("m3u8");

const ROAP_PORT = 8080;
const ROAP_PATH_AUTH = "/roap/api/auth";
const ROAP_PATH_COMMAND = "/roap/api/command";
const ROAP_PATH_EVENT = "/roap/api/event";
const ROAP_PATH_DATA = "/roap/api/data";
const ROAP_PATH_NAVIGATION = "/navigation";

const STR_PORT = 8060;
const STR_PATH = "/index.m3u8";

const NAV_PORT = 7070;

const endOfLine = require('os').EOL;

var LGRoap = function(ip){
	this.ip = ip;
	this.pairingKey = null;
	this.intervals = {};
}

function roap_post(url, xmlData, cb){
	console.log("[ROAP]: " + url);
	request.post({
		url: url,
		headers: {
			'Content-Type': "application/atom+xml",
			'User-Agent': 'Android' 
		},
		forever: true,
		body: xmlData,
	}, function(error, response, body){
		if(error){
			throw error;
		}
		if(cb){
			cb(response, body);
		}
	});
}

function parseReply(xml, cb){
	 parser.parseString(xml, function(err, obj){
		if(err)
		 	throw err;
		if(!obj.envelope){
			var err  = "No envelope found in message!" + endOfLine;
				err += xml;
			throw new Error(err);
		}
		console.log("-- XML --");
		console.log(util.inspect(obj, {depth: null}));
		cb(obj);
	 });
}

LGRoap.prototype.getUrl = function(urlPath){
	return "http://" + this.ip + ":" + ROAP_PORT + urlPath;
}

LGRoap.prototype.getStreamUrl = function(){
	return "http://" + this.ip + ":" + STR_PORT + STR_PATH;
}

LGRoap.prototype.isPaired = function(){
	return this.pairingKey == null;
}

LGRoap.prototype.fetchM3U8 = function(cb){
	var tv = this;
	var url = this.getStreamUrl();
	var parser = m3u8.createStream();
	
	parser.on("m3u", function(m3u){
		cb(false);
		//console.log(m3u);
	});
	
	request.get({
		url: url
	}, function(error, response, body){
		if(error)
			throw error;
		if(response.statusCode != 200){
			return cb(response.statusCode);
		}
		var s_m3u8 = new stream.Readable({
			read: function(){}
		});
		
		console.log("-- M3U8 --");
		console.log(body);
		
		s_m3u8.push(body);
		s_m3u8.push(null);
		s_m3u8.pipe(parser);
	});
}

LGRoap.prototype.setInterval = function(name, fn, rate){
	this.intervals[name] = setInterval(fn, rate);
}
LGRoap.prototype.clearInterval = function(name){
	clearInterval(this.intervals[name]);
	delete this.intervals[name];
}
LGRoap.prototype.clearIntervals = function(){
	var keys = Object.keys(this.intervals);
	for(var i=0; i<keys.length; i++){
		this.clearInterval(keys[i]);
	}
}

LGRoap.prototype.setPairingKey = function(pairingKey){
	this.pairingKey = pairingKey;
}

LGRoap.prototype.getSessionId = function(cb){
	var tv = this;
	var msg = builder.buildObject({
		auth: {
			type: "AuthReq",
			value: tv.pairingKey
		}
	});
	
	roap_post( tv.getUrl(ROAP_PATH_AUTH), msg, function(response, body){
		if(response.statusCode != 200){
			console.error("getSessionId request failed! (" + response.statusCode + ")");
		}
		parseReply(body, function(obj){
			if(!obj.envelope.session){
				throw new Error("Session ID not received!");
			}
			this.sessionId = parseInt( obj.envelope.session, 10 );
			cb();
		});
	});
}

LGRoap.prototype.setAesKey = function(securedKey){
	console.log("Received securedKey: " + securedKey.toString("hex"));
	
	var xorKey = new Buffer("5AA1F411955F104A32297455FAFD3718", "hex");
	for(var i=0; i<securedKey.length; i++){
		securedKey[i] ^= xorKey[i];
	}
	
	console.log("Descrambled securedKey: " + securedKey.toString("hex"));
	
	this.aesKey = securedKey;
};

LGRoap.prototype.triggerEvent = function(event, cb){
	var tv = this;
	var msg = builder.buildObject({
		event: event
	});

	roap_post( tv.getUrl(ROAP_PATH_EVENT), msg, function(response, body){
		if(response.statusCode != 200){
			console.error("triggerEvent request failed! (" + response.statusCode + ")");
		}
		parseReply(body, function(obj){
			cb(obj);
		});
	})
}

LGRoap.prototype.sendCommand = function(cmd, cb){
	var tv = this;
	var msg = builder.buildObject({
		command: cmd
	});
	
	roap_post( tv.getUrl(ROAP_PATH_COMMAND), msg, function(response, body){
		if(response.statusCode != 200){
			console.error("sendCommand request failed! (" + response.statusCode + ")");
		}
		parseReply(body, function(obj){
			cb(obj);
		});
	})
}

LGRoap.prototype.requestData = function(target, cb){
	var tv = this;
	request.get({
		url: tv.getUrl(ROAP_PATH_DATA),
		qs: {
			target: target
		},
		forever: true
	}, function(error, response, body){
		if(error)
			throw error;
			
		if(response.statusCode != 200){
			console.error("requestData request failed! (" + response.statusCode + ")");
		}
			
		parseReply(body, function(obj){
			cb(obj.envelope.data);
		});
	});
}

LGRoap.prototype.askPairingKey = function(cb){
	var tv = this;
	var msg = builder.buildObject({
		auth: {
			type: "AuthKeyReq"
		}
	});

	roap_post( tv.getUrl(ROAP_PATH_AUTH), msg, function(response, body){
		if(response.statusCode != 200){
			console.error("askPairingKey request failed! (" + response.statusCode + ")");
		}
		//console.log(body);
		parseReply(body, function(obj){
			cb();
		});
	});
}

module.exports = LGRoap;