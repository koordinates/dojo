/**
* @file AssertFailure.js
*
* Defines burst.AssertFailure, a subclass of burst.BurstError used for bu_assertTrue and similar.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

/**
* Throws if the condition is not true.
* May be called either as (cond) or (msg, cond). 
*
* @param msg optional String to put as part of the message.
* @param cond String to eval and test or Object to test.
*/
//:GLFUNCTION void bu_assertTrue(String msg, Object cond)
/** single-argument variant.*/
//:GLFUNCTION void bu_assertTrue(Object cond)
function bu_assertTrue(msg, cond) {
  if (arguments.length == 1) {cond = msg; msg = null;} 
  if (!eval(cond)) throw burst.AssertFailure("assertTrue('" + cond + "') failed" + (msg ? ': ' + msg : ''));
}

/**
* Throws if the condition is true.
* May be called either as (cond) or (msg, cond). 
*
* @param msg optional String to put as part of the message.
* @param cond String to eval and test or Object to test.
*/
//:GLFUNCTION void bu_assertFalse(String msg, Object cond)
/** single-argument variant.*/
//:GLFUNCTION void bu_assertFalse(Object cond)
function bu_assertFalse(msg, cond) {
  if (arguments.length == 1) {cond = msg; msg = null;} 
  if (eval(cond)) throw burst.AssertFailure("assertFalse('" + cond + "') failed" + (msg ? ': ' + msg : ''));
}

/**
* Throws if the expected and actual are not ==.
* May be called either as (expected, actual) or (msg, expected, actual). 
*
* @param msg optional String to put as part of the message.
* @param expected The expected value
* @param actual The actual value
*/
//:GLFUNCTION void bu_assertEquals(String msg, Object expected, Object actual)
/** two-argument variant.*/
//:GLFUNCTION void bu_assertEquals(Object expected, Object actual)
function bu_assertEquals(msg, expected, actual) {
   if (arguments.length == 2) {actual = expected; expected = msg; msg = null;} 
   if (expected != actual) throw burst.AssertFailure("assertEquals failed, Expected:<" + expected + ">, but was:<" + actual + ">" + (msg ? ': ' + msg : ''));
}

/**
* Throws if the expected and actual state values are not ===.
*
* @param statename The name of the state, used in error message.
* @param expected The expected state value
* @param actual The actual state value
*/
//:GLFUNCTION void bu_assertState(String statename, String expected, String actual)
function bu_assertState(statename, expected, actual) {
  if (arguments.length == 2) {actual = expected; expected = statename; statename = null;}
  if (expected !== actual) throw burst.BurstError("assertState for state" +
     (statename ? " '" + statename + "'": '') +
     " failed, Expected:<" + expected + ">, but was:<" + actual + ">");
}

// there must be at least that many args, and they must be non-null
function bu_assertArgs(funcname, num, args) {
  if (args.length < num) bu_throw("Function '" + funcname + "' expected " + num + " arguments and instead got " + args.length);
  for(var i=0;i<num;++i) {
    var v = args[i];
    if (v == null || (typeof v == 'undefined')) bu_throw("Function '" + funcname + "' expected " + num + " non-null non-undefined arguments and argument " + i + " is " + v);
  }
}

/** Subclass of BurstError that is thrown by bu_assertTrue and other assertion functions. */
//=java public class burst.AssertFailure extends burst.BurstError {
//=java public BurstError(String msg) {}
//=java }
burst.AssertFailure = function(msg) {
  if (!(this instanceof burst.AssertFailure)) return new burst.AssertFailure(msg);
  this.message = msg || ''; 
  return this; // silence warnings
}
bu_inherits(burst.AssertFailure, burst.BurstError);
burst.AssertFailure.prototype.name = 'burst.AssertFailure';



