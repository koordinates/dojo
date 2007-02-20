dojo.provide("dojo.number");

dojo.require("dojo.experimental");
dojo.experimental("dojo.number");
dojo.require("dojo.i18n.common");
dojo.requireLocalization("dojo.i18n.cldr", "number");
dojo.require("dojo.string.common");
dojo.require("dojo.string.extras");
dojo.require("dojo.regexp");

dojo.number.format = function(/*Number*/value, /*Object?*/options){
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
// options: object {pattern: String?, type: String?, places: Number?, round: Boolean?, locale: String?}
//		pattern- override formatting pattern with this string (see dojo.number.applyPattern)
//		type- choose a format type based on the locale from the following: decimal, scientific, percent, currency. decimal by default.
//		places- fixed number of decimal places to show.  This overrides any information in the provided pattern.
//		round- whether to round the number.  false by default //TODO
//		locale- override the locale used to determine formatting rules

	options = options || {};
	var locale = dojo.hostenv.normalizeLocale(options.locale);
	var bundle = dojo.i18n.getLocalization("dojo.i18n.cldr", "number", locale);
	var pattern = options.pattern || bundle[(options.type || "decimal") + "Format"];
	return dojo.number.applyPattern(value, pattern, {symbols: bundle, places: options.places, round: options.round}); // String //TODO
};

//dojo.number._numberPatternRE = /(?:[#0]*,?)*[#0](?:\.0*#*)?/; // not precise, but good enough
dojo.number._numberPatternRE = /[#0,]*[#0](?:\.0*#*)?/; // not precise, but good enough

dojo.number.applyPattern = function(/*Number*/value, /*String*/pattern, /*Object?*/options){
	// summary: Apply pattern to format value as a string using options. Gives no consideration to local customs.
	// value: the number to be formatted.
	// pattern: a pattern string as described in http://www.unicode.org/reports/tr35/#Number_Format_Patterns
	// options: object {symbols: Object?, places: Number?, currencyISO: String?} //TODO round
	//  symbols- a hash containing: decimal, group, ...
	//  currencyISO: the 3-letter ISO4217 currency (e.g. USD)

//TODO: support escapes
	options = options || {};
	var group = options.symbols.group;
	var decimal = options.symbols.decimal;

	var patternList = pattern.split(';');
	var positivePattern = patternList[0];
	pattern = patternList[(value < 0) ? 1 : 0] || ("-" + positivePattern);

	//TODO: only test against unescaped
	if(pattern.indexOf('%') != -1){
		value *= 100;
	}else if(pattern.indexOf('\u2030') != -1){
		value *= 1000; // per mille
	}else if(pattern.indexOf('\u00a4') != -1){
		group = options.symbols.currencyGroup || group;//mixins instead?
		decimal = options.symbols.currencyDecimal || decimal;// Should these be mixins instead?
		pattern.replace('/\u00a4{1,3}/', function(match){
			switch(match.length){
			case 1:
				return options.symbols.symbol; //TODO
			case 2:
				return currencyISO; //TODO: is this right?
			case 3:
				return "United States Dollars?"; //TODO // Q: the long form of the decimal?? symbol
			}
		});
	}else if(pattern.indexOf('E') != -1){
		dojo.unimplemented("exponential notation not supported");
	}
	
//TODO: support [1-9] rounding
//TODO: support @ sig figs?
	var numberPatternRE = dojo.number._numberPatternRE;
	var numberPattern = positivePattern.match(numberPatternRE);
	if(!numberPattern){
		dojo.raise("unable to find a number expression in pattern: "+pattern);
	}
	var output = pattern.replace(numberPatternRE, dojo.number.formatAbsolute(value, numberPattern[0], {decimal: decimal, group: group, places: options.places}));
	return output;
}

dojo.number.formatAbsolute = function(/*Number*/value, /*String*/pattern, /*Object?*/options){
	// summary: Apply numeric pattern to absolute value using options.  Gives no consideration to local customs
	// value: the number to be formatted, ignores sign
	// pattern: the number portion of a pattern (e.g. #,##0.00)
	// options: object {decimal: String?, group: String?, places: Number?}
	//  decimal- the decimal separator
	//  group- the group separator
	//  places- number of decimal places

	options = options || {};
	value = Math.abs(value);
	var round = false; //TODO
	var valueParts = String(value).split(".");
	var patternParts = pattern.split(".");
	var fractional = valueParts[1] || "";
	if(options.places){
		valueParts[1] = dojo.string.pad(fractional.substr(0, options.places), options.places, '0', -1);
	}else if(patternParts[1] && options.places !== 0){
		// Pad fractional with trailing zeros
		var pad = patternParts[1].lastIndexOf("0") + 1;
		if(pad > fractional.length){
			valueParts[1] = dojo.string.pad(fractional, pad, '0', -1);
		}

		// Truncate fractional
		var places = patternParts[1].length;
		if(places < fractional.length){
			valueParts[1] = fractional.substr(0, places);
		}
	}else{
		if(valueParts[1]){ valueParts.pop(); }
	}

	// Pad whole with leading zeros
	var patternDigits = patternParts[0].replace(',', '');
	pad = patternDigits.indexOf("0");
	if(pad != -1){
		pad = patternDigits.length - pad;
		if(pad > valueParts[0].length){
			valueParts[0] = dojo.string.pad(valueParts[0], pad);
		}

		// Truncate whole
		if(patternDigits.indexOf("#") == -1){
			valueParts[0] = valueParts[0].substr(valueParts[0].length - pad);
		}
	}

	// Add group separators
	var index = patternParts[0].lastIndexOf(',');
	var groupSize, groupSize2;
	if(index != -1){
		groupSize = patternParts[0].length - index - 1;
		var remainder = patternParts[0].substr(0, index);
		index = remainder.lastIndexOf(',');
		if(index != -1){
			groupSize2 = remainder.length - index - 1;
		}
	}
	var pieces = [];
	for(var whole = valueParts[0]; whole;){
		var off = whole.length - groupSize;
		pieces.push((off > 0) ? whole.substr(off) : whole);
		whole = (off > 0) ? whole.slice(0, off) : "";
		if(groupSize2){
			groupSize = groupSize2;
			delete groupSize2;
		}
	}
	valueParts[0] = pieces.reverse().join(options.group || ",");

	return valueParts.join(options.decimal || ".");
};

dojo.number.regexp = function(/*Object?*/options){
//
// summary:
//		Builds the regular needed to parse a number
//
// description:
//		returns regular expression with positive and negative match, group and decimal separators
//
// options: object {pattern: String, type: String locale: String, strict: Boolean, places: mixed}
//		pattern- override pattern with this string
//		type- choose a format type based on the locale from the following: decimal, scientific, percent, currency. decimal by default.
//		locale- override the locale used to determine formatting rules
//		strict- strict parsing, false by default
//		places- number of decimal places to accept: Infinity, a positive number, or a range "n,m"
	return dojo.number._parseInfo(options).regexp; // String
}

dojo.number._parseInfo = function(/*Object?*/options){
	options = options || {};
	var locale = dojo.hostenv.normalizeLocale(options.locale);
	var bundle = dojo.i18n.getLocalization("dojo.i18n.cldr", "number", locale);
	var pattern = options.pattern || bundle[(options.type || "decimal") + "Format"];
//TODO: memoize?
	var group = bundle.group;
//	if(!options.strict){ group = [group,""]; }
	var decimal = bundle.decimal;

	//TODO: handle quoted escapes
	var patternList = pattern.split(';');
	if (patternList.length == 1){
		patternList.push("-" + patternList[0]); // substitute negative sign?
	}

	var re = dojo.regexp.buildGroupRE(patternList, function(pattern){
		pattern = "(?:"+dojo.string.escape('regexp', pattern, '.')+")";
		return pattern.replace(dojo.number._numberPatternRE, function(format){
			var flags = {
				signed: false,
				separator: options.strict ? group : [group,""],
				decimal: decimal,
				exponent: false};
			var parts = format.split('.');
			if(parts.length == 1){parts.fractional = false;}
			else{
				var places = options.places;
				if(typeof places == "undefined"){ places = parts[1].lastIndexOf('0')+1; }
				if(places){parts.fractional = true;} // required fraction
				flags.places = places;
				if(places < parts[1].length){ flags.places += "," + parts[1].length; }
			}
			var groups = parts[0].split(',');
			if(groups.length>1){
				flags.groupSize = groups.pop().length;
				if(groups.length>1){
					flags.groupSize2 = groups.pop().length;
				}
			}
			return "("+dojo.regexp.realNumber(flags)+")";
		});
	}, true);

	if(!options.strict){
		// TODO: handle .### with no leading integer?
		//TODO: !strict: make currency symbol too
	}

	return {regexp: re, group: group, decimal: decimal}; // Object
}

dojo.number.parse = function(/*String*/expression, /*Object?*/options){
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
//		pattern- override pattern with this string
//		type- choose a format type based on the locale from the following: decimal, scientific, percent, currency. decimal by default.
//		locale- override the locale used to determine formatting rules
//		strict- strict parsing, false by default

	var info = dojo.number._parseInfo(options);
	var group = info.group;
	var decimal = info.decimal;
	var re = info.regexp;

//TODO: substitute currency symbol, percent/permille/etc.
	var results = (new RegExp("^"+re+"$")).exec(expression);
	if(!results){
		return NaN; //NaN
	}
	var numberExpression = results[1];
	if(typeof numberExpression == 'undefined'){
		// matched the negative pattern
		var negative = true;
		numberExpression = results[2];
	}
	numberExpression = numberExpression.replace(group, "", "g").replace(decimal, ".");
	value = Number(numberExpression);

	if(!isNaN(value)){
		if(negative){ value = -value; }
		//TODO: handle percent, per mille
		//TODO: handle exponent
	}
	return value;
};
