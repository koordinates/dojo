dojo.hostenv.startPackage("dojo.graphics.htmlEffects");

dojo.hostenv.loadModule("dojo.animation.*");
dojo.hostenv.loadModule("dojo.xml.htmlUtil");

dojo.graphics.htmlEffects = new function() {
	this.fadeOut = function(node, duration, callback) {
		return this.fade(node, duration, dojo.xml.htmlUtil.getOpacity(node), 0, callback);
	}

	this.fadeIn = function(node, duration, callback) {
		return this.fade(node, duration, dojo.xml.htmlUtil.getOpacity(node), 0.99999, callback);
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
		return this.slide(node, [node.offsetLeft, node.offsetTop], endCoords,
			duration, callback);
	}

	this.slideBy = function(node, coords, duration, callback) {
		return this.slideTo(node, [node.offsetLeft+coords[0], node.offsetTop+coords[1]],
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
}
