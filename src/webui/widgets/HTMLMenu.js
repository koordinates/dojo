dojo.hostenv.startPackage("dojo.webui.widgets.HTMLMenu");

dojo.hostenv.loadModule("dojo.webui.widgets.Menu");

dojo.webui.widgets.HTMLMenu = function(){
	// if DOMButton turns into a mixin, we should subclass Button instead and
	// just mix in the DOMButton properties.
	dojo.webui.widgets.DomMenu.call(this);
	dojo.webui.HTMLWidget.call(this);

	this.templatePath = "src/webui/widgets/templates/HTMLMenuTemplate.html";
	this.templateCSSPath = "src/webui/widgets/templates/HTMLMenuTemplate.css";

	this.fillInTemplate = function(){

	}
	this.onFoo = function(){}
}

dj_inherits(dojo.webui.widgets.HTMLMenu, dojo.webui.widgets.DomMenu);

// dojo.webui.widgets.HTMLMenu.prototype.templateString = "<button class='dojoButton' dojoAttachEvent='onClick; onMouseMove: onFoo;' dojoAttachPoint='labelNode'></button>";
