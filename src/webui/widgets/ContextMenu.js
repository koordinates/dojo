dojo.hostenv.startPackage("dojo.webui.widgets.ContextMenu");

dojo.hostenv.loadModule("dojo.webui.DomWidget");

dojo.webui.widgets.ContextMenu = function(){
	dojo.webui.Widget.call(this);
	this.widgetType = "ContextMenu";
	this.isContainer = true;
}
//dj_inherits(dojo.webui.widgets.ContextMenu, dojo.webui.widgets.Menu, dojo.webui.Widget);
dj_inherits(dojo.webui.widgets.ContextMenu, dojo.webui.Widget);


// FIXME: own file? Mixin instead?
dojo.webui.widgets.DomContextMenu = function(){
	dojo.webui.widgets.ContextMenu.call(this);
//	dojo.webui.widgets.Menu.call(this);
	dojo.webui.DomWidget.call(this, true);
}
dj_inherits(dojo.webui.widgets.DomContextMenu, dojo.webui.widgets.ContextMenu);

// we shouldn't be declaratively creating right-click menus in markup, although
// one should be able to declare a right-click menu as a propset in a widget
// declaration...

dojo.webui.widgets.tags["dojo:contextmenu"] = function(fragment, widgetParser){
	dojo.webui.widgets.buildWidgetFromParseTree("dojo:contextmenu", fragment, widgetParser);
}


// ...instead, we need to install a global context menu handler here.
