dojo.provide("dojo.widget.HtmlMenuItem");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.MenuItem");

dojo.widget.HtmlMenuItem = function(){
	dojo.widget.DomMenuItem.call(this);
	dojo.widget.HtmlWidget.call(this);

	this.templatePath = dojo.uri.dojoUri("src/widget/templates/HtmlMenuItemTemplate.html");
	// this.templateCssPath = "src/widget/templates/HtmlMenuItemTemplate.css";

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
	var hbp = dojo.widget.HTMLMenuItem.prototype;
	hbp.templateString = ["<button />"].join("");
}; // FIXME: why isnt the (function(){})(); syntax working here??
*/

dj_inherits(dojo.widget.HtmlMenuItem, dojo.widget.HtmlWidget);

// dojo.widget.HTMLMenuItem.prototype.templateString = "<button class='dojoButton' dojoAttachEvent='onClick; onMouseMove: onFoo;' dojoAttachPoint='labelNode'></button>";
