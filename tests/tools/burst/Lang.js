/**
* @file Lang.js
*
* Defines burst.Lang which contains static utility functions, and defines the global function bu_eval.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

/**
* Evaluate the argument in global scope.
* If you just inline a call to native <code>eval</code>, then the evaluated string
* gets your context, including any local variables, and any binding for "this", if
* you are in an object method.
* In contrast, the function bu_eval always runs in global scope.
*
* Note that Moz eval() supports a non-standard second scope parameter that could be used
* to achieve the same thing.
*
* A word about ECMAScript eval(): 
* Until JS1.4, eval is semantically a method on every object, 
* so eval(str) meant this.eval(str).
* Starting in JS1.4, eval is only a top-level function.
* Apparently, Mozilla's deprecated window . eval forces a global context, while IE
* treats window . eval like the global eval keyword.
* Regardless, the string is evaluated in the current context, so unscoped identifiers are
* defined at the global level, but local variables are available, including "this".
* Moz accepts a second scope parameter to eval.
* SpiderMonkey (but not Rhino) exposes a "Script" builtin object. Script(str).exec.
*/
//:GLFUNCTION Object bu_eval(String str)
function bu_eval(str) {return eval(str)}

// useful in inner functions and so on.
var bu_global_this = this;

//=java package burst;
/**
* Scoping class containing static functions which provide basic functionality that is not part of the ECMAScript standard, but
* might have been.
* (This differs from fix_ecma.js, which attempts to make
* builtin objects compliant with the standard.)
*/
//:NSBEGIN Lang
burst.Lang = {};

/**
* Generate a unique symbol.
* It is globally unique (a single internal counter is used), so it doesn't much matter 
* what object you may attach it to.
*/
//:NSFUNCTION String gensym()
burst.Lang.gensym_counter_ = 0;
burst.Lang.gensym = function() {return 'bu_gensym' + burst.Lang.gensym_counter_++}



/**
* A Lisp-like cond operator. It takes an Array with an even number of
* elements, which are considered pairs. It returns the first rhs value
* whose lhs is true.
* Note that it doesn't invoke or eval anything.
* @param condarray array of alternating boolean expressions and corresponding values.
* @return Returns null if nothing is true.
*/
//:NSFUNCTION Object cond(Array condarray)
burst.Lang.cond = function(condarray) {
  for(var i=0;i<condarray.length;++i) {
    if(condarray[i]) return condarray[i+1];
    ++i;
  }
  return null;
}

/**
* Convert an ECMAScript <var>Arguments</var> into a real Array, so join and other Array methods will work.
*/
//:NSFUNCTION Array argumentsToArray(Arguments args)
burst.Lang.argumentsToArray = function(args) {
  return burst.Alg.copy(args);
}

/**
* Convenience which converts Arguments to an Array and calls join, all in one step. 
*/
//:NSFUNCTION String argumentsJoin(Arguments args, String sep)
burst.Lang.argumentsJoin = function(args, sep) {
  return burst.Lang.argumentsToArray(args).join(sep);
}

/** return an Array of the keys in the associative array (using "for in") */
//:NSFUNCTION Array keys(Object o)
burst.Lang.keys = function bu_keys(o) {
  var a = [];
  for(k in o) {a.push(k)}
  return a;
}

/**
* true if and only if v is not null and not undefined
*/
//:NSFUNCTION Boolean isSpecified(Object o)
burst.Lang.isSpecified = function(o) {
   // undefined not legal value til JS1.5
   return typeof o != 'undefined' && o != null;
}

/**
* True if and only if o is an Array.
*/
//:NSFUNCTION Boolean isArray(Object o)
//burst.Lang.isArray = function(o) {return typeof o == 'object' && o.constructor == Array;}

// use bu_builtin_constructor to deal with unreliable o.constructor
burst.Lang.isArray = function(o) {
  return !!o && typeof o == 'object' && bu_builtin_constructor(o) === Array;
}

/**
* True if and only if o is a string primative or a String object.
*/
//:NSFUNCTION Boolean isString(Object o)
burst.Lang.isString = function(o) {
  return (typeof s == 'string' || (typeof s == 'object' && bu_builtin_constructor(s) === String));
}

/**
* True if and only if o is not an object (such as string or function), or is an object
* but is a builtin object (such as Array or RegExp).
*/
//:NSFUNCTION Boolean isPrimitive(Object o)
burst.Lang.isPrimitive = function(o) {
  if (o == null) return true;
  switch(typeof o) {
  case 'undefined':
  case 'boolean':
  case 'number':
  case 'string':
  case 'function':
    return true;
  case 'object':
    switch(bu_builtin_constructor(o)) {
    case Array: case RegExp: case Date: case String: return true;
      default: return false;
    }
  default:
    return bu_throw("what is: " + o);
  }
}



burst.Lang.KEYWORDS = "break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof";
burst.Lang.RESERVEDS = "abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public";

/**
* Whether the string s is an ECMAScript keyword (such as 'else').
*/
//:NSFUNCTION Boolean isKeyword(String s)
burst.Lang.isKeyword = function(s) {
  if (typeof burst.Lang.KEYWORD_SET == 'undefined') burst.Lang.KEYWORD_SET = burst.Alg.toSet(burst.Lang.KEYWORDS.split(' '));
  return bu_in(s, burst.Lang.KEYWORD_SET);
}

/**
* Whether the string s is an ECMAScript reserved word (such as 'volatile').
*/
//:NSFUNCTION Boolean isReserved(String s)
burst.Lang.isReserved = function(s) {
  if (typeof burst.Lang.RESERVED_SET == 'undefined') burst.Lang.RESERVED_SET = burst.Alg.toSet(burst.Lang.RESERVEDS.split(' '));
  return bu_in(s, burst.Lang.RESERVED_SET);
}


/**
* Whether the string s is a legal ECMAScript identifier.
* @todo Are non-reserved words such as NaN, Infinity, window, eval, String legal identifiers? Can they be used as object initializer keys? 
*/
//:NSFUNCTION Boolean isLegalIdentifier(String s)
burst.Lang.isLegalIdentifier = function(s) {
  if (!s) return false;
  if (burst.Lang.isReserved(s) || burst.Lang.isKeyword(s)) return false;
  return s.match(/^[a-zA-Z0-9_\$]+$/); // same as /^[\w\$]$/
}

/*
* In Opera (tested 7.03), sometimes builtin object (Array, Date, RegExp) have
*    o.constructor.toString() is "function Array() {[native code]}"
* but
     o.constructor != Array
* (and of course o.constructor !== Array).
*
* In Moz and IE, Object.constructor works and returns something which is always identity-equal.
*
* A simple test like [].constructor === Array passes in Opera. I don't have a conclusive test.
*/
/*
function bu_test_ctor() {
  var s2 = "[1, 2, 3]";
  var es2 = eval(s2);
  bu_alert('uneval of: ' + es2 + 
       ' typeof=' + (typeof es2) + 
       ' es2.constructor=' + es2.constructor + 
       ' es2.constructor===Array ' + (es2.constructor===Array));

  bu_alert("regexp constructor: " + bu_builtin_constructor_parse(/a/));

  var a ='[1,2,3]';
  var ae = eval(a);
  bu_alert("[].constructor: " + ([].constructor === Array));
  bu_alert("eval('[]').constructor: " + (eval('[]').constructor === Array));
  bu_alert("ae.constructor: " + (ae.constructor === Array));

  return es2.constructor===Array;
}
*/

// set to true when you want to enable some debug output
var BU_DBG_CTOR = false;

// determine the constructor by checking for method names
function bu_builtin_constructor_signature(o) {
  if (BU_DBG_CTOR) alert("(burst.Lang.js) in bu_builtin_constructor_signature on " + o);
  // we might have got lucky
  switch(o.constructor) {
  case Array: return Array;
  case RegExp: return RegExp;
  case Date: return Date;
  }
  if (typeof o.push != 'undefined' && typeof o.concat != 'undefined') return Array;
  if (typeof o.exec != 'undefined' && typeof o.test != 'undefined') return RegExp;
  if (typeof o.getHours != 'undefined') return Date;
  if (BU_DBG_CTOR) alert("(burst.Lang.js) object seems not to be a primitive builtin: " + o + " typeof o=" + (typeof o) + "\no.constructor=" + o.constructor);
  return o.constructor;
}

// determine the constructor by parsing o.constructor.toString()
// this requires that the function name be there.
function bu_builtin_constructor_parse(o) {
   var m = o.constructor.toString().match(/function (\w+)/);
   if (!m) throw Error("(burst.Lang.js) object constructor could not be parsed: " + o.constructor.toString());
   var ctor_name = m[1];
   //bu_debug("parsed constructor as '" + ctor_name + "'");
   var ctor;
   var is_prim = true;
   switch(ctor_name) {
   case 'Array':  ctor = Array; break;
   case 'RegExp': ctor = RegExp; break;
   case 'Date':   ctor = Date; break;
   default:       ctor = o.constructor; is_prim = false; break;
   }
   if (o.constructor !== ctor)
     bu_debug("object with parsed constructor '", ctor_name, "' but o.constructor is not. o: ", 
        o, " o.constructor: ", o.constructor);
   return ctor;
}

function bu_choose_builtin_constructor() {
  if (bu_UA.bug_builtin_constructor_unreliable()) {
    bu_debug("(burst.Lang.js) Object.constructor is not reliable for builtins");
    //return bu_builtin_constructor_parse;
    return bu_builtin_constructor_signature;
  }
  else {
    bu_debug("Object.constructor is reliable for builtins");
    return function(o) {return o.constructor};
  }
}

function bu_builtin_constructor(o) {
  bu_builtin_constructor = bu_choose_builtin_constructor();
  return bu_builtin_constructor(o);
}


/**
* Produce a string which when eval'd should produce the same object.
*
* Note that this does not retain any properties associated with a
* String, Function, or Array (as if they were a normal Object).
*
* This has no protectection against self-referential objects, and
* no support for repeated objects.
*
* Note that NS4.6 and above has Object.toSource() which does roughly
* the same thing, but that is not part of ECMAScript 262-3
*/
//:NSFUNCTION String uneval(Object o)

// TODO: need to protect against recursive data structures and repeated objects.
// Since there is
// no object identity function in ECMAScript (just ===), there would need to
// be an array of already-serialized objects passed as a second arg.
// See http://groups.google.com/groups?selm=3C353024.3000509%40meer.net
// where Brendan Eich posts about Moz nonstandard CL-style "sharp" syntax.
// An alternative might be to serialize by defining an anonymous function and calling it, like:
//   function(){var n1 = 'repeated'; return[n1, n1];}()

burst.Lang.uneval = function(o) {
  var s = bu_Lang_uneval_Object(o);
  // for top-level eval, can't have surrounding {} because that is ambiguous between
  // object initializer and program clause.
  if (s && 
      (typeof s == 'string' || (typeof s == 'object' && bu_builtin_constructor(s) === String))
      && s.length>0 && s.charAt(0)=="{") return '(' + s + ')';
  return s;
}


// recursive
function bu_Lang_uneval_Object(o) {
  //if (o && o.toSource()) return o.toSource();

  // typeof null is 'object', sigh
  if (o == null) return 'null';

  switch(typeof o) {
  // note that IE5.0 doesn't have undefined
  case 'undefined': return 'undefined';
  case 'boolean':   return o; //.toString();
  case 'number':    if (isNaN(o)) return 'Number.NaN';
	// Number.MAX_VALUE,MIN_VALUE,NEGATIVE_INFINITY,POSITIVE_INFINITY
 	            return o;
  case 'string':    return burst.Text.quote(o, true, false);
  case 'function':  return o.toString();
  case 'object': {
     var o_ctor = bu_builtin_constructor(o);
     // remember that switch does strict equality (===)
      switch(o_ctor) {
       case Array:   {if (BU_DBG_CTOR) alert("(burst.Lang.js) treating as array"); return bu_Lang_uneval_Array(o);}
       case RegExp:  {return bu_Lang_uneval_regexp(o);}
       case Date:    {return 'new Date(' + o.valueOf() + ')';}
       case String:  {return burst.Text.quote(o, true, false);}
     }
     if (BU_DBG_CTOR) alert("(burst.Lang.js) about to treat object as a map; o=" + o + " o.push=" + o.push + " o.constructor=" + o.constructor);
     return bu_Lang_uneval_map(o);
  }

  default:
     throw('uneval got unknown object: ' + o);
     //return "" + o;
  }
}

/*
* Ecma requires that RegExp.toString() be a suitable argument to the RegExp
* constructor, but it need not have any surrounding '/'.
* /ab\sc/.toString() is '/ab\\sc/' for: JS1.5
* /ab\sc/.toString() is 'ab\\sc' for:
*/

var bu_Lang_uneval_regexp;
switch(/ab\sc/.toString()) {
  case 'ab\\sc': 
    bu_Lang_uneval_regexp = function(re) {return '/' + re.toString() + '/'};
    bu_debug("(burst.Lang.js) RegExp.toString() requires slashes");
    break;
  case '/ab\\sc/':
    bu_Lang_uneval_regexp = function(re) {return re.toString()};
    bu_debug("(burst.Lang.js) RegExp.toString() requires no slashes");
    break;
  default:
    throw Error("(burst.Lang.js) unexpected RegExp.toString() behavior: " + /ab\sc/.toString() + ' (' + /ab\sc/.toString().length + ' chars)');
}

function bu_Lang_uneval_Array(a) {
  return '[' + burst.Alg.transform(a, bu_Lang_uneval_Object).join(', ') + ']';
}

function bu_Lang_uneval_map(m) {
  // note this quotes keys if necessary
  return '{' + burst.Alg.transform_map(m, function(k,v) {return burst.Text.quote(k,true,true) + ': ' + bu_Lang_uneval_Object(v)}).join(', ') + '}';
}

/**
* Produce a String which when eval'd will call the function func with no arguments.
* This is useful for creating strings that may be set in DOM attributes for event handlers,
* when the circumstances don't allow for a Function value.
* You can prepend the the result with 'parent.' if for example the expression is to be used
* in a child popup or frame.
* @param func The Function to call.
* @param scopeobj Optional. Defaults to window (or the global object).
* @param symname Optional. Defaults to burst.Lang.gensym().
*/
//:NSFUNCTION String unevalFunctionCall(Function func, Object scopeobj, String symname)
burst.Lang.unevalFunctionCall = function(func, scopeobj, symname) {
  if (!scopeobj) scopeobj = bu_global_this;
  if (!symname) symname = burst.Lang.gensym();
  scopeobj[symname] = func;
  return symname + '()';
}



/*
// to find an anonymous function name which is a method of some object
// From Richard Cornford at http://groups.google.com/groups?selm=ao32t5%24kk6%241%248302bc10%40news.demon.co.uk
burst.Lang.functionNameIn = function(obj, func) {
  for(var k in obj) {if (obj[k] === func) return k;}
  return;
}
*/

/**
* Determine a function's name (returning 'anonymous' if none).
* This is implemented by parsing the Function.toString() result, which
* is not standardized in ECMAScript, so this may not work.
*/
//:NSFUNCTION String functionName(Function func)
burst.Lang.functionName = function bu_Lang_functionName(func) {
  //if (!func) bu_throw("no func");
  if (func.name) return func.name;
  var matches = func.toString().match(/function (\w+)/);
  var s = matches ? matches[1] : null;
  return (s == null || s.length == 0) ? 'anonymous' : s;
}

/**
* Return an Array of String declared argument names.
* This is implemented by parsing the Function.toString() result, which
* is not standardized in ECMAScript, so this may not work.
*/
//:NSFUNCTION Array functionArgumentNames(Function func)
burst.Lang.functionArgumentNames = function bu_Lang_functionArgumentNames(func) {
  var matches = func.toString().match(/function [^\{]*\(([^\{]*)\)/);
  var s = matches ? matches[1] : null;
  if (s == null || s.length == 0) return new Array();
  return s.split(/, ?/);
}

/**
* Return the function's body as a String.
* Does not include the surrounding {}.
*
* This is implemented by parsing the Function.toString() result, which
* is not standardized in ECMAScript, so this may not work.
*
* Note that this might not match the actual original body. 
* For example, IE seems to add any missing trailing semi-colon.
*/
//:NSFUNCTION String functionBody(Function func)
burst.Lang.functionBody = function bu_Lang_functionBody(func) {
  /*
   * Sigh, ECMAScript RegExp has 'm' flag but not 's'.
   * At least in IE6, this doesn't work:
   *     /\{([.\s]*)\}/
   * Actually, in IE6 /\{([.]*)\}/ doesn't even match the '{a}'.
   * However, these do seem to work:
   *    /\{((.|\n|\r)*)\}/
   *    /\{([\s\S]*)\}/
   */
  var matches = func.toString().match(/\{([\s\S]*)\}/);
  var s = matches ? matches[1] : null;
  if (!s) bu_warn("(burst.Lang.js) could not find function body for '" + func.toString() + "'");
  else s = burst.Text.trim(s);
  return s;
}


/*
In ECMAScript 262-3, all that is available is arguments.callee, which is
not sufficient to produce a stack trace.

As far as what Netscape and Microsoft actually have made available:
- JavaScript 1.1 has Arguments.caller, has Function.caller
- JavaScript 1.2 has Arguments.callee, deprecates Function.caller
- JavaScript 1.3 deprecates Arguments.caller
- JavaScript 1.4 deprecates Function.arguments
- JavaScript 1.5 eliminates Arguments.caller
- JScript 2.0 has Function.caller
- JScript 5.5 has Arguments.callee, has Arguments.caller

Note that Function.caller and Arguments.caller differ:
- Function.caller returns the Function object of the caller.
- Arguments.caller returns the Arguments object of the caller.

Also, Mozilla's Error object has a String "stack" member.
So one approach to getting a stack trace would be to throw and catch an Error.

Some runtimes also provide access to local variables of callers,
I believe by doing a "for var in arguments", excluding formal arguments.
*/

/*
* Get Function.arguments for the provided function. This is deprecated
* in ECMAScript and may not be supported in all environments, but it is
* needed to implement stack traces which include argument values.
*
* Where possible, strict warnings are turned off and restored afterwards,
* to avoid messages like "strict warning: deprecated arguments usage"
*/
function bu_function_arguments(func) {
  return burst.Lang.callNoStrict(function() {return func.arguments});
}

/**
* Format a single stack frame, as given by a Function object.
* The format is: "funcname(argname1: argv1, argname2: argv2)"
* The greater of actual and declared arguments are given.
*
* This relies on <code>burst.Lang.uneval</code> to display argument values.
*
* This relies on Function.arguments, which is deprecated.
*/
//:NSFUNCTION String formatStackFrame(Function func)
burst.Lang.formatStackFrame = function bu_Lang_formatStackFrame(func) {
  var funcname = burst.Lang.functionName(func);
  var argnames = burst.Lang.functionArgumentNames(func);

  var argvalues = bu_function_arguments(func);

  //print("formatStackFrame funcname=" + funcname);
  var parts = [funcname, '('];
  for(var i=0;i<Math.max(argnames.length,argvalues.length);++i) {
    if(i>0) parts.push(', ');

    var argname = i<argnames.length ? argnames[i] : null;

    var argval = i<argvalues.length ? argvalues[i] : null;

    // only uneval primitives
    // OR: if function name is 'apply' or 'call' do not dump the whole first argument
    //   var skip_uneval = (i == 0 && (funcname == 'apply' || funcname == 'call'));

    var do_uneval = burst.Lang.isPrimitive(argval);
    //print("argname=" + argname + " do_uneval=" + do_uneval);
    if (do_uneval) argval = burst.Lang.uneval(argval);
    //print("uneval(argval)=" + argval);
    if (argname) {parts.push(argname); parts.push(': '); parts.push(argval);}
    else {parts.push(argval);}
  }
  parts.push(')');
  return parts.join('');
}

/**
* Return the Function object for the caller of the provided Function object,
* which must be somewhere in the current stack.
* Returns null if called at top-level.
*
* This will rely either on Function.caller or on Arguments.caller,
* neither of which is required to exist by standard ECMAScript.
* If neither is available, it just returns undefined.
*
* <pre>
* IE: has both.
* IE5Mac: has both.
* Mozilla: has Function.caller, not Arguments.caller. Error has a .stack member.
* Opera: has neither. Some native errors have a stack trace in the message. 
* KHTML: has neither.
* </pre>
*
* Opera has neither Function.caller nor Arguments.caller.
* A possible workaround for Opera might be based on the fact that exceptions
* thrown by the interpreter (but not from an explicit "throw") have a message string with
* a substring starting with 'Backtrace:'. This differs from Mozilla's Error.stack,
* which is a distinct object member (not part of message), and is available
* for user exceptions.
*/
//:NSFUNCTION Function functionCaller(Function f)
burst.Lang.functionCaller = bu_Lang_callerImpl();
//burst.Lang.functionCaller = bu_functionCaller;

// alternatively, could do this
function bu_functionCaller(func) {
  return func.caller || (func.arguments && func.arguments.caller); 
}


/*
* A utility function which is called once to return a Function which
* is used thereafter to find the Function object of the caller.
* If neither Arguments.caller nor Function.caller is available in the environment,
* it returns a function that just returns undefined.
*/
function bu_Lang_callerImpl() {
  // call myself if necessary so there is at least one caller
  if (arguments.length == 0) return bu_Lang_callerImpl(bu_Lang_callerImpl);

  // [Function].caller is a Function object 
  if (bu_Lang_callerImpl.caller) {
    bu_debug('(burst.Lang.js) can find caller via Function.caller');
    //bu_alert('(burst.Lang.js) can find caller via Function.caller');
    return function(f) {
      if (f.caller) {
        //bu_alert("(burst.Lang.js) returning function caller " + f.caller); 
        return f.caller;
      }
      else {
        //bu_alert("(burst.Lang.js) no function caller for f " + f); 
	return BU_UNDEFINED;
      }
    }
  }

  // arguments.caller is an Arguments object, so we call get its callee member
  if (bu_Lang_callerImpl.arguments && bu_Lang_callerImpl.arguments.caller) {
    bu_debug('(burst.Lang.js) can find caller via Arguments.caller');
    //bu_alert('(burst.Lang.js) can find caller via Arguments.caller');
    return function(f) {
       if (f.arguments && f.arguments.caller) {
          //bu_alert("(burst.Lang.js) returning f.arguments.caller.callee " + f.arguments.caller.callee); 
          return f.arguments.caller.callee;
       }
       else {
          //bu_alert("(burst.Lang.js) returning f.arguments.caller is null for f " + f); 
	  return BU_UNDEFINED;
       }
    };
  }

/*
  var exc;
  //try{throw new TypeError("test error")}
  try{eval('undefined()')}
  catch(e) {exc = e;}
  var mems = []; for (var k in exc) mems.push(k);
  //bu_alert("(burst.Lang.js) No caller implementation. FYI, the Error object has members: " + mems.join(',') + "\nexample: " + exc);
*/
  bu_warn("(burst.Lang.js) neither Function.caller nor Arguments.caller appear to be available");
  return function(f) {return BU_UNDEFINED;};
}

/**
* A recursive utility which accumulates the result of calling the function <var>op</var> on
* each of the stack frames above us, skipping the initial skip frames.
* If <var>op</var> is not specified, it just accumulates the Function objects themselves.
*
* @param skip Number of frames to skip, default 0 (which excludes this function too).
* @param op Optional 
*/
//:NSFUNCTION Array getCallers(Number skip, Function op)

function bu_Lang_getCallers(skip, op) {
  if (!skip) skip = 0;
  var func_refs = new Array();
  var func_results = op ? new Array() : null;
  for(var i=0, func = burst.Lang.functionCaller(bu_Lang_getCallers);
	func != null; 
	func = burst.Lang.functionCaller(func), ++i) {
    if (i<skip) continue;
    // detect recursion, even if it is not direct recursion, by looking at all prior functions
    //     to just check immediate caller: if (func === burst.Lang.functionCaller(func))
    var already = burst.Alg.find_value(func_refs, func);
    if (op) {
      func_results.push(op(func));
    }
    func_refs.push(func);
    if (already) {
      break;
    }
//print('   getCallers i=' + i + ' func=' + func);
  }
  return op ? func_results : func_refs;
}

burst.Lang.getCallers = bu_Lang_getCallers;

/**
* Utility which calls burst.Lang.getCallers to accumulate just the function names into an Array.
*/
//:NSFUNCTION Array getCallerNames(Number skip)
burst.Lang.getCallerNames = function(skip) {
  if (!skip) skip = 0;
  //return burst.Alg.transform(burst.Lang.getCallers(skip+1), burst.Lang.functionName);
  return bu_Lang_getCallers(skip+1, burst.Lang.functionName);
}

/**
* Get the function name skip levels up the stack.
*/
//:NSFUNCTION String getCallerName(Number skip)
burst.Lang.getCallerName = function(skip) {
  var names = burst.Lang.getCallerNames(skip+1);
//print("got caller names: " + names);
  return names.length > 0 ? names[0] : null;
}

/**
* Utility which calls burst.Lang.getCallers to accumulate the <var>arguments</var> variable at each level.
* It converts each <var>arguments</var> to an Array.
* It therefore returns an Array of Arrays.
*/
//:NSFUNCTION Array getCallerArguments(Number skip)
burst.Lang.getCallerArguments = function(skip) {
  if (!skip) skip = 0;
  return bu_Lang_getCallers(skip+1, function(f) {return burst.Lang.argumentsToArray(bu_function_arguments(f));});
  //return bu_Lang_getCallers(skip+1, function(f) {return f.this;});
}


/**
* Return stack trace as a EOL-separated String. 
* Formatting of each line is done by burst.Lang.formatStackFrame.
*
* Note that Moz Error objects have a .stack member variable.
* And JScript dotnet Exception.StackTrace()
* @param skip Number of stack frames to skip, default 0 (which still excludes getStackTrace itself).
*/
//:NSFUNCTION String getStackTrace(Number skip)
burst.Lang.getStackTrace = function(skip) {
  if (!skip) skip = 0;
  var frames = bu_Lang_getCallers(skip+1, burst.Lang.formatStackFrame);
  return frames.join("\n");
}


burst.Lang.wait = function(check_func, true_func, timeout_func, period_millis, max_millis) {
    var count = 0;
    var checker = function() {
	count++;
	if (check_func()) {
	    if (true_func) true_func();
	}
	else {
	    max_millis -= period_millis;
	    if (max_millis < 0) {
		if (timeout_func) timeout_func();
		else throw Error("timed out after " + max_millis + " millis waiting and " + count + " attempts");
	    }
	    else {
		window.setTimeout(checker, period_millis);
	    }
	}
    };
    window.setTimeout(checker, period_millis);
}

/*
Set the "strict warnings" value of the interpreter to on or off, and returns
a function to call to restore it to the previous value.

If not supported, does nothing and returns a do nothing function.

For now, this is only supported in the SpiderMonkey shell.
In that case, it uses the global function options().

Apparently there is a global _options buried in Mozilla:
http://groups.google.com/groups?selm=3E8B49C8.3060904%40meer.net
There is <code>_options.strict</code> and <code>_options.werror</code> .
These correspond to "-s" and "-w" options to a shell.
But note that for full effect the setting has to be executed in a previous compilation unit,
prior to the next compilation unit's compile phase.

In Mozilla, the functions PrefConfig.pref() and PrefConfig.user_pref()
are available to the user in prefs.js, but they seem unavailable in a normal page,
presumably for security reasons.
See http://lxr.mozilla.org/seamonkey/source/modules/libpref/src/prefapi.cpp
for the Mozilla implementation of PrefConfig.

Also see the "about:config" url in Mozilla.

@todo find out if there is any way to get access to PrefConfig in Mozilla

Note that JScript .NET has "@set":
<pre>
   @set @debug(on)
   ...
   @set @debug(off) 
</pre>

*/
function bu_set_strict(is_strict) {
  // SpiderMonkey
  if (typeof options != 'undefined' && options().indexOf('strict') != -1) {
     var orig_options = options(is_strict ? 'strict' : '');
     return function() {options(orig_options)};
  }
  // Mozilla
  else if (typeof _options != 'undefined') {
     var orig = _options.strict;
     _options.strict = is_strict;
     _options.werror = is_strict;
     return function() {_options.strict = orig; _options.werror = orig;};
  }
  else if (typeof user_pref != 'undefined') {
     var orig_val = user_pref("javascript.options.strict");
     user_pref("javascript.options.strict", is_strict ? true : false);
     return function() {user_pref("javascript.options.strict", orig_val)};
  }
  return function() {};
}

/**
Call the provided function with strict warnings turned off.
If that isn't possible, just calls the function.
Returns the result of the function.
*/
//:NSFUNCTION Object callNoStrict(Function func)
burst.Lang.callNoStrict = function(func) {
  var restore = bu_set_strict(false);
  try {return func();}
  catch (e) {throw e;}
  finally {restore();}
}



/**
Enable universal file reading on Mozilla.

@todo In a Mozilla browser, will this always cause a popup confirmation?

<h3>Browser Security</h3>

So far this library has little support related to security APIs.

Here is a brief introduction to the builtin security constraints in IE and Mozilla:

Mozilla calls their rule the "same origin policy", while Microsoft calls theirs "cross-frame security".
On paper, they are the same.

The rule requires the same protocol (http and https differ), the same host (a.foo.com and b.foo.com differ),
and the same port (80 and 8000 differ).
Two documents can be from different hosts within the same top-level domain if
the <code>document.domain</code> is set to be the same. See:
- http://www.dardenhome.com/js/x362952.htm
- http://www.mozilla.org/projects/security/components/same-origin.html
- http://msdn.microsoft.com/workshop/author/om/xframe_scripting_security.asp
- http://msdn.microsoft.com/workshop/author/dhtml/sec_dhtml.asp

Generally, DomDocument and HttpRequest objects are subject
to the restrictions as the browser generally.
However, versions of both the IE XMLHTTP and the Mozilla XMLHttpRequest objects have been
show to be vulnerable to an exploit in which the initial url response is a redirect to a known local file:
- Mozilla: http://security.greymagic.com/adv/gm001-ns/
- IE: http://www.xs4all.nl/~jkuperus/bug.htm

Script signing is a bit of a morass:
- http://www.visi.com/~hoju/mozilla/signed/linkstatuscheck.html

Netscape has an API which relies on Java to ask for greater privilege:
- http://www.dardenhome.com/js/x656605.htm
- http://www.mozilla.org/xmlextras/
<pre>
  netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
</pre>
It is apparently necessary to do this for example if you want to issue an "http:" request when
the current document has a "file:" location.
*/

//:NSFUNCTION void securityEnableRead_moz()
burst.Lang.securityEnableRead_moz = function bu_moz_enable() {
  try {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
  } catch (e) {
    alert(e);
  }
}



/**
* A utility for creating an ActiveXObject when the correct ProgID for the
* environment is not known.
*
* if progid_obj[progid_key] is an Array, it iterates through, attempting
* <code>new ActiveXObject(progid)</code> on each, until successful.
* Then it goes back and sets the value so that next time it doesn't
* have to rediscover the correct one.
* Lastly, it returns the created object.
*
* @param progid_obj The object that has the member with name progid_key
* @param progid_key The key to lookup the progid list (or value)
* @param what Used in any error messages.
* @throws BurstError If no progid in the list succeeds.
* @throws (unknown) Whatever <code>new ActiveXObject(id)</code> might do.
* @return The created object
*/
//:NSFUNCTION Object createActiveXObject(Object progid_obj, String progid_key, String what)
burst.Lang.createActiveXObject = function bu_create_activex(progid_obj, progid_key, what) {
  var xobj;
  var progid = progid_obj[progid_key];
  if (typeof progid == 'string') {
    xobj = new ActiveXObject(progid);
  }
  else {
    var progids = progid;
    for(var i=0;i<progids.length;++i) {
      progid = progids[i];
      var threw = false;
      try{xobj = new ActiveXObject(progid);}
      catch(e) {
        threw = true;
        bu_debug("failed to create a '" + what + "' with ProgID '" + progid + "': " + e.message);
      }
      if (xobj) {
        progid_obj[progid_key] = progid;
        break;
      }
      else {
        if (!threw) bu_debug("failed to create a '" + what + "' with ProgID '" + progid + "'");
      }
    }
    if(!xobj) bu_throw("could not create a " + what + " using any of these ProgIDs: " + progids);
  }
  return xobj;
}

//:NSEND

bu_loaded('burst.Lang', ['burst.Alg', 'burst.Text', 'burst.web.UserAgent']);
