dojo.provide("dojo.widget.HtmlTimePicker");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.TimePicker");

dojo.widget.HtmlTimePicker = function(){
	dojo.widget.TimePicker.call(this);
	dojo.widget.HtmlWidget.call(this);

	var _this = this;
	// selected time, JS Date object
	this.time = "";
	// rfc 3339 date
	this.storedTime = "";
	//this.storedTime = "";
	// time currently selected in the UI, stored in hours, minutes, seconds in the format that will be actually displayed
	this.currentTime = {};
	this.classNames = {
		selectedTime: "selectedItem"
	}
	this.selectedTime = {
		hour: "",
		minute: "",
		amPm: ""
	}

	this.templateCssPath = dojo.uri.dojoUri("src/widget/templates/HtmlTimePicker.css");
	
	this.fillInTemplate = function(){
		this.initData();
		this.initUI();
	}
	
	this.initData = function() {
		// determine date/time from stored info, or by default don't have a set time
		if(this.storedTime) {
			this.time = this.fromRfcDateTime(this.storedTime);
		}
	}
	
	this.toRfcDateTime =function(jsDate) {
		dj_unimplemented("dojo.widget.HtmlTimePicker.toRfcDate");
		//return rfcDate;
	}
	
	this.fromRfcDateTime = function(rfcDate) {
		//2005-06-30T08:05:00-07:00
		var tempTime = rfcDate.split("T")[1].split(":");
		// fullYear, month, date
		var tempDate = new Date();
		tempDate.setHours(tempTime[0]);
		tempDate.setMinutes(tempTime[1]);
		return tempDate;
	}
	
	this.toAmPmHour = function(hour) {
		var amPmHour = hour;
		var isAm = true;
		if (amPmHour == 0) {
			amPmHour = 12;
		} else if (amPmHour>12) {
			amPmHour = amPmHour - 12;
			isAm = false;
		} else if (amPmHour == 12) {
			isAm = false;
		}
		return [amPmHour, isAm];
	}
	
	this.fromAmPmHour = function(amPmHour, isAm) {
		var hour = amPmHour;
		if(isAm && hour == 12) {
			hour = 0;
		} else if (!isAm && hour<12) {
			hour = hour + 12;
		}
		return hour;
	}
	
	this.initUI = function() {
		// set UI to match the currently selected time
		if(this.time) {
			var amPmHour = this.toAmPmHour(this.time.getHours());
			var hour = amPmHour[0];
			var isAm = amPmHour[1];
			var minute = this.time.getMinutes();
			var minuteIndex = parseInt(minute/5);
			this.onSetSelectedHour(hour);
			this.onSetSelectedMinute(minuteIndex);
			this.onSetSelectedAmPm(isAm);
		}
	}
	
	this.onClearSelectedHour = function(evt) {
		var hourNodes = this.hourContainerNode.getElementsByTagName("td");
		for (var i=0; i<hourNodes.length; i++) {
			dojo.xml.htmlUtil.setClass(hourNodes.item(i), "");
		}
	}
	
	this.onClearSelectedMinute = function(evt) {
		var minuteNodes = this.minuteContainerNode.getElementsByTagName("td");
		for (var i=0; i<minuteNodes.length; i++) {
			dojo.xml.htmlUtil.setClass(minuteNodes.item(i), "");
		}
	}
	
	this.onClearSelectedAmPm = function(evt) {
		var amPmNodes = this.amPmContainerNode.getElementsByTagName("td");
		for (var i=0; i<amPmNodes.length; i++) {
			dojo.xml.htmlUtil.setClass(amPmNodes.item(i), "");
		}
	}
	
	this.onSetSelectedHour = function(evt) {
		this.onClearSelectedHour();
		if(evt.target) {
			dojo.xml.htmlUtil.setClass(evt.target, this.classNames.selectedTime);
			this.selectedTime["hour"] = evt.target.innerHTML;
		} else if (!isNaN(evt)) {
			var hourNodes = this.hourContainerNode.getElementsByTagName("td");
			if(hourNodes.item(evt)) {
				dojo.xml.htmlUtil.setClass(hourNodes.item(evt), this.classNames.selectedTime);
				this.selectedTime["hour"] = hourNodes.item(evt).innerHTML;
			}
		}
		this.onSetTime();
	}
	
	this.onSetSelectedMinute = function(evt) {
		this.onClearSelectedMinute();
		if(evt.target) {
			dojo.xml.htmlUtil.setClass(evt.target, this.classNames.selectedTime);
			this.selectedTime["minute"] = evt.target.innerHTML;
		} else if (!isNaN(evt)) {
			var minuteNodes = this.minuteContainerNode.getElementsByTagName("td");
			if(minuteNodes.item(evt)) {
				dojo.xml.htmlUtil.setClass(minuteNodes.item(evt), this.classNames.selectedTime);
				this.selectedTime["minute"] = minuteNodes.item(evt).innerHTML;
			}
		}
		this.onSetTime();
	}
	
	this.onSetSelectedAmPm = function(evt) {
		this.onClearSelectedAmPm();
		if(evt.target) {
			dojo.xml.htmlUtil.setClass(evt.target, this.classNames.selectedTime);
			this.selectedTime["amPm"] = evt.target.innerHTML;
		} else if (!isNaN(evt)) {
			var amPmNodes = this.amPmContainerNode.getElementsByTagName("td");
			if(amPmNodes.item(evt)) {
				dojo.xml.htmlUtil.setClass(amPmNodes.item(evt), this.classNames.selectedTime);
				this.selectedTime["amPm"] = amPmNodes.item(evt).innerHTML;
			}
		}
		this.onSetTime();
	}

	this.onClick = function(evt) {
		dojo.event.browser.stopEvent(evt)
	}
	
	this.onSetTime = function() {
		if(this.time) {
			var hour = 12;
			var minute = 0;
			var isAm = false;
			if(this.selectedTime["hour"]) {
				hour = parseInt(this.selectedTime["hour"], 10);
			}
			if(this.selectedTime["minute"]) {
				minute = parseInt(this.selectedTime["minute"], 10);
			}
			if(this.selectedTime["amPm"]) {
				isAm = (this.selectedTime["amPm"].toLowerCase() == "am");
			}
			this.time = new Date();
			this.time.setHours(this.fromAmPmHour(hour, isAm));
			this.time.setMinutes(minute);
		}
	}

}
dj_inherits(dojo.widget.HtmlTimePicker, dojo.widget.HtmlWidget);

dojo.widget.HtmlTimePicker.prototype.templateString = '<div class="timePickerContainer" dojoAttachPoint="timePickerContainerNode"><table class="timeContainer" cellspacing="0" ><thead><tr><td dojoAttachEvent="onClick: onSetSelectedHour;">Hour</td><td class="minutesHeading">Minute</td><td dojoAttachEvent="onClick: onSetSelectedHour;">&nbsp;</td></tr></thead><tbody><tr><td valign="top"><table><tbody dojoAttachPoint="hourContainerNode"  dojoAttachEvent="onClick: onSetSelectedHour;"><tr><td>12</td><td>6</td></tr> <tr><td>1</td><td>7</td></tr> <tr><td>2</td><td>8</td></tr> <tr><td>3</td><td>9</td></tr> <tr><td>4</td><td>10</td></tr> <tr><td>5</td><td>11</td></tr></tbody></table></td> <td valign="top" class="minutes"><table><tbody dojoAttachPoint="minuteContainerNode" dojoAttachEvent="onClick: onSetSelectedMinute;"><tr><td>00</td><td>30</td></tr> <tr><td>05</td><td>35</td></tr><tr><td>10</td><td>40</td></tr> <tr><td>15</td><td>45</td></tr> <tr><td>20</td><td>50</td></tr> <tr><td>25</td><td>55</td></tr></tbody></table> </td><td valign="top"><table><tbody dojoAttachPoint="amPmContainerNode" dojoAttachEvent="onClick: onSetSelectedAmPm;"><tr><td>AM</td></tr> <tr><td>PM</td></tr></tbody></table></td>																								</tr></tbody></table></div>';
