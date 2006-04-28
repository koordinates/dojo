dojo.provide("dojo.lfx.html");
dojo.require("dojo.lfx.Animation");

dojo.require("dojo.style");
dojo.require("dojo.event");
dojo.require("dojo.lang.func");

dojo.lfx.html.propertyAnimation = function(/*DOMNode*/ node, /*Array*/ propertyMap, /*int*/ duration,/*function*/ easing){
	if(dojo.lang.isFunction(duration)){
		easing = duration;
		duration = null;
	}
	var setStyle = function(n, style){
		n = dojo.byId(n);
		if(!n || !n.style){ return; }
		for(s in style){
			if(s == "opacity"){
				dojo.style.setOpacity(n, style[s].value);
			}else{
				node.style[dojo.style.toCamelCase(s)] = style[s].value + style[s].units;
			}
		}
	}
	var propLine = function(properties){
		this._properties = properties;
		dojo.lang.forEach(this._properties, dojo.lang.hitch(this, function(prop){
			// calculate the end - start to optimize a bit
			prop.diff = prop.end - prop.start;
		}));
		this.getValue = function(n){
			var results = {};
			dojo.lang.forEach(this._properties, function(prop){
				results[prop.property] = {
								// reduced version of ((end - start) * n) + start
								value: ((prop.diff) * n) + prop.start,
								units: prop.units||"px" 
				};
			});
			return results;
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
			start: 0,
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
			start: 1,
			end: 0 } ], duration, easing);
	if(callback){
		dojo.event.connect(anim, "onEnd", function(){
			callback(node, anim);
		});
	}

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

dojo.lang.mixin(dojo.lfx, dojo.lfx.html);