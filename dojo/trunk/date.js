dojo.provide("dojo.date");

dojo.date.setDayOfYear = function(/*Date*/dateObject, /*Number*/dayOfYear){
	// summary: sets dateObject according to day of the year (1..366)
	dateObject.setMonth(0);
	dateObject.setDate(dayOfYear);
	return dateObject; // Date
}

dojo.date.getDayOfYear = function(/*Date*/dateObject){
	// summary: gets the day of the year as represented by dateObject
	var fullYear = dateObject.getFullYear();
	var lastDayOfPrevYear = new Date(fullYear-1, 11, 31);
	return Math.floor((dateObject.getTime() -
		lastDayOfPrevYear.getTime()) / (24*60*60*1000)); // Number
}

dojo.date.setWeekOfYear = function(/*Date*/dateObject, /*Number*/week, /*Number*/firstDay){
	if(arguments.length == 2){ firstDay = 0; } // Sunday
	dojo.unimplemented("dojo.date.setWeekOfYear");
}

dojo.date.getWeekOfYear = function(/*Date*/dateObject, /*Number*/firstDay){
	if(arguments.length == 1){ firstDay = 0; } // Sunday

	// work out the first day of the year corresponding to the week
	var firstDayOfYear = new Date(dateObject.getFullYear(), 0, 1);
	var day = firstDayOfYear.getDay();
	firstDayOfYear.setDate(firstDayOfYear.getDate() -
			day + firstDay - (day > firstDay ? 7 : 0));

	return Math.floor((dateObject.getTime() -
		firstDayOfYear.getTime()) / (7*24*60*60*1000)); // Number
}

dojo.date.setIsoWeekOfYear = function(/*Date*/dateObject, /*Number*/week){
	// summary: Set the ISO8601 week number of the given date.
	//   The week containing January 4th is the first week of the year.
	// week:
	//   can be positive or negative: -1 is the year's last week.
	if(!week){ return dateObject; }
	var currentWeek = dojo.date.getIsoWeekOfYear(dateObject);
	var offset = week - currentWeek;
	if(week < 0){
		var weeks = dojo.date.getIsoWeeksInYear(dateObject);
		offset = (weeks + week + 1) - currentWeek;
	}
	return dojo.date.add(dateObject, "week", offset); // Date
}

dojo.date.getIsoWeekOfYear = function(/*Date*/dateObject){
	// summary: Get the ISO8601 week number of the given date.
	//   The week containing January 4th is the first week of the year.
	//   See http://en.wikipedia.org/wiki/ISO_week_date
	var weekStart = dojo.date.getStartOfWeek(dateObject, 1);
	var yearStart = new Date(dateObject.getFullYear(), 0, 4); // January 4th
	yearStart = dojo.date.getStartOfWeek(yearStart, 1);
	var diff = weekStart.getTime() - yearStart.getTime();
	if(diff < 0){ return dojo.date.getIsoWeeksInYear(weekStart); } // Integer
	return Math.ceil(diff / 604800000) + 1; // Integer
}

dojo.date.getStartOfWeek = function(/*Date*/dateObject, /*Number*/firstDay){
	// summary: Return a date object representing the first day of the given
	//   date's week.
	if(isNaN(firstDay)){
		firstDay = dojo.date.getFirstDayOfWeek ? dojo.date.getFirstDayOfWeek() : 0;
	}
	var offset = firstDay;
	if(dateObject.getDay() >= firstDay){
		offset -= dateObject.getDay();
	}else{
		offset -= (7 - dateObject.getDay());
	}
	var date = new Date(dateObject);
	date.setHours(0, 0, 0, 0);
	return dojo.date.add(date, "day", offset); // Date
}

dojo.date.getIsoWeeksInYear = function(/*Date*/dateObject) {
	// summary: Determine the number of ISO8601 weeks in the year of the given 
	//   date. Most years have 52 but some have 53.
	//   See http://www.phys.uu.nl/~vgent/calendar/isocalendar_text3.htm	
	function p(y) {
		return y + Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400);
	}
	var y = dateObject.getFullYear();
	return ( p(y) % 7 == 4 || p(y-1) % 7 == 3 ) ? 53 : 52;
}

dojo.date.getDaysInMonth = function(/*Date*/dateObject){
	// summary: returns the number of days in the month used by dateObject
	var month = dateObject.getMonth();
	var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (month == 1 && dojo.date.isLeapYear(dateObject)){ return 29; } // Number
	return days[month]; // Number
}

dojo.date.isLeapYear = function(/*Date*/dateObject){
// summary:
//	Determines if the year of the dateObject is a leap year
//
// description:
//	Leap years are years with an additional day YYYY-02-29, where the year
//	number is a multiple of four with the following exception: If a year
//	is a multiple of 100, then it is only a leap year if it is also a
//	multiple of 400. For example, 1900 was not a leap year, but 2000 is one.

	var year = dateObject.getFullYear();
	return !(year%400) || (!(year%4) && !!(year%100)); // Boolean
}

// FIXME: This is not localized
dojo.date.getTimezoneName = function(/*Date*/dateObject){
// summary:
//	Get the user's time zone as provided by the browser
//
// dateObject: needed because the timezone may vary with time (daylight savings)
//
// description:
//	Try to get time zone info from toString or toLocaleString
//	method of the Date object -- UTC offset is not a time zone.
//	See http://www.twinsun.com/tz/tz-link.htm
//	Note: results may be inconsistent across browsers.

	var str = dateObject.toString(); // Start looking in toString
	var tz = ''; // The result -- return empty string if nothing found
	var match;

	// First look for something in parentheses -- fast lookup, no regex
	var pos = str.indexOf('(');
	if(pos > -1){
		pos++;
		tz = str.substring(pos, str.indexOf(')'));
	}
	// If at first you don't succeed ...
	else{
		// If IE knows about the TZ, it appears before the year
		// Capital letters or slash before a 4-digit year 
		// at the end of string
		var pat = /([A-Z\/]+) \d{4}$/;
		if((match = str.match(pat))){
			tz = match[1];
		}else{
		// Some browsers (e.g. Safari) glue the TZ on the end
		// of toLocaleString instead of putting it in toString
			str = dateObject.toLocaleString();
			// Capital letters or slash -- end of string, 
			// after space
			pat = / ([A-Z\/]+)$/;
			if((match = str.match(pat))){
				tz = match[1];
			}
		}
	}

	// Make sure it doesn't somehow end up return AM or PM
	return tz == 'AM' || tz == 'PM' ? '' : tz; //String
}

// Utility methods to do arithmetic calculations with Dates

dojo.date.compare = function(/*Date|Number*/date1, /*Date|Number?*/date2, /*String?*/portion){
	//	summary
	//		Compare two date objects by date, time, or both.
	//
	//  description
	//  	Returns 0 if equal, positive if a > b, else negative.
	//
	//	date1
	//		Date object or Number equivalent
	//
	//	date2
	//		Date object or Number equivalent.  If not specified, the current Date is used.
	//
	//	portion
	//		A string indicating the "date" or "time" portion of a Date object.  Compares both "date" and "time" by default.
	//		One of the following: {"date", "time", "datetime"}

	date1 = new Date(date1);
	date2 = new Date(date2 || new Date());

	if(typeof portion !== "undefined" && portion != "datetime"){
		if(portion == "date"){
			// Ignore times and compare dates.
			date1.setHours(0, 0, 0, 0);
			date2.setHours(0, 0, 0, 0);
		}else{
			// Ignore dates and compare times.
			date1.setFullYear(0, 0, 0);
			date2.setFullYear(0, 0, 0);
		}
	}
	
	if(date1 > date2){ return 1; } // int
	if(date1 < date2){ return -1; } // int
	return 0; // int
};

dojo.date.add = function(/*Date|Number*/date, /*String*/interval, /*int*/amount){
	//	summary
	//		Add to a Date in intervals of different size, from milliseconds to years
	//
	//	date
	//		Date object to start with, or Number equivalent
	//
	//	interval
	//		A string representing the interval.  One of the following:
	//		{year, month, day, hour, minute, second, millisecond, quarter, week, weekday}
	//
	//	amount
	//		How much to add to the date.

	date = new Date(date);
	var sum = new Date(date);
	var fixOvershoot = false;
	var property = "Date";

	switch(interval){
		case "day":
			break;
		case "weekday":
			//i18n FIXME: assumes Saturday/Sunday weekend, but even this is not standard.  There are CLDR entries to localize this.
			var dayOfMonth = date.getDate();
			var weeks = 0;
			var days = 0;
			var strt = 0;
			var trgt = 0;
			var adj = 0;
			// Divide the increment time span into weekspans plus leftover days
			// e.g., 8 days is one 5-day weekspan / and two leftover days
			// Can't have zero leftover days, so numbers divisible by 5 get
			// a days value of 5, and the remaining days make up the number of weeks
			var mod = amount % 5;
			if(!mod){
				days = (amount > 0) ? 5 : -5;
				weeks = (amount > 0) ? ((amount-5)/5) : ((amount+5)/5);
			}else{
				days = mod;
				weeks = parseInt(amount/5);
			}
			// Get weekday value for orig date param
			strt = date.getDay();
			// Orig date is Sat / positive incrementer
			// Jump over Sun
			if(strt == 6 && amount > 0){
				adj = 1;
			}else if(strt == 0 && amount < 0){
			// Orig date is Sun / negative incrementer
			// Jump back over Sat
				adj = -1;
			}
			// Get weekday val for the new date
			trgt = strt + days;
			// New date is on Sat or Sun
			if(trgt == 0 || trgt == 6){
				adj = (amount > 0) ? 2 : -2;
			}
			// Increment by number of weeks plus leftover days plus
			// weekend adjustments
			amount = dayOfMonth + 7*weeks + days + adj;
			break;
		case "year":
			property = "FullYear";
			// Keep increment/decrement from 2/29 out of March
			fixOvershoot = true;
			break;
		case "week":
			amount *= 7;
			break;
		case "quarter":
			// Naive quarter is just three months
			amount *= 3;
			// fallthrough...
		case "month":
			// Reset to last day of month if you overshoot
			fixOvershoot = true;
			property = "Month";
			break;
		case "hour":
		case "minute":
		case "second":
		case "millisecond":
			property = interval.charAt(0).toUpperCase() + interval.substring(1) + "s";
	}

	if(property){
console.log("property="+property);
		sum["set"+property](sum["get"+property]()+amount);
	}

	if(fixOvershoot){
		if(sum.getDate() < date.getDate()){
			sum.setDate(0);
		}
	}

	return sum; // Date
};

dojo.date.diff = function(/*Date|Number*/date1, /*Date|Number*/date2, /*String?*/interval){
	//	summary
	//		Get the difference in a specific unit of time (e.g., number of months, weeks,
	//		days, etc.) between two dates, rounded to the nearest integer.
	//
	//	date1
	//		Date object or Number equivalent
	//
	//	date2
	//		Date object or Number equivalent
	//
	//	interval
	//		A string representing the interval.  One of the following:
	//		{year, month, day, hour, minute, second, millisecond, quarter, week, weekday}

	// Accept timestamp input
	date1 = new Date(date1);
	date2 = new Date(date2);

	var yearDiff = date2.getFullYear() - date1.getFullYear();
	var delta = 1; // Integer return value

	switch(interval){
		case "quarter":
			var m1 = date1.getMonth();
			var m2 = date2.getMonth();
			// Figure out which quarter the months are in
			var q1 = Math.floor(m1/3) + 1;
			var q2 = Math.floor(m2/3) + 1;
			// Add quarters for any year difference between the dates
			q2 += (yearDiff * 4);
			delta = q2 - q1;
			break;
		case "weekday":
			var days = Math.round(dojo.date.diff(date1, date2, "day"));
			var weeks = parseInt(dojo.date.diff(date1, date2, "week"));
			var mod = days % 7;

			// Even number of weeks
			if(mod == 0){
				days = weeks*5;
			}else{
				// Weeks plus spare change (< 7 days)
				var adj = 0;
				var aDay = date1.getDay();
				var bDay = date2.getDay();

				weeks = parseInt(days/7);
				mod = days % 7;
				// Mark the date advanced by the number of
				// round weeks (may be zero)
				var dtMark = new Date(date1);
				dtMark.setDate(dtMark.getDate()+(weeks*7));
				var dayMark = dtMark.getDay();

				// Spare change days -- 6 or less
				if(days > 0){
					switch(true){
						// Range starts on Sat
						case aDay == 6:
							adj = -1;
							break;
						// Range starts on Sun
						case aDay == 0:
							adj = 0;
							break;
						// Range ends on Sat
						case bDay == 6:
							adj = -1;
							break;
						// Range ends on Sun
						case bDay == 0:
							adj = -2;
							break;
						// Range contains weekend
						case (dayMark + mod) > 5:
							adj = -2;
							break;
						default:
							// Do nothing
							break;
					}
				}else if(days < 0){
					switch (true){
						// Range starts on Sat
						case aDay == 6:
							adj = 0;
							break;
						// Range starts on Sun
						case aDay == 0:
							adj = 1;
							break;
						// Range ends on Sat
						case bDay == 6:
							adj = 2;
							break;
						// Range ends on Sun
						case bDay == 0:
							adj = 1;
							break;
						// Range contains weekend
						case (dayMark + mod) < 0:
							adj = 2;
							break;
						default:
							// Do nothing
							break;
					}
				}
				days += adj;
				days -= (weeks*2);
			}
			delta = days;
			break;
		case "year":
			delta = yearDiff;
			break;
		case "month":
			delta = (date2.getMonth() - date1.getMonth()) + (yearDiff * 12);
			break;
		case "week":
			// Truncate instead of rounding
			// Don't use Math.floor -- value may be negative
			delta = parseInt(dojo.date.diff(date1, date2, "day")/7);
			break;
		case "day":
			delta /= 24;
			// fallthrough
		case "hour":
			delta /= 60;
			// fallthrough
		case "minute":
			delta /= 60;
			// fallthrough
		case "second":
			delta /= 1000;
			// fallthrough
		case "millisecond":
			delta *= date2.getTime() - date1.getTime();
	}

	// Round for fractional values and DST leaps
	return Math.round(delta); // Number (integer)
};
