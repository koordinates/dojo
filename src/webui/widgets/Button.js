dojo.hostenv.startPackage("dojo.webui.widgets.Button");

dojo.hostenv.loadModule("dojo.webui.DomWidget");

dojo.webui.widgets.Button = function(){
	dojo.webui.Widget.call(this);

	this.widgetType = "Button";

	this.onClick = function(){ return; }
}
dj_inherits(dojo.webui.widgets.Button, dojo.webui.Widget);

// FIXME: own file? Mixin instead?
dojo.webui.widgets.DomButton = function(){
	dojo.webui.widgets.Button.call(this);
	dojo.webui.DomWidget.call(this, true);
}
dj_inherits(dojo.webui.widgets.DomButton, dojo.webui.widgets.Button);

dojo.webui.widgets.tags["dojo:button"] = function(fragment, widgetParser){
	dojo.webui.widgets.buildWidgetFromParseTree("dojo:button", fragment, widgetParser);
}
