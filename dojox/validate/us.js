define(["dojo/_base/kernel", "./_base", "./regexp"], function(dojo, validate, xregexp){

var us = dojo.getObject("us", true, validate);
us.isState = function(/*String*/value, /*Object?*/flags){
	// summary: Validates US state and territory abbreviations.
	//
	// value: A two character string
	// flags: An object
	//    flags.allowTerritories  Allow Guam, Puerto Rico, etc.  Default is true.
	//    flags.allowMilitary  Allow military 'states', e.g. Armed Forces Europe (AE).  Default is true.

	var re = new RegExp("^" + xregexp.us.state(flags) + "$", "i");
	return re.test(value); // Boolean
};

us.isPhoneNumber = function(/*String*/value){
	// summary: Validates 10 US digit phone number for several common formats
	// value: The telephone number string

	var flags = {
		format: [
			"###-###-####",
			"(###) ###-####",
			"(###) ### ####",
			"###.###.####",
			"###/###-####",
			"### ### ####",
			"###-###-#### x#???",
			"(###) ###-#### x#???",
			"(###) ### #### x#???",
			"###.###.#### x#???",
			"###/###-#### x#???",
			"### ### #### x#???",
			"##########"
		]
	};
	return validate.isNumberFormat(value, flags); // Boolean
};

us.isSocialSecurityNumber = function(/*String*/value){
	// summary: Validates social security number
	var flags = {
		format: [
			"###-##-####",
			"### ## ####",
			"#########"
		]
	};
	return validate.isNumberFormat(value, flags); // Boolean
};

us.isZipCode = function(/*String*/value){
	// summary: Validates U.S. zip-code
	var flags = {
		format: [
			"#####-####",
			"##### ####",
			"#########",
			"#####"
		]
	};
	return validate.isNumberFormat(value, flags); // Boolean
};

return us;
});
