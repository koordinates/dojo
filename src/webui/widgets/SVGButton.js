dojo.hostenv.startPackage("dojo.webui.widgets.SVGButton");

dojo.hostenv.loadModule("dojo.webui.widgets.Button");

dojo.webui.widgets.SVGButton = function(){
	// FIXME: this is incomplete and doesn't work yet
	// if DOMButton turns into a mixin, we should subclass Button instead and
	// just mix in the DOMButton properties.
	dojo.webui.widgets.DomButton.call(this);
	dojo.webui.SVGWidget.call(this);

	// FIXME: freaking implement this already!
	this.foo = function(){ alert("bar"); }

	this.label = "huzzah!";

	this.setLabel = function(){
		// FIXME: convert to svg
		this.domNode.innerHTML = this.label;
		this.domNode.label = this.label;
	}

	this.fillInTemplate = function(){
		// alert("fillInTemplate");
		this.setLabel();
	}
}

/*
new function(){ // namespace protection closure
	var hbp = dojo.webui.widgets.SVGButton.prototype;
		// FIXME: convert to svg
	hbp.templateString = ["<button />"].join("");
}; // FIXME: why isnt the (function(){})(); syntax working here??
*/

dj_inherits(dojo.webui.widgets.SVGButton, dojo.webui.widgets.DomButton);

// FIXME: convert to svg
dojo.webui.widgets.SVGButton.prototype.templateString = "<button class='dojoButton' dojoAttachEvent='onClick'></button>";
