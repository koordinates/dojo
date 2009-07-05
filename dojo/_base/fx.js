dojo.provide("dojo._base.fx");

// These three are currently included automatically for browsers
// If that changes in the future, exceptions are thrown to note the missing dependencies

dojo.required("dojo._base.Color");
dojo.required("dojo._base.connect");
dojo.required("dojo._base.html");

/*
	Animation package loosely based on Dan Pupius' work, contributed under CLA: 
		http://pupius.co.uk/js/Toolkit.Drawing.js
*/

(function(){
	var _mixin = dojo.mixin;
	var byId = dojo.byId;
	var isOwnProperty = dojo.isOwnProperty;
	
	dojo._Line = function(/*int*/ start, /*int*/ end){
		//	summary:
		//		dojo._Line is the object used to generate values from a start value
		//		to an end value
		//	start: int
		//		Beginning value for range
		//	end: int
		//		Ending value for range
		this.start = start;
		this.end = end;
	};
	dojo._Line.prototype.getValue = function(/*float*/ n){
		//	summary: Returns the point on the line
		//	n: a floating point number greater than 0 and less than 1
		return ((this.end - this.start) * n) + this.start; // Decimal
	};
	
	dojo.declare("dojo._Animation", null, {
		//	summary
		//		A generic animation class that fires callbacks into its handlers
		//		object at various states. Nearly all dojo animation functions
		//		return an instance of this method, usually without calling the
		//		.play() method beforehand. Therefore, you will likely need to
		//		call .play() on instances of dojo._Animation when one is
		//		returned.
		constructor: function(/*Object*/ args){
			_mixin(this, args);
			if(dojo.isArray(this.curve)){
				/* curve: Array
					pId: a */
				this.curve = new dojo._Line(this.curve[0], this.curve[1]);
			}
		},
		
		// duration: Integer
		//	The time in milliseonds the animation will take to run
		duration: 350,
	
	/*=====
		// curve: dojo._Line||Array
		//	A two element array of start and end values, or a dojo._Line instance to be
		//	used in the Animation. 
		curve: null,
	
		// easing: Function
		//	A Function to adjust the acceleration (or deceleration) of the progress 
		//	across a dojo._Line
		easing: null,
	=====*/
	
		// repeat: Integer
		//	The number of times to loop the animation
		repeat: 0,
	
		// rate: Integer
		//	the time in milliseconds to wait before advancing to next frame 
		//	(used as a fps timer: rate/1000 = fps)
		rate: 10 /* 100 fps */,
	
	/*===== 
		// delay: Integer
		// 	The time in milliseconds to wait before starting animation after it has been .play()'ed
		delay: null,
	
		// events
		//
		// beforeBegin: Event
		//	Synthetic event fired before a dojo._Animation begins playing (synchronous)
		beforeBegin: null,
	
		// onBegin: Event
		//	Synthetic event fired as a dojo._Animation begins playing (useful?)
		onBegin: null,
	
		// onAnimate: Event
		//	Synthetic event fired at each interval of a dojo._Animation
		onAnimate: null,
	
		// onEnd: Event
		//	Synthetic event fired after the final frame of a dojo._Animation
		onEnd: null,
	
		// onPlay: Event
		//	Synthetic event fired any time a dojo._Animation is play()'ed
		onPlay: null,
	
		// onPause: Event
		//	Synthetic event fired when a dojo._Animation is paused
		onPause: null,
	
		// onStop: Event
		//	Synthetic event fires when a dojo._Animation is stopped
		onStop: null,
	
	=====*/
	
		_percent: 0,
		_startRepeatCount: 0,
	
		_fire: function(/*Event*/ evt, /*Array?*/ args){
			//	summary:
			//		Convenience function.  Fire event "evt" and pass it the
			//		arguments specified in "args".
			//	evt:
			//		The event to fire.
			//	args:
			//		The arguments to pass to the event.
			if(this[evt]){
				this[evt].apply(this, args||[]);
			}
			return this; // dojo._Animation
		},

		play: function(/*int?*/ delay, /*Boolean?*/ gotoStart){
			// summary:
			//		Start the animation.
			// delay:
			//		How many milliseconds to delay before starting.
			// gotoStart:
			//		If true, starts the animation from the beginning; otherwise,
			//		starts it from its current position.
			var _t = this;
			if(_t._delayTimer){ _t._clearTimer(); }
			if(gotoStart){
				_t._stopTimer();
				_t._active = _t._paused = false;
				_t._percent = 0;
			}else if(_t._active && !_t._paused){
				return _t; // dojo._Animation
			}
	
			_t._fire("beforeBegin");
	
			var de = delay || _t.delay,
				_p = dojo.hitch(_t, "_play", gotoStart);
				
			if(de > 0){
				_t._delayTimer = dojo._getWin().setTimeout(_p, de);
				return _t; // dojo._Animation
			}
			_p();
			return _t;
		},
	
		_play: function(gotoStart){
			var _t = this;
			if(_t._delayTimer){ _t._clearTimer(); }
			_t._startTime = new Date().valueOf();
			if(_t._paused){
				_t._startTime -= _t.duration * _t._percent;
			}
			_t._endTime = _t._startTime + _t.duration;
	
			_t._active = true;
			_t._paused = false;
	
			var value = _t.curve.getValue(_t._percent);
			if(!_t._percent){
				if(!_t._startRepeatCount){
					_t._startRepeatCount = _t.repeat;
				}
				_t._fire("onBegin", [value]);
			}
	
			_t._fire("onPlay", [value]);
	
			_t._cycle();
			return _t; // dojo._Animation
		},
	
		pause: function(){
			// summary: Pauses a running animation.
			var _t = this;
			if(_t._delayTimer){ _t._clearTimer(); }
			_t._stopTimer();
			if(!_t._active){ return _t; /*dojo._Animation*/ }
			_t._paused = true;
			_t._fire("onPause", [_t.curve.getValue(_t._percent)]);
			return _t; // dojo._Animation
		},
	
		gotoPercent: function(/*Decimal*/ percent, /*Boolean?*/ andPlay){
			//	summary:
			//		Sets the progress of the animation.
			//	percent:
			//		A percentage in decimal notation (between and including 0.0 and 1.0).
			//	andPlay:
			//		If true, play the animation after setting the progress.
			var _t = this;
			_t._stopTimer();
			_t._active = _t._paused = true;
			_t._percent = percent;
			if(andPlay){ _t.play(); }
			return _t; // dojo._Animation
		},
	
		stop: function(/*boolean?*/ gotoEnd){
			// summary: Stops a running animation.
			// gotoEnd: If true, the animation will end.
			var _t = this;
			if(_t._delayTimer){ _t._clearTimer(); }
			if(!_t._timer){ return _t; /* dojo._Animation */ }
			_t._stopTimer();
			if(gotoEnd){
				_t._percent = 1;
			}
			_t._fire("onStop", [_t.curve.getValue(_t._percent)]);
			_t._active = _t._paused = false;
			return _t; // dojo._Animation
		},
	
		status: function(){
			// summary: Returns a string token representation of the status of
			//			the animation, one of: "paused", "playing", "stopped"
			if(this._active){
				return this._paused ? "paused" : "playing"; // String
			}
			return "stopped"; // String
		},
	
		_cycle: function(){
			var _t = this;
			if(_t._active){
				var curr = new Date().valueOf();
				var step = (curr - _t._startTime) / (_t._endTime - _t._startTime);
	
				if(step >= 1){
					step = 1;
				}
				_t._percent = step;
	
				// Perform easing

				if(_t.easing){
					step = _t.easing(step);
				}
	
				_t._fire("onAnimate", [_t.curve.getValue(step)]);
	
				if(_t._percent < 1){
					_t._startTimer();
				}else{
					_t._active = false;
	
					if(_t.repeat > 0){
						_t.repeat--;
						_t.play(null, true);
					}else if(_t.repeat == -1){
						_t.play(null, true);
					}else{
						if(_t._startRepeatCount){
							_t.repeat = _t._startRepeatCount;
							_t._startRepeatCount = 0;
						}
					}
					_t._percent = 0;
					_t._fire("onEnd");
					_t._stopTimer();
				}
			}
			return _t; // dojo._Animation
		},
		
		_clearTimer: function(){
			// summary: Clear the play delay timer
			dojo._getWin().clearTimeout(this._delayTimer);
			delete this._delayTimer;
		}
		
	});

	var ctr = 0,
		timer = null,
		runner = {
			run: function(){ }
		};

	dojo._Animation.prototype._startTimer = function(){
		if(!this._timer){
			this._timer = dojo.connect(runner, "run", this, "_cycle");
			ctr++;
		}
		if(!timer){
			timer = dojo._getWin().setInterval(dojo.hitch(runner, "run"), this.rate);
		}
	};

	dojo._Animation.prototype._stopTimer = function(){
		if(this._timer){
			dojo.disconnect(this._timer);
			this._timer = null;
			ctr--;
		}
		if(ctr <= 0){
			dojo._getWin().clearInterval(timer);
			timer = null;
			ctr = 0;
		}
	};

	var _makeFadeable;

	if (dojo.isHostObjectProperty(dojo._getWin().document.documentElement, 'currentStyle')) {
		_makeFadeable = function(node){
			if (node.currentStyle && !node.currentStyle.hasLayout && typeof node.style.zoom != 'undefined') {
				node.style.zoom = 1;
			}
		};
	}

	dojo._fade = function(/*Object*/ args){

		//	summary: 
		//		Returns an animation that will fade the node defined by
		//		args.node from the start to end values passed (args.start
		//		args.end) (end is mandatory, start is optional)

		var fArgs = _mixin({ properties: {} }, args),
		 	props = fArgs.properties.opacity = {};
		
		props.start = !("start" in fArgs) ?
			function(){
				return +dojo.style(fArgs.node, "opacity")||0;
			} : fArgs.start;
		props.end = fArgs.end;

		var anim = dojo.animateProperty(fArgs);
		if (_makeFadeable) {
			_makeFadeable(fArgs.node);
		}

		return anim; // dojo._Animation
	};

	/*=====
	dojo.__FadeArgs = function(node, duration, easing){
		// 	node: DOMNode|String
		//		The node referenced in the animation
		//	duration: Integer?
		//		Duration of the animation in milliseconds.
		//	easing: Function?
		//		An easing function.
		this.node = node;
		this.duration = duration;
		this.easing = easing;
	}
	=====*/

	dojo.fadeIn = function(/*dojo.__FadeArgs*/ args){
		// summary: 
		//		Returns an animation that will fade node defined in 'args' from
		//		its current opacity to fully opaque.
		return dojo._fade(_mixin({ end: 1 }, args)); // dojo._Animation
	};

	dojo.fadeOut = function(/*dojo.__FadeArgs*/  args){
		// summary: 
		//		Returns an animation that will fade node defined in 'args'
		//		from its current opacity to fully transparent.
		return dojo._fade(_mixin({ end: 0 }, args)); // dojo._Animation
	};

	dojo._defaultEasing = function(/*Decimal?*/ n){
		// summary: The default easing function for dojo._Animation(s)
		return 0.5 + ((Math.sin((n + 1.5) * Math.PI))/2);
	};

	var PropLine = function(properties){
		// PropLine is an internal class which is used to model the values of
		// an a group of CSS properties across an animation lifecycle. In
		// particular, the "getValue" function handles getting interpolated
		// values between start and end for a particular CSS value.
		this._properties = properties;
		for(var p in properties){
			if (isOwnProperty(properties, p)) {
				var prop = properties[p];
				if(dojo.Color && prop.start instanceof dojo.Color){
					// create a reusable temp color object to keep intermediate results
					prop.tempColor = new dojo.Color();
				}
			}
		}
	};

	PropLine.prototype.getValue = function(r){
		var ret = {};
		var properties = this._properties;

		for(var p in this._properties){
			if (isOwnProperty(properties, p)) {
				var prop = this._properties[p],
					start = prop.start;
				if(dojo.Color && start instanceof dojo.Color){
					ret[p] = dojo.blendColors(start, prop.end, r, prop.tempColor).toCss();
				}else if(!dojo.isArray(start)){
					ret[p] = ((prop.end - start) * r) + start + (p != "opacity" ? prop.units || "px" : 0);
				}
			}
		}
		return ret;
	};

	function getStyle(node, style, isColor){

		// NOTE: Need to check units here (don't do adjustments if not px)

		if (/^(height|width)$/i.test(style)) {
			style = style.toLowerCase();
			var computedHeightOrWidth = dojo.getStylePixels(node, style);
			if (isNaN(computedHeightOrWidth)) {
				var prop = style == 'height' ? 'offsetHeight' : 'offsetWidth';
				var offset = node[prop];
				node.style[style] = node[prop] + 'px';

				if (node[prop] != offset) {
					offset -= (node[prop] - offset);
					if (offset >= 0) {
						node.style[style] = offset + 'px';
					} else {
						return 0;
					}
				}
				return offset;
			}
			return computedHeightOrWidth;
		} else if (/^(top|left)$/i.test(style)) {
			style = style.toLowerCase();
			var cs = dojo.getComputedStyle(node);
			var pos = cs.position;
			if (!pos || pos == 'static') {

				// NOTE: Must account for margins

				var ret = dojo.coords(node, true);
				node.style.position = "absolute";
				node.style[style] = (style == 'top' ? ret.y : ret.x) + "px";
			} else {
				var topOrLeft = dojo.getStylePixels(node, style, cs);
				offset = style == 'top' ? 'offsetTop' : 'offsetLeft';

				if(isNaN(topOrLeft)){
					var oldTopOrLeft = node[offset];

					node.style[style] = oldTopOrLeft + 'px';

					if (oldTopOrLeft != node[offset]) {
						topOrLeft -= (node[offset] - oldTopOrLeft);
					}
					if (oldTopOrLeft != topOrLeft) {
						node.style[style] = topOrLeft + 'px';
					}
				}
			}
		}
		var v = dojo.style(node, style);
		return (style == "opacity") ? +v : (isColor ? v : parseFloat(v));
	}

	/*=====
	dojo.declare("dojo.__AnimArgs", [dojo.__FadeArgs], {
		// Properties: Object?
		//	A hash map of style properties to Objects describing the transition,
		//	such as the properties of dojo._Line with an additional 'unit' property
		properties: {}
		
		//TODOC: add event callbacks
	});
	=====*/

	dojo.animateProperty = function(/*dojo.__AnimArgs*/ args){
		//	summary: 
		//		Returns an animation that will transition the properties of
		//		node defined in 'args' depending how they are defined in
		//		'args.properties'
		//
		// description:
		//		dojo.animateProperty is the foundation of most dojo.fx
		//		animations. It takes an object of "properties" corresponding to
		//		style properties, and animates them in parallel over a set
		//		duration.
		//	
		// 	example:
		//		A simple animation that changes the width of the specified node.
		//	|	dojo.animateProperty({ 
		//	|		node: "nodeId",
		//	|		properties: { width: 400 },
		//	|	}).play();
		//		Dojo figures out the start value for the width and converts the
		//		integer specified for the width to the more expressive but
		//		verbose form `{ width: { end: '400', units: 'px' } }` which you
		//		can also specify directly
		//
		// 	example:
		//		Animate width, height, and padding over 2 seconds... the
		//		pedantic way:
		//	|	dojo.animateProperty({ node: node, duration:2000,
		//	|		properties: {
		//	|			width: { start: '200', end: '400', unit:"px" },
		//	|			height: { start:'200', end: '400', unit:"px" },
		//	|			paddingTop: { start:'5', end:'50', unit:"px" } 
		//	|		}
		//	|	}).play();
		//		Note 'paddingTop' is used over 'padding-top'. Multi-name CSS properties
		//		are written using "mixed case", as the hyphen is illegal as an object key.
		//		
		// 	example:
		//		Plug in a different easing function and register a callback for
		//		when the animation ends. Easing functions accept values between
		//		zero and one and return a value on that basis. In this case, an
		//		exponential-in curve.
		//	|	dojo.animateProperty({ 
		//	|		node: "nodeId",
		//	|		// dojo figures out the start value
		//	|		properties: { width: { end: 400 } },
		//	|		easing: function(n){
		//	|			return (n==0) ? 0 : Math.pow(2, 10 * (n - 1));
		//	|		},
		//	|		onEnd: function(){
		//	|			// called when the animation finishes
		//	|		}
		//	|	}).play(500); // delay playing half a second
		//
		//	example:
		//		Like all `dojo._Animation`s, animateProperty returns a handle to the
		//		Animation instance, which fires the events common to Dojo FX. Use `dojo.connect`
		//		to access these events outside of the Animation definiton:
		//	|	var anim = dojo.animateProperty({
		//	|		node:"someId",
		//	|		properties:{
		//	|			width:400, height:500
		//	|		}
		//	|	});
		//	|	dojo.connect(anim,"onEnd", function(){
		//	|		console.log("animation ended");
		//	|	});
		//	|	// play the animation now:
		//	|	anim.play();
		
		args.node = byId(args.node);

		var anim = new dojo._Animation(args);
		dojo.connect(anim, "beforeBegin", anim, function(){
			var start, end, isColor, p, prop, pm = {}, properties = this.properties;
			for(p in properties){
				if (isOwnProperty(properties, p)) {

					// Make shallow copy of properties into pm because we overwrite
					// some values below. In particular if start/end are functions
					// we don't want to overwrite them or the functions won't be
					// called if the animation is reused.

					if(p == "width" || p == "height"){
						this.node.display = "block";
					}
					prop = this.properties[p];

					prop = pm[p] = _mixin({}, ((dojo.isObject(prop) && prop) ? prop: { end: prop }));

					if(typeof prop.start == 'function'){
						prop.start = prop.start();
					}

					if(typeof prop.end == 'function'){
						prop.end = prop.end();
					}

					isColor = (p.toLowerCase().indexOf("color") >= 0);
					if(!("end" in prop)){
						prop.end = getStyle(this.node, p, isColor);
					}else if(!("start" in prop)){
						prop.start = getStyle(this.node, p, isColor);
					}

					if(isColor){
						prop.start = new dojo.Color(prop.start);
						prop.end = new dojo.Color(prop.end);
					}else{
						prop.start = (p == "opacity") ? +prop.start : parseFloat(prop.start);
					}
					start = prop.start;
					end = prop.end;
				}
			}

			if (typeof args.easing == 'string' && args.easing) {
				args.easingName = args.easing;
			}

			// NOTE: Problem with named easing predicting which flavor to use (out or in)

			this.easing = (args.easingName ? dojo.fx.easing[args.easingName + (/(Out|In)$/.test(args.easingName) ? '' : (end > start ? 'In' : 'Out'))] : args.easing) || dojo._defaultEasing;

			this.curve = new PropLine(pm);
		});
		dojo.connect(anim, "onAnimate", dojo.hitch(dojo, "style", anim.node));
		return anim; // dojo._Animation
	};

	dojo.anim = function(	/*DOMNode|String*/ 	node, 
							/*Object*/ 			properties, 
							/*Integer?*/		duration, 
							/*Function?*/		easing, 
							/*Function?*/		onEnd,
							/*Integer?*/		delay){
		//	summary:
		//		A simpler interface to `dojo.animateProperty()`, also returns
		//		an instance of `dojo._Animation` but begins the animation
		//		immediately, unlike nearly every other Dojo animation API.
		//	description:
		//		`dojo.anim` is a simpler (but somewhat less powerful) version
		//		of `dojo.animateProperty`.  It uses defaults for many basic properties
		//		and allows for positional parameters to be used in place of the
		//		packed "property bag" which is used for other Dojo animation
		//		methods.
		//
		//		The `dojo._Animation` object returned from `dojo.anim` will be
		//		already playing when it is returned from this function, so
		//		calling play() on it again is (usually) a no-op.
		//	node:
		//		a DOM node or the id of a node to animate CSS properties on
		//	duration:
		//		The number of milliseconds over which the animation
		//		should run. Defaults to the global animation default duration
		//		(350ms).
		//	easing:
		//		An easing function over which to calculate acceleration
		//		and deceleration of the animation through its duration.
		//		A default easing algorithm is provided, but you may
		//		plug in any you wish. A large selection of easing algorithms
		//		are available in `dojo.fx.easing`.
		//	onEnd:
		//		A function to be called when the animation finishes
		//		running.
		//	delay:
		//		The number of milliseconds to delay beginning the
		//		animation by. The default is 0.
		//	example:
		//		Fade out a node
		//	|	dojo.anim("id", { opacity: 0 });
		//	example:
		//		Fade out a node over a full second
		//	|	dojo.anim("id", { opacity: 0 }, 1000);
		return dojo.animateProperty({ 
			node: node,
			duration: duration||dojo._Animation.prototype.duration,
			properties: properties,
			easing: easing,
			onEnd: onEnd 
		}).play(delay||0);
	};
})();
