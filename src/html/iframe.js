dojo.provide("dojo.html.iframe");
dojo.require("dojo.html.extras");

/*
 * Functions to work with iframes
 */
// thanks burstlib!
dojo.html.iframeContentWindow = function(iframe_el) {
	var win = dojo.html.getDocumentWindow(dojo.html.iframeContentDocument(iframe_el)) ||
		// Moz. TODO: is this available when defaultView isn't?
		dojo.html.iframeContentDocument(iframe_el).__parent__ ||
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

/**
 * For IE z-index schenanigans
 * Two possible uses:
 *   1. new dojo.html.BackgroundIframe(node)
 *        Makes a background iframe as a child of node, that fills area (and position) of node
 *
 *   2. new dojo.html.BackgroundIframe()
 *        Attaches frame to dojo.body().  User must call size() to set size.
 */
dojo.html.BackgroundIframe = function(node) {
	if(dojo.render.html.ie55 || dojo.render.html.ie60) {
		var html=
				 "<iframe "
				+"style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;"
				+        "z-index: -1; filter:Alpha(Opacity=\"0\");' "
				+">";
		this.iframe = dojo.doc().createElement(html);
		this.iframe.tabIndex = -1; // Magic to prevent iframe from getting focus on tab keypress - as style didnt work.
		if(node){
			node.appendChild(this.iframe);
			this.domNode=node;
		}else{
			dojo.body().appendChild(this.iframe);
			this.iframe.style.display="none";
		}
	}
}
dojo.lang.extend(dojo.html.BackgroundIframe, {
	iframe: null,

	// TODO: this function shouldn't be necessary but setting width=height=100% doesn't work!
	onResized: function(){
		if(this.iframe && this.domNode && this.domNode.parentElement){ // No parentElement if onResized() timeout event occurs on a removed domnode
			var w = dojo.html.getOuterWidth(this.domNode);
			var h = dojo.html.getOuterHeight(this.domNode);
			if (w  == 0 || h == 0 ){
				dojo.lang.setTimeout(this, this.onResized, 50);
				return;
			}
			var s = this.iframe.style;
			s.width = w + "px";
			s.height = h + "px";
		}
	},

	// Call this function if the iframe is connected to dojo.body() rather
	// than the node being shadowed (TODO: erase)
	size: function(node) {
		if(!this.iframe) { return; }

		var coords = dojo.html.toCoordinateObject(node, true);

		var s = this.iframe.style;
		s.width = coords.w + "px";
		s.height = coords.h + "px";
		s.left = coords.x + "px";
		s.top = coords.y + "px";
	},

	setZIndex: function(node /* or number */) {
		if(!this.iframe) { return; }

		if(dojo.dom.isNode(node)) {
			this.iframe.style.zIndex = dojo.html.getStyle(node, "z-index") - 1;
		} else if(!isNaN(node)) {
			this.iframe.style.zIndex = node;
		}
	},

	show: function() {
		if(!this.iframe) { return; }
		this.iframe.style.display = "block";
	},

	hide: function() {
		if(!this.ie) { return; }
		var s = this.iframe.style;
		s.display = "none";
	},

	remove: function() {
		dojo.dom.removeNode(this.iframe);
	}
});
