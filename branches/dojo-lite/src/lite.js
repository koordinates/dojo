dojo.provide("dojo.lite");

dojo.lite.removed = function(){
	dojo.debug.apply(dojo, ["dojo.lite removal:"].concat(arguments));
}

with(dojo.lite){
	removed("dojo.regexp.time");
	removed("dojo.lang.setObjPathValue");
	removed("dojo.lang.getObject");
	removed("dojo.lang.doesObjectExist");
	removed("dojo.style.setActiveStyleSheet");
	removed("dojo.style.getActiveStyleSheet");
	removed("dojo.html.getPreferredStyleSheet");
	removed("dojo.html.getClasses");
	removed("dojo.html.replaceClass");
	removed("dojo.html.toSelectorCase");
	// removed("");
}
