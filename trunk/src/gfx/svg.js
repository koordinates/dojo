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
					var gradient = this._setGradient(f, "linearGradient");
					dojo.lang.forEach(["x1", "y1", "x2", "y2"], function(x){
						gradient.setAttribute(x, f[x].toFixed(8));
					});
					break;
				case "radial":
					var f = dojo.gfx.makeParameters(dojo.gfx.defaultRadialGradient, fill);
					var gradient = this._setGradient(f, "radialGradient");
					dojo.lang.forEach(["cx", "cy", "r"], function(x){
						gradient.setAttribute(x, f[x].toFixed(8));
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
	
	_setGradient: function(/*Object*/f, /*String*/nodeType){
		var def_elems = this.rawNode.parentNode.getElementsByTagName("defs");
		if(def_elems.length == 0){ return this; }
		this.fillStyle = f;
		var defs = def_elems[0];
		var gradient = this.rawNode.getAttribute("fill");
		if(gradient && gradient.match(/^url\(#.+\)$/)){
			gradient = dojo.byId(gradient.slice(5, -1));
			if(gradient.tagName.toLowerCase() != nodeType.toLowerCase()){
				var id = gradient.id;
				gradient.parentNode.removeChild(gradient);
				gradient = document.createElementNS(dojo.svg.xmlns.svg, nodeType);
				gradient.setAttribute("id", id);
				defs.appendChild(gradient);
			}else{
				while(gradient.childNodes.length){
					gradient.removeChild(gradient.lastChild);
				}
			}
		}else{
			gradient = document.createElementNS(dojo.svg.xmlns.svg, nodeType);
			gradient.setAttribute("id", dojo.gfx.guid());
			defs.appendChild(gradient);
		}
		gradient.setAttribute("gradientUnits", "userSpaceOnUse");
		for(var i = 0; i < f.colors.length; ++i){
			f.colors[i].color = dojo.gfx.normalizeColor(f.colors[i].color);
			var t = document.createElementNS(dojo.svg.xmlns.svg, "stop");
			t.setAttribute("offset",     f.colors[i].offset.toFixed(8));
			t.setAttribute("stop-color", f.colors[i].color.toCss());
			gradient.appendChild(t);
		}
		this.rawNode.setAttribute("fill", "url(#" + gradient.getAttribute("id") +")");
		this.rawNode.removeAttribute("fill-opacity");
		return gradient;
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

	attach: function(rawNode){
		if(rawNode) {
			this.rawNode = rawNode;
			this.fillStyle = this.attachFill(rawNode);
			this.strokeStyle = this.attachStroke(rawNode);
			this.matrix = this.attachTransform(rawNode);
			// shape-specific attributes.
			for(var i in this.shape) {
				this.shape[i] = rawNode.getAttribute(i);
			}
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

dojo.declare("dojo.gfx.Path", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultPath, true);
		this.lastPos = { x: 0, y: 0 };
		this.attach(rawNode);
	},
	setShape: function(newShape){
		this.shape = dojo.gfx.makeParameters(this.shape, typeof(newShape) == "string" ? {path: newShape} : newShape);
		this.setAbsoluteMode(this.shape.absolute);
		this.rawNode.setAttribute("d", this.shape.path);
		return this;
	},
	setAbsoluteMode: function(mode){
		this.shape.absolute = typeof(mode) == "string" ? (mode == "absolute") : mode;
		return this;
	},
	getAbsoluteMode: function(){
		return this.shape.absolute;
	},
	// Drawing actions
	drawTo: function(action, args) {
		this.shape.path += this.shape.absolute ? action.toUpperCase() : action.toLowerCase();
		for(var i = 0; i< args.length; ++i){
			this.shape.path += args[i] + " ";
		}
		this.rawNode.setAttribute("d", this.shape.path);
		return this;
	},
	update: function(x,y) {
		if(this.shape.absolute){
			this.lastPos = {x: x, y: y};
		}else{
			this.lastPos.x += x;
			this.lastPos.y += y;
		}
	},
	closePath: function(){
		return this.drawTo("z", []);
	},
	moveTo: function(x, y){
		this.update(x, y);
		return this.drawTo("m", [x, y]);
	},
	lineTo: function(x, y){
		this.update(x, y);
		return this.drawTo("l", [x, y]);
	},
	hLineTo: function(x) {
		y = this.shape.absolute ? this.lastPos.y : 0;
		this.update(x, y);
		return this.drawTo("h", [x]);
	},
	vLineTo: function(y) {
		x = this.shape.absolute ? this.lastPos.x : 0;
		return this.drawTo("v", [y]);
	},
	curveTo: function(x1, y1, x2, y2, x, y) {
		this.update(x, y);
		return this.drawTo("c", [x1, y1, x2, y2, x, y]);
	},
	smoothCurveTo: function(x2, y2, x, y) {
		this.update(x, y);
		return this.drawTo("s", [x2, y2, x, y]);
	},
	qbCurveTo: function(x1, y1, x, y) {
		this.update(x, y);
		return this.drawTo("q", [x1, y1, x, y]);
	},
	smoothQBCurveTo: function(x, y) {
		this.update(x, y);
		return this.drawTo("t", [x, y]);
	},
	arcTo: function(top, right, bottom, left, isCCW, x, y) {
		var rx = (right - left)/2;
		var ry = (bottom - top)/2;
		var cx = (left + right)/2;
		var cy = (top + bottom)/2;

		// we have to cripple this feature for VML
		var xrotate = 0;
		var sweepflag = isCCW ? 0 : 1;
		
		// normalize coordinates
		var u = -cx;
		var v = -cy;
		if(this.shape.absolute){
			u += this.lastPos.x;
			v += this.lastPos.y;
		}
		// start point
		var alpha = Math.atan2(v/ry, u/rx);
		// end point
		var beta = Math.atan2((y-cy)/ry, (x-cx)/rx);

		var theta = isCCW ? beta - alpha : alpha - beta;
		if(theta < 0){ theta += 2*Math.pi; }
		
		var largearc = theta > Math.pi/2 ? 1 : 0;
		
		return this.drawTo("a", [rx, ry, xrotate, largearc, sweepflag, x, y] );
	}
});
dojo.gfx.Path.nodeType = "path";

// FIXME: why the hell is this global!?!!
var creators = {
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

dojo.lang.extend(dojo.gfx.Group, creators);
dojo.lang.extend(dojo.gfx.Surface, creators);

delete creators;

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

// TODO: finish recycling the pattern gradient code listed below
/*
dojo.gfx.svg.Gradient = function(){
	this.rawNode = null;
	this.gradient = null;
	this.id = "";
	this.stops = null;
};

dojo.lang.extend(dojo.gfx.svg.Gradient, {
	addStop: function(stop){
		if(stop){
			if(! this.stops ) this.stops = new Array;
			this.stops.push(stop);

			var n = document.createElementNS(dojo.svg.xmlns.svg, "stop");
			n.setAttribute("offset", stop.offset);
			n.setAttribute("stop-color", stop.color.toCss());
			this.rawNode.appendChild(n);
		}
		return this;
	},
	setGradient: function(newGradient){
		dojo.gfx.normalizeParameters(this.gradient, newGradient );
		// FIXME: find a real guid() !
		this.id = dojo.gfx.guid();
		this.rawNode = document.createElementNS(dojo.svg.xmlns.svg, this.nodeType);

		for(it in this.gradient) {
			this.rawNode.setAttribute(it, this.gradient[it]);
		}
		this.rawNode.setAttribute("id", this.id);
		return this;
	},
    attach: function(rawNode) {
        this.rawNode = rawNode;
		for(it in this.gradient) {
			this.gradient[it] = this.rawNode.getAttribute(it); 
		}
        this.id = this.rawNode.getAttribute("id"); 

        //stops
        var stops = rawNode.getElementsByTagName("stop");
        this.stops = new Array;
        for( var i = 0; i< stops.length; i++ ) {
            var stop = {};
            stop["offset"] = stops[i].getAttribute("offset");
            stop["color"] = new dojo.gfx.color.Color( stops[i].getAttribute("stop-color") );
            this.stops.push( stop );
        }

        return this;
    },
	getId: function(){ return this.id; },
	getRawNode: function(){  return this.rawNode; }
});

dojo.declare("dojo.gfx.svg.LinearGradient", dojo.gfx.svg.Gradient, {
	nodeType: "linearGradient",
	initializer: function( newGradient ) {
		this.gradient = { x1:"0%", y1:"0%", x2:"100%", y2:"0%", gradientUnits:"userSpaceOnUse"};
        if( newGradient.getElementsByTagName != undefined ) {
            this.attach(newGradient);
        } else {  
		    this.setGradient(newGradient);
        }
	}
});

dojo.declare("dojo.gfx.svg.RadialGradient", dojo.gfx.svg.Gradient, {
	nodeType: "radialGradient",
	initializer: function( newGradient ) {
		this.gradient = { cx:"50%", cy:"50%", r:"50%", fx:"0%", fy:"0%", gradientUnits:"userSpaceOnUse"};
		this.setGradient(newGradient);
	}
});

dojo.declare("dojo.gfx.svg.Pattern", dojo.gfx.svg.Gradient, {
	nodeType: "pattern",
	addStop: null,
	initializer: function( newGradient ) {
		this.gradient = { x:0, y:0, width:100, height:100, patternUnits:"userSpaceOnUse"};
		this.setGradient(newGradient);
	}
});
*/

/*
dojo.lang.extend(dojo.gfx.svg.Pattern, metacreator);
dojo.lang.extend(dojo.gfx.svg.Pattern, creators);
*/
