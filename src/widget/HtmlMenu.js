dojo.provide("dojo.widget.HtmlMenu");
dojo.require("dojo.widget.Manager");
dojo.require("dojo.widget.Menu");

// FIXME: why doesn't this actually do anything?
dojo.widget.HrmlMenu = function(){
	dojo.widget.DomMenu.call(this);
	dojo.widget.HtmlWidget.call(this);

	this.templatePath = dojo.uri.dojoUri("src/widget/templates/HtmlMenuTemplate.html");
	this.templateCssPath = dojo.uri.dojoUri("src/widget/templates/HtmlMenuTemplate.css");
}

dj_inherits(dojo.widget.HtmlMenu, dojo.widget.HtmlWidget);

// dojo.webui.widgets.HTMLMenu.prototype.templateString = "<button class='dojoButton' dojoAttachEvent='onClick; onMouseMove: onFoo;' dojoAttachPoint='labelNode'></button>";
