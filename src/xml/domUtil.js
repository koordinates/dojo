dojo.hostenv.startPackage("dojo.xml.domUtil");
dojo.hostenv.loadModule("dojo.graphics.color");

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
	this.idIncrement = 0;
	
	this.getTagName = function(node){
		var tagName = node.tagName;
		if(tagName.substr(0,5).toLowerCase()!="dojo:"){
			
			if(tagName.substr(0,4).toLowerCase()=="dojo"){
				// FIXME: this assuumes tag names are always lower case
				return "dojo:" + tagName.substring(4).toLowerCase();
			}

			// allow lower-casing
			var djt = node.getAttribute("dojoType")||node.getAttribute("dojotype");
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

			if((!dj_global["djConfig"])||(!djConfig["ignoreClassNames"])){
				// FIXME: should we make this optionally enabled via djConfig?
				var classes = node.getAttribute("class");
				if((classes)&&(classes.indexOf("dojo-") != -1)){
					classes = classes.split(" ");
					for(var x=0; x<classes.length; x++){
						if((classes[x].length>5)&&(classes[x].indexOf("dojo-"))){
							return "dojo:"+classes[x].substr(5);
						}
					}
				}
			}

		}
		return tagName.toLowerCase();
	}

	this.getUniqueId = function(){
		var base = "dj_unique_";
		this.idIncrement++;
		while(document.getElementById(base+this.idIncrement)){
			this.idIncrement++;
		}
		return base+this.idIncrement;
	}

	this.getFirstChildTag = function(parentNode) {
		var node = parentNode.firstChild;
		while(node && node.nodeType != 1) {
			node = node.nextSibling;
		}
		return node;
	}

	this.getLastChildTag = function(parentNode) {
		if(!node) { return null; }
		var node = parentNode.lastChild;
		while(node && node.nodeType != 1) {
			node = node.previousSibling;
		}
		return node;
	}

	this.getNextSiblingTag = function(node) {
		if(!node) { return null; }
		do {
			node = node.nextSibling;
		} while(node && node.nodeType != 1);
		return node;
	}

	this.getPreviousSiblingTag = function(node) {
		if(!node) { return null; }
		do {
			node = node.previousSibling;
		} while(node && node.nodeType != 1);
		return node;
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

	this.getAncestors = function(node){
		var ancestors = [];
		while(node){
			ancestors.push(node);
			node = node.parentNode;
		}
		return ancestors;
	}

	this.isChildOf = function(node, ancestor) {
		while(node) {
			if(node == ancestor) {
				return true;
			}
			node = node.parentNode;
		}
		return false;
	}

	// FIXME: this won't work in Safari
	this.createDocumentFromText = function(str, mimetype) {
		if(!mimetype) { mimetype = "text/xml"; }
		if(typeof DOMParser != "undefined") {
			var parser = new DOMParser();
			return parser.parseFromString(str, mimetype);
		}else if(typeof ActiveXObject != "undefined"){
			var domDoc = new ActiveXObject("Microsoft.XMLDOM");
			if(domDoc) {
				domDoc.async = false;
				domDoc.loadXML(str);
				return domDoc;
			}else{
				dj_debug("toXml didn't work?");
			}
		/*
		}else if((dojo.render.html.capable)&&(dojo.render.html.safari)){
			// FIXME: this doesn't appear to work!
			// from: http://web-graphics.com/mtarchive/001606.php
			// var xml = '<?xml version="1.0"?>'+str;
			var mtype = "text/xml";
			var xml = '<?xml version="1.0"?>'+str;
			var url = "data:"+mtype+";charset=utf-8,"+encodeURIComponent(xml);
			var req = new XMLHttpRequest();
			req.open("GET", url, false);
			req.overrideMimeType(mtype);
			req.send(null);
			return req.responseXML;
		*/
		}else if(document.createElement){
			// FIXME: this may change all tags to uppercase!
			var tmp = document.createElement("xml");
			tmp.innerHTML = str;
			if(document.implementation && document.implementation.createDocument) {
				var xmlDoc = document.implementation.createDocument("foo", "", null);
				for(var i = 0; i < tmp.childNodes.length; i++) {
					xmlDoc.importNode(tmp.childNodes.item(i), true);
				}
				return xmlDoc;
			}
			// FIXME: probably not a good idea to have to return an HTML fragment
			// FIXME: the tmp.doc.firstChild is as tested from IE, so it may not
			// work that way across the board
			return tmp.document && tmp.document.firstChild ?
				tmp.document.firstChild : tmp;
		}
		return null;
	}

	// FIXME: how do we account for mixed environments?
	if(dojo.render.html.capable) {
		this.createNodesFromText = function(txt, wrap){
			var tn = document.createElement("span");
			// tn.style.display = "none";
			tn.style.visibility= "hidden";
			document.body.appendChild(tn);
			tn.innerHTML = txt;
			tn.normalize();
			if(wrap){ 
				var ret = [];
				// start hack
				var fc = tn.firstChild;
				ret[0] = ((fc.nodeValue == " ")||(fc.nodeValue == "\t")) ? fc.nextSibling : fc;
				// end hack
				// tn.style.display = "none";
				document.body.removeChild(tn);
				return ret;
			}
			var nodes = [];
			for(var x=0; x<tn.childNodes.length; x++){
				nodes.push(tn.childNodes[x].cloneNode(true));
			}
			tn.style.display = "none";
			document.body.removeChild(tn);
			return nodes;
		}
	}else if(dojo.render.svg.capable){
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
	}

	// referenced for backwards compatibility
	this.extractRGB = dojo.graphics.color.extractRGB;
	this.hex2rgb = dojo.graphics.color.hex2rgb;
	this.rgb2hex = dojo.graphics.color.rgb2hex;

	this.insertBefore = function(node, ref){
		var pn = ref.parentNode;
		pn.insertBefore(node, ref);
	}

	this.before = this.insertBefore;

	this.insertAfter = function(node, ref){
		var pn = ref.parentNode;
		if(ref == pn.lastChild){
			pn.appendChild(node);
		}else{
			pn.insertBefore(node, ref.nextSibling);
		}
	}

	this.after = this.insertAfter;
}
