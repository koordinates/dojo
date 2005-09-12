dojo.provide("dojo.style");
dojo.require("dojo.dom");
dojo.require("dojo.uri.Uri");
dojo.require("dojo.graphics.color");


dojo.style.boxSizing = (document["compatMode"] &&
	(document["compatMode"] == "BackCompat" ||
	document["compatMode"] == "QuirksMode")) ? true : false;

dojo.style.getInnerWidth = function getInnerWidth (node){
	return node.offsetWidth;
}

/*this.getOuterWidth = function(node){
	dj_unimplemented("dojo.xml.htmlUtil.getOuterWidth");
}*/

dojo.style.getInnerHeight = function getInnerHeight (node){
	return node.offsetHeight; // FIXME: does this work?
}

/*this.getOuterHeight = function(node){
	dj_unimplemented("dojo.xml.htmlUtil.getOuterHeight");
}*/

dojo.style.getTotalOffset = function getTotalOffset (node, type){
	var typeStr = (type=="top") ? "offsetTop" : "offsetLeft";
	var alt = (type=="top") ? "y" : "x";
	var ret = 0;
	if(node["offsetParent"]){
		// FIXME: this is known not to work sometimes on IE 5.x since nodes
		// soemtimes need to be "tickled" before they will display their
		// offset correctly
		
		do {
			ret += node[typeStr];
			node = node.offsetParent;
		} while (node != document.body.parentNode && node != null);
		
	}else if(node[alt]){
		ret += node[alt];
	}
	return ret;
}

dojo.style.totalOffsetLeft = function totalOffsetLeft (node){
	return dojo.style.getTotalOffset(node, "left");
}

dojo.style.getAbsoluteX = dojo.style.totalOffsetLeft;

dojo.style.totalOffsetTop = function totalOffsetTop (node){
	return dojo.style.getTotalOffset(node, "top");
}

dojo.style.getAbsoluteY = dojo.style.totalOffsetTop;


dojo.style.styleSheet = null;

// FIXME: this is a really basic stub for adding and removing cssRules, but
// it assumes that you know the index of the cssRule that you want to add 
// or remove, making it less than useful.  So we need something that can 
// search for the selector that you you want to remove.
dojo.style.insertCssRule = function insertCssRule (selector, declaration, index){
	if(dojo.render.html.ie){
		if(!dojo.style.styleSheet){
			// FIXME: create a new style sheet document
		}
		if(!index){
			index = dojo.style.styleSheet.rules.length;
		}
		return dojo.style.styleSheet.addRule(selector, declaration, index);
	}else if(document.styleSheets[0] && document.styleSheets[0].insertRule){
		if(!dojo.style.styleSheet){
			// FIXME: create a new style sheet document here
		}
		if(!index){
			index = dojo.style.styleSheet.cssRules.length;
		}
		var rule = selector + "{" + declaration + "}"
		return dojo.style.styleSheet.insertRule(rule, index);
	}
}

dojo.style.removeCssRule = function removeCssRule (index){
	if(!dojo.style.styleSheet){
		dj_debug("no stylesheet defined for removing rules");
		return false;
	}
	if(dojo.render.html.ie){
		if(!index){
			index = dojo.style.styleSheet.rules.length;
			dojo.style.styleSheet.removeRule(index);
		}
	}else if(document.styleSheets[0]){
		if(!index){
			index = dojo.style.styleSheet.cssRules.length;
		}
		dojo.style.styleSheet.deleteRule(index);
	}
	return true;
}

dojo.style.insertCssFile = function insertCssFile (URI, doc, checkDuplicates){
	if(!URI) { return; }
	if(!doc){ doc = document; }
	// Safari doesn't have this property, but it doesn't support
	// styleSheets.href either so it beomces moot
	if(doc.baseURI) { URI = new dojo.uri.Uri(doc.baseURI, URI); }
	if(checkDuplicates && doc.styleSheets){
		// get the host + port info from location
		var loc = location.href.split("#")[0].substring(0, location.href.indexOf(location.pathname));
		for(var i = 0; i < doc.styleSheets.length; i++){
			if(doc.styleSheets[i].href && URI.toString() ==
				new dojo.uri.Uri(doc.styleSheets[i].href.toString())) { return; }
		}
	}
	var file = doc.createElement("link");
	file.setAttribute("type", "text/css");
	file.setAttribute("rel", "stylesheet");
	file.setAttribute("href", URI);
	var head = doc.getElementsByTagName("head")[0];
	head.appendChild(file);
}

dojo.style.getBackgroundColor = function getBackgroundColor (node) {
	var color;
	do{
		color = dojo.style.getStyle(node, "background-color");
		// Safari doesn't say "transparent"
		if(color.toLowerCase() == "rgba(0, 0, 0, 0)") { color = "transparent"; }
		if(node == document.body) { node = null; break; }
		node = node.parentNode;
	}while(node && color == "transparent");

	if( color == "transparent" ) {
		color = [255, 255, 255, 0];
	} else {
		color = dojo.graphics.color.extractRGB(color);
	}
	return color;
}

dojo.style.getStyle = function getStyle (element, cssSelector) {
	var value = undefined, camelCased = dojo.style.toCamelCase(cssSelector);
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

dojo.style.toCamelCase = function toCamelCase (selector) {
	var arr = selector.split('-'), cc = arr[0];
	for(var i = 1; i < arr.length; i++) {
		cc += arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
	}
	return cc;		
}

dojo.style.toSelectorCase = function toSelectorCase (selector) {
	return selector.replace(/([A-Z])/g, "-$1" ).toLowerCase() ;
}
