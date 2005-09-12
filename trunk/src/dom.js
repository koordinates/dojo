dojo.provide("dojo.dom");
//dojo.require("dojo.graphics.color");
dojo.require("dojo.text.String");

dojo.dom.ELEMENT_NODE                  = 1;
dojo.dom.ATTRIBUTE_NODE                = 2;
dojo.dom.TEXT_NODE                     = 3;
dojo.dom.CDATA_SECTION_NODE            = 4;
dojo.dom.ENTITY_REFERENCE_NODE         = 5;
dojo.dom.ENTITY_NODE                   = 6;
dojo.dom.PROCESSING_INSTRUCTION_NODE   = 7;
dojo.dom.COMMENT_NODE                  = 8;
dojo.dom.DOCUMENT_NODE                 = 9;
dojo.dom.DOCUMENT_TYPE_NODE            = 10;
dojo.dom.DOCUMENT_FRAGMENT_NODE        = 11;
dojo.dom.NOTATION_NODE                 = 12;
	
dojo.dom.dojoml = "http://www.dojotoolkit.org/2004/dojoml";
	
dojo.dom.getTagName = function (node){
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
			var classes = node.className||node.getAttribute("class");
			if((classes)&&(classes.indexOf("dojo-") != -1)){
				var aclasses = classes.split(" ");
				for(var x=0; x<aclasses.length; x++){
					if((aclasses[x].length>5)&&(aclasses[x].indexOf("dojo-")>=0)){
						return "dojo:"+aclasses[x].substr(5);
					}
				}
			}
		}

	}
	return tagName.toLowerCase();
}

dojo.dom.getUniqueId = function (){
	do {
		var id = "dj_unique_" + ++arguments.callee._idIncrement;
	} while(document.getElementById(id));
	return id;
}
dojo.dom.getUniqueId._idIncrement = 0;

dojo.dom.getFirstChildElement = function (parentNode) {
	var node = parentNode.firstChild;
	while(node && node.nodeType != dojo.dom.ELEMENT_NODE) {
		node = node.nextSibling;
	}
	return node;
}

dojo.dom.getLastChildElement = function (parentNode) {
	var node = parentNode.lastChild;
	while(node && node.nodeType != dojo.dom.ELEMENT_NODE) {
		node = node.previousSibling;
	}
	return node;
}

dojo.dom.getNextSiblingElement = function (node) {
	if(!node) { return null; }
	do {
		node = node.nextSibling;
	} while(node && node.nodeType != dojo.dom.ELEMENT_NODE);
	return node;
}

dojo.dom.getPreviousSiblingElement = function (node) {
	if(!node) { return null; }
	do {
		node = node.previousSibling;
	} while(node && node.nodeType != dojo.dom.ELEMENT_NODE);
	return node;
}

// TODO: hmph
/*this.forEachChildTag = function(node, unaryFunc) {
	var child = this.getFirstChildTag(node);
	while(child) {
		if(unaryFunc(child) == "break") { break; }
		child = this.getNextSiblingTag(child);
	}
}*/

dojo.dom.moveChildren = function (srcNode, destNode, trim) {
	var count = 0;
	if(trim) {
		while(srcNode.hasChildNodes() &&
			srcNode.firstChild.nodeType == dojo.dom.TEXT_NODE) {
			srcNode.removeChild(srcNode.firstChild);
		}
		while(srcNode.hasChildNodes() &&
			srcNode.lastChild.nodeType == dojo.dom.TEXT_NODE) {
			srcNode.removeChild(srcNode.lastChild);
		}
	}
	while(srcNode.hasChildNodes()) {
		destNode.appendChild(srcNode.firstChild);
		count++;
	}
	return count;
}

dojo.dom.copyChildren = function (srcNode, destNode, trim) {
	var clonedNode = srcNode.cloneNode(true);
	return this.moveChildren(clonedNode, destNode, trim);
}

dojo.dom.removeChildren = function (node) {
	var count = node.childNodes.length;
	while(node.hasChildNodes()) { node.removeChild(node.firstChild); }
	return count;
}

dojo.dom.replaceChildren = function (node, newChild) {
	dojo.dom.removeChildren(node);
	node.appendChild(newChild);
}

dojo.dom.removeNode = function (node) {
	if (node && node.parentNode) { node.parentNode.removeChild(node); }
}

dojo.dom.getAncestors = function (node){
	var ancestors = [];
	while(node){
		ancestors.push(node);
		node = node.parentNode;
	}
	return ancestors;
}

dojo.dom.isDescendantOf = function (node, ancestor, noSame) {
	if(noSame && node) { node = node.parentNode; }
	while(node) {
		if(node == ancestor) { return true; }
		node = node.parentNode;
	}
	return false;
}

// FIXME: this won't work in Safari
dojo.dom.createDocumentFromText = function (str, mimetype) {
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
	dojo.dom.createNodesFromText = function (txt, wrap){
		var tn = document.createElement("div");
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
	dojo.dom.createNodesFromText = function (txt, wrap){
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
//this.extractRGB = function(color) { return dojo.graphics.color.extractRGB(color); }
//this.hex2rgb = function(hex) { return dojo.graphics.color.hex2rgb(hex); }
//this.rgb2hex = function(r, g, b) { return dojo.graphics.color.rgb2hex(r, g, b); }

dojo.dom.insertBefore = function (node, ref, force) {
	if (force != true &&
		(node === ref || node.nextSibling === ref)) { return false; }
	var pn = ref.parentNode;
	pn.insertBefore(node, ref);
	return true;
}

dojo.dom.insertAfter = function (node, ref, force) {
	var pn = ref.parentNode;
	if(ref == pn.lastChild){
		if (force != true  && node === ref) { return false; }
		pn.appendChild(node);
	}else{
		return this.insertBefore(node, ref.nextSibling, force);
	}
	return true;
}

dojo.dom.insertAtPosition = function (node, ref, position){
	switch(position.toLowerCase()){
		case "before":
			dojo.dom.insertBefore(node, ref);
			break;
		case "after":
			dojo.dom.insertAfter(node, ref);
			break;
		case "first":
			if(ref.firstChild){
				dojo.dom.insertBefore(node, ref.firstChild);
			}else{
				ref.appendChild(node);
			}
			break;
		default: // aka: last
			ref.appendChild(node);
			break;
	}
}

dojo.dom.insertAtIndex = function (node, ref, insertionIndex){
	var pn = ref.parentNode;
	var siblingNodes = pn.childNodes;
	var placed = false;
	for(var i=0; i<siblingNodes.length; i++) {
		if(	(siblingNodes.item(i)["getAttribute"])&&
			(parseInt(siblingNodes.item(i).getAttribute("dojoinsertionindex")) > insertionIndex)){
			dojo.dom.insertBefore(node, siblingNodes.item(i));
			placed = true;
			break;
		}
	}
	if(!placed){
		dojo.dom.insertBefore(node, ref);
	}
}
	
/**
 * implementation of the DOM Level 3 attribute.
 * 
 * @param node The node to scan for text
 * @param text Optional, set the text to this value.
 */
dojo.dom.textContent = function (node, text) {
	if (text) {
		dojo.dom.replaceChildren(node, document.createTextNode(text));
		return text;
	} else {
		var _result = "";
		if (node == null) { return _result; }
		for (var i = 0; i < node.childNodes.length; i++) {
			switch (node.childNodes[i].nodeType) {
				case 1: // ELEMENT_NODE
				case 5: // ENTITY_REFERENCE_NODE
					_result += dojo.dom.textContent(node.childNodes[i]);
					break;
				case 3: // TEXT_NODE
				case 2: // ATTRIBUTE_NODE
				case 4: // CDATA_SECTION_NODE
					_result += node.childNodes[i].nodeValue;
					break;
				default:
					break;
			}
		}
		return _result;
	}
}
