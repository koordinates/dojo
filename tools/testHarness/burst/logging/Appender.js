/**
* @file Appender.js
*
* Defines burst.logging.Appender .
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst.logging;

/**
* Base class for a logging destination.
* The only requirement that burst.logging.Log has for its appenders is that they either be
* an Object with a method format(), or they be a Function implementing
* that signature.
*
* The burst.logging.Appender is a convenience base class which implements format() in terms of
* an abstract method appendl(line). You can either inherit from this class and
* override this.appendl, or you can instantiate this class and pass in an implementation.
*/
//=java public class Appender {

/**
* Constructor
* The appendl and format arguments are a convenience in case you'd rather create an burst.logging.Appender
* without subclassing. There is a default implementation for format, but none for appendl.
* @param appendl Optional argument providing an implementation for the appendl() method.
* @param format Optional argument providing an implementation for the format() method.
*/
//=java public Appender(Function appendl, Function format) {}
function BU_Appender(appendl, format) {
  this.format = (typeof format == 'undefined') ?
  function(logger, levelobj, mess, stack_start) {
    var line = BU_Log.format(logger, levelobj, mess, 1 + stack_start);
    this.appendl(line);
  } :
  format;
  this.appendl = (typeof appendl == 'undefined') ?
	function() {throw "subclass failed to implement appendl";} :
   	appendl;
}
burst.logging.Appender = BU_Appender;
//=java } // class Appender

