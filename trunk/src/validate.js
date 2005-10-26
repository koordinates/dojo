dojo.provide("dojo.validate");
dojo.require("dojo.lang");

// currently a stub for dojo.validate

dojo.validate.isText = function(value) {
	return (dojo.lang.isString(value) && value.search(/\S/) != -1);
}

dojo.validate.isInteger = function(value) {
	if (!dojo.lang.isNumber(value)) {
		return false;
	}
	return Math.round(value) == value;
}

dojo.validate.isValidNumber = function(value) {
	return dojo.lang.isNumber(value);
}

// FIXME: may be too basic
dojo.validate.isEmailAddress = function(value, allowLocal, allowCruft) {
	if(allowCruft) { value = value.replace(/mailto:/i, ""); }
	var part = "[\\w\\.\\-\\+]+";
	var cruft = allowCruft ? "<?" : "";
	var local = allowLocal ? "" : "\\." + part;
	// regexp: /^<?([\w\.\-\+]+)@([\w\.\-\+]+\.[\w\.\-\+]+)>?$/i
	var re = new RegExp("^" + cruft + "(" + part + ")@(" + part + local + ")" + cruft + "$", "i");
	return re.test(value);
}

// FIXME: should this biggyback on isEmailAddress or just have its own RegExp?
dojo.validate.isEmailAddressList = function(value, allowLocal, allowCruft) {
	var values = value.split(/\s*[\s;,]\s*/gi);
	for(var i = 0; i < values.length; i++) {
		if(!dojo.validate.isEmailAddress(values[i], allowLocal, allowCruft)) {
			return false;
		}
	}
	return true;
}
