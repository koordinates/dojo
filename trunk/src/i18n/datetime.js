dojo.provide("dojo.i18n.datetime");

dojo.require("dojo.experimental");
dojo.experimental("dojo.i18n.datetime");

dojo.require("dojo.date");
dojo.require("dojo.string.common");
dojo.require("dojo.i18n.common");
dojo.requireLocalization("dojo.i18n.calendar", "gregorian");

// Everything here assumes Gregorian calendars.  Other calendars will be implemented in separate modules.

//Q: Do we need to support passing in custom formats?  maybe we can just use dojo.date.strftime for that purpose?
//Q: Do we have to handle dates and times combined, or can we leave that to the caller?
//Q: How do we pass in just a time to format?
//Q: What's the right way to define whether we're formatting/parsing dates vs times? separate methods? option arg?

/**
* Method to Format and validate a given Date object.  Formatting patterns are implemented using the
* syntax described at http://www.unicode.org/reports/tr35/#Date_Format_Patterns
*
* @param Date value
*	The Date object to be formatted and validated.
* @param String formatLength choice of long, short, medium or full
* @param String locale the locale to determine formatting used.  By default, the locale defined by the
*   host environment: dojo.locale
* @return String
* 	the formatted date of type String if successful; ?? if an
* 	invalid currency is provided or null if an unsupported locale value was provided.
**/
dojo.i18n.datetime.format = function(value, formatLength, options, locale /*optional*/){
	locale = dojo.normalizeLocale(locale);
	var info = dojo.i18n.getLocalization("dojo.i18n.calendar", "gregorian", locale);
	var pattern = info["dateFormat-"+formatLength];

	function formatPattern(value, pattern) {
		return pattern.replace(/[a-zA-Z]+/g, function(match){
			var s;
			var c = match.charAt(0);
			var l = match.length;
			var pad;
			var widthList = ["abbr", "wide", "narrow"];
			switch(c){
				case 'G':
					if(l>3){dojo.unimplemented("Era format not implemented");}
					s = info.eras[value.getFullYear() < 0 ? 1 : 0];
					break;
				case 'y':
					s = value.getFullYear();
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
					var s = Math.ceil((value.getMonth()+1)/3);
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
					var m = value.getMonth();
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
					s = dojo.date.getWeekOfYear(value, firstDay); pad = true;
					break;
				case 'd':
					s = value.getDate(); pad = true;
					break;
				case 'D':
					s = dojo.date.getDayOfYear(value); pad = true;
					break;
				case 'E':
				case 'e':
				case 'c':
					var d = value.getDay();
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
					var timePeriod = (value.getHours() < 12) ? 'am' : 'pm';
					s = info[timePeriod];
					break;
				case 'h':
				case 'H':
				case 'K':
				case 'k':
					var h = value.getHours();
					if((h>11)&&(c=='h' || c=='K')){h-=12;}
					if(c=='h' || c=='k'){h++;}
					s = h; pad = true;
					break;
				case 'm':
					s = value.getMinutes(); pad = true;
					break;
				case 's':
					s = value.getSeconds(); pad = true;
					break;
				case 'S':
					s = Math.round(value.getMilliseconds() * Math.pow(10, l));
					break;
				case 'Z':
					var offset = value.getTimezoneOffset();
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
				case 'z':
				case 'v':
					dojo.unimplemented("date format not implemented, pattern="+match);
					s = "?";
					break;
				default:
					dojo.raise("invalid format: "+pattern);
			}
			if(pad){ s = dojo.string.pad(s, l); }
			return s;
		});
	}

	// Break up on single quotes, treat every other one as a literal, except '' which becomes '
	var chunks = pattern.split('\'');
	var format = true;
	for (var i=0; i<chunks.length; i++){
		if(!chunks[i]){chunks[i]='\'';}
		else{
			if(format){chunks[i]=formatPattern(value, chunks[i]);}
			format = !format;
		}
	}
	return chunks.join("");
};

/**
* Method to convert a properly formatted date to a primative Date object.
*
* @param String value
*	The int string to be convertted
* @param String formatLength choice of long, short, medium or full
* @param String locale the locale to determine formatting used.  By default, the locale defined by the
*   host environment: dojo.locale
* @return Date
* 	Returns a primative Date object, ?? if unable to convert to a number, or null if an unsupported locale is provided.
**/
dojo.i18n.datetime.parse = function(value, formatLength, locale /*optional*/){
	locale = dojo.normalizeLocale(locale);
	var info = dojo.i18n.getLocalization("dojo.i18n.calendar", "gregorian", locale);
	var pattern = info["dateFormat-"+formatLength];
	if(formatLength != 'short'){
		dojo.unimplemented("dojo.i18n.datetime.parse format="+formatLength);
	}
	pattern.replace(/[a-zA-Z]+/g, function(match){
			var s;
			var c = match.charAt(0);
			var l = match.length;
			switch(c){
				case 'y':
					break;
				case 'M':
					break;
				case 'd':
					break;
				case 'h':
				case 'H':
				case 'K':
				case 'k':
					break;
				case 'm':
					break;
				case 's':
					break;
				case 'S':
					break;
				case 'a':
					break;
				default:
					dojo.unimplemented("date format not implemented, pattern="+match);
			}
	});
	//escape special regexp chars
	//create regexp
};

/**
  Validates whether a string represents a valid date. 

  @param value  A string
  @param formatLength choice of long, short, medium or full
  @param locale the locale to determine formatting used.  By default, the locale defined by the
    host environment: dojo.locale
  @return true or false.
*/
dojo.i18n.datetime.isDate = function(value, formatLength, locale /*optional*/){
	locale = dojo.normalizeLocale(locale);
	dojo.unimplemented("dojo.i18n.datetime.isDate");
};

/**
  Validates whether a string represents a valid time. 

  @param value  A string
  @param formatLength choice of long, short, medium or full
  @param locale the locale to determine formatting used.  By default, the locale defined by the
    host environment: dojo.locale
  @return true or false.
*/
dojo.i18n.datetime.isTime = function(value, formatLength, locale /*optional*/){
	locale = dojo.normalizeLocale(locale);
	dojo.unimplemented("dojo.i18n.datetime.isTime");
};

/**
  Validates whether a string represents a valid date and time. 

  @param value  A string
  @param formatLength choice of long, short, medium or full
  @param locale the locale to determine formatting used.  By default, the locale defined by the
    host environment: dojo.locale
  @return true or false.
*/
dojo.i18n.datetime.isDateTime = function(value, formatLength, locale /*optional*/){
	locale = dojo.normalizeLocale(locale);
	dojo.unimplemented("dojo.i18n.datetime.isDateTime");
};


//TODO: try to common strftime and format code somehow?

// POSIX strftime
// see <http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html>
dojo.i18n.datetime.strftime = function (dateObject, format) {

	// zero pad
	var padChar = null;
	function _ (s, n) {
		return dojo.string.pad(s, n, padChar);
	}
	
	var info = dojo.i18n.getLocalization("dojo.i18n.calendar", "gregorian");

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
//				return dateObject.toLocaleString(); // perhaps better to use established format rather than rely on browser-specific behavior?
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
				break;

			case "X": // preferred date representation for the current locale
				      // without the time
				break;

			case "y": // year as a decimal number without a century (range 00 to
				      // 99)
				return _(dateObject.getFullYear()%100);
				
			case "Y": // year as a decimal number including the century
				return String(dateObject.getFullYear());
			
			case "z": // time zone or name or abbreviation
				var timezoneOffset = dateObject.getTimezoneOffset();
				return (timezoneOffset > 0 ? "-" : "+") + 
					_(Math.floor(Math.abs(timezoneOffset)/60)) + ":" +
					_(Math.abs(timezoneOffset)% 60);
				
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
			(switchCase == "swap" && /[a-z]/.test(property))) {
			property = property.toUpperCase();
		} else if (switchCase == "swap" && !/[a-z]/.test(property)) {
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
	var lookup = dojo.i18n.getLocalization("dojo.i18n.calendar", "gregorian", locale);
	var props = [item, use, type];
	if (use == 'standAlone') {
		label = lookup[props.join('-')];
	}
	props[1] = 'format';
	return label || lookup[props.join('-')];	
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
