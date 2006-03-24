dojo.provide("dojo.lang.common");

dojo.require("dojo.lang");

/*
 * Adds the given properties/methods to the specified object
 */
dojo.lang.mixin = function(obj, props){
	var tobj = {};
	for(var x in props){
		// the "tobj" condition avoid copying properties in "props"
		// inherited from Object.prototype.  For example, if obj has a custom
		// toString() method, don't overwrite it with the toString() method
		// that props inherited from Object.protoype
		if(typeof tobj[x] == "undefined" || tobj[x] != props[x]) {
			obj[x] = props[x];
		}
	}
	// IE doesn't recognize custom toStrings in for..in
	if(dojo.render.html.ie && dojo.lang.isFunction(props["toString"]) && props["toString"] != obj["toString"]) {
		obj.toString = props.toString;
	}
	return obj;
}

/*
 * Adds the given properties/methods to the specified object's prototype
 */
dojo.lang.extend = function(ctor, props){
	this.mixin(ctor.prototype, props);
}

/**
 * See if val is in arr. Call signatures:
 *  find(array, value, identity) // recommended
 *  find(value, array, identity)
**/
dojo.lang.find = function(arr, val, identity, findLast){
	// support both (arr, val) and (val, arr)
	if(!dojo.lang.isArrayLike(arr) && dojo.lang.isArrayLike(val)) {
		var a = arr;
		arr = val;
		val = a;
	}
	var isString = dojo.lang.isString(arr);
	if(isString) { arr = arr.split(""); }

	if(findLast) {
		var step = -1;
		var i = arr.length - 1;
		var end = -1;
	} else {
		var step = 1;
		var i = 0;
		var end = arr.length;
	}
	if(identity){
		while(i != end) {
			if(arr[i] === val){ return i; }
			i += step;
		}
	}else{
		while(i != end) {
			if(arr[i] == val){ return i; }
			i += step;
		}
	}
	return -1;
}

dojo.lang.indexOf = dojo.lang.find;

dojo.lang.findLast = function(arr, val, identity) {
	return dojo.lang.find(arr, val, identity, true);
}

dojo.lang.lastIndexOf = dojo.lang.findLast;

dojo.lang.inArray = function(arr, val){
	return dojo.lang.find(arr, val) > -1;
}

/**
* Loop through the given Array, object or String and call the unary_func for each member item. 
* Each character of an input String is considered an item.
* The function each_func is called with the parameters: 
* 	current element value, the index/property, the entire array|object|string.
*
* Example usage:
*  dojo.lang.forEach([1,2,3,4,5], dojo.debug); // prints all the numbers 1..5 using dojo.debug()
*  dojo.lang.forEach({x:1, y:2, z:3}, dojo.debug); // prints all the values of x,y,z
*  dojo.lang.forEach("a string", dojo.debug); // prints each character of the string
*	 dojo.lang.forEach("a string", dojo.debug, 3); // prints the first three chars of the string
*
* Parameters:
*   object Either an array, object or string to loop through.
*   function A reference to a function that shall be called for each element.
*   int The maximum elements to loop through.
*/
dojo.lang.forEach = function(obj /* Object */, each_func /* Function */, fix_length /* Int */){
	if(dojo.lang.isString(obj)){ 
		obj = obj.split(""); 
	}
	if (dojo.lang.isArray(obj)){
		// handle arrays by looping over the elements using their index, since 
		// sjmiles mentioned: we cannot use for..in on arrays in general because users tend to stuff their own properties into Array
		var length = (fix_length ? fix_length : obj.length);
		for(var i=0; i<length; i++){ 
			// If the each_func returns the string "break", quit the forEach(), see #1078.
			if(each_func(obj[i], i, obj) == "break"){ 
				break;
			}
		}
	}else{
		// when three arguments are given, means fix_length is given, evaluate it.
		var length = (fix_length ? fix_length : 0);
		var count = 0;
		for(var i in obj){
			count++;
			// If the each_func returns the string "break", quit the forEach(), see #1078.
			if(each_func(obj[i], i, obj) == "break" || length == count){
				break;
			}
		}
 	}
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

dojo.lang.isObject = function(wh) {
	return typeof wh == "object" || dojo.lang.isArray(wh) || dojo.lang.isFunction(wh);
}

dojo.lang.isArray = function(wh) {
	return (wh instanceof Array || typeof wh == "array");
}

dojo.lang.isArrayLike = function(wh) {
	if(dojo.lang.isString(wh)){ return false; }
	if(dojo.lang.isFunction(wh)){ return false; } // keeps out built-in ctors (Number, String, ...) which have length properties
	if(dojo.lang.isArray(wh)){ return true; }
	if(typeof wh != "undefined" && wh
		&& dojo.lang.isNumber(wh.length) && isFinite(wh.length)){ return true; }
	return false;
}

dojo.lang.isFunction = function(wh) {
	return (wh instanceof Function || typeof wh == "function");
}

dojo.lang.isString = function(wh) {
	return (wh instanceof String || typeof wh == "string");
}

dojo.lang.isAlien = function(wh) {
	return !dojo.lang.isFunction() && /\{\s*\[native code\]\s*\}/.test(String(wh));
}

dojo.lang.isBoolean = function(wh) {
	return (wh instanceof Boolean || typeof wh == "boolean");
}

/**
 * The following is***() functions are somewhat "unsafe". Fortunately,
 * there are workarounds the the language provides and are mentioned
 * in the WARNING messages.
 *
 * WARNING: In most cases, isNaN(wh) is sufficient to determine whether or not
 * something is a number or can be used as such. For example, a number or string
 * can be used interchangably when accessing array items (arr["1"] is the same as
 * arr[1]) and isNaN will return false for both values ("1" and 1). Should you
 * use isNumber("1"), that will return false, which is generally not too useful.
 * Also, isNumber(NaN) returns true, again, this isn't generally useful, but there
 * are corner cases (like when you want to make sure that two things are really
 * the same type of thing). That is really where isNumber "shines".
 *
 * RECOMMENDATION: Use isNaN(wh) when possible
 */
dojo.lang.isNumber = function(wh) {
	return (wh instanceof Number || typeof wh == "number");
}

/**
 * WARNING: In some cases, isUndefined will not behave as you
 * might expect. If you do isUndefined(foo) and there is no earlier
 * reference to foo, an error will be thrown before isUndefined is
 * called. It behaves correctly if you scope yor object first, i.e.
 * isUndefined(foo.bar) where foo is an object and bar isn't a
 * property of the object.
 *
 * RECOMMENDATION: Use `typeof foo == "undefined"` when possible
 *
 * FIXME: Should isUndefined go away since it is error prone?
 */
dojo.lang.isUndefined = function(wh) {
	return ((wh == undefined)&&(typeof wh == "undefined"));
}

// end Crockford functions
