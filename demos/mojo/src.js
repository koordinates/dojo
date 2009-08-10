dojo.provide("demos.mojo.src");

dojo.require("dojo.dnd.Moveable");
dojo.require("dojo.fx.easing");
dojo.require("dojox.widget.Roller");

// Tracking

dojo.require("dojox.analytics.Urchin");

// App code

dojo.require("demos.mojo.src.drop"); // gravity code
dojo.require("demos.mojo.src.download"); // download link code

(function(){ 
		
	var nodes, style = dojo.style;
	
	dojo.addOnLoad(function(){
		nodes = dojo.query("#container > div");

		// iterate over each div in the container

		nodes.forEach(function(n){
			// hide the node, first thing, and undo native-css hiding:
			style(n, { opacity:0, visibility:"visible" });

			// the drag handle will be the h1 element in this div
			var handle = dojo.query("h1", n)[0];
			new dojo.dnd.Moveable(n, { handle: handle });

			// there is really only one image in here though:
			dojo.query("img", n).forEach(function(img){
				style(img,{
					width:"1px", height:"1px",
					top:"155px", left:"155px"
				});
			});
		});
		
		var _anims = [];
		
		nodes.forEach(function(n){
			var _nodeAnims = [];
			_nodeAnims.push(dojo.fadeIn({
				duration:850,
				node: n,
				properties: {
					paddingTop: {
						start:155, end:1, unit:"px"
					},
					fontSize:{
						start:0.1, end:16, unit:"px"
					}
				}
			}))
			
			dojo.query("img", n).forEach(function(img){
				_nodeAnims.push(dojo.animateProperty({
					duration:450,
					node: img,
					properties: {
						width: 310, 
						height: 310, 
						top: 0, 
						left: 0 
					}
				}));
			});

			_anims.push(dojo.fx.combine(_nodeAnims));

		});
		
		// add the header-in-animation to our _anims array

		_anims.push(dojo.animateProperty({
			node: "header",
			properties: {
				top: 5, 
				left: 5
			},
			duration: 700
		}));
		
		_anims.push(dojo.fadeIn({
			node:"downloadButton",
			duration:400,
			beforeBegin: dojo.partial(style, "downloadButton", { 
				opacity:0, visibility:"visible" 
			})
		}));
		
		var anim = dojo.fx.chain(_anims);
		
		var roller = new dojox.widget.RollerSlide({ delay:5000, autoStart:false },"whyList");
		dojo.connect(anim,"onEnd", roller, "start");

		anim.play();
		
		var _coords, _z;
		
		dojo.subscribe("/dnd/move/start",function(e) {

			// when drag starts, save the coords of the node we're pulling

			var n = e.node;

			// NOTE: These all use pixels for top and left

			var cs = dojo.getComputedStyle(n);
			var t = dojo.getStylePixels(n, 'top', cs);
			var l = dojo.getStylePixels(n, 'left', cs);

			_coords = { t: t, l: l };

			// and "bring to top"
			// and make it partially opaque

			_z = style(n, "zIndex");
			style(n, { zIndex:888, opacity:0.65 });
		});
		
		dojo.subscribe("/dnd/move/stop", function(e){
			// when it ends, reset z-index, opacity, and animate back to spot
			style(e.node, "opacity", 1);
			if(_coords){
				dojo.fx.slideTo({
					node: e.node, // drag node
					top: _coords.t, // tmp top
					left: _coords.l, // tmp left
					easing: dojo.fx.easing.elasticOut,
					duration:950 // ms
				}).play(5); // small delay for performance?
				style(e.node, "zIndex", _z);
			}
		});	
		
		new dojox.analytics.Urchin({ 
			acct: "UA-3572741-1", 
			GAonLoad: function(){
				this.trackPageView("/demos/mojo");
			}
		});	

	});

})();
