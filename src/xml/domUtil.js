dojo.hostenv.startPackage("dojo.xml.domUtil");

// for loading script:
dojo.xml.domUtil = new function(){
	var _this = this;

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
	
	this.getTagName = function(node){
		var tagName = node.tagName;
		if(tagName.substr(0,5).toLowerCase()!="dojo:"){
			
			if(tagName.substr(0,4).toLowerCase()=="dojo"){
				// FIXME: this assuumes tag names are always lower case
				return "dojo:" + tagName.substring(4).toLowerCase();
			}

			var djt = node.getAttribute("dojoType");
			if(djt){
				return "dojo:"+djt.toLowerCase();
			}
			
			if((node.getAttributeNS)&&(node.getAttributeNS(this.dojoml,"type"))){
				return "dojo:" + node.getAttributeNS(this.dojoml,"type").toLowerCase();
			}
			try{
				// FIXME: IE really really doesn't like this, so we squelch
				// errors for it
				djt = node.getAttribute("dojo:type");
			}catch(e){ /* FIXME: log? */ }
			if(djt){
				return "dojo:"+djt.toLowerCase();
			}
		}
		return tagName.toLowerCase();
	}

	this.getStyle = function(node, cssSelector) {
		var value = undefined, camelCased = _this.toCamelCase(cssSelector);
		value = node.style[camelCased]; // dom-ish
		if(!value) {
			if(document.defaultView) { // gecko
				value = document.defaultView.getComputedStyle(node, "").getPropertyValue(cssSelector);
			} else if(node.currentStyle) { // ie
				value = node.currentStyle[camelCased];
			} else if(node.style.getPropertyValue) { // dom spec
				value = node.style.getPropertyValue(cssSelector);
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

	// get RGB array from css-style color declarations
	this.extractRGB = function(color) {
		var hex = "0123456789abcdef";
		color = color.toLowerCase();
		if( color.indexOf("rgb") == 0 ) {
			var matches = color.match(/rgb\((\d+), *(\d+), *(\d+)\)/i);
			return matches.splice(1, 3);
		} else if( color.indexOf("#") == 0 ) {
			var colors = [];
			color = color.substring(1);
			if( color.length == 3 ) {
				colors[0] = color.charAt(0) + color.charAt(0);
				colors[1] = color.charAt(1) + color.charAt(1);
				colors[2] = color.charAt(2) + color.charAt(2);
			} else {
				colors[0] = color.substring(0, 2);
				colors[1] = color.substring(2, 4);
				colors[2] = color.substring(4, 6);
			}

			for(var i = 0; i < colors.length; i++) {
				var c = colors[i];
				colors[i] = hex.indexOf(c.charAt(0))*16 + hex.indexOf(c.charAt(1));
			}
			return colors;
		} else {
			// named color (how many do we support?)
			switch(color) {
				case "white": return [255,255,255];
				case "black": return [0,0,0];
				case "red": return[255,0,0];
				case "green": return [0,255,0];
				case "blue": return [0,0,255];
				case "navy": return [0,0,128];
				case "gray": return [128,128,128];
				case "silver": return [192,192,192];
			}
		}
	}
}
