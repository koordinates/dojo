dojo.provide("dojo.validate");

// currently a stub for dojo.validate


dojo.validate = {};

dojo.validate.isText = function(value) {
	return (dojo.lang.isString(value) && value.search(/\S/) != -1);
}

dojo.validate.isInteger = function(value) {
	if (!dojo.lang.isNumber(value)) {
		return false;
	}
	value = value.replace(/^\+/, "");//remove leading plus sign
	return (parseInt(value).toString() == value);
}

dojo.validate.isValidNumber = function(value) {
	return dojo.lang.isNumber(value);
}

dojo.validate.isEmailAddress = function(value) {
	// FIXME: very basic email validation
	// strip out mailto: or <>
	value = value.replace(/mailto:/i, "");
	value = value.replace(/[<>]*/g, "");
	//if((value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) 
	return (!value.match(/[^0-9a-zA-Z+-._@]+/g);
}
