/**
* @file PropertyError.js
* Defines class burst.props.PropertyError used by burst.props.* and burst.reflect.* .
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst.props;

/**
* Subclass of burst.BurstError which is thrown when invalid configuration is found.
*/
//=java public class PropertyError extends burst.BurstError {

/** 
* constructor. As with Error, can also be called as function, and it does a new for you.
* @param propdef The burst.reflect.PropertyDef which is reporting the error.
* @param str Optional. If provided, it is the offending string value.
* @param msg The message to report.
*/
//=java public PropertyError(burst.reflect.PropertyDef propdef, String str, String msg) {}
burst.props.PropertyError = function(propdef, str, msg) {
  if (!(this instanceof burst.props.PropertyError)) return new burst.props.PropertyError(propdef, str, msg);
  this.msg_ = msg;
  this.propdef_ = propdef;
  this.str_ = str;

  this.message = "Property '" + propdef.name + "'";
  if (typeof this.str_ == 'string') this.message += ", string '" + this.str_ + "'";
  this.message += ': ' + msg;

  return this; // silence warnings
}
bu_inherits(burst.props.PropertyError, burst.BurstError);
burst.props.PropertyError.prototype.name = 'burst.props.PropertyError';
/*
burst.props.PropertyError.toString = function() {
}
*/
//=java } // class burst.props.PropertyError
