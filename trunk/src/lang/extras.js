dojo.provide("dojo.lang.extras");

dojo.require("dojo.lang.common");
dojo.require("dojo.lang.type");

/**
 * Sets a timeout in milliseconds to execute a function in a given context
 * with optional arguments.
 *
 * setTimeout (Object context, function func, number delay[, arg1[, ...]]);
 * setTimeout (function func, number delay[, arg1[, ...]]);
 */
dojo.lang.setTimeout = function(func, delay){
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
	for (var i = argsStart; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	return setTimeout(function () { func.apply(context, args); }, delay);
}

dojo.lang.getNameInObj = function(ns, item){
	if(!ns){ ns = dj_global; }

	for(var x in ns){
		if(ns[x] === item){
			return new String(x);
		}
	}
	return null;
}

dojo.lang.shallowCopy = function(obj) {
	var ret = {}, key;
	for(key in obj) {
		if(dojo.lang.isUndefined(ret[key])) {
			ret[key] = obj[key];
		}
	}
	return ret;
}

/**
 * Return the first argument that isn't undefined
 */
dojo.lang.firstValued = function(/* ... */) {
	for(var i = 0; i < arguments.length; i++) {
		if(typeof arguments[i] != "undefined") {
			return arguments[i];
		}
	}
	return undefined;
}

/**
 * Set a value on a reference specified as a string descriptor. 
 * If inCreate is true, undefined objects in the descriptor are created.
 */
dojo.lang.setObjPathValue = function(inDescriptor, inValue, inCreate)
{
	var obj = dj_global;
	var names = inDescriptor.split('.');
	var prop = names.pop();
	var name = '';
	while(names.length && obj){
		name = names.shift();
		obj = (name in obj ? obj[name] : (inCreate ? obj[name] = {} : null));
	}
	if (obj && (inCreate || (prop in obj))){
  	obj[prop] = inValue;
	}
}
