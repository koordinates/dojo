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
	 	              that makes it easy to select a date, or switch by month and/or year. 
	 	description: 
	 	              A stand-alone DatePicker widget that makes it  
	 	              easy to select a date, or increment by week, month, and/or year. 
	 	              It is designed to be used on its own, or inside of other widgets to  
	 	              create drop down DatePickers or other similar combination widgets. 
	 	              To get a sense of what month to highlight, we basically initialize on 
	 	              the first Saturday of each month, since that will be either the first  
	 	              of two or the second of three months being partially displayed, and  
	 	              then work forwards and backwards from that point. Currently, we assume  
	 	              that dates are passed as Date objects or in the `RFC 3339`_ format  
	 	              (2005-06-30T08:05:00-07:00), because Dylan finds it to be most human  
	 	              readable and easy to parse.
	 	 usage: 
	 	              var datePicker = dojo.widget.createWidget("DatePicker", {},   
	 	              dojo.byId("datePickerNode")); 
	 	 
	 	              <div dojoType="DatePicker"></div> 
		*/
	
		//start attributes
		
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
		//current date selected by DatePicker in rfc 3339 date format "YYYY-mm-dd" -- once initialized, this.date will be a date Object
		date: "",
		storedDate: "", //deprecated use date instead
		//if startDate and endDate are less than 42 days apart, we disabled incremental controls -- you can set this by default, in cases where you want a date in a specific month only.
		staticDisplay: false,

		//how to render the names of the days in the header.  see dojo.date.getDayNames
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

		postMixInProperties: function(){
			// summary: see dojo.widget.DomWidget

			dojo.widget.DatePicker.superclass.postMixInProperties.apply(this, arguments);
			if(this.storedDate){
				dojo.deprecated("dojo.widget.DatePicker", "use date instead of 'storedDate'", "0.5");
				this.date=this.storedDate;
			}
			this.startDate = dojo.date.fromRfc3339(this.startDate);
			this.endDate = dojo.date.fromRfc3339(this.endDate);
			this.startDate.setHours(0,0,0,0); //adjust startDate to be exactly midnight
			this.endDate.setHours(24,0,0,-1); //adjusting endDate to be a fraction of a second before  midnight
			if(!this.weekStartsOn){
				this.weekStartsOn=dojo.date.getFirstDayOfWeek(this.lang);
			}

			this.today = new Date();
			if(!this.date){this.date = new Date();}
			else if(this.date && (typeof this.date=="string") && (this.date.split("-").length > 2)) {
				this.date = dojo.date.fromRfc3339(this.date);
			} else {
				this.date = new Date(this.date);
			}
			if(this.date<this.startDate){
				this.date = this.startDate;
			}
			if(this.date>this.endDate){
				this.date = this.endDate;
			}
		},

		fillInTemplate: function() {
			// summary: see dojo.widget.DomWidget

			dojo.widget.DatePicker.superclass.fillInTemplate.apply(this, arguments);
			this.weekTemplate = dojo.dom.removeNode(this.calendarWeekTemplate);
			this.setDate(this.date); // triggers UI initialization

			// Insert localized day names in the template
			var dayLabels = dojo.lang.unnest(dojo.date.getNames('days', this.dayWidth, 'standAlone', this.lang)); //if we dont use unnest, we risk modifying the dayLabels array inside of dojo.date and screwing up other calendars on the page
			if(this.weekStartsOn > 0){
				//adjust dayLabels for different first day of week. ie: Monday or Thursday instead of Sunday
				for(var i=0;i<this.weekStartsOn;i++){
					dayLabels.push(dayLabels.shift());
				}
			}
			var dayLabelNodes = this.dayLabelsRow.getElementsByTagName("td");
 			for(i=0; i<7; i++) {
				dayLabelNodes.item(i).innerHTML = dayLabels[i];
			}
		},
		
		getValue: function() {
			// summary: return current date in RFC 3339 format
			return dojo.date.toRfc3339(this.date); /*String*/
		},

		getDate: function() {
			// summary: return current date as a Date object
			return this.date; /*Date*/
		},

		setValue: function(/*String*/rfcDate) {
			//summary: set the current date from a string in RFC 3339 format and update the UI
			this.setDate(rfcDate);
		},			

		setDate: function(/*Date|String*/dateObj) {
			//summary: set the current date and update the UI
			if(typeof dateObj=="string"){
				this.date = dojo.date.fromRfc3339(dateObj);
			}else{
				this.date = new Date(dateObj);
			}
			this._preInitUI(this.date,false,true);
		},

		_preInitUI: function(dateObj,initFirst,initUI) {
			//initFirst is to tell _initFirstDay if you want first day of the displayed calendar, or first day of the week for dateObj
			//initUI tells preInitUI to go ahead and run initUI if set to true
			this.firstDay = this._initFirstDay(dateObj,initFirst);
			this.selectedIsUsed = false;
			this.currentIsUsed = false;
			var nextDate = new Date(this.firstDay);
			var tmpMonth = nextDate.getMonth();
			this.curMonth = new Date(nextDate);
			this.curMonth.setDate(nextDate.getDate()+
				Math.floor((this.displayWeeks!="" ? this.displayWeeks*7 : dojo.date.getDaysInMonth(nextDate))/2));
			if(tmpMonth == this.curMonth.getMonth()) {
				this.curMonth = new Date(nextDate);
			}
			this.curMonth.setDate(1);
			if(initUI){
				this._initUI();
			}
		},

		_initUI: function() {
			dojo.dom.removeChildren(this.calendarDatesContainerNode);
			var curClass;
			var currentClassName = "";
			var nextDate = new Date(this.firstDay);
			if(nextDate.getMonth() == this.curMonth.getMonth()) {
				curClass = "current";
			}else{
				curClass = "previous";
			}
			if(this.displayWeeks=="" || this.adjustWeeks){
				this.adjustWeeks = true;
				this.displayWeeks = Math.ceil((dojo.date.getDaysInMonth(this.curMonth) + this._getAdjustedDay(this.curMonth))/7);
			}
			var days = this.displayWeeks*7; //init total days to display
			for(var i=0;i<this.displayWeeks;i++){
				this.calendarDatesContainerNode.appendChild(this.weekTemplate.cloneNode(true));
			}
			if(dojo.date.diff(this.startDate,this.endDate, dojo.date.dateParts.DAY) < days){
				this.staticDisplay = true;
				if(dojo.date.diff(nextDate,this.endDate, dojo.date.dateParts.DAY) > days){
					this._preInitUI(this.startDate,true,false);
					nextDate = new Date(this.firstDay);
				}
				tmpMonth = nextDate.getMonth();
				this.curMonth = new Date(nextDate);
				this.curMonth.setDate(nextDate.getDate() + Math.floor((dojo.date.getDaysInMonth(nextDate)/2)));
				if(tmpMonth == this.curMonth.getMonth()) {
					this.curMonth = new Date(nextDate);
					curClass = "current";
				}else{
					curClass = "previous";
				}
				this.curMonth.setDate(1);
			}
			this._setMonthLabel(this.curMonth.getMonth());
			this._setYearLabels(this.curMonth.getFullYear());
			var calendarNodes = this.calendarDatesContainerNode.getElementsByTagName("td");
			var calendarRows = this.calendarDatesContainerNode.getElementsByTagName("tr");
			var currentCalendarNode;
			for(i=0;i<days;i++){
				//this is our new UI loop... one loop to rule them all, and in the datepicker bind them
				currentCalendarNode = calendarNodes.item(i);
				currentCalendarNode.innerHTML = nextDate.getDate();
				tmpMonth = nextDate.getMonth();
				var mappedClass = curClass;
				if(nextDate < this.startDate || nextDate > this.endDate){
					var classMap={previous:"disabledPrevious",current:"disabledCurrent",next:"disabledNext"};
					mappedClass=classMap[curClass];
				}
				dojo.html.setClass(currentCalendarNode, this._getDateClassName(nextDate, mappedClass));
				nextDate = dojo.date.add(nextDate, dojo.date.dateParts.DAY, 1);
				if(nextDate.getMonth() != tmpMonth){
					switch(curClass){
						case "previous":
							curClass = "current";
							break;
						case "current":
							curClass = "next";
							break;
					}
				}
			}
		},
		
		_incrementWeek: function(evt) {
			var d = new Date(this.firstDay);
			switch(evt.target) {
				case this.increaseWeekNode.getElementsByTagName("img").item(0): 
				case this.increaseWeekNode:
					var tmpDate = dojo.date.add(d, dojo.date.dateParts.WEEK, 1);
					if(tmpDate < this.endDate){
						d = dojo.date.add(d, dojo.date.dateParts.WEEK, 1);
					}
					break;
				case this.decreaseWeekNode.getElementsByTagName("img").item(0):
				case this.decreaseWeekNode:
					if(d >= this.startDate){
						d = dojo.date.add(d, dojo.date.dateParts.WEEK, -1);
					}
					break;
			}
			this._preInitUI(d,true,true);
		},
	
		_incrementMonth: function(evt) {
			var d = new Date(this.curMonth);
			var tmpDate = new Date(this.firstDay);
			switch(evt.currentTarget) {
				case this.increaseMonthNode.getElementsByTagName("img").item(0):
				case this.increaseMonthNode:
					tmpDate = dojo.date.add(tmpDate, dojo.date.dateParts.DAY, this.displayWeeks*7);
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
	
		_incrementYear: function(evt) {
			var year = this.curMonth.getFullYear();
			var tmpDate = new Date(this.firstDay);
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
			// summary: handler for increment week event
			evt.stopPropagation();
			if(!this.staticDisplay){
				this._incrementWeek(evt);
			}
		},
	
		onIncrementMonth: function(evt) {
			// summary: handler for increment month event
			evt.stopPropagation();
			if(!this.staticDisplay){
				this._incrementMonth(evt);
			}
		},
		
		onIncrementYear: function(evt) {
			// summary: handler for increment year event
			evt.stopPropagation();
			if(!this.staticDisplay){
				this._incrementYear(evt);
			}
		},

		_setMonthLabel: function(monthIndex) {
			this.monthLabelNode.innerHTML = dojo.date.getNames('months', 'wide', 'standAlone', this.lang)[monthIndex];
		},

		_setYearLabels: function(year) {
			var y = year - 1;
			dojo.lang.forEach(["previousYearLabelNode", "currentYearLabelNode", "nextYearLabelNode"], function(node){
				this[node].innerHTML = y++; /*ticket #1206: dojo.date.format(new Date(y++, 0), {formatLength:'yearOnly', locale:this.lang});*/
			}, this);
		},
		
		_getDateClassName: function(date, monthState) {
			var currentClassName = this.classNames[monthState];
			if ((!this.selectedIsUsed) && (date.getDate() == this.date.getDate()) && (date.getMonth() == this.date.getMonth()) && (date.getFullYear() == this.date.getFullYear())) {
				currentClassName = this.classNames.selectedDate + " " + currentClassName;
				this.selectedIsUsed = true;
			}
			if((!this.currentIsUsed) && (date.getDate() == this.today.getDate()) && (date.getMonth() == this.today.getMonth()) && (date.getFullYear() == this.today.getFullYear())) {
				currentClassName = currentClassName + " "  + this.classNames.currentDate;
				this.currentIsUsed = true;
			}
			return currentClassName;
		},
	
		onClick: function(evt) {
			//summary: the click event handler
			dojo.event.browser.stopEvent(evt);
		},
		
		onSetDate: function(evt){
			//summary: the set date event handler
			var eventTarget = evt.target;
			if(eventTarget.nodeType != dojo.dom.ELEMENT_NODE){eventTarget = eventTarget.parentNode;}
			dojo.event.browser.stopEvent(evt);
			this.selectedIsUsed = false;
			this.todayIsUsed = false;
			dojo.lang.forEach(["disabledPrevious", "disabledCurrent", "disabledNext"], function(name){
				if(dojo.html.hasClass(eventTarget, this.classNames.name)){return;}
			}, this);
			var month = this.curMonth.getMonth();
			var year = this.curMonth.getFullYear();
			if(this.staticDisplay){return;}
			if (dojo.html.hasClass(eventTarget, this.classNames.next)){
				month = ++month % 12;
				if(month===0){++year;}
			} else if (dojo.html.hasClass(eventTarget, this.classNames.previous)){
				month = --month % 12;
				if(month==11){--year;}
			}
			this.setDate(new Date(year, month, eventTarget.innerHTML));
		},

		_initFirstDay: function(dateObj, /*Boolean*/adj){
			//adj: false for first day of month, true for first day of week adjusted by startOfWeek
			var d = new Date(dateObj);
			if(!adj){d.setDate(1);}
			d.setDate(d.getDate()-this._getAdjustedDay(d,this.weekStartsOn));
			return d; // Date
		},

		_getAdjustedDay: function(dateObj){
			//summary: used to adjust date.getDay() values to the new values based on the current first day of the week value
			var days = [0,1,2,3,4,5,6];
			if(this.weekStartsOn>0){
				for(var i=0;i<this.weekStartsOn;i++){
					days.unshift(days.pop());
				}
			}
			return days[dateObj.getDay()]; // Number: 0..6 where 0=Sunday
		}
	}
);
