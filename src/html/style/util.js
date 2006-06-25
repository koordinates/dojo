dojo.require("dojo.html.common");
dojo.require("dojo.html.style.position");
dojo.provide("dojo.html.style.util");

dojo.html.sumAncestorProperties = function(node, prop){
	node = dojo.byId(node);
	if(!node){ return 0; } // FIXME: throw an error?
	
	var retVal = 0;
	while(node){
		var val = node[prop];
		if(val){
			retVal += val - 0;
			if(node==dojo.html.body()){ break; }// opera and khtml #body & #html has the same values, we only need one value
		}
		node = node.parentNode;
	}
	return retVal;
}

dojo.html.getMarginExtent = function(node, side){
	return dojo.html._sumPixelValues(node, ["margin-" + side], dojo.html.isPositionAbsolute(node));
}

dojo.html.getPaddingExtent = function(node, side){
	return dojo.html._sumPixelValues(node, ["padding-" + side], true);
}

dojo.style.styleSheet = null;

// FIXME: this is a really basic stub for adding and removing cssRules, but
// it assumes that you know the index of the cssRule that you want to add 
// or remove, making it less than useful.  So we need something that can 
// search for the selector that you you want to remove.
dojo.style.insertCssRule = function(selector, declaration, index) {
	if (!dojo.style.styleSheet) {
		if (document.createStyleSheet) { // IE
			dojo.style.styleSheet = document.createStyleSheet();
		} else if (document.styleSheets[0]) { // rest
			// FIXME: should create a new style sheet here
			// fall back on an exsiting style sheet
			dojo.style.styleSheet = document.styleSheets[0];
		} else { return null; } // fail
	}

	if (arguments.length < 3) { // index may == 0
		if (dojo.style.styleSheet.cssRules) { // W3
			index = dojo.style.styleSheet.cssRules.length;
		} else if (dojo.style.styleSheet.rules) { // IE
			index = dojo.style.styleSheet.rules.length;
		} else { return null; } // fail
	}

	if (dojo.style.styleSheet.insertRule) { // W3
		var rule = selector + " { " + declaration + " }";
		return dojo.style.styleSheet.insertRule(rule, index);
	} else if (dojo.style.styleSheet.addRule) { // IE
		return dojo.style.styleSheet.addRule(selector, declaration, index);
	} else { return null; } // fail
}

dojo.style.removeCssRule = function(index){
	if(!dojo.style.styleSheet){
		dojo.debug("no stylesheet defined for removing rules");
		return false;
	}
	if(dojo.html.render.ie){
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

// calls css by XmlHTTP and inserts it into DOM as <style [widgetType="widgetType"]> *downloaded cssText*</style>
dojo.style._insertedCssFiles = []; // cache container needed because IE reformats cssText when added to DOM
dojo.style.insertCssFile = function(URI, doc, checkDuplicates){
	if(!URI){ return; }
	if(!doc){ doc = document; }
	var cssStr = dojo.hostenv.getText(URI);
	cssStr = dojo.style.fixPathsInCssText(cssStr, URI);

	if(checkDuplicates){
		var idx = -1, node, ent = dojo.style._insertedCssFiles;
		for(var i = 0; i < ent.length; i++){
			if((ent[i].doc == doc) && (ent[i].cssText == cssStr)){
				idx = i; node = ent[i].nodeRef;
				break;
			}
		}
		// make sure we havent deleted our node
		if(node){
			var styles = doc.getElementsByTagName("style");
			for(var i = 0; i < styles.length; i++){
				if(styles[i] == node){
					return;
				}
			}
			// delete this entry
			dojo.style._insertedCssFiles.shift(idx, 1);
		}
	}

	var style = dojo.style.insertCssText(cssStr);
	dojo.style._insertedCssFiles.push({'doc': doc, 'cssText': cssStr, 'nodeRef': style});

	// insert custom attribute ex dbgHref="../foo.css" usefull when debugging in DOM inspectors, no?
	if(style && djConfig.isDebug){
		style.setAttribute("dbgHref", URI);
	}
	return style
}

// DomNode Style  = insertCssText(String ".dojoMenu {color: green;}"[, DomDoc document, dojo.uri.Uri Url ])
dojo.style.insertCssText = function(cssStr, doc, URI){
	if(!cssStr){ return; }
	if(!doc){ doc = document; }
	if(URI){// fix paths in cssStr
		cssStr = dojo.style.fixPathsInCssText(cssStr, URI);
	}
	var style = doc.createElement("style");
	style.setAttribute("type", "text/css");
	// IE is b0rken enough to require that we add the element to the doc
	// before changing it's properties
	var head = doc.getElementsByTagName("head")[0];
	if(!head){ // must have a head tag 
		dojo.debug("No head tag in document, aborting styles");
		return;
	}else{
		head.appendChild(style);
	}
	if(style.styleSheet){// IE
		style.styleSheet.cssText = cssStr;
	}else{ // w3c
		var cssText = doc.createTextNode(cssStr);
		style.appendChild(cssText);
	}
	return style;
}

// String cssText = fixPathsInCssText(String cssStr, dojo.uri.Uri URI)
// usage: cssText comes from dojoroot/src/widget/templates/HtmlFoobar.css
// 	it has .dojoFoo { background-image: url(images/bar.png);} 
//	then uri should point to dojoroot/src/widget/templates/
dojo.style.fixPathsInCssText = function(cssStr, URI){
	if(!cssStr || !URI){ return; }
	var match, str = "", url = "";
	var regex = /url\(\s*([\t\s\w()\/.\\'"-:#=&?]*)\s*\)/;
	var regexProtocol = /(file|https?|ftps?):\/\//;
	var regexTrim = /^[\s]*(['"]?)([\w()\/.\\'"-:#=&?]*)\1[\s]*?$/;
	while(match = regex.exec(cssStr)){
		url = match[1].replace(regexTrim, "$2");
		if(!regexProtocol.exec(url)){
			url = (new dojo.uri.Uri(URI, url).toString());
		}
		str += cssStr.substring(0, match.index) + "url(" + url + ")";
		cssStr = cssStr.substr(match.index + match[0].length);
	}
	return str + cssStr;
}
