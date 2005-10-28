dojo.provide("dojo.validate");
dojo.provide("dojo.validate.us");
dojo.require("dojo.lang");

dojo.validate.isText = function(value) {
	return /\S/.test(value);
}

dojo.validate.isInteger = function(value) {
	// No leading zeros allowed
	return /^[-+]?(0|[1-9]\d*)$/.test(value);	
}

dojo.validate.isNumber = function(value) {
	// Decimal part is optional, exponents are optional, trailing zeros allowed to show precision.
	return /^[-+]?(0|[1-9]\d*)(\.\d+)?([eE][-+]?(0|[1-9]\d*))?$/.test(value);	
}

// FIXME: may be too basic
dojo.validate.isEmailAddress = function(value, allowLocal, allowCruft) {
	// 	return /^([\da-z]+[-._+&\'])*[\da-z]+@([\da-z][-\da-z]*[\da-z]\.)+[a-z]{2,6}$/i.test(value);
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

/**
	Returns true if the date conforms to the format given and is a valid date. Otherwise returns false.

	@param dateValue The date
	@param format  The format (default MM/DD/YYYY)
	@return true or false

	Accepts any type of format, including ISO8601 and RFC3339.
	All characters in the format string are treated literally except the 
	following tokens:

	YYYY - matches a 4 digit year
	M - matches a non zero-padded month
	MM - matches a zero-padded month
	D -  matches a non zero-padded date
	DD -  matches a zero-padded date
	DDD -  matches an ordinal date, 1-365, and 366 on leapyear
	ww - matches week of year, 1-53
	d - matches day of week, 1-7

	Examples: These are all today's date.

	Date					Format
	2005-W42-3		YYYY-Www-d
	2005-292			YYYY-DDD
	20051019			YYYYMMDD
	10/19/2005		M/D/YYYY
	19.10.2005		D.M.YYYY
*/
dojo.validate.isValidDate = function(dateValue, format) {
	// Default is the American format
	format = (typeof format == "undefined" || format == "") ? "MM/DD/YYYY" : format;

	// Create a literal regular expression based on format
	var reLiteral = format.replace(/([$^.*+?=!:|\/\\\(\)\[\]\{\}])/g, "\\$1");		// escape special char

	// Convert all the tokens to RE elements
	reLiteral = reLiteral.replace( "YYYY", "([0-9]{4})" );
	reLiteral = reLiteral.replace( "MM", "(0[1-9]|10|11|12)" );
	reLiteral = reLiteral.replace( "M", "([1-9]|10|11|12)" );
	reLiteral = reLiteral.replace( "DDD", "(00[1-9]|0[1-9][0-9]|[12][0-9][0-9]|3[0-5][0-9]|36[0-6])" );
	reLiteral = reLiteral.replace( "DD", "(0[1-9]|[12][0-9]|30|31)" );
	reLiteral = reLiteral.replace( "D", "([1-9]|[12][0-9]|30|31)" );
	reLiteral = reLiteral.replace( "ww", "(0[1-9]|[1-4][0-9]|5[0-3])" );
	reLiteral = reLiteral.replace( "d", "([1-7])" );

	// Anchor pattern to begining and end of string
	reLiteral = "^" + reLiteral + "$";

	// Dynamic RE that parses the original format given
	var re = new RegExp(reLiteral);
	
	// Test if date is in a valid format
	if (!re.test(dateValue))  return false;

	// Parse date to get elements and check if date is valid
	// Assume valid values for date elements not given.
	var year = 0, month = 1, date = 1, dayofyear = 1, week = 1, day = 1;

	// Capture tokens
	var tokens = format.match( /(YYYY|MM|M|DDD|DD|D|ww|d)/g );

	// Capture date values
	var values = re.exec(dateValue);

	// Match up tokens with date values
	for (var i = 0; i < tokens.length; i++) {
		switch (tokens[i]) {
		case "YYYY":
			year = Number(values[i+1]); break;
		case "M":
		case "MM":
			month = Number(values[i+1]); break;
		case "D":
		case "DD":
			date = Number(values[i+1]); break;
		case "DDD":
			dayofyear = Number(values[i+1]); break;
		case "ww":
			week = Number(values[i+1]); break;
		case "d":
			day = Number(values[i+1]); break;
		}
	}

	// Leap years are divisible by 4, but not by 100, unless by 400
	var leapyear = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));

	// 31st of a month with 30 days
	if (date == 31 && (month == 4 || month == 6 || month == 9 || month == 11)) return false; 

	// February 30th or 31st
	if (date >= 30 && month == 2) return false; 

	// February 29th outside a leap year
	if (date == 29 && month == 2 && !leapyear) return false; 
	if (dayofyear == 366 && !leapyear)  return false;

	return true;
}

// Validates 24-hour military time format.
dojo.validate.is24HourTime = function(value) {
	// Zero-padding is required for hours, minutes, and seconds.  
	// Seconds are optional. Fractions of seconds are optional.
	return /^([0-1][0-9]|[2][0-3]):[0-5][0-9](:[0-5][0-9](\.\d+)?)?$/.test(value);	
}

// Validates 12-hour time format.
dojo.validate.is12HourTime = function(value) {
	// Zero-padding is no allowed for hours, required for minutes and seconds.
	// Seconds are optional. Fractions of seconds are optional.
	return /^([1-9]|1[0-2]):[0-5][0-9](:[0-5][0-9](\.\d+)?)?\s*(am|pm|a\.m\.|p\.m\.)$/i.test(value);	
}

// FIXME: add support for IPv6?
dojo.validate.isIpAddress = function(value) {
	// Each number is between 0-255.  Zero padding is allowed.
	return /^((\d|\d\d|[01]\d\d|2[0-4]\d|25[0-5])\.){3}(\d|\d\d|[01]\d\d|2[0-4]\d|25[0-5])$/.test(value);
}

// FIXME: is this redundant with the dojo.uri.Uri stuff
dojo.validate.isUrl = function(value) {
	// Domain name can not start or end with a dash. TLD has 2-6 letters. 
	if (/^((https?|ftps?)\:\/\/)?([\da-z][-\da-z]*[\da-z]\.)+[a-z]{2,6}(\/\S*)?$/i.test(value)) return true;

	// Otherwise 2nd chance to check for IP based URL
	return /^((https?|ftps?)\:\/\/)?((\d|\d\d|[01]\d\d|2[0-4]\d|25[0-5])\.){3}(\d|\d\d|[01]\d\d|2[0-4]\d|25[0-5])(\/\S*)?$/.test(value);
}

// Validates U.S. currency
dojo.validate.us.isCurrency = function(value) {
	// Optional plus/minus sign, optional dollar-sign, optional cents, optional commas.
	return /^[-+]?\$?(0|[1-9]\d{0,2}(,?\d\d\d)*)(\.\d\d)?$/.test(value);	
}

// Validates 10 US digit phone number
dojo.validate.us.isPhoneNumber = function(value) {
	// Choice of 4 separators, round brackets optional.
	return /^\(?\d{3}\)?[- .]\d{3}[- .]\d{4}$/.test(value);
}

// Validates social security number
dojo.validate.us.isSocialSecurityNumber = function(value) {
	// Choice of 2 separators, or no separators.
	return /^\d{3}([- ]?)\d{2}\1\d{4}$/.test(value);
}

// Validates U.S. zip-code
dojo.validate.us.isZipCode = function(value) {
	// Choice of 2 separators, or none, last 4 digits optional.
	return /^\d{5}([- ]?\d{4})?$/.test(value);
}

// Validates states and and territories of the United States in a 2 character format.
dojo.validate.us.isState = function(value) {
	return /^(AL|AK|AS|AZ|AR|CA|CO|CT|DE|DC|FM|FL|GA|GU|HI|ID|IL|IN|IA|KS|KY|LA|ME|MH|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|MP|OH|OK|OR|PW|PA|PR|RI|SC|SD|TN|TX|UT|VT|VI|VA|WA|WV|WI|WY)$/i.test(value);
}
