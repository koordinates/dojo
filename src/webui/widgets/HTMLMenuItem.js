dojo.provide("dojo.webui.widgets.HTMLMenuItem");
dojo.require("dojo.webui.HtmlWidget");
dojo.require("dojo.webui.widgets.MenuItem");

dojo.webui.widgets.HTMLMenuItem = function(){
	// if DOMButton turns into a mixin, we should subclass Button instead and
	// just mix in the DOMButton properties.
	dojo.webui.widgets.DomMenuItem.call(this);
	dojo.webui.HtmlWidget.call(this);

	this.templatePath = dojo.uri.dojoUri("src/webui/widgets/templates/HTMLMenuItemTemplate.html");
	// this.templateCssPath = "src/webui/widgets/templates/HTMLMenuItemTemplate.css";

	this.label = "";
	this.labelNode = null;
	this.iconNode = null;
	this.onClick = function(){ }
	this.keystrokeNode = null;
	this.subMenuNode = null;

	this.setLabel = function(){
		this.labelNode.innerHTML = this.label;
	}

	this.fillInTemplate = function(){
		this.setLabel();
	}

	this.onHide = function(){
		// FIXME: use whatever we use to do more general style setting?
		this.domNode.style.display = "none";
	}
}

/*
new function(){ // namespace protection closure
	var hbp = dojo.webui.widgets.HTMLMenuItem.prototype;
	hbp.templateString = ["<button />"].join("");
}; // FIXME: why isnt the (function(){})(); syntax working here??
*/

dj_inherits(dojo.webui.widgets.HTMLMenuItem, dojo.webui.HtmlWidget);

// dojo.webui.widgets.HTMLMenuItem.prototype.templateString = "<button class='dojoButton' dojoAttachEvent='onClick; onMouseMove: onFoo;' dojoAttachPoint='labelNode'></button>";
