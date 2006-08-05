dojo.provide("dojo.widget.MonthlyCalendar");
dojo.require("dojo.date");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.DatePicker");
dojo.require("dojo.event.*");
dojo.require("dojo.html.*");

alert("load");

dojo.widget.defineWidget(
	"dojo.widget.MonthlyCalendar",
	dojo.widget.DatePicker,
	function(){
		this.iCalendars = [];
	},
{
	templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlMonthlyCalendar.html"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlMonthlyCalendar.css"),

	cache: function() {
	},

	addCalendar: function(/* dojo.iCalendar */ cal) {
		dojo.debug("Adding Calendar");
		this.iCalendars.push(cal);
		dojo.debug("Starting init");
		this.initUI()
		dojo.debug("done init");
	},

	createDayContents: function(node,mydate) {
		dojo.html.removeChildren(node);
		node.appendChild(document.createTextNode(mydate.getDate()));	
			for(var x=0; x<this.iCalendars.length; x++) {
				var evts = this.iCalendars[x].getEvents(mydate);
				if ((dojo.lang.isArray(evts)) && (evts.length>0)) {
				for(var y=0;y<evts.length;y++) {
					var el = document.createElement("div");
					dojo.html.addClass(el, "dojoMonthlyCalendarEvent");          
					el.appendChild(document.createTextNode(evts[y].summary.value));
					el.width = dojo.html.getContentBox(node).width;
					node.appendChild(el);
				}
			}
		}
	},

	initUI: function() {
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
		var lastDay = new Date(this.firstSaturday.year, this.firstSaturday.month, this.firstSaturday.date + 42, 8);
		
		if (this.iCalendars.length > 0) {
			for (var x=0; x<this.iCalendars.length;x++) {
				this.iCalendars[x].preComputeRecurringEvents(lastDay);
			}
		}

		if(this.firstSaturday.date < 7) {
			// this means there are days to show from the previous month
			var dayInWeek = 6;
			for (var i=this.firstSaturday.date; i>0; i--) {
				currentCalendarNode = calendarNodes.item(dayInWeek);
				this.createDayContents(currentCalendarNode, nextDate);
				
				dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "current"));
				dayInWeek--;
				previousDate = nextDate;
				nextDate = this.incrementDate(nextDate, false);
			}
			for(var i=dayInWeek; i>-1; i--) {
				currentCalendarNode = calendarNodes.item(i);

				this.createDayContents(currentCalendarNode, nextDate);

				dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "previous"));
				previousDate = nextDate;
				nextDate = this.incrementDate(nextDate, false);				
			}
		} else {
			nextDate.setDate(1);
			for(var i=0; i<7; i++) {
				currentCalendarNode = calendarNodes.item(i);
				this.createDayContents(currentCalendarNode, nextDate);
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
			this.createDayContents(currentCalendarNode, nextDate);
			dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "current"));
			currentCalendarNode = calendarNodes.item(++count);
			previousDate = nextDate;
			nextDate = this.incrementDate(nextDate, true);
		}
		
		while(count < 42) {
			this.createDayContents(currentCalendarNode, nextDate);
			dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "next"));
			currentCalendarNode = calendarNodes.item(++count);
			previousDate = nextDate;
			nextDate = this.incrementDate(nextDate, true);
		}
		this.setMonthLabel(this.firstSaturday.month);
		this.setYearLabels(this.firstSaturday.year);
	}	
});

dojo.widget.MonthlyCalendar.util= new function() {
	this.months = dojo.date.months;
	this.weekdays = dojo.date.days;
	
	this.toRfcDate = function(jsDate) {
		if(!jsDate) {
			jsDate = this.today;
		}
		var year = jsDate.getFullYear();
		var month = jsDate.getMonth() + 1;
		if (month < 10) {
			month = "0" + month.toString();
		}
		var date = jsDate.getDate();
		if (date < 10) {
			date = "0" + date.toString();
		}
		// because this is a date picker and not a time picker, we treat time 
		// as zero
		return year + "-" + month + "-" + date + "T00:00:00+00:00";
	}
	
	this.fromRfcDate = function(rfcDate) {
		var tempDate = rfcDate.split("-");
		if(tempDate.length < 3) {
			return new Date();
		}
		// fullYear, month, date
		return new Date(parseInt(tempDate[0]), (parseInt(tempDate[1], 10) - 1), parseInt(tempDate[2].substr(0,2), 10));
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
