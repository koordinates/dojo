dojo.provide("dojo.widget.DatePicker");
dojo.provide("dojo.widget.DatePicker.util");
dojo.require("dojo.date.common");
dojo.require("dojo.date.format");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.event.*");
dojo.require("dojo.dom");
dojo.require("dojo.html.style");
dojo.require("dojo.lang.array");

/*
	Some assumptions:
	- I'm planning on always showing 42 days at a time, and we can scroll by week,
	not just by month or year
	- To get a sense of what month to highlight, I basically initialize on the 
	first Saturday of each month, since that will be either the first of two or 
	the second of three months being partially displayed, and then I work forwards 
	and backwards from that point.
	Currently, I assume that dates are stored in the RFC 3339 format,
	because I find it to be most human readable and easy to parse
	http://www.faqs.org/rfcs/rfc3339.html: 		2005-06-30T08:05:00-07:00
*/

dojo.widget.defineWidget(
	"dojo.widget.DatePicker",
	dojo.widget.HtmlWidget,
	function() {
		// summary:
		// 		Base class for a stand-alone DatePicker widget
		// 		that makes it  easy to select a date, or switch by month and/or year.
		// description:
		// 		A stand-alone DatePicker widget that makes it 
		// 		easy to select a date, or increment by week, month, and/or year.
		// 		It is designed to be used on its own, or inside of other widgets to 
		//		create drop down DatePickers or other similar combination widgets.
		//		To get a sense of what month to highlight, we basically initialize on
		//		the first Saturday of each month, since that will be either the first 
		// 		of two or the second of three months being partially displayed, and 
		//		then work forwards and backwards from that point. Currently, we assume 
		//		that dates are stored in the `RFC 3339`_ format 
		//		(2005-06-30T08:05:00-07:00), because Dylan finds it to be most human 
		//		readable and easy to parse.  Extension of this to support other date 
		//		formats, such as those found in dojo.date, would be a welcome 
		//		contribution.
		// usage:
		//		var datePicker = dojo.widget.createWidget("DatePicker", {},  
		//		dojo.byId("datePickerNode"));
		//
		//		<div dojoType="DatePicker"></div>
		// today's date, JS Date object
		this.today = "";
		// selected date, JS Date object
		this.date = "";
		// rfc 3339 date
		this.storedDate = "";
		// date currently selected in the UI, stored in year, month, date in the format that will be actually displayed
		this.currentDate = {};
		// stored in year, month, date in the format that will be actually displayed
		this.firstSaturday = {};
	},
	{
		dayWidth: 'narrow',

		classNames: {
			// summary:
			// 		stores a list of class names that may be overriden
			previous: "previousMonth",
			current: "currentMonth",
			next: "nextMonth",
			currentDate: "currentDate",
			selectedDate: "selectedItem"
		},
		templatePath:  dojo.uri.dojoUri("src/widget/templates/DatePicker.html"),
		templateCssPath:  dojo.uri.dojoUri("src/widget/templates/DatePicker.css"),

		fillInTemplate: function(){
			dojo.widget.DatePicker.call(this);
			this.initData();
			this.initUI();
		},
		initData: function() {
			// summary:
			//	Initialize the date data for the date picker
			// description:
			//	Initializes the date data for the DatePicker widget instance.  For
			//	example, if there is not already a value for storedDate, it is 
			//	populated with today's date from the client.
			
			this.today = new Date();
			if(this.storedDate && (this.storedDate.split("-").length > 2)) {
				this.date = dojo.widget.DatePicker.util.fromRfcDate(this.storedDate);
			} else {
				this.date = this.today;
			}
			// calendar math is simplified if time is set to 0
			this.today.setHours(0);
			this.date.setHours(0);
			var month = this.date.getMonth();
			var tempSaturday = dojo.widget.DatePicker.util.initFirstSaturday(this.date.getMonth().toString(), this.date.getFullYear());
			this.firstSaturday.year = tempSaturday.year;
			this.firstSaturday.month = tempSaturday.month;
			this.firstSaturday.date = tempSaturday.date;
		},
		
		setDate: function(rfcDate) {
			this.storedDate = rfcDate;
		},

		initUI: function() {
			var dayLabels = dojo.date.getNames('days', this.dayWidth, 'standAlone', this.lang);
			var dayLabelNodes = this.dayLabelsRow.getElementsByTagName("td");
			for(var i=0; i<7; i++) {
				dayLabelNodes.item(i).innerHTML = dayLabels[i];
			}

			this.selectedIsUsed = false;
			this.currentIsUsed = false;
			var currentClassName = "";
			var previousDate = new Date();
			var calendarNodes = this.calendarDatesContainerNode.getElementsByTagName("td");
			var currentCalendarNode;
			// set hours of date such that there is no chance of rounding error due to 
			// time change in local time zones
			previousDate.setHours(8);
			var nextDate = new Date(this.firstSaturday.year, this.firstSaturday.month, this.firstSaturday.date, 8);
			
			if(this.firstSaturday.date < 7) {
				// this means there are days to show from the previous month
				var dayInWeek = 6;
				for (var i=this.firstSaturday.date; i>0; i--) {
					currentCalendarNode = calendarNodes.item(dayInWeek);
					currentCalendarNode.innerHTML = nextDate.getDate();
					dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "current"));
					dayInWeek--;
					previousDate = nextDate;
					nextDate = this.incrementDate(nextDate, false);
				}
				for(var i=dayInWeek; i>-1; i--) {
					currentCalendarNode = calendarNodes.item(i);
					currentCalendarNode.innerHTML = nextDate.getDate();
					dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "previous"));
					previousDate = nextDate;
					nextDate = this.incrementDate(nextDate, false);				
				}
			} else {
				nextDate.setDate(this.firstSaturday.date-6);
				for(var i=0; i<7; i++) {
					currentCalendarNode = calendarNodes.item(i);
					currentCalendarNode.innerHTML = nextDate.getDate();
					dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "current"));
					previousDate = nextDate;
					nextDate = this.incrementDate(nextDate, true);				
				}
			}
			previousDate.setDate(this.firstSaturday.date);
			previousDate.setMonth(this.firstSaturday.month);
			previousDate.setFullYear(this.firstSaturday.year);
			nextDate = this.incrementDate(previousDate, true);
			var count = 7;
			currentCalendarNode = calendarNodes.item(count);
			while((nextDate.getMonth() == previousDate.getMonth()) && (count<42)) {
				currentCalendarNode.innerHTML = nextDate.getDate();
				dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "current"));
				currentCalendarNode = calendarNodes.item(++count);
				previousDate = nextDate;
				nextDate = this.incrementDate(nextDate, true);
			}
			
			while(count < 42) {
				currentCalendarNode.innerHTML = nextDate.getDate();
				dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "next"));
				currentCalendarNode = calendarNodes.item(++count);
				previousDate = nextDate;
				nextDate = this.incrementDate(nextDate, true);
			}
			this.setMonthLabel(this.firstSaturday.month);
			this.setYearLabels(this.firstSaturday.year);
		},
		
		incrementDate: function(date, bool) {
			// bool: true to increase, false to decrease
			var time = date.getTime();
			var increment = 1000 * 60 * 60 * 24;
			time = (bool) ? (time + increment) : (time - increment);
			var returnDate = new Date();
			returnDate.setTime(time);
			return returnDate;
		},
		
		incrementWeek: function(evt) {
			var date = this.firstSaturday.date;
			var month = this.firstSaturday.month;
			var year = this.firstSaturday.year;
			switch(evt.target) {
				case this.increaseWeekNode.getElementsByTagName("img").item(0): 
				case this.increaseWeekNode:
					date = date + 7;
					if (date>this._daysIn(month,year)) {
						date = date - this._daysIn(month,year);
						if (month < 11) {
							month++;	
						} else {
							month=0;
							year++;
						}
					}
					break;
				case this.decreaseWeekNode.getElementsByTagName("img").item(0):
				case this.decreaseWeekNode:
					if (date > 7) {
						date = date - 7;
					} else {
						var diff = 7 - date;
						if (month > 0) {
							month--;
							date = this._daysIn(month,year) - diff;
						}else {
							year--;
							month=11;
							date = 31 - diff;
						}
					}
					break;
	
			}
	
			this.firstSaturday.date=date;
			this.firstSaturday.month=month;
			this.firstSaturday.year=year;
			this.initUI();
		},
	
		incrementMonth: function(evt) {
			var month = this.firstSaturday.month;
			var year = this.firstSaturday.year;
			switch(evt.currentTarget) {
				case this.increaseMonthNode:
					if(month < 11) {
						month++;
					} else {
						month = 0;
						year++;
						
						this.setYearLabels(year);
					}
					break;
				case this.decreaseMonthNode:
					if(month > 0) {
						month--;
					} else {
						month = 11;
						year--;
						this.setYearLabels(year);
					}
					break;
				case this.increaseMonthNode.getElementsByTagName("img").item(0):
					if(month < 11) {
						month++;
					} else {
						month = 0;
						year++;
						this.setYearLabels(year);
					}
					break;
				case this.decreaseMonthNode.getElementsByTagName("img").item(0):
					if(month > 0) {
						month--;
					} else {
						month = 11;
						year--;
						this.setYearLabels(year);
					}
					break;
			}
			var tempSaturday = dojo.widget.DatePicker.util.initFirstSaturday(month.toString(), year);
			this.firstSaturday.year = tempSaturday.year;
			this.firstSaturday.month = tempSaturday.month;
			this.firstSaturday.date = tempSaturday.date;
			this.initUI();
		},
	
		incrementYear: function(evt) {
			var year = this.firstSaturday.year;
			switch(evt.target) {
				case this.nextYearLabelNode:
					year++;
					break;
				case this.previousYearLabelNode:
					year--;
					break;
			}
			var tempSaturday = dojo.widget.DatePicker.util.initFirstSaturday(this.firstSaturday.month.toString(), year);
			this.firstSaturday.year = tempSaturday.year;
			this.firstSaturday.month = tempSaturday.month;
			this.firstSaturday.date = tempSaturday.date;
			this.initUI();
		},
	
		_daysIn: function(month,year) {
			return dojo.date.getDaysInMonth(new Date(year, month));
		},
	
		onIncrementDate: function(evt) {
			dojo.unimplemented('dojo.widget.DatePicker.onIncrementDate');
		},
	
		onIncrementWeek: function(evt) {
			evt.stopPropagation();
			this.incrementWeek(evt);
		},
	
		onIncrementMonth: function(evt) {
			evt.stopPropagation();
			this.incrementMonth(evt);
		},
		
		onIncrementYear: function(evt) {
			evt.stopPropagation();
			this.incrementYear(evt);
		},

		setMonthLabel: function(monthIndex) {
			this.monthLabelNode.innerHTML = dojo.date.getNames('months', 'wide', 'standAlone', this.lang)[monthIndex];
		},

		setYearLabels: function(year) {
			var y = year - 1;
			dojo.lang.forEach(["previousYearLabelNode", "currentYearLabelNode", "nextYearLabelNode"], function(node){
				this[node].innerHTML = y++; /*ticket #1206: dojo.date.format(new Date(y++, 0), {formatLength:'yearOnly', locale:this.lang});*/
			}, this);
		},
		
		getDateClassName: function(date, monthState) {
			var currentClassName = this.classNames[monthState];
			if ((!this.selectedIsUsed) && (date.getDate() == this.date.getDate()) && (date.getMonth() == this.date.getMonth()) && (date.getFullYear() == this.date.getFullYear())) {
				currentClassName = this.classNames.selectedDate + " " + currentClassName;
				this.selectedIsUsed = 1;
			}
			if((!this.currentIsUsed) && (date.getDate() == this.today.getDate()) && (date.getMonth() == this.today.getMonth()) && (date.getFullYear() == this.today.getFullYear())) {
				currentClassName = currentClassName + " "  + this.classNames.currentDate;
				this.currentIsUsed = 1;
			}
			return currentClassName;
		},
	
		onClick: function(evt) {
			dojo.event.browser.stopEvent(evt);
		},
		
		onSetDate: function(evt) {
			var eventTarget = (evt.target.nodeType == dojo.dom.ELEMENT_NODE) ?
				evt.target : evt.target.parentNode;
			dojo.event.browser.stopEvent(evt);
			this.selectedIsUsed = 0;
			this.todayIsUsed = 0;
			var month = this.firstSaturday.month;
			var year = this.firstSaturday.year;
			if (dojo.html.hasClass(eventTarget, this.classNames["next"])) {
				month = ++month % 12;
				// if month is now == 0, add a year
				year = (month==0) ? ++year : year;
			} else if (dojo.html.hasClass(eventTarget, this.classNames["previous"])) {
				month = --month % 12;
				// if month is now == 0, add a year
				year = (month==11) ? --year : year;
			}
			this.date = new Date(year, month, eventTarget.innerHTML);
			this.setDate(dojo.widget.DatePicker.util.toRfcDate(this.date));
			this.initUI();
		}
	}
);

dojo.widget.DatePicker.util = new function() {
	this.toRfcDate = function(jsDate) {
		if(!jsDate) {
			jsDate = new Date();
		}
		// because this is a date picker and not a time picker, we don't return a time
		return dojo.date.strftime(jsDate, "%Y-%m-%d");
	}
	
	this.fromRfcDate = function(rfcDate) {
		// backwards compatible support for use of "any" instead of just not 
		// including the time
		if(rfcDate.indexOf("Tany")!=-1) {
			rfcDate = rfcDate.replace("Tany","");
		}
		var jsDate = new Date();
		dojo.date.setIso8601(jsDate, rfcDate);
		return jsDate;
	}
	
	this.initFirstSaturday = function(month, year) {
		if(!month) {
			month = this.date.getMonth();
		}
		if(!year) {
			year = this.date.getFullYear();
		}
		var firstOfMonth = new Date(year, month, 1);
		return {year: year, month: month, date: 7 - firstOfMonth.getDay()};
	}
}
