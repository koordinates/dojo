/**
* @file MOP.js
*
* Defines burst.MOP which contains static utility functions related to a MetaObject Protocol.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst;
/**
Scoping class to hold various pieces of a MetaObject Protocol for ECMAScript.

The term "MetaObject Protocol" (MOP) originates with Gregor Kiczales's work in
implementing CLOS, the object system in Common Lisp.
See for example http://www.elwoodcorp.com/alu/mop/contents.html

Briefly, a MOP provides programmatic access to a programming language's implementation
of such things as classes, methods, initialization, and so on, both at declaration
and execution time.

Such access enables an application programmer to customize or add semantics in
cases where the base programming language either does not have the ability, or
it doesn't fit the needs of the programmer.

Using a MOP, it is possible to implement functionality such as:
- multiple inheritance
- alternative function implementation chaining, such as cascading to parent
- optional/mandatory arguments
- named function arguments
- singleton enforcement
- instance tracking
- closed classes
- "protected" or other visibility constraints
- computed, default, or readonly properties
- pre and post conditions
- method wrapping
- publish-subscribe (aka "Observer pattern" aka "signals and slots" ...)
- output parameters
- lazy calculation
- logging and tracing
- record/playback
- deep or shallow copy
- serialization
- and many others.

For more information, see his book, "The Art of the Metaobject Protocol".
Currently Kiczales is occupied with dumbing down the concept of the MOP into 
"Aspect Oriented Programming" (AOP) and "Separation of Concerns" (SOC) so that it
is accessible to unwashed Java programmers.

This is by no means a full MOP for ECMAScript, for reasons of time, need,
and inadequacies in the base language that would make it prohibitively expensive
at run time.

A key requirement for a programming language to have a useful MOP is <i>reflection</i>,
which has two important parts: <i>introspection</i>, the ability to query about objects
and metaobjects, and <i>intercession</i>, the ability to "hook" or alter their runtime
behavior. ECMAScript has serious limitations in both of these.

For introspection:
<ul>
<li>no reliable way to get all methods of an object
<li>no reliable way to get a function's argument names
<li>no way to find all of a prototype's instances
<li>no way to find all functions whose prototype ("superclass") is a given function
</ul>

For intercession, there is no:
<ul>
<li>hook for unbound method
<li>hook for unbound property
<li>hook for property access (Mozilla does have non-standard getter and setter)
<li>hook for instantiation (usage of <code>new</code>)
</ul>
  
Furthermore, there are inflexibilities in the language:
<ul>
<li>no overloading (let alone generics or multi-dispatch)
<li>no operator definition
<li>no syntax extension (e.g. Lisp reader macros) 
</ul>

Some of these inadequacies may be compensated for easily and efficiently, others cannot.

<h3>See Also</h3>

See also:
 - TIBET
 - inheritance and methods http://www.u.arizona.edu/~jscully/javafication.html

*/

//:NSBEGIN MOP
burst.MOP = {};

/**
* Perform the prototype idiom of connecting a sublcass Function and a superclass Function.
*
* See also many other idioms, for example at http://bclary.com/log/2002/12/08/1.html
*/
//:NSFUNCTION void inherits(Function subclass, Function superclass)
// defined in burst_first.js
burst.MOP.inherits = bu_inherits;

/* not of much value
burst.MOP.defmethod = function (objclass, name, func) {
  objclass.prototype[name] = func;
}

*/

/* we don't extend builtins
Function.prototype.method = function(name, func) {burst.MOP.defmethod(this, name, func);}
Function.prototype.inherits = function(superclass) {burst.MOP.inherits(this,superclass);}
*/

/**
* Assert that a given Function constructor implements the functions in the given interface Function.
* It does this by comparing the prototype objects of the two of them.
* throws if it finds any missing functions.
*/
//:NSFUNCTION void assertImplements(Function objclass, Function iface)
burst.MOP.assertImplements = function(objclass, iface) {
  if(arguments.length!=2 || typeof objclass != 'function' || typeof iface != 'function') throw new Error("bad arguments: [" + objclass + "," + iface + "]");
  if (!objclass.prototype) throw new Error("no prototype in object " + objclass);
  if (!iface.prototype) throw new Error("no prototype in interface " + objclass);
  var found = 0;
  for(var funcname in iface.prototype) {
    if(typeof iface.prototype[funcname] == 'function') {
      switch(typeof objclass.prototype[funcname]) {
       case 'undefined': throw new Error("no implementation for interface function '" + funcname + "'");
       case 'function': found++; break;
       default: throw new Error("implementation not a function for '" + funcname + "': " + objclass.prototype[funcname]);
      }
    } 
    else {
      throw new Error("interface has a member '" + funcname + "' which is not a function: " + iface.prototype[funcname]);
    }
  }
  return found;
}

burst.MOP.condFunction = function(funcname, condarray) {
  var f = burst.Lang.cond(condarray);
  if (!f) throw new Error("No definition for '" + funcname + "' in cond array: " + condarray);
  return f;
}

/**
* Calls the provided constructor and returns the result, if it has never been called before.
*/
//:NSFUNCTION Object singleton(String funcname, Function ctor)
burst.MOP.singletons_ = {};
burst.MOP.singleton = function(funcname, ctor) {
  if (burst.MOP.singletons_[funcname]) throw "Attempt to make multiple instances of " + funcname;
  if (!ctor) ctor = eval(funcname);
  if (typeof ctor != 'function') throw "ctor not a function: " + ctor;
  return burst.MOP.singletons_[funcname] = ctor();
}

burst.MOP.call_cache_ = {};

/**
* Returns a replacement function that proxies for the passed-in one, and ensures
* that the underlying function is only called once for any give set of arguments.
*
* example with a static function: <pre>
* MyMath.cosine = burst.MOP.memoize(MyMath, 'MyMath.cosine', MyMath.cosine);
* </pre>
*
* example with an instance method, with caching just for that instance: <pre>
*    var abook = new AddressBook();
*    abook.lookup = burst.MOP.memoize(abook, 'AddressBook.lookup', abook.prototype.lookup);
* </pre>
*
* @param obj Object which should be used when apply-ing the wrapped function
* @param funcname globally unique name identifying the function
* @param func The wrapped function.
*/
//:NSFUNCTION Function memoize(Object obj, String funcname, Function func) 
burst.MOP.memoize = function(obj, funcname, func) {
  return function() {
     var key = funcname + '|' + burst.Lang.joinArguments(arguments,'|');
     // necessary to be able to cache values that would convert to false
     if (bu_in(key, burst.MOP.call_cache_)) return burst.MOP.call_cache_[key];
     //var already = burst.MOP.call_cache_[key];
     //if (already) return already;
     return burst.MOP.call_cache_[key] = obj.apply(func, arguments);
  }
}

/**
Return a function which will set the actual function implementation the first time it is
called (and then call the real implementation).

@param obj The Object which has the function as a member (could be a prototype). 
@param memname The name of the member function.
@param getfunc A function to call to get the actual function implementation.
*/
//:NSFUNCTION Function lazyChooseMethod(Object obj, String memname, Function getfunc) 
burst.MOP.lazyChooseMethod = function(obj, memname, getfunc) {
  return function() {
    var func = getfunc();
    obj[memname] = func;
    return func.apply(null, arguments);
  };
}

/*
burst.MOP.cacheNew = function(cache, ctor, arg1) {
  var key;
  var nargs = arguments.length;
  if(nargs==1) bu_throw("no args to cache with");
  if(nargs==2) key = arg1;
  else {
    key = '';
    for(var i=1;i<nargs;++i) {s += arguments[i];}
  }
  return (bu_in(key, cache)) ? cache[key] : (cache[key] = ctor.apply(arguments...));
}
*/

/**
* Convenience to memoize a constructor with a single argument.
* If the constructor has been called before with the same argument,
* that previous instance is returned.
* @param cache Any Object to be used as a cache (could be the ctor itself).
* @param ctor The constructor
* @param arg1 The single constructor argument.
*/
//:NSFUNCTION Object memoizeNew1(Object cache, Function ctor, Object arg1)
burst.MOP.memoizeNew1 = function(cache, ctor, arg1) {
  return (bu_in(arg1, cache)) ? cache[arg1] : (cache[arg1] = new ctor(arg1));
}

/**
* Same as memoizeNew1 but for 2 arguments.
*/
//:NSFUNCTION Object memoizeNew1(Object cache, Function ctor, Object arg1, Object arg2)
burst.MOP.memoizeNew2 = function(cache, ctor, arg1, arg2) {
  var key = arg1 + '|' + arg2;
  return (bu_in(key, cache)) ? cache[key] : (cache[key] = new ctor(arg1,arg2));
}

/**
* Simple low-level utility for once-only semantics.
* Works only with functions of no arguments.
*/
//:NSFUNCTION Object onceonly(Object cache, String key, Function func)
burst.MOP.onceonly = function(cache, key, func) {
  return (bu_in(key, cache)) ? cache[key] : (cache[key] = func());
}

/**
* A method combinator which returns a method which calls f then g:
* <code>f.apply(this, arguments); g.apply(this, arguments)</code>
* If f throws an exception, then g is not run.
*/
//:NSFUNCTION Function combineMethods(Function f, Function g)
burst.MOP.combineMethods = function(f,g) {
  return function() {
    f.apply(this, arguments);
    g.apply(this, arguments);
  }
}

/**
* Arrange for method aftermeth to be called whenever the method named <var>methname</var>
* of object obj is called.
*
* If instead of passing in a single instance foo, you pass in foo.prototype, then
* this hooking will apply to all instances.
*
* Naturally, aftermeth must expect the same arguments as methname.
*
* This function uses combineMethods. If the first method throws an exception, aftermeth
* is not called. Furthermore, there is no way to undo this operation. However,
* this implementation is efficient at run time.
* See also addMethodAdvice
*
* @param obj An instance or prototype.
* @param methname The name of the method within obj.
* @param aftermeth The function to apply after calling methname.
* @param must_exist Whether the object must already have such a method (that is, aftermeth would become the sole handler)
*/
//:NSFUNCTION void afterMethod(Object obj, String methname, Function aftermeth, Boolean must_exist)
burst.MOP.afterMethod = function(obj, methname, aftermeth, must_exist) {
  // TODO: does this really work for both the prototype and non-prototype cases?
  if (bu_in(methname, obj)) {
    obj[methname] = burst.MOP.combineMethods(obj[methname], aftermeth);
  }
  else if (must_exist) {
     bu_throw("object does not have a method named '" + methname + "': " + obj);
  }
  else {
    obj[methname] = aftermeth;
  }
}

/**
Add some advice at a method call pointcut.

Note that we are far from a complete AOP implementation, lacking for example:
- pointcuts designators (pointcut name; set of name-based join points; property-based pointcut designator)
- other pointcut types besides method call (whole classes, etc.)
- an "around" advice kind
- "after" advice for exceptions
- precedence control besides first or last
- a "thisJoinPoint" context available to advice
- introductions

* @param obj An instance or prototype.
* @param methname The name of the method within obj.
* @param advice The function with the advice
* @param advice_kind Either 'before' or 'after'
* @param precedence Either 'first' or 'last'. Defaults to last.
* @param meth_must_exist Whether the object must already have such a method (otherwise a do-nothing function is created for it)
*/
//:NSFUNCTION void addMethodAdvice(Object obj, String methname, Function advice, String advice_kind, String precedence, Boolean meth_must_exist)
burst.MOP.addMethodAdvice = function(obj, methname, advice, advice_kind, precedence, meth_must_exist) {
  if (arguments.length < 4) bu_throw("insufficient args");
  if (arguments.length < 5 || !precedence) precedence = 'last';
  var joinpoint = burst.MethodJoinPoint.getForMethod(obj, methname, meth_must_exist, true);
  joinpoint.addAdvice(advice, advice_kind, precedence);
}

/**
Remove some advice.
If it is found, it is removed and we return true.
If it is not found, we return false if missing_ok, otherwise throw.
*/
//:NSFUNCTION Boolean removeMethodAdvice(Object obj, String methname, Function advice, String advice_kind, Boolean missing_ok)
burst.MOP.removeMethodAdvice = function(obj, methname, advice, advice_kind, missing_ok) {
  var joinpoint = burst.MethodJoinPoint.getForMethod(obj, methname, !missing_ok, false);
  if (!joinpoint) return false;
  return joinpoint.removeAdvice(advice, advice_kind, missing_ok);
}

/**
* Remove all advice from a method, restoring it to its initial state.
*/
//:NSFUNCTION Boolean removeAllMethodAdvice(Object obj, String methname, Boolean missing_ok)
burst.MOP.removeAllMethodAdvice = function(obj, methname, missing_ok) {
  var joinpoint = burst.MethodJoinPoint.getForMethod(obj, methname, !missing_ok, false);
  if (!joinpoint) return false;
  return joinpoint.unintercept();
}


burst.MethodJoinPoint = function(obj, methname) {
  this.object = obj;
  this.methodname = methname;
  this.methodfunc = obj[methname];
  this.before = [];
  this.after = [];
}

burst.MethodJoinPoint.getForMethod = function(obj, methname, meth_must_exist, create_if_none) {
  if (!bu_in(methname, obj)) {
    if (meth_must_exist) bu_throw("object does not have a method named '" + methname + "': " + obj);
    // supply a do-nothing method implementation
    if (create_if_none) obj[methname] = function() {};
    else return null;
  }
  // we hide our joinpoint instance in obj[methname + '$joinpoint']
  var jpname = methname + '$joinpoint';
  var joinpoint = bu_get_soft(obj, jpname, null);
  if (joinpoint) {
    ;
  }
  else if (create_if_none) {
    joinpoint = obj[jpname] = new burst.MethodJoinPoint(obj, methname);
    obj[methname] = function() {return joinpoint.run()};
  }
  return joinpoint;
}

burst.MethodJoinPoint.prototype.unintercept = function() {
  this.object[this.methodname] = this.methodfunc;
}

burst.MethodJoinPoint.prototype.run = function() {
  var obj = this.object;
  var args = arguments;
  burst.Alg.for_each(this.before, function(meth) {meth.apply(obj, args);});
  // sigh, avoid using "undefined" for IE5.0 PC
  // var result = this.methodfunc ? this.methodfunc.apply(obj, args) : undefined;
  var result; if (this.methodfunc) result = this.methodfunc.apply(obj, args);
  burst.Alg.for_each(this.after, function(meth) {meth.apply(obj, args);});  
  //return result;
  if (this.methodfunc) return result; else return BU_UNDEFINED;
}

burst.MethodJoinPoint.prototype.addAdvice = function(advice, advice_kind, precedence) {
  var arr = (advice_kind == 'before' ? this.before : this.after);
  if (!arr) bu_throw("bad this: " + this);
  if (precedence == 'first') arr.unshift(advice);
  else arr.push(advice);
}

burst.MethodJoinPoint.prototype.removeAdvice = function(advice, advice_kind, missing_ok) {
  var arr = (advice_kind == 'before' ? this.before : this.after);
  if (!arr) bu_throw("bad this: " + this);
  var ind = burst.Alg.find(arr, advice);
  if (ind == -1) {
    if (!missing_ok) bu_throw("object does not have that advice on method named '" + methname + "': " + obj);
    return false;
  }
  arr.splice(ind, 1);
  return true;
}


/**
* Initialize the object obj's instance variables from <var>values</var>.
* If <var>names</var>, the function throws if there is a property in <var>values</var>
* but not in <var>names</var>. Also <var>names</var> values are booleans, true if
* the value must be provided, and false if not.
*
* If obj already has a value for any given key, it is overwritten.
*
* @param obj The object to set.
* @param values The object whose members to copy.
* @param names optional. An object whose member keys indicate the ones of interest in values. If not specified, all are copied.
* @param nullDefault optional. If true, any member key in names that is not in values is put into obj with a value of null.
* @return obj
*/
//:NSFUNCTION Object initNamed(Object obj, Object values, Object names, Boolean nullDefault)
burst.MOP.initNamed = function(obj, values, names, nullDefault) {
  if (typeof obj != 'object') bu_throw("obj not an object: " + obj);
  if (typeof values != 'object') bu_throw("initNamed values not an object: " + values);
  for(var k in values) {
    if (names && !(bu_in(k, names))) bu_throw("Unexpected initializer key '" + k + "' not among:" + burst.Lang.uneval(names));
    obj[k] = values[k];
  }
  if (names) {
    for(k in names) {
      if (!(bu_in(k, values))) {
        if (names[k]) {
          bu_debug("about to throw because of key '", k, "'");
          bu_throw("No value provided for mandatory key '" + k + "', just: " + burst.Lang.uneval(values));
        }
        else if (nullDefault) {
bu_debug("defaulting key '", k, "' to null");
          obj[k] = null;
        }
      }
    }
  }
  return obj;
}

//:NSEND burst.MOP

bu_loaded('burst.MOP', ['burst.BurstError', 'burst.Lang']);
