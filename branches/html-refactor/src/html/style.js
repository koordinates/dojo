dojo.provide("dojo.html.style");

dojo.require("dojo.lang.common");

/**
 * Returns the string value of the list of CSS classes currently assigned
 * directly to the node in question. Returns an empty string if no class attribute
 * is found;
 */
dojo.html.getClass = function(node){
	node = dojo.byId(node);
	if(!node){ return ""; }
	var cs = "";
	if(node.className){
		cs = node.className;
	}else if(dojo.html.hasAttribute(node, "class")){
		cs = dojo.html.getAttribute(node, "class");
	}
	return cs.replace(/^\s+|\s+$/g, "");
}

/**
 * Returns an array of CSS classes currently assigned
 * directly to the node in question. Returns an empty array if no classes
 * are found;
 */
dojo.html.getClasses = function(node) {
	var c = dojo.html.getClass(node);
	return (c == "") ? [] : c.split(/\s+/g);
}

/**
 * Returns whether or not the specified classname is a portion of the
 * class list currently applied to the node. Does not cover cascaded
 * styles, only classes directly applied to the node.
 */
dojo.html.hasClass = function(node, classname){
	return dojo.lang.inArray(dojo.html.getClasses(node), classname);
}

/**
 * Adds the specified class to the beginning of the class list on the
 * passed node. This gives the specified class the highest precidence
 * when style cascading is calculated for the node. Returns true or
 * false; indicating success or failure of the operation, respectively.
 */
dojo.html.prependClass = function(node, classStr){
	classStr += " " + dojo.html.getClass(node);
	return dojo.html.setClass(node, classStr + " " + dojo.html.getClass(node));
}

/**
 * Adds the specified class to the end of the class list on the
 *	passed &node;. Returns &true; or &false; indicating success or failure.
 */
dojo.html.addClass = function(node, classStr){
	if (dojo.html.hasClass(node, classStr)) {
	  return false;
	}
	classStr = (dojo.html.getClass(node) + " " + classStr).replace(/^\s+|\s+$/g,"");
	return dojo.html.setClass(node, classStr);
}

/**
 *	Clobbers the existing list of classes for the node, replacing it with
 *	the list given in the 2nd argument. Returns true or false
 *	indicating success or failure.
 */
dojo.html.setClass = function(node, classStr){
	node = dojo.byId(node);
	var cs = new String(classStr);
	try{
		if(typeof node.className == "string"){
			node.className = cs;
		}else if(node.setAttribute){
			node.setAttribute("class", classStr);
			node.className = cs;
		}else{
			return false;
		}
	}catch(e){
		dojo.debug("dojo.html.setClass() failed", e);
	}
	return true;
}

/**
 * Removes the className from the node;. Returns
 * true or false indicating success or failure.
 */ 
dojo.html.removeClass = function(node, classStr, allowPartialMatches){
	var classStr = String(classStr).replace(/^\s+|\s+$/g,"");

	try{
		var cs = dojo.html.getClasses(node);
		var nca	= [];
		if(allowPartialMatches){
			for(var i = 0; i<cs.length; i++){
				if(cs[i].indexOf(classStr) == -1){ 
					nca.push(cs[i]);
				}
			}
		}else{
			for(var i=0; i<cs.length; i++){
				if(cs[i] != classStr){ 
					nca.push(cs[i]);
				}
			}
		}
		dojo.html.setClass(node, nca.join(" "));
	}catch(e){
		dojo.debug("dojo.html.removeClass() failed", e);
	}

	return true;
}

/**
 * Replaces 'oldClass' and adds 'newClass' to node
 */
dojo.html.replaceClass = function(node, newClass, oldClass) {
	dojo.html.removeClass(node, oldClass);
	dojo.html.addClass(node, newClass);
}

dojo.html.toCamelCase = function(selector){
	var arr = selector.split('-'), cc = arr[0];
	for(var i = 1; i < arr.length; i++) {
		cc += arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
	}
	return cc;
}

dojo.html.toSelectorCase = function(selector){
	return selector.replace(/([A-Z])/g, "-$1" ).toLowerCase();
}

dojo.html.getComputedStyle = function(node, cssSelector, inValue){
	node = dojo.byId(node);
	// cssSelector may actually be in camel case, so force selector version
	var cssSelector = dojo.html.toSelectorCase(cssSelector);
	var property = dojo.html.toCamelCase(cssSelector);
	if(!node || !node.style){
		return inValue;
	}else if(document.defaultView){ // W3, gecko, KHTML
		try{			
			var cs = document.defaultView.getComputedStyle(node, "");
			if (cs){ 
				return cs.getPropertyValue(cssSelector);
			} 
		}catch(e){ // reports are that Safari can throw an exception above
			if (node.style.getPropertyValue){ // W3
				return node.style.getPropertyValue(cssSelector);
			}else return inValue;
		}
	}else if(node.currentStyle){ // IE
		return node.currentStyle[property];
	}if(node.style.getPropertyValue){ // W3
		return node.style.getPropertyValue(cssSelector);
	}else{
		return inValue;
	}
}

dojo.html.getStyleProperty = function(node, cssSelector){
	node = dojo.byId(node);
	// FIXME: should we use node.style.getPropertyValue over style[property]?
	// style[property] works in all (modern) browsers, getPropertyValue is W3 but not supported in IE
	// FIXME: what about runtimeStyle?
	return (node && node.style ? node.style[dojo.html.toCamelCase(cssSelector)] : undefined);
}

dojo.html.getStyle = function(node, cssSelector){
	var value = dojo.html.getStyleProperty(node, cssSelector);
	return (value ? value : dojo.html.getComputedStyle(node, cssSelector));
}

dojo.html.setStyle = function(node, cssSelector, value){
	node = dojo.byId(node);
	if(node && node.style){
		var camelCased = dojo.html.toCamelCase(cssSelector);
		node.style[camelCased] = value;
	}
}

dojo.html.setStyleAttributes = function(node, attributes) { 
	var methodMap={ 
		"opacity":dojo.style.setOpacity,
		"content-height":dojo.style.setContentHeight,
		"content-width":dojo.style.setContentWidth,
		"outer-height":dojo.style.setOuterHeight,
		"outer-width":dojo.style.setOuterWidth 
	} 

	var splittedAttribs=attributes.replace(/(;)?\s*$/, "").split(";"); 
	for(var i=0; i<splittedAttribs.length; i++){ 
		var nameValue=splittedAttribs[i].split(":"); 
		var name=nameValue[0].replace(/\s*$/, "").replace(/^\s*/, "").toLowerCase();
		var value=nameValue[1].replace(/\s*$/, "").replace(/^\s*/, "");
		if(dojo.lang.has(methodMap,name)) { 
			methodMap[name](node,value); 
		} else { 
			node.style[dojo.style.toCamelCase(name)]=value; 
		} 
	} 
}

dojo.html.copyStyle = function(target, source){
	// work around for opera which doesn't have cssText, and for IE which fails on setAttribute 
	if(dojo.lang.isUndefined(source.style.cssText)){ 
		target.setAttribute("style", source.getAttribute("style")); 
	}else{
		target.style.cssText = source.style.cssText; 
	}
	dojo.html.addClass(target, dojo.html.getClass(source));
}

dojo.html.getUnitValue = function(node, cssSelector, autoIsZero){
	var s = dojo.html.getComputedStyle(node, cssSelector);
	if((!s)||((s == 'auto')&&(autoIsZero))){ return { value: 0, units: 'px' }; }
	if(dojo.lang.isUndefined(s)){return dojo.html.getUnitValue.bad;}
	// FIXME: is regex inefficient vs. parseInt or some manual test? 
	var match = s.match(/(\-?[\d.]+)([a-z%]*)/i);
	if (!match){return dojo.html.getUnitValue.bad;}
	return { value: Number(match[1]), units: match[2].toLowerCase() };
}
dojo.html.getUnitValue.bad = { value: NaN, units: '' };

dojo.html.getPixelValue = function(node, cssSelector, autoIsZero){
	var result = dojo.html.getUnitValue(node, cssSelector, autoIsZero);
	// FIXME: there is serious debate as to whether or not this is the right solution
	if(isNaN(result.value)){ return 0; }
	// FIXME: code exists for converting other units to px (see Dean Edward's IE7) 
	// but there are cross-browser complexities
	if((result.value)&&(result.units != 'px')){ return NaN; }
	return result.value;
}

dojo.html.setPositivePixelValue = function(node, selector, value){
	if(isNaN(value)){return false;}
	node.style[selector] = Math.max(0, value) + 'px'; 
	return true;
}
