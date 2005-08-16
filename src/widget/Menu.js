dojo.provide("dojo.widget.Menu");
dojo.require("dojo.widget.DomWidget");

dojo.widget.Menu = function(){
	dojo.widget.Widget.call(this);
	this.widgetType = "Menu";
}
dj_inherits(dojo.widget.Menu, dojo.widget.Widget);

// FIXME: own file? Mixin instead?
dojo.widget.DomMenu = function(){
	dojo.widget.Menu.call(this);
	dojo.widget.DomWidget.call(this, true);
}
dj_inherits(dojo.widget.DomMenu, dojo.widget.Menu);

dojo.widget.tags.addParseTreeHandler("dojo:menu");
