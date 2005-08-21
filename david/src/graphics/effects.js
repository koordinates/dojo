dojo.hostenv.startPackage("dojo.graphics.effects");

dojo.hostenv.loadModule("dojo.animation.*");

dojo.graphics.effects = new function() {
	this.fadeOut = function(node, duration, callback) {
		dj_unimplemented('dojo.graphics.effects.fadeOut');
	}

	this.fadeIn = function(node, duration, callback) {
		dj_unimplemented('dojo.graphics.effects.fadeIn');
	}

	this.fade = function(node, duration, startOpac, endOpac, callback) {
		dj_unimplemented('dojo.graphics.effects.fade');
	}

	this.slideTo = function(node, endCoords, duration, callback) {
		dj_unimplemented('dojo.graphics.effects.slideTo');
	}

	this.slideBy = function(node, coords, duration, callback) {
		dj_unimplemented('dojo.graphics.effects.slideBy');
	}

	this.slide = function(node, startCoords, endCoords, duration, callback) {
		dj_unimplemented('dojo.graphics.effects.slide');
	}
}
