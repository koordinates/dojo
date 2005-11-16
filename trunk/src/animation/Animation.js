dojo.provide("dojo.animation");
dojo.provide("dojo.animation.Animation");

dojo.require("dojo.lang");
dojo.require("dojo.math");
dojo.require("dojo.math.curves");

/*
Animation package based off of Dan Pupius' work on Animations:
http://pupius.co.uk/js/Toolkit.Drawing.js

TODO:
- make animations reusable by not killing repeatCount as we go
*/

dojo.animation = {};

dojo.animation.Animation = function(curve, duration, accel, repeatCount) {
	// public properties
	this.curve = curve;
	this.duration = duration;
	this.repeatCount = repeatCount || 0;
	this.animSequence_ = null;
	if(accel) {
		if(dojo.lang.isFunction(accel.getValue)) {
			this.accel = accel;
		} else {
			var i = 0.35*accel+0.5;	// 0.15 <= i <= 0.85
			this.accel = new dojo.math.curves.CatmullRom([[0], [i], [1]], 0.45);
		}
	}

	// public events
	this.onBegin = null;
	this.onAnimate = null;
	this.onEnd = null;
	this.onPlay = null;
	this.onPause = null;
	this.onStop = null;
	this.handler = null; // catch-all handler

	// private properties
	var startTime = null,
		endTime = null,
		lastFrame = null,
		timer = null,
		percent = 0,
		active = false,
		paused = false;

	// public methods
	this.play = function(gotoStart) {
		if( gotoStart ) {
			clearTimeout(timer);
			active = false;
			paused = false;
			percent = 0;
		} else if( active && !paused ) {
			return;
		}

		startTime = new Date().valueOf();
		if( paused ) {
			startTime -= (this.duration * percent / 100);
		}
		endTime = startTime + this.duration;
		lastFrame = startTime;

		var e = new dojo.animation.AnimationEvent(this, null, this.curve.getValue(percent),
			startTime, startTime, endTime, this.duration, percent, 0);

		active = true;
		paused = false;

		if( percent == 0 ) {
			e.type = "begin";
			if(typeof this.handler == "function") { this.handler(e); }
			if(typeof this.onBegin == "function") { this.onBegin(e); }
		}

		e.type = "play";
		if(typeof this.handler == "function") { this.handler(e); }
		if(typeof this.onPlay == "function") { this.onPlay(e); }

		if(this.animSequence_) { this.animSequence_.setCurrent(this); }

		dojo.lang.hitch(this, cycle)();
	}

	this.pause = function() {
		clearTimeout(timer);
		if( !active ) { return; }
		paused = true;
		var e = new dojo.animation.AnimationEvent(this, "pause", this.curve.getValue(percent),
			startTime, new Date().valueOf(), endTime, this.duration, percent, 0);
		if(typeof this.handler == "function") { this.handler(e); }
		if(typeof this.onPause == "function") { this.onPause(e); }
	}

	this.playPause = function() {
		if( !active || paused ) {
			this.play();
		} else {
			this.pause();
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
		var e = new dojo.animation.AnimationEvent(this, "stop", this.curve.getValue(step),
			startTime, new Date().valueOf(), endTime, this.duration, percent, Math.round(fps));
		if(typeof this.handler == "function") { this.handler(e); }
		if(typeof this.onStop == "function") { this.onStop(e); }
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
			
			// Perform accelleration
			if(this.accel && this.accel.getValue) {
				step = this.accel.getValue(step);
			}

			var e = new dojo.animation.AnimationEvent(this, "animate", this.curve.getValue(step),
				startTime, curr, endTime, this.duration, percent, Math.round(fps));

			if(typeof this.handler == "function") { this.handler(e); }
			if(typeof this.onAnimate == "function") { this.onAnimate(e); }

			if( step < 1 ) {
				timer = setTimeout(dojo.lang.hitch(this, cycle), 10);
			} else {
				e.type = "end";
				active = false;
				if(typeof this.handler == "function") { this.handler(e); }
				if(typeof this.onEnd == "function") { this.onEnd(e); }
				if( this.repeatCount > 0 ) {
					this.repeatCount--;
					this.play(true);
				} else if( this.repeatCount == -1 ) {
					this.play(true);
				} else if( this.animSequence_ ) {
					this.animSequence_.playNext();
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

	this.coordsAsInts = function() {
		var cints = new Array(this.coords.length);
		for(var i = 0; i < this.coords.length; i++) {
			cints[i] = Math.round(this.coords[i]);
		}
		return cints;
	}

	return this;
};

dojo.animation.AnimationSequence = function(repeatCount) {
	var anims = [];
	var currAnim = -1;

	this.repeatCount = repeatCount || 0;

	// event handlers
	this.onBegin = null;
	this.onEnd = null;
	this.onNext = null;
	this.handler = null;

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
				if(typeof this.handler == "function") { this.handler(e); }
				if(typeof this.onBegin == "function") { this.onBegin(e); }
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

	this.setCurrent = function(anim) {
		for(var i = 0; i < anims.length; i++) {
			if( anims[i] == anim ) {
				currAnim = i;
				break;
			}
		}
	}

	this.playNext = function() {
		if( currAnim == -1 || anims.length == 0 ) { return; }
		currAnim++;
		if( anims[currAnim] ) {
			var e = {type: "next", animation: anims[currAnim]};
			if(typeof this.handler == "function") { this.handler(e); }
			if(typeof this.onNext == "function") { this.onNext(e); }
			anims[currAnim].play(true);
		} else {
			var e = {type: "end", animation: anims[anims.length-1]};
			if(typeof this.handler == "function") { this.handler(e); }
			if(typeof this.onEnd == "function") { this.onEnd(e); }
			if(this.repeatCount > 0) {
				currAnim = 0;
				this.repeatCount--;
				anims[currAnim].play(true);
			} else if(this.repeatCount == -1) {
				currAnim = 0;
				anims[currAnim].play(true);
			} else {
				currAnim = -1;
			}
		}
	}
};
