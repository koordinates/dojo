/**
* @file Log.js
*
* Logging system, defining class <var>burst.logging.Log</var> and global functions <var>bu_debug</var> etc.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

bu_require('burst.logging.Log', ['burst.runtime.AbstractRuntime']);

//=java package burst.logging;

// the function bu_dbgdbg() is used when we are debugging this module itself
function bu_dbgdbg_(s) {
   if (arguments.length == 1) print('   BU_DBGDBG: ', s);
   else {
     var a = new Array(arguments.length);
     a[0] = '   BU_DBGDBG: ';
     for(var i=0;i<arguments.length;++i) {a[i+1] = arguments[i]}
     print.apply(null, a);
   }
}
//var bu_dbgdbg = bu_dbgdbg_;
function bu_dbgdbg(s) {}

/**
* Class whose only purpose is to be used to create the fixed constants such as burst.logging.Log.DEBUG
*/
//=java public class LogLevel {
/**
Constructor for the LogLevel object.
@param name Name of the log level.
@param val Value of the log level
@param is_fatal (optional) whether messages to this level will cause an exception
*/
//=java public LogLevel(String name, Number val, Boolean is_fatal) {}
burst.logging.LogLevel = function(name, val, is_fatal) {
  this.name_ = name;
  this.value_ = val;
  this.is_fatal_ = (typeof is_fatal == 'undefined' ? false : is_fatal);
  burst.logging.Log.LEVELS_BY_VAL[val] = this;
  burst.logging.Log.LEVELS_BY_NAME[name] = this;
}
var BU_LogLevel = burst.logging.LogLevel;

BU_LogLevel.prototype.toString = function() {return this.name_ + ' (' + this.value_ + ')';}
//=java } // class LogLevel

/**
Class to manage debug, warning, and other logging calls.
It decides whether to output the messages, and if so, where to.
Right now, in practice this is a singleton class.
<p>
The system is distantly inspired by log4j, at http://jakarta.apache.org/log4j/

<p>
While our implementation is based on Logger instances, in practice we consider
it unreasonable to expect programmers to explicitly instantiate them.
So instead, we expect that in general the only interaction with this module will
be via these global functions:
<pre>
   bu_debug(arg0, ...)
   bu_info(arg0, ...)
   bu_warn(arg0, ...)
   bu_error(arg0, ...)

   bu_alert(message)
</pre>


<h3>Loggers</h3>

There are a set of burst.logging.Log instances, each with a name. Any instance can
have a parent. By convention, a "dotted name" is used for names, which reflects
this containment hierarchy, so that a child would have the name "parentname.childname".
<p>
There is always at least the "root logger" instance (held in global <var>bu_Log</var>).
There are no others unless client code creates them.
Note that to strictly match the dotted name convention, the root logger should have the
name "" (empty string). Instead it is given the name 'root'.

<p>
Each burst.logging.Log instance contains this state:
<ul>
<li>name
<li>optionally, maximum verbosity level allowed (will inherit from parent)
<li>optionally, a list of appenders (will bubble to parent)
<li>a parent (undefined if the root logger)
</ul>



<h3>Log Levels</h3>

When log messages are produced by the application, it is with a particular verbosity
level (from lowest, FATAL, to highest, DEBUG). Any log instance can have configured
what the highest level is that it will respond to. This might come from an
external configuration, associated with the logger name.
If its maximum level is not configured, it will inherit from its parent, bubbling up until
it reaches the root logger, which always has a maximum level configured (out of the box,
at the WARN level). 
If the logger instance determines that the message verbosity level is less than or
equal to its (possibly inherited) maximum level, then the message is said to be "enabled";
otherwise it is "disabled".


<h3>Appenders</h3>

There can be zero, one, or more "appenders" associated with any burst.logging.Log instance.
If a message is "disabled", then it is not sent to any appenders. 
If a message is "enabled", then the burst.logging.Log instance sends it to all of its appenders,
and to all the appenders up its inheritance hierarchy.
For this reason, typically appenders are associated only with the root logger.
(Log4j supports an "additivity flag" at any logger which stops bubbling up to parent
appenders. We have not implemented that feature.)

Note that appenders are associated with logger instances in the logger hierarchy, 
not with a particular verbosity level. Of course any appender implementation may choose
on its own to not respond to some message levels.

<h3>Formatting</h3>

The format of logged lines can be controlled by supplying a custom formatter,
which would then be used when sending to all appenders.
The default format is:

 time level [logger] message

The format method is called as: <code>format(logger, level, message, stack_start)</code>
The stack_start parameter is the number of stack frames to skip to get to
the actual caller. It is available if the formatter wants to carry out
(potentially expensive) investigation of the stack to determine caller class,
caller method, file name, and/or line number.

(Fyi, log4j has special format strings, see http://jakarta.apache.org/log4j/docs/api/org/apache/log4j/PatternLayout.html )

<h3>Configuration</h3>

This class has several class properties, including: 'maxLevel', 'appender', 'formatter'.

As with any module in this library, application-specific configuration of class properties
is done after the entire library is loaded. That leaves the question of what to do 
with calls into this module while the library itself is being loaded. This is something of
a catch-22 challenge, because the functionality to do class property configuration may not
even be defined at the time of a call.

So we have to have a temporary fixed behavior that governs what happens during the library
load phase. In a shell, we use an appender which uses the shell's
println functionality (this is governed by <var>BU_LOG_USE_PRINTLN_APPENDER</var>).
In a browser, we use an appender which holds all messages in a
circular Array buffer (circular, so it doesn't grow without bound).
If an appender is added in the configuration phase, any accumulated messages in
the circular Array is flushed to the new appender. 

At configuration time, the application may set any appender it likes via the <var>appender</var>
class property. If specified, it will replace any appenders that already exist (and, 
in the case of the circular buffer appender, flush its pending messages to the new appender).

We provide one potentially useful burst.logging.Appender subclass, called burst.logging.AppenderIframe, which sends
its output to an iframe within the current web page. (This is not useful in a shell, obviously.)
This appender is lazy, in that it does not add the iframe child to the current
page until there is actually some output to display (which there may not be, depending
on maxLevel). This would be configured for example by:
  <pre>
    var bu_AppConfig = {'burst.logging.Log.appender' : 'new burst.logging.AppenderIframe()'};
  </pre>
Any of the optional constructor parameters could of course be specified; the whole
string value is eval'd at configuration time to determine the burst.logging.Appender instance.

The global variable <var>burst.logging.Log.ROOT_MAX_LEVEL</var> governs the debug level that is used
in the period between when this Log.js file is loaded, and when the external configuration (if any)
is applied. You may set that variable prior to loading the file by something like this:
<pre>
  burst.logging.Log.ROOT_MAX_LEVEL = 'DEBUG';
</pre>
If it is not set at configuration time, it keeps whatever level is set at load time via
that variable (WARN by default).

If no configuration at all is done:
- there are no appenders (change with 'appender' class property or bu_Log.addAppender())
- the maximum level of the root logger is WARN (change with 'maxLevel' class property or bu_Log.setMaxLevel())

For any output to be seen it is necessary configure both an appender <em>and</em> set the debug level
appropriately.

(Note that there is also the catch-22 problem of how library maintainers debug the module itself,
but we don't get into that here. See the function <code>bu_dbgdbg_</code> in the source.)

<h3>TODO</h3>
@todo automatically choose burst.logging.Log instance by caller file name, in environments where it is available.
@todo incorporate any ideas/code from http://code.audiofarm.de/Logger/ (written in ActionScript 2.0)
@todo maybe let bu_debug and so on be used in burst_first after all

*/
//=java public class Log {

/**
Constructor for a burst.logging.Log. No args for the root instance.

@param name Optional argument, the name of the instance.
@param parent Optional argument, the parent of the instance.
*/
//=java public Log(String name, burst.logging.Log parent) {}
function BU_Log(name, parent, max_level) {
  this.name_ =  name;
  this.parent_ = parent; // may be undefined
  this.max_level_ = max_level; // may be undefined
  this.appenders_ = [];
  burst.logging.Log.addLogger_(this);
}
burst.logging.Log = BU_Log;


// class variable, hash from instance name to BU_Log instance.
//=java private static Object logs_by_name_ = {};
BU_Log.logs_by_name_ = {};

// class constant.
//=java private static final int MAX_LEVEL = 7;
BU_Log.MAX_LEVEL = 7;

// Array of BU_LogLevel instances indexed by integer value.
BU_Log.LEVELS_BY_VAL = new Array(BU_Log.MAX_LEVEL + 1);
BU_Log.LEVELS_BY_NAME = {};
 

/** The debug level. */
//:CLCONSTANT BU_LogLevel DEBUG = new BU_LogLevel('DEBUG', 7)
BU_Log.DEBUG = new BU_LogLevel('DEBUG', 7);

/** The info level. */
//:CLCONSTANT BU_LogLevel INFO = new BU_LogLevel('INFO', 6)
BU_Log.INFO = new BU_LogLevel('INFO', 6);

/** The warn level. */
//:CLCONSTANT BU_LogLevel WARN = new BU_LogLevel('WARN', 4)
BU_Log.WARN = new BU_LogLevel('WARN', 4);

/** The error level. */
//:CLCONSTANT BU_LogLevel ERROR = new BU_LogLevel('ERROR', 3)
BU_Log.ERROR = new BU_LogLevel('ERROR', 3);

/** The fatal level. This differs from ERROR in that messages to this level automatically cause an exception. */
//:CLCONSTANT BU_LogLevel FATAL = new BU_LogLevel('FATAL', 0)
BU_Log.FATAL = new BU_LogLevel('FATAL', 0, true);





/**
* Get a logger instance by name, or null if none.
* @param name the name of the BU_Log instance
*/
//=java public static Log getLogger(String name) {}
BU_Log.getLogger = function(name) {
  return bu_get_soft(BU_Log.logs_by_name_, name, null);
}

// automatically called from constructor; should not be called by outsiders.
//=java private static void addLogger_(Log logger) {}
BU_Log.addLogger_ = function(logger) {
  var name = logger.name_;
  if (BU_Log.getLogger(name)) throw "duplicate log name '" + name + "'";
  BU_Log.logs_by_name_[name] = logger;
}

/**
* Will enable or disable debug at a global level (this is a class method).
* This is efficiently redefining the <code>bu_debug</code> so it is a noop function,
* when isEnabled is false. If isEnabled is true, it is restored.
*
* Note that if it is disabled, no debug will at all will ever come out,
* regardless of the debug level set in any BU_Log instance.
* If it is enabled, any filtering at the instance level still applies.
*
* If <code>setMaxLevel('DEBUG')</code> is called on any BU_Log instance, it will
* automatically call <code>enableDebug(true)</code>.
*
* @param isEnabled whether debug should be enabled.
*/
//:CLCMETHOD void enableDebug(Boolean isEnabled)

function bu_Log_noop() {};

function bu_Log_debug() {
  //print("in debug, arguments[0]: '" + arguments[0] + "'");
  //try{throw Error("foo")}catch(e){print(e.stack)};
  bu_dbgdbg("in BU_Log_debug with arguments.length=" + arguments.length);
  return this.message(BU_Log.DEBUG, arguments);
}

BU_Log.real_bu_debug = null;

BU_Log.enableDebug = function(isEnabled) {
  BU_Log.prototype.debug = isEnabled ? bu_Log_debug : bu_Log_noop;
  if (isEnabled) {
    bu_debug = BU_Log.real_bu_debug || bu_debug_;
  }
  else {
    if (bu_debug !== bu_Log_noop) BU_Log.real_bu_debug = bu_debug;
    bu_debug = bu_Log_noop;
  }
  bu_dbgdbg('burst.logging.Log enabled: ' + (bu_Log_debug === BU_Log.prototype.debug));
}

/**
* Convert a String name or Number level to a BU_LogLevel object.
* If it is already a BU_LogLevel instance, it is just returned unchanged.
*/
//:CLCMETHOD Object toLevelObject(Object level)
BU_Log.toLevelObject = function(level) {
  switch(typeof level) {
  case 'object': return level;
  case 'string': return BU_Log.LEVELS_BY_NAME[level];
  case 'number': return BU_Log.LEVELS_BY_VAL[level];
  default: throw "unexpected level: " + level;
  }
}




/**
* Issue a debug message. Same as <code>BU_Log.message(BU_Log.DEBUG, ...)</code>.
*/
//:CLIMETHOD void debug(...)
BU_Log.prototype.debug = bu_Log_debug;

BU_Log.prototype.info = function bu_Log_info() {
  return this.message(BU_Log.INFO, arguments);
}

BU_Log.prototype.warn = function bu_Log_warn() {
  return this.message(BU_Log.WARN, arguments);
}

BU_Log.prototype.error = function bu_Log_error() {
  return this.message(BU_Log.ERROR, arguments);
}

BU_Log.prototype.fatal = function bu_Log_fatal() {
  this.message(BU_Log.FATAL, arguments);
  // no return
}



/**
* Sets the highest level to pass on to any appender.
* If null or undefined is passed in, it will cause this instance to
* inherit from its parent.
* @param level A level as String name, Number level, or Object.
*/
//:CLIMETHOD void setMaxLevel(Object level)
BU_Log.prototype.setMaxLevel = function(level) {
  if (!level) {
    if(!this.parent_) throw "(Log.js) attempt to setMaxLevel of no level, at root logger";
    this.max_level_ = level;
    return;
  }
  var levelobj = BU_Log.toLevelObject(level);
  this.max_level_ = levelobj;
  if (levelobj === BU_Log.DEBUG && bu_debug === bu_Log_noop) BU_Log.enableDebug(true);
}

/**
* Whether the specified level is passed by this instance.
* If max_level_ is set, it does a comparison, otherwise bubbles to parent.
* @param level (object, Number, or String name).
*/
//:CLIMETHOD Boolean isOn(Object level)
BU_Log.prototype.isOn = function(level) {
  var levelobj = BU_Log.toLevelObject(level);
  if (!this.max_level_) {
    if (this.parent_) return this.parent_.isOn(levelobj);
    throw "no max_level_ or parent_";
  }
  if (this.max_level_.value_ >= levelobj.value_) {
    return true;
  }
  bu_dbgdbg("isOn=false for level " + level + ", max_level=" + this.max_level_);
  return false;
}

// private instance method.
BU_Log.prototype.message = function(level, args, stack_start) {
  if (typeof stack_start == 'undefined') stack_start = 2;
  bu_dbgdbg("in message");
  var levelobj = BU_Log.toLevelObject(level);
  if (!this.isOn(levelobj)) {
      bu_dbgdbg("level " + levelobj + " not on");
    return false;
  }
  // sigh, arguments isn't a real Array so can't call join
  var mess = '';
  for (var i=0; i<args.length; i++) {mess += args[i];}
  bu_dbgdbg("combined " + args.length + " args to get message '" + mess + "'");
  this.sendAppenders(levelobj, mess, 1 + stack_start);
  // maybe throw
  if (levelobj.is_fatal_) throw mess;
  return true;
}

BU_Log.prototype.sendAppenders = function(levelobj, message, stack_start) {
  bu_dbgdbg("sending to " + this.appenders_.length + " appenders for level " + levelobj);
  for(var i=0;i<this.appenders_.length;++i) {
     var appender = this.appenders_[i];
     appender.format(this, levelobj, message, 1 + stack_start);
  }
  if (this.parent_) this.parent_.sendAppenders(this, levelobj, message, 1 + stack_start);
}

/**
* Add an appender to this instance. Currently there is no protection against duplicate adds.
* @param appender An object with a method named format, or a function which is used in a burst.logging.Appender constructor.
*/
//:CLIMETHOD void addAppender(Object appender)
BU_Log.prototype.addAppender = function(appender) {
  if (typeof appender == 'function') {
     appender = new burst.logging.Appender(appender);
  }
  if (!appender.format) throw "attempt to add appender which is neither a function nor an object implementing method 'format': " + appender;

  this.appenders_.push(appender);
  bu_dbgdbg("pushed appender");
};

BU_Log.prototype.clearAppenders = function() {this.appenders_ = []};

BU_Log.prototype.hasAppenders = function() {return this.appenders_.length > 0};

/**
* Will clear any existing appenders, and then add the given one.
* Optionally, will also copy over any buffered log statements from a previous burst.logging.AppenderBuffer.
* @param appender The appender to set.
* @param copy_buffered Optional. If specified and true, does the copying.
*/
//:CLIMETHOD void setAppender(Object appender, Boolean copy_buffered)
BU_Log.prototype.setAppender = function(appender, copy_buffered) {
    // the last one
    var old_appender = this.appenders_.pop();
    this.clearAppenders();
    this.addAppender(appender);
    // alert("just set appender, have old = " + (old_appender ? 'yes' : 'no') + " instanceof=" + (old_appender instanceof burst.logging.AppenderBuffer) + " copy=" + copy_buffered); 
    if (copy_buffered && old_appender && old_appender instanceof burst.logging.AppenderBuffer) {
      // alert("about to copy " + old_appender.count_ + " lines from previous appender");
      old_appender.for_lines(function(line) {appender.appendl(line);})
    }
}

// zero pad. redundant with burst.Text.zeroPad, but here for self-sufficiency.
function bu_zp(i, len) {
  var s = '' + i;
  return '0000000000'.substring(10 - len + s.length) + s;
}

// space pad, right or left justify. see also burst.Text.spacePad
function bu_sp(s, len, is_lj) {
  if (arguments.length < 3) is_lj = false;
  if (typeof s != 'string') s = '' + s;
  var spaces = '          '.substring(10 - len + s.length);
  return is_lj ? s + spaces : spaces + s ; 
}

// redundant with burst.Time.format(d, 'HH:mm:ss.SSS'), but here for self-sufficiency
function bu_format_date_time(d) {
   //var tstr = d.toTimeString();
   //var tstr = [d.getHours(),':',d.getMinutes(),':',d.getSeconds(),'.',d.getMilliseconds()].join('');
   return [bu_zp(d.getHours(),2),':',bu_zp(d.getMinutes(),2),':',bu_zp(d.getSeconds(),2),'.',bu_zp(d.getMilliseconds(),3)].join('');
}

/**
* The class method called to format a line of text.
*/
//:CLCMETHOD String format(BU_Log logger, BU_LogLevel levelobj, String message, Number stack_start)

// default format function
BU_Log.defaultFormat = function(logger, levelobj, message, stack_start) {
  var now = new Date();
  var tstr = bu_format_date_time(now);

  var level_name = bu_sp(levelobj.name_, 'DEBUG'.length, true);

  var line = [tstr, ' ', level_name, ' [', logger.name_, '] ', message].join('');
  return line;
}

/**
* Set the formatter. Must implement signature of BU_Log.format.
* This oly has an affect on appenders which do not do their own formatting.
*/
//:CLCMETHOD void setFormatter(Function func)
BU_Log.setFormatter = function(formatter) {BU_Log.format = formatter};

BU_Log.setFormatter(BU_Log.defaultFormat);

  // class-level property defs
  // we can't do these at load time because the burst.reflect.PropertyDef* classes aren't defined yet.
BU_Log.initPropDefs = function() {
  BU_Log.PROP_DEFS = [
//:CPROPERTYDEFS
  new burst.reflect.PropertyDefString({
   name: 'maxLevel', 
   description: 'The max level of the "root" logger. A string name of a level such as "DEBUG". If specified, it overrides BU_LOG_ROOT_MAX_LEVEL.'
  }),
  new burst.reflect.PropertyDefExpr({
   name: 'appender', 
   description: "If specified, the string is eval'd and the result is passed to setAppender."
  }),
  new burst.reflect.PropertyDefExpr({
   name: 'formatter', 
   description: "If specified, the string is eval'd and the result is passed to burst.logging.Log.setFormatter."
  })
//:ENDPROPERTYDEFS
  ];
};

//=java } // class Log


bu_loaded('burst.logging.Log');
