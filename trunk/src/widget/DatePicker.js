dojo.provide("dojo.widget.DatePicker");
dojo.provide("dojo.widget.DatePicker.util");
dojo.require("dojo.widget.DomWidget");

dojo.widget.DatePicker = function(){
	dojo.widget.Widget.call(this);
	this.widgetType = "DatePicker";
	this.isContainer = false;
	this.months = dojo.widget.DatePicker.util.months;
	this.weekdays = dojo.widget.DatePicker.util.weekdays;
}

dojo.inherits(dojo.widget.DatePicker, dojo.widget.Widget);
dojo.widget.tags.addParseTreeHandler("dojo:datepicker");

dojo.requireAfterIf("html", "dojo.widget.html.DatePicker");

dojo.widget.DatePicker.util = new function() {
	this.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	this.weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}
