dojo.provide("dojox.date.posix");

dojo.require("dojo.date.util");
dojo.require("dojo.date.local");
dojo.require("dojo.string");

dojox.date.posix.strftime = function(/*Date*/dateObject, /*String*/format, /*String?*/locale){
//
// summary:
//		Formats the date object using the specifications of the POSIX strftime function
//
// description:
//		see <http://www.opengroup.org/onlinepubs/007908799/xsh/strftime.html>

	// zero pad
	var padChar = null;
	var _ = function(s, n){
		return dojo.string.pad(s, n || 2, padChar || "0");
	};

	var bundle = dojo.date.local._getGregorianBundle(locale);

	var $ = function(property){
		switch (property){
			case "a": // abbreviated weekday name according to the current locale
				return dojo.date.local.getNames('days', 'abbr', 'format', locale)[dateObject.getDay()];

			case "A": // full weekday name according to the current locale
				return dojo.date.local.getNames('days', 'wide', 'format', locale)[dateObject.getDay()];

			case "b":
			case "h": // abbreviated month name according to the current locale
				return dojo.date.local.getNames('months', 'abbr', 'format', locale)[dateObject.getMonth()];
				
			case "B": // full month name according to the current locale
				return dojo.date.local.getNames('months', 'wide', 'format', locale)[dateObject.getMonth()];
				
			case "c": // preferred date and time representation for the current
				      // locale
				return dojo.date.local.format(dateObject, {formatLength: 'full', locale: locale});

			case "C": // century number (the year divided by 100 and truncated
				      // to an integer, range 00 to 99)
				return _(Math.floor(dateObject.getFullYear()/100));
				
			case "d": // day of the month as a decimal number (range 01 to 31)
				return _(dateObject.getDate());
				
			case "D": // same as %m/%d/%y
				return $("m") + "/" + $("d") + "/" + $("y");
					
			case "e": // day of the month as a decimal number, a single digit is
				      // preceded by a space (range ' 1' to '31')
				if(padChar == null){ padChar = " "; }
				return _(dateObject.getDate());
			
			case "f": // month as a decimal number, a single digit is
							// preceded by a space (range ' 1' to '12')
				if(padChar == null){ padChar = " "; }
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
				
			case "k": // Hour as a decimal number using a 24-hour clock (range
					  // 0 to 23 (space-padded))
				if (padChar == null) { padChar = " "; }
				return _(dateObject.getHours());

			case "l": // Hour as a decimal number using a 12-hour clock (range
					  // 1 to 12 (space-padded))
				if (padChar == null) { padChar = " "; }
				return _(dateObject.getHours() % 12 || 12);
			
			case "m": // month as a decimal number (range 01 to 12)
				return _(dateObject.getMonth() + 1);
				
			case "M": // minute as a decimal number
				return _(dateObject.getMinutes());
			
			case "n":
				return "\n";

			case "p": // either `am' or `pm' according to the given time value,
				      // or the corresponding strings for the current locale
				return bundle[dateObject.getHours() < 12 ? "am" : "pm"];
				
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
				return dojo.date.local.format(dateObject, {selector:'date', formatLength: 'full', locale:locale});

			case "X": // preferred time representation for the current locale
				      // without the date
				return dojo.date.local.format(dateObject, {selector:'time', formatLength: 'full', locale:locale});

			case "y": // year as a decimal number without a century (range 00 to
				      // 99)
				return _(dateObject.getFullYear()%100);
				
			case "Y": // year as a decimal number including the century
				return String(dateObject.getFullYear());
			
			case "z": // time zone or name or abbreviation
				var timezoneOffset = dateObject.getTimezoneOffset();
				return (timezoneOffset > 0 ? "-" : "+") + 
					_(Math.floor(Math.abs(timezoneOffset)/60)) + ":" +
					_(Math.abs(timezoneOffset)%60);

			case "Z": // time zone or name or abbreviation
				return dojo.date.getTimezoneName(dateObject);
			
			case "%":
				return "%";
		}
	};

	// parse the formatting string and construct the resulting string
	var string = "";
	var i = 0;
	var index = 0;
	var switchCase = null;
	while ((index = format.indexOf("%", i)) != -1){
		string += format.substring(i, index++);
		
		// inspect modifier flag
		switch (format.charAt(index++)) {
			case "_": // Pad a numeric result string with spaces.
				padChar = " "; break;
			case "-": // Do not pad a numeric result string.
				padChar = ""; break;
			case "0": // Pad a numeric result string with zeros.
				padChar = "0"; break;
			case "^": // Convert characters in result string to uppercase.
				switchCase = "upper"; break;
			case "*": // Convert characters in result string to lowercase
				switchCase = "lower"; break;
			case "#": // Swap the case of the result string.
				switchCase = "swap"; break;
			default: // no modifier flag so decrement the index
				padChar = null; index--; break;
		}

		// toggle case if a flag is set
		var property = $(format.charAt(index++));
		switch (switchCase){
			case "upper":
				property = property.toUpperCase();
				break;
			case "lower":
				property = property.toLowerCase();
				break;
			case "swap": // Upper to lower, and versey-vicea
				var compareString = property.toLowerCase();
				var swapString = '';
				var ch = '';
				for (var j = 0; j < property.length; j++){
					ch = property.charAt(j);
					swapString += (ch == compareString.charAt(j)) ?
						ch.toUpperCase() : ch.toLowerCase();
				}
				property = swapString;
				break;
			default:
				break;
		}
		switchCase = null;
		
		string += property;
		i = index;
	}
	string += format.substring(i);
	
	return string; // String
};
