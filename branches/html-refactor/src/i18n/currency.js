dojo.provide("dojo.i18n.currency");

dojo.require("dojo.experimental");
dojo.require("dojo.regexp");
dojo.require("dojo.i18n.common");
dojo.require("dojo.i18n.number");
dojo.require("dojo.lang.common");

/**
* Method to Format and validate a given number a monetary value
*
* @param Number value
*	The number to be formatted and validated.
  @param String iso the ISO 4217 currency code
* @param int places
*   The number of decimal places to be included in the formatted number
* @param String locale the locale to determine formatting used.  By default, the locale defined by the
*   host environment: dojo.locale
* @return String
* 	the formatted currency of type String if successful; Nan if an
* 	invalid currency is provided or null if an unsupported locale value was provided.
**/
dojo.i18n.currency.format = function(value, iso, places /*optional*/, locale /*optional*/){
	var formatData = dojo.i18n.currency.FORMAT_TABLE[iso];
//TODO: set signed to false and handle sign separately
	var result = dojo.i18n.number.format(value, places, locale, formatData);
	switch (formatData.placement) {
		case "afterSpace":
			result = result + " "; // TODO: nbsp?
			// fallthrough...
		case "after":
			result = result + formatData.symbol;
			break;
		case "beforeSpace":
			result = " " + result; // TODO: nbsp?
			// fallthrough...
		default:
		case "before":
			result = formatData.symbol + result;
			break;
	}

	return result;
	//TODO other flags...
};

/**
* Method to convert a properly formatted monetary value to a primative numeric value.
*
* @param String value
*	The int string to be convertted
  @param String iso the ISO 4217 currency code
* @param String locale the locale to determine formatting used.  By default, the locale defined by the
*   host environment: dojo.locale
* @return Number
* 	Returns a primative numeric value or null if an unsupported locale is provided.
**/
dojo.i18n.currency.parse = function(value, iso, locale /*optional*/){
	dojo.unimplemented("dojo.i18n.currency.parse");
};

/**
  Validates whether a string denotes a monetary value. 

  @param value  A string
  @param iso the ISO 4217 currency code
  @param locale the locale to determine formatting used.  By default, the locale defined by the
    host environment: dojo.locale
  @param flags  An object
    flags.symbol  A currency symbol such as Yen "�", Pound "�", or the Euro sign "�".  
        The default is specified by the iso code.  For more than one symbol use an array, e.g. ["$", ""], makes $ optional.
        The empty array [] makes the default currency symbol optional.
    flags.placement  The symbol can come "before" or "after".  The default is specified by the iso code.
    flags.signed  The leading plus-or-minus sign.  Can be true, false, or [true, false].
      Default is [true, false], (i.e. sign is optional).
    flags.signPlacement  The sign can come "before" or "after" the symbol or "around" the whole expression
    	with parenthesis, such as CAD: (123$).  The default is specified by the iso code.
    flags.separator  The character used as the thousands separator. The default is specified by the locale.
        The empty array [] makes the default separator optional.
    flags.fractional  The appropriate number of decimal places for fractional currency (e.g. cents)
      Can be true, false, or [true, false].  Default is [true, false], (i.e. cents are optional).
    flags.places  The integer number of decimal places.
      If not given, an amount appropriate to the iso code is used.
    flags.fractional  The appropriate number of decimal places for fractional currency (e.g. cents)
      Can be true, false, or [true, false].  Default is [true, false], (i.e. cents are optional).
    flags.decimal  The character used for the decimal point.  The default is specified by the locale.
  @return  true or false.
*/
dojo.i18n.currency.isCurrency = function(value, iso, locale /*optional*/, flags){
	flags = (typeof flags == "object") ? flags : {};

	var numberFormatData = dojo.i18n.number._mapToLocalizedFormatData(locale, dojo.i18n.number.FORMAT_TABLE);
	if (typeof flags.separator == "undefined") {flags.separator = numberFormatData[0];}
	else if (dojo.lang.isArray(flags.separator)){flags.separator = [numberFormatData[0],""];}
	if (typeof flags.decimal == "undefined") {flags.decimal = numberFormatData[2];}
	if (typeof flags.groupSize == "undefined") {flags.groupSize = numberFormatData[3];}
	if (typeof flags.groupSize2 == "undefined") {flags.groupSize2 = numberFormatData[4];}

	var formatData = dojo.i18n.currency.FORMAT_TABLE[iso];
	if (typeof flags.places == "undefined") {flags.places = formatData.places;}
	if (typeof flags.symbol == "undefined") {flags.symbol = formatData.symbol;}
	else if (dojo.lang.isArray(flags.symbol)){flags.symbol = [formatData.symbol,""];}
	if (typeof flags.placement == "undefined") {flags.placement = formatData.placement;}
	//TODO more... or mixin?

	var re = new RegExp("^" + dojo.regexp.currency(flags) + "$");
//dojo.debug(value+":"+dojo.regexp.currency(flags)+"="+re.test(value));
	return re.test(value);
};

(function() {
	var arabic = {symbol: "\u062C", placement: "after", htmlSymbol: "?"};
	var euro = {symbol: "\u20AC", placement: "beforeSpace", htmlSymbol: "&euro;"};
	var euroAfter = {symbol: "\u20AC", placement: "after", htmlSymbol: "&euro;"};

//TODO: remember, afterSpace is a nbsp!
//Q: are signPlacement and currency symbol placement ISO-dependent or are they really locale-dependent?
/*TODO: htmlSymbol is for html entities, need images? (IBM: why? why can't we just use unicode everywhere?) */
dojo.i18n.currency.FORMAT_TABLE = {
	AED: {symbol: "\u062c", placement: "after"},
	ARS: {symbol: "$", signPlacement: "after"},
	//OLD ATS: {symbol: "S", placement: "beforeSpace"},
	//Austria using "EUR"
	ATS: {symbol: "\u20AC", placement: "beforeSpace", signPlacement: "after", htmlSymbol: "&euro;"}, //TODO: make sure combination for neg is euro + sign + space
	AUD: {symbol: "$"},
	BOB: {symbol: "$b"},
	BRL: {symbol: "R$", placement: "beforeSpace"},
	//_CURRENCY_FORMATS["BEF: {symbol: "BF", placement: "afterSpace"},
	//Belgium using "EUR"
	BEF: euroAfter,
	//_CURRENCY_FORMATS["BHD: {symbol: "\u062C", signPlacement: "end", places: 3, htmlSymbol: "?"},
	BHD: arabic,
	//ALP: 0: represents 'en' or other, 1: represents 'fr'.
	//TODO: clean this up.   Make an assoc array based on locale?  Make generic.
	CAD: [{symbol: "$"},
	  	{symbol: "$", placement: "after", signPlacement: "around"}],
	CHF: {symbol: "CHF", placement: "beforeSpace", signPlacement: "after"},
	CLP: {symbol: "$"},
	COP: {symbol: "$", signPlacement: "around"},
	CNY: {symbol: "\u00A5", htmlSymbol: "&yen;"},
	//// Costa Rica  - Spanish slashed C. need to find out the html entity image
	CRC: {symbol: "\u20A1", signPlacement: "after", htmlSymbol: "?"},
	// Czech Republic  - Czech //need image for html entities
	CZK: {symbol: "Kc", placement: "beforeSpace", signPlacement: "after"},
	DEM: euroAfter,
	DKK: {symbol: "kr.", placement: "beforeSpace", signPlacement: "after"},
	DOP: {symbol: "$"},
	//for html entities, need a image, bidi, using "rtl", so from the link, symbol is suffix
	//_CURRENCY_FORMATS["DZD: {symbol: "\u062C", signPlacement: "end", places: 3, htmlSymbol: "?"},
	DZD: arabic,
	//Ecuador using "USD"
	ECS: {symbol: "$", signPlacement: "after"},
	EGP: arabic,
	//_CURRENCY_FORMATS["ESP: {symbol: "Pts", placement: "afterSpace", places: 0},
	//spain using "EUR"
	ESP: euroAfter,
	EUR: euro,
	//_CURRENCY_FORMATS["FIM: {symbol: "mk", placement: "afterSpace", places: 2},
	//Finland using "EUR"
	FIM: euroAfter,
	//_CURRENCY_FORMATS["FRF: {symbol: "F", placement: "afterSpace", places: 2},
	//France using "EUR"
	FRF: euroAfter,
	GBP: {symbol: "\u00A3", htmlSymbol: "&pound;"},
	GRD: {symbol: "\u20AC", signPlacement: "end", htmlSymbol: "&euro;"}, //TODO: end
	GTQ: {symbol: "Q", signPlacement: "after"},
	//Hong Kong need "HK$" and "$". Now only support "HK$"
	HKD: {symbol: "HK$"},
	HNL: {symbol: "L.", signPlacement: "after"},
	HUF: {symbol: "Ft", placement: "afterSpace"},
	//IEP: {symbol: "\u00A3", htmlSymbol: "&pound;"},
	//ireland using "EUR" at the front.
	IEP: {symbol: "\u20AC", htmlSymbol: "&euro;"},
	//couldn't know what Israel - Hebrew symbol, some sites use "NIS", bidi, using "rtl", so from the link, symbol is suffix (IBM: huh?)
	//ILS: {symbol: "\u05E9\u0022\u05D7", signPlacement: "end", htmlSymbol: "?"},
	ILS: {symbol: "\u05E9\u0022\u05D7", placement: "after", htmlSymbol: "?"},
	INR: {symbol: "Rs."},
	//ITL: {symbol: "L", placement: "beforeSpace", signPlacement: "after", places: 0},
	//Italy using "EUR"
	ITL: {symbol: "\u20AC", signPlacement: "after", htmlSymbol: "&euro;"},
	JOD: arabic,
	JPY: {symbol: "\u00a5", places: 0, htmlSymbol: "&yen;"},
	KRW: {symbol: "\u20A9", places: 0, htmlSymbol: "?"},
	KWD: arabic,
	LBP: arabic,
	//LUF: {symbol: "LUF", placement: "afterSpace"},
	//for Luxembourg,using "EUR"
	LUF: euroAfter,
	MAD: arabic,
	MXN: {symbol: "$", signPlacement: "around"},
	NIO: {symbol: "C$", placement: "beforeSpace", signPlacement: "after"},
	//NLG: {symbol: "f", placement: "beforeSpace", signPlacement: "end"},
	//Netherlands, using "EUR"
	NLG: {symbol: "\u20AC", signPlacement: "end", htmlSymbol: "&euro;"}, //TODO: end
	NOK: {symbol: "kr", placement: "beforeSpace", signPlacement: "after"},
	NZD: {symbol: "$"},
	OMR: arabic,
	PAB: {symbol: "B/", placement: "beforeSpace", signPlacement: "after"},
	PEN: {symbol: "S/", signPlacement: "after"},
	//couldn't know what the symbol is from ibm link. (IBM: what does this mean?  Is the symbol 'z' wrong?)
	PLN: {symbol: "z", placement: "after"},
	//PTE: {symbol: "Esc.", placement: "afterSpace", places: 0},
	PTE: euroAfter,
	PYG: {symbol: "Gs.", signPlacement: "after"},
	QAR: arabic,
	RUR: {symbol: "rub.", placement: "after"},
	SAR: arabic,
	SEK: {symbol: "kr", placement: "afterSpace"},
	SGD: {symbol: "$"},
	//// El Salvador - Spanish slashed C. need to find out. (IBM: need to find out what?)
	SVC: {symbol: "\u20A1", placement: "after", signPlacement: "afterSpace"},
	//for html entities, need a image
	SYP: arabic,
	TND: arabic,
	TRL: {symbol: "TL", placement: "after"},
	TWD: {symbol: "NT$"},
	USD: {symbol: "$"},
	UYU: {symbol: "$U", placement: "beforeSpace"},
	VEB: {symbol: "Bs", signPlacement: "afterSpace"},
	YER: arabic,
	ZAR: {symbol: "R", signPlacement: "around"}
};

})();
/*
dojo.i18n.currency.OLD_FORMAT_TABLE = {
	//0: pos prefix, 1: neg prefix, 2: pos suffix, 3: neg suffix, 4: max decimal place, 5: min decimal place
	//6-9: unicode equivalents of 0-3
	//for html entities, need a image
	AED: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	ARS: ["$","$-",null,null,2,2, "\u0024", "\u0024\u002D", null,null],
	//_CURRENCY_FORMATS["ATS: ["S&nbsp;","-S&nbsp;",null,null,2,2, "\u0053\u0020", "\u002D\u0053\u0020", null,null],
	//Austria using "EUR"
	ATS: ["&euro;&nbsp;","&euro;-&nbsp;",null,null,2,2, "\u20AC\u0020", "\u20AC\u002D\u0020", null,null],
	AUD: ["$","-$",null,null,2,2, "\u0024", "\u002D\u0024", null,null],
	BOB: ["$b","-$b",null,null,2,2, "\u0024\u0062", "\u002D\u0024\u0062", null,null],
	BRL: ["R$&nbsp;","-R$&nbsp;",null,null,2,2, "\u0052\u0024\u0020", "\u002D\u0052\u0024\u0020", null,null],
	//_CURRENCY_FORMATS["BEF: [null,"-","&nbsp;BF","&nbsp;BF",2,2, null, "\u002D", "\u0020\u0042\u0046", "\u0020\u0042\u0046"],
	//Belgium using "EUR"
	BEF: [null,"-","&euro;","&euro;",2,2, null, "\u002D", "\u20AC", "\u20AC"],
	//for html entities, need a image for arabic symbol "BHD" as "DZD", "EGP", "JOD", "KWD" "LBP", "MAD", "OMR", "QAR", "SAR", "SYP", "TND", "AED", "YER"
	//_CURRENCY_FORMATS["BHD: ["","",null,null,3,3, "\u062C", "\u062C", null,"\u002D"],
	BHD: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	//_CURRENCY_FORMATS["CAD: ["$","-$",null,null,2,2,"\u0024", "\u002D\u0024", null,null],
	//ALP: 0: represents 'en' or other, 1: represents 'fr'.
	//TODO: clean this up.   Make an assoc array based on locale?  Make generic.
	CAD: [["$","-$",null,null,2,2,"\u0024", "\u002D\u0024", null,null],
	  [null,"("," $"," $)",2,2,null, "\u0028", "\u0020\u0024","\u0020\u0024\u0029"]],
	CHF: ["CHF&nbsp;","CHF&nbsp;-",null,null,2,2, "\u0043\u0048\u0046\u0020", "\u0043\u0048\u0046\u0020\u002D"],
	CLP: ["$","-$",null,null,2,2, "\u0024", "\u002D\u0024", null,null],
	COP: ["$","($",null,")",2,2, "\u0024", "\u0028\u0024", null,"\u0029"],
	CNY: ["&yen;","-&yen;",null,null,2,2, "\u00a5","\u002D\u00a5", null,null],
	//// Costa Rica  - Spanish slashed C. need to find out the html entitiy image
	CRC: ["","-",null,null,2,2, "\u20A1", "\u20A1\u002D", null,null],
	// Czech Republic  - Czech //need image for html entities
	CZK: ["Kc","Kc -",null,null,2,2, "\u004B\u010D","\u004B\u010D\u0020\u002D", null,null],
	DEM: [null,"-","&euro","&euro",2,2, null, "\u002D", "\u20AC","\u20AC"],
	DKK: ["kr.&nbsp;","kr. -",null,null,2,2, "\u006B\u0072\u002E\u0020", "\u006B\u0072\u002E\u0020\u002D", null,null],
	DOP: ["$","-$",null,null,2,2, "\u0024", "\u002D\u0024", null,null],
	//for html entities, need a image, bidi, using "rtl", so from the link, symbol is suffix
	//_CURRENCY_FORMATS["DZD: ["","",null,null,3,3, "\u062C", "\u062C", null,"\u002D"],
	DZD: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	//Ecuador using "USD"
	ECS: ["$","$-",null,null,2,2, "\u0024", "\u0024\u002D", null,null],
	//for html entities, need a image
	EGP: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	//_CURRENCY_FORMATS["ESP: [null,"-","&nbsp;Pts","&nbsp;Pts",0,0, null, "\u002D", "\u0020\u20A7", "\u0020\u20A7"],
	//spain using "EUR"
	ESP: [null,"-","&euro;","&euro;",2,2, null, "\u002D", "\u20AC", "\u20AC"],
	EUR: ["&euro;&nbsp;", "-&euro;&nbsp;",null,null, 2, 2, "\u20AC\u0020", "\u002D\u20AC\u0020", null, null],
	//_CURRENCY_FORMATS["FIM: [null,"-","&nbsp;mk","&nbsp;mk", 2,2, null, "\u002D", "\u0020\u006D\u006B", "\u0020\u006D\u006B"],
	//Finland using "EUR"
	FIM: [null,"-","&euro;","&euro;",2,2, null, "\u002D", "\u20AC", "\u20AC"],
	//_CURRENCY_FORMATS["FRF: [null,"-","&nbsp;F","&nbsp;F",2,2,null, "\u002D","\u0020\u0046", "\u0020\u0046"],
	//France using "EUR"
	FRF: [null,"-","&euro;","&euro;",2,2, null, "\u002D", "\u20AC", "\u20AC"],
	GBP: ["&pound;","-&pound;",null,null,2,2, "\u00A3", "\u002D\u00A3", null, null],
	GRD: ["&euro;","&euro;",null,"-",2,2, "\u20AC", "\u20AC", null, "\u002D"],
	GTQ: ["Q","Q-",null,null,2,2, "\u0051", "\u0051\u002D", null,null],
	//Hong Kong need "HK$" and "$". Now only support "HK$"
	HKD: ["HK$","-HK$",null,null,2,2,"\u0048\u004B\u0024", "\u002D\u0048\u004B\u0024", null,null],
	HNL: ["L.","L.",null,"-",2,2,"\u004C\u002E", "\u004C\u002E", null,"\u002D"],
	HUF: [null,"-","&nbsp;Ft","&nbsp;Ft",2,2,null, "\u002D", "\u0020\u0046\u0074","\u0020\u0046\u0074"],
	//IEP: ["&pound;","-&pound;",null,null,2,2, "\u00A3", "\u002D\u00A3", null, null],
	//ireland using "EUR" at the front.
	IEP: ["&euro;", "-&euro;",null,null, 2, 2, "\u20AC", "\u002D\u20AC", null, null],
	//couldn't know what Israel - Hebrew symbol, some sites use "NIS", bidi, using "rtl", so from the link, symbol is suffix
	//ILS: ["","",null,"-",2,2, "\u05E9\u0022\u05D7", "\u05E9\u0022\u05D7", null, "\u002D"],
	ILS: ["","-",null,"",2,2, null, "\u002D", "\u05E9\u0022\u05D7", "\u05E9\u0022\u05D7"],
	INR: ["Rs.","-Rs.",null,null,2,2, "\u0052\u0073\u002E", "\u002D\u0052\u0073\u002E", null, null],
	//ITL: ["L&nbsp;","L -",null,null,0,0, "\u004C\u0020", "\u004C\u0020\u002D", null, null],
	//Italy using "EUR"
	ITL: ["&euro;", "&euro;-",null,null, 2, 2, "\u20AC", "\u20AC\u002D", null, null],
	//for html entities, need a image
	JOD: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	JPY: ["&yen;","-&yen;",null,null,0,0, "\u00a5","-\u00a5", null,null],
	//KRW: [], it is image
	//KRW: ["<img src='"+URLREWRITER_PRE+"jsl/tree/icons/won.gif'>", "-<img src='"+URLREWRITER_PRE+"jsl/tree/icons/won.gif'>", null,null,2,2,"\u20A9", "-\u20A9", null,null],
	KRW: ["", "-", null,null,0,0,"\u20A9", "-\u20A9", null,null],
	//for html entities, need a image
	KWD: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	//for html entities, need a image
	LBP: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	//LUF: [null,"-","&nbsp;LUF","&nbsp;LUF",2,2, null, "\u002D", "\u0020\u004C\u0055\u0046", "\u0020\u004C\u0055\u0046"],
	//for Luxembourg,using "EUR"
	LUF: [null,"-","&euro;","&euro;",2,2, null, "\u002D", "\u20AC", "\u20AC"],
	//for html entities, need a image
	MAD: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	MXN: ["$","($",null,")",2,2, "\u0024", "\u0028\u0024", null,"\u0029"],
	NIO: ["C$&nbsp;","C$&nbsp-;",null,null,2,2, "\u0043\u0024\u0020", "\u0043\u0024\u0020\u002D", null, null],
	//NLG: ["f&nbsp;","f&nbsp;",null,"-",2,2, "\u0066\u0020", "\u0066\u0020", null, "\u002D"],
	//Netherlands, using "EUR"
	NLG: ["&euro;","&euro;",null,"-",2,2, "\u20AC", "\u20AC", null, "\u002D"],
	NOK: ["kr&nbsp;","kr&nbsp;-",null,null,2,2, "\u006B\u0072\u0020", "\u006B\u0072\u0020\u002D", null, null],
	NZD: ["$","-$",null,null,2,2,"\u0024", "\u002D\u0024", null,null],
	//for html entities, need a image
	OMR: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	PAB: ["B/&nbsp;","B/&nbsp;-",null,null,2,2,"\u0042\u002F\u0020", "\u0042\u002F\u0020\u002D", null, null],
	PEN: ["S/","S/-",null,null,2,2,"\u0053\u002F", "\u0053\u002F\u002D", null, null],
	//couldn't know what the symbol is from ibm link.
	PLN: [null,"-","z","z",2,2,null, "\u002D", "\u007A", "\u007A"],
	//PTE: [null,"-","&nbsp;Esc.","&nbsp;Esc.",0,0,null, "\u002D", "\u0020\u0045\u0073\u0063\u002E", "\u0020\u0045\u0073\u0063\u002E"],
	PTE: [null,"-","&euro;","&euro;",2,2, null, "\u002D", "\u20AC", "\u20AC"],
	PYG: ["Gs.","Gs.-",null,null,2,2,"\u0047\u0073\u002E", "\u0047\u0073\u002E\u002D", null, null],
	//for html entities, need a image
	QAR: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	RUR: [null,"-","rub.","rub.",2,2, null, "\u002D", "\u0072\u0075\u0062\u002E","\u0072\u0075\u0062\u002E"],
	//for html entities, need a image
	SAR: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	SEK: [null,"-", "&nbsp;kr","&nbsp;kr",2,2, null, "\u002D", "\u0020\u006B\u0072", "\u0020\u006B\u0072"],
	SGD: ["$","-$",null,null,2,2,"\u0024", "\u002D\u0024",null,null],
	//// El Salvador - Spanish slashed C. need to find out.
	SVC: ["","-",null,null,2,2, "\u20A1", "\u20A1\u0020\u002D", null,null],
	//for html entities, need a image
	SYP: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	//for html entities, need a image
	TND: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	TRL: [null,"-","TL","TL",2,2, null, "\u002D", "\u0054\u004C","\u0054\u004C"],
	TWD: ["NT$","-NT$",null,null,2,2, "\u004E\u0054\u0024", "\u002D\u004E\u0054\u0024", null,null],
	USD: ["$","-$",null,null,2,2,"\u0024", "\u002D\u0024", null,null],
	UYU: ["$U ", "$U -", null, null, 2,2, "\u0024\u0055\u0020", "\u0024\u0055\u0020\u002D", null, null],
	VEB: ["Bs","Bs -",null,null,2,2,"\u0042\u0073", "\u0042\u0073\u0020\u002D", null,null],
	//for html entities, need a image
	YER: ["","",null,null,2,2, null,"\u002D", "\u062C","\u062C"],
	ZAR: ["R","(R",null,")",2,2, "\u0052", "\u0028\u0052", null,"\u0029"]
};
*/