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

// TODO: define DTD for XML-formatted log messages
// TODO: write XML Formatter class
// TODO: write HTTP Handler which uses POST to send log lines/sections

// $Id: LogCore.js,v 1.7 2004/10/04 15:46:00 dylan Exp $
// Copyright (c) 2000-2004 Alex Russell
// Licensed under the Academic Free License version 1.2

// Filename:	LogCore.js
// Purpose:		a common logging infrastructure for dojo
// Classes:		dojo.log, dojo.loggerObj, dojo.logRecord, dojo.logFilter
// Global Objects:	dojo.log
// Dependencies:	none

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

dojo.logRecord = function(lvl, msg){
	/*-->
	<fieldsynopsis>&public; &int; <varname>level</varname></fieldsynopsis>
	<para role="fieldinfo">
		The level at which this record was logged.
	</para>
	<!--*/
	this.level = lvl;

	/*-->
	<fieldsynopsis>&public; &str; <varname>message</varname></fieldsynopsis>
	<para role="fieldinfo">The log message.</para>
	<!--*/
	this.message = msg;

	/*-->
	<fieldsynopsis>&public; &date; <varname>time</varname></fieldsynopsis>
	<para role="fieldinfo">
		The time at which this &obj; was created.
	</para>
	<!--*/
	this.time = new Date();

	// FIXME: what other information can we receive/discover here?
}
/*-->
		</sect3>
		<constructorsynopsis>
			&public; &obj; <methodname>dojo.logRecord</methodname>
			<methodparam>&int; <parameter>level</parameter></methodparam>
			<methodparam>&str; <parameter>message</parameter></methodparam>
		</constructorsynopsis>
		<para role="ctorinfo">
			Constructor for <classname>dojo.logRecord</classname>. Takes two
			required arguments and no optional arguments.
		</para>
	</sect2>
<!--*/

/*-->
	<sect2 id="dojo.logFilter">
		<title>dojo.logFilter</title>
		<para>
			Filters provide a way of defining objects that can act as
			gate-keepers. By default, objects of this type will pass all events
			that they are asked to filter. Subclasses, however, can (and
			should) re-define the <methodname>filter</methodname> method to
			define their own terms for what should and should not pass through
			the filter.
		</para>
		<sect3 id="dojo.logFilter.properties">
			<title>Properties</title>
<!--*/
// an empty parent (abstract) class which concrete filters should inherit from.
dojo.logFilter = function(loggerChain){
	/*-->
	<fieldsynopsis>&public; &arr; <varname>passChain</varname>
		<initializer>""</initializer>
	</fieldsynopsis>
	<para role="fieldinfo">
		Not currently used, but set by constructor.
	</para>
	<!--*/
	this.passChain = loggerChain || "";
/*-->
		</sect3>
		<sect3 id="dojo.logFilter.methods">
			<title>Methods</title>
<!--*/
	/*-->
	<methodsynopsis>
		&public; &bool; <methodname>filter</methodname>
		<methodparam>&obj; <parameter>record</parameter></methodparam>
	</methodsynopsis>
	<para role="methodinfo">
		Abstract method, should be over-ridden in subclasses. Takes a single
		<classname>dojo.logRecord</classname> object as it's only argument,
		returning a boolean indicating whether or not it should be passed on to
		be emitted by whatever <classname>dojo.logHandler</classname> has invoked
		the filter. This abstract method will always return &true;, making it a
		pretty poor filter.
	</para>
	<!--*/
	this.filter = function(record){
		// FIXME: need to figure out a way to enforce the loggerChain
		// restriction
		return true; // pass all records
	}
}
/*-->
		</sect3>
		<constructorsynopsis>
			&public; &obj; <methodname>dojo.logFilter</methodname>
			<methodparam>&str; <parameter>loggerChain</parameter></methodparam>
		</constructorsynopsis>
		<para role="ctorinfo">
			<parameter>loggerChain</parameter> is not currently used.
		</para>
	</sect2>
<!--*/

/*-->
	<sect2 id="dojo.loggerObj">
		<title>dojo.loggerObj</title>
		<para>
			The base class which all loggers are decended from,
			<classname>dojo.loggerObj</classname> provides methods for effecting
			the logging process, effectively providing the "glue" that ties
			formatters (<classname>dojo.logFormatter</classname>), filters
			(<classname>dojo.logFilter</classname>), and handlers
			(<classname>dojo.logHandler</classname>) togeather.
			<classname>dojo.loggerObj</classname> &obj;s form a hierarchy of
			loggers (often a single node deep). This "logger tree" allows
			sections of a program to log to the lowest (most specific) logger
			for their subsection, or allows many pre-existing code blocks to
			have their loggers tied togeather when integrated. In addition,
			loggers are named, and requests for a named logger will always
			return the same logger object.
		</para>
		<sect3 id="dojo.loggerObj.properties">
			<title>Properties</title>
<!--*/
dojo.loggerObj = function(){
	/*-->
	<fieldsynopsis>&public; &int; <varname>cutOffLevel</varname>
		<initializer>0</initializer>
	</fieldsynopsis>
	<para role="fieldinfo">
		The threshold level at which no messages below the level will not be
		logged. This positive integer value may map to one or more named
		loggers in &dojo.log;.
	</para>
	<!--*/
	this.cutOffLevel = 0;

	/*-->
	<fieldsynopsis>&public; &bool; <varname>proagate</varname>
		<initializer>&true;</initializer>
	</fieldsynopsis>
	<para role="fieldinfo">
		If not the root logger, if this logger should pass
		<methodname>log</methodname> requests to the parent logger.
	</para>
	<!--*/
	this.propagate = true;

	/*-->
	<fieldsynopsis>&public; &obj; <varname>parent</varname>
		<initializer>&null;</initializer>
	</fieldsynopsis>
	<para role="fieldinfo">
		Defaults to &null;. If set, a reference to a
		<classname>dojo.loggerObj</classname> &obj; to pass
		<methodname>log</methodname> requests to. If &null;, this is the root
		logger.
	</para>
	<!--*/
	this.parent = null;

	// storage for dojo.logRecord objects seen and accepted by this logger
	/*-->
	<fieldsynopsis>&public; &arr; <varname>data</varname>
		<initializer>[]</initializer>
	</fieldsynopsis>
	<para role="fieldinfo">
		Cache of <classname>dojo.logRecord</classname> &obj;s. May or may not
		actually be used by a given <classname>dojo.loggerObj</classname>
		subclass or instance.
	</para>
	<!--*/
	this.data = [];

	/*-->
	<fieldsynopsis>&public; &arr; <varname>filters</varname>
		<initializer>[]</initializer>
	</fieldsynopsis>
	<para role="fieldinfo">
		&obj;s of type <classname>dojo.logFilter</classname> which are used to
		screen requests to <methodname>log</methodname>. If a filter denies a
		record, the event will not be logged or passed to any handlers.
	</para>
	<!--*/
	this.filters = [];

	/*-->
	<fieldsynopsis>&public; &arr; <varname>handlers</varname></fieldsynopsis>
	<para role="fieldinfo">
		&obj;s of type <classname>dojo.logHandler</classname> which are used to
		provide transport for formatted <classname>dojo.logRecord</classname>
		records. <methodname>log</methodname> requests that pass filtering will
		be eventually handed off to these handlers for final processing. A
		<classname>dojo.loggerObj</classname> &obj; cannot actually do anything
		with records unless a handler is provided.
	</para>
	<!--*/
	this.handlers = [];
}

/*-->
		</sect3>
		<sect3 id="dojo.loggerObj.methods">
			<title>Methods</title>
<!--*/

/*-->
<methodsynopsis>
	&public; &arr; <methodname>argsToArr</methodname>
	<methodparam>&arr; <parameter>arguments</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Duplication of method from &__util__; to ensure that there is no external
	dependency for this file. Takes an arguments pseudo-array and returns a
	"clone" &arr; object.
</para>
<!--*/
dojo.loggerObj.prototype.argsToArr = function(args){
	// utility function, reproduced from __util__ here to remove dependency
	var ret = [];
	for(var x=0; x<args.length; x++){
		ret.push(args[x]);
	}
	return ret;
}

/*-->
<methodsynopsis>
	&public; &void; <methodname>setLevel</methodname>
	<methodparam>&int; <parameter>level</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Assigns a new value to <varname>cutOffLevel</varname>.
</para>
<!--*/
dojo.loggerObj.prototype.setLevel = function(lvl){
	this.cutOffLevel = parseInt(lvl);
}

/*-->
<methodsynopsis>
	&public; &bool; <methodname>isEnabledFor</methodname>
	<methodparam>&int; <parameter>level</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Determines whether or not the passed level is greater than or equal to the
	current cufoff level for this logger.
</para>
<!--*/
dojo.loggerObj.prototype.isEnabledFor = function(lvl){
	return parseInt(lvl) >= this.cutOffLevel;
}

/*-->
<methodsynopsis>
	&public; &int; <methodname>getEffectiveLevel</methodname>
</methodsynopsis>
<para role="methodinfo">
	Returns the effective cutoff level. If there is no cutoff for this logger,
	the parent's cutoff is requested until the root logger is reached or a
	non-zero cutoff is encountered, whichever comes first.
</para>
<!--*/
dojo.loggerObj.prototype.getEffectiveLevel = function(){
	if((this.cutOffLevel==0)&&(this.parent)){
		return this.parent.getEffectiveLevel();
	}
	return this.cutOffLevel;
}

/*-->
<methodsynopsis>
	&public; &int; <methodname>addFilter</methodname>
	<methodparam><type>dojo.logFilter</type> <parameter>filter</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Returns the index of the added filter in the internal tracking &arr;,
	<varname>filters</varname>.
</para>
<!--*/
dojo.loggerObj.prototype.addFilter = function(flt){
	this.filters.push(flt);
	return this.filters.length-1;
}

/*-->
<methodsynopsis>
	&public; &bool; <methodname>removeFilterByIndex</methodname>
	<methodparam>&int; <parameter>filterIndex</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Removes the filter at index <parameter>filterIndex</parameter>. Returns
	&true; if removal was succesful, &false; otherwise.
</para>
<!--*/
dojo.loggerObj.prototype.removeFilterByIndex = function(fltIndex){
	if(this.filters[fltIndex]){
		delete this.filters[fltIndex];
		return true;
	}
	return false;
}

/*-->
<methodsynopsis>
	&public; &bool; <methodname>removeFilter</methodname>
	<methodparam><type>dojo.logFilter</type> <parameter>filter</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Removes the filter object provided by reference. Returns &true; if removal
	was succesful, &false; otherwise.
</para>
<!--*/
dojo.loggerObj.prototype.removeFilter = function(fltRef){
	for(var x=0; x<this.filters.length; x++){
		if(this.filters[x]===fltRef){
			delete this.filters[x];
			return true;
		}
	}
	return false;
}

/*-->
<methodsynopsis>
	&public; &void; <methodname>removeAllFilters</methodname>
</methodsynopsis>
<para role="methodinfo">
	Does what you expect. Bet you were expecting something a lot more clever,
	huh?
</para>
<!--*/
dojo.loggerObj.prototype.removeAllFilters = function(){
	this.filters = []; // clobber all of them
}

/*-->
<methodsynopsis>
	&public; &bool; <methodname>filter</methodname>
	<methodparam><type>dojo.logRecord</type> <parameter>record</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	If the passed <classname>dojo.logRecord</classname> &obj; gets a "pass" from
	all of the registered filters on this logger, returns &true;. Returns
	&false; otherwise.
</para>
<!--*/
dojo.loggerObj.prototype.filter = function(rec){
	for(var x=0; x<this.filters.length; x++){
		if((this.filters[x]["filter"])&&
		   (!this.filters[x].filter(rec))||
		   (rec.level<this.cutOffLevel)){
			return false;
		}
	}
	return true;
}

/*-->
<methodsynopsis>
	&public; &int; <methodname>addHandler</methodname>
	<methodparam><type>dojo.logHandler</type> <parameter>handler</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Returns the index of the added handler in the internal tracking &arr;,
	<varname>handlers</varname>.
</para>
<!--*/
dojo.loggerObj.prototype.addHandler = function(hdlr){
	this.handlers.push(hdlr);
	return this.handlers.length-1;
}

/*-->
<methodsynopsis>
	&public; &void; <methodname>handle</methodname>
	<methodparam><type>dojo.logRecord</type> <parameter>record</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Gives all of the registered handlers a shot at logging the passed record.
</para>
<!--*/
dojo.loggerObj.prototype.handle = function(rec){
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

/*-->
<methodsynopsis>
	&public; &bool; <methodname>log</methodname>
	<methodparam>&int; <parameter>level</parameter></methodparam>
	<methodparam>&str; <parameter>message</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Starts the ball rolling. Returns a boolean indicating success or failure of
	the logging operation.
</para>
<!--*/
// the heart and soul of the logging system
dojo.loggerObj.prototype.log = function(lvl, msg){
	if(	(this.propagate)&&(this.parent)&&
		(this.parent.rec.level>=this.cutOffLevel)){
		this.parent.log(lvl, msg);
		return false;
	}
	// FIXME: need to call logging providers here!
	this.handle(new dojo.logRecord(lvl, msg));
	return true;
}

// logger helpers
/*-->
<methodsynopsis>
	&public; &bool; <methodname>debug</methodname>
	<methodparam>&str; <parameter>message</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Logs the passed <parameter>message</parameter> at the
	<literal>DEBUG</literal> level.
</para>
<!--*/
dojo.loggerObj.prototype.debug = function(msg){
	return this.logType("DEBUG", this.argsToArr(arguments));
}

/*-->
<methodsynopsis>
	&public; &bool; <methodname>info</methodname>
	<methodparam>&str; <parameter>message</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Logs the passed <parameter>message</parameter> at the
	<literal>INFO</literal> level.
</para>
<!--*/
dojo.loggerObj.prototype.info = function(msg){
	return this.logType("INFO", this.argsToArr(arguments));
}

/*-->
<methodsynopsis>
	&public; &bool; <methodname>warning</methodname>
	<methodparam>&str; <parameter>message</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Logs the passed <parameter>message</parameter> at the
	<literal>WARNING</literal> level.
</para>
<!--*/
dojo.loggerObj.prototype.warning = function(msg){
	return this.logType("WARNING", this.argsToArr(arguments));
}

/*-->
<methodsynopsis>
	&public; &bool; <methodname>warn</methodname>
	<methodparam>&str; <parameter>message</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Logs the passed <parameter>message</parameter> at the
	<literal>WARNING</literal> level.
</para>
<!--*/
dojo.loggerObj.prototype.warn = dojo.loggerObj.prototype.warning;

/*-->
<methodsynopsis>
	&public; &bool; <methodname>error</methodname>
	<methodparam>&str; <parameter>message</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Logs the passed <parameter>message</parameter> at the
	<literal>ERROR</literal> level.
</para>
<!--*/
dojo.loggerObj.prototype.error = function(msg){
	return this.logType("ERROR", this.argsToArr(arguments));
}

/*-->
<methodsynopsis>
	&public; &bool; <methodname>err</methodname>
	<methodparam>&str; <parameter>message</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Logs the passed <parameter>message</parameter> at the
	<literal>ERROR</literal> level.
</para>
<!--*/
dojo.loggerObj.prototype.err = dojo.loggerObj.prototype.error;

/*-->
<methodsynopsis>
	&public; &bool; <methodname>critical</methodname>
	<methodparam>&str; <parameter>message</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Logs the passed <parameter>message</parameter> at the
	<literal>CRITICAL</literal> level.
</para>
<!--*/
dojo.loggerObj.prototype.critical = function(msg){
	return this.logType("CRITICAL", this.argsToArr(arguments));
}

/*-->
<methodsynopsis>
	&public; &bool; <methodname>crit</methodname>
	<methodparam>&str; <parameter>message</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Logs the passed <parameter>message</parameter> at the
	<literal>CRITICAL</literal> level.
</para>
<!--*/
dojo.loggerObj.prototype.crit = dojo.loggerObj.prototype.criticial;

/*-->
<methodsynopsis>
	&public; &bool; <methodname>exception</methodname>
	<methodparam>&str; <parameter>message</parameter></methodparam>
	<methodparam>&obj; <parameter>exception</parameter></methodparam>
	<methodparam>&bool; <parameter>squelch</parameter>
		<initializer>&false;</initializer>
	</methodparam>
</methodsynopsis>
<para role="methodinfo">
	Logs the passed <parameter>message</parameter> and
	<parameter>exception</parameter>at the <literal>ERROR</literal> level,
	formatting the exception as needed. The optional
	<parameter>squelch</parameter> parameter defines whether or not the
	exception will be re-thrown for native environment handling once it is
	logged. It may be desireable for a system to log without squelching durring
	development but switch to squelching in production, and this flag allows
	for that.
</para>
<!--*/
dojo.loggerObj.prototype.exception = function(msg, e, squelch){
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

/*-->
<methodsynopsis>
	&public; &bool; <methodname>logType</methodname>
	<methodparam>&str; <parameter>type</parameter></methodparam>
	<methodparam>&varargs;</methodparam>
</methodsynopsis>
<para role="methodinfo">
	You should not call this method directly. Utility function for logging to a
	specified string type. Only public so that it may be a prototype method.
</para>
<!--*/
dojo.loggerObj.prototype.logType = function(type, args){
	var na = [dojo.log.getLevel(type)];
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

/*-->
		</sect3>
	</sect2>
<!--*/

/*-->
	<sect2 id="dojo.logHandler">
		<title>dojo.logHandler</title>
		<para>
			The base class which all log handlers are decended from,
			<classname>dojo.logHandler</classname> provides methods for effecting
			the actual passing of a log record to some medium, and/or
			eventually discarding it. On traditional UNIXes, this would be
			roughly equivalent to job that the sylog daemon performs.
			Subclasses can define their own handling logic to pass a log record
			to one (or more) transport mechanisms. In JavaScript environments,
			this is often an HTTP request, but could conceiveably be any
			writeable media to which the interpreter has access.
		</para>
		<sect3 id="dojo.logHandler.properties">
			<title>Properties</title>
<!--*/
// the Handler class
function dojo.logHandler(level){
	// JS has no threading or concurrency model, so the acquire(),
	// createLock(), and release() methods found in the python LogFilter class
	// aren't needed here.
	/*-->
	<fieldsynopsis>&public; &int; <varname>cutOffLevel</varname>
		<initializer>0</initializer>
	</fieldsynopsis>
	<para role="fieldinfo">
		The threshold level at which no messages below the level will not be
		logged. This positive integer value may map to one or more named
		loggers in &dojo.log;.
	</para>
	<!--*/
	this.cutOffLevel = level || 0;

	/*-->
	<fieldsynopsis>&public; <type>dojo.logFormatter</type>
		<varname>formatter</varname>
		<initializer>&null;</initializer>
		</fieldsynopsis>
	<para role="fieldinfo">
		The object that will be used to format handled records.
	</para>
	<!--*/
	this.formatter = null; // FIXME: default formatter?

	/*-->
	<fieldsynopsis>&public; &arr; <varname>data</varname>
		<initializer>[]</initializer>
	</fieldsynopsis>
	<para role="fieldinfo">
		Records loggged or to be loggged. Has no specific function in the
		parent class, but may be used by subclasses for whatever the subclass
		deems necessaray.
	</para>
	<!--*/
	this.data = [];

	/*-->
	<fieldsynopsis>&public; &arr; <varname>filters</varname>
		<initializer>[]</initializer>
	</fieldsynopsis>
	<para role="fieldinfo">
		&obj;s of type <classname>dojo.logFilter</classname> which are used to
		screen requests to <methodname>hanlde</methodname>. If a filter denies a
		record, the event will not be <methodname>emit</methodname>ed.
	</para>
	<!--*/
	this.filters = [];
}

/*-->
		</sect3>
		<sect3 id="dojo.logHandler.methods">
			<title>Methods</title>
<!--*/

/*-->
<methodsynopsis>
	&public; &void; <methodname>setFormatter</methodname>
	<methodparam><type>dojo.logFormatter</type>
				<parameter>formatter</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Assigns the passed formatter to this handlers. All subsequently
	<methodname>handle</methodname>d records will be formatted as the passed
	object defines.
</para>
<!--*/
dojo.logHandler.prototype.setFormatter = function(fmtr){
	// FIXME: need to vet that it is indeed a formatter object
}

/*-->
<methodsynopsis>
	&public; &void; <methodname>setFormatter</methodname>
</methodsynopsis>
<para role="methodinfo">
	Abstract method, should be implemented by subclasses to ensure that all
	pending log lines are sent to the underlying storage medium. This method
	will not return until that task is complete.
</para>
<!--*/
dojo.logHandler.prototype.flush = function(){
	// placekeeper, should be implemented by subclasses.
}

/*-->
<methodsynopsis>
	&public; &void; <methodname>setFormatter</methodname>
</methodsynopsis>
<para role="methodinfo">
	Abstract method, should be implemented by subclasses. Clean up and prpare
	for shutdown of this handler (implies a call to
	<methodname>flush</methodname> in most cases).
</para>
<!--*/
dojo.logHandler.prototype.close = function(){
	// placekeeper, should be implemented by subclasses.
}

/*-->
<methodsynopsis>
	&public; &void; <methodname>handleError</methodname>
</methodsynopsis>
<para role="methodinfo">
	Abstract method, should be implemented by subclasses.
</para>
<!--*/
dojo.logHandler.prototype.handleError = function(){
	// placekeeper, should be implemented by subclasses.
}

/*-->
<methodsynopsis>
	&public; &void; <methodname>handle</methodname>
	<methodparam><type>dojo.logRecord</type>
			<parameter>record</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Uses the registered <varname>filters</varname> to determine if the passed
	record should be <methodname>emit</methodname>ed to the underlying storage
	medium. If the record passes the filters, it is passed to
	<methodname>emit</methodname>.
</para>
<!--*/
dojo.logHandler.prototype.handle = function(record){
	// emits the passed record if it passes this object's filters
	if((this.filter(record))&&(record.level>=this.cutOffLevel)){
		this.emit(record);
	}
}

/*-->
<methodsynopsis>
	&public; &void; <methodname>emit</methodname>
	<methodparam><type>dojo.logRecord</type> <parameter>record</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Abstract method, <emphasis>MUST</emphasis> be implemented by subclasses.
	This method handles the actual calling of the registered formatter and
	passing the formatted record to whatever storage subsystem is represented
	by this handler.
</para>
<!--*/
dojo.logHandler.prototype.emit = function(record){
	// do whatever is necessaray to actually log the record
	// placekeeper, should be implemented by subclasses.
}

// set aliases since we don't want to inherit from dojo.loggerObj
/*-->
<methodsynopsis>
	&public; &void; <methodname>setLevel</methodname>
	<methodparam>&int; <parameter>level</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Assigns a new value to <varname>cutOffLevel</varname>.
</para>
<!--*/
dojo.logHandler.prototype.setLevel = dojo.loggerObj.prototype.setLevel;

/*-->
<methodsynopsis>
	&public; &int; <methodname>addFilter</methodname>
	<methodparam><type>dojo.logFilter</type> <parameter>filter</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Returns the index of the added filter in the internal tracking &arr;,
	<varname>filters</varname>.
</para>
<!--*/
dojo.logHandler.prototype.addFilter = dojo.loggerObj.prototype.addFilter;

/*-->
<methodsynopsis>
	&public; &bool; <methodname>removeFilterByIndex</methodname>
	<methodparam>&int; <parameter>filterIndex</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Removes the filter at index <parameter>filterIndex</parameter>. Returns
	&true; if removal was succesful, &false; otherwise.
</para>
<!--*/
dojo.logHandler.prototype.removeFilterByIndex = dojo.loggerObj.prototype.removeFilterByIndex;

/*-->
<methodsynopsis>
	&public; &bool; <methodname>removeFilter</methodname>
	<methodparam><type>dojo.logFilter</type> <parameter>filter</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Removes the filter object provided by reference. Returns &true; if removal
	was succesful, &false; otherwise.
</para>
<!--*/
dojo.logHandler.prototype.removeFilter = dojo.loggerObj.prototype.removeFilter;

/*-->
<methodsynopsis>
	&public; &void; <methodname>removeAllFilters</methodname>
</methodsynopsis>
<para role="methodinfo">Just like it says on the tin.</para>
<!--*/
dojo.logHandler.prototype.removeAllFilters = dojo.loggerObj.prototype.removeAllFilters;

/*-->
<methodsynopsis>
	&public; &bool; <methodname>filter</methodname>
	<methodparam><type>dojo.logRecord</type> <parameter>record</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	If the passed <classname>dojo.logRecord</classname> &obj; gets a "pass" from
	all of the registered filters on this handler, returns &true;. Returns
	&false; otherwise.
</para>
<!--*/
dojo.logHandler.prototype.filter = dojo.loggerObj.prototype.filter;

/*-->
		</sect3>
	</sect2>
<!--*/

/*-->
	<sect2 id="dojo.log">
		<title>dojo.log</title>
		<para>
			The root (default) logger, an object of type
			<link linkend="dojo.loggerObj"><type>dojo.loggerObj</type></link>, but
			extended with several properties and methods in support of its
			special role in the logger hierarchy.
		</para>
		<sect3 id="dojo.log.properties">
			<title>Properties</title>
<!--*/
// the root logger object
dojo.log = new dojo.loggerObj();

/*-->
<fieldsynopsis>&public; &arr; <varname>levels</varname></fieldsynopsis>
<para role="fieldinfo">
	A set of objects that provide a mapping between level numbers (positive
	integers) and log level names. Default level names are
	<literal>DEBUG</literal>, <literal>INFO</literal>,
	<literal>WARNING</literal>, <literal>ERROR</literal>, and
	<literal>CRITICAL</literal>.
</para>
<!--*/
// an associative array of logger objects. This object inherits from
// a list of level names with their associated numeric levels
dojo.log.levels = [ {"name": "DEBUG", "level": 1},
				   {"name": "INFO", "level": 2},
				   {"name": "WARNING", "level": 3},
				   {"name": "ERROR", "level": 4},
				   {"name": "CRITICAL", "level": 5} ];

/*-->
<fieldsynopsis>&public; &assoc_arr; <varname>loggers</varname></fieldsynopsis>
<para role="fieldinfo">
	Tracking array for named logger objects. When a logger is created with
	<methodname>getLogger</methodname>, a reference to it is stored in this
	object. Subsequent calls to <methodname>getLogger</methodname> for the same
	logger name will return a reference to the previously created (named)
	logger object.
</para>
<!--*/
dojo.log.loggers = {};

/*-->
		</sect3>
		<sect3 id="dojo.log.methods">
			<title>Methods</title>
<!--*/

/*-->
<methodsynopsis>
	&public; <type>dojo.loggerObj</type> <methodname>getLogger</methodname>
	<methodparam>&str; <parameter>name</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Returns a new logger if no previous logger has been requested by the same
	name. The returned logger will have &dojo.log; as a parent on the logging
	tree. Subsequent requests for a logger of the same name will return the
	previously created logger.
</para>
<!--*/
// gets a new child logger by the specified name, if none exists with that
// name, then a new logger is registered and
dojo.log.getLogger = function(name){
	if(!this.loggers[name]){
		this.loggers[name] = new dojo.loggerObj();
		this.loggers[name].parent = this;
	}
	return this.loggers[name];
}

// extend the root logger with some root-specific properties and methods:
/*-->
<methodsynopsis>
	&public; &str; <methodname>getLevelName</methodname>
	<methodparam>&int; <parameter>level</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Returns the &str; identifier for the passed logging level. If there is no
	name for the provided level, &null; is returned.
</para>
<!--*/
dojo.log.getLevelName = function(lvl){
	for(var x=0; x<this.levels.length; x++){
		if(this.levels[x].level == lvl){
			return this.levels[x].name;
		}
	}
	return null;
}

/*-->
<methodsynopsis>
	&public; &void; <methodname>addLevelName</methodname>
	<methodparam>&str; <parameter>name</parameter></methodparam>
	<methodparam>&int; <parameter>level</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	A way for users to name new logger levels along with their numeric
	priority.
</para>
<!--*/
dojo.log.addLevelName = function(name, lvl){
	if(this.getLevelName(name)){
		this.err("could not add log level "+name+" because a level with that name already exists");
		return false;
	}
	this.levels.append({"name": name, "level": parseInt(lvl)});
}

/*-->
<methodsynopsis>
	&public; &int; <methodname>getLevel</methodname>
	<methodparam>&str; <parameter>name</parameter></methodparam>
</methodsynopsis>
<para role="methodinfo">
	Returns the numeric priority corresponding to the named level. Returns
	&null; if no registered level has the passed name. Names are case
	insensitive.
</para>
<!--*/
dojo.log.getLevel = function(name){
	for(var x=0; x<this.levels.length; x++){
		if(this.levels[x].name.toUpperCase() == name.toUpperCase()){
			return this.levels[x].level;
		}
	}
	return null;
}
/*-->
		</sect3>
	</sect2>
<!--*/

/*-->
	<sect2 id="dojo.memoryLogHandler">
		<title>dojo.memoryLogHandler</title>
		<para>
			Descended from <classname>dojo.logHandler</classname>, the in-memory
			handler is a "brain dead" handler that can be used to pass logged
			records some sort of debugging console or log viewer. It can
			(optionally) take a record limit in the constructor in order to
			limit the number of records kept in its <varname>data</varname>
			member at a time. When a limit is set, this object behaves like a
			FIFO.
		</para>
		<sect3 id="dojo.memoryLogHandler.properties">
			<title>Properties</title>
<!--*/
// a default handler class, it simply saves all of the handle()'d records in
// memory. Useful for attaching to with __sig__.
dojo.memoryLogHandler = function(level, recordsToKeep){
	// mixin style inheritance
	dojo.logHandler.call(this, level);
	// default is unlimited
	this.numRecords = recordsToKeep || -1;
}
// prototype inheritance
dojo.memoryLogHandler.prototype = new dojo.logHandler();

/*-->
		</sect3>
		<sect3 id="dojo.memoryLogHandler.methods">
			<title>Methods</title>
<!--*/
// over-ride base-class
dojo.memoryLogHandler.prototype.emit = function(record){
	this.data.push(record);
	if(this.numRecords != -1){
		while(this.data.length>this.numRecords){
			this.data.pop();
		}
	}
}
/*-->
		</sect3>
	</sect2>
<!--*/


var maxRecordsToKeep = 50; // TODO: move this to a better location for prefs
var postRecords = true; // TODO: move this to a better location for prefs
var dojo.logQueueHandler = new dojo.memoryLogHandler(0,maxRecordsToKeep);
dojo.logQueueHandler.emit = function(record){
	// stub for logging event handler
}
dojo.log.addHandler(dojo.logQueueHandler);

// actual logging event handler
dojo.logQueueHandler.emit = function(record){
	// console output
	// we should probably abstract this in the future
	// also, what if a console is opened after some error messages pile up in the queue?  Do we dump them all to the queue?  Is this another pref?
	if(window["stdout"]){
		dojo.logQueueHandler.emit = function(record){
			stdout(String(record.time.toLocaleTimeString())+" :"+dojo.log.getLevelName(record.level)+": "+record.message);
		}
	}
	if(postRecords) {
		// it seems that we would't want to send a request to the server for every log file, so perhaps we want to send them in batches, or in time intervals?

		// determine if it is time to send the record... if not, and it is time-based, reset the checking interval
		// if it is time, then we need to create an XMLHttpRequest using dojo.io
		// TODO: add way to either send to server through xmlHTTPRequest after x number of records are stored, or a way to open a console, or some other default, consoleless mechanism.  Also, we really should have a way to log to the console as done above, and additionally be able to store a more permanent log record	}
	}
}

if(window["dojo.scripts"]){
	dojo.scripts.finalize(dojo.config.corePath+"LogCore.js");
}

/*-->
</sect1>
<!-- */// -->

