dojo.provide("dojo.xml.domUtil");
dojo.require("dojo.graphics.color");
dojo.require("dojo.dom");

dj_deprecated("dojo.xml.domUtil is deprecated, use dojo.dom instead");

// for loading script:
dojo.xml.domUtil = new function(){
	this.nodeTypes = {
		ELEMENT_NODE                  : 1,
		ATTRIBUTE_NODE                : 2,
		TEXT_NODE                     : 3,
		CDATA_SECTION_NODE            : 4,
		ENTITY_REFERENCE_NODE         : 5,
		ENTITY_NODE                   : 6,
		PROCESSING_INSTRUCTION_NODE   : 7,
		COMMENT_NODE                  : 8,
		DOCUMENT_NODE                 : 9,
		DOCUMENT_TYPE_NODE            : 10,
		DOCUMENT_FRAGMENT_NODE        : 11,
		NOTATION_NODE                 : 12
	}
	
	this.dojoml = "http://www.dojotoolkit.org/2004/dojoml";
	this.idIncrement = 0;
	
	this.getTagName = function(){dojo.dom.getTagName.apply(dojo.dom, arguments);}
	this.getUniqueId = function(){dojo.dom.getUniqueId.apply(dojo.dom, arguments);}
	this.getFirstChildTag = function() {dojo.dom.getFirstChildElement.apply(dojo.dom, arguments);}
	this.getLastChildTag = function() {dojo.dom.getLastChildElement.apply(dojo.dom, arguments);}
	this.getNextSiblingTag = function() {dojo.dom.getNextSiblingElement.apply(dojo.dom, arguments);}
	this.getPreviousSiblingTag = function() {dojo.dom.getPreviousSiblingElement.apply(dojo.dom, arguments);}

	this.forEachChildTag = function(node, unaryFunc) {
		var child = this.getFirstChildTag(node);
		while(child) {
			if(unaryFunc(child) == "break") { break; }
			child = this.getNextSiblingTag(child);
		}
	}

	this.moveChildren = function() {dojo.dom.moveChildren.apply(dojo.dom, arguments);}
	this.copyChildren = function() {dojo.dom.copyChildren.apply(dojo.dom, arguments);}
	this.clearChildren = function() {dojo.dom.removeChildren.apply(dojo.dom, arguments);}
	this.replaceChildren = function() {dojo.dom.replaceChildren.apply(dojo.dom, arguments);}

	this.getStyle = function(element, cssSelector) {
		var value = undefined, camelCased = dojo.xml.domUtil.toCamelCase(cssSelector);
		value = element.style[camelCased]; // dom-ish
		if(!value) {
			if(document.defaultView) { // gecko
				value = document.defaultView.getComputedStyle(element, "")
					.getPropertyValue(cssSelector);
			} else if(element.currentStyle) { // ie
				value = element.currentStyle[camelCased];
			} else if(element.style.getPropertyValue) { // dom spec
				value = element.style.getPropertyValue(cssSelector);
			}
		}
		return value;
	}

	this.toCamelCase = function(selector) {
		var arr = selector.split('-'), cc = arr[0];
		for(var i = 1; i < arr.length; i++) {
			cc += arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
		}
		return cc;		
	}

	this.toSelectorCase = function(selector) {
		return selector.replace(/([A-Z])/g, "-$1" ).toLowerCase() ;
	}

	this.getAncestors = function(){dojo.dom.getAncestors.apply(dojo.dom, arguments);}
	this.isChildOf = function() {dojo.dom.isDescendantOf.apply(dojo.dom, arguments);}
	this.createDocumentFromText = function() {dojo.dom.createDocumentFromText.apply(dojo.dom, arguments);}

	if(dojo.render.html.capable || dojo.render.svg.capable) {
		this.createNodesFromText = function(txt, wrap){dojo.dom.createsNodesFromText.apply(dojo.dom, arguments);}
	}

	this.extractRGB = function(color) { return dojo.graphics.color.extractRGB(color); }
	this.hex2rgb = function(hex) { return dojo.graphics.color.hex2rgb(hex); }
	this.rgb2hex = function(r, g, b) { return dojo.graphics.color.rgb2hex(r, g, b); }

	this.insertBefore = function() {dojo.dom.insertBefore.apply(dojo.dom, arguments);}
	this.before = this.insertBefore;
	this.insertAfter = function() {dojo.dom.insertAfter.apply(dojo.dom, arguments);}
	this.after = this.insertAfter
	this.insert = function(){dojo.dom.insertAtPosition.apply(dojo.dom, arguments);}
	this.insertAtIndex = function(){dojo.dom.insertAtIndex.apply(dojo.dom, arguments);}
	this.textContent = function () {dojo.dom.textContent.apply(dojo.dom, arguments);}
	this.renderedTextContent = function () {dojo.dom.renderedTextContent.apply(dojo.dom, arguments);}
	this.remove = function (node) {dojo.dom.removeNode.apply(dojo.dom, arguments);}
}

