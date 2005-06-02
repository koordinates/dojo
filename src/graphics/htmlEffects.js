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
		var cbArr = dojo.event.createFunctionPair(cbObj, callback);
		if( cbArr ) {
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
		var cbArr = dojo.event.createFunctionPair(cbObj, callback);
		if( cbArr ) {
			dojo.event.connect(anim, "onEnd", cbArr[0], cbArr[1]);
		}
		anim.play(true);
		return anim;
	}

	// Fade from startRGB to the node's background color
	this.colorFadeIn = function(node, startRGB, duration, delay, cbObj, callback) {
		var color = dojo.xml.htmlUtil.getBackgroundColor(node);
		var bg = dojo.xml.domUtil.getStyle(node, "background-color").toLowerCase();
		var wasTransparent = bg == "transparent" || bg == "rgba(0, 0, 0, 0)";
		while(color.length > 3) { color.pop(); }
		while(startRGB.length > 3) { startRGB.pop(); }

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
		while(color.length > 3) { color.pop(); }
		while(endRGB.length > 3) { endRGB.pop(); }

		var anim = this.colorFade(node, color, endRGB, duration, cbObj, callback, delay > 0);
		if( delay > 0 ) {
			node.style.backgroundColor = "rgb(" + color.join(",") + ")";
			setTimeout(function(){anim.play(true)}, delay);
		}
		return anim;
	}
	// FIXME: not sure which name is better. an alias here may be bad.
	this.unhighlight = this.colorFadeOut;
	this.colorFadeTo = this.colorFadeOut;

	// Fade node background from startRGB to endRGB
	this.colorFade = function(node, startRGB, endRGB, duration, cbObj, callback, dontPlay) {
		while(startRGB.length > 3) { startRGB.pop(); }
		while(endRGB.length > 3) { endRGB.pop(); }
		var anim = new dojo.animation.Animation(
			new dojo.math.curves.Line(startRGB, endRGB),
			duration, 0);
		dojo.event.connect(anim, "onAnimate", function(e) {
			node.style.backgroundColor = "rgb(" + e.coordsAsInts().join(",") + ")";
		});
		var cbArr = dojo.event.createFunctionPair(cbObj, callback);
		if( cbArr ) {
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
		var cbArr = dojo.event.createFunctionPair(cbObj, callback);
		if( cbArr ) {
			dojo.event.connect(anim, "onEnd", cbArr[0], cbArr[1]);
		}
		if( !dontPlay ) { anim.play(true); }
		return anim;
	}

	this.explode = function(startNode, endNode, duration, cbObj, callback) {
		var outline = document.createElement("div");
		with(outline.style) {
			position = "absolute";
			border = "1px solid black";
			display = "none";
		}
		document.body.appendChild(outline);

		with(endNode.style) {
			visibility = "hidden";
			display = "block";
		}
		var endCoords = [
			dojo.xml.htmlUtil.getAbsoluteX(endNode),
			dojo.xml.htmlUtil.getAbsoluteY(endNode),
			dojo.xml.htmlUtil.getInnerWidth(endNode),
			dojo.xml.htmlUtil.getInnerHeight(endNode)
		];
		with(endNode.style) {
			display = "none";
			visibility = "visible";
		}

		var anim = new dojo.animation.Animation(
			new dojo.math.curves.Line([
				dojo.xml.htmlUtil.getAbsoluteX(startNode),
				dojo.xml.htmlUtil.getAbsoluteY(startNode),
				dojo.xml.htmlUtil.getInnerWidth(startNode),
				dojo.xml.htmlUtil.getInnerHeight(startNode)
			],
			endCoords),
			duration, 0
		);
		dojo.event.connect(anim, "onBegin", function(e) {
			outline.style.display = "block";
		});
		dojo.event.connect(anim, "onAnimate", function(e) {
			with(outline.style) {
				left = e.x + "px";
				top = e.y + "px";
				width = e.coords[2] + "px";
				height = e.coords[3] + "px";
			}
		});

		var cbArr = dojo.event.createFunctionPair(cbObj, callback);
		if( cbArr ) {
			dojo.event.connect(anim, "onEnd", cbArr[0], cbArr[1]);
		}
		dojo.event.connect(anim, "onEnd", function() {
			endNode.style.display = "block";
			outline.parentNode.removeChild(outline);
		});
		anim.play();
		return anim;
	}

	this.implode = function(startNode, endNode, duration, cbObj, callback) {
		var outline = document.createElement("div");
		with(outline.style) {
			position = "absolute";
			border = "1px solid black";
			display = "none";
		}
		document.body.appendChild(outline);

		var anim = new dojo.animation.Animation(
			new dojo.math.curves.Line([
				dojo.xml.htmlUtil.getAbsoluteX(startNode),
				dojo.xml.htmlUtil.getAbsoluteY(startNode),
				dojo.xml.htmlUtil.getInnerWidth(startNode),
				dojo.xml.htmlUtil.getInnerHeight(startNode)
			],
			[
				dojo.xml.htmlUtil.getAbsoluteX(endNode),
				dojo.xml.htmlUtil.getAbsoluteY(endNode),
				dojo.xml.htmlUtil.getInnerWidth(endNode),
				dojo.xml.htmlUtil.getInnerHeight(endNode)
			]),
			duration, 0
		);
		dojo.event.connect(anim, "onBegin", function(e) {
			startNode.style.display = "none";
			outline.style.display = "block";
		});
		dojo.event.connect(anim, "onAnimate", function(e) {
			with(outline.style) {
				left = e.x + "px";
				top = e.y + "px";
				width = e.coords[2] + "px";
				height = e.coords[3] + "px";
			}
		});

		var cbArr = dojo.event.createFunctionPair(cbObj, callback);
		if( cbArr ) {
			dojo.event.connect(anim, "onEnd", cbArr[0], cbArr[1]);
		}
		dojo.event.connect(anim, "onEnd", function() {
			outline.parentNode.removeChild(outline);
		});
		anim.play();
		return anim;
	}
}

dojo.graphics.htmlEffects.Exploder = function(triggerNode, boxNode) {
	var _this = this;

	// custom options
	this.waitToHide = 500;
	this.timeToShow = 100;
	this.waitToShow = 200;
	this.timeToHide = 70;
	this.autoShow = false;
	this.autoHide = false;

	var animShow = null;
	var animHide = null;

	var showTimer = null;
	var hideTimer = null;

	var startCoords = null;
	var endCoords = null;

	var showing = false;

	this.timeShow = function() {
		clearTimeout(showTimer);
		showTimer = setTimeout(_this.show, _this.waitToShow);
	}

	this.show = function() {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		triggerNode.blur();

		if( (animHide && animHide.status() == "playing")
			|| (animShow && animShow.status() == "playing")
			|| showing ) { return; }

		animShow = dojo.graphics.htmlEffects.explode(triggerNode, boxNode, _this.timeToShow, function(e) {
			showing = true;
		});
	}

	this.timeHide = function() {
		clearTimeout(hideTimer);
		hideTimer = setTimeout(_this.hide, _this.waitToHide);
	}

	this.hide = function() {
		clearTimeout(showTimer);
		clearTimeout(hideTimer);
		if( !showing || (animShow && animShow.status() == "playing") ) {
			return;
		}

		showing = false;
		animHide = dojo.graphics.htmlEffects.implode(boxNode, triggerNode, _this.timeToHide);
	}

	// trigger events
	dojo.event.connect(triggerNode, "onclick", function(e) {
		if(showing) {
			_this.hide();
		} else {
			_this.show();
		}
	});
	dojo.event.connect(triggerNode, "onmouseover", function(e) {
		if(_this.autoShow) {
			_this.timeShow();
		}
	});
	dojo.event.connect(triggerNode, "onmouseout", function(e) {
		if(_this.autoHide) {
			_this.timeHide();
		}
	});

	// box events
	dojo.event.connect(boxNode, "onmouseover", function(e) {
		clearTimeout(hideTimer);
	});
	dojo.event.connect(boxNode, "onmouseout", function(e) {
		if(_this.autoHide) {
			_this.timeHide();
		}
	});

	// document events
	dojo.event.connect(document.documentElement || document.body, "onclick", function(e) {
		if(_this.autoHide
			&& !dojo.xml.domUtil.isChildOf(e.target, boxNode)
			&& !dojo.xml.domUtil.isChildOf(e.target, triggerNode) ) {
			_this.hide();
		}
	});

	return this;
}
