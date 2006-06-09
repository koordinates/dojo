dojo.provide("dojo.html.style.common");

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
