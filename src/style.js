dojo.provide("dojo.style");
dojo.require("dojo.dom");
dojo.require("dojo.uri.Uri");
dojo.require("dojo.graphics.color");


// values: content-box, border-box
dojo.style.getBoxSizing = function(node) {
	if(dojo.render.ie) {
		return document["compatMode"] != "BackCompat" ? "border-box" : "content-box";
	} else {
		if(arguments.length == 0) { node = document.documentElement; }
		var sizing = dojo.style.getStyle(node, "-moz-box-sizing")
			|| dojo.style.getStyle(node, "box-sizing");
	}
}

/*

The following couple of function equate to the dimensions shown below

    +-------------------------+
    |  margin                 |
    | +---------------------+ |
    | |  border             | |
    | | +-----------------+ | |
    | | |  padding        | | |
    | | | +-------------+ | | |
    | | | |   content   | | | |
    | | | +-------------+ | | |
    | | +-|-------------|-+ | |
    | +---|-------------|---+ |
    +-|---|-------------|---|-+
    | |   |             |   | |
    | |   |<- content ->|   | |
    | |<------ inner ------>| |
    |<-------- outer -------->|
 
*/

dojo.style.getContentWidth = function (node) {
	// FIXME: clientWidth includes padding
	if (dojo.render.html.ie && node.clientWidth) { return node.clientWidth; }
	var match = dojo.style.getStyle(node, "width").match(/[0-9]+/);
	if (match) { return Number(match[0]); } else { return 0; }
}

dojo.style.getInnerWidth = function (node){
	return node.offsetWidth;
}

this.getOuterWidth = function(node) {
	var leftMargin = Number(dojo.style.getStyle(node, "margin-left"));
	var rightMargin = Number(dojo.style.getStyle(node, "margin-left"));
	return dojo.style.getInnerWidth() + leftMargin + rightMargin;
}

dojo.style.getContentHeight = function (node) {
	// FIXME: clientHeight includes padding
	if (dojo.render.html.ie && node.clientHeight) { return node.clientHeight; }
	var match = dojo.style.getStyle(node, "height").match(/[0-9]+/);
	if (match) { return Number(match[0]); } else { return 0; }
}

dojo.style.getInnerHeight = function (node){
	return node.offsetHeight; // FIXME: does this work?
}

this.getOuterHeight = function(node){
	var topMargin = Number(dojo.style.getStyle(node, "margin-top"));
	var bottomMargin = Number(dojo.style.getStyle(node, "margin-bottom"));
	return dojo.style.getInnerHeight() + topMargin + bottomMargin;
}

dojo.style.getTotalOffset = function (node, type){
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

dojo.style.totalOffsetLeft = function (node){
	return dojo.style.getTotalOffset(node, "left");
}

dojo.style.getAbsoluteX = dojo.style.totalOffsetLeft;

dojo.style.totalOffsetTop = function (node){
	return dojo.style.getTotalOffset(node, "top");
}

dojo.style.getAbsoluteY = dojo.style.totalOffsetTop;


dojo.style.styleSheet = null;

// FIXME: this is a really basic stub for adding and removing cssRules, but
// it assumes that you know the index of the cssRule that you want to add 
// or remove, making it less than useful.  So we need something that can 
// search for the selector that you you want to remove.
dojo.style.insertCssRule = function (selector, declaration, index){
	if(dojo.render.html.ie){
		if(!dojo.style.styleSheet){
			dojo.style.styleSheet = document.createStyleSheet();
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

dojo.style.removeCssRule = function (index){
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

dojo.style.insertCssFile = function (URI, doc, checkDuplicates){
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
	if(head){ // FIXME: why isn't this working on Opera 8?
		head.appendChild(file);
	}
}

dojo.style.getBackgroundColor = function (node) {
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

dojo.style.getStyle = function (element, cssSelector) {
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

dojo.style.toCamelCase = function (selector) {
	var arr = selector.split('-'), cc = arr[0];
	for(var i = 1; i < arr.length; i++) {
		cc += arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
	}
	return cc;		
}

dojo.style.toSelectorCase = function (selector) {
	return selector.replace(/([A-Z])/g, "-$1" ).toLowerCase() ;
}

/* float between 0.0 (transparent) and 1.0 (opaque) */
dojo.style.setOpacity = function setOpacity (node, opacity, dontFixOpacity) {
	var h = dojo.render.html;
	if(!dontFixOpacity){
		if( opacity >= 1.0){
			if(h.ie){
				dojo.style.clearOpacity(node);
				return;
			}else{
				opacity = 0.999999;
			}
		}else if( opacity < 0.0){ opacity = 0; }
	}
	if(h.ie){
		if(node.nodeName.toLowerCase() == "tr"){
			// FIXME: is this too naive? will we get more than we want?
			var tds = node.getElementsByTagName("td");
			for(var x=0; x<tds.length; x++){
				tds[x].style.filter = "Alpha(Opacity="+opacity*100+")";
			}
		}
		node.style.filter = "Alpha(Opacity="+opacity*100+")";
	}else if(h.moz){
		node.style.opacity = opacity; // ffox 1.0 directly supports "opacity"
		node.style.MozOpacity = opacity;
	}else if(h.safari){
		node.style.opacity = opacity; // 1.3 directly supports "opacity"
		node.style.KhtmlOpacity = opacity;
	}else{
		node.style.opacity = opacity;
	}
}
	
dojo.style.getOpacity = function getOpacity (node){
	if(dojo.render.html.ie){
		var opac = (node.filters && node.filters.alpha &&
			typeof node.filters.alpha.opacity == "number"
			? node.filters.alpha.opacity : 100) / 100;
	}else{
		var opac = node.style.opacity || node.style.MozOpacity ||
			node.style.KhtmlOpacity || 1;
	}
	return opac >= 0.999999 ? 1.0 : Number(opac);
}

dojo.style.clearOpacity = function clearOpacity (node) {
	var h = dojo.render.html;
	if(h.ie){
		if( node.filters && node.filters.alpha ) {
			node.style.filter = ""; // FIXME: may get rid of other filter effects
		}
	}else if(h.moz){
		node.style.opacity = 1;
		node.style.MozOpacity = 1;
	}else if(h.safari){
		node.style.opacity = 1;
		node.style.KhtmlOpacity = 1;
	}else{
		node.style.opacity = 1;
	}
}
