dojo.provide("dojo.i18n.number");

dojo.require("dojo.experimental");
dojo.require("dojo.regexp");
dojo.require("dojo.i18n.common");

/**
* Method to Format and validate a given number
*
* @param Number value
*	The number to be formatted and validated.
* @param int places
*   The number of decimal places to be included in the formatted number
* @param String locale
*	The locale used to determine the currency.
* @return String
* 	the formatted number of type String if successful; Nan if an
* 	invalid currency is provided or null if an unsupported locale value was provided.
**/
dojo.i18n.number.format = function(value, places, locale /*optional*/){
	var formatData = dojo.i18n._mapToLocalizedFormatData(locale, dojo.i18n.number.FORMAT_TABLE);
	throw "not implemented";
};

/**
* Method to convert a properly formatted int string to a primative numeric value.
*
* @param String value
*	The int string to be convertted
* @param string locale
*	The locale used to convert the number string
* @return Number
* 	Returns a primative numeric value or null if an unsupported locale is provided.
**/
dojo.i18n.number.parse = function(value, locale /*optional*/){
	var formatData = dojo.i18n._mapToLocalizedFormatData(locale, dojo.i18n.number.FORMAT_TABLE);
	throw "not implemented";
};

/**
  Validates whether a string is in an integer format. 

  @param value  A string.
  @param locale the locale to determine formatting used.  By default, the locale defined by the
    host environment: dojo.locale
  @param flags  An object.
    flags.signed  The leading plus-or-minus sign.  Can be true, false, or [true, false].
      Default is [true, false], (i.e. sign is optional).
    flags.separator  The character used as the thousands separator.  Default is no separator.
      For more than one symbol use an array, e.g. [",", ""], makes ',' optional.
  @return  true or false.
*/
dojo.i18n.number.isInteger = function(value, locale /*optional*/, flags /*optional*/) {
	flags = (typeof flags == "object") ? flags : {};

	var formatData = dojo.i18n._mapToLocalizedFormatData(locale, dojo.i18n.number.FORMAT_TABLE);
	if (typeof flags.separator == "undefined") {flags.separator = formatData[1];}
	if (typeof flags.groupSize == "undefined") {flags.groupSize = formatData[3];}
	if (typeof flags.groupSize2 == "undefined") {flags.groupSize2 = formatData[4];}

	var re = new RegExp("^" + dojo.regexp.integer(flags) + "$");
	return re.test(value);
};

/**
  Validates whether a string is a real valued number. 
  Format is the usual exponential notation.

  @param value  A string.
  @param locale the locale to determine formatting used.  By default, the locale defined by the
    host environment: dojo.locale
  @param flags  An object.
    flags.places  The integer number of decimal places.
      If not given, the decimal part is optional and the number of places is unlimited.
    flags.decimal  The character used for the decimal point.  Default is ".".
    flags.exponent  Express in exponential notation.  Can be true, false, or [true, false].
      Default is [true, false], (i.e. the exponential part is optional).
    flags.eSigned  The leading plus-or-minus sign on the exponent.  Can be true, false, 
      or [true, false].  Default is [true, false], (i.e. sign is optional).
    flags in regexp.integer can be applied.
  @return  true or false.
*/
dojo.i18n.number.isReal = function(value, locale /*optional*/, flags /*optional*/) {
	flags = (typeof flags == "object") ? flags : {};

	var formatData = dojo.i18n._mapToLocalizedFormatData(locale, dojo.i18n.number.FORMAT_TABLE);
	if (typeof flags.separator == "undefined") {flags.separator = formatData[1];}
	if (typeof flags.decimal == "undefined") {flags.decimal = formatData[2];}
	if (typeof flags.groupSize == "undefined") {flags.groupSize = formatData[3];}
	if (typeof flags.groupSize2 == "undefined") {flags.groupSize2 = formatData[4];}

	var re = new RegExp("^" + dojo.regexp.realNumber(flags) + "$");
	return re.test(value);
};

//TODO: change to use hashes and mixins, rather than arrays?
dojo.i18n.number.FORMAT_TABLE = {
	//0: thousand seperator for monetory, 1: thousand seperator for number, 2: decimal seperator, 3: group size, 4: second group size because of india
	'ar-ae': ["","", ",", 1],
	'ar-bh': ["","",",", 1],
	'ar-dz': ["","",",", 1],
	'ar-eg': ["","", ",", 1],
	'ar-jo': ["","",",", 1],
	'ar-kw': ["","", ",", 1],
	'ar-lb': ["","", ",", 1],
	'ar-ma': ["","", ",", 1],
	'ar-om': ["","", ",", 1],
	'ar-qa': ["","", ",", 1],
	'ar-sa': ["","", ",", 1],
	'ar-sy': ["","", ",", 1],
	'ar-tn': ["","", ",", 1],
	'ar-ye': ["","", ",", 1],
	'cs-cz': [".",".", ",", 3],
	'da-dk': [".",".", ",", 3],
	'de-at': [".",".", ",", 3],
	'de-de': [".",".", ",", 3],
	'de-lu': [".",".", ",", 3],
	//IBM JSL defect 51278. right now we have problem with single quote.
	'de-ch': ["'","'", ".", 3],
	//'de-ch': [".",".", ",", 3],
	'el-gr': [".",".", ",", 3],
	'en-au': [",",",", ".", 3],
	'en-ca': [",",",", ".", 3],
	'en-gb': [",",",", ".", 3],
	'en-hk': [",",",", ".", 3],
	'en-ie': [",",",", ".", 3],
	'en-in': [",",",", ".", 3,2],//india-english, 1,23,456.78
	'en-nz': [",",",", ".", 3],
	'en-us': [",",",", ".", 3],
	'en-za': [",",",", ".", 3],
	
	'es-ar': [".",".", ",", 3],
	'es-bo': [".",".", ",", 3],
	'es-cl': [".",".", ",", 3],
	'es-co': [".",".", ",", 3],
	'es-cr': [".",".", ",", 3],
	'es-do': [".",".", ",", 3],
	'es-ec': [".",".", ",", 3],
	'es-es': [".",".", ",", 3],
	'es-gt': [",",",", ".", 3],
	'es-hn': [",",",", ".", 3],
	'es-mx': [",",",", ".", 3],
	'es-ni': [",",",", ".", 3],
	'es-pa': [",",",", ".", 3],
	'es-pe': [",",",", ".", 3],
	'es-pr': [",",",", ".", 3],
	'es-py': [".",".",",", 3],
	'es-sv': [",", ",",".", 3],
	'es-uy': [".",".",",", 3],
	'es-ve': [".",".", ",", 3],
	
	'fi-fi': [" "," ", ",", 3],
	
	'fr-be': [".",".",",", 3],
	'fr-ca': [" ", " ", ",", 3],
	
	'fr-ch': [" ", " ",".", 3],
	
	'fr-fr': [" "," ", ",", 3],
	'fr-lu': [".",".", ",", 3],
	
	'he-il': [",",",", ".", 3],
	
	'hu-hu': [" ", " ",",", 3],
	
	'it-ch': [" "," ", ".", 3],
	
	'it-it': [".",".", ",", 3],
	'ja-jp': [",",",", ".", 3],
	'ko-kr': [",", ",",".", 3],
	
	'no-no': [".",".", ",", 3],
	
	'nl-be': [" "," ", ",", 3],
	'nl-nl': [".",".", ",", 3],
	'pl-pl': [".", ".",",", 3],
	
	'pt-br': [".",".", ",", 3],
	'pt-pt': [".",".", "$", 3],
	'ru-ru': [" ", " ",",", 3],
	
	'sv-se': ["."," ", ",", 3],
	
	'tr-tr': [".",".", ",", 3],
	
	'zh-cn': [",",",", ".", 3],
	'zh-hk': [",",",",".", 3],
	'zh-tw': [",", ",",".", 3]
};
