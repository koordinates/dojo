dojo.require("dojo.html");
dojo.provide("dojo.html.iframe");

/*
 * Functions to work with iframes
 */
// thanks burstlib!
dojo.html.iframeContentWindow = function(iframe_el) {
	var win = iframe_el.contentWindow || // IE
		dojo.io.iframeContentDocument(iframe_el).defaultView || // Moz, opera
		// Moz. TODO: is this available when defaultView isn't?
		dojo.io.iframeContentDocument(iframe_el).__parent__ ||
		(iframe_el.name && document.frames[iframe_el.name]) || null;
	return win;
}

dojo.html.iframeContentDocument = function(iframe_el){
	var doc = iframe_el.contentDocument || // W3
		(
			(iframe_el.contentWindow)&&(iframe_el.contentWindow.document)
		) ||  // IE
		(
			(iframe_el.name)&&(document.frames[iframe_el.name])&&
			(document.frames[iframe_el.name].document)
		) || null;
	return doc;
}