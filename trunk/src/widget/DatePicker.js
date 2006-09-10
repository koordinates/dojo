dojo.provide("dojo.widget.DatePicker");
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
		displayWeeks: 6, 
		//if true, weekly size of calendar changes to acomodate the month if false, 42 day format is used
		adjustWeeks: false,
		//first available date in the calendar set
		startDate: "1492-10-12",
		//last available date in the calendar set
		endDate: "2941-10-12",
		//adjusts the first day of the week 0==Sunday..6==Saturday
		weekStartsOn: "",
		//current date selected by DatePicker in rfc 3339 date format "YYYY-mm-dd"
		selectedDate: "",
		storedDate: "", //deprecated use selectedDate instead
		//if startDate and endDate are less than 42 days apart, we disabled incremental controls -- you can set this by default, in cases where you want a date in a specific month only.
		staticDisplay: false,
		//end configurable options
		
		//date Object for the 1st of the current month
		curMonth: "",
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
			disabledPrevious: "previousMonthDisabled",
			current: "currentMonth",
			disabledCurrent: "currentMonthDisabled",
			next: "nextMonth",
			disabledNext: "nextMonthDisabled",
			currentDate: "currentDate",
			selectedDate: "selectedItem"
		},
		templatePath:  dojo.uri.dojoUri("src/widget/templates/DatePicker.html"),
		templateCssPath:  dojo.uri.dojoUri("src/widget/templates/DatePicker.css"),

		fillInTemplate: function(){
			dojo.widget.DatePicker.call(this);
			if(this.storedDate!=""){
				dojo.deprecated("dojo.widget.DatePicker.storedDate", "storedDate was renamed selectedDate to make its purpose better understood", "0.5");
				this.selectedDate=this.storedDate;
			}
			this.weekTemplate = dojo.dom.removeNode(this.calendarWeekTemplate);
			this.startDate = dojo.date.fromRfc3339(this.startDate);
			this.endDate = dojo.date.fromRfc3339(this.endDate);
			this.startDate.setHours(0,0,0,0); //adjust startDate to be exactly midnight
			this.endDate.setHours(24,0,0,-1); //adjusting endDate to be a fraction of a second before  midnight
			if(this.weekStartsOn==""){
				this.weekStartsOn=dojo.date.getFirstDayOfWeek(this.lang);
			}
			this._initData();
		},
		_initData: function() {
			/*
			summary: 
		 	      Initialize the date data for the date picker 
		 	 description: 
		 	      Initializes the date data for the DatePicker widget instance.  For 
		 	      example, if there is not already a value for selectedDate, it is  
		 	      populated with today's date from the client. 
			*/
			this.today = new Date();
			if(this.selectedDate && (this.selectedDate.split("-").length > 2)) {
				this.date = dojo.date.fromRfc3339(this.selectedDate);
			} else {
				this.date = new Date(this.today);
			}
			if(this.date<this.startDate){
				this.date = this.startDate;
			}
			if(this.date>this.endDate){
				this.date = this.endDate;
			}
			this.setDate(this.date);
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
		},
		
		getValue: function() {
			return this.getDate();
		},
		getDate: function() {
			//return current selectedDate in RFC 3339 format
			return this.selectedDate;
		},
		setValue: function(rfcDate) {
			//stores date and updates UI
			this.setDate(rfcDate);
		},			
		setDate: function(rfcDate) {
			if(typeof(rfcDate)=="string"){
				var d = dojo.date.fromRfc3339(rfcDate);
			}else{
				var d = new Date(rfcDate);
				var rfcDate = dojo.date.toRfc3339(rfcDate,'dateOnly');
			}
			this.selectedDate = rfcDate;
			this._preInitUI(d,false,true);
		},
		_preInitUI: function(dateObj,initFirst,initUI) {
			//initFirst is to tell _initFirstDay if you want first day of the displayed calendar, or first day of the week for dateObj
			//initUI tells preInitUI to go ahead and run initUI if set to true
			d = new Date(dateObj);
			this.date = new Date(d);
			var tempFirstDay = this._initFirstDay(d,initFirst);
			this.firstDay.year = tempFirstDay.year;
			this.firstDay.month = tempFirstDay.month;
			this.firstDay.date = tempFirstDay.date;
			if(initUI){
				this._initUI();
			}
		},
		_initUI: function() {
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
				this.displayWeeks = Math.ceil((dojo.date.getDaysInMonth(this.curMonth) + this._getAdjustedDay(this.curMonth))/7);
			}
			var days = this.displayWeeks*7; //init total days to display
			for(var i=0;i<this.displayWeeks;i++){
				this.calendarDatesContainerNode.appendChild(this.weekTemplate.cloneNode(true));
			}
			if(this._daysBetween(this.startDate,this.endDate) < days){
				this.staticDisplay = true;
				if(this._daysBetween(nextDate,this.endDate) > days){
					var tmpNext = new Date(nextDate);
					this._preInitUI(this.startDate,true,false);
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
					switch(curClass) {
						case "previous":
							dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "disabledPrevious"));
							break;
						case "current":
							dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "disabledCurrent"));
							break;
						case "next": 
							dojo.html.setClass(currentCalendarNode, this.getDateClassName(nextDate, "disabledNext"));
							break;
					}
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
					if(tmpDate >= this.startDate){
						d = dojo.date.add(d,dojo.date.dateParts.WEEK,-1);
					}
					break;
			}
			this._preInitUI(d,true,true);
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
			this._preInitUI(d,false,true);
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
			this._preInitUI(d,false,true);
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
			if(dojo.html.hasClass(eventTarget, this.classNames["disabledPrevious"])||dojo.html.hasClass(eventTarget, this.classNames["disabledCurrent"])||dojo.html.hasClass(eventTarget, this.classNames["disabledNext"])){
				return; //this date is disabled... ignore it
			}else if (dojo.html.hasClass(eventTarget, this.classNames["next"])) {
				if(this.staticDisplay){
					return;
				}
				month = ++month % 12;
				// if month is now == 0, add a year
				year = (month==0) ? ++year : year;
			} else if (dojo.html.hasClass(eventTarget, this.classNames["previous"])) {
				if(this.staticDisplay){
					return;
				}
				month = --month % 12;
				// if month is now == 0, substract a year
				year = (month==11) ? --year : year;
			}
			this.setDate(new Date(year, month, eventTarget.innerHTML));
		},
		_initFirstDay: function(dateObj,bool) {
			//bool is false for first day of month, true for first day of week adjusted by startOfWeek
			var d = new Date(dateObj);
			d.setDate((bool) ? d.getDate() : 1);
			d.setDate(d.getDate()-this._getAdjustedDay(d,this.weekStartsOn));
			return {year: d.getFullYear(), month: d.getMonth(), date: d.getDate()};
		},
		_getAdjustedDay: function(dateObj){
			//this function is used to adjust date.getDay() values to the new values based on the current first day of the week value
			var days = [0,1,2,3,4,5,6];
			if(this.weekStartsOn>0){
				for(var i=0;i<this.weekStartsOn;i++){
					days.unshift(days.pop());
				}
			}
			return days[dateObj.getDay()];
		},
		_daysBetween: function(dA, dB){
			return dojo.date.diff(dA, dB, dojo.date.dateParts.DAY)
		}
	}
);

