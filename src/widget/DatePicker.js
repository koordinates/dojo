dojo.provide("dojo.widget.DatePicker");
dojo.provide("dojo.widget.DatePicker.util");
dojo.require("dojo.date.common");
dojo.require("dojo.date.format");
dojo.require("dojo.date.serialize");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.event.*");
dojo.require("dojo.dom");
dojo.require("dojo.html.style");
dojo.require("dojo.lang.array");

/*
	Some facts:
	-We now display only as many weeks as necessary, unless you tell us otherwise displayWeeks="X" to force a calendar size
	- To get a sense of what month to highlight, I get the first day of the week that the 1st of that month falls in, then take and
	  add half the that months days to the first day of that week and if the month values are still the same, that's the current month.
	- You can now limit available dates by providing startDate="YYYY-mm-dd" and endDate="YYYY-mm-dd"... this will disable/enable
	   incremental controls as needed to avoid the user wasting time scrolling through disabled dates.
	- No change here. Currently, I assume that dates are stored in the RFC 3339 format, because I find it to be most human readable and easy to parse
	http://www.faqs.org/rfcs/rfc3339.html: 		2005-06-30T08:05:00-07:00
*/

dojo.widget.defineWidget(
	"dojo.widget.DatePicker",
	dojo.widget.HtmlWidget,
	{
		/*
		summary: 
	 	              Base class for a stand-alone DatePicker widget 
	 	              that makes it  easy to select a date, or switch by month and/or year. 
	 	description: 
	 	              A stand-alone DatePicker widget that makes it  
	 	              easy to select a date, or increment by week, month, and/or year. 
	 	              It is designed to be used on its own, or inside of other widgets to  
	 	              create drop down DatePickers or other similar combination widgets. 
	 	              To get a sense of what month to highlight, we basically initialize on 
	 	              the first Saturday of each month, since that will be either the first  
	 	              of two or the second of three months being partially displayed, and  
	 	              then work forwards and backwards from that point. Currently, we assume  
	 	              that dates are stored in the `RFC 3339`_ format  
	 	              (2005-06-30T08:05:00-07:00), because Dylan finds it to be most human  
	 	              readable and easy to parse.  Extension of this to support other date  
	 	              formats, such as those found in dojo.date, would be a welcome  
	 	              contribution. 
	 	 usage: 
	 	              var datePicker = dojo.widget.createWidget("DatePicker", {},   
	 	              dojo.byId("datePickerNode")); 
	 	 
	 	              <div dojoType="DatePicker"></div> 
		*/
	
		//start configureable options
		
		//total weeks to display default will be to display as needed
		displayWeeks: "", 
		//if true, weekly size of calendar changes to acomodate the month if false, 42 day format is used
		adjustWeeks: false,
		//first available date in the calendar set
		startDate: "1492-10-12",
		//last available date in the calendar set
		endDate: "2941-10-12",
		//adjusts the first day of the week 0==Sunday..6==Saturday
		weekStartsOn: "",
		//current date selected by DatePicker in rfc 3339 date format "YYYY-mm-dd"
		storedDate: "",
		//end configurable options
		
		//date Object for the 1st of the current month
		curMonth: "",
		//if startDate and endDate are less than 42 days apart, we disabled incremental controls
		staticDisplay: false,
		dayLabels: [], 
		weekTemplate: null,
		initializer: function() {
			// today's date, JS Date object
			this.today = "";
			// selected date, JS Date object
			this.date = "";
			// date currently selected in the UI, stored in year, month, date in the format that will be actually displayed
			this.currentDate = {};
			// stored in year, month, date in the format that will be actually displayed
			this.firstDay = {};
		},
		dayWidth: 'narrow',
		classNames: {
		// summary:
		//              stores a list of class names that may be overriden 
			previous: "previousMonth",
			current: "currentMonth",
			next: "nextMonth",
			currentDate: "currentDate",
			selectedDate: "selectedItem",
			disabledDate: "disabledItem"
		},
		templatePath:  dojo.uri.dojoUri("src/widget/templates/DatePicker.html"),
		templateCssPath:  dojo.uri.dojoUri("src/widget/templates/DatePicker.css"),

		fillInTemplate: function(){
			dojo.widget.DatePicker.call(this);
			this.weekTemplate = dojo.dom.removeNode(this.calendarWeekTemplate);
			this.startDate = dojo.widget.DatePicker.util.fromRfcDate(this.startDate);
			this.endDate = dojo.widget.DatePicker.util.fromRfcDate(this.endDate);
			this.startDate.setHours(0,0,0,0); //adjust startDate to be exactly midnight
			this.endDate.setHours(24,0,0,-1); //adjusting endDate to be a fraction of a second before  midnight
			if(this.weekStartsOn==""){
				this.weekStartsOn=dojo.date.getFirstDayOfWeek(this.lang);
			}
			if(this.displayWeeks!=""){
				this.adjustWeeks=false;
			}
			this.initData();
			this.initUI();
		},
		initData: function() {
			/*
			summary: 
		 	      Initialize the date data for the date picker 
		 	 description: 
		 	      Initializes the date data for the DatePicker widget instance.  For 
		 	      example, if there is not already a value for storedDate, it is  
		 	      populated with today's date from the client. 
			*/
			this.today = new Date();
			if(this.storedDate && (this.storedDate.split("-").length > 2)) {
				this.date = dojo.widget.DatePicker.util.fromRfcDate(this.storedDate);
			} else {
				this.date = new Date(this.today);
			}
			this.dayLabels = dojo.lang.unnest(dojo.date.getNames('days', this.dayWidth, 'standAlone', this.lang)); //if we dont use unnest, we risk modifying the dayLabels array inside of dojo.date and screwing up other calendars on the page
			if(this.weekStartsOn > 0){
				//adjust dayLabels for different first day of week. ie: Monday or Thursday instead of Sunday
				for(i=0;i<this.weekStartsOn;i++){
					this.dayLabels.push(this.dayLabels.shift());
				}
			}
			var dayLabelNodes = this.dayLabelsRow.getElementsByTagName("td");
			for(var i=0; i<7; i++) {
				dayLabelNodes.item(i).innerHTML = this.dayLabels[i];
			}
			var tempFirstDay = dojo.widget.DatePicker.util.initFirstDay(this.date,this.weekStartsOn,false);
			this.firstDay.year = tempFirstDay.year;
			this.firstDay.month = tempFirstDay.month;
			this.firstDay.date = tempFirstDay.date;
		},
		
		setDate: function(rfcDate) {
			this.storedDate = rfcDate;
		},
		
		initUI: function() {
			dojo.dom.removeChildren(this.calendarDatesContainerNode);
			this.selectedIsUsed = false;
			this.currentIsUsed = false;
			var currentClassName = "";
			var nextDate = new Date(this.firstDay.year, this.firstDay.month, this.firstDay.date, 8);
			var previousDate = new Date();
			var tmpMonth = nextDate.getMonth();
			this.curMonth = new Date(nextDate);
			this.curMonth.setDate(nextDate.getDate()+parseInt((((this.displayWeeks!="") ? (this.displayWeeks*7) : dojo.date.getDaysInMonth(nextDate))/2)));
			if(tmpMonth == this.curMonth.getMonth()) {
				this.curMonth = new Date(nextDate);
				curClass = "current";
			}else{
				curClass = "previous";
			}
			this.curMonth.setDate(1);
			// FIXME: following is always true even if adjust weeks is fales
			if(this.displayWeeks=="" || this.adjustWeeks){
				this.adjustWeeks = true;
				var tmpDate = new Date(this.date);
				tmpDate.setDate(1);
				this.displayWeeks = Math.ceil((dojo.date.getDaysInMonth(this.curMonth) + dojo.widget.DatePicker.util.getAdjustedDay(this.curMonth,this.weekStartsOn))/7);
			}
			var days = this.displayWeeks*7; //init total days to display
			for(var i=0;i<this.displayWeeks;i++){
				this.calendarDatesContainerNode.appendChild(this.weekTemplate.cloneNode(true));
			}
			if(dojo.widget.DatePicker.util.daysBetween(this.startDate,this.endDate) < days){
				this.staticDisplay = true;
				if(dojo.widget.DatePicker.util.daysBetween(nextDate,this.endDate) > days){
					var tmpNext = new Date(nextDate);
					var tempFirstDay = dojo.widget.DatePicker.util.initFirstDay(this.startDate,this.weekStartsOn,true);
					this.firstDay.year = tempFirstDay.year;
					this.firstDay.month = tempFirstDay.month;
					this.firstDay.date = tempFirstDay.date;
					var nextDate = new Date(this.firstDay.year, this.firstDay.month, this.firstDay.date, 8);
				}
				var tmpMonth = nextDate.getMonth();
				this.curMonth = new Date(nextDate);
				this.curMonth.setDate(nextDate.getDate()+parseInt((dojo.date.getDaysInMonth(nextDate)/2)));
				if(tmpMonth == this.curMonth.getMonth()) {
					this.curMonth = new Date(nextDate);
					curClass = "current";
				}else{
					curClass = "previous";
				}
				this.curMonth.setDate(1);
			}
			this.setMonthLabel(this.curMonth.getMonth());
			this.setYearLabels(this.curMonth.getFullYear());
			var calendarNodes = this.calendarDatesContainerNode.getElementsByTagName("td");
			var calendarRows = this.calendarDatesContainerNode.getElementsByTagName("tr");
			var currentCalendarNode;
			for(i=0;i<days;i++){
				//this is our new UI loop... one loop to rule them all, and in the datepicker bind them
				currentCalendarNode = calendarNodes.item(i);
				currentCalendarNode.innerHTML = nextDate.getDate();
				tmpMonth = nextDate.getMonth();
				if(nextDate < this.startDate || nextDate > this.endDate){
					dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "disabledDate"));
				}else{
					dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, curClass));
				}
				nextDate = this.incrementDate(nextDate, true);
				if(nextDate.getMonth() != tmpMonth){
					switch(curClass){
						case "previous":
							var curClass = "current";
							break;
						case "current":
							var curClass = "next";
							break;
					}
				}
			}
		},
		
		incrementDate: function(date, bool) {
			// bool: true to increase, false to decrease
			return dojo.date.add(date,dojo.date.dateParts.DAY,((bool) ? 1: -1));
		},
		
		incrementWeek: function(evt) {
			var d = new Date(this.firstDay.year,this.firstDay.month,this.firstDay.date);
			switch(evt.target) {
				case this.increaseWeekNode.getElementsByTagName("img").item(0): 
				case this.increaseWeekNode:
					tmpDate = dojo.date.add(new Date(this.firstDay.year, this.firstDay.month, this.firstDay.date), dojo.date.dateParts.WEEK,1)
					if(tmpDate < this.endDate){
						d = dojo.date.add(d,dojo.date.dateParts.WEEK,1);
					}
					break;
				case this.decreaseWeekNode.getElementsByTagName("img").item(0):
				case this.decreaseWeekNode:
					var tmpDate = new Date(this.firstDay.year, this.firstDay.month, this.firstDay.date);
					if(tmpDate > this.startDate){
						d = dojo.date.add(d,dojo.date.dateParts.WEEK,-1);
					}
					break;
			}
			this.firstDay.date=d.getDate();
			this.firstDay.month=d.getMonth();
			this.firstDay.year=d.getFullYear();
			this.initUI();
		},
	
		incrementMonth: function(evt) {
			var d = new Date(this.curMonth);
			var tmpDate = new Date(this.firstDay.year, this.firstDay.month, this.firstDay.date);
			switch(evt.currentTarget) {
				case this.increaseMonthNode.getElementsByTagName("img").item(0):
				case this.increaseMonthNode:
					tmpDate = dojo.date.add(tmpDate, dojo.date.dateParts.DAY, (this.displayWeeks*7));
					if(tmpDate < this.endDate){
						d = dojo.date.add(d, dojo.date.dateParts.MONTH, 1);
					}else{
						var revertToEndDate = true;
					}
					break;
				case this.decreaseMonthNode.getElementsByTagName("img").item(0):
				case this.decreaseMonthNode:
					if(tmpDate > this.startDate){
						d = dojo.date.add(d, dojo.date.dateParts.MONTH, -1);
					}else{
						var revertToStartDate = true;
					}
					break;
			}
			if(revertToStartDate){
				d = new Date(this.startDate);
			}else if(revertToEndDate){
				d = new Date(this.endDate);
			}			
			var tempFirstDay = dojo.widget.DatePicker.util.initFirstDay(d,this.weekStartsOn,false);
			this.firstDay.year = tempFirstDay.year;
			this.firstDay.month = tempFirstDay.month;
			this.firstDay.date = tempFirstDay.date;
			this.initUI();
		},
	
		incrementYear: function(evt) {
			var year = this.curMonth.getFullYear();
			var tmpDate = new Date(this.firstDay.year, this.firstDay.month, this.firstDay.date);
			switch(evt.target) {
				case this.nextYearLabelNode:
					tmpDate = dojo.date.add(tmpDate, dojo.date.dateParts.YEAR, 1);
					if(tmpDate<this.endDate){
						year++;
					}else{
						var revertToEndDate = true;
					}
					break;
				case this.previousYearLabelNode:
					tmpDate = dojo.date.add(tmpDate, dojo.date.dateParts.YEAR, -1);
					if(tmpDate>this.startDate){
						year--;
					}else{
						var revertToStartDate = true;
					}
					break;
			}
			var d;
			if(revertToStartDate){
				d = new Date(this.startDate);
			}else if(revertToEndDate){
				d = new Date(this.endDate);
			}else{
				d= new Date(year, this.curMonth.getMonth(), 1);
			}
			var tempFirstDay = dojo.widget.DatePicker.util.initFirstDay(d,this.weekStartsOn,false);
			this.firstDay.year = tempFirstDay.year;
			this.firstDay.month = tempFirstDay.month;
			this.firstDay.date = tempFirstDay.date;
			this.initUI();
		},
	
		onIncrementDate: function(evt) {
			dojo.unimplemented('dojo.widget.DatePicker.onIncrementDate');
		},
	
		onIncrementWeek: function(evt) {
			evt.stopPropagation();
			if(!this.staticDisplay){
				this.incrementWeek(evt);
			}
		},
	
		onIncrementMonth: function(evt) {
			evt.stopPropagation();
			if(!this.staticDisplay){
				this.incrementMonth(evt);
			}
		},
		
		onIncrementYear: function(evt) {
			evt.stopPropagation();
			if(!this.staticDisplay){
				this.incrementYear(evt);
			}
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
			dojo.event.browser.stopEvent(evt)
		},
		
		onSetDate: function(evt) {
			if(evt.target.nodeType == dojo.dom.ELEMENT_NODE) {
				var eventTarget = evt.target;
			} else {
				var eventTarget = evt.target.parentNode;
			}
			dojo.event.browser.stopEvent(evt);
			this.selectedIsUsed = 0;
			this.todayIsUsed = 0;
			var month = this.curMonth.getMonth();
			var year = this.curMonth.getFullYear();
			if(dojo.html.hasClass(eventTarget, this.classNames["disabledDate"])){
				return; //this date is disabled... ignore it
			}else if (dojo.html.hasClass(eventTarget, this.classNames["next"])) {
				month = ++month % 12;
				// if month is now == 0, add a year
				year = (month==0) ? ++year : year;
			} else if (dojo.html.hasClass(eventTarget, this.classNames["previous"])) {
				month = --month % 12;
				// if month is now == 0, substract a year
				year = (month==11) ? --year : year;
			}
			this.date = new Date(year, month, eventTarget.innerHTML);
			this.setDate(dojo.widget.DatePicker.util.toRfcDate(this.date));
			this.initUI();
		}
	}
);

dojo.widget.DatePicker.util = new function() {
	this.months = dojo.date.months;
	this.weekdays = dojo.date.days;

	this.toRfcDate = function(jsDate) {
		if(!jsDate) {
			var jsDate = new Date();
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
	
	this.initFirstDay = function(dateObj,startOfWeek,bool) {
		//bool is false for first day of month, true for first day of week adjusted by startOfWeek
		var d = new Date(dateObj);
		d.setDate((bool) ? d.getDate() : 1);
		d.setDate(d.getDate()-this.getAdjustedDay(d,startOfWeek));
		return {year: d.getFullYear(), month: d.getMonth(), date: d.getDate()};
	}
	this.getAdjustedDay = function(dateObj,startOfWeek){
		//this function is used to adjust date.getDay() values to the new values based on the current first day of the week value
		var days = [0,1,2,3,4,5,6];
		if(startOfWeek>0){
			for(var i=0;i<startOfWeek;i++){
				days.unshift(days.pop());
			}
		}
		return days[dateObj.getDay()];
	}
	this.daysBetween = function(dA, dB){
		return dojo.date.diff(dA, dB, dojo.date.dateParts.DAY)
	}
}
