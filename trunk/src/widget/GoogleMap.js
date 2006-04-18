dojo.provide("dojo.widget.GoogleMap");
dojo.require("dojo.widget.*");
dojo.widget.tags.addParseTreeHandler("dojo:googlemap");

dojo.widget.GoogleMap=function(){
	//	summary
	//	base class for the Google Map widget
	dojo.widget.Widget.call(this);
	this.widgetType="GoogleMap";
	this.isContainer=false;
}

dojo.inherits(dojo.widget.GoogleMap, dojo.widget.Widget);
dojo.requireAfterIf("html", "dojo.widget.html.GoogleMap");
