dojo.provide("dojo.lang.extras");

dojo.require("dojo.lang.common");

dojo.lang.setTimeout = function(/*Function*/func, /*int*/delay /*, ...*/){
	// summary:
	//		Sets a timeout in milliseconds to execute a function in a given
	//		context with optional arguments.
	// usage:
	//		dojo.lang.setTimeout(Object context, function func, number delay[, arg1[, ...]]);
	//		dojo.lang.setTimeout(function func, number delay[, arg1[, ...]]);

	var context = window, argsStart = 2;
	if(!dojo.lang.isFunction(func)){
		context = func;
		func = delay;
		delay = arguments[2];
		argsStart++;
	}

	if(dojo.lang.isString(func)){
		func = context[func];
	}
	
	var args = [];
	for (var i = argsStart; i < arguments.length; i++){
		args.push(arguments[i]);
	}
	return dojo.global().setTimeout(function(){ func.apply(context, args); }, delay); // int
}

dojo.lang.clearTimeout = function(/*int*/timer){
	// summary: clears timer by number from the execution queue

	// FIXME:
	//		why do we have this function? It's not portable outside of browser
	//		environments and it's a stupid wrapper on something that browsers
	//		provide anyway.
	dojo.global().clearTimeout(timer);
}

dojo.lang.getNameInObj = function(/*Object*/ns, /*unknown*/item){
	// summary: 
	//		looks for a value in the object ns with a value matching item and
	//		returns the property name
	// ns: if null, dj_global is used
	// item: value to return a name for
	if(!ns){ ns = dj_global; }

	for(var x in ns){
		if(ns[x] === item){
			return new String(x); // String
		}
	}
	return null; // null
}

dojo.lang.shallowCopy = function(/*Object*/obj, /*Boolean?*/deep){
	// summary:
	//		copies object obj one level deep, or full depth if deep is true

	// FIXME: why is this called "shallowCopy" if it *can* do a deep copy?
	var i, ret;	

	if(obj === null){ /*obj: null*/ return null; } // null
	
	if(dojo.lang.isObject(obj)){
		// obj: Object	
		ret = new obj.constructor();
		for(i in obj){
			if(dojo.lang.isUndefined(ret[i])){
				ret[i] = deep ? dojo.lang.shallowCopy(obj[i], deep) : obj[i];
			}
		}
	}else if(dojo.lang.isArray(obj)){
		// obj: Array
		ret = [];
		for(i=0; i<obj.length; i++){
			ret[i] = deep ? dojo.lang.shallowCopy(obj[i], deep) : obj[i];
		}
	}else{
		// obj: Object
		ret = obj;
	}

	return ret; // Object
}

dojo.lang.firstValued = function(/* ... */){
	// summary: Return the first argument that isn't undefined

	for(var i = 0; i < arguments.length; i++){
		if(typeof arguments[i] != "undefined"){
			return arguments[i]; // Object
		}
	}
	return undefined; // undefined
}
