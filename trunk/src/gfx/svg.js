dojo.provide("dojo.gfx.svg");

dojo.require("dojo.lang.declare");
dojo.require("dojo.svg");

dojo.require("dojo.gfx.color");
dojo.require("dojo.gfx.common");

dojo.require("dojo.experimental");
dojo.experimental("dojo.gfx.svg");

dojo.lang.extend(dojo.gfx.Shape, {
	setStroke: function(stroke){
		if(!stroke){
			// don't stroke
			this.strokeStyle = null;
			this.rawNode.setAttribute("stroke", "none");
			this.rawNode.setAttribute("stroke-opacity", 0);
			return this;
		}
		// normalize the stroke
		this.strokeStyle = dojo.gfx.makeParameters(dojo.gfx.defaultStroke, stroke);
		this.strokeStyle.color = dojo.gfx.normalizeColor(this.strokeStyle.color);
		// generate attributes
		var s = this.strokeStyle;
		var rn = this.rawNode;
		if(s){
			rn.setAttribute("stroke", s.color.toCss());
			rn.setAttribute("stroke-opacity", s.color.a);
			rn.setAttribute("stroke-width",   s.width);
			rn.setAttribute("stroke-linecap", s.cap);
			if(typeof(s.join) == "number"){
				rn.setAttribute("stroke-linejoin",   "miter");
				rn.setAttribute("stroke-miterlimit", s.join);
			}else{
				rn.setAttribute("stroke-linejoin",   s.join);
			}
		}
		return this;
	},
	
	setFill: function(fill){
		if(!fill){
			// don't fill
			this.fillStyle = null;
			this.rawNode.setAttribute("fill", "none");
			this.rawNode.setAttribute("fill-opacity", 0);
			return this;
		}
		if(typeof(fill) == "object" && "type" in fill){
			// gradient
			switch(fill.type){
				case "linear":
					var f = dojo.gfx.makeParameters(dojo.gfx.defaultLinearGradient, fill);
					var gradient = this._setFillObject(f, "linearGradient");
					dojo.lang.forEach(["x1", "y1", "x2", "y2"], function(x){
						gradient.setAttribute(x, f[x].toFixed(8));
					});
					break;
				case "radial":
					var f = dojo.gfx.makeParameters(dojo.gfx.defaultRadialGradient, fill);
					var gradient = this._setFillObject(f, "radialGradient");
					dojo.lang.forEach(["cx", "cy", "r"], function(x){
						gradient.setAttribute(x, f[x].toFixed(8));
					});
					break;
				case "pattern":
					var f = dojo.gfx.makeParameters(dojo.gfx.defaultPattern, fill);
					var pattern = this._setFillObject(f, "pattern");
					dojo.lang.forEach(["x", "y", "width", "height"], function(x){
						pattern.setAttribute(x, f[x].toFixed(8));
					});
					break;
			}
			return this;
		}
		// color object
		var f = dojo.gfx.normalizeColor(fill);
		this.fillStyle = f;
		this.rawNode.setAttribute("fill", f.toCss());
		this.rawNode.setAttribute("fill-opacity", f.a);
		return this;
	},
	
	_setFillObject: function(/*Object*/f, /*String*/nodeType){
		var def_elems = this.rawNode.parentNode.getElementsByTagName("defs");
		if(def_elems.length == 0){ return this; }
		this.fillStyle = f;
		var defs = def_elems[0];
		var fill = this.rawNode.getAttribute("fill");
		if(fill && fill.match(/^url\(#.+\)$/)){
			fill = dojo.byId(fill.slice(5, -1));
			if(fill.tagName.toLowerCase() != nodeType.toLowerCase()){
				var id = fill.id;
				fill.parentNode.removeChild(fill);
				fill = document.createElementNS(dojo.svg.xmlns.svg, nodeType);
				fill.setAttribute("id", id);
				defs.appendChild(fill);
			}else{
				while(fill.childNodes.length){
					fill.removeChild(fill.lastChild);
				}
			}
		}else{
			fill = document.createElementNS(dojo.svg.xmlns.svg, nodeType);
			fill.setAttribute("id", dojo.gfx.guid());
			defs.appendChild(fill);
		}
		if(nodeType == "pattern"){
			fill.setAttribute("patternUnits", "userSpaceOnUse");
			var img = document.createElementNS(dojo.svg.xmlns.svg, "image");
			img.setAttribute("x", 0);
			img.setAttribute("y", 0);
			img.setAttribute("width",  f.width .toFixed(8));
			img.setAttribute("height", f.height.toFixed(8));
			img.setAttributeNS(dojo.svg.xmlns.xlink, "href", f.src);
			fill.appendChild(img);
		}else{
			fill.setAttribute("gradientUnits", "userSpaceOnUse");
			for(var i = 0; i < f.colors.length; ++i){
				f.colors[i].color = dojo.gfx.normalizeColor(f.colors[i].color);
				var t = document.createElementNS(dojo.svg.xmlns.svg, "stop");
				t.setAttribute("offset",     f.colors[i].offset.toFixed(8));
				t.setAttribute("stop-color", f.colors[i].color.toCss());
				fill.appendChild(t);
			}
		}
		this.rawNode.setAttribute("fill", "url(#" + fill.getAttribute("id") +")");
		this.rawNode.removeAttribute("fill-opacity");
		return fill;
	},
	
	_applyTransform: function() {
		var matrix = this._getRealMatrix();
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
		//		assigns and clears the underlying node that will represent this
		//		shape. Once set, transforms, gradients, etc, can be applied.
		// no fill & stroke by default
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
		this.rawNode.parentNode.appendChild(this.rawNode);
		return this;
	},
	moveToBack: function(){
		this.rawNode.parentNode.insertBefore(this.rawNode, this.rawNode.parentNode.firstChild);
		return this;
	},
	
	setShape: function(newShape){
		this.shape = dojo.gfx.makeParameters(this.shape, newShape);
		for(var i in this.shape){
			if(i != "type"){ this.rawNode.setAttribute(i, this.shape[i]); }
		}
		return this;
	},
	
	attachFill: function(rawNode){
		var fillStyle = null;
		if(rawNode){
			var fill = rawNode.getAttribute("fill");
			if(fill == "none"){ return; }
			if(fill && fill.match(/^url\(#.+\)$/)){
				var gradient = dojo.byId(fill.slice(5, -1));
				switch(gradient.tagName.toLowerCase()){
					case "lineargradient":
						fillStyle = this._getGradient(dojo.gfx.defaultLinearGradient, gradient);
						dojo.lang.forEach(["x1", "y1", "x2", "y2"], function(x){
							fillStyle[x] = gradient.getAttribute(x);
						});
						break;
					case "radialgradient":
						fillStyle = this._getGradient(dojo.gfx.defaultRadialGradient, gradient);
						dojo.lang.forEach(["cx", "cy", "r"], function(x){
							fillStyle[x] = gradient.getAttribute(x);
						});
						fillStyle.cx = gradient.getAttribute("cx");
						fillStyle.cy = gradient.getAttribute("cy");
						fillStyle.r  = gradient.getAttribute("r");
						break;
					case "pattern":
						fillStyle = dojo.lang.shallowCopy(dojo.gfx.defaultPattern, true);
						dojo.lang.forEach(["x", "y", "width", "height"], function(x){
							fillStyle[x] = gradient.getAttribute(x);
						});
						fillStyle.src = gradient.firstChild.getAttributeNS(dojo.svg.xmlns.xlink, "href");
						break;
				}
			}else{
				fillStyle = new dojo.gfx.color.Color(fill);
				var opacity = rawNode.getAttribute("fill-opacity");
				if(opacity != null) fillStyle.a = opacity;
			}
		}
		return fillStyle;
	},
	
	_getGradient: function(defaultGradient, gradient){
		var fillStyle = dojo.lang.shallowCopy(defaultGradient, true);
		fillStyle.colors = [];
		for(var i = 0; i < gradient.childNodes.length; ++i){
			fillStyle.colors.push({
				offset: gradient.childNodes[i].getAttribute("offset"),
				color:  new dojo.gfx.color.Color(gradient.childNodes[i].getAttribute("stop-color"))
			});
		}
		return fillStyle;
	},

	attachStroke: function(rawNode){
		if(!rawNode){ return; }
		var stroke = rawNode.getAttribute("stroke");
		if(stroke == null || stroke == "none") return null;
		var strokeStyle = dojo.lang.shallowCopy(dojo.gfx.defaultStroke, true);
		var color = new dojo.gfx.color.Color(stroke);
		if(color){
			strokeStyle.color = color;
			strokeStyle.color.a = rawNode.getAttribute("stroke-opacity");
			strokeStyle.width = rawNode.getAttribute("stroke-width");
			strokeStyle.cap = rawNode.getAttribute("stroke-linecap");
			strokeStyle.join = rawNode.getAttribute("stroke-linejoin");
			if(strokeStyle.join == "miter"){
				strokeStyle.join = rawNode.getAttribute("stroke-miterlimit");
			}
		}
		return strokeStyle;
	},

	attachTransform: function(rawNode){
		var matrix = null;
		if(rawNode){
			matrix = rawNode.getAttribute("transform");
			if(matrix.match(/^matrix\(.+\)$/)){
				var t = matrix.slice(7, -1).split(",");
				matrix = dojo.gfx.matrix.normalize({
					xx: parseFloat(t[0]), xy: parseFloat(t[2]), 
					yx: parseFloat(t[1]), yy: parseFloat(t[3]), 
					dx: parseFloat(t[4]), dy: parseFloat(t[5])
				});
			}
		}
		return matrix;
	},
	
	attachShape: function(rawNode){
		var shape = null;
		if(rawNode){
			shape = dojo.lang.shallowCopy(this.shape, true);
			for(var i in shape) {
				shape[i] = rawNode.getAttribute(i);
			}
		}
		return shape;
	},

	attach: function(rawNode){
		if(rawNode) {
			this.rawNode = rawNode;
			this.fillStyle = this.attachFill(rawNode);
			this.strokeStyle = this.attachStroke(rawNode);
			this.matrix = this.attachTransform(rawNode);
			this.shape = this.attachShape(rawNode);
		}
	}
});

dojo.declare("dojo.gfx.Group", dojo.gfx.Shape, {
	setRawNode: function(rawNode){
		this.rawNode = rawNode;
	}
});
dojo.gfx.Group.nodeType = "g";

dojo.declare("dojo.gfx.Rect", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultRect, true);
		this.attach(rawNode);
	},
	setShape: function(newShape){
		this.shape = dojo.gfx.makeParameters(this.shape, newShape);
		for(var i in this.shape){
			if(i != "type" && i != "r"){ this.rawNode.setAttribute(i, this.shape[i]); }
		}
		this.rawNode.setAttribute("rx", this.shape.r);
		this.rawNode.setAttribute("ry", this.shape.r);
		return this;
	},
	attachShape: function(rawNode){
		var shape = null;
		if(rawNode){
			shape = this.inherited("attach", [rawNode]);
			shape.r = Math.min(rawNode.getAttribute("rx"), rawNode.getAttribute("ry"));
		}
		return shape;
	}
});
dojo.gfx.Rect.nodeType = "rect";

dojo.declare("dojo.gfx.Ellipse", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultEllipse, true);
		this.attach(rawNode);
	}
});
dojo.gfx.Ellipse.nodeType = "ellipse";

dojo.declare("dojo.gfx.Circle", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultCircle, true);
		this.attach(rawNode);
	}
});
dojo.gfx.Circle.nodeType = "circle";

dojo.declare("dojo.gfx.Line", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultLine, true);
		this.attach(rawNode);
	}
});
dojo.gfx.Line.nodeType = "line";

dojo.declare("dojo.gfx.Polyline", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultPolyline, true);
		this.attach(rawNode);
	},
	setShape: function(points){
		if(points && points instanceof Array){
			this.shape = dojo.gfx.makeParameters(this.shape, { points: points });
			if(closed && this.shape.points.length){ 
				this.shape.points.push(this.shape.points[0]);
			}
		}else{
			this.shape = dojo.gfx.makeParameters(this.shape, points);
		}
		attr = "";
		for(var i = 0; i< this.shape.points.length; ++i){
			attr += this.shape.points[i].x.toFixed(8) + " " + this.shape.points[i].y.toFixed(8) + " ";
		}
		this.rawNode.setAttribute("points", attr);
		return this;
	}
});
dojo.gfx.Polyline.nodeType = "polyline";

dojo.lang.extend(dojo.gfx.Path, {
	_extraDrawTo: function(action){
		this.rawNode.setAttribute("d", this.shape.path);
		return this;
	},
	_update: function(x,y){
		if(this.shape.absolute){
			this.lastPos = {x: x, y: y};
		}else{
			this.lastPos.x += x;
			this.lastPos.y += y;
		}
	},
	_drawTo: function(action, args){
		this.shape.path += this.shape.absolute ? action.toUpperCase() : action.toLowerCase();
		for(var i = 0; i < args.length; ++i){
			var t = args[i];
			this.shape.path += (typeof(t) == "number" ? t.toFixed(8) : t) + " ";
		}
		this._extraDrawTo(action);
		return this;
	},
	setShape: function(newShape){
		this.shape = dojo.gfx.makeParameters(this.shape, typeof(newShape) == "string" ? {path: newShape} : newShape);
		this.setAbsoluteMode(this.shape.absolute);
		this.rawNode.setAttribute("d", this.shape.path);
		return this;
	},
	smoothCurveTo: function(x2, y2, x, y){
		this._update(x, y);
		return this._drawTo("s", [x2, y2, x, y]);
	},
	arcTo: function(endAngle, cx, cy, rx, ry, xRotate, isCCW) {
		var startAngle = Math.atan2(cy - this.lastPos.y, this.lastPos.x - cx) - xRotate;
		if(!this.shape.absolute) {
			// calculate the startAngle
			endAngle = startAngle + endAngle;
		} 
		// calculate the endpoint
		var eta = Math.atan2(Math.sin(endAngle) / ry, Math.cos(endAngle) / rx);
		var endPoint = dojo.gfx.matrix.multiplyPoint(
			[
				dojo.gfx.matrix.translate(cx, cy),
				dojo.gfx.matrix.rotate(xRotate),
				dojo.gfx.matrix.scale(rx, ry)
			],
			Math.cos(-eta),
			Math.sin(-eta)
		);
		var sweepflag = isCCW ? "0" : "1";
		var theta = isCCW ? endAngle - startAngle : startAngle - endAngle;
		if(theta < 0){
			theta += this._2PI;
		}else if(theta > this._2PI){
			theta = this._2PI;
		}
		var largearc = theta > Math.PI ? "1" : "0";
		this._update(endPoint.x, endPoint.y);
		return this._drawTo("a", [rx, ry, dojo.math.radToDeg(-xRotate), largearc, sweepflag, endPoint.x, endPoint.y] );
	}
});
dojo.gfx.Path.nodeType = "path";

dojo.declare("dojo.gfx.Image", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultImage, true);
		this.attach(rawNode);
	},
	setShape: function(newShape){
		this.shape = dojo.gfx.makeParameters(this.shape, newShape);
		for(var i in this.shape){
			if(i != "type" && i != "src"){ this.rawNode.setAttribute(i, this.shape[i]); }
		}
		this.rawNode.setAttributeNS(dojo.svg.xmlns.xlink, "href", this.shape.src);
		return this;
	},
	setStroke: function() { return this; },
	setFill:   function() { return this; },
	attachStroke: function(rawNode){ return null; },
	attachFill:   function(rawNode){ return null; }
});
dojo.gfx.Image.nodeType = "image";

dojo.gfx._creators = {
	// creators
	createPath: function(path){
		return this.createObject(dojo.gfx.Path, path);
	},
	createRect: function(rect){
		return this.createObject(dojo.gfx.Rect, rect);
	},
	createCircle: function(circle){
		return this.createObject(dojo.gfx.Circle, circle);
	},
	createEllipse: function(ellipse){
		return this.createObject(dojo.gfx.Ellipse, ellipse);
	},
	createLine: function(line){
		return this.createObject(dojo.gfx.Line, line);
	},
	createPolyline: function(points){
		return this.createObject(dojo.gfx.Polyline, points);
	},
	createImage: function(image){
		return this.createObject(dojo.gfx.Image, image);
	},
	createGroup: function(){
		return this.createObject(dojo.gfx.Group);
	},
	createObject: function(/*Function*/shapeType, /*Object*/rawShape){
		// summary: creates an instance of the passed shapeType class
		// shapeType: a class constructor to create an instance of
		// rawShape: properties to be passed in to the classes "setShape" method

		if(!this.rawNode){ return null; }
		var shape = new shapeType();
		var node = document.createElementNS(dojo.svg.xmlns.svg, shapeType.nodeType); 
		shape.setRawNode(node);
		this.rawNode.appendChild(node);
		shape.setShape(rawShape);
		this.add(shape);
		return shape;
	},
	// group control
	add: function(shape){
		var oldParent = shape.getParent();
		if(oldParent){
			oldParent.remove(shape, true);
		}
		shape._setParent(this, null);
		this.rawNode.appendChild(shape.rawNode);
		return this;
	},
	remove: function(shape, silently){
		if(this.rawNode == shape.rawNode.parentNode){
			this.rawNode.removeChild(shape.rawNode);
		}
		shape._setParent(null, null);
		return this;
	}
};

dojo.gfx.attachNode = function(node){
	if(!node) return null;
	var s = null;
	switch(node.tagName.toLowerCase()){
		case dojo.gfx.Rect.nodeType:
			s = new dojo.gfx.Rect();
			break;
		case dojo.gfx.Ellipse.nodeType:
			s = new dojo.gfx.Ellipse();
			break;
		case dojo.gfx.Polyline.nodeType:
			s = new dojo.gfx.Polyline();
			break;
		case dojo.gfx.Path.nodeType:
			s = new dojo.gfx.Path();
			break;
		case dojo.gfx.Circle.nodeType:
			s = new dojo.gfx.Circle();
			break;
		case dojo.gfx.Line.nodeType:
			s = new dojo.gfx.Line();
			break;
		case dojo.gfx.Image.nodeType:
			s = new dojo.gfx.Image();
			break;
		default:
			dojo.debug("FATAL ERROR! tagName = " + node.tagName);
	}
	s.attach(node);
	return s;
};

dojo.lang.extend(dojo.gfx.Surface, {
	setDimensions: function(/*String*/width, /*String*/height){
		// summary: sets the width and height of the rawNode
		if(!this.rawNode){ return this; }
		this.rawNode.setAttribute("width",  width);
		this.rawNode.setAttribute("height", height);
		return this; // dojo.gfx.Surface
	},
	getDimensions: function(){
		// summary: returns an object with properties "width" and "height"
		return this.rawNode ? {width: this.rawNode.getAttribute("width"), height: this.rawNode.getAttribute("height")} : null; // Object
	}
});

dojo.gfx.createSurface = function(parentNode, width, height){
	var s = new dojo.gfx.Surface();
	s.rawNode = document.createElementNS(dojo.svg.xmlns.svg, "svg");
	s.rawNode.setAttribute("width",  width);
	s.rawNode.setAttribute("height", height);

	var defs = new dojo.gfx.svg.Defines();
	var node = document.createElementNS(dojo.svg.xmlns.svg, dojo.gfx.svg.Defines.nodeType); 
	defs.setRawNode(node);
	s.rawNode.appendChild(node);
	
	dojo.byId(parentNode).appendChild(s.rawNode);
	return s;
};

dojo.gfx.attachSurface = function(node){
	var s = new dojo.gfx.Surface();
	s.rawNode = node;
	return s;
};

dojo.lang.extend(dojo.gfx.Group, dojo.gfx._creators);
dojo.lang.extend(dojo.gfx.Surface, dojo.gfx._creators);

delete dojo.gfx._creators;

// Gradient and pattern
dojo.gfx.svg.Defines = function(){
	this.rawNode = null;
};
dojo.lang.extend(dojo.gfx.svg.Defines, {
	setRawNode: function(rawNode){
		this.rawNode = rawNode;
	}
});
dojo.gfx.svg.Defines.nodeType = "defs";
