dojo.hostenv.startPackage("dojo.webui.widgets.HTMLButton");

dojo.hostenv.loadModule("dojo.webui.widgets.Button");

dojo.webui.widgets.HTMLButton = function(){
	// if DOMButton turns into a mixin, we should subclass Button instead and
	// just mix in the DOMButton properties.
	dojo.webui.widgets.DomButton.call(this);
	dojo.webui.HTMLWidget.call(this);

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

	this.onFoo = function(){}
}

/*
new function(){ // namespace protection closure
	var hbp = dojo.webui.widgets.HTMLButton.prototype;
	hbp.templateString = ["<button />"].join("");
}; // FIXME: why isnt the (function(){})(); syntax working here??
*/

dj_inherits(dojo.webui.widgets.HTMLButton, dojo.webui.widgets.DomButton);

dojo.webui.widgets.HTMLButton.prototype.templateString = "<button class='dojoButton' dojoAttachEvent='onClick; onMouseMove: onFoo;' dojoAttachPoint='labelNode'></button>";
