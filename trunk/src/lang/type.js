dojo.provide("dojo.lang.type");
dojo.require("dojo.lang.common");

dojo.lang.whatAmI = function(value) {
	dojo.deprecated("dojo.lang.whatAmI", "use dojo.lang.getType instead", "0.5");
	return dojo.lang.getType(value);
}
dojo.lang.whatAmI.custom = {};

dojo.lang.getType = function(/* object */value){
	//	summary
	//	Attempts to determine what type value is.
	try {
		if(dojo.lang.isArray(value)) { 
			return "array";	//	string 
		}
		if(dojo.lang.isFunction(value)) { 
			return "function";	//	string 
		}
		if(dojo.lang.isString(value)) { 
			return "string";	//	string 
		}
		if(dojo.lang.isNumber(value)) { 
			return "number";	//	string 
		}
		if(dojo.lang.isBoolean(value)) { 
			return "boolean";	//	string 
		}
		if(dojo.lang.isAlien(value)) { 
			return "alien";	//	string 
		}
		if(dojo.lang.isUndefined(value)) { 
			return "undefined";	//	string 
		}
		// FIXME: should this go first?
		for(var name in dojo.lang.whatAmI.custom) {
			if(dojo.lang.whatAmI.custom[name](value)) {
				return name;	//	string
			}
		}
		if(dojo.lang.isObject(value)) { return "object";	//	string }
	} catch(E) {}
	return "unknown";	//	string
}

dojo.lang.isNumeric = function(/* object */value){
	//	summary
	//	Returns if value can be interpreted as a number
	return (!isNaN(value) 
		&& isFinite(value) 
		&& (value != null) 
		&& !dojo.lang.isBoolean(value) 
		&& !dojo.lang.isArray(value) 
		&& !/^\s*$/.test(value)
	);	//	boolean
}

dojo.lang.isBuiltIn = function(/* object */value){
	//	summary
	//	Returns if value is of a type provided by core JavaScript
	return (dojo.lang.isArray(value)
		|| dojo.lang.isFunction(value)	
		|| dojo.lang.isString(value)
		|| dojo.lang.isNumber(value)
		|| dojo.lang.isBoolean(value)
		|| (value == null)
		|| (value instanceof Error)
		|| (typeof value == "error") 
	);	//	boolean
}

dojo.lang.isPureObject = function(/* object */value){
	//	summary
	//	Returns true for any value where the value of value.constructor == Object
	return ((value != null) 
		&& dojo.lang.isObject(value) 
		&& value.constructor == Object
	);	//	boolean
}

dojo.lang.isOfType = function(/* object */value, /* function */type, /* object? */keywordParameters) {
	//	summary
	//	Given a value and a datatype, this method returns true if the
	//	type of the value matches the datatype. The datatype parameter
	//	can be an array of datatypes, in which case the method returns
	//	true if the type of the value matches any of the datatypes.
	var optional = false;
	if (keywordParameters) {
		optional = keywordParameters["optional"];
	}
	if (optional && ((value === null) || dojo.lang.isUndefined(value))) {
		return true;	//	boolean
	}
	if(dojo.lang.isArray(type)){
		var arrayOfTypes = type;
		for(var i in arrayOfTypes){
			var aType = arrayOfTypes[i];
			if(dojo.lang.isOfType(value, aType)) {
				return true; 	//	boolean
			}
		}
		return false;	//	boolean
	}else{
		if(dojo.lang.isString(type)){
			type = type.toLowerCase();
		}
		switch (type) {
			case Array:
			case "array":
				return dojo.lang.isArray(value);	//	boolean
				break;
			case Function:
			case "function":
				return dojo.lang.isFunction(value);	//	boolean
				break;
			case String:
			case "string":
				return dojo.lang.isString(value);	//	boolean
				break;
			case Number:
			case "number":
				return dojo.lang.isNumber(value);	//	boolean
				break;
			case "numeric":
				return dojo.lang.isNumeric(value);	//	boolean
				break;
			case Boolean:
			case "boolean":
				return dojo.lang.isBoolean(value);	//	boolean
				break;
			case Object:
			case "object":
				return dojo.lang.isObject(value);	//	boolean
				break;
			case "pureobject":
				return dojo.lang.isPureObject(value);	//	boolean
				break;
			case "builtin":
				return dojo.lang.isBuiltIn(value);	//	boolean
				break;
			case "alien":
				return dojo.lang.isAlien(value);	//	boolean
				break;
			case "undefined":
				return dojo.lang.isUndefined(value);	//	boolean
				break;
			case null:
			case "null":
				return (value === null);	//	boolean
				break;
			case "optional":
				dojo.deprecated('dojo.lang.isOfType(value, [type, "optional"])', 'use dojo.lang.isOfType(value, type, {optional: true} ) instead', "0.5");
				return ((value === null) || dojo.lang.isUndefined(value));	//	boolean
				break;
			default:
				if (dojo.lang.isFunction(type)) {
					return (value instanceof type);	//	boolean
				} else {
					dojo.raise("dojo.lang.isOfType() was passed an invalid type");
				}
				break;
		}
	}
	dojo.raise("If we get here, it means a bug was introduced above.");
}

dojo.lang.getObject=function(/* String */ str){
	//	summary
	//	Will return an object, if it exists, based on the name in the passed string.
	var parts=str.split("."), i=0, obj=dj_global; 
	do{ 
		obj=obj[parts[i++]]; 
	}while(i<parts.length&&obj); 
	return (obj!=dj_global)?obj:null;	//	Object
}

dojo.lang.doesObjectExist=function(/* String */ str){
	//	summary
	//	Check to see if object [str] exists, based on the passed string.
	var parts=str.split("."), i=0, obj=dj_global; 
	do{ 
		obj=obj[parts[i++]]; 
	}while(i<parts.length&&obj); 
	return (obj&&obj!=dj_global);	//	boolean
}
