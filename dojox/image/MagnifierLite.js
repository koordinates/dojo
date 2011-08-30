define(["dojo", "dijit", "dojox/main", "dijit/_Widget"], function(dojo, dijit, dojox){

	dojo.experimental("dojox.image.MagnifierLite");
	dojo.getObject("image", true, dojox);
	
	return dojo.declare("dojox.image.MagnifierLite", dijit._Widget,{
		// summary:	Adds magnification on a portion of an image element
		//
		// description: An unobtrusive way to add an unstyled overlay
		// 		above the srcNode image element. The overlay/glass is a
		//		scaled version of the src image (so larger images sized down
		//		are clearer).
		//
		//		The logic behind requiring the src image to be large is
		//		"it's going to be downloaded, anyway" so this method avoids
		//		having to make thumbnails and 2 http requests among other things.
		//
		// glassSize: Int
		// 		the width and height of the bounding box
		glassSize: 125,

		// scale: Decimal
		// 		the multiplier of the Mangification.
		scale: 6,

		postCreate: function(){
			this.inherited(arguments);

			// images are hard to make into workable templates, so just add outer overlay
			// and skip using dijit._Templated
			this._adjustScale();
			this._createGlass();

			this.connect(this.domNode,"onmouseenter","_showGlass");
			this.connect(this.glassNode,"onmousemove","_placeGlass");
			this.connect(this.img,"onmouseout","_hideGlass");

			// when position of domNode changes, _adjustScale needs to run.
			// window.resize isn't it always, FIXME:
			this.connect(window,"onresize","_adjustScale");

		},

		_createGlass: function(){
			// summary: make img and glassNode elements as children of the body

			var node = this.glassNode = dojo.create('div', {
				style:{
					height: this.glassSize + "px",
					width: this.glassSize + "px"
				},
				className:"glassNode"
			}, dojo.body());

			this.surfaceNode = node.appendChild(dojo.create('div'));

			this.img = dojo.place(dojo.clone(this.domNode), node);
			// float the image around inside the .glassNode
			dojo.style(this.img, {
				position: "relative",
				top: 0, left: 0,
				width: this._zoomSize.w + "px",
				height: this._zoomSize.h + "px"
			});

		},

		_adjustScale: function(){
			// summary: update the calculations should this.scale change

			this.offset = dojo.position(this.domNode, true);
			console.dir(this.offset);
			this._imageSize = { w: this.offset.w, h:this.offset.h };
			this._zoomSize = {
				w: this._imageSize.w * this.scale,
				h: this._imageSize.h * this.scale
			};
		},

		_showGlass: function(e){
			// summary: show the overlay
			this._placeGlass(e);
			dojo.style(this.glassNode, {
				visibility: "visible",
				display:""
			});

		},

		_hideGlass: function(e){
			// summary: hide the overlay
			dojo.style(this.glassNode, {
				visibility: "hidden",
				display:"none"
			});
		},

		_placeGlass: function(e){
			// summary: position the overlay centered under the cursor

			this._setImage(e);
			var sub = Math.floor(this.glassSize / 2);
			dojo.style(this.glassNode,{
				top: Math.floor(e.pageY - sub) + "px",
				left:Math.floor(e.pageX - sub) + "px"
			});

		},

		_setImage: function(e){
			// summary: set the image's offset in the clipping window relative to the mouse position

			var xOff = (e.pageX - this.offset.x) / this.offset.w,
				yOff = (e.pageY - this.offset.y) / this.offset.h,
				x = (this._zoomSize.w * xOff * -1) + (this.glassSize * xOff),
				y = (this._zoomSize.h * yOff * -1) + (this.glassSize * yOff);

			dojo.style(this.img, {
				top: y + "px",
				left: x + "px"
			});

		},

		destroy: function(finalize){
			dojo.destroy(this.glassNode);
			this.inherited(arguments);
		}

	});
	
});
