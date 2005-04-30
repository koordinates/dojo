dojo.hostenv.startPackage("dojo.graphics.htmlEffects");

dojo.hostenv.loadModule("dojo.animation.*");
dojo.hostenv.loadModule("dojo.xml.*");

dojo.graphics.htmlEffects = new function() {
	var _this = this;

	this.fadeOut = function(node, duration, callback) {
		return _this.fade(node, duration, dojo.xml.htmlUtil.getOpacity(node), 0, callback);
	}

	this.fadeIn = function(node, duration, callback) {
		return _this.fade(node, duration, dojo.xml.htmlUtil.getOpacity(node), 0.99999, callback);
	}

	this.fade = function(node, duration, startOpac, endOpac, callback) {
		var anim = new dojo.animation.Animation(
			new dojo.math.curves.Line([startOpac],[endOpac]),
			duration, 0);
		anim.onAnimate = function(e) {
			dojo.xml.htmlUtil.setOpacity(node, e.x);
		}
		if( typeof callback == "function" ) {
			anim.onEnd = function(e) {
				callback(node);
			}
		}
		anim.play(true);
		return anim;
	}
	
	this.slideTo = function(node, endCoords, duration, callback) {
		return _this.slide(node, [node.offsetLeft, node.offsetTop], endCoords,
			duration, callback);
	}

	this.slideBy = function(node, coords, duration, callback) {
		return _this.slideTo(node, [node.offsetLeft+coords[0], node.offsetTop+coords[1]],
			duration, callback);
	}
	
	this.slide = function(node, startCoords, endCoords, duration, callback) {
		var anim = new dojo.animation.Animation(
			new dojo.math.curves.Line(startCoords, endCoords),
			duration, 0);
		anim.onAnimate = function(e) {
			with( node.style ) {
				left = e.x + "px";
				top = e.y + "px";
			}
		}
		if( typeof callback == "function" ) {
			anim.onEnd = function(e) {
				callback(node);
			}
		}
		anim.play(true);
		return anim;
	}

	// Fade from startRGB to the node's background color
	this.colorFadeIn = function(node, startRGB, duration, delay, callback) {
		var color, nd = node, wasTransparent = false;
		do {
			color = dojo.xml.domUtil.getStyle(nd, "background-color");
			if(nd == document.body) { nd = null; break; }
			if(nd == node && color == "transparent") { wasTransparent = true; }
			nd = nd.parentNode;
		} while(nd && color == "transparent");

		if( color == "transparent" ) {
			color = [255, 255, 255];
		} else {
			color = dojo.xml.domUtil.extractRGB(color);
		}

		var anim = _this.colorFade(node, startRGB, color, duration, function() {
			if( wasTransparent ) {
				node.style.backgroundColor = "transparent";
			}
			if( typeof callback == "function" ) {
				callback(node);
			}
		}, delay > 0);
		anim.onAnimate({x:startRGB[0], y:startRGB[1], z:startRGB[2]});
		if( delay > 0 ) {
			setTimeout(function(){anim.play(true)}, delay);
		}
		return anim;
	}

	// alias for (probably?) common use/terminology
	this.highlight = this.colorFadeIn;

	// Fade from node's background color to endRGB
	this.colorFadeOut = function(node, endRGB, duration, delay, callback) {
		var color, nd = node;
		do {
			color = dojo.xml.domUtil.getStyle(nd, "background-color");
			if(nd == document.body) { nd = null; break; }
			nd = nd.parentNode;
		} while(nd && color == "transparent");

		if( color == "transparent" ) {
			color = [255, 255, 255];
		} else {
			color = dojo.xml.domUtil.extractRGB(color);
		}

		var anim = _this.colorFade(node, color, endRGB, duration, callback, delay > 0);
		anim.onAnimate({x:color[0], y:color[1], z:color[2]});
		if( delay > 0 ) {
			setTimeout(function(){anim.play(true)}, delay);
		}
		return anim;
	}

	// FIXME: not sure which name is better. an alias here may be bad.
	this.colorFadeTo = this.colorFadeOut;

	// Fade node background from startRGB to endRGB
	this.colorFade = function(node, startRGB, endRGB, duration, callback, dontPlay) {
		var anim = new dojo.animation.Animation(
			new dojo.math.curves.Line(startRGB, endRGB),
			duration, 0);
		anim.onAnimate = function(e) {
			var rgb = [Math.round(e.x), Math.round(e.y), Math.round(e.z)];
			node.style.backgroundColor = "rgb(" + rgb.join(",") + ")";
		}
		if( typeof callback == "function" ) {
			anim.onEnd = function(e) {
				callback(node);
			}
		}
		if( !dontPlay ) { anim.play(true); }
		return anim;
	}

	this.zigTo = function(node, points, duration, callback) {
		points.splice(0, 1, [node.offsetLeft, node.offsetTop]);
		return _this.zig(node, points, duration, callback);
	}

	this.zig = function(node, points, duration, callback) {
		// FIXME: waiting for math.curves.OpenPolygon
		dj_unimplemented("dojo.graphics.htmlEffects.zig");
	}
}
