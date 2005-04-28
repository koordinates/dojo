dojo.hostenv.startPackage("dojo.animation");
dojo.hostenv.startPackage("dojo.animation.Animation");

dojo.hostenv.loadModule("dojo.math.curves");

/*
Animation package based off of Dan Pupius' work on Animations:
http://pupius.co.uk/js/Toolkit.Drawing.js

TODO:
- Implement accelleration
*/

dojo.animation = {};

dojo.animation.Animation = function(curve, duration, accel) {
	var _this = this;

	// public properties
	this.curve = curve;
	this.duration = duration;
	this.accel = accel;
	this.animSequence_ = null;

	// public events
	this.onBegin = function(){};
	this.onAnimate = function(){};
	this.onEnd = function(){};
	this.onPlay = function(){};
	this.onPause = function(){};
	this.onStop = function(){};
	this.handler = function() {}; // catch-all handler

	// public methods
	this.play = function(gotoStart) {
		if( !active || gotoStart ) {
			percent = 0;
		}

		startTime = new Date().valueOf();
		if( paused ) {
			startTime -= (_this.duration * percent / 100);
		}
		endTime = startTime + _this.duration;
		lastFrame = startTime;

		var e = new dojo.animation.AnimationEvent(_this, null, _this.curve.getValue(percent),
			startTime, startTime, endTime, _this.duration, percent, 0);

		active = true;
		paused = false;

		if( percent == 0 ) {
			e.type = "begin";
			_this.handler(e);
			_this.onBegin(e);
		}

		e.type = "play";
		_this.handler(e);
		_this.onPlay(e);

		cycle();
	}

	this.pause = function() {
		clearTimeout(timer);
		if( active ) { paused = true; }
		var e = new dojo.animation.AnimationEvent(_this, "pause", _this.curve.getValue(percent),
			startTime, new Date().valueOf(), endTime, _this.duration, percent, 0);
		_this.handler(e);
		_this.onPause(e);
	}

	this.playPause = function() {
		if( !active || paused ) {
			_this.play();
		} else {
			_this.pause();
		}
	}

	this.gotoPercent = function(pct, andPlay) {
		clearTimeout(timer);
		active = true;
		paused = true;
		percent = pct;
		if( andPlay ) { this.play(); }
	}

	this.stop = function(gotoEnd) {
		clearTimeout(timer);
		var step = percent / 100;
		if( gotoEnd ) {
			step = 1;
		}
		var e = new dojo.animation.AnimationEvent(_this, "stop", _this.curve.getValue(step),
			startTime, new Date().valueOf(), endTime, _this.duration, percent, Math.round(fps));
		_this.handler(e);
		_this.onStop(e);
		active = false;
		paused = false;
	}

	this.status = function() {
		if( active ) {
			return paused ? "paused" : "playing";
		} else {
			return "stopped";
		}
	}

	// private properties
	var startTime = null,
		endTime = null,
		lastFrame = null,
		timer = null,
		percent = 0,
		active = false,
		paused = false;

	// private methods
	function cycle() {
		clearTimeout(timer);
		if( active ) {
			var curr = new Date().valueOf();
			var step = (curr - startTime) / (endTime - startTime);
			fps = 1000 / (curr - lastFrame);
			lastFrame = curr;

			if( step >= 1 ) {
				step = 1;
				percent = 100;
			} else {
				percent = step * 100;
			}

			var e = new dojo.animation.AnimationEvent(_this, "animate", _this.curve.getValue(step),
				startTime, curr, endTime, _this.duration, percent, Math.round(fps));

			_this.handler(e);
			_this.onAnimate(e);

			if( step < 1 ) {
				timer = setTimeout(cycle, 10);
			} else {
				e.type = "end";
				_this.handler(e);
				_this.onEnd(e);
				active = false;
				if( _this.animSequence_ ) {
					_this.animSequence_.playNext();
				}
			}
		}
	}
};

dojo.animation.AnimationEvent = function(anim, type, coords, sTime, cTime, eTime, dur, pct, fps) {
	this.type = type; // "animate", "begin", "end", "play", "pause", "stop"
	this.animation = anim;

	this.coords = coords;
	this.x = coords[0];
	this.y = coords[1];
	this.z = coords[2];

	this.startTime = sTime;
	this.currentTime = cTime;
	this.endTime = eTime;

	this.duration = dur;
	this.percent = pct;
	this.fps = fps;
};

dojo.animation.AnimationSequence = function() {
	var anims = [];
	var currAnim = -1;

	// event handlers
	this.onBegin = function(){};
	this.onEnd = function(){};
	this.onNext = function(){};
	this.handler = function(){};

	this.add = function() {
		for(var i = 0; i < arguments.length; i++) {
			anims.push(arguments[i]);
			arguments[i].animSequence_ = this;
		}
	}

	this.remove = function(anim) {
		for(var i = 0; i < anims.length; i++) {
			if( anims[i] == anim ) {
				anims[i].animSequence_ = null;
				anims.splice(i, 1);
				break;
			}
		}
	}

	this.removeAll = function() {
		for(var i = 0; i < anims.length; i++) {
			anims[i].animSequence_ = null;
		}
		anims = [];
		currAnim = -1;
	}

	this.play = function(gotoStart) {
		if( anims.length == 0 ) { return; }
		if( gotoStart || !anims[currAnim] ) {
			currAnim = 0;
		}
		if( anims[currAnim] ) {
			if( currAnim == 0 ) {
				var e = {type: "begin", animation: anims[currAnim]};
				this.handler(e);
				this.onBegin(e);
			}
			anims[currAnim].play(gotoStart);
		}
	}

	this.pause = function() {
		if( anims[currAnim] ) {
			anims[currAnim].pause();
		}
	}

	this.playPause = function() {
		if( anims.length == 0 ) { return; }
		if( currAnim == -1 ) { currAnim = 0; }
		if( anims[currAnim] ) {
			anims[currAnim].playPause();
		}
	}

	this.stop = function() {
		if( anims[currAnim] ) {
			anims[currAnim].stop();
		}
	}

	this.status = function() {
		if( anims[currAnim] ) {
			return anims[currAnim].status();
		} else {
			return "stopped";
		}
	}

	this.playNext = function() {
		if( currAnim == -1 || anims.length == 0 ) { return; }
		currAnim++;
		if( anims[currAnim] ) {
			var e = {type: "next", animation: anims[currAnim]};
			this.handler(e);
			this.onNext(e);
			anims[currAnim].play(true);
		} else {
			var e = {type: "end", animation: anims[anims.length-1]};
			this.handler(e);
			this.onEnd(e);
			currAnim = -1;
		}
	}
};
