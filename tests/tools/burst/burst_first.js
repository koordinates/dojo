/**
* @file burst_first.js
*
* Utility file - this is the first library file to be loaded: 
* - Tries to ensure we aren't in a totally broken environment. 
* - Deals with the ScriptLoader catch-22 problem. 
* - Declares the list of all library modules in an order that reflects
* the load dependency partial ordering (so that they could be concatenated
* and loaded as one file).
*
* Note that because this file is run before fix_ecma.js, it can't use undefined or various
* builtin functions such as Array.push that are not available on IE 5.0.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

// check that we aren't running JavaScript1.2
// JavaScript1.2 is really a different language
// don't throw new Error, since that doesn't work til JS1.5 anyway.
if (!(new Boolean(false))) throw "Do not use language='JavaScript1.2'";

// Ideally we'd check for the availability of instanceof here.
// But it doesn't help much to even test for instanceof, since you'll get a syntax error at the parse
// phase if anywhere in this file an instanceof is used, if it isn't supported.
// This test would have to go into an earlier script file to accomplish anything.
/*
try {eval("1 instanceof Object")} catch(e) {alert("instanceof doesn't work!")}
*/

/*
* Define a substitute for the boolean "in" operator, as in "if (mem in obj)".
* This operator is not available in IE5.0PC. 
*
* We cannot even put it in the source code for IE5.0PC because it'll fail at parse time; 
* we'd have to do something like:
*    try {eval("bu_in = function(mem,obj) {return (mem in obj)}");}
* But that incurs some cost for all other browsers.
* We could use JScript conditional compilation (cc_on), since we only care
* to make up for this lack in IE5.0PC, but that currently isn't supported by our
* comment stripper. So we just use a single definition for everyone.
*
* Note that in ICE6, ("onload" in window) but not (window["onload"]) initially. 
* The latter is correct. We don't really support ICE anyway right now, but there
* it would be more reliable to use (typeof [obj[mem] !== 'undefined').
*
* @todo a source transformation tool for those people who don't care about IE5.0PC.
*/
function bu_in(mem,obj) { return (typeof obj[mem] !== 'undefined'); }

/*
SpiderMonkey strict mode complains with
  "Warning: anonymous function does not always return a value"
if a function has both "return;" and "return val;" in its body.
SpiderMonkey strict mode also complains if you have "return undefined".
*/
var BU_UNDEFINED;

/*
Caller expects to get back undefined if none.
So could be replaced with
   obj[mem] 
if strict warnings are off.
*/
function bu_get(obj, mem) {
    //TEMPORARY, to hide warnings
    if (typeof obj[mem] == 'undefined') {
	//bu_alert("(burst_first.js) bu_get found no member '" + mem + "' in object so returning null");
	return null;
    }
    return obj[mem];
}
//function bu_get(obj, mem) {return typeof obj[mem] == 'undefined' ? undefined : obj[mem]}

/*
Return fallback if there is no value or if the existing value tests as false.
Could be replaced with
  obj[mem] || fallback
if strict warnings are off.
*/
//function bu_get_soft(obj, mem, fallback) {return obj[mem] || fallback;}
function bu_get_soft(obj, mem, fallback) {return typeof obj[mem] == 'undefined' ? fallback : obj[mem];}


// We could attempt to set strict warnings mode here.
// But when running in a shell, there is no point, since the programmer
// could just set -w.
// And when running in a browser, we typically do not have privilege.
// See also burst/Lang.js

// The Array of all library module names which constitute the "core".
// This reflects a partial ordering by load dependency.
// NOTE: this source code must conform to a pattern that is matched in the Makefile.
var BU_CORE_MODULES = [
  'burst_first.js',
  'fix_ecma.js',        // will use bu_loaded if defined
  'burst.runtime.AbstractRuntime',      // call: burst.BurstError (bu_unimplemented, bu_throw), burst.Lang (unevalFunctionCall, bu_eval), sometimes burst.xml.DomUtil
  'burst.runtime.DomRuntime',
  'burst.runtime.SpiderMonkeyRuntime',
  'burst.runtime.RhinoRuntime',
  'burst.runtime.WshRuntime',
  'burst.runtime.KJSRuntime',
  'burst.runtime.runtime_init',
  'burst.Alg',          // call: burst.logging.Log (bu_debug)
  'burst.logging.Log',  // load: burst.runtime.AbstractRuntime (bu_Runtime); call: fix_ecma.js (bu_in), burst.reflect.PropertyDef (PropertyDefString), burst.Lang (isSpecified), burst.BurstError (bu_throw), burst.Config (bu_Config); for AppenderIframe: burst.ScriptLoader (bu_ScriptLoader), burst.xml.HtmlUtil, burst.xml.DomUtil
  'burst.logging.Appender',
  'burst.logging.AppenderIframe',
  'burst.logging.AppenderBuffer',
  'burst.logging.logging_init',
  'burst.Lang',         // call: burst.Alg (transform...), burst.Text (quote, trim), burst.web.UserAgent (bug_builtin_constructor_unreliable)
  'burst.MOP',          // call: burst.logging.Log (bu_debug), burst.BurstError(bu_throw), fix_ecma.js (bu_in), Lang (cond, joinArguments, uneval), Alg (for_each)
  'burst.BurstError',   // load: burst.MOP (inherits)
  'burst.AssertFailure',
  'burst.web.UserAgent',
  'burst.xml.fix_dom',
  'burst.xml.DomUtil',
  'burst.xml.HtmlUtil',
  'burst.xml.HtmlBox',
  'burst.xml.XmlDoc',
  'burst.web.WindowEvent',
  'burst.web.DragDrop',
  'burst.web.TextSelection',
  'burst.io.AbstractURIRequest',
  'burst.io.IframeURIRequest',
  'burst.io.XmlHttpURIRequest',
  'burst.ScriptLoader', // call: burst.runtime.AbstractRuntime, burst.Alg (for_each), burst.logging.Log (bu_error), fix_ecma.js (bu_in). sometimes burst.web.WindowEvent
  'burst.Text',         // call: burst.Lang (isLegalIdentifier)
  'burst.URI',          // call: burst.Alg
  'burst.props.PropertyError',      // 
  'burst.reflect.PropertyDef',      // load: burst.MOP, burst.BurstError; call: burst.Text, burst.Alg, burst.Lang, burst.URI, bu_ScriptLoader
  'burst.props.AbstractProperties', // call: burst.Text, burst.URI, burst.Alg, burst.reflect.PropertyDef, burst.Lang (isSpecified)
  'burst.Config',       // load: burst.props.*Properties, burst.MOP, burst.reflect.PropertyDef (PropertyDefString)
  'burst.Functional',   // needed by SortTable
  'burst.Comparator',   // needed by SortTable
  'burst.Time',
  'burst.webui.WidgetManager',
  'burst.webui.widgets.AbstractWidget',
  'burst.xml.XPath',
];

var BU_OTHER_MODULES = [
];

// define burst, the root object for the symbols of the library. 
var burst = {io: {}, logging: {}, props: {}, reflect: {}, runtime: {}, web: {}, webui: {widgets: {}}, xml: {}};

// temporary bootstrap definition of ScriptLoader.module(), until the real thing can take over.

// instance by index
var BU_BOOTSTRAP_SCRIPTS = [];
// instance by name
var BU_BOOTSTRAP_NAMES = {};

function bu_bootstrap_module(modulename, load_deps, call_deps, handler) {
   BU_BOOTSTRAP_SCRIPTS[BU_BOOTSTRAP_SCRIPTS.length] = [modulename, load_deps, call_deps, handler];
   BU_BOOTSTRAP_NAMES[modulename] = true;
   var deps = load_deps;
   //alert("bu_bootstrap_module(" + modulename + ")");
   if (deps) {
      for(var i=0;i<deps.length;++i) {
         var depname = deps[i];
         if (typeof BU_BOOTSTRAP_NAMES[depname] == 'undefined') {
	   var mess = "(burst_first.js) core module '" + modulename + "' has load dependency on module '" + depname + "' not already loaded";
	   if (typeof alert != 'undefined') alert(mess);
           throw(mess);
         }
      }
   }
}

function bu_loaded(modulename, call_deps, handler) {
    //alert("bu_loaded(" + modulename + ")"); 
    bu_bootstrap_module(modulename, null, call_deps, handler);
}
function bu_require(modulename, load_deps) {
    //alert("bu_require(" + modulename + ")"); 
    bu_bootstrap_module(modulename, load_deps);
}

/**
Perform the prototype idiom of connecting a sublcass Function and a superclass Function.

This is defined in this file so that everything else in the library can use it at load time.
It is equivalent to burst.MOP.inherits .
*/
//:GLFUNCTION void bu_inherits(Function subclass, Function superclass)
function bu_inherits(subclass, superclass) {
 if (typeof superclass != 'function') { if (typeof alert != 'undefined') alert("eek: superclass not a function: " + superclass +"\nsubclass is: " + subclass);}
  subclass.prototype = new superclass();
  subclass.prototype.constructor = subclass;
  // TODO: subclass.super = superclass gives JScript error?
  subclass['super'] = superclass;
}


// undefined here; will be set to true if individual files including ScriptLoader.js are combined into a single file
var BU_CORE_FILENAME;

// there is no temporary bootstrap definitions of bu_debug, bu_info, etc.
// those are defined in Log.js, and can't be used by any prior module.

// register ourselves
bu_loaded('burst_first.js');
