/**
* @file SpiderMonkeyRuntime.js
*
* Defines burst.runtime.SpiderMonkeyRuntime, a subclass of burst.runtime.AbstractRuntime for a SpiderMonkey-based environment (typically non-browser shell).
*/

//=java package burst.runtime;

/**
* Singleton subclass of AbstractRuntime for SpiderMonkey
*/
//=java public class SpiderMonkeyRuntime extends AbstractRuntime {

//=java public SpiderMonkeyRuntime() {}
function BU_SpiderMonkeyRuntime() {
  this.name = function() {return 'SpiderMonkey'};

  // version() returns 0, sigh. and build() returns nothing but just prints.
  this.version = function() {return version()};

  /*
  - SpiderMonkey and Rhino have global print(), which takes multiple args, joins them with ' ', and appends a newline.
  - XPCShell also has global dump(), which takes a single arg and does not append a newline.
  */
  this.println = function(line) {print(line)};

  this.exit = function(exitcode) {quit(exitcode)};
};
burst.runtime.SpiderMonkeyRuntime = BU_SpiderMonkeyRuntime;
bu_inherits(BU_SpiderMonkeyRuntime, burst.runtime.AbstractRuntime);

/*
* SpiderMonkey apparently has no official way to determine what the current file name is.
* This is an ugly hack which takes advantage of the undocumented fact that
* thrown Error instances have a "stack" variable which contains file names.
*
* Note that there is also the undocumented Error.fileName, but unfortunately it is
* the empty string in my experience.
*/
function bu_getCurrentScriptURI_spidermonkey() {
  var s;
  // ENVBUG: KJS 3.02 requires semi-colon in this try clause
  try{throw Error("whatever");} catch(e) {s = e.stack; /*print("e.fileName='" + e.fileName + "'")*/}

  //print("got Error.stack=" + s);
  
  var matches = s.match(/[^@]*\.js/gi);
  if (!matches) throw "could not parse stack string: '" + s + "'";
  // matches[1] is the first match, would be something like:
  //    bu_getCurrentScriptURI_spidermonkey("ScriptLoader.js")@burst/Runtime.js:101
  // we have to skip call to getBaseURI too
  var fname = matches[3];
  if (!fname) throw "could not find file name in stack string '" + s + "'";
  //print("SpiderMonkeyRuntime got fname '" + fname + "' from stack string '" + s + "'");
  return fname;
}

BU_SpiderMonkeyRuntime.prototype.getCurrentScriptURI = bu_getCurrentScriptURI_spidermonkey;


/**
* Read a local file synchronously and evaluate its contents.
*
* This function relies on a global <code>load()</code> function, such as is available
* in SpiderMonkey and Rhino.
*
* The shell load() evaluates and puts symbols into the global namespace.
* This function has no useful return value; any result from the evaluation
* must be done by a callback within the loaded file contents.
*
* @todo How does load() handle runtime syntax errors?
* @todo How does load() handle a non-existent or unreadable file?
*
* @param fpath The absolute or relative path to pass in to load()
* @throws BurstError if load() returns false
*/
//:NSFUNCTION void readEvalSync(String fpath)
BU_SpiderMonkeyRuntime.prototype.readEvalSync = function(fpath) {
  // supposed to return true on success, false on failure.
  // see spidermonkey source, src/js.c function Load.
  // Sadly, sometimes spidermonkey may just fail with a "can't open foo.js: No such file or directory"
  // without throwing or returning false.
  // also, it may return undefined rather than false.
  var ok = load(fpath); 
  if (typeof ok == 'boolean' && !ok) bu_throw("load(" + fpath + ") returned " + (typeof ok) + " " + ok);
}

/**
* Read a local file synchronously and return its contents.
*
* This function only works in XPCShell.
*
* Our implementation basically came Kevin Burton's weblog:
* http://www.peerfear.org/rss/permalink/2003/01/21/1043160037-File_IO_in_MozillaJavaScript.shtml
*/
//:NSFUNCTION String readFile_xpcshell(String fname)
BU_SpiderMonkeyRuntime.readFile_xpcshell = function(fname) {
  var file = bu_xpcLocalFile(fname);
  if ( !file.exists() ) throw "File '" + fname + "' does not exist.";
  var sis = bu_xpcScriptableInputStream(file);
  var contents = sis.read(sis.available());
  return contents;
}


function bu_xpcScriptableInputStream(file) {
    var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
        .createInstance( Components.interfaces.nsIFileInputStream );

    //init the file input stream... we don't need to pass any flags.
    is.init( file, 0, 0, 0 );

    //get a scriptable input stream because the standard input stream can not be
    //used from JavaScript (fun huh!)

    var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
        .createInstance( Components.interfaces.nsIScriptableInputStream );

    sis.init( is );
    return sis;
}

function bu_xpcLocalFile(fname) {
    var file = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);

   //init the file since we can't use a constructor
   file.initWithPath( fname );
   return file;
}


// symbol load is in Rhino also.
// symbol line2pc is in SpiderMonkey but not XPCShell. 
// XPCShell has DumpXPC but SpiderMonkey doesn't.
BU_SpiderMonkeyRuntime.isPresent = function() {
  return (typeof line2pc !== 'undefined' || typeof DumpXPC !== 'undefined');
}

//=java } // class SpiderMonkeyRuntime
