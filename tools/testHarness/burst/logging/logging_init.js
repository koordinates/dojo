/**
* @file logging_init.js
*
* Executed after all other files in burst.logging.* are loaded.
* Defines bu_Log and configures its appenders.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

/*
* A function that can be assigned to window.onerror, if desired.
* Global "onerror" has no standard, but is supported by IE and NS.
* It returns false to continue with default handling.
* It returns true to suppress the normal dialog (though this will not suppress debugger dialogs, if those are enabled).
*
* It is set as: window.onerror = function(mess,url,line) {return false;}
*
* In Mozilla with strict warnings on, window.onerror is called for each.
*
* See http://msdn.microsoft.com/library/default.asp?url=/workshop/author/dhtml/reference/events/onerror.asp
*
* @todo what happens if you throw when inside an onerror handler? what happens if have a js error?
*/
BU_Log.bu_onerror = function(mess,url,line) {
  var fullmess = '(BU_Log.js) bu_onerror at ' + url + ' line ' + line + ': ' + mess;
  bu_alert(fullmess);
  //bu_warn(fullmess);
  // return false to do default handling
  return false;
}

/**
* You may optionally set this, prior to loading the library, to control the debug level
* that applies between when the files are loaded, and when external logging configuration is done.
* As usual, it can be a Number value, String name, or Object such as BU_Log.DEBUG.
* If it is not externally set, "WARN" is used.
*/
//:GLVAR Object BU_LOG_ROOT_MAX_LEVEL
var BU_LOG_ROOT_MAX_LEVEL;
if (typeof BU_LOG_ROOT_MAX_LEVEL == 'undefined') BU_LOG_ROOT_MAX_LEVEL = BU_Log.WARN; // BU_Log.DEBUG;

/** 
* A global instance of BU_Log which is the root logger.
*/
//:GLVAR burst.logging.Log bu_Log = new burst.logging.Log('root', null, burst.logging.Log.toLevelObject(BU_LOG_ROOT_MAX_LEVEL))
var bu_Log = new BU_Log('root', null, BU_Log.toLevelObject(BU_LOG_ROOT_MAX_LEVEL));


// return the logger instance suitable for a caller skip levels above.
// for now, we just return the one true instance.
function bu_Log_callerLogger(skip) {
/*
if (burst.Lang && burst.Lang.getCallerName) {print("   caller name is '" + burst.Lang.getCallerName(skip) + "'"); print("   got stack:" + burst.Lang.getStackTrace());}
else print("    no burst.Lang.getCallerName");
*/
  return bu_Log;
}

/*
* convenience functions: bu_debug, etc.
*/

/** 
The function bu_alert does <em>not</em> use burst.logging.Log functionality.
In a browser, it calls <code>window.alert</code>.
In a shell, it calls the global <code>print</code>. Otherwise it does nothing.

Should be used judiciously, since after all bu_info/bu_warn/bu_error could be configured
to go to an appender which does a window.alert instead.
*/
//:GLFUNCTION bu_alert(String message)
var bu_alert = (typeof this.alert != 'undefined') ? this.alert : (this.load && this.print ? this.print : function() {});

// explicit definition since we change the definition of bu_debug dynamically.
function bu_debug_() {BU_Log.prototype.debug.apply(bu_Log_callerLogger(2), arguments);}

/** Convenience for bu_Log.debug(...) */
//:GLFUNCTION bu_debug(...)
var bu_debug = bu_debug_;
//var bu_debug = bu_Log.debug;

/** Convenience for bu_Log.info(...) */
//:GLFUNCTION bu_info(...)
function bu_info() {BU_Log.prototype.info.apply(bu_Log_callerLogger(2), arguments);}
//var bu_info = bu_Log.info;

/** Convenience for bu_Log.warn(...) */
//:GLFUNCTION bu_warn(...)
function bu_warn() {BU_Log.prototype.warn.apply(bu_Log_callerLogger(2), arguments);}
//var bu_warn = bu_Log.warn;

/** Convenience for bu_Log.error(...) */
//:GLFUNCTION bu_error(...)
function bu_error() {BU_Log.prototype.error.apply(bu_Log_callerLogger(2), arguments);}
//var bu_error = bu_Log.error;

//var bu_fatal = bu_Log.fatal;

/**
* You may optionally set this variable, prior to loading the library, to control whether when a JsUnit
* implementation has previously been loaded, we should use an appender which sends
* to the JsUnit implementation's debug output channel (so that test output is interleaved).
* If no JsUnit implementation is previously loaded (determined by testing for certain symbols),
* then this has no effect.
* By default it is not set, and this behavior is not done.
* 
* Note that this works regardless of which JsUnit implementation is used (our wrapper, or
* some other one used directly).
*/
//:GLVAR Boolean BU_LOG_USE_JSUNIT_APPENDER
var BU_LOG_USE_JSUNIT_APPENDER;
if (typeof BU_LOG_USE_JSUNIT_APPENDER == 'undefined') BU_LOG_USE_JSUNIT_APPENDER = false;

if (BU_LOG_USE_JSUNIT_APPENDER) {
  // Edward Hieatt jsunit, jsunit.net
  // see jsunit_hieatt/app/jsUnitCore.js
  if (typeof setUp === 'function') {
  bu_Log.addAppender(new burst.logging.Appender(null, function(logger, levelobj, mess, stack_start) {
    switch(levelobj) {
    case BU_Log.DEBUG: return debug(mess);
    case BU_Log.INFO: return inform(mess);
    case BU_Log.WARN: return warn(mess);
    // their error does a throw
    case BU_Log.ERROR: return warn(mess);
    case BU_Log.FATAL: return error(message); // their error or fail
    }
    throw("unknown levelobj " + levelobj + " typeof=" + typeof levelobj);
  }));
  }

  // Jorg Schaible jsunit, 
  // see lib/JsUnit.js and lib/JsUtil.js
  else if (typeof TestSetup === 'function') {
    // this assumes that the caller didn't override the default writer
    //bu_Log.addAppender(new burst.logging.Appender( JsUtil_getSystemWriter().println ));
    bu_Log.addAppender(new burst.logging.Appender( function() { JsUtil_getSystemWriter().println.apply(JsUtil_getSystemWriter(), arguments)}));
  }

  // our JsUnit wrapper and our JsUnit implementation
  else if (typeof jum !== 'undefined' && typeof jum.name !== 'undefined' && jum.name == 'mda') {
    bu_Log.addAppender(new burst.logging.Appender( function(line) { jum.my_output_('BULOG', line) }));
  }
}

/**
* You may optionally set this variable prior to loading BU_Log.js to control whether, when the
* environment has a println function (as determined from <code>bu_Runtime.println</code>),
* we should default to creating an appender which uses it.
* If the environment has no println (or equivalent), as is typical in a browser, then
* this has no effect.
* If not already set by the application, this is set to true.
*/
//:GLVAR Boolean BU_LOG_USE_PRINTLN_APPENDER
var BU_LOG_USE_PRINTLN_APPENDER;
if (typeof BU_LOG_USE_PRINTLN_APPENDER == 'undefined') BU_LOG_USE_PRINTLN_APPENDER = true;
if (BU_LOG_USE_PRINTLN_APPENDER && !bu_Log.hasAppenders() && typeof bu_Runtime.println === 'function') {
   bu_Log.addAppender(bu_Runtime.println);
}

// If we still have no appenders defined at this point, use a circular buffer.
if (!bu_Log.hasAppenders()) {
  bu_Log.addAppender(new burst.logging.AppenderBuffer(100));
}

// We now have a bu_Log with appenders, though the appender(s) may be replaced at config time.

// Issue a debug log statement about symbols replaced by fix_ecma.
if (bu_fixed.length > 0)
  bu_debug("fix_ecma.js replaced these symbols: ", bu_fixed);
else
  bu_debug("fix_ecma.js had no symbols to replace");

// We do final configuration as onDocumentLoad instead of onConfig, because the config might specify an
// appender that requires that the document is loaded.
BU_Log.onDocumentLoad = function() {
  //bu_alert('(logging_init.js) in BU_Log.onDocumentLoad');
  BU_Log.initPropDefs();

  var props = bu_Config.setObjectValues({}, BU_Log.PROP_DEFS, 'burst.logging.Log', true);

  //bu_alert("(Log.js) configured maxLevel is " + props.maxLevel);
  if (props.maxLevel) {
    var max_level_obj = BU_Log.toLevelObject(props.maxLevel);
    bu_Log.setMaxLevel(max_level_obj);
  }

  var appender = props.appender;
  //bu_alert("(logging_init.js) configured appender is " + appender);
  if (appender) {
    // maybe wait for the appender. better be ready if there is no window.setTimeout...
    if ((typeof appender.is_ready_ == 'function') && !appender.is_ready_()) {
      burst.Lang.wait(function() {return appender.is_ready_()}, 
      function() {bu_Log.setAppender(appender, true)},
      null,
      50,
      1000);
    }
    else {
	// second arg is whether to immediately copy over pending lines
	bu_Log.setAppender(appender, true);
    }
  }

  var formatter = props.formatter;
  //bu_alert("(logging_init.js) configured formatter is " + formatter);
  if (formatter) {
    BU_Log.setFormatter(formatter);
  }

  // @todo maybe register an onerror handler, if config says so
  // for now, we don't do this if mozilla because it might have strict warnings on.
  //if (typeof window != 'undefined') window.onerror = BU_Log.bu_onerror;
}

bu_loaded('burst.logging.logging_init', ['burst.reflect.PropertyDef', 'burst.Lang', 'burst.BurstError', 'burst.ScriptLoader'], BU_Log);