dojo.hostenv.startPackage("dojo.webui.widgets.HTMLContextMenu");

dojo.hostenv.loadModule("dojo.webui.widgets.ContextMenu");

dojo.webui.widgets.HTMLContextMenu = function(){
	// if DOMButton turns into a mixin, we should subclass Button instead and
	// just mix in the DOMButton properties.
	dojo.webui.widgets.DomContextMenu.call(this);
	dojo.webui.HTMLWidget.call(this);

	this.templatePath = "src/webui/widgets/templates/HTMLContextMenuTemplate.html";
	this.templateCSSPath = "src/webui/widgets/templates/HTMLContextMenuTemplate.css";

	/*
	// FIXME: freaking implement this already!
	this.foo = function(){ alert("bar"); }

	this.label = "huzzah!";
	this.labelNode = null;

	this.setLabel = function(){
		this.labelNode.innerHTML = this.label;
		// this.domNode.label = this.label;
	}

	*/
	this.fillInTemplate = function(){
		this.setLabel();
	}

	this.onFoo = function(){}
}

/*
new function(){ // namespace protection closure
	var hbp = dojo.webui.widgets.HTMLContextMenu.prototype;
	hbp.templateString = ["<button />"].join("");
}; // FIXME: why isnt the (function(){})(); syntax working here??
*/

dj_inherits(dojo.webui.widgets.HTMLContextMenu, dojo.webui.widgets.DomContextMenu);

// dojo.webui.widgets.HTMLContextMenu.prototype.templateString = "<button class='dojoButton' dojoAttachEvent='onClick; onMouseMove: onFoo;' dojoAttachPoint='labelNode'></button>";
