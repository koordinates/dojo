// FIXME: not yet functional

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
		var labelNode = this.domNode.ownerDocument.createTextNode(this.label);
		var textNode = this.domNode.ownerDocument.createElement("text");
		textNode.setAttribute("x","20");
		textNode.setAttribute("y","20");
		textNode.appendChild(labelNode);
		this.domNode.appendChild(textNode);
	}

	this.fillInTemplate = function(){
		// alert("fillInTemplate");
		this.setLabel();
	}
}

dj_inherits(dojo.webui.widgets.SVGButton, dojo.webui.widgets.DomButton);

// FIXME
dojo.webui.widgets.SVGButton.prototype.shapeString = function(shape) {
	switch(shape) {
		case "ellipse":
			return "<ellipse cx='' cy='' rx='' ry=''/>";
			break;
		case "rectangle":
			return "<rect x='' y='' width='' height=''/>";
			break;
		case "circle":
			return "<circle cx='' cy='' r=''/>";
			break;
	}
}

dojo.webui.widgets.SVGButton.prototype.templateString = "<g class='dojoButton' dojoAttachEvent='onClick; onMouseMove: onFoo;' dojoAttachPoint='labelNode'>"+ dojo.webui.widgets.SVGButton.prototype.shapeString("ellipse") + "</g>";
