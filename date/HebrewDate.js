dojo.provide("dojox.date.HebrewDate");
dojo.experimental("dojox.date.HebrewDate");
dojo.require("dojo.date.locale");
dojo.requireLocalization("dojo.cldr", "hebrew");
dojo.declare("dojox.date.HebrewDate", null, {
	// summary: The component defines the Hebrew Calendar Object
	//
	// description:
	//	This module is similar to the Date() object provided by JavaScript
	//
	// example:
	// |	dojo.require("dojox.date.HebrewDate");
	// |		
	// |	var date = new dojox.date.HebrewDate();
	// |	document.writeln(date.getFullYear()+'\'+date.getMonth()+'\'+date.getDate());

	TISHRI: 0,   
	HESHVAN: 1,
	KISLEV: 2,
	TEVET: 3,
	SHEVAT: 4,
	ADAR_1: 5,
	ADAR: 6,
	NISAN: 7,
	IYAR: 8,
	SIVAN: 9,
	TAMUZ: 10,
	AV: 11,
	ELUL: 12,
		
	// Hebrew date calculations are performed in terms of days, hours, and
	// "parts" (or halakim), which are 1/1080 of an hour, or 3 1/3 seconds.
	HOUR_PARTS: 1080,
	DAY_PARTS: 24*1080,
   
	// An approximate value for the length of a lunar month.
	// It is used to calculate the approximate year and month of a given
	// absolute date.
	MONTH_DAYS: 29,
	MONTH_FRACT: 12*1080 + 793,
	MONTH_PARTS: 29*24*1080 + 12*1080 + 793,
	    
	// The time of the new moon (in parts) on 1 Tishri, year 1 (the epoch)
	// counting from noon on the day before.  BAHARAD is an abbreviation of
	// Bet (Monday), Hey (5 hours from sunset), Resh-Daled (204).
	BAHARAD: 11*1080 + 204,

	// The Julian day of the Gregorian epoch, that is, January 1, 1 on the
	// Gregorian calendar.
	JAN_1_1_JULIAN_DAY: 1721426,

	/**
	* The lengths of the Hebrew months.  This is complicated, because there
	* are three different types of years, or six if you count leap years.
	* Due to the rules for postponing the start of the year to avoid having
	* certain holidays fall on the sabbath, the year can end up being three
	* different lengths, called "deficient", "normal", and "complete".
	*/

	MONTH_LENGTH:  [
		// Deficient  Normal     Complete
		[   30,	    30,	    30	],		 //Tishri
		[   29,	    29,	    30	],		 //Heshvan
		[   29,	    30,	    30	],		 //Kislev
		[   29,	    29,	    29	],		 //Tevet
		[   30,	    30,	    30	],		 //Shevat
		[   30,	    30,	    30	],		 //Adar I (leap years only)
		[   29,	    29,	    29	],		 //Adar
		[   30,	    30,	    30	],		 //Nisan
		[   29,	    29,	    29	],		 //Iyar
		[   30,	    30,	    30	],		 //Sivan
		[   29,	    29,	    29	],		 //Tammuz
		[   30,	    30,	    30	],		 //Av
		[   29,	    29,	    29	]		 //Elul
	],

	/**
	* The cumulative # of days to the end of each month in a non-leap year
	* Although this can be calculated from the MONTH_LENGTH table,
	* keeping it around separately makes some calculations a lot faster
	*/
	MONTH_START:  [
		// Deficient  Normal	Complete
		[    0,		0,		0  ],		// (placeholder)
		[   30,	    30,	    30  ],		// Tishri
		[   59,	    59,	    60  ],		// Heshvan
		[   88,	    89,	    90  ],		// Kislev
		[  117,	   118,	   119  ],		// Tevet
		[  147,	   148,	   149  ],		// Shevat
		[  147,	   148,	   149  ],		// (Adar I placeholder)
		[  176,	   177,	   178  ],		// Adar
		[  206,	   207,	   208  ],		// Nisan
		[  235,	   236,	   237  ],		// Iyar
		[  265,	   266,	   267  ],		// Sivan
		[  294,	   295,	   296  ],		// Tammuz
		[  324,	   325,	   326  ],		// Av
		[  353,	   354,	   355  ]		// Elul
	],

	/**
	* The cumulative # of days to the end of each month in a leap year
	*/
	LEAP_MONTH_START:  [
		// Deficient  Normal	Complete
		[    0,		0,		0  ],		// (placeholder)
		[   30,	    30,	    30  ],		// Tishri
		[   59,	    59,	    60  ],		// Heshvan
		[   88,	    89,	    90  ],		// Kislev
		[  117,	   118,	   119  ],		// Tevet
		[  147,	   148,	   149  ],		// Shevat
		[  177,	   178,	   179  ],		// Adar I
		[  206,	   207,	   208  ],		// Adar II
		[  236,	   237,	   238  ],		// Nisan
		[  265,	   266,	   267  ],		// Iyar
		[  295,	   296,	   297  ],		// Sivan
		[  324,	   325,	   326  ],		// Tammuz
		[  354,	   355,	   356  ],		// Av
		[  383,	   384,	   385  ]		// Elul
	],
	
	GREGORIAN_MONTH_COUNT:  [
		//len len2   st  st2
		[  31,  31,   0,   0 ], // Jan
		[  28,  29,  31,  31 ], // Feb
		[  31,  31,  59,  60 ], // Mar
		[  30,  30,  90,  91 ], // Apr
		[  31,  31, 120, 121 ], // May
		[  30,  30, 151, 152 ], // Jun
		[  31,  31, 181, 182 ], // Jul
		[  31,  31, 212, 213 ], // Aug
		[  30,  30, 243, 244 ], // Sep
		[  31,  31, 273, 274 ], // Oct
		[  30,  30, 304, 305 ], // Nov
		[  31,  31, 334, 335 ] // Dec
		// len  length of month
		// len2 length of month in a leap year
		// st   days in year before start of month
		// st2  days in year before month in leap year
	],

	constructor: function(){
		// summary: This is the constructor
		// description:
		//	This fucntion initialize the date object values
		//
		// example:
		// |		var date1 = new dojox.date.HebrewDate();
		// |
		// |		var date2 = new dojox.date.HebrewDate("12\2\5768");
		// |
		// |		var date3 = new dojox.date.HebrewDate(date2);
		// |
		// |		var date4 = new dojox.date.HebrewDate(5768,2,12);
		var arg_no = arguments.length;
		if(arg_no==0){// use the current date value
			var date = new Date();
   			var result =  this._computeHebrewFields(date);
			this.Date = result[2];
			this.Month = result[1];
			this.Year = result[0];
			this.Hours = date.getHours();
			this.Minutes = date.getMinutes();
			this.Seconds = date.getSeconds();
			this.Milliseconds = date.getMilliseconds();
			this.Day = date.getDay();
		}else if(arg_no ==1){
			//date string or Hebrew date object passed
			this.parse(arguments[0]);
		}else if(arg_no >=3){
			// YYYY MM DD arguments passed
			this.Date = parseInt(arguments[2]);
			this.Month = parseInt(arguments[1]);
			this.Year = parseInt(arguments[0]);
			this.Hours = (arguments[3]!=null )? parseInt(arguments[3]):0;
			this.Minutes = (arguments[4]!=null )? parseInt(arguments[4]):0;
			this.Seconds = (arguments[5]!=null )? parseInt(arguments[5]):0;
			this.Milliseconds = (arguments[6]!=null )? parseInt(arguments[6]):0;
		}
  
		var day = this._startOfYear(this.Year);
		if(this.Month != 0){
			if(this._isLeapYear(this.Year)){
				day += this.LEAP_MONTH_START[this.Month][this._yearType(this.Year)];
			}else{
				day += this.MONTH_START[this.Month][this._yearType(this.Year)];
			}
		}
		day += (this.Date - 1);
		this.Day = ((day+1) % 7);
	},

	getDate:function(){
		// summary: This function returns the date value (1 - 30)
		//
		// example:
		// |		var date1 = new dojox.date.HebrewDate();
		// |
		// |		document.writeln(date1.getDate);
		return parseInt(this.Date);
	},
		
	getMonth:function(){
		// summary: This function return the month value ( 0 - 11 )
		//
		// example:
		// |		var date1 = new dojox.date.HebrewDate();
		// |
		// |		document.writeln(date1.getMonth()+1);
		return parseInt(this.Month);
	},


	getFullYear:function(){
		// summary: This function return the Year value 
		//
		// example:
		// |		var date1 = new dojox.date.HebrewDate();
		// |
		// |		document.writeln(date1.getFullYear());
		return parseInt(this.Year);
	},
			
	getHours:function(){
 		//summary: returns the Hour value
		return this.Hours;
	},
		
	getMinutes:function(){
		//summary: returns the Minuites value

		return this.Minutes;
	},

	getSeconds:function(){
		//summary: returns the seconde value
		return this.Seconds;
	},

	getMilliseconds:function(){
		//summary: returns the Milliseconds value

		return this.Milliseconds;
	},

	setDate: function(/*number*/date){	
		// summary: This function sets the Date
		// example:
		// |		var date1 = new dojox.date.HebrewDate();
		// |		date1.setDate(2);
		date = parseInt(date);
		var mdays;
		if(date>0){
			for(mdays = this.getDaysInHebrewMonth(this.Month, this.Year);
				date>mdays;
					date-=mdays,mdays = this.getDaysInHebrewMonth(this.Month, this.Year)){
				this.Month ++;
				if(!this._isLeapYear(this.Year)&&(this.Month==5))  this.Month ++;
				if(this.Month >= 13){this.Year++; this.Month -= 13;}
			}
			
			this.Date = date;
		}else{
			for(mdays = this.getDaysInHebrewMonth((this.Month-1)>=0 ? (this.Month-1) : 12 ,((this.Month-1)>=0)? this.Year : this.Year-1);
					date<=0;
						mdays = this.getDaysInHebrewMonth((this.Month-1)>=0 ? (this.Month-1) : 12,((this.Month-1)>=0)? this.Year : this.Year-1) ){
				this.Month --;
				if(!this._isLeapYear(this.Year)&&(this.Month==5))  this.Month --;
				if(this.Month < 0){this.Year--; this.Month += 13;}

				date+=mdays;
			} 
			this.Date = date;
		}

		var day = this._startOfYear(this.Year);
		if(this.Month != 0){
			if(this._isLeapYear(this.Year)){
				day += this.LEAP_MONTH_START[this.Month][this._yearType(this.Year)];
			}else{
				day += this.MONTH_START[this.Month][this._yearType(this.Year)];
			}
		}
		day += (this.Date - 1);
		this.Day = ((day+1) % 7);
		return this;
	},

	setYear:function(/*number*/year){
		// summary: This function set Year
		//
		// example:
		// |		var date1 = new dojox.date.HebrewDate();
		// |		date1.setYear(5768);

		this.Year = parseInt(year);
		if(!this._isLeapYear(this.Year)&&(this.Month==5))  this.Month ++;
		var day = this._startOfYear(this.Year);
		if(this.Month != 0){
			if(this._isLeapYear(this.Year)){
				day += this.LEAP_MONTH_START[this.Month][this._yearType(this.Year)];
			}else{
				day += this.MONTH_START[this.Month][this._yearType(this.Year)];
			}
		}
		day += (this.Date - 1);
		this.Day = ((day+1) % 7);
		return this;
	},
			
	setMonth:function(/*number*/month){
		// summary: This function set Month
		//
		// example:
		// |		var date1 = new dojox.date.HebrewDate();
		// |		date1.setMonth(2);
		month = parseInt(month);
		if(month>=0){
			this.Year += Math.floor(month / 13);
			this.Month = Math.floor(month % 13);
		}else{
			this.Year += Math.floor(month/13);
			this.Month = 13 - Math.floor(-1*month % 13);
		}
		if(!this._isLeapYear(this.Year)&&(this.Month==5)){ this.Month++; }
		var day = this._startOfYear(this.Year);
		if(this.Month != 0){
			if(this._isLeapYear(this.Year)){
				day += this.LEAP_MONTH_START[this.Month][this._yearType(this.Year)];
			}else{
				day += this.MONTH_START[this.Month][this._yearType(this.Year)];
			}
		}
	
		day += (this.Date - 1);
		this.Day = ((day+1) % 7);
		return this;
	},
			
	setHours:function(){
		//summary: set the Hours
		var hours_arg_no = arguments.length;
		if(hours_arg_no >= 1){
			hours = parseInt(arguments[0]);
		}

		if(hours_arg_no >= 2){
			this.Minutes = parseInt(arguments[1]);
		}

		if(hours_arg_no >= 3){
			this.Seconds = parseInt(arguments[2]);
		}

		if(hours_arg_no == 4){
			this.Milliseconds = parseInt(arguments[3]);
		}

		while(hours >= 24){
			this.Date++;
			var mdays = this.getDaysInHebrewMonth(this.Month, this.Year);
			if(this.Date > mdays)
			{
				this.Month++;
				if(!this._isLeapYear(this.Year)&&(this.Month==5)){ this.Month++; }
				if(this.Month >= 13){this.Year++; this.Month -= 13;}
				this.Date -= mdays;
			}
			hours -= 24;
		}
		this.Hours = hours;
		var day = this._startOfYear(this.Year);
		if(this.Month != 0){
			if(this._isLeapYear(this.Year)){
				day += this.LEAP_MONTH_START[this.Month][this._yearType(this.Year)];
			}else{
				day += this.MONTH_START[this.Month][this._yearType(this.Year)];
			}
		}
		day += (this.Date - 1);
		this.Day = ((day+1) % 7);
		return this;
	},

	setMinutes:function(/*number*/minutes){
		//summary: set the Minutes 
		while(minutes >= 60){
			this.Hours++;
			if(this.Hours >= 24){     
				this.Date++;
				this.Hours -= 24;
				var mdays = this.getDaysInHebrewMonth(this.Month, this.Year);
				if(this.Date > mdays){
					this.Month ++;
					if(!this._isLeapYear(this.Year)&&(this.Month==5)){ this.Month++; }
					if(this.Month >= 13){this.Year++; this.Month -= 13;}
					this.Date -= mdays;
				}
			}
			minutes -= 60;
		}
		this.Minutes = minutes;
		var day = this._startOfYear(this.Year);
		if(this.Month != 0){
			if(this._isLeapYear(this.Year)){
				day += this.LEAP_MONTH_START[this.Month][this._yearType(this.Year)];
			}else{
				day += this.MONTH_START[this.Month][this._yearType(this.Year)];
			}
		}
		day += (this.Date - 1);
		this.Day = ((day+1) % 7);
		return this;
	},

	setSeconds:function(/*number*/seconds){

		while(seconds >= 60){
			this.Minutes++;
			if(this.Minutes >= 60){
				this.Hours++;
				this.Minutes -= 60;
				if(this.Hours >= 24){         
					this.Date++;
					this.Hours -= 24;
					var mdays = this.getDaysInHebrewMonth(this.Month, this.Year);
					if(this.Date > mdays){
						this.Month++;
						if(!this._isLeapYear(this.Year)&&(this.Month==5)){ this.Month++; }
						if(this.Month >= 13){this.Year++; this.Month -= 13;}
							
						this.Date -= mdays;
					}
				}
			}
			seconds -= 60;
		}
		this.Seconds = seconds;
		var day = this._startOfYear(this.Year);
		if(this.Month != 0){
			if(this._isLeapYear(this.Year)){
				day += this.LEAP_MONTH_START[this.Month][this._yearType(this.Year)];
			}else{
				day += this.MONTH_START[this.Month][this._yearType(this.Year)];
			}
		}
		day += (this.Date - 1);
		this.Day = ((day+1) % 7);
		return this;
	},

	setMilliseconds:function(/*number*/milliseconds){
		while(milliseconds >= 1000){
			this.setSeconds++;
			if(this.setSeconds >= 60){
				this.Minutes++;
				this.Seconds -= 60;
				if(this.Minutes >= 60){
					this.Hours++;
					this.Minutes -= 60;
					if(this.Hours >= 24){         
						this.Date++;
						this.Hours -= 24;
						var mdays = this.getDaysInHebrewMonth(this.Month, this.Year);
						if(this.Date > mdays)
						{
							this.Month ++;
							if(!this._isLeapYear(this.Year)&&(this.Month==5))  this.Month ++;
							if(this.Month >= 13){this.Year++; this.Month -= 13;}
							this.Date -= mdays;
						}
					}
				}
			}
			milliseconds -= 1000;
		}
		this.Milliseconds = milliseconds;
		var day = this._startOfYear(this.Year);
		if(this.Month != 0){
			if(this._isLeapYear(this.Year)){
				day += this.LEAP_MONTH_START[this.Month][this._yearType(this.Year)];
			}else{
				day += this.MONTH_START[this.Month][this._yearType(this.Year)];
			}
		}
		day += (this.Date - 1);
		this.Day = ((day+1) % 7);
		return this;
	},

	toString:function(){ 
		// summary: This returns a string representation of the date in "DDDD MMMM DD YYYY HH:MM:SS" format
		// example:
		// |		var date1 = new dojox.date.HebrewDate();
		// |		document.writeln(date1.toString());
		//FIXME: TZ/DST issues?			     
		var x = new Date();
		x.setHours(this.Hours);
		x.setMinutes(this.Minutes);
		x.setSeconds(this.Seconds);
		x.setMilliseconds(this.Milliseconds);
		var timeString = x.toTimeString();
		return (dojox.date.HebrewDate.weekDays[this.Day] +" "+dojox.date.HebrewDate.months[this.Month]+" "+ this.Date + " " + this.Year+" "+timeString);
	},
		         
//TODO i18n: factor out and use CLDR patterns?		 
	parse:function(/*String*/dateObject){
		// summary: This function parse the date string
		//
		// example:
		// |		var dateIslamic = new dojox.date.IslamicDate();
		// |		dateIslamic.parse("Heshvan 2 5768");
 		var sDate = dateObject.toString();
		var template = /\d{1,2}\D\d{1,2}\D\d{4}/
		var mD = sDate.match(template);
		if(mD!=null)
		{
			mD = mD.toString();
			var sD = mD.split(/\D/);
			this.Month = sD[0]-1;
			this.Date = sD[1];
			this.Year = sD[2];
		}else{
			mD = sDate.match(/\D{3}\s\D{2,}\s\d{1,2}\s\d{4}/);
			if(mD!=null)
			{ 
				mD = mD.toString();
				var dayYear = mD.match(/\d{1,2}\s\d{4}/);
				dayYear = dayYear.toString();
				var mName = mD.replace(/\s\d{1,2}\s\d{4}/,'');
				mName = mName.toString();
				//FIXME: redeclaration of mName
				var mName = mName.replace(/\D{3}\s/,'');
				mName = mName.toString();
				this.Month = getIndex(dojox.date.HebrewDate.months,mName);
				var sD = dayYear.split(/\s/);
				this.Date = sD[0];
				this.Year = sD[1];
				var day = this._startOfYear(this.Year);
				if(this.Month != 0){
					if(this._isLeapYear(this.Year)){
						day += this.LEAP_MONTH_START[this.Month][this._yearType(this.Year)];
					} 
					else{
						day += this.MONTH_START[this.Month][this._yearType(this.Year)];
					}
				}
				day += (this.Date - 1);
				this.Day = ((day+1) % 7);
       		}else{
				mD = sDate.match(/\D{2,}\s\d{1,2}\s\d{4}/);
				if(mD!=null)
				{
					mD = mD.toString();
					var dayYear = mD.match(/\d{1,2}\s\d{4}/);
					dayYear = dayYear.toString();
					var mName = mD.replace(/\s\d{1,2}\s\d{4}/,'');
					mName = mName.toString();
					this.Month = getIndex(dojox.date.HebrewDate.months,mName);
					var sD = dayYear.split(/\s/);
					this.Date = sD[0];
					this.Year = sD[1];
					var day = this._startOfYear(this.Year);
					if(this.Month != 0){
						if(this._isLeapYear(this.Year)){
							day += this.LEAP_MONTH_START[this.Month][this._yearType(this.Year)];
						}else{
							day += this.MONTH_START[this.Month][this._yearType(this.Year)];
						}
					}
					day += (this.Date - 1);
					this.Day = ((day+1) % 7);
				}                    
			}
		}
	                                
		var sTime = sDate.match(/\d{2}:/);
		if(sTime!=null){
			sTime = sTime.toString();
			var tArr=  sTime.split(':');
			this.Hours = tArr[0];
			sTime = sDate.match(/\d{2}:\d{2}/);
			if(sTime){
				sTime = sTime.toString();
				tArr = sTime.split(':');
			}
			this.Minutes = tArr[1] != null ? tArr[1]:0;
			sTime = sDate.match(/\d{2}:\d{2}:\d{2}/);
			if(sTime){
				sTime = sTime.toString();
				tArr = sTime.split(':');
			}
			this.Seconds = tArr[2]!=null?tArr[2]:0;
		}else{
			this.Hours = 0;
			this.Minutes = 0;
			this.Seconds = 0;
		}
		this.Milliseconds = 0;
	},

	valueOf:function(){
	     
		var gdate = this.toGregorian();
		return gdate.valueOf();
	},
			
	_getIndex:function(arr,str){

		for(i=0;i<arr.length;i++){
			if(arr[i]==str){
				return i;
			}
		}
		return -1;
	},

	getDaysInHebrewMonth:function(/*number*/month ,/*number*/ year){
		// summary: returns the number of days in the month used
		switch(month){
			case this.HESHVAN:
			case this.KISLEV:
				// These two month lengths can vary
				return this.MONTH_LENGTH[month][this._yearType(year)];
			default:
				// The rest are a fixed length
				return this.MONTH_LENGTH[month][0];
		}	
	},


	_yearType:function(/*number*/year){
		
		var yearLength = this._handleGetYearLength(Number(year));
		if(yearLength > 380){
			yearLength -= 30;        // Subtract length of leap month.
		}

		var type = 0;
		switch(yearLength){
			case 353:
				type = 0; break;
			case 354:
				type = 1; break;
			case 355:
				type = 2; break;
			default:
				throw new Error("Illegal year length " + yearLength + " in year " + year);
		}
		return type;
	},

	_handleGetYearLength:function(/*number*/eyear){
		return (this._startOfYear(eyear+1) - this._startOfYear(eyear));
	},

	_startOfYear:function(/*number*/year){
				            
		var months = Math.floor((235 * year - 234) / 19);           // # of months before year

		var frac = months * this.MONTH_FRACT + this.BAHARAD;     // Fractional part of day #
		var day  = months * 29 + Math.floor(frac / this.DAY_PARTS);        // Whole # part of calculation
		frac = frac % this.DAY_PARTS;                        // Time of day

		var wd = day % 7;                        // Day of week (0 == Monday)

		if(wd == 2 || wd == 4 || wd == 6){
			// If the 1st is on Sun, Wed, or Fri, postpone to the next day
			day += 1;
			wd = day % 7;
		}
		if(wd == 1 && frac > 15*this.HOUR_PARTS+204 && !this._isLeapYear(year) ){
			// If the new moon falls after 3:11:20am (15h204p from the previous noon)
			// on a Tuesday and it is not a leap year, postpone by 2 days.
			// This prevents 356-day years.
			day += 2;
		}
		else if(wd == 0 && frac > 21*this.HOUR_PARTS+589 && this._isLeapYear(year-1) ){
			// If the new moon falls after 9:32:43 1/3am (21h589p from yesterday noon)
			// on a Monday and *last* year was a leap year, postpone by 1 day.
			// Prevents 382-day years.
			day += 1;
		}            
				
		return day;
	},

	_isLeapYear:function(/*number*/year){	
		//return (year * 12 + 17) % 19 >= 12;
		var x = (year*12 + 17) % 19;
		return x >= ((x < 0) ? -7 : 12);
	},

	//TODO: would it make more sense to make this a constructor option? or a static?
	fromGregorian:function(/*Date*/gdate){
		// summary: This function returns the equivalent Hebrew Date value for the Gregorian Date
		// example:
		// |		var dateHebrew = new dojox.date.HebrewDate();
		// |		var dateGregorian = new Date(2008,10,12);
		// |		dateHebrew.fromGregorian(dateGregorian);
		var result =  this._computeHebrewFields(gdate);
		this.Year = result[0];
		this.Month=result[1];
		this.Date=result[2];
		this.Hours =gdate.getHours();
		this.Milliseconds=gdate.getMilliseconds();
		this.Minutes=gdate.getMinutes();
		this.Seconds=gdate.getSeconds();
		return this;
	},

	_computeHebrewFields:function(/*Date*/gdate){

		var julianDay = this._getJulianDayFromGregorianDate(gdate);
		var d = julianDay - 347997;
		var m = Math.floor((d * this.DAY_PARTS) / this.MONTH_PARTS);       // Months (approx)
		var year = Math.floor((19 * m + 234) / 235) + 1;  // Years (approx)
		var ys  = this._startOfYear(year);                 // 1st day of year
		var dayOfYear = (d - ys);
		// Because of the postponement rules, it's possible to guess wrong.  Fix it.
		while (dayOfYear < 1){
			year--;
			ys  = this._startOfYear(year);
			dayOfYear = (d - ys);
		}

		// Now figure out which month we're in, and the date within that month

		var typeofYear = this._yearType(year);
		var monthStart = this._isLeapYear(year) ? this.LEAP_MONTH_START : this.MONTH_START;
		var month = 0;
		while(dayOfYear > monthStart[month][typeofYear]){
				month++;
		}
		month--;
		var dayOfMonth = dayOfYear - monthStart[month][typeofYear];
		var result = new Array(3);
		result[0] = year;
		result[1] = month;
		result[2] = dayOfMonth;
		return result;
	},

	toGregorian:function(){
		// summary: This returns the equevalent Grogorian date value in Date object
		// example:
		// |		var dateHebrew = new dojox.date.HebrewDate(5768,11,20);
		// |		var dateGregorian = dateHebrew.toGregorian();
		var hYear = this.Year;
		var hMonth = this.Month;
		var hDate = this.Date;
		var day = this._startOfYear(hYear);
		if(hMonth != 0){
			if(this._isLeapYear(hYear)){
				day += this.LEAP_MONTH_START[hMonth][this._yearType(hYear)];
			} else{
				day += this.MONTH_START[hMonth][this._yearType(hYear)];
			}
		}

		var julianDay =  (hDate + day + 347997);
		// The Gregorian epoch day is zero for Monday January 1, year 1.
		var gregorianEpochDay = julianDay - this.JAN_1_1_JULIAN_DAY;
		// Here we convert from the day number to the multiple radix
		// representation.  We use 400-year, 100-year, and 4-year cycles.
		// For example, the 4-year cycle has 4 years + 1 leap day; giving
		// 1461 == 365*4 + 1 days.
		var rem = new Array(1);
		var n400 = this._floorDivide(gregorianEpochDay , 146097, rem); // 400-year cycle length

		var n100 = this._floorDivide(rem[0] , 36524, rem); // 100-year cycle length

		var n4 = this._floorDivide(rem[0] , 1461, rem); // 4-year cycle length

		var n1 = this._floorDivide(rem[0] , 365, rem);
		var year = 400*n400 + 100*n100 + 4*n4 + n1;
		var dayOfYear = rem[0]; // zero-based day of year
		if(n100 == 4 || n1 == 4){
			dayOfYear = 365; // Dec 31 at end of 4- or 400-yr cycle
		}else{
			++year;
		}

		var isLeap = (year%4 == 0) && // equiv. to (year%4 == 0)
				(year%100 != 0 || year%400 == 0);
		var correction = 0;
		var march1 = isLeap ? 60 : 59; // zero-based DOY for March 1
		if(dayOfYear >= march1) correction = isLeap ? 1 : 2;
		var month = Math.floor((12 * (dayOfYear + correction) + 6) / 367); // zero-based month
		var dayOfMonth = dayOfYear -
				this.GREGORIAN_MONTH_COUNT[month][isLeap?3:2] + 1; // one-based DOM

		var gdate = new Date();
		gdate.setFullYear(year);
		gdate.setMonth(month);
		gdate.setDate(dayOfMonth);
		gdate.setHours(this.Hours);
		gdate.setMilliseconds(this.Milliseconds);
		gdate.setMinutes(this.Minutes);
		gdate.setSeconds(this.Seconds);
		return gdate;
	},

	_floorDivide:function(numerator, denominator, remainder){
	
		if(numerator >= 0){
			remainder[0] = (numerator % denominator);
			return Math.floor(numerator / denominator);
		}
		var quotient = Math.floor(numerator / denominator);
		remainder[0] = numerator - (quotient * denominator);
		return quotient;
	},

	getDay: function(){
		// summary: This function return Week Day value ( 0 - 6 )
		//
		// example:
		// |		var date1 = new dojox.date.HebrewDate();
		// |
		// |		document.writeln(date1.getDay());
		var hYear = this.Year;
		var hMonth = this.Month;
		var hDate = this.Date;
		var day = this._startOfYear(hYear);
		if(hMonth != 0){
			if(this._isLeapYear(hYear)){
				day += this.LEAP_MONTH_START[hMonth][this._yearType(hYear)];
			} else{
				day += this.MONTH_START[hMonth][this._yearType(hYear)];
			}
		}

		day += (hDate - 1);
		return ((day+1) % 7);
	},

	// This function returns the Julian day of a Gregorian date
	_getJulianDayFromGregorianDate: function(gdate){
	
		var year = gdate.getFullYear();
		var month = gdate.getMonth();
		var d = gdate.getDate();
		var isLeap = (year%4 == 0) && ((year%100 != 0) || (year%400 == 0));
		var y = year - 1;
		// This computation is actually ... + (JAN_1_1_JULIAN_DAY - 3) + 2.
		// Add 2 because Gregorian calendar starts 2 days after Julian
		// calendar.
		var julianDay = 365*y + Math.floor(y/4) - Math.floor(y/100) +
			Math.floor(y/400) + this.JAN_1_1_JULIAN_DAY - 1;
		// At this point julianDay indicates the day BEFORE the first day
		// of January 1, <eyear> of the Gregorian calendar.
		if(month != 0){
			julianDay += this.GREGORIAN_MONTH_COUNT[month][isLeap?3:2];
		}
		
		julianDay += d;
		return julianDay;
	}
});
//TODOC
dojox.date.HebrewDate.getDaysInHebrewMonth = function(/*dojox.date.HebrewDate*/month){
	return new dojox.date.HebrewDate().getDaysInHebrewMonth(month.getMonth(),month.getFullYear()); // dojox.date.HebrewDate
};
dojox.date.HebrewDate._getNames = function(/*String*/item, /*String*/type, /*String?*/use, /*String?*/locale){
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
	var lookup = dojo.i18n.getLocalization("dojo.cldr", "hebrew", locale);
	var props = [item, use, type];
	if(use == 'standAlone'){
		label = lookup[props.join('-')];
	}
	props[1] = 'format';
	// return by copy so changes won't be made accidentally to the in-memory model
	return (label || lookup[props.join('-')]).concat(); /*Array*/
};

dojox.date.HebrewDate.weekDays = dojox.date.HebrewDate._getNames('days', 'wide', 'format');
dojox.date.HebrewDate.months = dojox.date.HebrewDate._getNames('months', 'wide', 'abbr');
