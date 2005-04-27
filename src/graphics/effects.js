dojo.hostenv.startPackage("dojo.graphics.effects");

dojo.hostenv.loadModule("dojo.animation.*");
// FIXME: need support for other hostenvs
dojo.hostenv.loadModule("dojo.xml.htmlUtil");

dojo.graphics.effects = new function() {
	this.fadeOut = function(node, duration, callback) {
		this.fade(node, duration, dojo.xml.htmlUtil.getOpacity(node), 0, callback);
	}

	this.fadeIn = function(node, duration, callback) {
		this.fade(node, duration, dojo.xml.htmlUtil.getOpacity(node), 0.99999, callback);
	}

	this.fade = function(node, duration, startOpac, endOpac, callback) {
		var anim = new dojo.animation.Animation(
			new dojo.math.curves.Line([startOpac],[endOpac]),
			duration, 0);
		anim.onAnimate = function(e) {
			dojo.xml.htmlUtil.setOpacity(node, e.x);
		}
		if( typeof callback == "function" ) {
			anim.onEnd = callback;
		}
		anim.play(true);
	}
}
