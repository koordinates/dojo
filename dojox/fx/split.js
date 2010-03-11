dojo.provide("dojox.fx.split");

dojo.require("dojo.fx");
dojo.require("dojo.fx.easing");

dojo.mixin(dojox.fx,{
	_split: function(/*Object*/ args){
		// summary: Split a node into rectangular pieces and animate them.
		//
		// description:
		//		Returns an animation that will split the node into a grid
		//		of pieces that move independently.
		//
		//	args:
		//		args.crop: Boolean - If true, pieces will only be visible inside node's boundries
		//		args.rows: Integer - The number of horizontal pieces (default is 3)
		//		args.columns: Integer - The number of vertical pieces (default is 3)
		//		args.pieceAnimation: Function(piece, x, y, coords) - Returns either the dojo._Animation
		//		or an array of dojo._Animation objects for the piece at location (x, y) in the node's grid;
		//		coords is the result of dojo.coords(args.node, true);

		args.rows = args.rows || 3;
		args.columns = args.columns || 3;
		args.duration = args.duration || 1000;
		var node = args.node = dojo.byId(args.node),
			coords = dojo.coords(node, true),
			pieceHeight = Math.ceil(coords.h / args.rows),
			pieceWidth = Math.ceil(coords.w / args.columns),
			container = dojo.create(node.tagName),
			animations = [],
			pieceHelper = dojo.create(node.tagName),
			piece
		;
		// Create the pieces and their animations
		dojo.style(container, {
			position: "absolute",
			padding: "0",
			margin: "0",
			border:"none",
			top: coords.y + "px",
			left: coords.x + "px",
			height: coords.h + "px",
			width: coords.w + "px",
			background: "none",
			overflow: args.crop ? "hidden" : "visible"
		});
		node.parentNode.appendChild(container);
		dojo.style(pieceHelper, {
			position: "absolute",
			border: "none",
			padding: '0',
			margin: '0',
			height: pieceHeight + "px",
			width: pieceWidth + "px",
			overflow: "hidden"
		});
		for(var y = 0; y < args.rows; y++){
			for(var x = 0; x < args.columns; x++){
				// Create the piece
				piece = dojo.clone(pieceHelper);
				var pieceContents = dojo.clone(node);

				// IE hack
				pieceContents.style.filter = "";

				dojo.style(piece, {
					border: "none",
					overflow: "hidden",
					top: (pieceHeight * y) + "px",
					left: (pieceWidth * x) + "px"
				});
				dojo.style(pieceContents, {
					position: "static",
					opacity: "1",
					marginTop: (-y * pieceHeight) + "px",
					marginLeft: (-x * pieceWidth) + "px"
				});
				piece.appendChild(pieceContents);
				container.appendChild(piece);

				var pieceAnimation = args.pieceAnimation(piece, x, y, coords);
				if(dojo.isArray(pieceAnimation)){
					// if pieceAnimation is an array, append its elements
					animations = animations.concat(pieceAnimation);
				}else{
					// otherwise, append it
					animations.push(pieceAnimation);
				}
			}
		}
		var anim = dojo.fx.combine(animations);
		dojo.connect(anim, "onEnd", anim, function(){
			container.parentNode.removeChild(container);
		});
		if(args.onPlay){
			dojo.connect(anim, "onPlay", anim, args.onPlay);
		}
		if(args.onEnd){
			dojo.connect(anim, "onEnd", anim, args.onEnd);
		}
		return anim; // dojo._Animation
	},

	explode: function(/*Object*/ args){
		// summary: Explode a node into rectangular pieces
		//
		// description:
		//		Returns an animation that will split the node into a grid
		//		of pieces that fly away from the center.
		//
		//	args:
		//		args.rows: Integer - The number of horizontal pieces (default is 3)
		//		args.columns: Integer - The number of vertical pieces (default is 3)
		//		args.random: Float - If set, pieces fly to random distances, for random durations,
		//							   and in slightly random directions.  The value defines how much
		//							   randomness is introduced.
		//		args.distance: Float - Multiplier for the distance the pieces fly (even when random)
		//		args.fade: Boolean - If true, pieces fade out while in motion (default is true)
		//		args.fadeEasing: Function - If args.fade is true, the fade animations use this easing function
		//		args.unhide: Boolean - If true, the animation is reversed
		//		args.sync: Boolean - If args.unhide is true, all the pieces converge at the same time
		//							 (default is true)

		var node = args.node = dojo.byId(args.node);
		args.rows = args.rows || 3;
		args.columns = args.columns || 3;
		args.distance = args.distance || 1;
		args.duration = args.duration || 1000;
		args.random = args.random || 0;
		if(!args.fade){
			args.fade = true;
		}
		if(typeof args.sync == "undefined"){
			args.sync = true;
		}
		args.random = Math.abs(args.random);

		// Returns the animation object for each piece
		args.pieceAnimation = function(piece, x, y, coords){
			var pieceHeight = coords.h / args.rows,
				pieceWidth = coords.w / args.columns,
				distance = args.distance * 2,
				duration = args.duration,
				ps = piece.style,
				startTop = parseInt(ps.top),
				startLeft = parseInt(ps.left),
				delay = 0,
				randomX = 0,
				randomY = 0;

			if(args.random){
				var seed = (Math.random() * args.random) + Math.max(1 - args.random, 0);
				distance *= seed;
				duration *= seed;
				// To syncronize, give each piece an appropriate delay so they end together
				delay = ((args.unhide && args.sync) || (!args.unhide && !args.sync)) ? (args.duration - duration) : 0;
				// Slightly randomize the direction of each piece
				randomX = Math.random() - 0.5;
				randomY = Math.random() - 0.5;
			}

			var distanceY = ((coords.h - pieceHeight) / 2 - pieceHeight * y),
				distanceX = ((coords.w - pieceWidth) / 2 - pieceWidth * x),
				distanceXY = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)),
				endTop = parseInt(startTop - distanceY * distance + distanceXY * randomY),
				endLeft = parseInt(startLeft - distanceX * distance + distanceXY * randomX)
			;

			// Create the animation objects for the piece
			// These are separate anim objects so they can have different curves
			var pieceSlide = dojo.animateProperty({
				node: piece,
				duration: duration,
				delay: delay,
				easing: (args.easing || (args.unhide ? dojo.fx.easing.sinOut : dojo.fx.easing.circOut)),
				beforeBegin: (args.unhide ? function(){
						if(args.fade){
							dojo.style(piece, { opacity: "0"});
						}
						ps.top = endTop + "px";
						ps.left = endLeft + "px";
					} : undefined),
				properties: {
					top: (args.unhide ? { start: endTop, end: startTop } : { start: startTop, end: endTop }),
					left: (args.unhide ? { start: endLeft, end: startLeft } : { start: startLeft, end: endLeft })
				}
			});
			if(args.fade){
				var pieceFade = dojo.animateProperty({
					node: piece,
					duration: duration,
					delay: delay,
					easing: (args.fadeEasing || dojo.fx.easing.quadOut),
					properties: {
						opacity: (args.unhide ? { start: "0", end: "1" } : { start: "1", end: "0" })
					}
				});

				// return both animations as an array
				return (args.unhide ? [pieceFade, pieceSlide] : [pieceSlide, pieceFade]);
			}else{
				// Otherwise return only the slide animation
				return pieceSlide;
			}
		};

		var anim = dojox.fx._split(args);
		if(args.unhide){
			dojo.connect(anim, "onEnd", null, function(){
				dojo.style(node, {opacity: "1" });
			});
		}else{
			dojo.connect(anim, "onPlay", null, function(){
				dojo.style(node, { opacity: "0" });
			});
		}
		return anim; // dojo._Animation
	},

	converge: function(/*Object*/ args){
		args.unhide = true;
		return dojox.fx.explode(args);
	},

	disintegrate: function(/*Object*/ args){
		// summary: Split a node into rectangular pieces and let them fall
		//
		// description:
		//		Returns an animation that will split the node into a grid
		//		of pieces that drop.
		//
		//	args:
		//		args.rows: Integer - The number of horizontal pieces (default is 5)
		//		args.columns: Integer - The number of vertical pieces (default is 5)
		//		args.interval: Float - The number of milliseconds between each piece's animation
		//		args.distance: Float - The number of the node's heights to drop (default is 1.5)
		//		args.fade: Boolean - If true, pieces fade out while in motion (default is true)
		//		args.random: Float - If set, pieces fall in random order. The value defines how much
		//							   randomness is introduced.
		//		args.reverseOrder: Boolean - If true, pieces animate in reversed order
		//		args.unhide: Boolean - If true, the peices fall from above and land in place
		var node = args.node = dojo.byId(args.node);

		args.rows = args.rows || 5;
		args.columns = args.columns || 5;
		args.duration = args.duration || 1500;
		args.interval = args.interval || args.duration / (args.rows + args.columns * 2);
		args.distance = args.distance || 1.5;
		args.random = args.random || 0;
		if(typeof args.fade == "undefined"){
			args.fade = true;
		}
		
		var random = Math.abs(args.random),
			duration = args.duration - (args.rows + args.columns) * args.interval;

		// Returns the animation object for each piece
		args.pieceAnimation = function(piece, x, y, coords){

			var randomDelay = Math.random() * (args.rows + args.columns) * args.interval,
				ps = piece.style,
			
			// If distance is negative, start from the top right instead of bottom left
				uniformDelay = (args.reverseOrder || args.distance < 0) ?
					((x + y) * args.interval) :
					(((args.rows + args.columns) - (x + y)) * args.interval),
				delay = randomDelay * random + Math.max(1 - random, 0) * uniformDelay,
			// Create the animation object for the piece
				properties = {}
			;
			if(args.unhide){
				properties.top = {
					start: (parseInt(ps.top) - coords.h * args.distance),
					end: parseInt(ps.top)
				};
				if(args.fade){
					properties.opacity = {start: "0", end: "1"};
				}
			}else{
				properties.top = {end: (parseInt(ps.top) + coords.h * args.distance)};
				if(args.fade){
					properties.opacity = {end: "0"};
				}
			}
			var pieceAnimation = dojo.animateProperty({
				node: piece,
				duration: duration,
				delay: delay,
				easing: (args.easing || (args.unhide ? dojo.fx.easing.sinIn : dojo.fx.easing.circIn)),
				properties: properties,
				beforeBegin: (args.unhide ? function(){
					if(args.fade){
						dojo.style(piece, { opacity: "0" });
					}
					ps.top = properties.top.start + "px";
				} : undefined)
			});

			return pieceAnimation;
		};

		var anim = dojox.fx._split(args);
		if(args.unhide){
			dojo.connect(anim, "onEnd", anim, function(){
				dojo.style(node, { opacity: "1" });
			});
		}else{
			dojo.connect(anim, "onPlay", anim, function(){
				dojo.style(node, { opacity: "0" });
			});
		}
		return anim; // dojo._Animation
	},

	build: function(/*Object*/ args){
		args.unhide = true;
		return dojox.fx.disintegrate(args);
	},

	shear: function(/*Object*/ args){
		// summary: Split a node into rectangular pieces and slide them in alternating directions
		//
		// description:
		//		Returns an animation that will split the node into a grid
		//		of pieces that slide in alternating directions.
		//
		//	args:
		//		args.rows: Integer - The number of horizontal pieces (default is 6)
		//		args.columns: Integer - The number of vertical pieces (default is 6)
		//		args.interval: Float - The number of milliseconds between each piece's animation (default is 0)
		//		args.distance: Float - The multiple of the node's dimensions to slide (default is 1)
		//		args.fade: Boolean - If true, pieces fade out while in motion (default is true)
		//		args.random: Float - If true, pieces have a random delay. The value defines how much
		//							   randomness is introduced
		//		args.reverseOrder: Boolean - If true, pieces animate in reversed order
		//		args.unhide: Boolean - If true, the animation is reversed

		var node = args.node = dojo.byId(args.node);

		args.rows = args.rows || 6;
		args.columns = args.columns || 6;
		args.duration = args.duration || 1000;
		args.interval = args.interval || 0;
		args.distance = args.distance || 1;
		args.random = args.random || 0;
		if(typeof(args.fade) == "undefined"){
			args.fade = true;
		}
		var random = Math.abs(args.random),
			duration = (args.duration - (args.rows + args.columns) * Math.abs(args.interval))
		;

		// Returns the animation object for each piece
		args.pieceAnimation = function(piece, x, y, coords){

			// Since x an y start at 0, the opposite is true...
			var colIsOdd = !(x % 2),
				rowIsOdd = !(y % 2),
				randomDelay = Math.random() * duration,
				uniformDelay = (args.reverseOrder) ?
					(((args.rows + args.columns) - (x + y)) * args.interval) :
					((x + y) * args.interval),
				delay = randomDelay * random + Math.max(1 - random, 0) * uniformDelay,
				properties = {},
				ps = piece.style
			;

			if(args.fade){
				properties.opacity = (args.unhide ? { start: "0", end: "1" } : { end: "0" });
			}

			// If we have only rows or columns, ignore the other dimension
			if(args.columns == 1){
				colIsOdd = rowIsOdd;
			}else if(args.rows == 1){
				rowIsOdd = !colIsOdd;
			}

			// Determine the piece's direction
			var left = parseInt(ps.left),
				top = parseInt(ps.top),
				distanceX = args.distance*coords.w,
				distanceY = args.distance*coords.h
			;
			if(args.unhide){
				if(colIsOdd == rowIsOdd){
					properties.left = colIsOdd ? {start: (left - distanceX), end: left} : {start: (left + distanceX), end: left};
				}else{
					properties.top = colIsOdd ? {start: (top + distanceY), end: top} : {start: (top - distanceY), end: top};
				}
			}else{
				if(colIsOdd == rowIsOdd){
					properties.left = colIsOdd ? {end: (left - distanceX)} : {end: (left + distanceX)};
				}else{
					properties.top = colIsOdd ? {end: (top + distanceY)} : {end: (top - distanceY)};
				}
			}

			// Create the animation object for the piece
			var pieceAnimation = dojo.animateProperty({
				node: piece,
				duration: duration,
				delay: delay,
				easing: (args.easing || dojo.fx.easing.sinInOut),
				properties: properties,
				beforeBegin: (args.unhide ? function(){
					if(args.fade){
						ps.opacity = "0";
					}
					if(colIsOdd == rowIsOdd){
						ps.left = properties.left.start + "px";
					}else{
						ps.top = properties.top.start + "px";
					}
				} : undefined)
			});

			return pieceAnimation;
		};

		var anim = dojox.fx._split(args);
		if(args.unhide){
			dojo.connect(anim, "onEnd", anim, function(){
				dojo.style(node, { opacity: "1" });
			});
		}else{
			dojo.connect(anim, "onPlay", anim, function(){
				dojo.style(node, { opacity: "0" });
			});
		}
		return anim; // dojo._Animation
	},
	
	unShear: function(/*Object*/ args){
		args.unhide = true;
		return dojox.fx.shear(args);
	},

	pinwheel: function(/*Object*/ args){
		// summary: Split a node into rectangular pieces and wipe them in alternating directions
		//
		// description:
		//		Returns an animation that will split the node into a grid
		//		of pieces that wipe in alternating directions.
		//
		//	args:
		//		args.rows: Integer - The number of horizontal pieces (default is 4)
		//		args.columns: Integer - The number of vertical pieces (default is 4)
		//		args.interval: Float - The number of milliseconds between each piece's animation (default is 0)
		//		args.distance: Float - The percentage of the piece's dimensions the piece should wipe
		//		args.fade: Boolean - If true, pieces fade out while in motion (default is true)
		//		args.random: Float - If true, pieces have a random delay. The value defines how much
		//							   randomness is introduced.
		//		args.unhide: Boolean - If true, the animation is reversed

		var node = args.node = dojo.byId(args.node);

		args.rows = args.rows || 4;
		args.columns = args.columns || 4;
		args.duration = args.duration || 1000;
		args.interval = args.interval || 0;
		args.distance = args.distance || 1;
		args.random = args.random || 0;
		if(typeof args.fade == "undefined"){
			args.fade = true;
		}
		var duration = (args.duration - (args.rows + args.columns) * Math.abs(args.interval));

		// Returns the animation object for each piece
		args.pieceAnimation = function(piece, x, y, coords){
			var pieceHeight = coords.h / args.rows,
				pieceWidth = coords.w / args.columns,

				// because x an y start at 0, the opposite is true...
				colIsOdd = !(x % 2),
				rowIsOdd = !(y % 2),

				randomDelay = Math.random() * duration,
				uniformDelay = (args.interval < 0) ?
					(((args.rows + args.columns) - (x + y)) * args.interval * -1) :
					((x + y) * args.interval),
				delay = randomDelay * args.random + Math.max(1 - args.random, 0) * uniformDelay,
				properties = {},
				ps = piece.style
			;

			if(args.fade){
				properties.opacity = (args.unhide ? {start: 0, end: 1} : {end:0});
			}

			// If we have only rows or columns, ignore the other dimension
			if(args.columns == 1){
				colIsOdd = !rowIsOdd;
			}else if(args.rows == 1){
				rowIsOdd = colIsOdd;
			}

			// Determine the piece's direction
			var left = parseInt(ps.left),
				top = parseInt(ps.top)
			;
			if(colIsOdd){
				if(rowIsOdd){
					properties.top = args.unhide ?
						{ start: top + pieceHeight * args.distance, end: top} :
						{ start: top, end: top + pieceHeight * args.distance} ;
				}else{
					properties.left = args.unhide ?
						{ start: left + pieceWidth * args.distance, end: left } :
						{ start: left, end: left + pieceWidth * args.distance } ;
				}
			}
			if(colIsOdd != rowIsOdd){
				properties.width = args.unhide ?
					{ start: pieceWidth * (1 - args.distance), end: pieceWidth } :
					{ start: pieceWidth, end: pieceWidth * (1 - args.distance) } ;
			}else{
				properties.height = args.unhide ?
					{ start: pieceHeight * (1 - args.distance), end: pieceHeight } :
					{ start: pieceHeight, end: pieceHeight * (1 - args.distance) } ;
			}

			// Create the animation object for the piece
			var pieceAnimation = dojo.animateProperty({
				node: piece,
				duration: duration,
				delay: delay,
				easing: (args.easing || dojo.fx.easing.sinInOut),
				properties: properties,
				beforeBegin: (args.unhide ? function(){
					if(args.fade){
						dojo.style(piece, "opacity", 0);
					}
					if(colIsOdd){
						if(rowIsOdd){
							ps.top = (top + pieceHeight * (1 - args.distance)) + "px";
						}else{
							ps.left = (left + pieceWidth * (1 - args.distance)) + "px";
						}
					}else{
						ps.left = left + "px";
						ps.top = top + "px";
					}
					if(colIsOdd != rowIsOdd){
						ps.width = (pieceWidth * (1 - args.distance)) + "px";
					}else{
						ps.height = (pieceHeight * (1 - args.distance)) + "px";
					}
				} : undefined)
			});

			return pieceAnimation;
		};

		var anim = dojox.fx._split(args);
		if(args.unhide){
			dojo.connect(anim, "onEnd", anim, function(){
				dojo.style(node, { opacity: "1" });
			});
		}else{
			dojo.connect(anim, "play", anim, function(){
				dojo.style(node, { opacity: "0" });
			});
		}
		return anim; // dojo._Animation
	},

	unPinwheel: function(/*Object*/ args){
		args.unhide = true;
		return dojox.fx.pinwheel(args); // dojo._Animation
	},

	blockFadeOut: function(/*Object*/ args){
		// summary: Split a node into rectangular pieces and fade them
		//
		// description:
		//		Returns an animation that will split the node into a grid
		//		of pieces that fade in or out.
		//
		//	args:
		//		args.rows: Integer - The number of horizontal pieces (default is 5)
		//		args.columns: Integer - The number of vertical pieces (default is 5)
		//		args.interval: Float - The number of milliseconds between each piece's animation (default is 0)
		//		args.random: Float - If true, pieces have a random delay. The value defines how much
		//							   randomness is introduced
		//		args.reverseOrder: Boolean - If true, pieces animate in reversed order
		//		args.unhide: Boolean - If true, the animation is reversed

		var node = args.node = dojo.byId(args.node);

		args.rows = args.rows || 5;
		args.columns = args.columns || 5;
		args.duration = args.duration || 1000;
		args.interval = args.interval || args.duration / (args.rows + args.columns * 2);
		args.random = args.random || 0;
		var random = Math.abs(args.random),
			duration = args.duration - (args.rows + args.columns) * args.interval
		;

		// Returns the animation object for each piece
		args.pieceAnimation = function(piece, x, y, coords){
			var randomDelay = Math.random() * args.duration,
				uniformDelay = (args.reverseOrder) ?
					(((args.rows + args.columns) - (x + y)) * Math.abs(args.interval)) :
					((x + y) * args.interval),
				delay = randomDelay * random + Math.max(1 - random, 0) * uniformDelay,
			// Create the animation object for the piece
				pieceAnimation = dojo.animateProperty({
					node: piece,
					duration: duration,
					delay: delay,
					easing: (args.easing || dojo.fx.easing.sinInOut),
					properties: {
						opacity: (args.unhide ? {start: "0", end: "1"} : {start: "1", end: "0"})
					},
					beforeBegin: (args.unhide ? function(){ dojo.style(piece, { opacity: "0" });} : function(){ piece.style.filter = ""; })
				});

			return pieceAnimation;
		};
		var anim = dojox.fx._split(args);
		if(args.unhide){
			dojo.connect(anim, "onEnd", anim, function(){
				dojo.style(node, { opacity: "1" });
			});
		}else{
			dojo.connect(anim, "onPlay", anim, function(){
				dojo.style(node, { opacity: "0" });
			});
		}
		return anim; // dojo._Animation
	},

	blockFadeIn: function(/*Object*/ args){
		args.unhide = true;
		return dojox.fx.blockFadeOut(args); // dojo._Animation
	}

});