dojo.hostenv.startPackage("dojo.webui.widgets.Button");

dojo.hostenv.loadModule("dojo.webui.DomWidget");

dojo.webui.widgets.Button = function(){
	dojo.webui.Widget.call(this);

	this.widgetType = "Button";
}
dj_inherits(dojo.webui.widgets.Button, dojo.webui.Widget);

// FIXME: own file? Mixin instead?
dojo.webui.widgets.DOMButton = function(){
	dojo.webui.widgets.Button.call(this);

}
dj_inherits(dojo.webui.widgets.DOMButton, dojo.webui.widgets.Button);
