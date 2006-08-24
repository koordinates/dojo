dojo.provide("dojo.i18n.datetime");

dojo.require("dojo.experimental");

dojo.require("dojo.date");
dojo.require("dojo.lang.array");
dojo.require("dojo.lang.common");
dojo.require("dojo.string.common");
dojo.require("dojo.i18n.common");
dojo.requireLocalization("dojo.i18n.calendar", "gregorian");
dojo.requireLocalization("dojo.i18n.calendar", "gregorian-extras");

// Everything here assumes Gregorian calendars.  Other calendars will be implemented in separate modules.

/**
* Method to Format and validate a given Date object.  By default, formats both date and time.
* Formatting patterns are implemented using the syntax described at
* http://www.unicode.org/reports/tr35/#Date_Format_Patterns
*
* @param Date value
*	The Date object to be formatted and validated.
* @param Object options
*	String:selector choice of timeOnly,dateOnly (default: date and time)
*	String:formatLength choice of long, short, medium or full (plus any custom additions).  Defaults to 'full'
*	String:datePattern,String:timePattern override pattern with this string
*	String:locale the locale to determine formatting used.  By default, the locale defined by the
*   host environment: dojo.locale
* @return String
* 	the formatted date of type String if successful or null if unable to format
**/
dojo.i18n.datetime.format = function(dateObject, options){
	dojo.experimental("dojo.i18n.datetime");

	// Format a pattern without literals
	function formatRawPattern(dateObject, pattern) {
		return pattern.replace(/[a-zA-Z]+/g, function(match){
			var s;
			var c = match.charAt(0);
			var l = match.length;
			var pad;
			var widthList = ["abbr", "wide", "narrow"];
			switch(c){
				case 'G':
					if(l>3){dojo.unimplemented("Era format not implemented");}
					s = info.eras[dateObject.getFullYear() < 0 ? 1 : 0];
					break;
				case 'y':
					s = dateObject.getFullYear();
					switch(l){
						case 1:
							break;
						case 2:
							s = String(s).substr(-2);
							break;
						default:
							pad = true;
					}
					break;
				case 'Q':
				case 'q':
					var s = Math.ceil((dateObject.getMonth()+1)/3);
					switch(l){
						case 1: case 2:
							pad = true;
							break;
						case 3:
						case 4:
							dojo.unimplemented("Quarter format not implemented");
					}
					break;
				case 'M':
				case 'L':
					var m = dateObject.getMonth();
					var width;
					switch(l){
						case 1: case 2:
							s = m+1; pad = true;
							break;
						case 3: case 4: case 5:
							width = widthList[l-3];
							break;
					}
					if(width){
						var type = (c == "L") ? "standalone" : "format";
						var prop = ["months",type,width].join("-");
						s = info[prop][m];
					}
					break;
				case 'w':
					var firstDay = 0;
					s = dojo.date.getWeekOfYear(dateObject, firstDay); pad = true;
					break;
				case 'd':
					s = dateObject.getDate(); pad = true;
					break;
				case 'D':
					s = dojo.date.getDayOfYear(dateObject); pad = true;
					break;
				case 'E':
				case 'e':
				case 'c':
					var d = dateObject.getDay();
					var width;
					switch(l){
						case 1: case 2:
							if(c != 'E'){
								s = d+1; pad = true; //TODO: depends on starting day of week
								break;
							}
							//else fallthrough
						case 3: case 4: case 5:
							width = widthList[l-3];
							break;
					}
					if(width){
						var type = (c == "c") ? "standalone" : "format";
						var prop = ["days",type,width].join("-");
						s = info[prop][d];
					}
					break;
				case 'a':
					var timePeriod = (dateObject.getHours() < 12) ? 'am' : 'pm';
					s = info[timePeriod];
					break;
				case 'h':
				case 'H':
				case 'K':
				case 'k':
					var h = dateObject.getHours();
					if((h>11)&&(c=='h' || c=='K')){h-=12;}
					if(c=='h' || c=='k'){h++;}
					s = h; pad = true;
					break;
				case 'm':
					s = dateObject.getMinutes(); pad = true;
					break;
				case 's':
					s = dateObject.getSeconds(); pad = true;
					break;
				case 'S':
					s = Math.round(dateObject.getMilliseconds() * Math.pow(10, l));
					break;
				case 'Z':
					var offset = dateObject.getTimezoneOffset();
					var tz = [
						(offset<=0 ? "+" : "-"),
						dojo.string.pad(Math.floor(Math.abs(offset)/60), 2),
						dojo.string.pad(Math.abs(offset)% 60, 2)
					];
					if(l==4){
						tz.splice(0, 0, "GMT");
						tz.splice(3, 0, ":");
					}
					s = tz.join("");
					break;
				case 'Y':
				case 'u':
				case 'W':
				case 'F':
				case 'g':
				case 'A':
				case 'v':
				case 'z':
					dojo.debug(match+" modifier not yet implemented");
					s = "?";
					break;
				default:
					dojo.raise("invalid format: "+pattern);
			}
			if(pad){ s = dojo.string.pad(s, l); }
			return s;
		});
	}

	// Format a pattern with literals in it
	function formatPattern(dateObject, pattern){
		// Break up on single quotes, treat every other one as a literal, except '' which becomes '
		var chunks = pattern.split('\'');
		var format = true;
		for (var i=0; i<chunks.length; i++){
			if(!chunks[i]){chunks[i]='\'';}
			else{
				if(format){chunks[i]=formatRawPattern(dateObject, chunks[i]);}
				format = !format;
			}
		}
		return chunks.join("");
	}

	locale = dojo.normalizeLocale(options.locale);
	var formatLength = options.formatLength || 'full';
	var info = dojo.i18n.datetime._getGregorianBundle(locale);
	var str = [];
	if (!options || options.selector == "dateOnly") {
		var datePattern = options.datePattern || info["dateFormat-"+formatLength];
		str.push(formatPattern(dateObject, datePattern));
	}
	if (!options || options.selector == "timeOnly") {
		var timePattern = options.timePattern || info["timeFormat-"+formatLength];
		str.push(formatPattern(dateObject, timePattern));
	}
	return str.join(" "); //TODO: parameterize
};

dojo.i18n.datetime._buildDateTimeRE = function(pattern, elements) {
	var str = pattern.replace(/[a-zA-Z]+/g, function(match){
			var s;
			var c = match.charAt(0);
			var l = match.length;
			switch(c){
				case 'y':
					s = "\\d" + ((l==2)?"{2}":"+");
					break;
				case 'M':
					s = "\\d{2}"; //TODO make sure it conforms to month range...
					break;
				case 'd':
					s = "\\d{2}"; //TODO
					break;
				case 'h': case 'H': case 'K': case 'k':
					s = "\\d{2}"; //TODO
					break;
				case 'm':
				case 's':
					s = "\\d{2}"; //TODO
					break;
				case 'S':
					s = "\\d+"; //TODO
					break;
				case 'a':
					s = info.am + "|" + info.pm;
					break;
				default:
					dojo.unimplemented("parse of date format, pattern="+pattern);
			}
			s = "("+s+")";
			if(elements){ elements.push(match); }
			return s;
	});
	//TODO: escape special regexp chars
	//TODO: make whitespace flexible?
	return new RegExp("^" + str + "$");
};
	
/**
* Method to convert a properly formatted date to a primative Date object.
*
* @param String value
*	The int string to be convertted
* @param Object options
*	String:selector choice of timeOnly,dateOnly (default: date and time)
*	String:formatLength choice of long, short, medium or full (plus any custom additions).  Defaults to 'full'
*	String:datePattern,String:timePattern override pattern with this string
*	String:locale the locale to determine formatting used.  By default, the locale defined by the
*   host environment: dojo.locale
* @return Date
* 	Returns a primitive Date object or null if unable to convert to a Date
**/
dojo.i18n.datetime.parse = function(value, options){
	dojo.experimental("dojo.i18n.datetime");
	//TODO: this is still quite rough - it only implements a small portion of the parsing algorithm needed,
	// and doesn't provide much flexibility.
	locale = dojo.normalizeLocale(options.locale);
	var info = dojo.i18n.datetime._getGregorianBundle(locale);
	var formatLength = options.formatLength || 'full';
	if (options.selector != 'dateOnly'){ dojo.unimplemented("can only parse dates at this time"); }
	var pattern = options.datePattern || info["dateFormat-"+formatLength];
	var elements = [];
	var dateRE = dojo.i18n.datetime._buildDateTimeRE(pattern, elements);

	var match = dateRE.exec(value);
	var result = new Date();
	result.setHours(0,0,0,0);
	for(var i=1; i<match.length; i++){
		var e=elements[i-1];
		var l=e.length;
		var v=match[i];
		switch(e.charAt(0)){
			case 'd':
				result.setDate(v);
				break;
			case 'M':
				result.setMonth(v-1);
				break;
			case 'y':
				var century = Math.floor(result.getFullYear()/100)*100;
				result.setFullYear(century+Number(v));
				break;
			default:
				dojo.unimplemented("incomplete parse algorithm");
		}
	}
	return result;
};

//TODO: try to common strftime and format code somehow?

// POSIX strftime
// see <http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html>
dojo.i18n.datetime.strftime = function (dateObject, format) {

	dojo.experimental("dojo.i18n.datetime");

	// zero pad
	var padChar = null;
	function _(s, n) {
		return dojo.string.pad(s, n || 2, padChar || "0");
	}

	var info = dojo.i18n.datetime._getGregorianBundle();

	function $ (property) {
		switch (property) {
			case "a": // abbreviated weekday name according to the current locale
				return dojo.i18n.datetime.getDayShortName(dateObject);

			case "A": // full weekday name according to the current locale
				return dojo.i18n.datetime.getDayName(dateObject);

			case "b":
			case "h": // abbreviated month name according to the current locale
				return dojo.i18n.datetime.getMonthShortName(dateObject);
				
			case "B": // full month name according to the current locale
				return dojo.i18n.datetime.getMonthName(dateObject);
				
			case "c": // preferred date and time representation for the current
				      // locale
				return dojo.i18n.datetime.format(dateObject, "full");				

			case "C": // century number (the year divided by 100 and truncated
				      // to an integer, range 00 to 99)
				return _(Math.floor(dateObject.getFullYear()/100));
				
			case "d": // day of the month as a decimal number (range 01 to 31)
				return _(dateObject.getDate());
				
			case "D": // same as %m/%d/%y
				return $("m") + "/" + $("d") + "/" + $("y");
					
			case "e": // day of the month as a decimal number, a single digit is
				      // preceded by a space (range ' 1' to '31')
				if (padChar == null) { padChar = " "; }
				return _(dateObject.getDate());
			
			case "f": // month as a decimal number, a single digit is
							// preceded by a space (range ' 1' to '12')
				if (padChar == null) { padChar = " "; }
				return _(dateObject.getMonth()+1);				
			
			case "g": // like %G, but without the century.
				break;
			
			case "G": // The 4-digit year corresponding to the ISO week number
				      // (see %V).  This has the same format and value as %Y,
				      // except that if the ISO week number belongs to the
				      // previous or next year, that year is used instead.
				dojo.unimplemented("unimplemented modifier 'G'");
				break;
			
			case "F": // same as %Y-%m-%d
				return $("Y") + "-" + $("m") + "-" + $("d");
				
			case "H": // hour as a decimal number using a 24-hour clock (range
				      // 00 to 23)
				return _(dateObject.getHours());
				
			case "I": // hour as a decimal number using a 12-hour clock (range
				      // 01 to 12)
				return _(dateObject.getHours() % 12 || 12);
				
			case "j": // day of the year as a decimal number (range 001 to 366)
				return _(dojo.date.getDayOfYear(dateObject), 3);
				
			case "m": // month as a decimal number (range 01 to 12)
				return _(dateObject.getMonth() + 1);
				
			case "M": // minute as a decimal number
				return _(dateObject.getMinutes());
			
			case "n":
				return "\n";

			case "p": // either `am' or `pm' according to the given time value,
				      // or the corresponding strings for the current locale
				return info[dateObject.getHours() < 12 ? "am" : "pm"];
				
			case "r": // time in a.m. and p.m. notation
				return $("I") + ":" + $("M") + ":" + $("S") + " " + $("p");
				
			case "R": // time in 24 hour notation
				return $("H") + ":" + $("M");
				
			case "S": // second as a decimal number
				return _(dateObject.getSeconds());

			case "t":
				return "\t";

			case "T": // current time, equal to %H:%M:%S
				return $("H") + ":" + $("M") + ":" + $("S");
				
			case "u": // weekday as a decimal number [1,7], with 1 representing
				      // Monday
				return String(dateObject.getDay() || 7);
				
			case "U": // week number of the current year as a decimal number,
				      // starting with the first Sunday as the first day of the
				      // first week
				return _(dojo.date.getWeekOfYear(dateObject));

			case "V": // week number of the year (Monday as the first day of the
				      // week) as a decimal number [01,53]. If the week containing
				      // 1 January has four or more days in the new year, then it 
				      // is considered week 1. Otherwise, it is the last week of 
				      // the previous year, and the next week is week 1.
				return _(dojo.date.getIsoWeekOfYear(dateObject));
				
			case "W": // week number of the current year as a decimal number,
				      // starting with the first Monday as the first day of the
				      // first week
				return _(dojo.date.getWeekOfYear(dateObject, 1));
				
			case "w": // day of the week as a decimal, Sunday being 0
				return String(dateObject.getDay());

			case "x": // preferred date representation for the current locale
				      // without the time
				return dojo.i18n.datetime.format(dateObject, 'short'); //TODO: which format should be used?

			case "X": // preferred date representation for the current locale
				      // without the time
				return dojo.i18n.datetime.format(dateObject, 'full'); //TODO: which format should be used?

			case "y": // year as a decimal number without a century (range 00 to
				      // 99)
				return _(dateObject.getFullYear()%100);
				
			case "Y": // year as a decimal number including the century
				return String(dateObject.getFullYear());
			
			case "z": // time zone or name or abbreviation
				var timezoneOffset = dateObject.getTimezoneOffset();
				return (timezoneOffset > 0 ? "-" : "+") + 
					_(Math.floor(Math.abs(timezoneOffset)/60)) + ":" +
					_(Math.abs(timezoneOffset)%(60));
				
			case "Z": // time zone or name or abbreviation
				return dojo.date.getTimezoneName(dateObject); //TODO
			
			case "%":
				return "%";
		}
	}

	// parse the formatting string and construct the resulting string
	var string = "";
	var i = 0, index = 0, switchCase;
	while ((index = format.indexOf("%", i)) != -1) {
		string += format.substring(i, index++);
		
		// inspect modifier flag
		switch (format.charAt(index++)) {
			case "_": // Pad a numeric result string with spaces.
				padChar = " "; break;
			case "-": // Do not pad a numeric result string.
				padChar = ""; break;
			case "0": // Pad a numeric result string with zeros.
				padChar = "0"; break;
			case "^": // Convert characters in result string to upper case.
				switchCase = "upper"; break;
			case "#": // Swap the case of the result string.
				switchCase = "swap"; break;
			default: // no modifier flag so decrement the index
				padChar = null; index--; break;
		}

		// toggle case if a flag is set
		var property = $(format.charAt(index++));
		if (switchCase == "upper" ||
			(switchCase == "swap" && (/[a-z]/.test(property)))) {
			property = property.toUpperCase();
		} else if (switchCase == "swap" && !(/[a-z]/.test(property))) {
			property = property.toLowerCase();
		}
		switchCase = null;
		
		string += property;
		i = index;
	}
	string += format.substring(i);
	
	return string;
};

dojo.i18n.datetime.getNames = function(item, type, use, locale){
// item = 'months' || 'days'
// type = 'wide' || 'narrow' || 'abbr'
// use = 'standAlone' || 'format' (default)
// locale (optional)
// returns an array
	var label;
	var lookup = dojo.i18n.datetime._getGregorianBundle(locale);
	var props = [item, use, type];
	if (use == 'standAlone') {
		label = lookup[props.join('-')];
	}
	props[1] = 'format';
	return label || lookup[props.join('-')];	
};

dojo.i18n.datetime._formatsBundles = [];
dojo.i18n.datetime.addCustomFormats = function(packageName, bundleName){
// The user may add custom localized formats where the bundle has properties following the
// same naming convention used by dojo for the CLDR data: dateFormat-xxxx / timeFormat-xxxx
// The pattern string should match the format used by the CLDR.  See dojo.i18n.datetime.format for details.
// The resources must be loaded by dojo.requireLocalization() prior to use
	dojo.i18n.datetime._formatsBundles.push({pkg:packageName,name:bundleName});
};
dojo.i18n.datetime.addCustomFormats("dojo.i18n.calendar","gregorian");
dojo.i18n.datetime.addCustomFormats("dojo.i18n.calendar","gregorian-extras");

dojo.i18n.datetime._getGregorianBundle = function(locale){
	var gregorian = {};
	dojo.lang.forEach(dojo.i18n.datetime._formatsBundles, function(desc){
		var bundle = dojo.i18n.getLocalization(desc.pkg, desc.name, locale);
		gregorian = dojo.lang.mixin(gregorian, bundle);
	}, this);
	return gregorian;
};

// Convenience methods

dojo.i18n.datetime.getDayName = function(dateObject, locale){
	return dojo.i18n.datetime.getNames('days', 'wide', 'format', locale)[dateObject.getDay()];
};

dojo.i18n.datetime.getDayShortName = function(dateObject, locale){
	return dojo.i18n.datetime.getNames('days', 'abbr', 'format', locale)[dateObject.getDay()];
};

dojo.i18n.datetime.getMonthName = function(dateObject, locale){
	return dojo.i18n.datetime.getNames('months', 'wide', 'format', locale)[dateObject.getMonth()];
};

dojo.i18n.datetime.getMonthShortName = function(dateObject, locale){
	return dojo.i18n.datetime.getNames('months', 'abbr', 'format', locale)[dateObject.getMonth()];
};
