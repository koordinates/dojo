dojo.provide("dojo._base.lang");

dojo.isString = function(/*anything*/ it){
	//	summary:
	//		Return true if it is a String
	return typeof it == "string"; // Boolean
};

(function() {
	var isOwnProperty = dojo.isOwnProperty;

	// NOTE: Do not pass host objects

	dojo.isArray = function(/*anything*/ it){
		//	summary:
		//		Return true if it is an Array

		switch (Object.prototype.toString.call(it)) {
		case '[object Array]':
			return true;
		case '[object Object]': // Cross-frame IE (duck typing not reliable, method should be deprecated)
			return !!(dojo.isObject(it) && it && typeof it.length == 'number' && isFinite(it.length) && dojo.isFunction(it.splice) && dojo.isFunction(it.reverse) && !isOwnProperty(it, 'splice') && !isOwnProperty(it, 'reverse') && !isOwnProperty(it, 'length'));
		}
		return false;
	};

	dojo.isDate = function(/*anything*/ it) {
		//	summary:
		//		Return true if it is a Date

		switch (Object.prototype.toString.call(it)) {
		case '[object Date]':
			return true;
		case '[object Object]': // Cross-frame IE (duck typing not reliable, method should be deprecated)
			return !!(dojo.isObject(it) && it && dojo.isFunction(it.getTime) && !isOwnProperty(it, 'getTime'));
		}
		return false;
	};

	dojo.isError = function(/*anything*/ it) {
		//	summary:
		//		Return true if it is an Error

		switch (Object.prototype.toString.call(it)) {
		case '[object Error]':
			return true;
		case '[object Object]': // Cross-frame IE (duck typing not reliable, method should be deprecated)

			// FIXME: Need tests for Error objects

			return !!(dojo.isObject(it) && it);
		}
		return false;
	};

	dojo.isRegExp = function(/*anything*/ it) {
		//	summary:
		//		Return true if it is a RegExp

		switch (Object.prototype.toString.call(it)) {
		case '[object RegExp]':
			return true;
		case '[object Object]': // Cross-frame IE (duck typing not reliable, method should be deprecated)
			return dojo.isObject(it) && it && dojo.isFunction(it.test) && !dojo.isOwnProperty(it, 'test') && dojo.isObject(it) && it && dojo.isFunction(it.exec) && !isOwnProperty(it, 'exec');
		}
		return false;
	};

})();

/*=====
dojo.isFunction = function(it){
	// summary: Return true if it is a Function
	// it: anything (except host objects)
	return; // Boolean
}
=====*/

dojo.isFunction = function(/*anything*/ it){
	return typeof it == "function"; // Boolean	
};

dojo.isObject = function(/*anything*/ it){
	// summary: 
	//		Returns true if it is a JavaScript object (or an Array, a Function
	//		or null)
	//		Do not pass host objects
	return (/^(function|object)$/i).test(typeof it); // Boolean
};

dojo.isArrayLike = function(/*anything*/ it){
	//	summary:
	//		similar to dojo.isArray() but more permissive
	//	description:
	//		Doesn't strongly test for "arrayness".  Instead, settles for "isn't
	//		a string or number and has a length property". Arguments objects
	//		and DOM collections will return true when passed to
	//		dojo.isArrayLike(), but will return false when passed to
	//		dojo.isArray().
	//	returns:
	//		If it walks like a duck and quacks like a duck, return `true`
	return dojo.isObject(it) && it && typeof it.length == 'number' && isFinite(it.length); // Boolean
};

// DOCME: Why do we need this one?

dojo.isAlien = function(/*anything*/ it){
	// summary: 
	//		Returns true if it is a built-in function or something else
	//		callable that does not report as a function
	return !dojo.isFunction(it) && dojo.isFunction(it.call); // Boolean
};

dojo.extend = function(/*Object*/ constructor, /*Object...*/ props){
	// summary:
	//		Adds all properties and methods of props to constructor's
	//		prototype, making them available to all instances created with
	//		constructor.
	for(var i=1, l=arguments.length; i<l; i++){
		dojo._mixin(constructor.prototype, arguments[i]);
	}
	return constructor; // Object
};

dojo._hitchedObjects = {};

dojo._getHitchHandle = (function() {
	var key = 0;
	return function() {
		return key++;
	};
})();

dojo._hitchArgs = function(thisObject, method /*,...*/){

	// NOTE: Handle system is temporary
	//       Will be used to test suspected hitch-induced memory leaks

	var pre = Array.prototype.slice.call(arguments, 2);
	var handle = dojo._getHitchHandle();

	dojo._hitchedObjects[handle] = thisObject;

	// locate our method

	var f = typeof method == 'string' ? thisObject[method] : method;

	// Should throw if can't locate?

	thisObject = null;

	return function(){
		// invoke with collected args
		return f && f.apply(dojo._hitchedObjects[handle] || dojo.global, pre.concat(Array.prototype.slice.call(arguments, 0))); // mixed
 	}; // Function
};

dojo.hitch = function(/*Object*/thisObject, /*Function|String*/method /*,...*/){
	//	summary: 
	//		Returns a function that will only ever execute in the a given scope. 
	//		This allows for easy use of object member functions
	//		in callbacks and other places in which the "this" keyword may
	//		otherwise not reference the expected scope. 
	//		Any number of default positional arguments may be passed as parameters 
	//		beyond "method".
	//		Each of these values will be used to "placehold" (similar to curry)
	//		for the hitched function. 
	//	thisObject: 
	//		The - this - identifier will be set to reference this object (or the Global Object if null is passed)
	//		If method is a string it names the method of this object to call as well
	//	method:
	//		A function to be hitched to scope, or the name of the method in
	//		scope to be hitched.
	//	example:
	//	|	dojo.hitch(foo, "bar")(); 
	//		runs foo.bar() in the scope of foo
	//	example:
	//	|	dojo.hitch(foo, myFunction);
	//		returns a function that runs myFunction in the scope of foo
	if(arguments.length > 2){
		return dojo._hitchArgs.apply(dojo, arguments); // Function
	}

	var handle = dojo._getHitchHandle();

	// Just method passed

	if(!method){
		method = thisObject;
		thisObject = null;
	}

	dojo._hitchedObjects[handle] = thisObject;

	// Call named method of this object

	if(dojo.isString(method)){
		// NOTE: The partial method passes null for thisObject, allowing global to be substituted later
		//       As is, method must exist in current context

		if(!(dojo._hitchedObjects[handle] || dojo.global)[method]){ throw(['dojo.hitch: method["', method, '"] is null (thisObject="', thisObject, '")'].join('')); }
		return function(){ return (dojo._hitchedObjects[handle] || dojo.global)[method].apply(thisObject, arguments); }; // Function
	}

	// Function passed through or hitched to this object

	if (thisObject) {
		thisObject = null;
		return function(){ return method.apply(dojo._hitchedObjects[handle], arguments); }; // Function
	}

	return method; // Function	
};

/*=====
dojo.delegate = function(obj, props){
	//	summary:
	//		Returns a new object which "looks" to obj for properties which it
	//		does not have a value for. Optionally takes a bag of properties to
	//		seed the returned object with initially. 
	//	description:
	//		This is a small implementaton of the Boodman/Crockford delegation
	//		pattern in JavaScript. An intermediate object constructor mediates
	//		the prototype chain for the returned object, using it to delegate
	//		down to obj for property lookup when object-local lookup fails.
	//		This can be thought of similarly to ES4's "wrap", save that it does
	//		not act on types but rather on pure objects.
	//	obj:
	//		The object to delegate to for properties not found directly on the
	//		return object or in props.
	//	props:
	//		an object containing properties to assign to the returned object
	//	returns:
	//		an Object of anonymous type
	//	example:
	//	|	var foo = { bar: "baz" };
	//	|	var thinger = dojo.delegate(foo, { thud: "xyzzy"});
	//	|	thinger.bar == "baz"; // delegated to foo
	//	|	foo.thud == undefined; // by definition
	//	|	thinger.thud == "xyzzy"; // mixed in from props
	//	|	foo.bar = "thonk";
	//	|	thinger.bar == "thonk"; // still delegated to foo's bar
}
=====*/

dojo.delegate = dojo._delegate = (function(){
	// boodman/crockford delegation w/ cornford optimization
	function TMP(){}
	return function(obj, props){
		TMP.prototype = obj;
		var tmp = new TMP();
		if(props){
			dojo._mixin(tmp, props);
		}
		return tmp; // Object
	};
})();

/*=====
dojo._toArray = function(obj, offset, startWith){
	//	summary:
	//		Converts an array-like object (i.e. arguments, DOMCollection) to an
	//		array. Returns a new Array with the elements of obj.
	//	obj: Object
	//		the object to "arrayify". We expect the object to have, at a
	//		minimum, a length property which corresponds to integer-indexed
	//		properties.
	//	offset: Number?
	//		the location in obj to start iterating from. Defaults to 0.
	//		Optional.
	//	startWith: Array?
	//		An array to pack with the properties of obj. If provided,
	//		properties in obj are appended at the end of startWith and
	//		startWith is the returned array.
}
=====*/

dojo._toArray = (function(){

	// Start with efficient version
	var fn = function(obj, offset, startWith){
		return (startWith || []).concat(Array.prototype.slice.call(obj, offset||0));
	};

	try {
		fn(dojo._getWin().document.childNodes);
	} catch(e) {

		// Fall back to slow version

		fn = function(obj, offset, startWith){
			var arr = startWith||[];
			var length = obj.length;
			for(var x = offset || 0; x < length; x++){ 
				arr.push(obj[x]); 
			} 
			return arr;
		};
	}

	return fn;
})();

dojo.partial = function(/*Function|String*/method /*, ...*/){
	//	summary:
	//		similar to hitch() except that the scope object is left to be
	//		whatever the execution context eventually becomes.
	//	description:
	//		Calling dojo.partial is the functional equivalent of calling:
	//		|	dojo.hitch(null, funcName, ...);

	return dojo.hitch.apply(dojo, [ null ].concat(Array.prototype.slice.call(arguments, 0))); // Function
};

dojo.clone = function(/*anything*/ o){
	// summary:
	//		Clones objects (including DOM nodes) and all children.
	//		Warning: do not clone cyclic structures.
	var i, r;

	if(!o){ return o; }

	// Check DOM node first

	if(typeof o.nodeType == 'number' && dojo.isHostMethod(o, 'cloneNode')){
		return o.cloneNode(true); // Node
	}

	if(dojo.isArray(o)){
		r = [];
		for(i = o.length;i--;){
			r[i] = dojo.clone(o[i]);
		}
		return r; // Array
	}

	if(dojo.isDate(o)){
		return new Date(o.getTime());	// Date
	}

	// Object objects (specific to dojo declared classes)

	if(typeof o == 'object' && o){
		r = new o.constructor();
		for(i in o){
			if(!(i in r) || r[i] != o[i]){
				r[i] = dojo.clone(o[i]);
			}
		}
		return r; // Object
	}
	return o; // anything
};

/*=====
dojo.trim = function(str){
	//	summary:
	//		Trims whitespace from both sides of the string
	//	str: String
	//		String to be trimmed
	//	returns: String
	//		Returns the trimmed string
	//	description:
	//		This version of trim() was selected for inclusion into the base due
	//		to its compact size and relatively good performance
	//		(see [Steven Levithan's blog](http://blog.stevenlevithan.com/archives/faster-trim-javascript)
	//		Uses String.prototype.trim instead, if available.
	//		The fastest but longest version of this function is located at
	//		dojo.string.trim()
	return "";	// String
}
=====*/

dojo.trim = String.prototype.trim ?
	function(str){ return str.trim(); } :
	function(str){ return str.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };