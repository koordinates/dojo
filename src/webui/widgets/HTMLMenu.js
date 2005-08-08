dojo.provide("dojo.webui.widgets.HTMLMenu");
dojo.require("dojo.webui.*");
dojo.require("dojo.webui.widgets.Menu");

// FIXME: why doesn't this actually do anything?
dojo.webui.widgets.HTMLMenu = function(){
	dojo.webui.widgets.DomMenu.call(this);
	dojo.webui.HtmlWidget.call(this);

	this.templatePath = dojo.uri.dojoUri("src/webui/widgets/templates/HTMLMenuTemplate.html");
	this.templateCssPath = dojo.uri.dojoUri("src/webui/widgets/templates/HTMLMenuTemplate.css");
}

dj_inherits(dojo.webui.widgets.HTMLMenu, dojo.webui.HtmlWidget);

// dojo.webui.widgets.HTMLMenu.prototype.templateString = "<button class='dojoButton' dojoAttachEvent='onClick; onMouseMove: onFoo;' dojoAttachPoint='labelNode'></button>";
