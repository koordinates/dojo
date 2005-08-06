dojo.provide("dojo.webui.widgets.Menu");
dojo.require("dojo.webui.DomWidget");

dojo.webui.widgets.Menu = function(){
	dojo.webui.Widget.call(this);
	this.widgetType = "Menu";
}
dj_inherits(dojo.webui.widgets.Menu, dojo.webui.Widget);

// FIXME: own file? Mixin instead?
dojo.webui.widgets.DomMenu = function(){
	dojo.webui.widgets.Menu.call(this);
	dojo.webui.DomWidget.call(this, true);
}
dj_inherits(dojo.webui.widgets.DomMenu, dojo.webui.widgets.Menu);

dojo.webui.widgets.tags.addParseTreeHandler("dojo:menu");
