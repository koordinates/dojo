dojo.provide("dojox.date.IslamicDate");
dojo.experimental("dojox.date.IslamicDate");

dojo.require("dojo.date.locale"); //TODO: move dependency to another module?
dojo.require("dojo.date");
dojo.requireLocalization("dojo.cldr", "islamic");

dojo.declare("dojox.date.IslamicDate", null, {
	// summary: The component defines the Islamic (Hijri) Calendar Object
	//
	// description:
	//	This module is similar to the Date() object provided by JavaScript
	//
	// example:
	// |	dojo.require("dojox.date.IslamicDate"); 
	// |		
	// |	var date = new dojox.date.IslamicDate();
	// |	document.writeln(date.getFullYear()+'\'+date.getMonth()+'\'+date.getDate());


	_date: 0,
	_month: 0,
	_year: 0,
	_hours: 0,
	_minutes: 0,
	_seconds: 0,
	_milliseconds: 0,
	_day: 0,
	_GREGORIAN_EPOCH : 1721425.5,
	_ISLAMIC_EPOCH : 1948439.5,

	constructor: function(){
		// summary: This is the constructor
		// description:
		//	This fucntion initialize the date object values
		//
		// example:
		// |		var date1 = new dojox.date.IslamicDate();
		// |
		// |		var date2 = new dojox.date.IslamicDate("12\2\1429");
		// |
		// |		var date3 = new dojox.date.IslamicDate(date2);
		// |
		// |		var date4 = new dojox.date.IslamicDate(1429,2,12);

		var arg_no = arguments.length;

		if(!arg_no){
			// use the current date value
			var d = new Date();
			this._day = d.getDay();
			this.fromGregorian(d);
		}else if(arg_no ==1){
			//date string or Islamic date object passed
			this.parse(arguments[0]);
		}else if(arg_no >=3){
			// YYYY MM DD arguments passed
			this._year = arguments[0];
			this._month = arguments[1];
			this._date = arguments[2];
			this._hours = arguments[3] || 0;
			this._minutes = arguments[4] || 0;
			this._seconds = arguments[5] || 0;
			this._milliseconds = arguments[6] || 0;
		}
	},

	getDate:function(){
		// summary: This function returns the date value (1 - 30)
		//
		// example:
		// |		var date1 = new dojox.date.IslamicDate();
		// |
		// |		document.writeln(date1.getDate);		
		return this._date;
	},
	
	getMonth:function(){
		// summary: This function return the month value ( 0 - 11 )
		//
		// example:
		// |		var date1 = new dojox.date.IslamicDate();
		// |
		// |		document.writeln(date1.getMonth()+1);

		return this._month;
	},

	getFullYear:function(){
		// summary: This function return the Year value 
		//
		// example:
		// |		var date1 = new dojox.date.IslamicDate();
		// |
		// |		document.writeln(date1.getFullYear());

		return this._year;
	},
		
	getDay:function(){
		// summary: This function return Week Day value ( 0 - 6 )
		//
		// example:
		// |		var date1 = new dojox.date.IslamicDate();
		// |
		// |		document.writeln(date1.getDay());

		var gd = this.toGregorian();
		return gd.getDay();
	},
		
	getHours:function(){
		//summary: returns the Hour value
		return this._hours;
	},
	
	getMinutes:function(){
		//summary: returns the Minuites value
		return this._minutes;
	},

	getSeconds:function(){
		//summary: returns the seconde value
		return this._seconds;
	},

	getMilliseconds:function(){
		//summary: returns the Milliseconds value
		return this._milliseconds;
	},

	setDate: function(/*number*/date){	
		// summary: This function sets the Date
		// example:
		// |		var date1 = new dojox.date.IslamicDate();
		// |		date1.setDate(2);

		date = parseInt(date, 10);

		if(date > 0 && date <= this.getDaysInIslamicMonth(this._month, this._year)){
			this._date = date;
		}else{
			var mdays;
			if(date>0){
				for(mdays = this.getDaysInIslamicMonth(this._month, this._year);	
					date > mdays; 
						date -= mdays,mdays =this.getDaysInIslamicMonth(this._month, this._year)){
					this._month++;
					if(this._month >= 12){this._year++; this._month -= 12;}
				}

				this._date = date;
			}else{
				for(mdays = this.getDaysInIslamicMonth((this._month-1)>=0 ?(this._month-1) :11 ,((this._month-1)>=0)? this._year: this._year-1);	
						date <= 0; 
							mdays = this.getDaysInIslamicMonth((this._month-1)>=0 ? (this._month-1) :11,((this._month-1)>=0)? this._year: this._year-1)){
					this._month--;
					if(this._month < 0){this._year--; this._month += 12;}

					date+=mdays;
				}
				this._date = date;
			}
		}
		return this;
	},

	setYear:function(/*number*/year){
		// summary: This function set Year
		//
		// example:
		// |		var date1 = new dojox.date.IslamicDate();
		// |		date1.setYear(1429);

		this._year = parseInt(year, 10);
	},
		
		
	setMonth:function(/*number*/month){
		// summary: This function set Month
		//
		// example:
		// |		var date1 = new dojox.date.IslamicDate();
		// |		date1.setMonth(2);

		this._year += Math.floor(month / 12);
		this._month = Math.floor(month % 12);
	},

	setHours:function(){
		//summary: set the Hours
		var hours_arg_no = arguments.length;
		var hours = 0;

		// NOTE: What is allowed for these arguments?

		if(hours_arg_no >= 1){
			hours = arguments[0] || 0;
		}
			
		if(hours_arg_no >= 2){
			this._minutes = arguments[1] || 0;
		}
			
		if(hours_arg_no >= 3){
			this._seconds = arguments[2] || 0;
		}
			
		if(hours_arg_no == 4){
			this._milliseconds = arguments[3] || 0;
		}
						
		while(hours >= 24){
			this._date++;
			var mdays = this.getDaysInIslamicMonth(this._month, this._year);
			if(this._date > mdays){
				this._month ++;
				if(this._month >= 12){this._year++; this._month -= 12;}
				this._date -= mdays;
			}
			hours -= 24;
		}
		this._hours = hours;
	},

	setMinutes:function(/*number*/minutes){
		//summary: set the Minutes

		while(minutes >= 60){
			this._hours++;
			if(this._hours >= 24){		 
				this._date++;
				this._hours -= 24;
				var mdays = this.getDaysInIslamicMonth(this._month, this._year);
				if(this._date > mdays){
						this._month ++;
						if(this._month >= 12){this._year++; this._month -= 12;}
						this._date -= mdays;
				}
			}
			minutes -= 60;
		}
		this._minutes = minutes;
	},
		
		
	setSeconds:function(/*number*/seconds){
		//summary: set Seconds
		while(seconds >= 60){
			this._minutes++;
			if(this._minutes >= 60){
				this._hours++;
				this._minutes -= 60;
				if(this._hours >= 24){		 
					this._date++;
					this._hours -= 24;
					var mdays = this.getDaysInIslamicMonth(this._month, this._year);
					if(this._date > mdays){
						this._month ++;
						if(this._month >= 12){this._year++; this._month -= 12;}
						this._date -= mdays;
					}
				}
			}
			seconds -= 60;
		}
		this._seconds = seconds;
	},
		
	setMilliseconds:function(/*number*/milliseconds){
		//summary: set the Millisconds
		while(milliseconds >= 1000){
			this.setSeconds++;
			if(this.setSeconds >= 60){
				this._minutes++;
				this.setSeconds -= 60;
				if(this._minutes >= 60){
					this._hours++;
					this._minutes -= 60;
					if(this._hours >= 24){		 
						this._date++;
						this._hours -= 24;
						var mdays = this.getDaysInIslamicMonth(this._month, this._year);
				if(this._date > mdays){
					this._month ++;
					if(this._month >= 12){this._year++; this._month -= 12;}
					this._date -= mdays;
					}
				}
			}
		}
			milliseconds -= 1000;
		}
		this._milliseconds = milliseconds;
	},
		
		
	toString:function(){ 
		// summary: This returns a string representation of the date in "DDDD MMMM DD YYYY HH:MM:SS" format
		// example:
		// |		var date1 = new dojox.date.IslamicDate();
		// |		document.writeln(date1.toString());

		//FIXME: TZ/DST issues?
		var x = new Date();
		x.setHours(this._hours);
		x.setMinutes(this._minutes);
		x.setSeconds(this._seconds);
		x.setMilliseconds(this._milliseconds);
		var timeString = x.toTimeString();  
		//TODO : needs to be internationalized using dojo.date.format()?  or use separate module
		return(dojox.date.IslamicDate.weekDays[this.getDay()] +" "+dojox.date.IslamicDate.months[this._month]+" "+ this._date + " " + this._year+" "+timeString);
	},
		
		
	toGregorian:function(){
		// summary: This returns the equevalent Grogorian date value in Date object
		// example:
		// |		var dateIslamic = new dojox.date.IslamicDate(1429,11,20);
		// |		var dateGregorian = dateIslamic.toGregorian();

		var hYear = this._year;
		var hMonth = this._month;
		var hDate = this._date;
		var julianDay = hDate + Math.ceil(29.5 * hMonth) + (hYear - 1) * 354 +
						Math.floor((3 + (11 * hYear)) / 30) + this._ISLAMIC_EPOCH - 1;

		var wjd = Math.floor(julianDay - 0.5) + 0.5,
			depoch = wjd - this._GREGORIAN_EPOCH,
			quadricent = Math.floor(depoch / 146097),
			dqc = this._mod(depoch, 146097),
			cent = Math.floor(dqc / 36524),
			dcent = this._mod(dqc, 36524),
			quad = Math.floor(dcent / 1461),
			dquad = this._mod(dcent, 1461),
			yindex = Math.floor(dquad / 365),
			year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
		if(!(cent == 4 || yindex == 4)){
			year++;
		}
		
		var gYearStart = this._GREGORIAN_EPOCH + (365 * (year - 1)) + Math.floor((year - 1) / 4) -
						( Math.floor((year - 1) / 100)) + Math.floor((year - 1) / 400);
						
		var yearday = wjd - gYearStart;
		
		var tjd = (this._GREGORIAN_EPOCH - 1) + (365 * (year - 1)) + Math.floor((year - 1) / 4) -
				( Math.floor((year - 1) / 100)) + Math.floor((year - 1) / 400) + Math.floor( (739 / 12) +
				( (dojo.date.isLeapYear(new Date(year,3,1)) ? -1 : -2)) + 1);
			
		var leapadj = ((wjd < tjd ) ? 0 : (dojo.date.isLeapYear(new Date(year,3,1)) ? 1 : 2));
					
		var month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
		var tjd2 = (this._GREGORIAN_EPOCH - 1) + (365 * (year - 1)) +
					Math.floor((year - 1) / 4) - (Math.floor((year - 1) / 100)) +
					Math.floor((year - 1) / 400) + Math.floor((((367 * month) - 362) / 12) +
					((month <= 2) ? 0 : (dojo.date.isLeapYear(new Date(year,month,1)) ? -1 : -2)) + 1);
					
		var day = (wjd - tjd2);

		var gdate = new Date(year, month-1, day);

		gdate.setHours(this._hours);
		gdate.setMilliseconds(this._milliseconds);
		gdate.setMinutes(this._minutes);
		gdate.setSeconds(this._seconds); 

		return gdate;
	},

	//TODO: would it make more sense to make this a constructor option? or a static?
	// ported from the Java class com.ibm.icu.util.HebrewCalendar from ICU4J v3.6.1 at http://www.icu-project.org/
	fromGregorian:function(/*Date*/gdate){
		// summary: This function returns the equivalent Islamic Date value for the Gregorian Date
		// example:
		// |		var dateIslamic = new dojox.date.IslamicDate();
		// |		var dateGregorian = new Date(2008,10,12);
		// |		dateIslamic.fromGregorian(dateGregorian);

		var date = new Date(gdate);
		var gYear = date.getFullYear(),
			gMonth = date.getMonth(),
			gDay = date.getDate();
		
		var julianDay = (this._GREGORIAN_EPOCH - 1) + (365 * (gYear - 1)) + Math.floor((gYear - 1) / 4) +
					(-Math.floor((gYear - 1) / 100)) + Math.floor((gYear - 1) / 400) +
					Math.floor((((367 * (gMonth+1)) - 362) / 12) +
					(((gMonth+1) <= 2) ? 0 : (dojo.date.isLeapYear(date) ? -1 : -2)) + gDay) +
					(Math.floor(date.getSeconds() + 60 * (date.getMinutes() + 60 * date.getHours()) + 0.5) / 86400.0);
		julianDay = Math.floor(julianDay) + 0.5;
		
		var days = julianDay - 1948440;
		var hYear  = Math.floor( (30 * days + 10646) / 10631.0 );
		var hMonth = Math.ceil((days - 29 - this._yearStart(hYear)) / 29.5 );
		hMonth = Math.min(hMonth, 11);
		var hDay = Math.ceil(days - this._monthStart(hYear, hMonth)) + 1;

		this._date = hDay;
		this._month = hMonth;
		this._year = hYear;
		this._hours = date.getHours();
		this._minutes = date.getMinutes();
		this._seconds = date.getSeconds();
		this._milliseconds = date.getMilliseconds();
		this._day = date.getDay();
		return this;
	},

//TODO i18n: factor out and use CLDR patterns?		 
	parse:function(/*String*/dateObject){
		// summary: This function parse the date string
		//
		// example:
		// |		var dateIslamic = new dojox.date.IslamicDate();
		// |		dateIslamic.parse("Safar 2 1429");

		var sDate = dateObject.toString();
		var template = /\d{1,2}\D\d{1,2}\D\d{4}/;
		var sD, mD = sDate.match(template);
		if(mD){
			mD = mD.toString();
			sD = mD.split(/\D/);
			this._month = sD[0]-1;
			this._date = sD[1];
			this._year = sD[2];
		}else{								
			mD = sDate.match(/\D{4,}\s\d{1,2}\s\d{4}/);
			if(mD){
				mD = mD.toString();

				var dayYear = mD.match(/\d{1,2}\s\d{4}/);
  				dayYear = dayYear.toString();

  				var mName = mD.replace(/\s\d{1,2}\s\d{4}/,'');

  				mName = mName.toString();
  				this._month = dojo.indexOf(this._months, mName); //FIXME: check for -1?
  				sD = dayYear.split(/\s/);

  				this._date = sD[0];
  				this._year = sD[1];
			}
		}
								  
		var sTime = sDate.match(/\d{2}:/);
		if(sTime){
			sTime = sTime.toString(); 
			var tArr = sTime.split(':');
			this._hours = tArr[0];
			sTime = sDate.match(/\d{2}:\d{2}/);
			if(sTime){
				sTime = sTime.toString();
				tArr = sTime.split(':');
			}
			this._minutes = tArr[1] || 0;

			sTime = sDate.match(/\d{2}:\d{2}:\d{2}/);
			if(sTime){
				sTime = sTime.toString();
				tArr = sTime.split(':');
			}
			this._seconds = tArr[2] || 0;
		}else{
			this._hours = 0;
			this._minutes = 0;
			this._seconds = 0;
		}
		this._milliseconds = 0;
	},
	
	
	valueOf:function(){
		// summary: This function returns The stored time value in milliseconds 
		// since midnight, January 1, 1970 UTC
		//	
		var gdate = this.toGregorian();
		return gdate.valueOf();
	},

	// ported from the Java class com.ibm.icu.util.HebrewCalendar from ICU4J v3.6.1 at http://www.icu-project.org/
	_yearStart:function(/*Number*/year){
		//summary: return start of Islamic year
		return (year-1)*354 + Math.floor((3+11*year)/30.0);
	},

	// ported from the Java class com.ibm.icu.util.HebrewCalendar from ICU4J v3.6.1 at http://www.icu-project.org/
	_monthStart:function(/*Number*/year, /*Number*/month){
		//summary: return the start of Islamic Month
		return Math.ceil(29.5*month) +
			(year-1)*354 + Math.floor((3+11*year)/30.0);
	},

	// ported from the Java class com.ibm.icu.util.HebrewCalendar from ICU4J v3.6.1 at http://www.icu-project.org/
	_civilLeapYear:function(/*Number*/year){
		//summary: return Boolean value if Islamic leap year
		return (14 + 11 * year) % 30 < 11;
	},

	// ported from the Java class com.ibm.icu.util.HebrewCalendar from ICU4J v3.6.1 at http://www.icu-project.org/
	getDaysInIslamicMonth:function(/*Number*/month, /*Number*/ year){
		//summary: returns the number of days in the given Islamic Month
		var length = 0;
		length = 29 + ((month+1) % 2);
		if(month == 11 && this._civilLeapYear(year)){
			length++;
		}
		return length;
	},

	_mod:function(a, b){
		return a - (b * Math.floor(a / b));
	}
		
});

//TODOC
dojox.date.IslamicDate.getDaysInIslamicMonth = function(/*dojox.date.IslamicDate*/month){
	return new dojox.date.IslamicDate().getDaysInIslamicMonth(month.getMonth(),month.getFullYear()); // dojox.date.IslamicDate
};

dojox.date.IslamicDate._getNames = function(/*String*/item, /*String*/type, /*String?*/use, /*String?*/locale){
	// summary:
	//		Used to get localized strings from dojo.cldr for day or month names.
	//
	// item:
	//	'months' || 'days'
	// type:
	//	'wide' || 'narrow' || 'abbr' (e.g. "Monday", "Mon", or "M" respectively, in English)
	// use:
	//	'standAlone' || 'format' (default)
	// locale:
	//	override locale used to find the names

	var label;
	var lookup = dojo.i18n.getLocalization("dojo.cldr", "islamic", locale);
	var props = [item, use, type];
	if(use == 'standAlone'){
		label = lookup[props.join('-')];
	}
	props[1] = 'format';

	// return by copy so changes won't be made accidentally to the in-memory model
	return (label || lookup[props.join('-')]).concat(); /*Array*/
};

dojox.date.IslamicDate.weekDays = dojox.date.IslamicDate._getNames('days', 'wide', 'format');

dojox.date.IslamicDate.months = dojox.date.IslamicDate._getNames('months', 'wide', 'format');
	
dojo.provide("dojox.date.php");
dojo.require("dojo.date");
dojo.require("dojox.string.tokenize");

dojox.date.php.format = function(/*Date*/ date, /*String*/ format){
	// summary: Get a formatted string for a given date object
	var df = new dojox.date.php.DateFormat(format);
	return df.format(date);	
};

dojox.date.php.DateFormat = function(/*String*/ format){
	// summary: Format the internal date object
	if(!this.regex){
		var keys = [];
		for(var key in this.constructor.prototype){
			if(dojo.isString(key) && key.length == 1 && dojo.isFunction(this[key])){
				keys.push(key);
			}
		}
		this.constructor.prototype.regex = new RegExp("(?:(\\\\.)|([" + keys.join("") + "]))", "g");
	}

	var replacements = [];

	this.tokens = dojox.string.tokenize(format, this.regex, function(escape, token, i){
		if(token){
			replacements.push([i, token]);
			return token;
		}
		if(escape){
			return escape.charAt(1);
		}
	});

	this.replacements = replacements;
};
dojo.extend(dojox.date.php.DateFormat, {
	weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	weekdays_3: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	months_3: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	monthdays: [31,28,31,30,31,30,31,31,30,31,30,31],

	format: function(/*Date*/ date){
		this.date = date;
		for(var i = 0, replacement; replacement = this.replacements[i]; i++){
			this.tokens[replacement[0]] = this[replacement[1]]();
		}
		return this.tokens.join("");
	},

	// Day

	d: function(){
		// summary: Day of the month, 2 digits with leading zeros
		var j = this.j();
		return (j.length == 1) ? "0" + j : j;
	},

	D: function(){
		// summary: A textual representation of a day, three letters
		return this.weekdays_3[this.date.getDay()];
	},

	j: function(){
		// summary: Day of the month without leading zeros
		return this.date.getDate() + "";
	},

	l: function(){
		// summary: A full textual representation of the day of the week
		return this.weekdays[this.date.getDay()];
	},
	
	N: function(){
		// summary: ISO-8601 numeric representation of the day of the week (added in PHP 5.1.0)
		var w = this.w();
		return (!w) ? 7 : w;
	},

	S: function(){
		// summary: English ordinal suffix for the day of the month, 2 characters
		switch(this.date.getDate()){
			case 11: case 12: case 13: return "th";
			case 1: case 21: case 31: return "st";
			case 2: case 22: return "nd";
			case 3: case 23: return "rd";
			default: return "th";
		}
	},

	w: function(){
		// summary: Numeric representation of the day of the week
		return this.date.getDay() + "";
	},

	z: function(){
		// summary: The day of the year (starting from 0)
		var millis = this.date.getTime() - new Date(this.date.getFullYear(), 0, 1).getTime();
		return Math.floor(millis/86400000) + "";
	},

	// Week

	W: function(){
		// summary: ISO-8601 week number of year, weeks starting on Monday (added in PHP 4.1.0)
		var week;
		var jan1_w = new Date(this.date.getFullYear(), 0, 1).getDay() + 1;
		var w = this.date.getDay() + 1;
		var z = parseInt(this.z(), 10);

		if(z <= (8 - jan1_w) && jan1_w > 4){
			var last_year = new Date(this.date.getFullYear() - 1, this.date.getMonth(), this.date.getDate());
			if(jan1_w == 5 || (jan1_w == 6 && dojo.date.isLeapYear(last_year))){
				week = 53;
			}else{
				week = 52;
			}
		}else{
			var i;
			if(Boolean(this.L())){
				i = 366;
			}else{
				i = 365;
			}
			if((i - z) < (4 - w)){
				week = 1;
			}else{
				var j = z + (7 - w) + (jan1_w - 1);
				week = Math.ceil(j / 7);
				if(jan1_w > 4){
					--week;
				}
			}
		}
		
		return week;
	},

	// Month

	F: function(){
		// summary: A full textual representation of a month, such as January or March
		return this.months[this.date.getMonth()];
	},

	m: function(){
		// summary: Numeric representation of a month, with leading zeros
		var n = this.n();
		return (n.length == 1) ? "0" + n : n;
	},

	M: function(){
		// summary: A short textual representation of a month, three letters
		return this.months_3[this.date.getMonth()];
	},

	n: function(){
		// summary: Numeric representation of a month, without leading zeros
		return this.date.getMonth() + 1 + "";
	},

	t: function(){
		// summary: Number of days in the given month
		return (Boolean(this.L()) && this.date.getMonth() == 1) ? 29 : this.monthdays[this.getMonth()];
	},

	// Year

	L: function(){
		// summary: Whether it's a leap year
		return (dojo.date.isLeapYear(this.date)) ? "1" : "0";
	},

	o: function(){
		// summary:
		//		ISO-8601 year number. This has the same value as Y, except that if
		//		the ISO week number (W) belongs to the previous or next year, that year is used instead. (added in PHP 5.1.0)
		// TODO: Figure out what this means
	},

	Y: function(){
		// summary: A full numeric representation of a year, 4 digits
		return this.date.getFullYear() + "";
	},

	y: function(){
		// summary: A two digit representation of a year
		return this.Y().slice(-2);
	},

	// Time

	a: function(){
		// summary: Lowercase Ante meridiem and Post meridiem
		return this.date.getHours() >= 12 ? "pm" : "am";
	},

	b: function(){
		// summary: Uppercase Ante meridiem and Post meridiem
		return this.a().toUpperCase();
	},

	B: function(){
		// summary:
		//	Swatch Internet time
		//	A day is 1,000 beats. All time is measured from GMT + 1
		var off = this.date.getTimezoneOffset() + 60;
		var secs = (this.date.getHours() * 3600) + (this.date.getMinutes() * 60) + this.getSeconds() + (off * 60);
		var beat = Math.abs(Math.floor(secs / 86.4) % 1000) + "";
		while(beat.length <  2) { beat = "0" + beat; }
		return beat;
	},

	g: function(){
		// summary: 12-hour format of an hour without leading zeros
		return (this.date.getHours() > 12) ? this.date.getHours() - 12 + "" : this.date.getHours() + "";
	},

	G: function(){
		// summary: 24-hour format of an hour without leading zeros
		return this.date.getHours() + "";
	},

	h: function(){
		// summary: 12-hour format of an hour with leading zeros
		var g = this.g();
		return (g.length == 1) ? "0" + g : g;
	},

	H: function(){
		// summary: 24-hour format of an hour with leading zeros
		var G = this.G();
		return (G.length == 1) ? "0" + G : G;
	},

	i: function(){
		// summary: Minutes with leading zeros
		var mins = this.date.getMinutes() + "";
		return (mins.length == 1) ? "0" + mins : mins;
	},

	s: function(){
		// summary: Seconds, with leading zeros
		var secs = this.date.getSeconds() + "";
		return (secs.length == 1) ? "0" + secs : secs;
	},

	// Timezone

	e: function(){
		// summary: Timezone identifier (added in PHP 5.1.0)
		return dojo.date.getTimezoneName(this.date);
	},

	I: function(){
		// summary: Whether or not the date is in daylight saving time
		// TODO: Can dojo.date do this?
	},

	O: function(){
		// summary: Difference to Greenwich time (GMT) in hours
		var off = Math.abs(this.date.getTimezoneOffset());
		var hours = Math.floor(off / 60) + "";
		var mins = (off % 60) + "";
		if(hours.length == 1) { hours = "0" + hours; }
		if(mins.length == 1) { hours = "0" + mins; }
		return ((this.date.getTimezoneOffset() < 0) ? "+" : "-") + hours + mins;
	},

	P: function(){
		// summary: Difference to Greenwich time (GMT) with colon between hours and minutes (added in PHP 5.1.3)
		var O = this.O();
		return O.substring(0, 2) + ":" + O.substring(2, 4);
	},

	T: function(){
		// summary: Timezone abbreviation

		// Guess...
		return this.e().substring(0, 3);
	},

	Z: function(){
		// summary:
		//		Timezone offset in seconds. The offset for timezones west of UTC is always negative,
		//		and for those east of UTC is always positive.
		return this.date.getTimezoneOffset() * -60;
	},

	// Full Date/Time

	c: function(){
		// summary: ISO 8601 date (added in PHP 5)
		return this.Y() + "-" + this.m() + "-" + this.d() + "T" + this.h() + ":" + this.i() + ":" + this.s() + this.P();
	},

	r: function(){
		// summary: RFC 2822 formatted date
		return this.D() + ", " + this.d() + " " + this.M() + " " + this.Y() + " " + this.H() + ":" + this.i() + ":" + this.s() + " " + this.O();
	},

	U: function(){
		// summary: Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)
		return Math.floor(this.date.getTime() / 1000);
	}

});