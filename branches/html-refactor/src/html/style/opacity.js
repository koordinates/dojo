dojo.provide("dojo.html.style.opacity");

/* float between 0.0 (transparent) and 1.0 (opaque) */
dojo.html.setOpacity = function(node, opacity, dontFixOpacity){
	node = dojo.byId(node);
	var h = dojo.render.html;
	if(!dontFixOpacity){
		if( opacity >= 1.0){
			if(h.ie){
				dojo.html.clearOpacity(node);
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

dojo.html.clearOpacity = function clearOpacity(node){
	node = dojo.byId(node);
	var ns = node.style;
	var h = dojo.render.html;
	if(h.ie){
		try {
			if( node.filters && node.filters.alpha ){
				ns.filter = ""; // FIXME: may get rid of other filter effects
			}
		} catch(e) {
			/*
			 * IE7 gives error if node.filters not set;
			 * don't know why or how to workaround (other than this)
			 */
		}
	}else if(h.moz){
		ns.opacity = 1;
		ns.MozOpacity = 1;
	}else if(h.safari){
		ns.opacity = 1;
		ns.KhtmlOpacity = 1;
	}else{
		ns.opacity = 1;
	}
}

dojo.html.getOpacity = function getOpacity (node){
	node = dojo.byId(node);
	var h = dojo.render.html;
	if(h.ie){
		var opac = (node.filters && node.filters.alpha &&
			typeof node.filters.alpha.opacity == "number"
			? node.filters.alpha.opacity : 100) / 100;
	}else{
		var opac = node.style.opacity || node.style.MozOpacity ||
			node.style.KhtmlOpacity || 1;
	}
	return opac >= 0.999999 ? 1.0 : Number(opac);
}
