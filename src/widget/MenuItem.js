dojo.provide("dojo.widget.MenuItem");
dojo.require("dojo.widget.DomWidget");

dojo.widget.MenuItem = function(){
	dojo.widget.Widget.call(this);
	this.widgetType = "MenuItem";
	this.isContainer = false;
}
dj_inherits(dojo.widget.MenuItem, dojo.widget.Widget);


// FIXME: own file? Mixin instead?
dojo.widget.DomMenuItem = function(){
	dojo.widget.MenuItem.call(this);
	dojo.widget.DomWidget.call(this);
}
dj_inherits(dojo.widget.DomMenuItem, dojo.widget.DomWidget);

dojo.widget.tags.addParseTreeHandler("dojo:menuitem");
