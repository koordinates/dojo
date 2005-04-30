dojo.hostenv.startPackage("dojo.webui.widgets.MenuItem");

dojo.hostenv.loadModule("dojo.webui.DomWidget");

dojo.webui.widgets.MenuItem = function(){
	dojo.webui.Widget.call(this);
	this.widgetType = "MenuItem";
	
	this.isContainer = false;
}
dj_inherits(dojo.webui.widgets.MenuItem, dojo.webui.Widget);


// FIXME: own file? Mixin instead?
dojo.webui.widgets.DomMenuItem = function(){
	dojo.webui.widgets.MenuItem.call(this);
//	dojo.webui.widgets.Menu.call(this);
	dojo.webui.DomWidget.call(this, true);
}
dj_inherits(dojo.webui.widgets.DomMenuItem, dojo.webui.widgets.MenuItem);

dojo.webui.widgets.tags.addParseTreeHandler("dojo:menuitem");
