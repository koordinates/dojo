dojo.hostenv.startPackage("dojo.graphics.animation.Animation");

/*
Animation package based off of Dan Pupius' work on Animations:
http://pupius.co.uk/js/Toolkit.Drawing.js

This still needs lots of work, but some of the interfaces should
be exposed. Don't count on them being set in stone yet, sorry.
*/

dojo.animation.Animation = function() {
	// public properties
	this.curve = null;
	this.duration = 0;
	this.accel = 0;

	// public events
	this.onstart = function(){};
	this.onanimate = function(){};
	this.onend = function(){};
	this.onplay = function(){};
	this.onpause = function(){};
	this.onstop = function(){};
	this.handler = function() {};

	// public methods
	this.play = function(gotoStart) {
		active = true;
		paused = false;
	}

	this.pause = function() {
		if( active ) { paused = true; }
		cycle();
	}

	this.playPause = function() {
		if( paused ) {
			this.pause();
		} else {
			this.play();
		}
	}

	this.stop = function(gotoEnd) {
		if( gotoEnd ) {
			// TODO: play last frame
		}
		active = false;
		paused = false;
	}

	// FIXME: maybe make enums? or do we even need this?
	this.status = function() {
		if( active ) {
			return paused ? "paused" : "playing";
		} else {
			return "stopped";
		}
	}

	// private properties
	// FIXME: some of these we may want to be public?
	var startTime = null,
		endTime = null,
		percent = 0,
		active = false,
		paused = false;

	// private methods
	function cycle() {
		if( active ) {
			var e = new dojo.animation.AnimationEvent(); // TODO: fill in
			this.onanimate(e);
			this.handler(e);
		}
	}
}

// FIXME: maybe add reference to the Animation object?
dojo.animation.AnimationEvent = function(type, coords, sTime, cTime, eTime, dur, pct, fps) {
	this.type = type; // "animate", "start", "end", "play", "pause", "stop"
	this.coords = coords;
	this.startTime = sTime;
	this.currentTime = cTime;
	this.endTime = eTime;
	this.duration = dur;
	this.percent = pct;
	this.fps = fps;
}
