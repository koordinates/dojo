/*		This is the dojo logging facility, which is patterned on the
		Python logging module, which in turn has been heavily influenced by
		log4j (execpt with some more pythonic choices, which we adopt as well).

		While the dojo logging facilities do provide a set of familiar
		interfaces, many of the details are changed to reflect the constraints
		of the browser environment. Mainly, file and syslog-style logging
		facilites are not provided, with HTTP POST and GET requests being the
		only ways of getting data from the browser back to a server. Minimal
		support for this (and XML serialization of logs) is provided, but may
		not be of practical use in a deployment environment.

		The dojologging classes are agnostic of any environment, and while
		default loggers are provided for browser-based interpreter
		environments, this file and the classes it define are explicitly
		designed to be portable to command-line interpreters and other
		ECMA-262v3 envrionments.

	the logger needs to accomidate:
		log "levels"
		type identifiers
		file?
		message
		tic/toc?

	The logger should ALWAYS record:
		time/date logged
		message
		type
		level
*/
// TODO: conver documentation to javadoc style once we confirm that is our choice
// TODO: define DTD for XML-formatted log messages
// TODO: write XML Formatter class
// TODO: write HTTP Handler which uses POST to send log lines/sections

// $Id: LogCore.js,v 1.7 2004/10/04 15:46:00 dylan Exp $
// Copyright (c) 2000-2004 Alex Russell
// Licensed under the Academic Free License version 1.2

// Filename:	LogCore.js
// Purpose:		a common logging infrastructure for dojo
// Classes:		dojo.logging, dojo.logging.loggerObj, dojo.logging.logRecord, dojo.logging.logFilter
// Global Objects:	dojo.logging
// Dependencies:	none


// FIXME: we shouldn't need this in DOJO!!!!
try{ // try block necessary for CLI usage
	if(window["dojo.scripts"]){
		dojo.scripts.provide(dojo.config.corePath+"LogCore.js");
	}
}catch(e){
	window = this;
}

if(!dojo) dojo = {} //TODO: Move this to a more appropriate place later

/*
	A simple data structure class that stores information for and about
	a logged event. Objects of this type are created automatically when
	an event is logged and are the internal format in which information
	about log events is kept.
*/

dojo.loggin.logRecord = function(lvl, msg){
	this.level = lvl;

	this.message = msg;

	this.time = new Date();

	// FIXME: what other information can we receive/discover here?
}

// an empty parent (abstract) class which concrete filters should inherit from.
dojo.logging.logFilter = function(loggerChain){

	this.passChain = loggerChain || "";

	this.filter = function(record){
		// FIXME: need to figure out a way to enforce the loggerChain
		// restriction
		return true; // pass all records
	}
}

dojo.logging.loggerObj = function(){
	this.cutOffLevel = 0;

	this.propagate = true;

	this.parent = null;

	// storage for dojo.logging.logRecord objects seen and accepted by this logger
	this.data = [];

	this.filters = [];

	this.handlers = [];
}

dojo.logging.loggerObj.prototype.argsToArr = function(args){
	// utility function, reproduced from __util__ here to remove dependency
	var ret = [];
	for(var x=0; x<args.length; x++){
		ret.push(args[x]);
	}
	return ret;
}

dojo.logging.loggerObj.prototype.setLevel = function(lvl){
	this.cutOffLevel = parseInt(lvl);
}

dojo.logging.loggerObj.prototype.isEnabledFor = function(lvl){
	return parseInt(lvl) >= this.cutOffLevel;
}

dojo.logging.loggerObj.prototype.getEffectiveLevel = function(){
	if((this.cutOffLevel==0)&&(this.parent)){
		return this.parent.getEffectiveLevel();
	}
	return this.cutOffLevel;
}

dojo.logging.loggerObj.prototype.addFilter = function(flt){
	this.filters.push(flt);
	return this.filters.length-1;
}

dojo.logging.loggerObj.prototype.removeFilterByIndex = function(fltIndex){
	if(this.filters[fltIndex]){
		delete this.filters[fltIndex];
		return true;
	}
	return false;
}

dojo.logging.loggerObj.prototype.removeFilter = function(fltRef){
	for(var x=0; x<this.filters.length; x++){
		if(this.filters[x]===fltRef){
			delete this.filters[x];
			return true;
		}
	}
	return false;
}

dojo.logging.loggerObj.prototype.removeAllFilters = function(){
	this.filters = []; // clobber all of them
}

dojo.logging.loggerObj.prototype.filter = function(rec){
	for(var x=0; x<this.filters.length; x++){
		if((this.filters[x]["filter"])&&
		   (!this.filters[x].filter(rec))||
		   (rec.level<this.cutOffLevel)){
			return false;
		}
	}
	return true;
}

dojo.logging.loggerObj.prototype.addHandler = function(hdlr){
	this.handlers.push(hdlr);
	return this.handlers.length-1;
}

dojo.logging.loggerObj.prototype.handle = function(rec){
	if((!this.filter(rec))||(rec.level<this.cutOffLevel)){ return false; }
	for(var x=0; x<this.handlers.length; x++){
		if(this.handlers[x]["handle"]){
		   this.handlers[x].handle(rec);
		}
	}
	// FIXME: not sure what to do about records to be propagated that may have
	// been modified by the handlers or the filters at this logger. Should
	// parents always have pristine copies? or is passing the modified record
	// OK?
	// if((this.propagate)&&(this.parent)){ this.parent.handle(rec); }
	return true;
}

// the heart and soul of the logging system
dojo.logging.loggerObj.prototype.log = function(lvl, msg){
	if(	(this.propagate)&&(this.parent)&&
		(this.parent.rec.level>=this.cutOffLevel)){
		this.parent.log(lvl, msg);
		return false;
	}
	// FIXME: need to call logging providers here!
	this.handle(new dojo.logging.logRecord(lvl, msg));
	return true;
}

// logger helpers
dojo.logging.loggerObj.prototype.debug = function(msg){
	return this.logType("DEBUG", this.argsToArr(arguments));
}

dojo.logging.loggerObj.prototype.info = function(msg){
	return this.logType("INFO", this.argsToArr(arguments));
}

dojo.logging.loggerObj.prototype.warning = function(msg){
	return this.logType("WARNING", this.argsToArr(arguments));
}

dojo.logging.loggerObj.prototype.warn = dojo.logging.loggerObj.prototype.warning;

dojo.logging.loggerObj.prototype.error = function(msg){
	return this.logType("ERROR", this.argsToArr(arguments));
}

dojo.logging.loggerObj.prototype.err = dojo.logging.loggerObj.prototype.error;

dojo.logging.loggerObj.prototype.critical = function(msg){
	return this.logType("CRITICAL", this.argsToArr(arguments));
}

dojo.logging.loggerObj.prototype.crit = dojo.logging.loggerObj.prototype.criticial;

dojo.logging.loggerObj.prototype.exception = function(msg, e, squelch){
	// FIXME: this needs to be modified to put the exception in the msg
	// if we're on Moz, we can get the following from the exception object:
	//		lineNumber
	//		message
	//		fileName
	//		stack
	//		name
	// on IE, we get:
	//		name
	//		message (from MDA?)
	//		number
	//		description (same as message!)
	if(e){
		var eparts = [e.name, (e.description||e.message)];
		if(e.fileName){
			eparts.push(e.fileName);
			eparts.push("line "+e.lineNumber);
			// eparts.push(e.stack);
		}
		msg += " "+eparts.join(" : ");
	}

	this.logType("ERROR", msg);
	if(!squelch){
		throw e;
	}
}

dojo.logging.loggerObj.prototype.logType = function(type, args){
	var na = [dojo.logging.getLevel(type)];
	if(typeof args == "array"){
		na = na.concat(args);
	}else if((typeof args == "object")&&(args["length"])){
		na = na.concat(this.argsToArr(args));
		/* for(var x=0; x<args.length; x++){
			na.push(args[x]);
		} */
	}else{
		na = na.concat(this.argsToArr(arguments).slice(1));
		/* for(var x=1; x<arguments.length; x++){
			na.push(arguments[x]);
		} */
	}
	return this.log.apply(this, na);
}

// the Handler class
function dojo.logging.logHandler(level){
	this.cutOffLevel = level || 0;

	this.formatter = null; // FIXME: default formatter?

	this.data = [];

	this.filters = [];
}

dojo.logging.logHandler.prototype.setFormatter = function(fmtr){
	// FIXME: need to vet that it is indeed a formatter object
}

dojo.logging.logHandler.prototype.flush = function(){
	// placekeeper, should be implemented by subclasses.
}

dojo.logging.logHandler.prototype.close = function(){
	// placekeeper, should be implemented by subclasses.
}

dojo.logging.logHandler.prototype.handleError = function(){
	// placekeeper, should be implemented by subclasses.
}

dojo.logging.logHandler.prototype.handle = function(record){
	// emits the passed record if it passes this object's filters
	if((this.filter(record))&&(record.level>=this.cutOffLevel)){
		this.emit(record);
	}
}

dojo.logging.logHandler.prototype.emit = function(record){
	// do whatever is necessaray to actually log the record
	// placekeeper, should be implemented by subclasses.
}



// set aliases since we don't want to inherit from dojo.logging.loggerObj

dojo.logging.logHandler.prototype.setLevel = dojo.logging.loggerObj.prototype.setLevel;

dojo.logging.logHandler.prototype.addFilter = dojo.logging.loggerObj.prototype.addFilter;

dojo.logging.logHandler.prototype.removeFilterByIndex = dojo.logging.loggerObj.prototype.removeFilterByIndex;

dojo.logging.logHandler.prototype.removeFilter = dojo.logging.loggerObj.prototype.removeFilter;

dojo.logging.logHandler.prototype.removeAllFilters = dojo.logging.loggerObj.prototype.removeAllFilters;

dojo.logging.logHandler.prototype.filter = dojo.logging.loggerObj.prototype.filter;

dojo.logging.log = new dojo.logging.loggerObj();

// an associative array of logger objects. This object inherits from
// a list of level names with their associated numeric levels
dojo.logging.log.levels = [ {"name": "DEBUG", "level": 1},
						   {"name": "INFO", "level": 2},
						   {"name": "WARNING", "level": 3},
						   {"name": "ERROR", "level": 4},
						   {"name": "CRITICAL", "level": 5} ];

dojo.logging.log.loggers = {};

dojo.logging.log.getLogger = function(name){
	if(!this.loggers[name]){
		this.loggers[name] = new dojo.logging.loggerObj();
		this.loggers[name].parent = this;
	}
	return this.loggers[name];
}

dojo.logging.log.getLevelName = function(lvl){
	for(var x=0; x<this.levels.length; x++){
		if(this.levels[x].level == lvl){
			return this.levels[x].name;
		}
	}
	return null;
}

dojo.logging.log.addLevelName = function(name, lvl){
	if(this.getLevelName(name)){
		this.err("could not add log level "+name+" because a level with that name already exists");
		return false;
	}
	this.levels.append({"name": name, "level": parseInt(lvl)});
}

dojo.logging.log.getLevel = function(name){
	for(var x=0; x<this.levels.length; x++){
		if(this.levels[x].name.toUpperCase() == name.toUpperCase()){
			return this.levels[x].level;
		}
	}
	return null;
}

// a default handler class, it simply saves all of the handle()'d records in
// memory. Useful for attaching to with __sig__.
dojo.logging.memoryLogHandler = function(level, recordsToKeep, postType, postInterval){
	// mixin style inheritance
	dojo.logging.logHandler.call(this, level);
	// default is unlimited
	this.numRecords = recordsToKeep || -1;
	this.postType = postType || -1;
	this.postInterval = postInterval || -1;
}
// prototype inheritance
dojo.logging.memoryLogHandler.prototype = new dojo.logging.logHandler();

/*-->
		</sect3>
		<sect3 id="dojo.logging.memoryLogHandler.methods">
			<title>Methods</title>
<!--*/
// over-ride base-class
dojo.logging.memoryLogHandler.prototype.emit = function(record){
	this.data.push(record);
	if(this.numRecords != -1){
		while(this.data.length>this.numRecords){
			this.data.pop();
		}
	}
}


var maxRecordsToKeep = 50; // TODO: move this to a better location for prefs
var postType = 0; // 0=count, 1=time, -1=don't post TODO: move this to a better location for prefs
var postInterval = 10000; // milliseconds for time, interger for number of records, -1 for non-posting, TODO: move this to a better location for prefs
var dojo.logging.logQueueHandler = new dojo.logging.memoryLogHandler(0,maxRecordsToKeep,postType,postInterval);
dojo.logging.logQueueHandler.emit = function(record){
	// stub for logging event handler
}
dojo.logging.log.addHandler(dojo.logging.logQueueHandler);

// actual logging event handler
dojo.logging.logQueueHandler.emit = function(record){
	// console output
	// we should probably abstract this in the future
	// also, what if a console is opened after some error messages pile up in the queue?  Do we dump them all to the queue?  Is this another pref?
	if(window["stdout"]){
		dojo.logging.logQueueHandler.emit = function(record){
			stdout(String(record.time.toLocaleTimeString())+" :"+dojo.logging.log.getLevelName(record.level)+": "+record.message);
		}
	}
	switch(this.postType) {
		case -1:
			break;
		case 0:
			if(this.data.length>this.postInterval) {

			}
			break;

		case 1:
			// need some sort of interval setter...
			break;
	}

		// it seems that we would't want to send a request to the server for every log file, so perhaps we want to send them in batches, or in time intervals?

		// determine if it is time to send the record... if not, and it is time-based, reset the checking interval
		// if it is time, then we need to create an XMLHttpRequest using dojo.logging.io
		// TODO: add way to either send to server through xmlHTTPRequest after x number of records are stored, or a way to open a console, or some other default, consoleless mechanism.  Also, we really should have a way to log to the console as done above, and additionally be able to store a more permanent log record	}
	}
	// should we do this without receiving a response from the server?
	while(this.data.length>this.numRecords){
		this.data.pop();
	}
}

if(window["dojo.scripts"]){
	dojo.scripts.finalize(dojo.config.corePath+"LogCore.js");
}
