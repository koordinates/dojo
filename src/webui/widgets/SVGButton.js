// FIXME: not yet functional

dojo.hostenv.startPackage("dojo.webui.widgets.SVGButton");

dojo.hostenv.loadModule("dojo.webui.widgets.Button");

dojo.webui.widgets.SVGButton = function(){
	// FIXME: this is incomplete and doesn't work yet
	// if DOMButton turns into a mixin, we should subclass Button instead and
	// just mix in the DOMButton properties.
	dojo.webui.widgets.DomButton.call(this);
	dojo.webui.SVGWidget.call(this);

	// FIXME: HACK! imported directly from SVGWidget, not sure why this is required!
	this.createNodesFromText = function(txt, wrap){
		// from http://wiki.svg.org/index.php/ParseXml
		var docFrag = parseXML(txt, window.document);
		docFrag.normalize();
		if(wrap){ 
			var ret = [docFrag.firstChild.cloneNode(true)];
			return ret;
		}
		var nodes = [];
		for(var x=0; x<docFrag.childNodes.length; x++){
			nodes.push(docFrag.childNodes.item(x).cloneNode(true));
		}
		// tn.style.display = "none";
		return nodes;
	}

	this.onClick = function(){ alert("clicked!"); }

	// FIXME: freaking implement this already!
	this.onFoo = function(){ alert("bar"); }

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
