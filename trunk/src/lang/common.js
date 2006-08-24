dojo.provide("dojo.lang.common");

dojo.lang.inherits = function(/*Function*/ subclass, /*Function*/ superclass){
	// summary: Set up inheritance between two classes.
	if(typeof superclass != 'function'){ 
		dojo.raise("dojo.inherits: superclass argument ["+superclass+"] must be a function (subclass: ["+subclass+"']");
	}
	subclass.prototype = new superclass();
	subclass.prototype.constructor = subclass;
	subclass.superclass = superclass.prototype;
	// DEPRICATED: super is a reserved word, use 'superclass'
	subclass['super'] = superclass.prototype;
}

dojo.lang._mixin = function(/*Object*/ obj, /*Object*/ props){
	// summary:	Adds all properties and methods of props to obj.
	var tobj = {};
	for(var x in props){
		// the "tobj" condition avoid copying properties in "props"
		// inherited from Object.prototype.  For example, if obj has a custom
		// toString() method, don't overwrite it with the toString() method
		// that props inherited from Object.protoype
		if((typeof tobj[x] == "undefined") || (tobj[x] != props[x])){
			obj[x] = props[x];
		}
	}
	// IE doesn't recognize custom toStrings in for..in
	if(dojo.render.html.ie 
		&& (typeof(props["toString"]) == "function")
		&& (props["toString"] != obj["toString"])
		&& (props["toString"] != tobj["toString"]))
	{
		obj.toString = props.toString;
	}
	return obj;
}

dojo.lang.mixin = function(/*Object*/ obj, /*Object...*/props){
	// summary:	Adds all properties and methods of props to obj.
	for(var i=1, l=arguments.length; i<l; i++){
		dojo.lang._mixin(obj, arguments[i]);
	}
	return obj; // Object
}

dojo.lang.extend = function(/*Object*/ constructor, /*Object...*/ props){
	// summary:	Adds all properties and methods of props to constructor's prototype,
	//			making them available to all instances created with constructor.
	for(var i=1, l=arguments.length; i<l; i++){
		dojo.lang._mixin(constructor.prototype, arguments[i]);
	}
	return constructor;
}

// Promote to dojo module
dojo.inherits = dojo.lang.inherits;
//dojo.lang._mixin = dojo.lang._mixin;
dojo.mixin = dojo.lang.mixin;
dojo.extend = dojo.lang.extend;

dojo.lang.find = function(	/*Array*/		array, 
							/*Object*/		value,
							/*Boolean?*/	identity,
							/*Boolean?*/	findLast){
	// summary:	Return the index of value in array, returning -1 if not found.
	
	// param: identity:  If true, matches with identity comparison (===).  
	//					 If false, uses normal comparison (==).
	// param: findLast:  If true, returns index of last instance of value.
	// usage:
	//  find(array, value[, identity [findLast]]) // recommended
	// usage:
 	//  find(value, array[, identity [findLast]]) // deprecated
							
	// support both (array, value) and (value, array)
	if(!dojo.lang.isArrayLike(array) && dojo.lang.isArrayLike(value)) {
		dojo.deprecated('dojo.lang.find(value, array)', 'use dojo.lang.find(array, value) instead', "0.5");
		var temp = array;
		array = value;
		value = temp;
	}
	var isString = dojo.lang.isString(array);
	if(isString) { array = array.split(""); }

	if(findLast) {
		var step = -1;
		var i = array.length - 1;
		var end = -1;
	} else {
		var step = 1;
		var i = 0;
		var end = array.length;
	}
	if(identity){
		while(i != end) {
			if(array[i] === value){ return i; }
			i += step;
		}
	}else{
		while(i != end) {
			if(array[i] == value){ return i; }
			i += step;
		}
	}
	return -1;	// number
}

dojo.lang.indexOf = dojo.lang.find;

dojo.lang.findLast = function(/*Array*/ array, /*Object*/ value, /*boolean?*/ identity){
	// summary:	Return index of last occurance of value in array, returning -1 if not found.

	// param: identity:  If true, matches with identity comparison (===).  
	//					 If false, uses normal comparison (==).
	return dojo.lang.find(array, value, identity, true);
}

dojo.lang.lastIndexOf = dojo.lang.findLast;

dojo.lang.inArray = function(array /*Array*/, value /*Object*/){
	// summary:	Return true if value is present in array.
	return dojo.lang.find(array, value) > -1; // return: boolean
}

/**
 * Partial implmentation of is* functions from
 * http://www.crockford.com/javascript/recommend.html
 * NOTE: some of these may not be the best thing to use in all situations
 * as they aren't part of core JS and therefore can't work in every case.
 * See WARNING messages inline for tips.
 *
 * The following is* functions are fairly "safe"
 */

dojo.lang.isObject = function(it){
	// summary:	Return true if it is an Object, Array or Function.
	if(typeof it == "undefined"){ return false; }
	return (typeof it == "object" || it === null || dojo.lang.isArray(it) || dojo.lang.isFunction(it));
}

dojo.lang.isArray = function(it){
	// summary:	Return true if it is an Array.
	return (it && it instanceof Array || typeof it == "array");
}

dojo.lang.isArrayLike = function(it){
	// summary:	Return true if it can be used as an array (i.e. is an object with an integer length property).
	if((!it)||(dojo.lang.isUndefined(it))){ return false; }
	if(dojo.lang.isString(it)){ return false; }
	if(dojo.lang.isFunction(it)){ return false; } // keeps out built-in constructors (Number, String, ...) which have length properties
	if(dojo.lang.isArray(it)){ return true; }
	// form node itself is ArrayLike, but not always iterable. Use form.elements instead.
	if((it.tagName)&&(it.tagName.toLowerCase()=='form')){ return false; }
	if(dojo.lang.isNumber(it.length) && isFinite(it.length)){ return true; }
	return false;
}

dojo.lang.isFunction = function(it){
	// summary:	Return true if it is a Function.
	if(!it){ return false; }
	return (it instanceof Function || typeof it == "function");
}

dojo.lang.isString = function(it){
	// summary:	Return true if it is a String.
	return (it instanceof String || typeof it == "string");
}

dojo.lang.isAlien = function(it){
	// summary:	Return true if it is not a built-in function.
	if(!it){ return false; }
	return !dojo.lang.isFunction() && /\{\s*\[native code\]\s*\}/.test(String(it));
}

dojo.lang.isBoolean = function(it){
	// summary:	Return true if it is a Boolean.
	return (it instanceof Boolean || typeof it == "boolean");
}

/**
 * The following is***() functions are somewhat "unsafe". Fortunately,
 * there are workarounds the the language provides and are mentioned
 * in the WARNING messages.
 *
 */
dojo.lang.isNumber = function(it){
	// summary:	Return true if it is a number.

	// warning: 
	//		In most cases, isNaN(it) is sufficient to determine whether or not
	// 		something is a number or can be used as such. For example, a number or string
	// 		can be used interchangably when accessing array items (array["1"] is the same as
	// 		array[1]) and isNaN will return false for both values ("1" and 1). However,
	// 		isNumber("1")  will return false, which is generally not too useful.
	// 		Also, isNumber(NaN) returns true, again, this isn't generally useful, but there
	// 		are corner cases (like when you want to make sure that two things are really
	// 		the same type of thing). That is really where isNumber "shines".
	//
	// recommendation: Use isNaN(it) when possible
	
	return (it instanceof Number || typeof it == "number");
}

/*
 * FIXME: Should isUndefined go away since it is error prone?
 */
dojo.lang.isUndefined = function(it){
	// summary: Return true if it is not defined.
	
	// warning: In some cases, isUndefined will not behave as you
	// 		might expect. If you do isUndefined(foo) and there is no earlier
	// 		reference to foo, an error will be thrown before isUndefined is
	// 		called. It behaves correctly if you scope yor object first, i.e.
	// 		isUndefined(foo.bar) where foo is an object and bar isn't a
	// 		property of the object.
	//
	// recommendation: Use typeof foo == "undefined" when possible

	return ((it == undefined)&&(typeof it == "undefined"));
}

// end Crockford functions
