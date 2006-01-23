dojo.provide("dojo.widget.html.MonthlyCalendar");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.html.DatePicker");
dojo.require("dojo.widget.MonthlyCalendar");
//dojo.require("dojo.widget.MonthlyCalendar.util");
dojo.require("dojo.event.*");
dojo.require("dojo.html");

dojo.widget.html.MonthlyCalendar= function(){
	dojo.widget.MonthlyCalendar.call(this);
	//dojo.widget.html.DatePicker.call(this);
	this.widgetType = "MonthlyCalendar";
	this.templatePath =  dojo.uri.dojoUri("src/widget/templates/HtmlMonthlyCalendar.html");
	this.templateCssPath = dojo.uri.dojoUri("src/widget/templates/HtmlMonthlyCalendar.css");

	this.iCalendars = [];
}

dojo.inherits(dojo.widget.html.MonthlyCalendar, dojo.widget.html.DatePicker);

dojo.lang.extend(dojo.widget.html.MonthlyCalendar, {
	cache: function() {
	},

	addCalendar: function(/* dojo.iCalendar */ cal) {
		dojo.debug("Adding Calendar");
		this.iCalendars.push(cal);
		this.initUI();
	},

	createDayContents: function(node,mydate) {
		dojo.dom.removeChildren(node);
		node.appendChild(document.createTextNode(mydate.getDate()));	
		if (this.cache[mydate]) {
			evts = this.cache[mydate];
			if ((dojo.lang.isArray(evts)) && (evts.length>0)) {
				for(var y=0;y<evts.length;y++) {
					var el = document.createElement("div");
					dojo.html.addClass(el, "dojoMonthlyCalendarEvent");          
					el.appendChild(document.createTextNode(evts[y].summary.value));
					el.width = dojo.style.getContentWidth(node);
					node.appendChild(el);
				}
			}
		} else {
			for(var x=0; x<this.iCalendars.length; x++) {
				evts = this.iCalendars[x].getEvents(mydate);

				if ((dojo.lang.isArray(evts)) && (evts.length>0)) {
					this.cache[mydate]=evts;
					for(var y=0;y<evts.length;y++) {
						var el = document.createElement("div");
						dojo.html.addClass(el, "dojoMonthlyCalendarEvent");          
						el.appendChild(document.createTextNode(evts[y].summary.value));
						el.width = dojo.style.getContentWidth(node);
						node.appendChild(el);
					}
				} else {
					this.cache[mydate]=[];
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
