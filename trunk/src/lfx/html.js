dojo.provide("dojo.lfx.html");
dojo.require("dojo.lfx.Animation");

dojo.require("dojo.html");
dojo.require("dojo.event");
dojo.require("dojo.lang.func");

dojo.lfx.html.propertyAnimation = function(/*DOMNode*/ node, /*Array*/ propertyMap, /*int*/ duration,/*function*/ easing){
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
		dojo.lang.forEach(style, function(s){
			if(s.property == "opacity"){
				dojo.style.setOpacity(n, s.value);
			}else if(dojo.lang.isArray(s.value)){
				node.style[dojo.style.toCamelCase(s.property)] = (s.units||"rgb") + "(" + coordsAsInts(s.value).join(",") + ")";
			}else{
				node.style[dojo.style.toCamelCase(s.property)] = s.value + s.units;
			}
		});
	}
	var propLine = function(properties){
		this._properties = properties;
		this.diffs = new Array(properties.length);
		dojo.lang.forEach(properties, dojo.lang.hitch(this, function(prop, i){
			// calculate the end - start to optimize a bit
			if(dojo.lang.isArray(prop.start)){
				// don't loop through the arrays
				this.diffs[i] = null;
			}else{
				this.diffs[i] = prop.end - prop.start;
			}
		}));
		this.getValue = function(n){
			var ret = new Array(this._properties.length);
			dojo.lang.forEach(this._properties, dojo.lang.hitch(this, function(prop, i){
				var value = null;
				var units = null;
				if(dojo.lang.isArray(prop.start)){
					value = new Array(prop.start.length);
					units = prop.units||"rgb";
					for(var j = 0 ; j < prop.start.length ; j++){
						value[j] = ((Math.round(prop.end[j]) - Math.round(prop.start[j])) * n) + Math.round(prop.start[j]);
					}
				}else{
					value = ((this.diffs[i]) * n) + prop.start;
					units = prop.units||"px";
				}
				ret[i] = {
					property: prop.property,
					value: value,
					units: units
				};
			}));
			return ret;
		}
	}
	var node = dojo.byId(node);
	
	var anim = new dojo.lfx.Animation(duration, new propLine(propertyMap), easing);
	
	dojo.event.connect(anim, "onAnimate", function(propValues){ setStyle(node, propValues); });
	
	return anim;
}

dojo.lfx.html._makeFadeable = function(node){
	if(dojo.render.html.ie){
		// only set the zoom if the "tickle" value would be the same as the
		// default
		if( (node.style.zoom.length == 0) &&
			(dojo.style.getStyle(node, "zoom") == "normal") ){
			// make sure the node "hasLayout"
			// NOTE: this has been tested with larger and smaller user-set text
			// sizes and works fine
			node.style.zoom = "1";
			// node.style.zoom = "normal";
		}
		// don't set the width to auto if it didn't already cascade that way.
		// We don't want to f anyones designs
		if(	(node.style.width.length == 0) &&
			(dojo.style.getStyle(node, "width") == "auto") ){
			node.style.width = "auto";
		}
	}
}

dojo.lfx.html.fadeIn = function(node, duration, easing, callback){
	var node = dojo.byId(node);
	dojo.lfx.html._makeFadeable(node);
	var anim = dojo.lfx.propertyAnimation(node, [
		{	property: "opacity",
			start: dojo.style.getOpacity(node),
			end: 1 } ], duration, easing);
	if(callback){
		dojo.event.connect(anim, "onEnd", function(){
			callback(node, anim);
		});
	}

	return anim;
}

dojo.lfx.html.fadeOut = function(node, duration, easing, callback){
	var node = dojo.byId(node);
	dojo.lfx.html._makeFadeable(node);
	var anim = dojo.lfx.propertyAnimation(node, [
		{	property: "opacity",
			start: dojo.style.getOpacity(node),
			end: 0 } ], duration, easing);
	if(callback){
		dojo.event.connect(anim, "onEnd", function(){
			callback(node, anim);
		});
	}

	return anim;
}

dojo.lfx.html.fadeShow = function(node, duration, easing, callback){
	var anim = dojo.lfx.html.fadeIn(node, duration, easing, callback);
	dojo.event.connect(anim, "onBegin", function(){ dojo.style.show(node); });
	
	return anim;
}

dojo.lfx.html.fadeHide = function(node, duration, easing, callback){
	var anim = dojo.lfx.html.fadeOut(node, duration, easing, function(){
		dojo.style.hide(node);
		if(callback){ callback(node, anim); }
	});
	
	return anim;
}

dojo.lfx.html.wipeIn = function(node, duration, easing, callback){
	var node = dojo.byId(node);
	var overflow = dojo.style.getStyle(node, "overflow");
	
	var init = function(){
		if(overflow == "visible") {
			node.style.overflow = "hidden";
		}
		dojo.style.show(node);
		node.style.height = 0;
	}
	init();
	
	var anim = dojo.lfx.propertyAnimation(node,
		[{	property: "height",
			start: 0,
			end: node.scrollHeight }], duration, easing);
	
	dojo.event.connect(anim, "onBegin", init);
	dojo.event.connect(anim, "onEnd", function(){
		node.style.overflow = overflow;
		node.style.height = "auto";
		if(callback){ callback(node, anim); }
	});
	
	return anim;
}

dojo.lfx.html.wipeOut = function(node, duration, easing, callback){
	var node = dojo.byId(node);
	var overflow = dojo.style.getStyle(node, "overflow");
	
	var init = function(){
		dojo.style.show(node);
		if(overflow == "visible") {
			node.style.overflow = "hidden";
		}
	}
	init();
	
	var anim = dojo.lfx.propertyAnimation(node,
		[{	property: "height",
			start: node.offsetHeight,
			end: 0 } ], duration, easing);
	
	dojo.event.connect(anim, "onBegin", init);
	dojo.event.connect(anim, "onEnd", function(){
		dojo.style.hide(node);
		node.style.overflow = overflow;
		if(callback){ callback(node, anim); }
	});

	return anim;
}

dojo.lfx.html.slideTo = function(node, coords, duration, easing, callback){
	var node = dojo.byId(node);
	var top = null;
	var left = null;
	var pos = null;
	
	var init = function(){
		top = node.offsetTop;
		left = node.offsetLeft;
		pos = dojo.style.getComputedStyle(node, 'position');

		if (pos == 'relative' || pos == 'static') {
			top = parseInt(dojo.style.getComputedStyle(node, 'top')) || 0;
			left = parseInt(dojo.style.getComputedStyle(node, 'left')) || 0;
		}
	}
	init();
	
	var anim = dojo.lfx.propertyAnimation(node,
		[{	property: "top",
			start: top,
			end: coords[0] },
		{	property: "left",
			start: left,
			end: coords[1] }], duration, easing);
	
	dojo.event.connect(anim, "onBegin", init);
	if(callback){
		dojo.event.connect(anim, "onEnd", function(){
			callback(node, anim);
		});
	}
	
	return anim;
}

dojo.lfx.html.explode = function(start, endNode, duration, easing, callback){
	var startCoords = dojo.style.toCoordinateArray(start);
	var outline = document.createElement("div");
	with(outline.style){
		position = "absolute";
		border = "1px solid black";
		display = "none";
	}
	document.body.appendChild(outline);

	endNode = dojo.byId(endNode);
	with(endNode.style){
		visibility = "hidden";
		display = "block";
	}
	var endCoords = dojo.style.toCoordinateArray(endNode);
	with(endNode.style){
		display = "none";
		visibility = "visible";
	}

	var anim = new dojo.lfx.Animation({
		onBegin: function(){
			dojo.style.show(outline);
		},
		onAnimate: function(value){
			with(outline.style){
				left = value[0] + "px";
				top = value[1] + "px";
				width = value[2] + "px";
				height = value[3] + "px";
			}
		},
		onEnd: function(){
			dojo.style.show(endNode);
			outline.parentNode.removeChild(outline);
		}
	}, duration, new dojo.lfx.Line(startCoords, endCoords), easing);
	if(callback){
		dojo.event.connect(anim, "onEnd", function(){
			callback(endNode, anim);
		});
	}
	return anim;
}

dojo.lfx.html.implode = function(startNode, end, duration, easing, callback){
	var startCoords = dojo.style.toCoordinateArray(startNode);
	var endCoords = dojo.style.toCoordinateArray(end);

	startNode = dojo.byId(startNode);
	var outline = document.createElement("div");
	with(outline.style){
		position = "absolute";
		border = "1px solid black";
		display = "none";
	}
	document.body.appendChild(outline);

	var anim = new dojo.lfx.Animation({
		onBegin: function(){
			dojo.style.hide(startNode);
			dojo.style.show(outline);
		},
		onAnimate: function(value){
			with(outline.style){
				left = value[0] + "px";
				top = value[1] + "px";
				width = value[2] + "px";
				height = value[3] + "px";
			}
		},
		onEnd: function(){
			outline.parentNode.removeChild(outline);
		}
	}, duration, new dojo.lfx.Line(startCoords, endCoords), easing);
	if(callback){
		dojo.event.connect(anim, "onEnd", function(){
			callback(startNode, anim);
		});
	}
	return anim;
}

dojo.lfx.html.highlight = function(node, startColor, delay, duration, easing, callback){
	node = dojo.byId(node);
	var color = dojo.style.getBackgroundColor(node);
	var bg = dojo.style.getStyle(node, "background-color").toLowerCase();
	var wasTransparent = (bg == "transparent" || bg == "rgba(0, 0, 0, 0)");
	while(color.length > 3) { color.pop(); }

	var rgb = new dojo.graphics.color.Color(startColor).toRgb();
	var endRgb = new dojo.graphics.color.Color(color).toRgb();

	var anim = dojo.lfx.propertyAnimation(node, [{
		property: "background-color",
		start: rgb,
		end: endRgb
	}], duration, easing);

	dojo.event.connect(anim, "onEnd", function(){
		if(wasTransparent){
			node.style.backgroundColor = "transparent";
		}
		if(callback){
			callback(node, anim);
		}
	});
	
	return anim;
}

dojo.lang.mixin(dojo.lfx, dojo.lfx.html);
