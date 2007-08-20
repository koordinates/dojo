dojo.provide("dojox.gfx.svg");

dojo.require("dojox.gfx._base");
dojo.require("dojox.gfx.shape");
dojo.require("dojox.gfx.path");

dojo.experimental("dojox.gfx.svg");

dojox.gfx.svg.xmlns = {
	xlink: "http://www.w3.org/1999/xlink",
	svg:   "http://www.w3.org/2000/svg"
};

dojox.gfx.svg.getRef = function(name){
	// summary: returns a DOM Node specified by the name argument or null
	// name: String: an SVG external reference 
	if(!name || name == "none") return null;
	if(name.match(/^url\(#.+\)$/)){
		return dojo.byId(name.slice(5, -1));	// Node
	}
	// alternative representation of a reference
	if(name.match(/^#dj_unique_.+$/)){
		// we assume here that a reference was generated by dojox.gfx
		return dojo.byId(name.slice(1));	// Node
	}
	return null;	// Node
};

dojox.gfx.svg.dasharray = {
	solid:				"none",
	shortdash:			[4, 1],
	shortdot:			[1, 1],
	shortdashdot:		[4, 1, 1, 1],
	shortdashdotdot:	[4, 1, 1, 1, 1, 1],
	dot:				[1, 3],
	dash:				[4, 3],
	longdash:			[8, 3],
	dashdot:			[4, 3, 1, 3],
	longdashdot:		[8, 3, 1, 3],
	longdashdotdot:		[8, 3, 1, 3, 1, 3]
};

dojo.extend(dojox.gfx.Shape, {
	// summary: SVG-specific implementation of dojox.gfx.Shape methods
	
	setFill: function(fill){
		// summary: sets a fill object (SVG)
		// fill: Object: a fill object
		//	(see dojox.gfx.defaultLinearGradient, 
		//	dojox.gfx.defaultRadialGradient, 
		//	dojox.gfx.defaultPattern, 
		//	or dojo.Color)

		if(!fill){
			// don't fill
			this.fillStyle = null;
			this.rawNode.setAttribute("fill", "none");
			this.rawNode.setAttribute("fill-opacity", 0);
			return this;
		}
		var f;
		// FIXME: slightly magical. We're using the outer scope's "f", but setting it later
		var setter = function(x){
			if(dojo.isSafari){
				// we assume that we're executing in the scope of the node to mutate
				this.setAttributeNS(dojox.gfx.svg.xmlns.svg, x, f[x].toFixed(8));
			}else{
				this.setAttribute(x, f[x].toFixed(8));
			}
		}
		if(typeof(fill) == "object" && "type" in fill){
			// gradient
			switch(fill.type){
				case "linear":
					f = dojox.gfx.makeParameters(dojox.gfx.defaultLinearGradient, fill);
					var gradient = this._setFillObject(f, "linearGradient");
					dojo.forEach(["x1", "y1", "x2", "y2"], setter, gradient);
					break;
				case "radial":
					f = dojox.gfx.makeParameters(dojox.gfx.defaultRadialGradient, fill);
					var gradient = this._setFillObject(f, "radialGradient");
					dojo.forEach(["cx", "cy", "r"], setter, gradient);
					break;
				case "pattern":
					f = dojox.gfx.makeParameters(dojox.gfx.defaultPattern, fill);
					var pattern = this._setFillObject(f, "pattern");
					dojo.forEach(["x", "y", "width", "height"], setter, pattern);
					break;
			}
			this.fillStyle = f;
			return this;
		}
		// color object
		var f = dojox.gfx.normalizeColor(fill);
		this.fillStyle = f;
		this.rawNode.setAttribute("fill", f.toCss());
		this.rawNode.setAttribute("fill-opacity", f.a);
		this.rawNode.setAttribute("fill-rule", "evenodd");
		return this;	// self
	},

	setStroke: function(stroke){
		// summary: sets a stroke object (SVG)
		// stroke: Object: a stroke object
		//	(see dojox.gfx.defaultStroke) 
	
		if(!stroke){
			// don't stroke
			this.strokeStyle = null;
			this.rawNode.setAttribute("stroke", "none");
			this.rawNode.setAttribute("stroke-opacity", 0);
			return this;
		}
		// normalize the stroke
		if(typeof stroke == "string"){
			stroke = {color: stroke};
		}
		var s = this.strokeStyle = dojox.gfx.makeParameters(dojox.gfx.defaultStroke, stroke);
		s.color = dojox.gfx.normalizeColor(s.color);
		// generate attributes
		var rn = this.rawNode;
		if(s){
			rn.setAttribute("stroke", s.color.toCss());
			rn.setAttribute("stroke-opacity", s.color.a);
			rn.setAttribute("stroke-width",   s.width);
			rn.setAttribute("stroke-linecap", s.cap);
			if(typeof s.join == "number"){
				rn.setAttribute("stroke-linejoin",   "miter");
				rn.setAttribute("stroke-miterlimit", s.join);
			}else{
				rn.setAttribute("stroke-linejoin",   s.join);
			}
			var da = s.style.toLowerCase();
			if(da in dojox.gfx.svg.dasharray){ da = dojox.gfx.svg.dasharray[da]; }
			if(da instanceof Array){
				da = dojo.clone(da);
				for(var i = 0; i < da.length; ++i){
					da[i] *= s.width;
				}
				if(s.cap != "butt"){
					for(var i = 0; i < da.length; i += 2){
						da[i] -= s.width;
						if(da[i] < 1){ da[i] = 1; }
					}
					for(var i = 1; i < da.length; i += 2){
						da[i] += s.width;
					}
				}
				da = da.join(",");
			}
			rn.setAttribute("stroke-dasharray", da);
			rn.setAttribute("dojoGfxStrokeStyle", s.style);
		}
		return this;	// self
	},
	
	_getParentSurface: function(){
		var surface = this.parent;
		for(; surface && !(surface instanceof dojox.gfx.Surface); surface = surface.parent);
		return surface;
	},

	_setFillObject: function(f, nodeType){
		var svgns = dojox.gfx.svg.xmlns.svg;
		this.fillStyle = f;
		var surface = this._getParentSurface();
		var defs = surface.defNode;
		var fill = this.rawNode.getAttribute("fill");
		var ref  = dojox.gfx.svg.getRef(fill);
		if(ref){
			fill = ref;
			if(fill.tagName.toLowerCase() != nodeType.toLowerCase()){
				var id = fill.id;
				fill.parentNode.removeChild(fill);
				fill = document.createElementNS(svgns, nodeType);
				fill.setAttribute("id", id);
				defs.appendChild(fill);
			}else{
				while(fill.childNodes.length){
					fill.removeChild(fill.lastChild);
				}
			}
		}else{
			fill = document.createElementNS(svgns, nodeType);
			fill.setAttribute("id", dojox.gfx._base._getUniqueId());
			defs.appendChild(fill);
		}
		if(nodeType == "pattern"){
			fill.setAttribute("patternUnits", "userSpaceOnUse");
			var img = document.createElementNS(svgns, "image");
			img.setAttribute("x", 0);
			img.setAttribute("y", 0);
			img.setAttribute("width",  f.width .toFixed(8));
			img.setAttribute("height", f.height.toFixed(8));
			img.setAttributeNS(dojox.gfx.svg.xmlns.xlink, "href", f.src);
			fill.appendChild(img);
		}else{
			fill.setAttribute("gradientUnits", "userSpaceOnUse");
			fill.setAttributeNS(svgns, "gradientUnits", "userSpaceOnUse");
			for(var i = 0; i < f.colors.length; ++i){
				f.colors[i].color = dojox.gfx.normalizeColor(f.colors[i].color);
				var t = document.createElementNS(svgns, "stop");
				t.setAttribute("offset",     f.colors[i].offset.toFixed(8));
				t.setAttribute("stop-color", f.colors[i].color.toCss());
				t.setAttribute("stop-opacity", f.colors[i].color.a);
				fill.appendChild(t);
			}
		}
		this.rawNode.setAttribute("fill", "url(#" + fill.getAttribute("id") +")");
		this.rawNode.removeAttribute("fill-opacity");
		return fill;
	},
	
	_applyTransform: function() {
		var matrix = this.matrix;
		if(matrix){
			var tm = this.matrix;
			this.rawNode.setAttribute("transform", "matrix(" +
				tm.xx.toFixed(8) + "," + tm.yx.toFixed(8) + "," +
				tm.xy.toFixed(8) + "," + tm.yy.toFixed(8) + "," +
				tm.dx.toFixed(8) + "," + tm.dy.toFixed(8) + ")");
		}else{
			this.rawNode.removeAttribute("transform");
		}
		return this;
	},

	setRawNode: function(rawNode){
		// summary:
		//	assigns and clears the underlying node that will represent this
		//	shape. Once set, transforms, gradients, etc, can be applied.
		//	(no fill & stroke by default)
		with(rawNode){
			setAttribute("fill", "none");
			setAttribute("fill-opacity", 0);
			setAttribute("stroke", "none");
			setAttribute("stroke-opacity", 0);
			setAttribute("stroke-width", 1);
			setAttribute("stroke-linecap", "butt");
			setAttribute("stroke-linejoin", "miter");
			setAttribute("stroke-miterlimit", 4);
		}
		this.rawNode = rawNode;
	},

	moveToFront: function(){
		// summary: moves a shape to front of its parent's list of shapes (SVG)
		this.rawNode.parentNode.appendChild(this.rawNode);
		return this;	// self
	},
	moveToBack: function(){
		// summary: moves a shape to back of its parent's list of shapes (SVG)
		this.rawNode.parentNode.insertBefore(this.rawNode, this.rawNode.parentNode.firstChild);
		return this;	// self
	},
	
	setShape: function(newShape){
		// summary: sets a shape object (SVG)
		// newShape: Object: a shape object
		//	(see dojox.gfx.defaultPath,
		//	dojox.gfx.defaultPolyline,
		//	dojox.gfx.defaultRect,
		//	dojox.gfx.defaultEllipse,
		//	dojox.gfx.defaultCircle,
		//	dojox.gfx.defaultLine,
		//	or dojox.gfx.defaultImage)
		this.shape = dojox.gfx.makeParameters(this.shape, newShape);
		for(var i in this.shape){
			if(i != "type"){ this.rawNode.setAttribute(i, this.shape[i]); }
		}
		return this;	// self
	},
	
	attachFill: function(rawNode){
		// summary: deduces a fill style from a Node.
		// rawNode: Node: an SVG node
		var fillStyle = null;
		if(rawNode){
			var fill = rawNode.getAttribute("fill");
			if(fill == "none"){ return null; }
			var ref  = dojox.gfx.svg.getRef(fill);
			if(ref){
				var gradient = ref;
				switch(gradient.tagName.toLowerCase()){
					case "lineargradient":
						fillStyle = this._getGradient(dojox.gfx.defaultLinearGradient, gradient);
						dojo.forEach(["x1", "y1", "x2", "y2"], function(x){
							fillStyle[x] = gradient.getAttribute(x);
						});
						break;
					case "radialgradient":
						fillStyle = this._getGradient(dojox.gfx.defaultRadialGradient, gradient);
						dojo.forEach(["cx", "cy", "r"], function(x){
							fillStyle[x] = gradient.getAttribute(x);
						});
						fillStyle.cx = gradient.getAttribute("cx");
						fillStyle.cy = gradient.getAttribute("cy");
						fillStyle.r  = gradient.getAttribute("r");
						break;
					case "pattern":
						fillStyle = dojo.lang.shallowCopy(dojox.gfx.defaultPattern, true);
						dojo.forEach(["x", "y", "width", "height"], function(x){
							fillStyle[x] = gradient.getAttribute(x);
						});
						fillStyle.src = gradient.firstChild.getAttributeNS(dojox.gfx.svg.xmlns.xlink, "href");
						break;
				}
			}else{
				fillStyle = new dojo.Color(fill);
				var opacity = rawNode.getAttribute("fill-opacity");
				if(opacity != null) fillStyle.a = opacity;
			}
		}
		return fillStyle;	// Object
	},
	
	_getGradient: function(defaultGradient, gradient){
		var fillStyle = dojo.clone(defaultGradient);
		fillStyle.colors = [];
		for(var i = 0; i < gradient.childNodes.length; ++i){
			fillStyle.colors.push({
				offset: gradient.childNodes[i].getAttribute("offset"),
				color:  new dojo.Color(gradient.childNodes[i].getAttribute("stop-color"))
			});
		}
		return fillStyle;
	},

	attachStroke: function(rawNode){
		// summary: deduces a stroke style from a Node.
		// rawNode: Node: an SVG node
		if(!rawNode){ return null; }
		var stroke = rawNode.getAttribute("stroke");
		if(stroke == null || stroke == "none") return null;
		var strokeStyle = dojo.clone(dojox.gfx.defaultStroke);
		var color = new dojo.Color(stroke);
		if(color){
			strokeStyle.color = color;
			strokeStyle.color.a = rawNode.getAttribute("stroke-opacity");
			strokeStyle.width = rawNode.getAttribute("stroke-width");
			strokeStyle.cap = rawNode.getAttribute("stroke-linecap");
			strokeStyle.join = rawNode.getAttribute("stroke-linejoin");
			if(strokeStyle.join == "miter"){
				strokeStyle.join = rawNode.getAttribute("stroke-miterlimit");
			}
			strokeStyle.style = rawNode.getAttribute("dojoGfxStrokeStyle");
		}
		return strokeStyle;	// Object
	},

	attachTransform: function(rawNode){
		// summary: deduces a transformation matrix from a Node.
		// rawNode: Node: an SVG node
		var matrix = null;
		if(rawNode){
			matrix = rawNode.getAttribute("transform");
			if(matrix.match(/^matrix\(.+\)$/)){
				var t = matrix.slice(7, -1).split(",");
				matrix = dojox.gfx.matrix.normalize({
					xx: parseFloat(t[0]), xy: parseFloat(t[2]), 
					yx: parseFloat(t[1]), yy: parseFloat(t[3]), 
					dx: parseFloat(t[4]), dy: parseFloat(t[5])
				});
			}
		}
		return matrix;	// dojox.gfx.matrix.Matrix
	},
	
	attachShape: function(rawNode){
		// summary: builds a shape from a Node.
		// rawNode: Node: an SVG node
		var shape = null;
		if(rawNode){
			shape = dojo.clone(this.shape);
			for(var i in shape) {
				shape[i] = rawNode.getAttribute(i);
			}
		}
		return shape;	// dojox.gfx.Shape
	},

	attach: function(rawNode){
		// summary: reconstructs all shape parameters from a Node.
		// rawNode: Node: an SVG node
		if(rawNode) {
			this.rawNode = rawNode;
			this.fillStyle = this.attachFill(rawNode);
			this.strokeStyle = this.attachStroke(rawNode);
			this.matrix = this.attachTransform(rawNode);
			this.shape = this.attachShape(rawNode);
		}
	},
	
	_getRealMatrix: function(){
		var m = this.matrix;
		var p = this.parent;
		while(p){
			if(p.matrix){
				m = dojox.gfx.matrix.multiply(p.matrix, m);
			}
			p = p.parent;
		}
		return m;
	}
});

dojo.declare("dojox.gfx.Group", dojox.gfx.Shape, {
	// summary: a group shape (SVG), which can be used 
	//	to logically group shapes (e.g, to propagate matricies)
	
	setRawNode: function(rawNode){
		// summary: sets a raw SVG node to be used by this shape
		// rawNode: Node: an SVG node
		this.rawNode = rawNode;
	}
});
dojox.gfx.Group.nodeType = "g";

dojo.declare("dojox.gfx.Rect", dojox.gfx.shape.Rect, {
	// summary: a rectangle shape (SVG)

	attachShape: function(rawNode){
		// summary: builds a rectangle shape from a Node.
		// rawNode: Node: an SVG node
		var shape = null;
		if(rawNode){
			shape = dojox.gfx.Rect.superclass.attachShape.apply(this, arguments);
			shape.r = Math.min(rawNode.getAttribute("rx"), rawNode.getAttribute("ry"));
		}
		return shape;	// dojox.gfx.shape.Rect
	},
	setShape: function(newShape){
		// summary: sets a rectangle shape object (SVG)
		// newShape: Object: a rectangle shape object
		this.shape = dojox.gfx.makeParameters(this.shape, newShape);
		this.bbox = null;
		for(var i in this.shape){
			if(i != "type" && i != "r"){ this.rawNode.setAttribute(i, this.shape[i]); }
		}
		if(this.shape.r){
			this.rawNode.setAttribute("ry", this.shape.r);
			this.rawNode.setAttribute("rx", this.shape.r);
		}
		return this;	// self
	}
});
dojox.gfx.Rect.nodeType = "rect";

dojox.gfx.Ellipse = dojox.gfx.shape.Ellipse;
dojox.gfx.Ellipse.nodeType = "ellipse";

dojox.gfx.Circle = dojox.gfx.shape.Circle;
dojox.gfx.Circle.nodeType = "circle";

dojox.gfx.Line = dojox.gfx.shape.Line;
dojox.gfx.Line.nodeType = "line";

dojo.declare("dojox.gfx.Polyline", dojox.gfx.shape.Polyline, {
	// summary: a polyline/polygon shape (SVG)
	
	setShape: function(points, closed){
		// summary: sets a polyline/polygon shape object (SVG)
		// points: Object: a polyline/polygon shape object
		if(points && points instanceof Array){
			// branch
			// points: Array: an array of points
			this.shape = dojox.gfx.makeParameters(this.shape, { points: points });
			if(closed && this.shape.points.length){ 
				this.shape.points.push(this.shape.points[0]);
			}
		}else{
			this.shape = dojox.gfx.makeParameters(this.shape, points);
		}
		this.box = null;
		var attr = [];
		var p = this.shape.points;
		for(var i = 0; i < p.length; ++i){
			if(typeof p[i] == "number"){
				attr.push(p[i].toFixed(8));
			}else{
				attr.push(p[i].x.toFixed(8));
				attr.push(p[i].y.toFixed(8));
			}
		}
		this.rawNode.setAttribute("points", attr.join(" "));
		return this;	// self
	}
});
dojox.gfx.Polyline.nodeType = "polyline";

dojo.declare("dojox.gfx.Image", dojox.gfx.shape.Image, {
	// summary: an image (SVG)

	setShape: function(newShape){
		// summary: sets an image shape object (SVG)
		// newShape: Object: an image shape object
		this.shape = dojox.gfx.makeParameters(this.shape, newShape);
		this.bbox = null;
		var rawNode = this.rawNode;
		for(var i in this.shape){
			if(i != "type" && i != "src"){ rawNode.setAttribute(i, this.shape[i]); }
		}
		rawNode.setAttributeNS(dojox.gfx.svg.xmlns.xlink, "href", this.shape.src);
		return this;	// self
	},
	setStroke: function(){
		// summary: ignore setting a stroke style
		return this;	// self
	},
	setFill: function(){
		// summary: ignore setting a fill style
		return this;	// self
	},
	attachStroke: function(rawNode){
		// summary: ignore attaching a stroke style
		return null;
	},
	attachFill: function(rawNode){
		// summary: ignore attaching a fill style
		return null;
	}
});
dojox.gfx.Image.nodeType = "image";

dojo.declare("dojox.gfx.Text", dojox.gfx.shape.Text, {
	// summary: an anchored text (SVG)

	attachShape: function(rawNode){
		// summary: builds a text shape from a Node.
		// rawNode: Node: an SVG node
		var shape = null;
		if(rawNode){
			shape = dojo.clone(dojox.gfx.defaultText);
			shape.x = rawNode.getAttribute("x");
			shape.y = rawNode.getAttribute("y");
			shape.align = rawNode.getAttribute("text-anchor");
			shape.decoration = rawNode.getAttribute("text-decoration");
			shape.rotated = parseFloat(rawNode.getAttribute("rotate")) != 0;
			shape.kerning = rawNode.getAttribute("kerning") == "auto";
			shape.text = rawNode.firstChild.nodeValue;
		}
		return shape;	// dojox.gfx.shape.Text
	},
	setShape: function(newShape){
		// summary: sets a text shape object (SVG)
		// newShape: Object: a text shape object
		this.shape = dojox.gfx.makeParameters(this.shape, newShape);
		this.bbox = null;
		var r = this.rawNode;
		var s = this.shape;
		r.setAttribute("x", s.x);
		r.setAttribute("y", s.y);
		r.setAttribute("text-anchor", s.align);
		r.setAttribute("text-decoration", s.decoration);
		r.setAttribute("rotate", s.rotated ? 90 : 0);
		r.setAttribute("kerning", s.kerning ? "auto" : 0);
		r.textContent = s.text;
		return this;	// self
	},
	attach: function(rawNode){
		// summary: reconstructs all shape parameters from a Node.
		// rawNode: Node: an SVG node
		dojox.gfx.Shape.prototype.attach.call(this, rawNode);
		if(rawNode) {
			this.fontStyle = this.attachFont(rawNode);
		}
	},
	getTextWidth: function(){ 
		// summary: get the text width in pixels 
		var rawNode = this.rawNode; 
		var oldParent = rawNode.parentNode; 
		var _measurementNode = rawNode.cloneNode(true); 
		_measurementNode.style.visibility = "hidden"; 

		// solution to the "orphan issue" in FF 
		var _width = 0; 
		var _text = _measurementNode.firstChild.nodeValue; 
		oldParent.appendChild(_measurementNode); 

		// solution to the "orphan issue" in Opera 
		// (nodeValue == "" hangs firefox) 
		if(_text!=""){ 
			while(!_width){ 
				_width = parseInt(_measurementNode.getBBox().width); 
			} 
		} 
		oldParent.removeChild(_measurementNode); 
		return _width; 
	} 
});
dojox.gfx.Text.nodeType = "text";

dojo.declare("dojox.gfx.Path", dojox.gfx.path.Path, {
	// summary: a path shape (SVG)

	_updateWithSegment: function(segment){
		// summary: updates the bounding box of path with new segment
		// segment: Object: a segment
		dojox.gfx.Path.superclass._updateWithSegment.apply(this, arguments);
		if(typeof(this.shape.path) == "string"){
			this.rawNode.setAttribute("d", this.shape.path);
		}
	},
	setShape: function(newShape){
		// summary: forms a path using a shape (SVG)
		// newShape: Object: an SVG path string or a path object (see dojox.gfx.defaultPath)
		dojox.gfx.Path.superclass.setShape.apply(this, arguments);
		this.rawNode.setAttribute("d", this.shape.path);
		return this;	// self
	}
});
dojox.gfx.Path.nodeType = "path";

dojo.declare("dojox.gfx.TextPath", dojox.gfx.path.TextPath, {
	// summary: a textpath shape (SVG)

	_updateWithSegment: function(segment){
		// summary: updates the bounding box of path with new segment
		// segment: Object: a segment
		dojox.gfx.Path.superclass._updateWithSegment.apply(this, arguments);
		this._setTextPath();
	},
	setShape: function(newShape){
		// summary: forms a path using a shape (SVG)
		// newShape: Object: an SVG path string or a path object (see dojox.gfx.defaultPath)
		dojox.gfx.Path.superclass.setShape.apply(this, arguments);
		this._setTextPath();
		return this;	// self
	},
	_setTextPath: function(){
		if(typeof this.shape.path != "string"){ return; }
		var r = this.rawNode;
		if(!r.firstChild){
			var tp = document.createElementNS(dojox.gfx.svg.xmlns.svg, "textPath");
			var tx = document.createTextNode("");
			tp.appendChild(tx);
			r.appendChild(tp);
		}
		var ref  = r.firstChild.getAttributeNS(dojox.gfx.svg.xmlns.xlink, "href");
		var path = ref && dojox.gfx.svg.getRef(ref);
		if(!path){
			var surface = this._getParentSurface();
			if(surface){
				var defs = surface.defNode;
				path = document.createElementNS(dojox.gfx.svg.xmlns.svg, "path");
				var id = dojox.gfx._base._getUniqueId();
				path.setAttribute("id", id);
				defs.appendChild(path);
				r.firstChild.setAttributeNS(dojox.gfx.svg.xmlns.xlink, "href", "#" + id);
			}
		}
		if(path){
			path.setAttribute("d", this.shape.path);
		}
	},
	_setText: function(){
		var r = this.rawNode;
		if(!r.firstChild){
			var tp = document.createElementNS(dojox.gfx.svg.xmlns.svg, "textPath");
			var tx = document.createTextNode("");
			tp.appendChild(tx);
			r.appendChild(tp);
		}
		r = r.firstChild;
		var t = this.text;
		r.setAttribute("alignment-baseline", "middle");
		switch(t.align){
			case "middle":
				r.setAttribute("text-anchor", "middle");
				r.setAttribute("startOffset", "50%");
				break;
			case "end":
				r.setAttribute("text-anchor", "end");
				r.setAttribute("startOffset", "100%");
				break;
			default:
				r.setAttribute("text-anchor", "start");
				r.setAttribute("startOffset", "0%");
				break;
		}
		//r.parentNode.setAttribute("alignment-baseline", "central");
		//r.setAttribute("dominant-baseline", "central");
		r.setAttribute("baseline-shift", "0.5ex");
		r.setAttribute("text-decoration", t.decoration);
		r.setAttribute("rotate", t.rotated ? 90 : 0);
		r.setAttribute("kerning", t.kerning ? "auto" : 0);
		r.firstChild.data = t.text;
	},
	attachText: function(rawNode){
		// summary: builds a textpath shape from a Node.
		// rawNode: Node: an SVG node
		var shape = null;
		if(rawNode){
			shape = dojo.clone(dojox.gfx.defaultTextPath);
			shape.align = rawNode.getAttribute("text-anchor");
			shape.decoration = rawNode.getAttribute("text-decoration");
			shape.rotated = parseFloat(rawNode.getAttribute("rotate")) != 0;
			shape.kerning = rawNode.getAttribute("kerning") == "auto";
			shape.text = rawNode.firstChild.nodeValue;
		}
		return shape;	// dojox.gfx.shape.TextPath
	},
	attach: function(rawNode){
		// summary: reconstructs all shape parameters from a Node.
		// rawNode: Node: an SVG node
		dojox.gfx.Shape.prototype.attach.call(this, rawNode);
		if(rawNode) {
			this.fontStyle = this.attachFont(rawNode);
			this.text = this.attachText(rawNode);
		}
	}
});
dojox.gfx.TextPath.nodeType = "text";


dojox.gfx.svg._font = {
	_setFont: function(){
		// summary: sets a font object (SVG)
		var f = this.fontStyle;
		// next line doesn't work in Firefox 2 or Opera 9
		//this.rawNode.setAttribute("font", dojox.gfx.makeFontString(this.fontStyle));
		this.rawNode.setAttribute("font-style", f.style);
		this.rawNode.setAttribute("font-variant", f.variant);
		this.rawNode.setAttribute("font-weight", f.weight);
		this.rawNode.setAttribute("font-size", f.size);
		this.rawNode.setAttribute("font-family", f.family);
	},
	attachFont: function(rawNode){
		// summary: deduces a font style from a Node.
		// rawNode: Node: an SVG node
		if(!rawNode){ return null; }
		var fontStyle = dojo.clone(dojox.gfx.defaultFont);
		fontStyle.style = rawNode.getAttribute("font-style");
		fontStyle.variant = rawNode.getAttribute("font-variant");
		fontStyle.weight = rawNode.getAttribute("font-weight");
		fontStyle.size = rawNode.getAttribute("font-size");
		fontStyle.family = rawNode.getAttribute("font-family");
		return fontStyle;	// Object
	}
};

dojo.extend(dojox.gfx.Text, dojox.gfx.svg._font);
dojo.extend(dojox.gfx.TextPath, dojox.gfx.svg._font);

delete dojox.gfx.svg._font;

dojox.gfx.svg._creators = {
	// summary: SVG shape creators
	createPath: function(path){
		// summary: creates an SVG path shape
		// path: Object: a path object (see dojox.gfx.defaultPath)
		return this.createObject(dojox.gfx.Path, path);	// dojox.gfx.Path
	},
	createRect: function(rect){
		// summary: creates an SVG rectangle shape
		// rect: Object: a path object (see dojox.gfx.defaultRect)
		return this.createObject(dojox.gfx.Rect, rect);	// dojox.gfx.Rect
	},
	createCircle: function(circle){
		// summary: creates an SVG circle shape
		// circle: Object: a circle object (see dojox.gfx.defaultCircle)
		return this.createObject(dojox.gfx.Circle, circle);	// dojox.gfx.Circle
	},
	createEllipse: function(ellipse){
		// summary: creates an SVG ellipse shape
		// ellipse: Object: an ellipse object (see dojox.gfx.defaultEllipse)
		return this.createObject(dojox.gfx.Ellipse, ellipse);	// dojox.gfx.Ellipse
	},
	createLine: function(line){
		// summary: creates an SVG line shape
		// line: Object: a line object (see dojox.gfx.defaultLine)
		return this.createObject(dojox.gfx.Line, line);	// dojox.gfx.Line
	},
	createPolyline: function(points){
		// summary: creates an SVG polyline/polygon shape
		// points: Object: a points object (see dojox.gfx.defaultPolyline)
		//	or an Array of points
		return this.createObject(dojox.gfx.Polyline, points);	// dojox.gfx.Polyline
	},
	createImage: function(image){
		// summary: creates an SVG image shape
		// image: Object: an image object (see dojox.gfx.defaultImage)
		return this.createObject(dojox.gfx.Image, image);	// dojox.gfx.Image
	},
	createText: function(text){
		// summary: creates an SVG text shape
		// text: Object: a text object (see dojox.gfx.defaultText)
		return this.createObject(dojox.gfx.Text, text);	// dojox.gfx.Text
	},
	createTextPath: function(text){
		// summary: creates an SVG text shape
		// text: Object: a textpath object (see dojox.gfx.defaultTextPath)
		return this.createObject(dojox.gfx.TextPath, {}).setText(text);	// dojox.gfx.TextPath
	},
	createGroup: function(){
		// summary: creates an SVG group shape
		return this.createObject(dojox.gfx.Group);	// dojox.gfx.Group
	},
	createObject: function(shapeType, rawShape){
		// summary: creates an instance of the passed shapeType class
		// shapeType: Function: a class constructor to create an instance of
		// rawShape: Object: properties to be passed in to the classes "setShape" method
		if(!this.rawNode){ return null; }
		var shape = new shapeType();
		var node = document.createElementNS(dojox.gfx.svg.xmlns.svg, shapeType.nodeType); 
		shape.setRawNode(node);
		this.rawNode.appendChild(node);
		shape.setShape(rawShape);
		this.add(shape);
		return shape;	// dojox.gfx.Shape
	},
	createShape: dojox.gfx._createShape,
	// group control
	add: function(shape){
		// summary: adds a shape to a group/surface
		// shape: dojox.gfx.Shape: an SVG shape object
		var oldParent = shape.getParent();
		if(oldParent){
			oldParent.remove(shape, true);
		}
		shape._setParent(this, null);
		this.rawNode.appendChild(shape.rawNode);
		return this;	// self
	},
	remove: function(shape, silently){
		// summary: remove a shape from a group/surface
		// shape: dojox.gfx.Shape: an SVG shape object
		// silently: Boolean?: if true, regenerate a picture
		if(this.rawNode == shape.rawNode.parentNode){
			this.rawNode.removeChild(shape.rawNode);
		}
		shape._setParent(null, null);
		return this;	// self
	},
	clear: function(){
		// summary: removes all shapes from a group/surface
		var r = this.rawNode;
		while(r.lastChild){
			r.removeChild(r.lastChild);
		}
		return this;	// self
	}
};

dojox.gfx.attachNode = function(node){
	// summary: creates a shape from a Node
	// node: Node: an SVG node
	if(!node) return null;
	var s = null;
	switch(node.tagName.toLowerCase()){
		case dojox.gfx.Rect.nodeType:
			s = new dojox.gfx.Rect();
			break;
		case dojox.gfx.Ellipse.nodeType:
			s = new dojox.gfx.Ellipse();
			break;
		case dojox.gfx.Polyline.nodeType:
			s = new dojox.gfx.Polyline();
			break;
		case dojox.gfx.Path.nodeType:
			s = new dojox.gfx.Path();
			break;
		case dojox.gfx.Circle.nodeType:
			s = new dojox.gfx.Circle();
			break;
		case dojox.gfx.Line.nodeType:
			s = new dojox.gfx.Line();
			break;
		case dojox.gfx.Image.nodeType:
			s = new dojox.gfx.Image();
			break;
		case dojox.gfx.Text.nodeType:
			var t = node.getElementsByTagName("textPath");
			if(t && t.length){
				s = new dojox.gfx.TextPath();
			}else{
				s = new dojox.gfx.Text();
			}
			break;
		default:
			console.debug("FATAL ERROR! tagName = " + node.tagName);
			return null;
	}
	s.attach(node);
	return s;	// dojox.gfx.Shape
};

dojo.extend(dojox.gfx.Surface, {
	// summary: a surface object to be used for drawings (SVG)

	setDimensions: function(width, height){
		// summary: sets the width and height of the rawNode
		// width: String: width of surface, e.g., "100px"
		// height: String: height of surface, e.g., "100px"
		if(!this.rawNode){ return this; }
		this.rawNode.setAttribute("width",  width);
		this.rawNode.setAttribute("height", height);
		return this;	// self
	},
	getDimensions: function(){
		// summary: returns an object with properties "width" and "height"
		return this.rawNode ? {width: this.rawNode.getAttribute("width"), height: this.rawNode.getAttribute("height")} : null; // Object
	}
});

dojox.gfx.createSurface = function(parentNode, width, height){
	// summary: creates a surface (SVG)
	// parentNode: Node: a parent node
	// width: String: width of surface, e.g., "100px"
	// height: String: height of surface, e.g., "100px"

	var s = new dojox.gfx.Surface();
	s.rawNode = document.createElementNS(dojox.gfx.svg.xmlns.svg, "svg");
	s.rawNode.setAttribute("width",  width);
	s.rawNode.setAttribute("height", height);

	var defs = new dojox.gfx.svg.Defines();
	var node = document.createElementNS(dojox.gfx.svg.xmlns.svg, dojox.gfx.svg.Defines.nodeType); 
	defs.setRawNode(node);
	s.rawNode.appendChild(node);
	s.defNode = node;
	
	dojo.byId(parentNode).appendChild(s.rawNode);
	return s;	// dojox.gfx.Surface
};

dojox.gfx.attachSurface = function(node){
	// summary: creates a surface from a Node
	// node: Node: an SVG node
	var s = new dojox.gfx.Surface();
	s.rawNode = node;
	var def_elems = node.getElementsByTagName("defs");
	if(def_elems.length == 0){
		return null;	// dojox.gfx.Surface
	}
	s.defNode = def_elems[0];
	return s;	// dojox.gfx.Surface
};

dojo.extend(dojox.gfx.Group, dojox.gfx.svg._creators);
dojo.extend(dojox.gfx.Surface, dojox.gfx.svg._creators);

delete dojox.gfx.svg._creators;

// Gradient and pattern

dojox.gfx.svg.Defines = function(){
	this.rawNode = null;
};

dojo.extend(dojox.gfx.svg.Defines, {
	setRawNode: function(rawNode){
		this.rawNode = rawNode;
	}
});

dojox.gfx.svg.Defines.nodeType = "defs";
