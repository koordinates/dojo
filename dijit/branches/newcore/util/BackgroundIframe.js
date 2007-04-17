dojo.provide("dijit.util.BackgroundIframe");

dijit.util.BackgroundIframe = function(/* HTMLElement */node) {
	//	summary
	//	For IE z-index schenanigans
	//	Two possible uses:
	//	1. new dojo.html.BackgroundIframe(node)
	//		Makes a background iframe as a child of node, that fills area (and position) of node
	//	2. new dojo.html.BackgroundIframe()
	//		Attaches frame to dojo.body().  User must call size() to set size.
	if(dojo.IE < 7) {
		var html="<iframe src='javascript:false'"
			+ " style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;"
			+ "z-index: -1; filter:Alpha(Opacity=\"0\");' "
			+ ">";
		this.iframe = dojo.doc.createElement(html);
		this.iframe.tabIndex = -1; // Magic to prevent iframe from getting focus on tab keypress - as style didnt work.
		if(node){
			node.appendChild(this.iframe);
			this.domNode=node;
		}else{
			dojo.body().appendChild(this.iframe);
			this.iframe.style.display="none";
		}
	}
};
dojo.lang.extend(dojo.html.BackgroundIframe, {
	iframe: null,
	onResized: function(){
		//	summary
		//	Resize event handler.
		// TODO: this function shouldn't be necessary but setting width=height=100% doesn't work!
		if(this.iframe && this.domNode && this.domNode.parentNode){ // No parentElement if onResized() timeout event occurs on a removed domnode
			var outer = dojo.marginBox(this.domNode);
			if (outer.w  == 0 || outer.h == 0 ){
				setTimeout(this, this.onResized, 100);
				return;
			}
			this.iframe.style.width = outer.w + "px";
			this.iframe.style.height = outer.h + "px";
		}
	},

	size: function(/* HTMLElement */node) {
		// summary:
		//		Call this function if the iframe is connected to dojo.body()
		//		rather than the node being shadowed 

		//	(TODO: erase)
		if(!this.iframe){ return; }
		var coords = dojo.html.toCoordinateObject(node, true, dojo.html.boxSizing.BORDER_BOX); // PORT
		with(this.iframe.style){
			width = coords.width + "px";
			height = coords.height + "px";
			left = coords.left + "px";
			top = coords.top + "px";
		}
	},

	setZIndex: function(/* HTMLElement */node){
		//	summary
		//	Sets the z-index of the background iframe.
		if(!this.iframe){ return; }
		if(dojo.dom.isNode(node)){
			this.iframe.style.zIndex = dojo.style(node, "zIndex") - 1;
		}else if(!isNaN(node)){
			this.iframe.style.zIndex = node;
		}
	},

	show: function(){
		//	summary:
		//		show the iframe
		if(this.iframe){ 
			this.iframe.style.display = "block";
		}
	},

	hide: function(){
		//	summary:
		//		hide the iframe
		if(this.iframe){ 
			this.iframe.style.display = "none";
		}
	},

	remove: function(){
		//	summary:
		//		remove the iframe
		if(this.iframe){
			dojo.html.removeNode(this.iframe, true);
			delete this.iframe;
			this.iframe=null;
		}
	}
});
