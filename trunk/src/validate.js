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
