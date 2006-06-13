dojo.provide("dojo.lfx.html");

dojo.require("dojo.lfx.Animation");
dojo.require("dojo.html.style.display");
dojo.require("dojo.html.style.color");
dojo.require("dojo.html.style.position");

dojo.lfx.html._byId = function(nodes){
	if(!nodes){ return []; }
	if(dojo.lang.isArray(nodes)){
		if(!nodes.alreadyChecked){
			var n = [];
			dojo.lang.forEach(nodes, function(node){
				n.push(dojo.byId(node));
			});
			n.alreadyChecked = true;
			return n;
		}else{
			return nodes;
		}
	}else{
		var n = [];
		n.push(dojo.byId(nodes));
		n.alreadyChecked = true;
		return n;
	}
}

dojo.lfx.html.propertyAnimation = function(	/*DOMNode*/ nodes, 
											/*Array*/ propertyMap, 
											/*int*/ duration,
											/*function*/ easing){
	nodes = dojo.lfx.html._byId(nodes);
	
	if(nodes.length==1){
		// FIXME: we're only supporting start-value filling when one node is
		// passed
		
		dojo.lang.forEach(propertyMap, function(prop){
			if(typeof prop["start"] == "undefined"){
				if(prop.property != "opacity"){
					prop.start = parseInt(dojo.html.getComputedStyle(nodes[0], prop.property));
				}else{
					prop.start = dojo.html.getOpacity(nodes[0]);
				}
			}
		});
	}

	var coordsAsInts = function(coords){
		var cints = new Array(coords.length);
		for(var i = 0; i < coords.length; i++){
			cints[i] = Math.round(coords[i]);
		}
		return cints;
	}
	var setStyle = function(n, style){
		n = dojo.byId(n);
		if(!n || !n.style){ return; }
		for(var s in style){
			if(s == "opacity"){
				dojo.html.setOpacity(n, style[s]);
			}else{
				n.style[s] = style[s];
			}
		}
	}
	var propLine = function(properties){
		this._properties = properties;
		this.diffs = new Array(properties.length);
		dojo.lang.forEach(properties, function(prop, i){
			// calculate the end - start to optimize a bit
			if(dojo.lang.isArray(prop.start)){
				// don't loop through the arrays
				this.diffs[i] = null;
			}else if(prop.start instanceof dojo.graphics.color.Color){
				// save these so we don't have to call toRgb() every getValue() call
				prop.startRgb = prop.start.toRgb();
				prop.endRgb = prop.end.toRgb();
			}else{
				this.diffs[i] = prop.end - prop.start;
			}
		}, this);
		this.getValue = function(n){
			var ret = {};
			dojo.lang.forEach(this._properties, function(prop, i){
				var value = null;
				if(dojo.lang.isArray(prop.start)){
					// FIXME: what to do here?
				}else if(prop.start instanceof dojo.graphics.color.Color){
					value = (prop.units||"rgb") + "(";
					for(var j = 0 ; j < prop.startRgb.length ; j++){
						value += Math.round(((prop.endRgb[j] - prop.startRgb[j]) * n) + prop.startRgb[j]) + (j < prop.startRgb.length - 1 ? "," : "");
					}
					value += ")";
				}else{
					value = ((this.diffs[i]) * n) + prop.start + (prop.property != "opacity" ? prop.units||"px" : "");
				}
				ret[dojo.html.toCamelCase(prop.property)] = value;
			}, this);
			return ret;
		}
	}
	
	var anim = new dojo.lfx.Animation({
		onAnimate: function(propValues){
			dojo.lang.forEach(nodes, function(node){
				setStyle(node, propValues);
			});
		} }, duration, new propLine(propertyMap), easing);
	
	return anim;
}

dojo.lfx.html._makeFadeable = function(nodes){
	var makeFade = function(node){
		if(dojo.render.html.ie){
			// only set the zoom if the "tickle" value would be the same as the
			// default
			if( (node.style.zoom.length == 0) &&
				(dojo.html.getStyle(node, "zoom") == "normal") ){
				// make sure the node "hasLayout"
				// NOTE: this has been tested with larger and smaller user-set text
				// sizes and works fine
				node.style.zoom = "1";
				// node.style.zoom = "normal";
			}
			// don't set the width to auto if it didn't already cascade that way.
			// We don't want to f anyones designs
			if(	(node.style.width.length == 0) &&
				(dojo.html.getStyle(node, "width") == "auto") ){
				node.style.width = "auto";
			}
		}
	}
	if(dojo.lang.isArrayLike(nodes)){
		dojo.lang.forEach(nodes, makeFade);
	}else{
		makeFade(nodes);
	}
}

dojo.lfx.html.fadeIn = function(nodes, duration, easing, callback){
	nodes = dojo.lfx.html._byId(nodes);
	dojo.lfx.html._makeFadeable(nodes);
	var anim = dojo.lfx.propertyAnimation(nodes, [
		{	property: "opacity",
			start: dojo.html.getOpacity(nodes[0]),
			end: 1 } ], duration, easing);
	if(callback){
		var oldOnEnd = (anim["onEnd"]) ? dojo.lang.hitch(anim, "onEnd") : function(){};
		anim.onEnd = function(){ oldOnEnd(); callback(nodes, anim); };
	}

	return anim;
}

dojo.lfx.html.fadeOut = function(nodes, duration, easing, callback){
	nodes = dojo.lfx.html._byId(nodes);
	dojo.lfx.html._makeFadeable(nodes);
	var anim = dojo.lfx.propertyAnimation(nodes, [
		{	property: "opacity",
			start: dojo.html.getOpacity(nodes[0]),
			end: 0 } ], duration, easing);
	if(callback){
		var oldOnEnd = (anim["onEnd"]) ? dojo.lang.hitch(anim, "onEnd") : function(){};
		anim.onEnd = function(){ oldOnEnd(); callback(nodes, anim); };
	}

	return anim;
}

dojo.lfx.html.fadeShow = function(nodes, duration, easing, callback){
	var anim = dojo.lfx.html.fadeIn(nodes, duration, easing, callback);
	var oldBb = (anim["beforeBegin"]) ? dojo.lang.hitch(anim, "beforeBegin") : function(){};
	anim.beforeBegin = function(){ 
		oldBb();
		if(dojo.lang.isArrayLike(nodes)){
			dojo.lang.forEach(nodes, dojo.html.show);
		}else{
			dojo.html.show(nodes);
		}
	};
	
	return anim;
}

dojo.lfx.html.fadeHide = function(nodes, duration, easing, callback){
	var anim = dojo.lfx.html.fadeOut(nodes, duration, easing, function(){
		if(dojo.lang.isArrayLike(nodes)){
			dojo.lang.forEach(nodes, dojo.html.hide);
		}else{
			dojo.html.hide(nodes);
		}
		if(callback){ callback(nodes, anim); }
	});
	
	return anim;
}

dojo.lfx.html.wipeIn = function(nodes, duration, easing, callback){
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];

	dojo.lang.forEach(nodes, function(node){
		var overflow = dojo.html.getStyle(node, "overflow");
		if(overflow == "visible") {
			node.style.overflow = "hidden";
		}
		node.style.height = "0px";
		dojo.html.show(node);
		
		var anim = dojo.lfx.propertyAnimation(node,
			[{	property: "height",
				start: 0,
				end: node.scrollHeight }], duration, easing);
		
		var oldOnEnd = (anim["onEnd"]) ? dojo.lang.hitch(anim, "onEnd") : function(){};
		anim.onEnd = function(){ 
			oldOnEnd(); 
			node.style.overflow = overflow;
			node.style.height = "auto";
			if(callback){ callback(node, anim); }
		};
		anims.push(anim);
	});
	
	if(nodes.length > 1){ return dojo.lfx.combine(anims); }
	else{ return anims[0]; }
}

dojo.lfx.html.wipeOut = function(nodes, duration, easing, callback){
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];
	
	dojo.lang.forEach(nodes, function(node){
		var overflow = dojo.html.getStyle(node, "overflow");
		if(overflow == "visible") {
			node.style.overflow = "hidden";
		}
		dojo.html.show(node);

		var anim = dojo.lfx.propertyAnimation(node,
			[{	property: "height",
				start: dojo.html.getContentBox(node).height,
				end: 0 } ], duration, easing);
		
		var oldOnEnd = (anim["onEnd"]) ? dojo.lang.hitch(anim, "onEnd") : function(){};
		anim.onEnd = function(){ 
			oldOnEnd(); 
			dojo.html.hide(node);
			node.style.overflow = overflow;
			if(callback){ callback(node, anim); }
		};
		anims.push(anim);
	});

	if(nodes.length > 1){ return dojo.lfx.combine(anims); }
	else { return anims[0]; }
}

dojo.lfx.html.slideTo = function(nodes, coords, duration, easing, callback){
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];

	dojo.lang.forEach(nodes, function(node){
		var top = null;
		var left = null;
		
		var init = (function(){
			var innerNode = node;
			return function(){
				var pos = dojo.html.getComputedStyle(innerNode, 'position');
				top = (pos == 'absolute' ? node.offsetTop : parseInt(dojo.html.getComputedStyle(node, 'top')) || 0);
				left = (pos == 'absolute' ? node.offsetLeft : parseInt(dojo.html.getComputedStyle(node, 'left')) || 0);

				if (!dojo.lang.inArray(['absolute', 'relative'], pos)) {
					var ret = dojo.html.abs(innerNode, true);
					dojo.html.setStyleAttributes(innerNode, "position:absolute;top:"+ret.y+"px;left:"+ret.x+"px;");
					top = ret.y;
					left = ret.x;
				}
			}
		})();
		init();
		
		var anim = dojo.lfx.propertyAnimation(node,
			[{	property: "top",
				start: top,
				end: coords[0] },
			{	property: "left",
				start: left,
				end: coords[1] }], duration, easing);
		
		var oldBb = (anim["beforeBegin"]) ? dojo.lang.hitch(anim, "beforeBegin") : function(){};
		anim.beforeBegin = function(){ oldBb(); init(); };

		if(callback){
			var oldOnEnd = (anim["onEnd"]) ? dojo.lang.hitch(anim, "onEnd") : function(){};
			anim.onEnd = function(){ oldOnEnd(); callback(nodes, anim); };
		}

		anims.push(anim);
	});
	
	if(nodes.length > 1){ return dojo.lfx.combine(anims); }
	else{ return anims[0]; }
}

dojo.lfx.html.slideBy = function(nodes, coords, duration, easing, callback){
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];

	dojo.lang.forEach(nodes, function(node){
		var top = null;
		var left = null;
		
		var init = (function(){
			var innerNode = node;
			return function(){
				var pos = dojo.html.getComputedStyle(innerNode, 'position');
				top = (pos == 'absolute' ? node.offsetTop : parseInt(dojo.html.getComputedStyle(node, 'top')) || 0);
				left = (pos == 'absolute' ? node.offsetLeft : parseInt(dojo.html.getComputedStyle(node, 'left')) || 0);

				if (!dojo.lang.inArray(['absolute', 'relative'], pos)) {
					var ret = dojo.html.abs(innerNode, true);
					dojo.html.setStyleAttributes(innerNode, "position:absolute;top:"+ret.y+"px;left:"+ret.x+"px;");
					top = ret.y;
					left = ret.x;
				}
			}
		})();
		init();
		
		var anim = dojo.lfx.propertyAnimation(node,
			[{	property: "top",
				start: top,
				end: top+coords[0] },
			{	property: "left",
				start: left,
				end: left+coords[1] }], duration, easing);

		var oldBb = (anim["beforeBegin"]) ? dojo.lang.hitch(anim, "beforeBegin") : function(){};
		anim.beforeBegin = function(){ oldBb(); init(); };

		if(callback){
			var oldOnEnd = (anim["onEnd"]) ? dojo.lang.hitch(anim, "onEnd") : function(){};
			anim.onEnd = function(){ oldOnEnd(); callback(nodes, anim); };
		}

		anims.push(anim);
	});

	if(nodes.length > 1){ return dojo.lfx.combine(anims); }
	else{ return anims[0]; }
}

dojo.lfx.html.explode = function(start, endNode, duration, easing, callback){
	start = dojo.byId(start);
	endNode = dojo.byId(endNode);
	var startCoords = dojo.html.toCoordinateObject(start, true);
	var outline = document.createElement("div");
	dojo.html.copyStyle(outline, endNode);
	with(outline.style){
		position = "absolute";
		display = "none";
	}
	dojo.html.body().appendChild(outline);

	with(endNode.style){
		visibility = "hidden";
		display = "block";
	}
	var endCoords = dojo.html.toCoordinateObject(endNode, true);
	with(endNode.style){
		display = "none";
		visibility = "visible";
	}
	
	var anim = new dojo.lfx.propertyAnimation(outline, [
		{ property: "height", start: startCoords.h, end: endCoords.h },
		{ property: "width", start: startCoords.w, end: endCoords.w },
		{ property: "top", start: startCoords.y, end: endCoords.y },
		{ property: "left", start: startCoords.x, end: endCoords.x },
		{ property: "opacity", start: 0.3, end: 1.0 }
	], duration, easing);
	
	anim.beforeBegin = function(){
		dojo.html.setDisplay(outline, "block");
	};
	anim.onEnd = function(){
		dojo.html.setDisplay(endNode, "block");
		outline.parentNode.removeChild(outline);
	};
	if(callback){
		var oldOnEnd = (anim["onEnd"]) ? dojo.lang.hitch(anim, "onEnd") : function(){};
		anim.onEnd = function(){ oldOnEnd(); callback(endNode, anim); };
	}
	return anim;
}

dojo.lfx.html.implode = function(startNode, end, duration, easing, callback){
	startNode = dojo.byId(startNode);
	end = dojo.byId(end);
	var startCoords = dojo.html.toCoordinateObject(startNode, true);
	var endCoords = dojo.html.toCoordinateObject(end, true);

	var outline = document.createElement("div");
	dojo.html.copyStyle(outline, startNode);
	dojo.html.setOpacity(outline, 0.3);
	with(outline.style){
		position = "absolute";
		display = "none";
	}
	dojo.html.body().appendChild(outline);

	var anim = new dojo.lfx.propertyAnimation(outline, [
		{ property: "height", start: startCoords.h, end: endCoords.h },
		{ property: "width", start: startCoords.w, end: endCoords.w },
		{ property: "top", start: startCoords.y, end: endCoords.y },
		{ property: "left", start: startCoords.x, end: endCoords.x },
		{ property: "opacity", start: 1.0, end: 0.3 }
	], duration, easing);
	
	anim.beforeBegin = function(){
		dojo.html.hide(startNode);
		dojo.html.show(outline);
	};
	anim.onEnd = function(){
		outline.parentNode.removeChild(outline);
	};
	if(callback){
		var oldOnEnd = (anim["onEnd"]) ? dojo.lang.hitch(anim, "onEnd") : function(){};
		anim.onEnd = function(){ oldOnEnd(); callback(startNode, anim); };
	}
	return anim;
}

dojo.lfx.html.highlight = function(nodes, startColor, duration, easing, callback){
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];

	dojo.lang.forEach(nodes, function(node){
		var color = dojo.html.getBackgroundColor(node);
		var bg = dojo.html.getStyle(node, "background-color").toLowerCase();
		var bgImage = dojo.html.getStyle(node, "background-image");
		var wasTransparent = (bg == "transparent" || bg == "rgba(0, 0, 0, 0)");
		while(color.length > 3) { color.pop(); }

		var rgb = new dojo.graphics.color.Color(startColor);
		var endRgb = new dojo.graphics.color.Color(color);

		var anim = dojo.lfx.propertyAnimation(node, [{
			property: "background-color",
			start: rgb,
			end: endRgb
		}], duration, easing);

		var oldbb = (anim["beforeBegin"]) ? dojo.lang.hitch(anim, "beforeBegin") : function(){};
		anim.beforeBegin = function(){ 
			oldbb();
			if(bgImage){
				node.style.backgroundImage = "none";
			}
			node.style.backgroundColor = "rgb(" + rgb.toRgb().join(",") + ")";
		};

		var oldOnEnd = (anim["onEnd"]) ? dojo.lang.hitch(anim, "onEnd") : function(){};
		anim.onEnd = function(){ 
			oldOnEnd();
			if(bgImage){
				node.style.backgroundImage = bgImage;
			}
			if(wasTransparent){
				node.style.backgroundColor = "transparent";
			}
			if(callback){
				callback(node, anim);
			}
		};

		anims.push(anim);
	});

	if(nodes.length > 1){ return dojo.lfx.combine(anims); }
	else{ return anims[0]; }
}

dojo.lfx.html.unhighlight = function(nodes, endColor, duration, easing, callback){
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];

	dojo.lang.forEach(nodes, function(node){
		var color = new dojo.graphics.color.Color(dojo.html.getBackgroundColor(node));
		var rgb = new dojo.graphics.color.Color(endColor);

		var bgImage = dojo.html.getStyle(node, "background-image");
		
		var anim = dojo.lfx.propertyAnimation(node, [{
			property: "background-color",
			start: color,
			end: rgb
		}], duration, easing);

		var oldbb = (anim["beforeBegin"]) ? dojo.lang.hitch(anim, "beforeBegin") : function(){};
		anim.beforeBegin = function(){ 
			oldbb();
			if(bgImage){
				node.style.backgroundImage = "none";
			}
			node.style.backgroundColor = "rgb(" + color.toRgb().join(",") + ")";
		};

		var oldOnEnd = (anim["onEnd"]) ? dojo.lang.hitch(anim, "onEnd") : function(){};
		anim.onEnd = function(){ 
			oldOnEnd();
			if(callback){
				callback(node, anim);
			}
		};

		anims.push(anim);
	});

	if(nodes.length > 1){ return dojo.lfx.combine(anims); }
	else{ return anims[0]; }
}

dojo.lang.mixin(dojo.lfx, dojo.lfx.html);
