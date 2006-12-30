dojo.provide("dojo.lang.type");
dojo.require("dojo.lang.common");

dojo.lang.whatAmI = {};
dojo.lang.whatAmI.custom = {
	// summary: contains mapping of objects to custom type names
};

dojo.lang.getType = function(/* anything */ value){
	// summary: Attempts to determine what type value is.
	// value: Any literal value or object instance.
	var dl = dojo.lang;
	var defaultTypes = [
		"array", "function", "string", "number", "boolean", "alien", "undefined"
	];
	try{
		for(var name in defaultTypes){
			if(defaultTypes["is"+name.substring(0,1).toUpperCase()+name.substring(1)](value)){
				return name; //	string
			}
		}
		// FIXME: should this go first?
		for(var name in dl.whatAmI.custom){
			if(dl.whatAmI.custom[name](value)){
				return name;	//	string
			}
		}
		if(dl.isObject(value)){ 
			return "object";	//	string 
		}
	}catch(e){}
	return "unknown";	//	string
}

dojo.lang.isNumeric = function(/* anything */ value){
	// summary:
	//		Returns true if value can be interpreted as a number
	// value: Any literal value or object instance.
	// examples: 
	//		dojo.lang.isNumeric(3);                 // returns true
	//		dojo.lang.isNumeric("3");               // returns true
	//		dojo.lang.isNumeric(new Number(3));     // returns true
	//		dojo.lang.isNumeric(new String("3"));   // returns true
	//
	//		dojo.lang.isNumeric(3/0);               // returns false
	//		dojo.lang.isNumeric("foo");             // returns false
	//		dojo.lang.isNumeric(new Number("foo")); // returns false
	//		dojo.lang.isNumeric(false);             // returns false
	//		dojo.lang.isNumeric(true);              // returns false
	return (!isNaN(value) 
		&& isFinite(value) 
		&& (value != null) 
		&& !dojo.lang.isBoolean(value) 
		&& !dojo.lang.isArray(value) 
		&& !/^\s*$/.test(value)
	);	//	boolean
}

dojo.lang.isBuiltIn = function(/* anything */ value){
	// summary:
	//		Returns true if value is of a type provided by core JavaScript
	// description: 
	//		Returns true for any literal, and for any object that is an
	//		instance of a built-in type like String, Number, Boolean, Array,
	//		Function, or Error.  
	// value: Any literal value or object instance.
	var dl = dojo.lang;
	
	return (dl.isArray(value)
		|| dl.isFunction(value)	
		|| dl.isString(value)
		|| dl.isNumber(value)
		|| dl.isBoolean(value)
		|| (value == null)
		|| (value instanceof Error)
		|| (typeof value == "error") 
	);	//	boolean
}

dojo.lang.isPureObject = function(/* anything */ value){
	// summary:
	//		Returns true for any value where the value of value.constructor ==
	//		Object
	// description: 
	//		Returns true for any literal, and for any object that is an
	//		instance of a built-in type like String, Number, Boolean, Array,
	//		Function, or Error.
	// value:
	//		Any literal value or object instance.
	// examples: 
	//		dojo.lang.isPureObject(new Object()); // returns true
	//		dojo.lang.isPureObject({a: 1, b: 2}); // returns true
	//
	//		dojo.lang.isPureObject(new Date());   // returns false
	//		dojo.lang.isPureObject([11, 2, 3]);   // returns false
	return ((value != null) 
		&& dojo.lang.isObject(value) 
		&& value.constructor == Object
	);	//	boolean
}

dojo.lang.isOfType = function(/* anything */ value, /* function */ type, /* object? */ keywordParameters) {
	/* summary:
	 *	 Returns true if 'value' is of type 'type'
	 * description: 
	 *	 Given a value and a datatype, this method returns true if the
	 *	 type of the value matches the datatype. The datatype parameter
	 *	 can be an array of datatypes, in which case the method returns
	 *	 true if the type of the value matches any of the datatypes.
	 * value: Any literal value or object instance.
	 * type: A class of object, or a literal type, or the string name of a type, or an array with a list of types.
	 * keywordParameters: {optional: boolean}
	 */
	 
	/* examples: 
	 *   dojo.lang.isOfType("foo", String);                // returns true
	 *   dojo.lang.isOfType(12345, Number);                // returns true
	 *   dojo.lang.isOfType(false, Boolean);               // returns true
	 *   dojo.lang.isOfType([6, 8], Array);                // returns true
	 *   dojo.lang.isOfType(dojo.lang.isOfType, Function); // returns true
	 *   dojo.lang.isOfType({foo: "bar"}, Object);         // returns true
	 *   dojo.lang.isOfType(new Date(), Date);             // returns true
	 *
	 *   dojo.lang.isOfType("foo", "string");                // returns true
	 *   dojo.lang.isOfType(12345, "number");                // returns true
	 *   dojo.lang.isOfType(false, "boolean");               // returns true
	 *   dojo.lang.isOfType([6, 8], "array");                // returns true
	 *   dojo.lang.isOfType(dojo.lang.isOfType, "function"); // returns true
	 *   dojo.lang.isOfType({foo: "bar"}, "object");         // returns true
	 *   dojo.lang.isOfType(xxxxx, "undefined");             // returns true
	 *   dojo.lang.isOfType(null, "null");                   // returns true
	 *
	 *   dojo.lang.isOfType("foo", [Number, String, Boolean]); // returns true
	 *   dojo.lang.isOfType(12345, [Number, String, Boolean]); // returns true
	 *   dojo.lang.isOfType(false, [Number, String, Boolean]); // returns true
	 *
	 *   dojo.lang.isOfType(null, Date, {optional: true} );    // returns true	// description: 
	 */
	var dl = dojo.lang;
	var optional = false;
	if(keywordParameters){
		optional = keywordParameters["optional"];
	}
	if(optional && ((value === null) || dl.isUndefined(value))){
		return true;	//	boolean
	}
	if(dl.isArray(type)){
		var arrayOfTypes = type;
		for(var i in arrayOfTypes){
			var aType = arrayOfTypes[i];
			if(dl.isOfType(value, aType)){
				return true; 	//	boolean
			}
		}
		return false;	//	boolean
	}else{
		if(dl.isString(type)){
			type = type.toLowerCase();
		}
		switch (type) {
			case Array:
			case "array":
				return dl.isArray(value);	//	boolean
			case Function:
			case "function":
				return dl.isFunction(value);	//	boolean
			case String:
			case "string":
				return dl.isString(value);	//	boolean
			case Number:
			case "number":
				return dl.isNumber(value);	//	boolean
			case "numeric":
				return dl.isNumeric(value);	//	boolean
			case Boolean:
			case "boolean":
				return dl.isBoolean(value);	//	boolean
			case Object:
			case "object":
				return dl.isObject(value);	//	boolean
			case "pureobject":
				return dl.isPureObject(value);	//	boolean
			case "builtin":
				return dl.isBuiltIn(value);	//	boolean
			case "alien":
				return dl.isAlien(value);	//	boolean
			case "undefined":
				return dl.isUndefined(value);	//	boolean
			case null:
			case "null":
				return (value === null);	//	boolean
			default:
				if(dl.isFunction(type)){
					return (value instanceof type);	//	boolean
				}else{
					dojo.raise("dl.isOfType() was passed an invalid type");
				}
		}
	}
	dojo.raise("If we get here, it means a bug was introduced above.");
}
