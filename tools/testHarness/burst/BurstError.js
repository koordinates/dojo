/**
* @file BurstError.js
*
* Defines class burst.BurstError, which is the base Error class for exceptions thrown from the library.
* Also defines the global utility bu_throw.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

bu_require('burst.BurstError', ['burst.MOP']);

/**
* A convenience that does: <code>throw burst.BurstError(msg)</code>.
* This function has the benefit that you can do things like:
* <code>foobar() || bu_throw("foobar returned false")</code>
* which is not syntactically valid with native throw.
*/
//:GLFUNCTION void bu_throw(String msg)
function bu_throw(msg) {
  throw burst.BurstError(msg);
}

/**
* A convenience to throw an exception indicating that a
* particular function is not supported in this environment.
*/
//:GLFUNCTION void bu_unsupported(String funcname)
function bu_unsupported(funcname) {
  throw burst.BurstError("The function '" + funcname + "' is not supported in this environment");
}

/**
* A convenience to throw an exception indicating that the particular function
* is not yet implemented.
*/
//:GLFUNCTION void bu_unimplemented(String funcname)
function bu_unimplemented(funcname) {
  throw burst.BurstError("The function '" + funcname + "' is not yet implemented.");
}

//=java package burst;

/**
* Subclass of native Error which is used for exceptions thrown by the library.
* At this time, it has no additional capabilities beyond those of Error.
*/
//=java public class BurstError extends Error {
/** Behaves the same as the builtin Error constructor.*/
//=java public BurstError(String msg) {}
//=java }
burst.BurstError = function(msg) {
  if (!(this instanceof burst.BurstError)) return new burst.BurstError(msg);
  // normally we could do: Error.call(this, msg)
  // to initialize using superclass
  // but Error uses the same trick we do, of coercing function
  // calls into constructor calls, and so returns a different
  // constructed object rather than altering its argument.
  // so we have to emulate here.
  this.message = msg || ''; 
  return this; // silence warnings
}

bu_inherits(burst.BurstError, Error);
burst.BurstError.prototype.name = 'burst.BurstError';
// sigh, Opera 7 says: "Error.prototype.toString was called on an object that was not an Error"
// so we have to define it ourselves instead of inheriting it.
// ECMAScript ed3 is unclear. Other built-ins such as Function do say that 
// Function.prototype.toString() is not generic and cannot be called with a this which is not a Function.
// In any event, in IE, Error.toString() is "[object Error]" which isn't very helpful.
burst.BurstError.prototype.toString = function() {return this.name + ': ' + this.message;}


