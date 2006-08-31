dojo.require("dojo.lang.declare");
dojo.require("dojo.graphics.color");
dojo.require("dojo.svg");
dojo.provide("dojo.gfx.svg");

dojo.require("dojo.experimental");
dojo.experimental("dojo.gfx.svg");

// generic environment setup function;
// currently a stub
dojo.gfx.svg.init = function() {
}

// this is a Shape object, which knows how to apply graphical attributes and a transformation
dojo.gfx.svg.Shape = function(){
	// NOTE: constructor --- used to initialiaze every instance

	// underlying SVG node
	this.rawNode = null;
	
	// transformation matrix
	this.matrix  = null;

	// graphical attributes
	this.fillStyle   = null;
	this.strokeStyle = null;

	// attributes wrapper for all objects inherited from shape
	this.shape = null; 
};


dojo.lang.extend(dojo.gfx.svg.Shape, {
	// NOTE: a list of shared methods and constants in the object notation

	// set a stroke style
	setStroke: function(stroke){
		// normalized LineStroke object (will be in renderer-independent part of code)
		this.strokeStyle = { color:null, width:1, cap:"butt", join:4 };
		if(stroke == null){
			this.strokeStyle = null;
		}else { 
			dojo.gfx.normalizeParameters(this.strokeStyle, stroke);
		}
		// generate attributes
		var s = this.strokeStyle;
		if(s){
			this.rawNode.setAttribute("stroke", "rgb("+s.color.r+","+s.color.g+","+s.color.b+")");
			this.rawNode.setAttribute("stroke-opacity", s.color.a);
			this.rawNode.setAttribute("stroke-width",   s.width);
			this.rawNode.setAttribute("stroke-linecap", s.cap);
			if(typeof(s.join) == "number"){
				this.rawNode.setAttribute("stroke-linejoin",   "miter");
				this.rawNode.setAttribute("stroke-miterlimit", s.join);
			}else{
				this.rawNode.setAttribute("stroke-linejoin",   s.join);
			}
		}else{
			this.rawNode.removeAttribute("stroke");
			this.rawNode.removeAttribute("stroke-opacity");
			this.rawNode.removeAttribute("stroke-width");
			this.rawNode.removeAttribute("stroke-linecap");
			this.rawNode.removeAttribute("stroke-linejoin");
			this.rawNode.removeAttribute("stroke-miterlimit");
		}
		// support for chaining
		return this;
	},
	
	// set a fill style
	setFill: function(fill){
		if( fill instanceof dojo.gfx.Gradient ) {
			// gradient object: linearGradient, radialGradient, pattern
			els = this.rawNode.parentNode.getElementsByTagName("defs");
			if( els.length == 0 )
				return this;

			this.fillStyle = fill;
			defs = els[0];
			defs.appendChild( fill.getRawNode() );
			this.rawNode.setAttribute("fill", "url(#" + fill.getId() +")");
			return this;
		} else if( fill instanceof dojo.graphics.color.Color) {
			// color object
			this.fillStyle = fill;
			this.rawNode.setAttribute("fill", "rgb("+fill.r+","+fill.g+","+fill.b+")");
			this.rawNode.setAttribute("fill-opacity", fill.a);
		} else {
			this.fillStyle = null;
			this.rawNode.removeAttribute("fill");
			this.rawNode.removeAttribute("fill-opacity");
		}
		// support for chaining
		return this;
	},
	
	// set an absolute transformation matrix
	setTransform: function(matrix){
	   this.matrix = dojo.gfx.normalizeMatrix(matrix);
		// generate the attribute
		if(this.matrix){
			this.rawNode.setAttribute("transform", "matrix("+
				this.matrix.xx+","+this.matrix.yx+","+
				this.matrix.xy+","+this.matrix.yy+","+
				this.matrix.dx+","+this.matrix.dy+")");
		}else{
			this.rawNode.removeAttribute("transform");
		}
		// support for chaining
		return this;
	},

	// apply-right a transformation matrix
	applyTransform: function(matrix){
		return this.setTransform(dojo.gfx.multiply(this.matrix, matrix));
	},

	// apply-left a transformation matrix
	applyLeftTransform: function(matrix){
		return this.setTransform(dojo.gfx.multiply(matrix, this.matrix));
	},

	setShape: function(newShape){
		dojo.gfx.normalizeParameters(this.shape, newShape);
		// generate attributes
		for(it in this.shape) {
			this.rawNode.setAttribute(it, this.shape[it]);
		}
		// support for chaining
		return this;
	},
	
	attachFill: function(rawNode){
		fillStyle = null;
		if(rawNode) {
			fill = rawNode.getAttribute("fill");
			if( (left = fill.indexOf("url(#")) > -1 ) {
				// a gradient object !
				url = fill.slice( left+5, fill.indexOf(")") );
				els = rawNode.parentNode.getElementsByTagName("defs");
				if( els.length != 0 ) {
					defs = els[0].childNodes;
					for( var i = 0; i< defs.length; i++ ) {
						def = defs[i];
						if( def.getAttribute("id") == url ) {
							// bingo, we have found the gradient.
                            return new dojo.gfx.LinearGradient(def);
						}
					}
				}
			} else if( color = new dojo.graphics.color.Color(fill) ) {
				// a color object !
				fillStyle = color;
				fo = rawNode.getAttribute("fill-opacity");
				if(fo) fillStyle.a = fo;
			}
		}
		return fillStyle;
	},

	attachStroke: function(rawNode) {
		strokeStyle = {color:null, width:1, cap:"butt", join:4};
		if(rawNode) {
			stroke = rawNode.getAttribute("stroke");
            if( stroke == null ) return null;
			color = new dojo.graphics.color.Color(stroke);
			if( color ) {
				// a color object !
				strokeStyle.color = color;
				strokeStyle.color.a = rawNode.getAttribute("stroke-opacity");
				dojo.debug( "strokestyle.color = " + strokeStyle.color );
				strokeStyle.width = rawNode.getAttribute("stroke-width");
				strokeStyle.cap = rawNode.getAttribute("stroke-linecap");

				if( rawNode.getAttribute("stroke-linejoin") == "miter" ) {
					strokeStyle.join = rawNode.getAttribute("stroke-miterlimit");
				} else {
					strokeStyle.join = rawNode.getAttribute("stroke-linejoin");
				}
			}
		}
		return strokeStyle;
	},

	attachTransform: function(rawNode) {
		matrix = null;
		if(rawNode) {
			matrix = rawNode.getAttribute("transform");
			if( matrix && matrix.indexOf("matrix(") > -1 && matrix.indexOf(")") ) {
				ts = matrix.slice( matrix.indexOf("(")+1, matrix.indexOf(")") ).split(",");
				matrix = { xx:ts[0], yx:ts[1], xy:ts[2], yy:ts[3], dx:ts[4], dy:ts[5] };
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
			for(it in this.shape) {
				this.shape[it] = rawNode.getAttribute(it);
			}
		}
	},

	// trivial getters
	getNode:      function(){ return this.rawNode; },
	getTransform: function(){ return this.matrix; },
	getFill:      function(){ return this.fillStyle; },
	getStroke:    function(){ return this.strokeStyle; },
	getShape:     function(){ return this.shape; }
});

dojo.declare("dojo.gfx.svg.Group", dojo.gfx.svg.Shape, {
	nodeType: 'g',
	shape: null
});

dojo.declare("dojo.gfx.svg.Path", dojo.gfx.svg.Shape, {
	nodeType: 'path',
	initializer: function() {
		this.shape = { path:"", coordination:"absolute" };
		this.lastPos = {x:0, y:0 };
	},
	setShape: function(newShape){
		// FIXME: accept a string as well as a Path object
		dojo.gfx.normalizeParameters(this.shape, newShape);
		this.setCoordination(this.shape.coordination);
		this.rawNode.setAttribute("d", this.shape.path);
		return this;
	},
	setCoordination: function(cor) {
		this.shape.coordination = (cor == "relative") ? "relative" : "absolute";
		return this
	},
	getCoordination: function() {
		return this.shape.coordination;
	},
	// Drawing actions
	drawTo: function(action, args) {
		this.shape.path += ( this.shape.coordination == "absolute" ) ? action.toUpperCase() : action.toLowerCase();
		for( i = 0; i< args.length; i++ ) {
			this.shape.path += args[i] + " ";
		}
		this.rawNode.setAttribute("d", this.shape.path);
		return this;
	},
	update: function(x,y) {
		if( this.coordination == "absolute" ) {
			this.lastPos = {x:x, y:y};
		} else {
			this.lastPos.x += x;
			this.lastPos.y += y;
		}
	},

	closePath: function() {
		return this.drawTo("z", []);
	},
	moveTo: function(x, y) {
		this.update( x, y );
		return this.drawTo("m", [x,y]);
	},
	lineTo: function(x, y) {
		this.update( x, y );
		return this.drawTo("l", [x,y]);
	},
	hLineTo: function(x) {
		y = ( this.shape.coordination == "absolute" ) ? this.lastPos.y : 0;
		this.update( x, y );
		return this.drawTo("h", [x]);
	},
	vLineTo: function(y) {
		x = ( this.shape.coordination == "absolute" ) ? this.lastPos.x : 0;
		return this.drawTo("v", [y]);
	},
	curveTo: function(x1, y1, x2, y2, x, y) {
		this.update( x, y );
		return this.drawTo("c", [x1, y1, x2, y2, x, y]);
	},
	smoothCurveTo: function(x2, y2, x, y) {
		this.update( x, y );
		return this.drawTo("s", [x2, y2, x, y]);
	},
	qbCurveTo: function(x1, y1, x, y) {
		this.update( x, y );
		return this.drawTo("q", [x1, y1, x, y]);
	},
	smoothQBCurveTo: function(x, y) {
		this.update( x, y );
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
		
		// normalize the coordination
		if (this.shape.coordination == "absolute") {
			u = this.lastPos.x - cx;
			v = this.lastPos.y - cy;
		} else {
			u = 0 - cx;
			v = 0 - cy;
		}
		// start point
		alpha = Math.atan2(v/ry, u/rx);
		// end point
		beta = Math.atan2( (y-cy)/ry, (x-cx)/rx );

		theta = isCCW ? beta - alpha : alpha - beta;
		if( theta < 0 ) theta += 2*Math.pi;
		if( theta > Math.pi/2 ) {
			largearc = 1;
		} else {
			largearc = 0;
		}

		return this.drawTo("a", [rx, ry, xrotate, largearc, sweepflag, x, y] );
	},
	setPath: function(shape) { return this.setShape(shape); },
	getPath: function(){ return this.getShape(); }
});

dojo.declare("dojo.gfx.svg.Rect", dojo.gfx.svg.Shape, {
	nodeType: 'rect',
	initializer: function(rawNode) {
		this.shape = { x:0, y:0, width:100, height:100 };
		this.attach(rawNode);
	},
	setRect: function(shape){ return this.setShape(shape); },
	getRect: function(){ return this.getShape(); }
});

dojo.declare("dojo.gfx.svg.Circle", dojo.gfx.svg.Shape, {
	nodeType: 'circle',
	initializer: function(rawNode) {
		this.shape = { cx:0, cy:0, r:100 };
		this.attach(rawNode);
	},
	setCircle: function(shape){ return this.setShape(shape); },
	getCircle: function(){ return this.getShape(); }
});

dojo.declare("dojo.gfx.svg.Ellipse", dojo.gfx.svg.Shape, {
	nodeType: 'ellipse',
	initializer: function(rawNode) {
		this.shape = { rx:100, cx:100, ry:80, cy:80 };
		this.attach(rawNode);
	},
	setEllipse: function(shape){ return this.setShape(shape); },
	getEllipse: function(){ return this.getShape(); }
});

dojo.declare("dojo.gfx.svg.Line", dojo.gfx.svg.Shape, {
	nodeType: 'line',
	initializer: function(rawNode) {
		this.shape = { x1:0, y1:0, x2:50, y2:50 };
		this.attach(rawNode);
	},
	setLine: function(shape){ return this.setShape(shape); },
	getLine: function(){ return this.getShape(); }
});

dojo.declare("dojo.gfx.svg.Polyline", dojo.gfx.svg.Shape, {
	nodeType: 'polyline',
	initializer: function(rawNode) {
		this.shape = { points:null };
		this.attach(rawNode);
	},
	setShape: function(points){
		dojo.gfx.normalizeParameters(this.shape, points);
		// generate attributes
		attr = "";
		for( i = 0; i< this.shape.points.length; i++ ) {
			attr += this.shape.points[i].x + " " + this.shape.points[i].y + " ";
		}
		this.rawNode.setAttribute("points", attr);
		// support for chaining
		return this;
	},
	setPolyline: function(shape){ return this.setShape(shape); },
	getPolyline: function(){ return this.getShape(); }
});

dojo.declare("dojo.gfx.svg.Polygon", dojo.gfx.svg.Shape, {
	nodeType: 'polygon',
	initializer: function(rawNode) {
		this.shape = { points:null };
		this.attach(rawNode);
	},
	setShape: function(points){
		dojo.gfx.normalizeParameters(this.shape, points);
		// generate attributes
		attr = "";
		for( i = 0; i< this.shape.points.length; i++ ) {
			attr += this.shape.points[i].x + " " + this.shape.points[i].y + " ";
		}
		this.rawNode.setAttribute("points", attr);
		// support for chaining
		return this;
	},
	setPolygon: function(shape){ return this.setShape(shape); },
	getPolygon: function(){ return this.getShape(); }
});

var metacreator = {
	createObject: function(shape, rawShape) {
		if(!this.rawNode) return null;
		var n = document.createElementNS(dojo.svg.xmlns.svg, shape.nodeType); 
		shape.rawNode = n;
		this.rawNode.appendChild(n);
		if(rawShape) shape.setShape(rawShape);
		return shape;
	}
};

var creators = {
	// creators
	createPath: function(path){
		return this.createObject(new dojo.gfx.svg.Path(), path);
	},
	createRect: function(rect){
		return this.createObject(new dojo.gfx.svg.Rect(), rect);
	},
	createCircle: function(circle){
		return this.createObject(new dojo.gfx.svg.Circle(), circle);
	},
	createEllipse: function(ellipse){
		return this.createObject(new dojo.gfx.svg.Ellipse(), ellipse);
	},
	createLine: function(line){
		return this.createObject(new dojo.gfx.svg.Line(), line);
	},
	createPolyline: function(points){
		return this.createObject(new dojo.gfx.svg.Polyline(), points);
	},
	createPolygon: function(points){
		return this.createObject(new dojo.gfx.svg.Polygon(), points);
	},
	createGroup: function(){
		return this.createObject(new dojo.gfx.svg.Group());
	}
};

// Misc utility functions
dojo.gfx.svg.attachNode = function(node){
	if(!node) return null;
	var s = null;
	switch(node.tagName.toLowerCase()){
		case "path":
			s = new dojo.gfx.svg.Path(node);
			break;
		case "rect":
			s = new dojo.gfx.svg.Rect(node);
			break;
		case "circle":
			s = new dojo.gfx.svg.Circle(node);
			break;
		case "ellipse":
			s = new dojo.gfx.svg.Ellipse(node);
			break;
		case "line":
			s = new dojo.gfx.svg.Line(node);
			break;
		case "polyine":
			s = new dojo.gfx.svg.Polyline(node);
			break;
		case "polygon":
			s = new dojo.gfx.svg.Polygon(node);
			break;
	}
	return s;
};

// this is a Surface object
dojo.gfx.svg.Surface = function(){
	// underlying SVG node
	this.rawNode = null;
};

dojo.lang.extend(dojo.gfx.svg.Surface, {
	// trivial setters/getters
	setDimensions: function(width, height){
		if(!this.rawNode) return this;
		this.rawNode.setAttribute("width",  width);
		this.rawNode.setAttribute("height", height);
		// support for chaining
		return this;
	},
	getDimensions: function(){
		return this.rawNode ?
			{ width: this.rawNode.getAttribute("width"), height: this.rawNode.getAttribute("height") } : 
			null;
	}
});

dojo.gfx.svg.createSurface = function(parentNode, width, height){
	var s = new dojo.gfx.svg.Surface();
	s.rawNode = document.createElementNS(dojo.svg.xmlns.svg, "svg");
	s.rawNode.setAttribute("width",  width);
	s.rawNode.setAttribute("height", height);
	s.createObject( new dojo.gfx.svg.Defines());
	parentNode.appendChild(s.rawNode);
	return s;
};

dojo.gfx.svg.attachSurface = function(node){
	var s = new dojo.gfx.svg.Surface();
	s.rawNode = node;
	return s;
};

// Gradient and pattern
dojo.gfx.svg.Defines = function(){
	this.rawNode = null;
	this.nodeType = "defs";
};


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
            stop["color"] = new dojo.graphics.color.Color( stops[i].getAttribute("stop-color") );
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



dojo.lang.extend(dojo.gfx.svg.Group, metacreator);
dojo.lang.extend(dojo.gfx.svg.Group, creators);

dojo.lang.extend(dojo.gfx.svg.Surface, metacreator);
dojo.lang.extend(dojo.gfx.svg.Surface, creators);

dojo.lang.extend(dojo.gfx.svg.Pattern, metacreator);
dojo.lang.extend(dojo.gfx.svg.Pattern, creators);

delete metacreator;
delete creators;

// TODO: use dojo.gfx directly instead of dojo.gfx.svg
dojo.gfx.defaultRenderer = dojo.gfx.svg;
dojo.gfx.Gradient = dojo.gfx.svg.Gradient;
dojo.gfx.LinearGradient = dojo.gfx.svg.LinearGradient;
dojo.gfx.RadialGradient = dojo.gfx.svg.RadialGradient;
dojo.gfx.Pattern = dojo.gfx.svg.Pattern;
dojo.gfx.attachNode = dojo.gfx.svg.attachNode;
