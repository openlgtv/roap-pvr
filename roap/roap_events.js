/**
 * Copyright (C) 2018 Smx <smxdev4@gmail.com
 */
var roap = require("./lgroap");

var events = {};
events.setDragMode = function(isDrag, cb){
	roap.triggerEvent({
		name: "DragMode",
		value: isDrag
	}, function(reply){
		if(cb)
			return cb(reply);
	});
};

events.setCursorVisible = function(isVisible, mode, cb){
	roap.triggerEvent({
		name: "CursorVisible",
		value: isVisible,
		mode: mode
	}, function(reply){
		if(cb)
			return cb(reply);
	});
}

events.IPUpdate = function(newIP, oldIP, cb){
	roap.triggerEvent({
		name: "update",
		value: newIP,
		expire: oldIP
	}, function(reply){
		if(cb)
			return cb(reply);
	});
}

events.getManualRecordingStatus = function(cb){
	roap.triggerEvent({
		name: "RecordEVTErrstate",
		action: "Execute",
		detail: "OK|UNAVAILABLE_STATE|MAX_NUM_ERROR|DUPLICATED_RECORDING|UNAVAILABLE_TIME",
		reservedID: 1
	}, function(reply){
		if(cb)
			return cb(reply);
	});
}

events.SendLog = function(value, cb){
	roap.triggerEvent({
		name: "LogID",
		id: value
	}, function(reply){
		if(cb)
			return cb(reply);
	})
}

events.TextEdited = function(state, value, cb){
	roap.triggerEvent({
		name: "TextEdited",
		state: state,
		value: value
	}, function(reply){
		if(cb)
			return cb(reply);
	});
}

events.CallStateChanged = function(state, cb){
	roap.triggerEvent({
		name: "CallStateChanged",
		value: state
	}, function(reply){
		if(cb)
			return cb(reply);
	});
}

events.ByeBye = function(port, cb){
	if(typeof port === 'undefined')
		port = 8080;

	roap.triggerEvent({
		name: "byebye",
		port: port
	}, function(reply){
		if(cb)
			return cb(reply);
	});
}

module.exports = events;