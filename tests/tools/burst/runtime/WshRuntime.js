/**
* @file WshRuntime.js
*
* Defines burst.runtime.WshRuntime, a subclass of burst.runtime.AbstractRuntime for Microsoft WSH.
*/

//=java package burst.runtime;

/**
* Singleton subclass of AbstractRuntime for WSH.
*/
//=java public class WshRuntime extends AbstractRuntime {

//=java public WshRuntime() {}
function BU_WshRuntime() {
  this.name = function() {return 'WSH'};

  this.getCurrentScriptURI = function() {
     var fname = WScript.ScriptFullName;
     return fname;
  }

  /*
   * WScript.StdOut exists when running cscript but not wscript.
   * WriteLine() will also write a newline; Write() does not.
   *
   * WScript.Echo does nothing if WScript.Interactive is false.
   * If true, then it appends args and displays to console if cscript or dialog if wscript.
   *
   * Apparently JScript .NET takes out WScript.Echo and supplies a global print.
   * It also has a System.Console.WriteLine
   * http://groups.google.com/groups?selm=OGCi8YCTBHA.1740%40tkmsftngp03
   * http://groups.google.com/groups?selm=uur%24U4PTBHA.928%40tkmsftngp03
   */
  //this.println = function(line) {WScript.StdOut.WriteLine(s)};
  this.println = typeof print == 'undefined' ? function(line) {WScript.Echo(s)} : function(line) {print(s)};

  this.exit = function(exitcode) {WScript.Quit(exitcode)};
};
burst.runtime.WshRuntime = BU_WshRuntime;
bu_inherits(BU_WshRuntime,BU_AbstractRuntime);

/**
* Read a local text file synchronously and return its contents.
*
* This function only works in WSH.
*
* Works with absolute or relative local file path.
*
* See:
* http://msdn.microsoft.com/library/default.asp?url=/library/en-us/script56/html/jsmthopentextfile.asp
*/
//:NSFUNCTION String readTextFile(String fpath)
BU_WshRuntime.readTextFile = function(fpath) {
   var fs = new ActiveXObject( "Scripting.FileSystemObject" );
   var istream = fso.OpenTextFile( fpath, 1 ); // iomode==1 means read only
   var contents = istream.ReadAll();
   istream.Close();
   return contents;
}

/**
* Read a local file synchronously and evaluate its contents.
*
* This function only works in WSH.
*
* It returns the result of the eval operation.
*
* @param fpath an absolute or relative local file path.
* @throws SyntaxError or EvalError or any other exception from contents.
* @return The value of evaluating the file contents.
*/
//:NSFUNCTION Object readEvalSync(String fpath)
BU_WshRuntime.readEvalSync = function(fpath) {
  var contents = BU_WshRuntime.readTextFile(fpath);
  return bu_eval(contents);
}



BU_WshRuntime.isPresent = function() {return typeof WScript !== 'undefined'};

//=java } // WshRuntime

