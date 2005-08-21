dojo.provide("dojo.widget.Button");
dojo.require("dojo.widget.Widget");

dojo.widget.tags.addParseTreeHandler("dojo:button");

dojo.widget.Button = function(){
	dojo.widget.Widget.call(this);

	this.widgetType = "Button";
	this.onClick = function(){ return; }
	this.isContainer = false;
}
dj_inherits(dojo.widget.Button, dojo.widget.Widget);
