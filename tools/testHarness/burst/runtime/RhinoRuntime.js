/**
* @file RhinoRuntime.js
*
* Defines burst.runtime.RhinoRuntime, a subclass of burst.runtime.AbstractRuntime for Rhino (shell) environment.
*/

//=java package burst.runtime;



/**
* Singleton subclass of AbstractRuntime for Rhino
*/
//=java public class RhinoRuntime extends AbstractRuntime {

//=java public RhinoRuntime() {}
var BU_RhinoRuntime = function() {
  this.name = function() {return 'Rhino'};

  this.version = function() {return version()};

  // These initial attempts failed:
  //   1. get an EcmaError and look at e.getSourceName(): try {eval ("static in return")} catch(e) { ...
  //   Won't work because NativeGlobal.java only does a put of "name" and "message", not a wrapped reflecting object.
  //   Even if the EcmaError object had the sourceName set.
  //  
  //   2. var e = Packages.org.mozilla.javascript.Context.getCurrentContext().reportError('');
  //   Won't work because it goes directly to the errorReporter, not the return value.
  //   We want context.interpreterSourceFile and context.interpreterLine, which are used in static Context.getSourcePositionFromStack
  //   (set by Interpreter.java at interpretation time, if in interpreter mode).
  //
  //   3. var e = Packages.org.mozilla.javascript.Context.getCurrentContext().reportRuntimeError('');
  //   This returns an object, but e.message still does not have source info.
  //   In compiler mode, perhaps not set; in interpreter mode, perhaps not used by errorReporter?
  //
  // What we found works is to do basically the same hack as is done in getSourcePositionFromStack,
  // making a new java.lang.Exception() and then calling printStackTrace on a string stream.
  // We have to parse the string for the .js files (different from the java files).
  // This only works however in compiled mode (-opt 0 or higher).
  // In interpreter mode, entire stack is java.
  // When compiled, printStackTrace is like:
  // java.lang.Exception
  //	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
  //	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:39)
  //	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:27)
  //	at java.lang.reflect.Constructor.newInstance(Constructor.java:274)
  //	at org.mozilla.javascript.NativeJavaClass.constructSpecific(NativeJavaClass.java:228)
  //	at org.mozilla.javascript.NativeJavaClass.construct(NativeJavaClass.java:185)
  //	at org.mozilla.javascript.ScriptRuntime.newObject(ScriptRuntime.java:1269)
  //	at org.mozilla.javascript.gen.c2.call(/Users/mda/Sites/burstproject/testrhino.js:27)
  //    ...
  //	at org.mozilla.javascript.tools.shell.Main.main(Main.java:76)
  //
  // Note may get different answers based on:
  //    Context.setOptimizationLevel(-1)
  //    Context.setGeneratingDebug(true)
  //    Context.setGeneratingSource(true) 
  //
  // Some somewhat helpful posts:
  //    http://groups.google.com/groups?hl=en&lr=&ie=UTF-8&oe=UTF-8&safe=off&selm=9v9n0g%246gr1%40ripley.netscape.com
  //    http://groups.google.com/groups?hl=en&lr=&ie=UTF-8&oe=UTF-8&safe=off&selm=3BAA2DC4.6010702%40atg.com
  //
  // Note that Rhino1.5R5 added source name information in some exceptions.
  // But this seems not to help in command-line Rhino, because Context.java has an error reporter
  // so no EvaluationException is thrown.
  //this.getCurrentScriptURI = bu_rhino_current_script_via_eval_exception;
  this.getCurrentScriptURI = bu_rhino_current_script_via_java;

  this.println = function(line) {print(line)};

  this.exit = function(exitcode) {quit(exitcode)};
};
burst.runtime.RhinoRuntime = BU_RhinoRuntime;
bu_inherits(BU_RhinoRuntime, BU_AbstractRuntime);


// by using new support in native exception for getSourceName
function bu_rhino_current_script_via_eval_exception() {
    var exc;
    // 'ReferenceError: "undefinedsymbol" is not defined.'
    try {eval ("undefinedsymbol()") } catch(e) {exc = e;}
    // 'Error: whatever'
    // try{throw Error("whatever");} catch(e) {exc = e;}
    // 'SyntaxError: identifier is a reserved word'
    // try {eval ("static in return")} catch(e) { exc = e; }
    print("got exception: '" + exc + "'");
    print("exc.stack=" + (typeof exc.stack));
    var sn = exc.getSourceName();
    print("SourceName=" + sn);
    return sn;
} 

// do it by using java java.lang.Exception
function bu_rhino_current_script_via_java() {
	 var optLevel = Packages.org.mozilla.javascript.Context.getCurrentContext().getOptimizationLevel();  
	 if (optLevel == -1) bu_unimplemented("getCurrentScriptURI (determine current script path for rhino when interpreter mode)")
	 var caw = new java.io.CharArrayWriter();
	 var pw = new java.io.PrintWriter(caw);
	 var exc = new java.lang.Exception();
	 exc.printStackTrace(pw);
	 var s = caw.toString();
	 // we have to exclude the ones with or without line numbers because they put double entries in:
//	at org.mozilla.javascript.gen.c3._c4(/Users/mda/Sites/burstproject/burst/Runtime.js:56)
//	at org.mozilla.javascript.gen.c3.call(/Users/mda/Sites/burstproject/burst/Runtime.js)
	 var matches = s.match(/[^\(]*\.js\)/gi);
	 if (!matches) throw Error("cannot parse printStackTrace output: " + s);
	 // matches[0] is entire string, matches[1] is this function, matches[2] is getBaseURI, so matches[3] is what we want.
	 var fname = matches[3];
         //print("got fname '" + fname + "' from stack string '" + s + "'");
	 if (!fname) throw Error("could not find js file in printStackTrace output: " + s);
	 //print("Rhino getCurrentScriptURI returning '" + fname + "' from: " + s); 
	 return fname;
  };


/** Same as burst.SpiderMonkeyRuntime.readEvalSync */
//:NSFUNCTION void readEvalSync(String fpath)
BU_RhinoRuntime.prototype.readEvalSync = BU_SpiderMonkeyRuntime.prototype.readEvalSync;

BU_RhinoRuntime.isPresent = function() {return typeof loadClass != 'undefined'};

//=java } // class RhinoRuntime


