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

/*TODO:  these comments need to be incorporated elsewhere
	- We now display only as many weeks as necessary, unless you tell us otherwise displayWeeks="X" to force a calendar size
	- To get a sense of what month to highlight, we find the first day of the month and add 6 to it to get the first Saturday of
	  the month, this is either the first of 2 months or the 2nd of 3 displayed months .
	- You can now limit available dates by providing startDate="yyyy-MM-dd" and endDate="yyyy-MM-dd"... this will disable/enable
	   incremental controls as needed to avoid the user wasting time scrolling through disabled dates.
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
	 	              To get a sense of what month to highlight, we initialize on 
	 	              the first Saturday of each month, since that will be either the first  
	 	              of two or the second of three months being partially displayed, and  
	 	              then work forwards and backwards from that point. 
	 	              Dates are passed as Date objects or in the `RFC 3339` format  
	 	              http://www.faqs.org/rfcs/rfc3339.html (2005-06-30T08:05:00-07:00),
	 	              so that they are serializable and locale-independent.

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
				dojo.deprecated("dojo.widget.DatePicker", "use 'date' instead of 'storedDate'", "0.5");
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
			if(!this.date) {
				this.date = new Date();
			}else if(this.date && (typeof this.date=="string") && (this.date.split("-").length > 2)) {
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

		fillInTemplate: function(args, frag) {
			// summary: see dojo.widget.DomWidget

			// Copy style info from input node to output node
			var source = this.getFragNodeRef(frag);
			dojo.html.copyStyle(this.domNode, source);

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

		setValue: function(/*Date|String*/rfcDate) {
			//summary: set the current date from RFC 3339 formatted string or a date object, synonymous with setDate
			this.setDate(rfcDate);
		},			

		setDate: function(/*Date|String*/dateObj) {
			//summary: set the current date and update the UI
			if(typeof dateObj=="string"){
				this.date = dojo.date.fromRfc3339(dateObj);
			}else{
				this.date = new Date(dateObj);
			}
			if(this.selectedNode!=null){
				dojo.html.removeClass(this.selectedNode,this.classNames.selectedDate);
			}
			if(this.clickedNode!=null){
				dojo.html.addClass(this.clickedNode,this.classNames.selectedDate);
				this.selectedNode = this.clickedNode;
			}else{
				this._preInitUI(this.date,false,true);
			}
			this.clickedNode=null;
			this.onSetDate();
		},

		_preInitUI: function(dateObj,initFirst,initUI) {
			//initFirst is to tell _initFirstDay if you want first day of the displayed calendar, or first day of the week for dateObj
			//initUI tells preInitUI to go ahead and run initUI if set to true
			this.firstDay = this._initFirstDay(dateObj,initFirst,false);
			this.selectedIsUsed = false;
			this.currentIsUsed = false;
			var nextDate = new Date(this.firstDay);
			var tmpMonth = nextDate.getMonth();
			this.curMonth = new Date(nextDate);
			this.curMonth.setDate(nextDate.getDate()+6); //first saturday gives us the current Month
			this.curMonth.setDate(1);
			if(this.displayWeeks=="" || this.adjustWeeks){
				this.adjustWeeks = true;
				this.displayWeeks = Math.ceil((dojo.date.getDaysInMonth(this.curMonth) + this._getAdjustedDay(this.curMonth))/7);
			}
			var days = this.displayWeeks*7; //init total days to display
			if(dojo.date.diff(this.startDate,this.endDate, dojo.date.dateParts.DAY) < days){
				this.staticDisplay = true;
				if(dojo.date.diff(nextDate,this.endDate, dojo.date.dateParts.DAY) > days){
					this._preInitUI(this.startDate,true,false);
					nextDate = new Date(this.firstDay);
				}
				this.curMonth = new Date(nextDate);
				this.curMonth.setDate(nextDate.getDate()+6);
				this.curMonth.setDate(1);
				var curClass = (nextDate.getMonth() == this.curMonth.getMonth())?'current':'previous';
			}
			if(initUI){
				this._initUI(days);
			}
		},
		_initUI: function(days) {
			dojo.dom.removeChildren(this.calendarDatesContainerNode);
			for(var i=0;i<this.displayWeeks;i++){
				this.calendarDatesContainerNode.appendChild(this.weekTemplate.cloneNode(true));
			}

			var nextDate = new Date(this.firstDay);
			this._setMonthLabel(this.curMonth.getMonth());
			this._setYearLabels(this.curMonth.getFullYear());
			var calendarNodes = this.calendarDatesContainerNode.getElementsByTagName("td");
			var calendarRows = this.calendarDatesContainerNode.getElementsByTagName("tr");
			var currentCalendarNode;
			for(i=0;i<days;i++){
				//this is our new UI loop... one loop to rule them all, and in the datepicker bind them
				currentCalendarNode = calendarNodes.item(i);
				currentCalendarNode.innerHTML = nextDate.getDate();
				var curClass = (nextDate.getMonth() == this.curMonth.getMonth())? 'current':'previous';
				var mappedClass = curClass;
				if(this._isDisabledDate(nextDate)){
					var classMap={previous:"disabledPrevious",current:"disabledCurrent",next:"disabledNext"};
					mappedClass=classMap[curClass];
				}
				dojo.html.setClass(currentCalendarNode, this._getDateClassName(nextDate, mappedClass));
				if(dojo.html.hasClass(currentCalendarNode,this.classNames.selectedDate)){
					this.selectedNode = currentCalendarNode;
				}
				nextDate = dojo.date.add(nextDate, dojo.date.dateParts.DAY, 1);
			}
			this._initControls();
		},
		_initControls: function(){
			var d = new Date(this.firstDay);
			var decWeek, incWeek, decMonth, incMonth, decYear, incYear;
			decWeek = incWeek = decMonth = incMonth = decYear = incYear = !this.staticDisplay;
			if(decWeek){
					if(d<this.startDate){
					decWeek = decMonth = decYear = false;
				}
			}
			if(incWeek){
				if(dojo.date.add(d,dojo.date.dateParts.DAY,(this.displayWeeks+1)*7)>this.endDate){
					incWeek = incMonth = incYear = false;
				}
			}
			if(decMonth){
				if(dojo.date.add(d,dojo.date.dateParts.MONTH,-1)<this.startDate){
					decMonth = decYear = false;
				}
			}
			if(incMonth){
				if(dojo.date.add(d,dojo.date.dateParts.MONTH,1)>this.endDate){
					incMonth = incYear = false;
				}
			}
			if(decYear){
				if(dojo.date.add(d,dojo.date.dateParts.YEAR,-1)<this.startDate){
					decYear = false;
				}
			}
			if(incYear){
				if(dojo.date.add(d,dojo.date.dateParts.YEAR,1)>this.endDate){
					incYear = false;
				}
			}

			function enableControl(node, enabled){
				dojo.html.setVisibility(node, enabled ? 'visible' : 'hidden');
			}
			enableControl(this.decreaseWeekNode,decWeek);
			enableControl(this.increaseWeekNode,incWeek);
			enableControl(this.decreaseMonthNode,decMonth);
			enableControl(this.increaseMonthNode,incMonth);
			enableControl(this.previousYearLabelNode,decYear);
			enableControl(this.nextYearLabelNode,incYear);
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
				d = new Date(year, this.curMonth.getMonth(), 1);
			}
			this._preInitUI(d,false,true);
		},
	
		onIncrementWeek: function(/*Event*/evt) {
			// summary: handler for increment week event
			evt.stopPropagation();
			if(!this.staticDisplay){
				this._incrementWeek(evt);
			}
		},
	
		onIncrementMonth: function(/*Event*/evt) {
			// summary: handler for increment month event
			evt.stopPropagation();
			if(!this.staticDisplay){
				this._incrementMonth(evt);
			}
		},
		
		onIncrementYear: function(/*Event*/evt) {
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
	
		onClick: function(/*Event*/evt) {
			//summary: the click event handler
			dojo.event.browser.stopEvent(evt);
		},

		_handleUiClick: function(/*Event*/evt) {
			var eventTarget = evt.target;
			if(eventTarget.nodeType != dojo.dom.ELEMENT_NODE){eventTarget = eventTarget.parentNode;}
			dojo.event.browser.stopEvent(evt);
			this.selectedIsUsed = this.todayIsUsed = false;
			var month = this.curMonth.getMonth();
			var year = this.curMonth.getFullYear();
			if(dojo.html.hasClass(eventTarget, this.classNames["disabledPrevious"])||dojo.html.hasClass(eventTarget, this.classNames["disabledCurrent"])||dojo.html.hasClass(eventTarget, this.classNames["disabledNext"])){
				return; //this date is disabled... ignore it
			}else if (dojo.html.hasClass(eventTarget, this.classNames["next"])) {
				month = ++month % 12;
				if(month===0){++year;}
			} else if (dojo.html.hasClass(eventTarget, this.classNames["previous"])) {
				month = --month % 12;
				if(month==11){--year;}
			}
			this.clickedNode = eventTarget;
			this.setDate(new Date(year, month, eventTarget.innerHTML));
		},
		
		onSetDate: function() {
			//summary: the set date event handler
		},
		
		_isDisabledDate: function(dateObj){
			if(dateObj<this.startDate||dateObj>this.endDate){
				return true;
			}

			return this.isDisabledDate(dateObj, this.lang);
		},

		isDisabledDate: function(/*Date*/dateObj, /*String?*/locale){
		// summary:
		//	May be overridden to disable certain dates in the calendar e.g. isDisabledDate=dojo.date.isWeekend

			return false; // Boolean
		},

		_initFirstDay: function(/*Date*/dateObj, /*Boolean*/adj){
			//adj: false for first day of month, true for first day of week adjusted by startOfWeek
			var d = new Date(dateObj);
			if(!adj){d.setDate(1);}
			d.setDate(d.getDate()-this._getAdjustedDay(d,this.weekStartsOn));
			return d; // Date
		},

		_getAdjustedDay: function(/*Date*/dateObj){
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
