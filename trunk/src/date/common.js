dojo.provide("dojo.date.common");


/* Supplementary Date Functions
 *******************************/

dojo.date.setDayOfYear = function (dateObject, dayofyear) {
	dateObject.setMonth(0);
	dateObject.setDate(dayofyear);
	return dateObject;
}

dojo.date.getDayOfYear = function (dateObject) {
	var firstDayOfYear = new Date(dateObject.getFullYear(), 0, 1);
	return Math.floor((dateObject.getTime() -
		firstDayOfYear.getTime()) / 86400000);
}




dojo.date.setWeekOfYear = function (dateObject, week, firstDay) {
	if (arguments.length == 1) { firstDay = 0; } // Sunday
	dojo.unimplemented("dojo.date.setWeekOfYear");
}

dojo.date.getWeekOfYear = function (dateObject, firstDay) {
	if (arguments.length == 1) { firstDay = 0; } // Sunday

	// work out the first day of the year corresponding to the week
	var firstDayOfYear = new Date(dateObject.getFullYear(), 0, 1);
	var day = firstDayOfYear.getDay();
	firstDayOfYear.setDate(firstDayOfYear.getDate() -
			day + firstDay - (day > firstDay ? 7 : 0));

	return Math.floor((dateObject.getTime() -
		firstDayOfYear.getTime()) / 604800000);
}




dojo.date.setIsoWeekOfYear = function (dateObject, week, firstDay) {
	if (arguments.length == 1) { firstDay = 1; } // Monday
	dojo.unimplemented("dojo.date.setIsoWeekOfYear");
}

dojo.date.getIsoWeekOfYear = function (dateObject, firstDay) {
	if (arguments.length == 1) { firstDay = 1; } // Monday
	dojo.unimplemented("dojo.date.getIsoWeekOfYear");
}




/* ISO 8601 Functions
 *********************/

dojo.date.setIso8601 = function (dateObject, string){
	var comps = (string.indexOf("T") == -1) ? string.split(" ") : string.split("T");
	dojo.date.setIso8601Date(dateObject, comps[0]);
	if (comps.length == 2) { dojo.date.setIso8601Time(dateObject, comps[1]); }
	return dateObject;
}

dojo.date.fromIso8601 = function (string) {
	return dojo.date.setIso8601(new Date(0, 0), string);
}




dojo.date.setIso8601Date = function (dateObject, string) {
	var regexp = "^([0-9]{4})((-?([0-9]{2})(-?([0-9]{2}))?)|" +
			"(-?([0-9]{3}))|(-?W([0-9]{2})(-?([1-7]))?))?$";
	var d = string.match(new RegExp(regexp));
	if(!d) {
		dojo.debug("invalid date string: " + string);
		return false;
	}
	var year = d[1];
	var month = d[4];
	var date = d[6];
	var dayofyear = d[8];
	var week = d[10];
	var dayofweek = (d[12]) ? d[12] : 1;

	dateObject.setYear(year);
	
	if (dayofyear) { dojo.date.setDayOfYear(dateObject, Number(dayofyear)); }
	else if (week) {
		dateObject.setMonth(0);
		dateObject.setDate(1);
		var gd = dateObject.getDay();
		var day =  (gd) ? gd : 7;
		var offset = Number(dayofweek) + (7 * Number(week));
		
		if (day <= 4) { dateObject.setDate(offset + 1 - day); }
		else { dateObject.setDate(offset + 8 - day); }
	} else {
		if (month) { 
			dateObject.setDate(1);
			dateObject.setMonth(month - 1); 
		}
		if (date) { dateObject.setDate(date); }
	}
	
	return dateObject;
}

dojo.date.fromIso8601Date = function (string) {
	return dojo.date.setIso8601Date(new Date(0, 0), string);
}




dojo.date.setIso8601Time = function (dateObject, string) {
	// first strip timezone info from the end
	var timezone = "Z|(([-+])([0-9]{2})(:?([0-9]{2}))?)$";
	var d = string.match(new RegExp(timezone));

	var offset = 0; // local time if no tz info
	if (d) {
		if (d[0] != 'Z') {
			offset = (Number(d[3]) * 60) + Number(d[5]);
			offset *= ((d[2] == '-') ? 1 : -1);
		}
		offset -= dateObject.getTimezoneOffset();
		string = string.substr(0, string.length - d[0].length);
	}

	// then work out the time
	var regexp = "^([0-9]{2})(:?([0-9]{2})(:?([0-9]{2})(\.([0-9]+))?)?)?$";
	var d = string.match(new RegExp(regexp));
	if(!d) {
		dojo.debug("invalid time string: " + string);
		return false;
	}
	var hours = d[1];
	var mins = Number((d[3]) ? d[3] : 0);
	var secs = (d[5]) ? d[5] : 0;
	var ms = d[7] ? (Number("0." + d[7]) * 1000) : 0;

	dateObject.setHours(hours);
	dateObject.setMinutes(mins);
	dateObject.setSeconds(secs);
	dateObject.setMilliseconds(ms);

	if (offset != 0) {
		dateObject.setTime(dateObject.getTime() + offset * 60000);
	}	
	return dateObject;
}

dojo.date.fromIso8601Time = function (string) {
	return dojo.date.setIso8601Time(new Date(0, 0), string);
}



/* Informational Functions
 **************************/

dojo.date.shortTimezones = ["IDLW", "BET", "HST", "MART", "AKST", "PST", "MST",
	"CST", "EST", "AST", "NFT", "BST", "FST", "AT", "GMT", "CET", "EET", "MSK",
	"IRT", "GST", "AFT", "AGTT", "IST", "NPT", "ALMT", "MMT", "JT", "AWST",
	"JST", "ACST", "AEST", "LHST", "VUT", "NFT", "NZT", "CHAST", "PHOT",
	"LINT"];
dojo.date.timezoneOffsets = [-720, -660, -600, -570, -540, -480, -420, -360,
	-300, -240, -210, -180, -120, -60, 0, 60, 120, 180, 210, 240, 270, 300,
	330, 345, 360, 390, 420, 480, 540, 570, 600, 630, 660, 690, 720, 765, 780,
	840];
/*
dojo.date.timezones = ["International Date Line West", "Bering Standard Time",
	"Hawaiian Standard Time", "Marquesas Time", "Alaska Standard Time",
	"Pacific Standard Time (USA)", "Mountain Standard Time",
	"Central Standard Time (USA)", "Eastern Standard Time (USA)",
	"Atlantic Standard Time", "Newfoundland Time", "Brazil Standard Time",
	"Fernando de Noronha Standard Time (Brazil)", "Azores Time",
	"Greenwich Mean Time", "Central Europe Time", "Eastern Europe Time",
	"Moscow Time", "Iran Standard Time", "Gulf Standard Time",
	"Afghanistan Time", "Aqtobe Time", "Indian Standard Time", "Nepal Time",
	"Almaty Time", "Myanmar Time", "Java Time",
	"Australian Western Standard Time", "Japan Standard Time",
	"Australian Central Standard Time", "Lord Hove Standard Time (Australia)",
	"Vanuata Time", "Norfolk Time (Australia)", "New Zealand Standard Time",
	"Chatham Standard Time (New Zealand)", "Phoenix Islands Time (Kribati)",
	"Line Islands Time (Kribati)"];
*/

dojo.date.getDaysInMonth = function (dateObject) {
	var month = dateObject.getMonth();
	var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (month == 1 && dojo.date.isLeapYear(dateObject)) { return 29; }
	else { return days[month]; }
}

dojo.date.isLeapYear = function (dateObject) {
	/*
	 * Leap years are years with an additional day YYYY-02-29, where the year
	 * number is a multiple of four with the following exception: If a year
	 * is a multiple of 100, then it is only a leap year if it is also a
	 * multiple of 400. For example, 1900 was not a leap year, but 2000 is one.
	 */
	var year = dateObject.getFullYear();
	return (year%400 == 0) ? true : (year%100 == 0) ? false : (year%4 == 0) ? true : false;
}

dojo.date.getTimezoneName = function (dateObject) {
	// need to negate timezones to get it right 
	// i.e UTC+1 is CET winter, but getTimezoneOffset returns -60
	var timezoneOffset = -(dateObject.getTimezoneOffset());
	
	for (var i = 0; i < dojo.date.timezoneOffsets.length; i++) {
		if (dojo.date.timezoneOffsets[i] == timezoneOffset) {
			return dojo.date.shortTimezones[i];
		}
	}
	
	// we don't know so return it formatted as "+HH:MM"
	function $ (s) { s = String(s); while (s.length < 2) { s = "0" + s; } return s; }
	return (timezoneOffset < 0 ? "-" : "+") + $(Math.floor(Math.abs(
		timezoneOffset)/60)) + ":" + $(Math.abs(timezoneOffset)%60);
}



//FIXME: not localized
dojo.date.getOrdinal = function (dateObject) {
	var date = dateObject.getDate();

	if (date%100 != 11 && date%10 == 1) { return "st"; }
	else if (date%100 != 12 && date%10 == 2) { return "nd"; }
	else if (date%100 != 13 && date%10 == 3) { return "rd"; }
	else { return "th"; }
}


/* compare and add
 ******************/
dojo.date.compareTypes={
	// 	summary
	//	bitmask for comparison operations.
	DATE:1, TIME:2 
};
dojo.date.compare=function(/* Date */ dateA, /* Date */ dateB, /* int */ options){
	//	summary
	//	Compare two date objects by date, time, or both.
	var dA=dateA;
	var dB=dateB||new Date();
	var now=new Date();
	var opt=options||(dojo.date.compareTypes.DATE|dojo.date.compareTypes.TIME);
	var d1=new Date(
		((opt&dojo.date.compareTypes.DATE)?(dA.getFullYear()):now.getFullYear()), 
		((opt&dojo.date.compareTypes.DATE)?(dA.getMonth()):now.getMonth()), 
		((opt&dojo.date.compareTypes.DATE)?(dA.getDate()):now.getDate()), 
		((opt&dojo.date.compareTypes.TIME)?(dA.getHours()):0), 
		((opt&dojo.date.compareTypes.TIME)?(dA.getMinutes()):0), 
		((opt&dojo.date.compareTypes.TIME)?(dA.getSeconds()):0)
	);
	var d2=new Date(
		((opt&dojo.date.compareTypes.DATE)?(dB.getFullYear()):now.getFullYear()), 
		((opt&dojo.date.compareTypes.DATE)?(dB.getMonth()):now.getMonth()), 
		((opt&dojo.date.compareTypes.DATE)?(dB.getDate()):now.getDate()), 
		((opt&dojo.date.compareTypes.TIME)?(dB.getHours()):0), 
		((opt&dojo.date.compareTypes.TIME)?(dB.getMinutes()):0), 
		((opt&dojo.date.compareTypes.TIME)?(dB.getSeconds()):0)
	);
	if(d1.valueOf()>d2.valueOf()){
		return 1;	//	int
	}
	if(d1.valueOf()<d2.valueOf()){
		return -1;	//	int
	}
	return 0;	//	int
}

dojo.date.dateParts={ 
	//	summary
	//	constants for use in dojo.date.add
	YEAR:0, MONTH:1, DAY:2, HOUR:3, MINUTE:4, SECOND:5, MILLISECOND:6 
};
dojo.date.add=function(/* Date */ d, /* dojo.date.dateParts */ unit, /* int */ amount){
	var n=(amount)?amount:1;
	var v;
	switch(unit){
		case dojo.date.dateParts.YEAR:{
			v=new Date(d.getFullYear()+n, d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
			break;
		}
		case dojo.date.dateParts.MONTH:{
			v=new Date(d.getFullYear(), d.getMonth()+n, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
			break;
		}
		case dojo.date.dateParts.HOUR:{
			v=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()+n, d.getMinutes(), d.getSeconds(), d.getMilliseconds());
			break;
		}
		case dojo.date.dateParts.MINUTE:{
			v=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()+n, d.getSeconds(), d.getMilliseconds());
			break;
		}
		case dojo.date.dateParts.SECOND:{
			v=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()+n, d.getMilliseconds());
			break;
		}
		case dojo.date.dateParts.MILLISECOND:{
			v=new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()+n);
			break;
		}
		default:{
			v=new Date(d.getFullYear(), d.getMonth(), d.getDate()+n, d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
		}
	};
	return v;	//	Date
};
