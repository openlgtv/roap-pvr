/**
 * Copyright (C) 2018 Smx <smxdev4@gmail.com
 */
var roap = require("./lgroap");
var commands = {};

commands.TVStreaming = function(startOrStop, duration, fileNum, inputSourceIdx, cb){
	var cmd = {
		name: "2ndTVStreaming",
		device: "Android",
		value: startOrStop
	};
	
	if(typeof fileNum !== 'undefined')
		cmd.fileNum = fileNum;
		
	if(typeof inputSourceIdx !== 'undefined')
		cmd.inputSourceIdx = inputSourceIdx;
		
	roap.sendCommand(cmd, function(reply){
		if(cb)
			return cb();
	});
};

commands.setAVMode = function(source, onOrOff, cb){
	roap.sendCommand({
		name: "AVMode",
		source: source,
		value: onOrOff
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.AppExecute = function(auid, appName, contentId, contentAge, cb){
	var cmd = {
		name: "AppExecute",
		auid: auid,
		appname: appName
	};
	
	if(typeof contentId !== 'undefined')
		cmd.contentid = contentId;
	if(typeof contentAge !== 'undefined')
		cmd.contentAge = contentAge;
		
	roap.sendCommand(cmd, function(reply){
		if(cb)
			return cb();
	});
}

commands.AppTerminate = function(auid, appName, cb){
	roap.sendCommand({
		name: "AppTerminate",
		auid: auid,
		appname: appname
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.ChangeInputSource = function(source, cb){
	roap.sendCommand({
		name: "ChangeInputSource",
		inputSource: source
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.ChangeInputSourceEx = function(inSrcType, inSrcIdx, cb){
	roap.sendCommand({
		name: "ChangeInputSource",
		inputSourceType: inSrcType,
		inputSourceIdx: inSrcIdx
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.CreateSmartShareDB = function(tableType, sortType, itemIdx, commandKey, cb){
	roap.sendCommand({
		name: "SmartShareCreateDB",
		tableType: tableType,
		sortType: sortType,
		itemIdx: itemIdx,
		commandKey: commandKey
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.ChannelChange = function(major, minor, sourceIndex, physicalNum, cb){
	roap.sendCommand({
		name: "HandleChannelChange",
		major: major,
		minor: minor,
		sourceIndex: sourceIndex,
		physicalNum: physicalNum
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.GamepadInput = function(keyValue, isPressed, cb){
	var cmd = {
		name: "HandleGamepadInput",
		value: keyValue
	}
	
	if(typeof isPressed === 'boolean')
		cmd.press = isPressed;
	
	roap.sendCommand(cmd, function(reply){
		if(cb)
			return cb();
	});
}

commands.KeyInput = function(keyValue, cb){
	roap.sendCommand({
		name: "HandleKeyInput",
		value: keyValue
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.OSSKeyInput = function(keyValue, mode, ossType, keypadType, inputSourceIdx, cb){
	roap.sendCommand({
		name: "HandleOssKeyInput",
		value: keyValue,
		mode: mode,
		ossType: ossType,
		keypadType: keypadType,
		inputSourceIdx: inputSourceIdx
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.TouchClick = function(value, cb){
	roap.sendCommand({
		name: "HandleTouchClick",
		value: value
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.TouchMove = function(x, y, cb){
	roap.sendCommand({
		name: "HandleTouchMove",
		x: x,
		y: y
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.TouchWheel = function(direction, cb){
	roap.sendCommand({
		name: "HandleTouchWheel",
		value: direction
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.SmartWorldLogin = function(encoded, action, id, password, cb){
	roap.sendCommand({
		name: "LGSmartWorld",
		encoded: encoded,
		action: action,
		id: id,
		password: password
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.DeleteRecording = function(reservedID, cb){
	roap.sendCommand({
		name: "RecordCMDDelete",
		reservedID: reservedID
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.StartManualRecording = function(recordingTitle, channelNumber, recordingDate, recordingStartTime, recordingEndTime, recordingDescription, cb){
	roap.sendCommand({
		name: "RecordCMDTimeBasedStart",
		recordingTitle: recordingTitle,
		channelNum: channelNumber,
		recordingDate: recordingDate,
		recordingStartTime: recordingStartTime,
		recordingEndTime: recordingEndTime,
		recordingDescription: recordingDescription
	}, function(reply){
		if(cb)
			return cb();
	});
}

commands.EditManualRecording = function(recordingTitle, channelNumber, recordingDate, recordingStartTime, recordingEndTime, recordingDescription, reservedID, cb){
	roap.sendCommand({
		name: "RecordCMDTimeBasedModify",
		recordingTitle: recordingTitle,
		channelNum: channelNumber,
		recordingDate: recordingDate,
		recordingStartTime: recordingStartTime,
		recordingEndTime: recordingEndTime,
		recordingDescription: recordingDescription,
		reservedID: reservedID
	}, function(reply){
		if(cb)
			return cb();
	});
}

module.exports = commands;