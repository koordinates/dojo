dojo.provide("dojo.webui.widgets.ContextMenu");
dojo.require("dojo.webui.DomWidget");

dojo.webui.widgets.ContextMenu = function(){
	dojo.webui.Widget.call(this);
	this.widgetType = "ContextMenu";
	this.isContainer = true;
	this.isOpened = false;
}
//dj_inherits(dojo.webui.widgets.ContextMenu, dojo.webui.widgets.Menu, dojo.webui.Widget);
dj_inherits(dojo.webui.widgets.ContextMenu, dojo.webui.Widget);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:contextmenu");
