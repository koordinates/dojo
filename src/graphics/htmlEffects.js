dojo.hostenv.startPackage("dojo.graphics.htmlEffects");

dojo.hostenv.loadModule("dojo.animation.*");
dojo.hostenv.loadModule("dojo.xml.*");
dojo.hostenv.loadModule("dojo.event.*");

dojo.graphics.htmlEffects = new function() {
	this.fadeOut = function(node, duration, cbObj, callback) {
		return this.fade(node, duration, dojo.xml.htmlUtil.getOpacity(node), 0, cbObj, callback);
	}

	this.fadeIn = function(node, duration, cbObj, callback) {
		return this.fade(node, duration, dojo.xml.htmlUtil.getOpacity(node), 0.99999, cbObj, callback);
	}

	this.fade = function(node, duration, startOpac, endOpac, cbObj, callback) {
		var anim = new dojo.animation.Animation(
			new dojo.math.curves.Line([startOpac],[endOpac]),
			duration, 0);
		dojo.event.connect(anim, "onAnimate", function(e) {
			dojo.xml.htmlUtil.setOpacity(node, e.x);
		});
		if( typeof callback == "function" ) {
			var cbArr = dojo.event.createFunctionPair(cbObj, callback);
			dojo.event.connect(anim, "onEnd", cbArr[0], cbArr[1]);
		}
		anim.play(true);
		return anim;
	}
	
	this.slideTo = function(node, endCoords, duration, cbObj, callback) {
		return this.slide(node, [node.offsetLeft, node.offsetTop], endCoords,
			duration, cbObj, callback);
	}

	this.slideBy = function(node, coords, duration, cbObj, callback) {
		return this.slideTo(node, [node.offsetLeft+coords[0], node.offsetTop+coords[1]],
			duration, cbObj, callback);
	}
	
	this.slide = function(node, startCoords, endCoords, duration, cbObj, callback) {
		var anim = new dojo.animation.Animation(
			new dojo.math.curves.Line(startCoords, endCoords),
			duration, 0);
		dojo.event.connect(anim, "onAnimate", function(e) {
			with( node.style ) {
				left = e.x + "px";
				top = e.y + "px";
			}
		});
		if( typeof callback == "function" ) {
			var cbArr = dojo.event.createFunctionPair(cbObj, callback);
			dojo.event.connect(anim, "onEnd", cbArr[0], cbArr[1]);
		}
		anim.play(true);
		return anim;
	}

	// Fade from startRGB to the node's background color
	this.colorFadeIn = function(node, startRGB, duration, delay, cbObj, callback) {
		var color = dojo.xml.htmlUtil.getBackgroundColor(node);
		if( color.length == 4 ) {
			wasTransparent = true;
			color.pop();
		}

		var anim = this.colorFade(node, startRGB, color, duration, cbObj, callback, true);
		dojo.event.connect(anim, "onEnd", function(e) {
			if( wasTransparent ) {
				node.style.backgroundColor = "transparent";
			}
		});
		if( delay > 0 ) {
			node.style.backgroundColor = "rgb(" + startRGB.join(",") + ")";
			setTimeout(function(){anim.play(true)}, delay);
		} else {
			anim.play(true);
		}
		return anim;
	}
	// alias for (probably?) common use/terminology
	this.highlight = this.colorFadeIn;
	this.colorFadeFrom = this.colorFadeIn;

	// Fade from node's background color to endRGB
	this.colorFadeOut = function(node, endRGB, duration, delay, cbObj, callback) {
		var color = dojo.xml.htmlUtil.getBackgroundColor(node);
		if( color.length == 4 ) { color.pop(); }

		var anim = this.colorFade(node, color, endRGB, duration, cbObj, callback, delay > 0);
		if( delay > 0 ) {
			node.style.backgroundColor = "rgb(" + color.join(",") + ")";
			setTimeout(function(){anim.play(true)}, delay);
		}
		return anim;
	}
	// FIXME: not sure which name is better. an alias here may be bad.
	this.unhighlight = this.colrFadeOut;
	this.colorFadeTo = this.colorFadeOut;

	// Fade node background from startRGB to endRGB
	this.colorFade = function(node, startRGB, endRGB, duration, cbObj, callback, dontPlay) {
		var anim = new dojo.animation.Animation(
			new dojo.math.curves.Line(startRGB, endRGB),
			duration, 0);
		dojo.event.connect(anim, "onAnimate", function(e) {
			node.style.backgroundColor = "rgb(" + e.coordsAsInts().join(",") + ")";
		});
		if( typeof callback == "function" ) {
			var cbArr = dojo.event.createFunctionPair(cbObj, callback);
			dojo.event.connect(anim, "onEnd", cbArr[0], cbArr[1]);
		}
		if( !dontPlay ) { anim.play(true); }
		return anim;
	}

	// assume we get a node with display:none
	// So this is less than ideal, but I can't seem to get clipping to play nicely.
	// What we do is create a box and move the node into the box and change the
	// height of the box until it is the correct height. At the end, the node is put
	// back where it belongs and the extra box is removed.
	this.wipeIn = function(node, duration, cbObj, callback, dontPlay) {
		var parent = node.parentNode;
		if( !parent ) return;

		// box
		var box = document.createElement("span"); // less likely to be styled
		with(box.style) {
			display = "block";
			overflow = "hidden";
			border = padding = margin = "0";
			height = "0px";
		}
		parent.insertBefore(box, node);
		box.appendChild(node);
		node.style.display = "block";
		var height = node.offsetHeight;

		var abs = dojo.xml.domUtil.getStyle(node, "position") == "absolute";
		if(abs) {
			// FIXME: may not work well if position is specified with right or bottom
			box.style.position = "absolute";
			box.style.top = dojo.xml.domUtil.getStyle(node, "top") || 0;
			box.style.left = dojo.xml.domUtil.getStyle(node, "left") || 0;
			node.style.position = "static";
		}
		var anim = new dojo.animation.Animation(
			new dojo.math.curves.Line([0], [node.offsetHeight]),
			duration, 0);
		dojo.event.connect(anim, "onAnimate", function(e) {
			box.style.height = Math.round(e.x) + "px";
		});
		dojo.event.connect(anim, "onEnd", function(e) {
			parent.insertBefore(node, box);
			if(abs) {
				node.style.position = "absolute";
			}
			parent.removeChild(box);
		});
		if( typeof callback == "function" ) {
			var cbArr = dojo.event.createFunctionPair(cbObj, callback);
			dojo.event.connect(anim, "onEnd", cbArr[0], cbArr[1]);
		}
		if( !dontPlay ) { anim.play(true); }
		return anim;
	}
}
