dojo.provide("dojox.image.LightboxNano");
dojo.required("dojo.fx");

(function() {

var getViewport = function(){
		//	summary: Returns the dimensions and scroll position of the viewable area of a browser window

		// NOTE: Duplication and calling method marked private

		var scrollRoot = dojo.doc.documentElement.clientWidth ? dojo.doc.documentElement : dojo.body(),
			scroll = dojo._docScroll();
		return { w: scrollRoot.clientWidth, h: scrollRoot.clientHeight, l: scroll.x, t: scroll.y };
	},
	abs = "absolute";

dojo.declare("dojox.image.LightboxNano", null, {
	//	summary:
	//		A simple "nano" version of the lightbox. 
	//
	//	description:
	//		Very lightweight lightbox which only displays a larger image.  There is
	//		no support for a caption or description.  The lightbox can be closed by
	//		clicking any where or pressing any key.  This widget is intended to be
	//		used on <a> and <img> tags.  Upon creation, if the domNode is <img> tag,
	//		then it is wrapped in an <a> tag, then a <div class="enlarge"> is placed
	//		inside the <a> and can be styled to display an icon that the original
	//		can be enlarged.
	//
	//	example:
	//	|	<a dojoType="dojox.image.LightboxNano" href="/path/to/largeimage.jpg"><img src="/path/to/thumbnail.jpg"></a>
	//
	//	example:
	//	|	<img dojoType="dojox.image.LightboxNano" src="/path/to/thumbnail.jpg" href="/path/to/largeimage.jpg">

	//	href: string
	//		URL to the large image to show in the lightbox.
	href: "",

	//	duration: int
	//		The delay in milliseconds of the LightboxNano open and close animation.
	duration: 500,

	//	preloadDelay: int
	//		The delay in milliseconds after the LightboxNano is created before preloading the larger image.
	preloadDelay: 5000,

	constructor: function(p, n){
		// summary: Initializes the DOM node and connect onload event
		var _this = this;

		dojo.mixin(_this, p);
		n = dojo.byId(n);

		if(!/a/i.test(n.tagName)){
			var a = dojo.create("a", { href: _this.href, "class": n.className }, n, "after");
			n.className = "";
			a.appendChild(n);
			n = a;
		}

		dojo.style(n, {
			display: "block",
			position: "relative"
		});
		_this._createDiv("dojoxEnlarge", n);

		_this._node = n;
		dojo.setSelectable(n, false);
		_this._onClickEvt = dojo.connect(n, "onclick", _this, "_load");
	
		var preloadedImage;	

		window.setTimeout(function(){
			preloadedImage = (new Image()).src = _this.href;
			_this._hideLoading();
		}, _this.preloadDelay);
	},

	destroy: function(){
		// summary: Destroys the LightboxNano and it's DOM node
		var a = this._connects || [];
		a.push(this._onClickEvt);
		dojo.forEach(a, dojo.disconnect);
		dojo.destroy(this._node);
	},

	_createDiv: function(/*String*/cssClass, /*DomNode*/refNode, /*boolean*/display){
		// summary: Creates a div for the enlarge icon and loading indicator layers
		return dojo.create("div", { "class": cssClass, style: { position: abs, display: display ? "" : "none" } }, refNode); // DomNode
	},
	
	_load: function(/*Event*/e){
		// summary: Creates the large image and begins to show it
		var _this = this;

		dojo.stopEvent(e);

		if(!_this._loading){
			_this._loading = true;
			_this._reset();

			var n = dojo.query("img", _this._node)[0],
				a = dojo._abs(n, true),
				c = dojo.contentBox(n),
				b = dojo._getBorderExtents(n),
				i = _this._img = dojo.create("img", {
					style: {
						visibility: "hidden",
						cursor: "pointer",
						position: abs,
						top: 0,
						left: 0,
						zIndex: 9999999
					}
				}, dojo.body()),
				ln = _this._loadingNode;

			if(!ln){
				_this._loadingNode = ln = _this._createDiv("dojoxLoading", _this._node, true);
				var l = dojo.marginBox(ln);
				dojo.style(ln, {
					left: ((c.w - l.w) / 2) + "px",
					top: ((c.h - l.h) / 2) + "px"
				});
			}

			c.x = a.x - 10 + b.l;
			c.y = a.y - 10 + b.t;
			_this._start = c;

			_this._connects = [dojo.connect(i, "onload", _this, "_show")];

			i.src = _this.href;
		}
	},

	_hideLoading: function(){
		// summary: Hides the animated loading indicator
		if(this._loadingNode){
			dojo.style(this._loadingNode, "display", "none");
		}
		this._loadingNode = false;
	},

	_show: function(){
		// summary: The image is now loaded, calculate size and display
		var _this = this,
			vp = getViewport(),
			w = _this._img.width,
			h = _this._img.height,
			vpw = parseInt((vp.w - 20) * 0.9, 10),
			vph = parseInt((vp.h - 20) * 0.9, 10),
			dd = dojo.doc,
			bg = _this._bg = dojo.create("div", {
				style: {
					backgroundColor: "#000",
					opacity: 0.0,
					position: abs,
					zIndex: 9999998
				}
			}, dojo.body());

		if(_this._loadingNode){
			_this._hideLoading();
		}
		dojo.style(_this._img, {
			border: "10px solid #fff",
			visibility: "visible"
		});
		dojo.style(_this._node, "visibility", "hidden");

		_this._loading = false;

		_this._connects = _this._connects.concat([
			dojo.connect(dd, "onmousedown", _this, "_hide"),
			dojo.connect(dd, "onkeypress", _this, "_key"),
			dojo.connect(window, "onresize", _this, "_sizeBg")
		]);

		if(w > vpw){
			h = h * vpw / w;
			w = vpw;
		}
		if(h > vph){
			w = w * vph / h;
			h = vph;
		}

		_this._end = {
			x: (vp.w - 20 - w) / 2 + vp.l,
			y: (vp.h - 20 - h) / 2 + vp.t,
			w: w,
			h: h
		};

		_this._sizeBg();

		dojo.fx.combine([
			_this._anim(_this._img, _this._coords(_this._start, _this._end)),
			_this._anim(bg, { opacity: 0.5 })
		]).play();
	},

	_sizeBg: function(){
		// summary: Resize the background to fill the page

		// NOTE: Duplication (core window module needs method to get scroll dimensions)

		var dd = dojo.doc.documentElement.clientWidth ? dojo.doc.documentElement : dojo.body();
		dojo.style(this._bg, {
			top: 0,
			left: 0,
			width: dd.scrollWidth + "px",
			height: dd.scrollHeight + "px"
		});
	},

	_key: function(/*Event*/e){
		// summary: A key was pressed, so hide the lightbox
		dojo.stopEvent(e);
		this._hide();
	},

	_coords: function(/*Object*/s, /*Object*/e){
		// summary: Returns animation parameters with the start and end coords
		return {
			left:	{ start: s.x, end: e.x },
			top:	{ start: s.y, end: e.y },
			width:	{ start: s.w, end: e.w },
			height:	{ start: s.h, end: e.h }
		}; // object
	},

	_hide: function(){
		// summary: Closes the lightbox
		var _this = this;
		dojo.forEach(_this._connects, dojo.disconnect);
		_this._connects = [];
		dojo.fx.combine([
			_this._anim(_this._img, _this._coords(_this._end, _this._start), "_reset"),
			_this._anim(_this._bg, {opacity:0})
		]).play();
	},

	_reset: function(){
		// summary: Destroys the lightbox
		dojo.style(this._node, "visibility", "visible");
		dojo.forEach([this._img, this._bg], function(n){
			dojo.destroy(n);
			n = null;
		});
		this._node.focus();
	},

	_anim: function(node, args, onEnd){
		// summary: Creates the lightbox open/close and background fadein/out animations
		return dojo.animateProperty({
			node: node,
			duration: this.duration,
			properties: args,
			onEnd: onEnd ? dojo.hitch(this, onEnd) : null
		}); // object
	}
});

})();
