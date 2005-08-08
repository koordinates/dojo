dojo.provide("dojo.webui.widgets.HTMLButton");
dojo.require("dojo.webui.*");
dojo.require("dojo.webui.widgets.Button");

dojo.webui.widgets.HTMLButton = function(){
	// mix in the button properties
	dojo.webui.widgets.Button.call(this);
	// inherit from the HTMLWidget base class (this is a minimal mixin which might not be required in the future)
	dojo.webui.HtmlWidget.call(this);

	this.templatePath = dojo.uri.dojoUri("src/webui/widgets/templates/HTMLButtonTemplate.html");
	this.templateCssPath = dojo.uri.dojoUri("src/webui/widgets/templates/HTMLButtonTemplate.css");

	// FIXME: freaking implement this already!
	this.foo = function(){ alert("bar"); }

	this.label = "huzzah!";
	this.labelNode = null;

	this.setLabel = function(){
		this.labelNode.innerHTML = this.label;
		// this.domNode.label = this.label;
	}

	this.fillInTemplate = function(){
		this.setLabel();
	}

	this.onFoo = function(){ }
}

/*
new function(){ // namespace protection closure
	var hbp = dojo.webui.widgets.HTMLButton.prototype;
	hbp.templateString = ["<button />"].join("");
}; // FIXME: why isnt the (function(){})(); syntax working here??
*/

dj_inherits(dojo.webui.widgets.HTMLButton, dojo.webui.HtmlWidget);
// dojo.webui.widgets.HTMLButton.prototype = new dojo.webui.DomWidget();

// dojo.webui.widgets.HTMLButton.prototype.templateString = "<button class='dojoButton' dojoAttachEvent='onClick; onMouseMove: onFoo;' dojoAttachPoint='labelNode'></button>";
