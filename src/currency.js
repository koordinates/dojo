dojo.provide("dojo.currency");

dojo.require("dojo.number");
dojo.require("dojo.i18n.common");
dojo.requireLocalization("dojo.i18n.cldr", "currency");
dojo.require("dojo.i18n.cldr.currencydata");

dojo.currency._mixInDefaults = function(options){
	// Get locale-independent currency data, like # of places
	var iso = options.currency;
	var data = dojo.lang.mixin({},dojo.i18n.cldr.currencydata.getData(iso));
	options = dojo.lang.mixin(data, options || {});
	options.type = "currency";

	// Get locale-depenent currency data, like the symbol
	var bundle = dojo.i18n.getLocalization("dojo.i18n.cldr", "currency", options.locale) || {};
	options.currencyData = bundle[iso] || {};
	options.currencyData.iso4217 = iso;
 	return options;
}

dojo.currency.format = function(/*Number*/value, /*Object?*/options){
// summary:
//		Format a Number as a String, using locale-specific settings
//
// description:
//		Create a string from a Number using a known localized pattern.
//		Formatting patterns appropriate to the locale are chosen from the CLDR http://unicode.org/cldr
//		as well as the appropriate symbols and delimiters.  See http://www.unicode.org/reports/tr35/#Number_Elements
//
// value:
//		the number to be formatted.
//
// options: object {currency: String, pattern: String?, type: String?, places: Number?, round: Boolean?, currencyData: Object?, locale: String?}
//		currency- the ISO4217 currency code, a three letter sequence like "USD"
//			See http://en.wikipedia.org/wiki/ISO_4217
//		pattern- override formatting pattern with this string (see dojo.number.applyPattern)
//		type- choose a format type based on the locale from the following: decimal, scientific, percent, currency. decimal by default.
//		places- fixed number of decimal places to show.  This overrides any information in the provided pattern.
//		round- whether to round the number.  false by default //TODO
//		currencyData- object with currency information
//		locale- override the locale used to determine formatting rules

	return dojo.number.format(value, dojo.currency._mixInDefaults(options));
}

dojo.currency.regexp = function(/*Object?*/options){
//
// summary:
//		Builds the regular needed to parse a number
//
// description:
//		returns regular expression with positive and negative match, group and decimal separators
//
// options: object {pattern: String, type: String locale: String, strict: Boolean, places: mixed}
//		currency- the ISO4217 currency code, a three letter sequence like "USD"
//			See http://en.wikipedia.org/wiki/ISO_4217
//		pattern- override pattern with this string
//		type- choose a format type based on the locale from the following: decimal, scientific, percent, currency. decimal by default.
//		locale- override the locale used to determine formatting rules
//		strict- strict parsing, false by default
//		places- number of decimal places to accept: Infinity, a positive number, or a range "n,m"
//		currencyData- object with currency information
	return dojo.number.regexp(dojo.currency._mixInDefaults(options)); // String
}

dojo.currency.parse = function(/*String*/expression, /*Object?*/options){
//
// summary:
//		Convert a properly formatted string to a primitive Number,
//		using locale-specific settings.
//
// description:
//		Create a Number from a string using a known localized pattern.
//		Formatting patterns are chosen appropriate to the locale.
//		Formatting patterns are implemented using the syntax described at *URL*
//
// expression: A string representation of a Number
//
// options: object {pattern: string, locale: string, strict: boolean}
//		currency- the ISO4217 currency code, a three letter sequence like "USD"
//			See http://en.wikipedia.org/wiki/ISO_4217
//		pattern- override pattern with this string
//		type- choose a format type based on the locale from the following: decimal, scientific, percent, currency. decimal by default.
//		locale- override the locale used to determine formatting rules
//		strict- strict parsing, false by default
//		currencyData- object with currency information
	return dojo.number.parse(expression, dojo.currency._mixInDefaults(options));
}
