dojo.hostenv.startPackage("dojo.webui.widgets.RightClickMenu");

dojo.hostenv.loadModule("dojo.webui.DomWidget");

dojo.webui.widgets.RightClickMenu = function(){
	dojo.webui.Widget.call(this);
	this.widgetType = "RightClickMenu";
}
dj_inherits(dojo.webui.widgets.RightClickMenu, dojo.webui.Widget);

// FIXME: own file? Mixin instead?
dojo.webui.widgets.DomRightClickMenu = function(){
	dojo.webui.widgets.RightClickMenu.call(this);
	dojo.webui.DomWidget.call(this, true);
}
dj_inherits(dojo.webui.widgets.DomRightClickMenu, dojo.webui.widgets.RightClickMenu);

// we shouldn't be declaratively creating right-click menus in markup, although
// one should be able to declare a right-click menu as a propset in a widget
// declaration...
/*
dojo.webui.widgets.tags["dojo:rightClickMenu"] = function(fragment, widgetParser){
	dojo.webui.widgets.buildWidgetFromParseTree("dojo:rightClickMenu", fragment, widgetParser);
}
*/

// ...instead, we need to install a global right-click handler here.
