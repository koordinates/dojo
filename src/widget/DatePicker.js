dojo.provide("dojo.widget.DatePicker");
dojo.provide("dojo.widget.DatePicker.util");
dojo.require("dojo.widget.DomWidget");
dojo.require("dojo.date");

dojo.widget.DatePicker = function(){
	dojo.widget.Widget.call(this);
	this.widgetType = "DatePicker";
	this.isContainer = false;
	// the following aliases prevent breaking people using 0.2.x
	this.months = dojo.date.months;
	this.weekdays = dojo.date.days;
	this.toRfcDate = dojo.date.toRfcDate;
	this.fromRfcDate = dojo.date.fromRfcDate;
	this.initFirstSaturday = dojo.widget.DatePicker.util.initFirstSaturday;
}

dojo.inherits(dojo.widget.DatePicker, dojo.widget.Widget);
dojo.widget.tags.addParseTreeHandler("dojo:datepicker");

dojo.requireAfterIf("html", "dojo.widget.html.DatePicker");

dojo.widget.DatePicker.util = new function() {
	this.months = dojo.date.months;
	this.weekdays = dojo.date.days;
	this.toRfcDate = dojo.date.toRfcDate;
	this.fromRfcDate = dojo.date.fromRfcDate;

	
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
