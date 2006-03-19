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
 * Parse a reference specified as a string descriptor into 
 * an object reference and a prop name.
 */
dojo.lang.evalDescriptor = function(descriptor, context, create)
{
	var obj = (context ? context : dj_global);
	var names = descriptor.split('.');
	var prop = names.pop();
	var name = '';
	while(names.length && obj){
		name = names.shift();
		obj = (name in obj ? obj[name] : (create ? obj[name] = {} : null));
	}
	return {obj: obj, prop: prop};
}

/**
 * Get a value from a reference specified as a string descriptor. 
 * 
 * getObjPathValue(String descriptor, [, Object context, Boolean create])
 *
 * If context is not specified, dj_global is used
 * If create is true, undefined objects in the descriptor are created.
 */
dojo.lang.getObjPathValue = function(descriptor, context, create)
{
	with (dojo.lang.evalDescriptor(descriptor, context, create)){
		return (obj && (prop in obj) ? obj[prop] : (create ? obj[prop] = undefined : undefined));
	}
}

/**
 * Set a value on a reference specified as a string descriptor. 
 * 
 * setObjPathValue(String descriptor, value [, Object context, Boolean nocreate])
 *
 * If context is not specified, dj_global is used
 * If nocreate is true, undefined objects in the descriptor are NOT created.
 */
dojo.lang.setObjPathValue = function(descriptor, value, context, nocreate)
{
	with (dojo.lang.evalDescriptor(descriptor, context, !nocreate)){
		if (obj && (!nocreate || (prop in obj))){
  		obj[prop] = value;
		}
	}
}
