dojo.provide("dojo.lfx.Animation");
dojo.provide("dojo.lfx.Line");

dojo.require("dojo.lang.func");

/*
	Animation package based on Dan Pupius' work: http://pupius.co.uk/js/Toolkit.Drawing.js
*/
dojo.lfx.Line = function(start, end){
	this.start = start;
	this.end = end;
	// calculate end - start to optimize a bit
	var diff = end - start;

	this.getValue = function(/*float*/ n){
		//	summary: returns the point on the line
		//	n: a floating point number greater than 0 and less than 1
		return (diff * n) + this.start;
	}
}

dojo.lfx.easeIn = function(n){
	//	summary: returns the point on an easing curve
	//	n: a floating point number greater than 0 and less than 1
	return ( n * n * n );
}

dojo.lfx.easeOut = function(n){
	//	summary: returns the point on the line
	//	n: a floating point number greater than 0 and less than 1
	return ( 1 - Math.pow(1 - n, 3) );
}

dojo.lfx.easeInOut = function(n){
	//	summary: returns the point on the line
	//	n: a floating point number greater than 0 and less than 1
	return ( (3 * n * n) - (2 * n * n * n) );
}

dojo.lfx.EasingTypes = {
	EASE_NONE: -1,
	EASE_IN: 0,
	EASE_OUT: 1,
	EASE_INOUT: 2
};

dojo.lang.defineClass("dojo.lfx.IAnimation", null, {
	// public properties
	curve: null,
	duration: 1000,
	easing: null,
	repeatCount: 0,
	rate: 25,
	
	// events
	handler: null,
	onBegin: null,
	onAnimate: null,
	onEnd: null,
	onPlay: null,
	onPause: null,
	onStop: null,
	
	// public methods
	play: null,
	pause: null,
	stop: null,
	
	fire: function(evt, args){
		if(this[evt]){ this[evt].apply(this, args); }
	},
	
	// private properties
	_active: false,
	_paused: false
});

dojo.lang.defineClass("dojo.lfx.Animation", dojo.lfx.IAnimation, {
	classConstructor: function(/*Object*/ handlers, /*int*/ duration, /*Array*/ curve, /*function*/ easing, /*int*/ repeatCount, /*int*/ rate){
		//	summary
		//		a generic animation object that fires callbacks into it's handlers
		//		object at various states
		//	handlers
		//		object { 
		//			handler: function(){}, 
		//			onstart: function(){}, 
		//			onstop: function(){}, 
		//			onanimate: function(){}
		//		}
		if(dojo.lang.isNumber(handlers)||(!handlers && duration.getValue)){
			// no handlers argument:
			rate = repeatCount;
			repeatCount = easing;
			easing = curve;
			curve = duration;
			duration = handlers;
			handlers = null;
		}else if(dojo.lang.isFunction(handlers)||dojo.lang.isArray(handlers)){
			// no handlers or duration:
			rate = easing;
			repeatCount = curve;
			easing = duration;
			curve = handlers;
			duration = null;
			handlers = null;
		}
		if(dojo.lang.isArray(curve)){
			this.curve = new dojo.lfx.Line(curve[0], curve[1]);
		}else{
			this.curve = curve;
		}
		if(duration){ this.duration = duration; }
		if(repeatCount){ this.repeatCount = repeatCount; }
		if(rate){ this.rate = rate; }
		if(handlers){
			this.handler = handlers.handler;
			this.beforeBegin = handlers.beforeBegin;
			this.onBegin = handlers.onBegin;
			this.onEnd = handlers.onEnd;
			this.onPlay = handlers.onPlay;
			this.onPause = handlers.onPause;
			this.onStop = handlers.onStop;
			this.onAnimate = handlers.onAnimate;
		}
		if(easing){
			if(dojo.lang.isFunction(easing)){
				this.easing=easing;
			}else{
				switch(easing){
					case 0:
					case "in":
						this.easing = dojo.lfx.easeIn;
						break;
					case 1:
					case "out":
						this.easing = dojo.lfx.easeOut;
						break;
					case 2:
					case "inout":
						this.easing = dojo.lfx.easeInOut;
						break;
					default:
					case -1:
					case "none":
						break;
				}
			}
		}
	},

	// "private" properties
	_startTime: null,
	_endTime: null,
	_timer: null,
	_percent: 0,
	_startRepeatCount: 0,

	// public methods
	play: function(gotoStart) {
		if( gotoStart ) {
			clearTimeout(this._timer);
			this._active = false;
			this._paused = false;
			this._percent = 0;
		} else if( this._active && !this._paused ) {
			return;
		}
		
		this._startTime = new Date().valueOf();
		if( this._paused ) {
			this._startTime -= (this.duration * this._percent / 100);
		}
		this._endTime = this._startTime + this.duration;

		this._active = true;
		this._paused = false;
		
		var step = this._percent / 100;
		var value = this.curve.getValue(step);
		if( this._percent == 0 ) {
			if(!this._startRepeatCount) {
				this._startRepeatCount = this.repeatCount;
			}
			this.fire("handler", ["begin", value]);
			this.fire("onBegin", [value]);
		}

		this.fire("handler", ["play", value]);
		this.fire("onPlay", [value]);

		this._cycle();
	},

	pause: function() {
		clearTimeout(this._timer);
		if( !this._active ) { return; }
		this._paused = true;
		var value = this.curve.getValue(this._percent / 100);
		this.fire("handler", ["pause", value]);
		this.fire("onPause", [value]);
	},

	gotoPercent: function(pct, andPlay) {
		clearTimeout(this._timer);
		this._active = true;
		this._paused = true;
		this._percent = pct;
		if( andPlay ) { this.play(); }
	},

	stop: function(gotoEnd) {
		clearTimeout(this._timer);
		var step = this._percent / 100;
		if( gotoEnd ) {
			step = 1;
		}
		var value = this.curve.getValue(step);
		this.fire("handler", ["stop", value]);
		this.fire("onStop", [value]);
		this._active = false;
		this._paused = false;
	},

	status: function() {
		if( this._active ) {
			return this._paused ? "paused" : "playing";
		} else {
			return "stopped";
		}
	},

	// "private" methods
	_cycle: function() {
		clearTimeout(this._timer);
		if( this._active ) {
			var curr = new Date().valueOf();
			var step = (curr - this._startTime) / (this._endTime - this._startTime);

			if( step >= 1 ) {
				step = 1;
				this._percent = 100;
			} else {
				this._percent = step * 100;
			}
			
			// Perform easing
			if(this.easing && dojo.lang.isFunction(this.easing)) {
				step = this.easing(step);
			}

			var value = this.curve.getValue(step);
			this.fire("handler", ["animate", value]);
			this.fire("onAnimate", [value]);

			if( step < 1 ) {
				this._timer = setTimeout(dojo.lang.hitch(this, "_cycle"), this.rate);
			} else {
				this._active = false;
				this.fire("handler", ["end"]);
				this.fire("onEnd");

				if( this.repeatCount > 0 ) {
					this.repeatCount--;
					this.play(true);
				} else if( this.repeatCount == -1 ) {
					this.play(true);
				} else {
					if(this._startRepeatCount) {
						this.repeatCount = this._startRepeatCount;
						this._startRepeatCount = 0;
					}
				}
			}
		}
	}
});

dojo.lang.defineClass("dojo.lfx.Combine", dojo.lfx.IAnimation, {
	classConstructor: function(){
		this._anims = [];
		this._animsEnded = 0;
		
		var anims = arguments;
		if(anims.length == 1 && (dojo.lang.isArray(anims[0]) || dojo.lang.isArrayLike(anims[0]))){
			anims = anims[0];
		}
		
		var _this = this;
		dojo.lang.forEach(anims, function(anim){
			_this._anims.push(anim);
			dojo.event.connect(anim, "onEnd", function(){ _this._onAnimsEnded(); });
		});
	},

	// private members
	_anims: [],
	_animsEnded: 0,
	
	// public methods
	play: function(gotoStart){
		if( !this._anims.length ){ return; }
		if(gotoStart || this._anims[0].percent == 0){
			this.fire("onBegin");
		}
		this.fire("onPlay");
		this._animsCall("play", gotoStart);
	},
	
	pause: function(){
		this.fire("onPause");
		this._animsCall("pause"); 
	},
	
	stop: function(gotoEnd){
		this.fire("onStop");
		this._animsCall("stop", gotoEnd);
	},
	
	// private methods
	_onAnimsEnded: function(){
		this._animsEnded++;
		if(this._animsEnded >= this._anims.length){
			this.fire("onEnd");
		}
	},
	
	_animsCall: function(funcName){
		var args = [];
		if(arguments.length > 1){
			for(var i = 1 ; i < arguments.length ; i++){
				args.push(arguments[i]);
			}
		}
		var _this = this;
		dojo.lang.forEach(this._anims, dojo.lang.hitch(_this, function(anim){
			anim[funcName](args);
		}));
	}
});

dojo.defineClass("dojo.lfx.Chain", dojo.lfx.IAnimation, {
	classConstructor: function() {
		this._anims = [];
		this._currAnim = -1;
		
		var anims = arguments;
		if(anims.length == 1 && (dojo.lang.isArray(anims[0]) || dojo.lang.isArrayLike(anims[0]))){
			anims = anims[0];
		}
		
		var _this = this;
		dojo.lang.forEach(anims, dojo.lang.hitch(_this, function(anim, i, anims_arr){
			_this._anims.push(anim);
			if(i < anims_arr.length - 1){
				dojo.event.connect(anim, "onEnd", function(){ _this._playNext(); });
			}else{
				dojo.event.connect(anim, "onEnd", function(){ _this.fire("onEnd"); });
			}
		}));
	},

	// private members
	_anims: [],
	_currAnim: -1,
	
	// public methods
	play: function(gotoStart){
		if( !this._anims.length ) { return; }
		if( gotoStart || !this._anims[this._currAnim] ) {
			this._currAnim = 0;
		}
		if( this._anims[this._currAnim] ){
			if( this._currAnim == 0 ){
				this.fire("handler", ["begin", this._currAnim]);
				this.fire("onBegin", [this._currAnim]);
			}
			this.fire("onPlay", [this._currAnim]);
			this._anims[this._currAnim].play(gotoStart);
		}
	},
	
	pause: function(){
		if( this._anims[this._currAnim] ) {
			this._anims[this._currAnim].pause();
			this.fire("onPause", [this._currAnim]);
		}
	},
	
	playPause: function(){
		if( this._anims.length == 0 ) { return; }
		if( this._currAnim == -1 ) { this._currAnim = 0; }
		var currAnim = this._anims[this._currAnim];
		if( currAnim ) {
			if( !currAnim._active || currAnim._paused ) {
				this.play();
			} else {
				this.pause();
			}
		}
	},
	
	stop: function(){
		if( this._anims[this._currAnim] ){
			this._anims[this._currAnim].stop();
			this.fire("onStop", [this._currAnim]);
		}
	},
	
	// private methods
	_playNext: function(){
		if( this._currAnim == -1 || this._anims.length == 0 ) { return; }
		this._currAnim++;
		if( this._anims[this._currAnim] ){
			this._anims[this._currAnim].play(true);
		}
	}
});

dojo.lfx.combine = function(){
	return new dojo.lfx.Combine(arguments);
}

dojo.lfx.chain = function(){
	return new dojo.lfx.Chain(arguments);
}
