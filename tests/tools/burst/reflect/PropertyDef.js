/**
* @file PropertyDef.js
* Defines burst.reflect.PropertyDef and some subclasses.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

bu_require('burst.reflect.PropertyDef', ['burst.MOP', 'burst.BurstError']);

//=java package burst.reflect;

/**
* Abstract base class for property metadata. 
* There is a subclass for each property type (boolean, etc.).
* There is an instance for each property name.
*/
//=java public abstract class PropertyDef {

/**
* Initialize a PropertyDef instance.
* The single constructor argument is an associative array with these keys:
* - 'name' mandatory.
* - 'defaultValue' optional. no default.
* - 'description' optional. no default.
* - 'isMandatory' optional. defaults to false.
* - 'isArray' optional. defaults to false.
* - 'regexp' optional. If supplied, all String values must match this.
* - 'enumArray' optional. An Array of String values.
* - 'enumMap' optional. An associative map from String value to property value.
* @param values The associative array to initialize from
*/
//=java public PropertyDef(Object values) {}
function BU_PropertyDef(values) {
  if (arguments.length==0) return; // for prototype
  //bu_debug("(PropertyDef.js) PropertyDef(", values, ")"); 
  burst.MOP.initNamed(this, values, burst.reflect.PropertyDef.INIT_VARS, true);

  if (this.enumArray) {
    if (this.enumMap) bu_throw("not allowed to have both enumArray and enumMap");
    this.enumSet = burst.Alg.toSet(this.enumArray);
  }
}
burst.reflect.PropertyDef = BU_PropertyDef;

BU_PropertyDef.INIT_VARS = {
	name: true, 
	defaultValue: false, 
	description: false, 
	isMandatory: false, 
	isArray: false,
	regexp: false,
	enumArray: false,
	enumMap: false
	};



/**
* If the input str is null or all white, then a default is returned:
* - if dflt is not undefined, it is returned (this includes dflt being null)
* - if the property has a defined defaultValue, it is returned
* - otherwise undefined is returned.
*
* Otherwise an attempt is made to parse the string str as a legitimate
* value. The function throws a burst.props.PropertyError if it is not valid.
*
* @param str The String to parse (can also be Boolean or Number, and it is converted to String)
* @param dflt Optional. If present, it is the value returned when str is all white or not defined. 
* @return The Object resulting from parsing str.
* @throws burst.props.PropertyError if there is a problem parsing it.
*/
//:CLIMETHOD Object parse(String str, Object dflt)
BU_PropertyDef.prototype.parse = function(str, dflt) {
  if (typeof str == 'number' || typeof str == 'boolean') str = '' + str;
  if (burst.Text.isWhite(str)) {
    if (typeof dflt != 'undefined') return dflt;
    if (typeof this.defaultValue != 'undefined') return this.defaultValue;
    return BU_UNDEFINED;
  }
  
  var v = this.parseImpl(str);

  // check regexp
  if (this.regexp && !this.regexp.test(str)) {
    throw burst.props.PropertyError(this, str, "Does not match regexp /" + burst.Lang.uneval(this.regexp) + "/");
  }

  // check enum values
  if (this.enumArray && !(bu_in(str, this.enumSet))) {
    throw burst.props.PropertyError(this, str, "Not among the enum values: " + burst.Lang.uneval(this.enumArray));
  }
  if (this.enumMap) {
    v = this.enumMap[str];
    if (!v) throw burst.props.PropertyError(this, str, "Not in enum map: " + burst.Lang.uneval(this.enumMap));
  }

  return v;
}


/**
* Abstract method which must be implemented by a subclass.
*
* The passed in String str will never be null or all white.
*
*/
//:CLAMETHOD Object parseImpl(String str)
BU_PropertyDef.prototype.parseImpl = function(str) {bu_throw("subclass has not implemented parse");}

/** 
* The name of the type of the values returned by the parse method.
*/
//:CLAMETHOD String valueType()

/** the name of the burst.reflect.PropertyDef subclass */
//:CLAMETHOD String propertyType()

/** 
* If the object has no member variable by this name, and this burst.reflect.PropertyDef
* has a defaultValue, set it in the object and return true.
* If either the object is already set, or this burst.reflect.PropertyDef has no defaultValue,
* return false.
* @return true if set.
*/
//:CLIMETHOD Boolean setDefault(Object obj)
BU_PropertyDef.prototype.setDefault = function(obj) {
  if (typeof this.defaultValue == 'undefined') {
     bu_debug("(burst.reflect.PropertyDef.js) ", this.name, " has no default to set");
     return false;
  }
  var name = this.name;
  if (/*(bu_in(name, obj)) && */typeof obj[name] != 'undefined') {
    bu_debug("(burst.reflect.PropertyDef.js) ", this.name, " already has a value in the object: ", obj[name]);
    return false;
  }
  else {
    bu_debug("(burst.reflect.PropertyDef.js) ", this.name, " being set to default value: ", this.defaultValue);
    obj[name] = this.defaultValue;
    return true;
  }
}

/**
* If this property is not mandatory, do nothing.
* If the object has a defined value for the property, do nothing.
* Otherwise, if handler is specified, call it with (propdef, obj)
* Otherwise throw burst.props.PropertyError complaining about the missing value.
*
* @param obj The Object to check.
* @param handler optional. If specified, it is called rather than the default handling.
*/
//:CLIMETHOD void checkMandatory(Object obj, Function handler) 
BU_PropertyDef.prototype.checkMandatory = function(obj, handler) {
  if (!this.isMandatory) return;
  var name = this.name;
  if (/*bu_in(name, obj) &&*/typeof obj[name] != 'undefined') return;
  if (handler) {handler(this, obj)}
  else throw burst.props.PropertyError(this, null, "No value for mandatory property.");
}

/** 
* A class method to call setDefault for each instance in an Array of burst.reflect.PropertyDef.
*/
//:CLCMETHOD void setDefaultEach(Object obj, Array propdefs)
BU_PropertyDef.setDefaultEach = function(obj, propdefs) {
  bu_debug("in burst.reflect.PropertyDef.setDefaultEach");
  burst.Alg.for_each(propdefs, function(propdef) {propdef.setDefault(obj)});
}

/**
* A class method to call checkMandatory for each instance in an Array of burst.reflect.PropertyDef.
*/
//:CLCMETHOD void checkMandatoryEach(Object obj, Array propdefs, Function handler)
BU_PropertyDef.checkMandatoryEach = function(obj, propdefs, handler) {
  burst.Alg.for_each(propdefs, function(propdef) {propdef.checkMandatory(obj, handler)});
}


//=java } // class burst.reflect.PropertyDef








/**
* Subclass of PropertyDef whose String values are 'true' or 'false', and values are true or false.
*/
//=java public class PropertyDefBoolean extends PropertyDef {

/** Constructor. */
//=java public PropertyDefBoolean(Object values) { super(values); }
burst.reflect.PropertyDefBoolean = function(values) {
  burst.reflect.PropertyDef.call(this, values);
}
bu_inherits(burst.reflect.PropertyDefBoolean, BU_PropertyDef);

burst.reflect.PropertyDefBoolean.prototype.parseImpl = function(s) {
  switch(s) {
  case 'true': return true;
  case 'false': return false;
  default: 
    throw new burst.props.PropertyError(this, s, "Not a valid boolean string (must be 'true' or 'false').");
  }
}
burst.reflect.PropertyDefBoolean.prototype.valueType = function() {return 'boolean'};
burst.reflect.PropertyDefBoolean.prototype.propertyType = function() {return 'burst.reflect.PropertyDefBoolean'};

//=java } // class burst.reflect.PropertyDefBoolean




/**
* Subclass of PropertyDef whose strings are expressions that are eval'd to produce an Object
*/
//=java public class PropertyDefExpr extends PropertyDef {

/** Constructor. */
//=java public PropertyDefExpr(Object values) { super(values); }
burst.reflect.PropertyDefExpr = function(values) {
  burst.reflect.PropertyDef.call(this, values);
}
bu_inherits(burst.reflect.PropertyDefExpr, BU_PropertyDef);

burst.reflect.PropertyDefExpr.prototype.parseImpl = function(s) {
  var v;
  try {v = eval(s);}
  catch(e) {throw burst.props.PropertyError(this, s, "eval threw an exception: " + e);}
  if (typeof v == 'undefined') throw burst.props.PropertyError(this, s, "eval returned undefined");
  return v;
}
burst.reflect.PropertyDefExpr.prototype.valueType = function() {return 'string'};
burst.reflect.PropertyDefExpr.prototype.propertyType = function() {return 'burst.reflect.PropertyDefExpr'};

//=java } // class burst.reflect.PropertyDefExpr



/**
* Subclass of PropertyDef that imposes no more constraints than in the base class.
*/
//=java public class PropertyDefString extends PropertyDef {
/** Constructor. */
//=java public PropertyDefString(Object values) { super(value); }
burst.reflect.PropertyDefString = function(values) {
  burst.reflect.PropertyDef.call(this, values);
}
bu_inherits(burst.reflect.PropertyDefString, BU_PropertyDef);

burst.reflect.PropertyDefString.prototype.parseImpl = function(s) {return s;}
burst.reflect.PropertyDefString.prototype.valueType = function() {return 'string'};
burst.reflect.PropertyDefString.prototype.propertyType = function() {return 'burst.reflect.PropertyDefString'};

//=java } // class burst.reflect.PropertyDefString




/**
* Subclass of PropertyDef whose values are URL strings for images.
*
* In the case of relative urls, the treatment differs for builtin
* defaults and values provided by the programmer:
* - If the property has a builtin default which is used, it is resolved relative to our own "images" directory
* - If the programmer provides a value which is relative, it is used unchanged.
*/
//=java public class PropertyDefImageUrl extends PropertyDef {

/** Constructor. */
//=java public PropertyDefImageUrl(Object values) { super(value); }
burst.reflect.PropertyDefImageUrl = function(values) {
  burst.reflect.PropertyDef.call(this, values);

  // resolve relative to our images dir if it is our builtin default
  if (typeof this.defaultValue != 'undefined' && this.defaultValue) {
     this.defaultValue = this.relativizeBuiltinUrl(this.defaultValue);
  }
}
bu_inherits(burst.reflect.PropertyDefImageUrl, BU_PropertyDef);

burst.reflect.PropertyDefImageUrl.prototype.relativizeBuiltinUrl = function(url) {
  if (burst.URI.isAbsolute(url)) return url;
  if (url.charAt(0) == '/') return url;
  return bu_ScriptLoader.resolveImageUrl(url);
}

burst.reflect.PropertyDefImageUrl.prototype.parseImpl = function(s) {
  return s;
}
burst.reflect.PropertyDefImageUrl.prototype.valueType = function() {return 'string'};
burst.reflect.PropertyDefImageUrl.prototype.propertyType = function() {return 'burst.reflect.PropertyDefImageUrl'};

//=java } // class burst.reflect.PropertyDefImageUrl





/**
* Subclass of PropertyDef whose String values are integers.
*/
//=java public class PropertyDefNumber extends PropertyDef {

/** Constructor. */
//=java public PropertyDefNumber(Object values) { super(values); }
burst.reflect.PropertyDefNumber = function(values) {
  burst.reflect.PropertyDef.call(this, values);
}
bu_inherits(burst.reflect.PropertyDefNumber, BU_PropertyDef);

burst.reflect.PropertyDefNumber.prototype.parseImpl = function(s) {
  var v = parseInt(s);
  if (isNaN(v)) throw new burst.props.PropertyError(this, s, "Not a valid integer.");
  return v;
}
burst.reflect.PropertyDefNumber.prototype.valueType = function() {return 'number'};
burst.reflect.PropertyDefNumber.prototype.propertyType = function() {return 'burst.reflect.PropertyDefNumber'};

//=java } // class burst.reflect.PropertyDefNumber

bu_loaded('burst.reflect.PropertyDef', ['burst.Text', 'burst.Alg', 'burst.Lang', 'burst.URI', 'burst.ScriptLoader']);
