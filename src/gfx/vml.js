dojo.provide("dojo.gfx.vml");

dojo.require("dojo.dom");
dojo.require("dojo.math");
dojo.require("dojo.lang.declare");
dojo.require("dojo.lang.extras");
dojo.require("dojo.string.*");

dojo.require("dojo.gfx.color");
dojo.require("dojo.gfx.common");

dojo.require("dojo.experimental");
dojo.experimental("dojo.gfx.vml");

dojo.gfx.vml.xmlns = "urn:schemas-microsoft-com:vml";

dojo.gfx.vml._parseFloat = function(str) {
	return str.match(/^\d+f$/i) ? parseInt(str) / 65536 : parseFloat(str);
};

dojo.gfx.vml.normalizedLength = function(len) {
	// FIXME: why 1pt = 0.75px ?
	return len.indexOf("pt") >= 0 ? parseFloat(len) / 0.75 : parseFloat(len);
};

dojo.lang.extend(dojo.gfx.Shape, {
	setStroke: function(stroke){
		if(!stroke){
			// don't stroke
			this.strokeStyle = null;
			this.rawNode.stroked = false;
			return this;
		}
		// normalize the stroke
		this.strokeStyle = dojo.gfx.makeParameters(dojo.gfx.defaultStroke, stroke);
		this.strokeStyle.color = dojo.gfx.normalizeColor(this.strokeStyle.color);
		// generate attributes
		var s = this.strokeStyle;
		this.rawNode.stroked = true;
		this.rawNode.strokecolor = s.color.toCss();
		this.rawNode.strokeweight = s.width + "px";	// TODO: should we assume that the width is always in pixels?
		if(this.rawNode.stroke) {
			this.rawNode.stroke.opacity = s.color.a;
			this.rawNode.stroke.endcap = this._translate(this._capMap, s.cap);
			if(typeof(s.join) == "number") {
				this.rawNode.stroke.joinstyle = "miter";
				this.rawNode.stroke.miterlimit = s.join;
			}else{
				this.rawNode.stroke.joinstyle = s.join;
				// this.rawNode.stroke.miterlimit = s.width;
			}
		}
		return this;
	},
	
	_capMap: { butt: 'flat' },
	_capMapReversed: { flat: 'butt' },
	
	_translate: function(dict, value) {
		return (value in dict) ? dict[value] : value;
	},
	
	setFill: function(fill){
		if(!fill){
			// don't fill
			this.fillStyle = null;
			this.rawNode.filled = false;
			return this;
		}
		if(typeof(fill) == "object" && "type" in fill){
			// gradient
			switch(fill.type){
				case "linear":
					// set a fill
					var f = dojo.gfx.makeParameters(dojo.gfx.defaultLinearGradient, fill);
					this.fillStyle = f;
					var s = "";
					for(var i = 0; i < f.colors.length; ++i){
						f.colors[i].color = dojo.gfx.normalizeColor(f.colors[i].color);
						s += f.colors[i].offset.toFixed(8) + " " + f.colors[i].color.toHex() + ";";
					}
					this.rawNode.fill.colors.value = s;
					this.rawNode.fill.method = "sigma";
					this.rawNode.fill.type = "gradient";
					this.rawNode.fill.angle = (dojo.math.radToDeg(Math.atan2(f.x2 - f.x1, f.y2 - f.y1)) + 180) % 360;
					this.rawNode.fill.on = true;
					break;
				case "radial":
					// set a fill
					var f = dojo.gfx.makeParameters(dojo.gfx.defaultRadialGradient, fill);
					this.fillStyle = f;
					var w = parseFloat(this.rawNode.style.width);
					var h = parseFloat(this.rawNode.style.height);
					var c = isNaN(w) ? 1 : 2 * f.r / w;
					var i = f.colors.length - 1;
					f.colors[i].color = dojo.gfx.normalizeColor(f.colors[i].color);
					var s = "0 " + f.colors[i].color.toHex();
					for(; i >= 0; --i){
						f.colors[i].color = dojo.gfx.normalizeColor(f.colors[i].color);
						s += (1 - c * f.colors[i].offset).toFixed(8) + " " + f.colors[i].color.toHex() + ";";
					}
					this.rawNode.fill.colors.value = s;
					this.rawNode.fill.method = "sigma";
					this.rawNode.fill.type = "gradientradial";
					if(isNaN(w) || isNaN(h)){
						this.rawNode.fill.focusposition = "0.5 0.5";
					}else{
						this.rawNode.fill.focusposition = (f.cx / w).toFixed(8) + " " + (f.cy / h).toFixed(8);
					}
					this.rawNode.fill.focussize = "0 0";
					this.rawNode.fill.on = true;
					break;
			}
			this.rawNode.fill.opacity = 1;
			return this;
		}
		// color object
		this.fillStyle = dojo.gfx.normalizeColor(fill);
		this.rawNode.fillcolor = this.fillStyle.toHex();
		this.rawNode.fill.opacity = this.fillStyle.a;
		this.rawNode.filled = true;
		return this;
	},

	_applyTransform: function() {
		var matrix = this._getRealMatrix();
		if(!matrix) return this;
		var skew = this.rawNode.skew;
		skew.on = false;
		var mt = matrix.xx.toFixed(8) + " " + matrix.xy.toFixed(8) + " " + 
			matrix.yx.toFixed(8) + " " + matrix.yy.toFixed(8) + " 0 0";
		var offset = Math.floor(matrix.dx).toFixed() + "px " + Math.floor(matrix.dy).toFixed() + "px";
		var l = parseFloat(this.rawNode.style.left);
		var t = parseFloat(this.rawNode.style.top);
		var w = parseFloat(this.rawNode.style.width);
		var h = parseFloat(this.rawNode.style.height);
		if(isNaN(l)) l = 0;
		if(isNaN(t)) t = 0;
		if(isNaN(w)) w = 1;
		if(isNaN(h)) h = 1;
		var origin = (-l / w - 0.5).toFixed(8) + " " + (-t / h - 0.5).toFixed(8);
		skew.matrix =  mt;
		skew.origin = origin;
		skew.offset = offset;
		skew.on = true;
		return this;
	},

	setRawNode: function(rawNode){
		rawNode.stroked = false;
		rawNode.filled  = false;
		this.rawNode = rawNode;
	},

	// Attach family
	attachFill: function(rawNode){
		var fillStyle = null;
		if(rawNode) {
			if(rawNode.fill.on && rawNode.fill.type == "gradient"){
				var fillStyle = dojo.lang.shallowCopy(dojo.gfx.defaultLinearGradient, true);
				var rad = dojo.math.degToRad(rawNode.fill.angle);
				fillStyle.x2 = Math.cos(rad);
				fillStyle.y2 = Math.sin(rad);
				fillStyle.colors = [];
				var stops = rawNode.fill.colors.value.split(";");
				for(var i = 0; i < stops.length; ++i){
					var t = stops[i].match(/\S+/g);
					if(!t || t.length != 2) continue;
					fillStyle.colors.push({offset: dojo.gfx.vml._parseFloat(t[0]), color: new dojo.gfx.color.Color(t[1])});
				}
			}else if(rawNode.fill.on && rawNode.fill.type == "gradientradial"){
				var fillStyle = dojo.lang.shallowCopy(dojo.gfx.defaultRadialGradient, true);
				var w = parseFloat(rawNode.style.width);
				var h = parseFloat(rawNode.style.height);
				fillStyle.cx = isNaN(w) ? 0 : rawNode.fill.focusposition.x * w;
				fillStyle.cy = isNaN(h) ? 0 : rawNode.fill.focusposition.y * h;
				fillStyle.r  = isNaN(w) ? 1 : w / 2;
				fillStyle.colors = [];
				var stops = rawNode.fill.colors.value.split(";");
				for(var i = stops.length - 1; i >= 0; --i){
					var t = stops[i].match(/\S+/g);
					if(!t || t.length != 2) continue;
					fillStyle.colors.push({offset: dojo.gfx.vml._parseFloat(t[0]), color: new dojo.gfx.color.Color(t[1])});
				}
			}else if(rawNode.fillcolor){
				// a color object !
				fillStyle = new dojo.gfx.color.Color(rawNode.fillcolor+"");
				fillStyle.a = rawNode.fill.opacity;
			}
		}
		return fillStyle;
	},

	attachStroke: function(rawNode) {
		var strokeStyle = dojo.lang.shallowCopy(dojo.gfx.defaultStroke, true);
		if(rawNode && rawNode.stroked){
			strokeStyle.color = new dojo.gfx.color.Color(rawNode.strokecolor.value);
			dojo.debug("We are expecting an .75pt here, instead of strokeweight = " + rawNode.strokeweight );
			strokeStyle.width = dojo.gfx.vml.normalizedLength(rawNode.strokeweight+"");
			strokeStyle.color.a = rawNode.stroke.opacity;
			strokeStyle.cap = this._translate(this._capMapReversed, rawNode.stroke.endcap);
			strokeStyle.join = rawNode.stroke.joinstyle == "miter" ? rawNode.stroke.miterlimit : rawNode.stroke.joinstyle;
		}else{
			return null;
		}
		return strokeStyle;
	},

	attachTransform: function(rawNode) {
		var matrix = {};
		if(rawNode){
			var s = rawNode.skew;
			matrix.xx = s.matrix.xtox;
			matrix.xy = s.matrix.xtoy;
			matrix.yx = s.matrix.ytox;
			matrix.yy = s.matrix.ytoy;
			// TODO: transform from pt to px
			matrix.dx = s.offset.x / 0.75;
			matrix.dy = s.offset.y / 0.75;
		}
		return dojo.gfx.matrix.normalize(matrix);
	},

	attach: function(rawNode){
		if(rawNode){
			this.rawNode = rawNode;
			this.shape = this.attachShape(rawNode);
			this.fillStyle = this.attachFill(rawNode);
			this.strokeStyle = this.attachStroke(rawNode);
			this.matrix = this.attachTransform(rawNode);
		}
	}
});

dojo.declare("dojo.gfx.Group", dojo.gfx.VirtualGroup, {
	_processNewObject: function(shape){
		this.add(shape);
	},
	attach: function(rawNode){
		if(rawNode){
			this.rawNode = rawNode;
			this.shape = null;
			this.fillStyle = null;
			this.strokeStyle = null;
			this.matrix = null;
		}
	}
});
dojo.gfx.Group.nodeType = "group";

var zIndex = {
	moveToFront: function(){
		this.rawNode.parentNode.appendChild(this.rawNode);
		return this;
	},
	moveToBack: function(){
		this.rawNode.parentNode.insertBefore(this.rawNode, this.rawNode.parentNode.firstChild);
		return this;
	}
};
dojo.lang.extend(dojo.gfx.Shape, zIndex);
dojo.lang.extend(dojo.gfx.Group, zIndex);
delete zIndex;

dojo.declare("dojo.gfx.Rect", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultRect, true);
		this.attach(rawNode);
	},
	setShape: function(newShape){
		this.shape = dojo.gfx.makeParameters(this.shape, newShape);
		this.rawNode.style.left   = this.shape.x.toFixed();
		this.rawNode.style.top    = this.shape.y.toFixed();
		this.rawNode.style.width  = this.shape.width.toFixed();
		this.rawNode.style.height = this.shape.height.toFixed();
		return this.setTransform(this.matrix);
	},
	setRawNode: function(rawNode){
		rawNode.arcsize = 0;
		return this.inherited("setRawNode", [rawNode] );
	},
	attachShape: function(rawNode){
		return dojo.gfx.makeParameters(dojo.gfx.defaultRect, {
			x: parseInt(rawNode.style.left),
			y: parseInt(rawNode.style.top),
			width:  parseInt(rawNode.style.width),
			height: parseInt(rawNode.style.height)
		});
	}
});
dojo.gfx.Rect.nodeType = "roundrect"; // use a roundrect so the stroke join type is respected

dojo.declare("dojo.gfx.Ellipse", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultEllipse, true);
		this.attach(rawNode);
	},
	setShape: function(newShape){
		this.shape = dojo.gfx.makeParameters(this.shape, newShape);
		this.rawNode.style.left   = (this.shape.cx - this.shape.rx).toFixed();
		this.rawNode.style.top    = (this.shape.cy - this.shape.ry).toFixed();
		this.rawNode.style.width  = (this.shape.rx * 2).toFixed();
		this.rawNode.style.height = (this.shape.ry * 2).toFixed();
		return this.setTransform(this.matrix);
	},
	attachShape: function(rawNode){
		var rx = parseInt(rawNode.style.width ) / 2;
		var ry = parseInt(rawNode.style.height) / 2;
		return dojo.gfx.makeParameters(dojo.gfx.defaultEllipse, {
			cx: parseInt(rawNode.style.left) + rx,
			cy: parseInt(rawNode.style.top ) + ry,
			rx: rx,
			ry: ry
		});
	}
});
dojo.gfx.Ellipse.nodeType = "oval";

dojo.declare("dojo.gfx.Circle", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultCircle, true);
		this.attach(rawNode);
	},
	setShape: function(newShape){
		this.shape = dojo.gfx.makeParameters(this.shape, newShape);
		this.rawNode.style.left   = (this.shape.cx - this.shape.r).toFixed();
		this.rawNode.style.top    = (this.shape.cy - this.shape.r).toFixed();
		this.rawNode.style.width  = (this.shape.r * 2).toFixed();
		this.rawNode.style.height = (this.shape.r * 2).toFixed();
		return this;
	},
	attachShape: function(rawNode){
		var r = parseInt(rawNode.style.width) / 2;
		return dojo.gfx.makeParameters(dojo.gfx.defaultCircle, {
			cx: parseInt(rawNode.style.left) + r,
			cy: parseInt(rawNode.style.top)  + r,
			r:  r
		});
	}
});
dojo.gfx.Circle.nodeType = "oval";

dojo.declare("dojo.gfx.Line", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultLine, true);
		this.attach(rawNode);
	},
	setShape: function(newShape){
		this.shape = dojo.gfx.makeParameters(this.shape, newShape);
		this.rawNode.from = this.shape.x1.toFixed() + "," + this.shape.y1.toFixed();
		this.rawNode.to   = this.shape.x2.toFixed() + "," + this.shape.y2.toFixed();
		return this;
	},
	attachShape: function(rawNode){
		return dojo.gfx.makeParameters(dojo.gfx.defaultLine, {
			x1: this.rawNode.from.x,
			y1: this.rawNode.from.y,
			x2: this.rawNode.to.x,
			y2: this.rawNode.to.y
		});
	}
});
dojo.gfx.Line.nodeType = "line";

dojo.declare("dojo.gfx.Polyline", dojo.gfx.Shape, {
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultPolyline, true);
		this.attach(rawNode);
	},
	setShape: function(points, closed){
		if(points && points instanceof Array){
			this.shape = dojo.gfx.makeParameters(this.shape, { points: points });
			if(closed && this.shape.points.length) this.shape.points.push(this.shape.points[0]);
		}else{
			this.shape = dojo.gfx.makeParameters(this.shape, points);
		}
		attr = "";
		for(var i = 0; i< this.shape.points.length; ++i){
			attr += this.shape.points[i].x.toFixed(8) + " " + this.shape.points[i].y.toFixed(8) + " ";
		}
		this.rawNode.points.value = attr;
		return this.setTransform(this.matrix);
	},
	attachShape: function(rawNode){
		var shape = dojo.lang.shallowCopy(dojo.gfx.defaultPolyline, true);
		var points = rawNode.points.value.match(/\d+/g);
		if(points){
			for(var i = 0; i < points.length; i += 2){
				shape.points.push({ x: parseFloat(points[i]), y: parseFloat(points[i + 1]) });
			}
		}
		return shape;
	}
});
dojo.gfx.Polyline.nodeType = "polyline";

dojo.declare("dojo.gfx.Path", dojo.gfx.Shape, {
	_pathVmlToSvgMap: { r: "l", l: "L", t: "m", m: "M", v: "c", c: "C", x: "z" },
	_pathSvgToVmlMap: { l: "r", L: "l", m: "t", M: "m", c: "v", C: "c", z: "x" },
	
	initializer: function(rawNode) {
		this.shape = dojo.lang.shallowCopy(dojo.gfx.defaultPath, true);
		this.lastPos = { x: 0, y: 0 };
		this.lastControl = { x: 0, y: 0 };
		this.lastAction = "";
		this.attach(rawNode);
	},
	setShape: function(newShape){
		this.shape = dojo.gfx.makeParameters(this.shape, typeof(newShape) == "string" ? { path: newShape } : newShape);
		this.setAbsoluteMode(this.shape.absolute);
		var path = this.shape.path;
		for(var i in this._pathSvgToVmlMap){
			path = path.replace( new RegExp(i, 'g'),  this._pathSvgToVmlMap[i] );
		}
		this.rawNode.path.v = path + " e";
		return this.setTransform(this.matrix);
	},
	setAbsoluteMode: function(mode) {
		this.shape.absolute = typeof(mode) == "string" ? (mode == "absolute") : mode;
		return this;
	},
	getAbsoluteMode: function() {
		return this.shape.absolute;
	},
	_drawTo: function(action, raction, args){
		this.shape.path += (this.shape.absolute ? action : raction);
		for(var i = 0; i < args.length; ++i){
			this.shape.path += " " + args[i].toFixed();
		}
		this.lastAction = action; 
		this.setShape();
		return this;
	},
	_update: function(x, y, x2, y2){
		if(this.shape.absolute){
			this.lastPos.x = x;
			this.lastPos.y = y;
			if(typeof(y2) != "undefined"){
				this.lastControl.x = x2;
				this.lastControl.y = y2;
			} else {
				this.lastControl.x = this.lastPos.x;
				this.lastControl.y = this.lastPos.y;
			}
		} else {
			if(typeof(y2) != "undefined"){
				this.lastControl.x = this.lastPos.x + x2;
				this.lastControl.y = this.lastPos.y + y2;
			} else {
				this.lastControl.x = this.lastPos.x + x;
				this.lastControl.y = this.lastPos.y + y;
			}
			this.lastPos.x += x;
			this.lastPos.y += y;
		}
	},
	_mirror: function(action){
		if(action != this.lastAction){
			return { x: lastPos.x, y: lastPos.y };
		}
		x1 = 2* this.lastPos.x - this.lastControl.x;
		y1 = 2* this.lastPos.y - this.lastControl.y;
		if(!this.shape.absolute){
			x1 -= this.lastPos.x;
			y1 -= this.lastPos.y;
		}
		return { x: x1, y: y1 };
	},
	closePath: function() {
		return this._drawTo("z", "z", []);
	},
	moveTo: function(x, y){
		this._update(x, y);
		return this._drawTo("M", "m", [x,y]);
	},
	lineTo: function(x, y){
		this._update(x, y);
		return this._drawTo("L", "l", [x,y]);
	},
	hLineTo: function(x){
		y = this.shape.absolute ? this.lastPos.y : 0;
		return this.lineTo(x, y);
	},
	vLineTo: function(y){
		x = this.shape.absolute ? this.lastPos.x : 0;
		return this.lineTo(x, y);
	},
	curveTo: function(x1, y1, x2, y2, x, y){
		this._update(x, y, x2, y2);
		return this._drawTo("C", "c", [x1, y1, x2, y2, x, y]);
	},
	smoothCurveTo: function(x2, y2, x, y){
		pos = this._mirror("C");
		x1 = pos.x;
		y1 = pos.y;
		return this.curveTo(x1, y1, x2, y2, x, y);
	},
	// TODO: fix qbCurveTo, smoothQBCurveTo, arcTo
	qbCurveTo: function(x1, y1, x, y){
		this._update(x, y, x1, y1);
		return this._drawTo("qb", "qb", [x1, y1, x, y]);
	},
	smoothQBCurveTo: function(x, y){
		pos = this.mirror("qb");
		x1 = pos.x;
		y1 = pos.y;
		return this.qbCurveTo(x1, y1, x, y);
	},
	arcTo: function(top, right, bottom, left, isCCW, x, y){
		// save the value, not reference
		var lastPos = { x: this.lastPos.x, y: this.lastPos.y };
		dojo.debug( "lastPos in arcTo = " + lastPos.x + "," + lastPos.y );
		dojo.debug( "this.lastPos in arcTo = " + this.lastPos.x + "," + this.lastPos.y );
		dojo.debug( "arcTo coordination = " + this.shape.coordination );
		if(!this.shape.absolute){
			// translate to absolute value first
			top += this.lastPos.y;
			right += this.lastPos.x;
			bottom += this.lastPos.y;
			left += this.lastPos.x;
			x += this.lastPos.x;
			y += this.lastPos.y;
		} 
		this._update(x, y);
		dojo.debug( "lastPos in arcTo = " + lastPos.x + "," + lastPos.y );
		dojo.debug( "this.lastPos in arcTo = " + this.lastPos.x + "," + this.lastPos.y );

		if(isCCW){
			return this._drawTo( "ar", "ar", [left, top, right, bottom, lastPos.x, lastPos.y, x, y] );
		} else {
			return this._drawTo( "wt", "wt", [left, top, right, bottom, lastPos.x, lastPos.y, x, y] );
		}
	}
});
dojo.gfx.Path.nodeType = "shape";

var creators = {
	createRect: function(rect){
		return this.createObject(dojo.gfx.Rect, rect);
	},
	createEllipse: function(ellipse){
		return this.createObject(dojo.gfx.Ellipse, ellipse);
	},
	createCircle: function(circle){
		return this.createObject(dojo.gfx.Circle, circle);
	},
	createLine: function(line){
		return this.createObject(dojo.gfx.Line, line);
	},
	createPolyline: function(points){
		return this.createObject(dojo.gfx.Polyline, points, true);
	},
	createPath: function(path){
		return this.createObject(dojo.gfx.Path, path, true);
	},
	createGroup: function(path){
		return this.createObject(dojo.gfx.Group, null, true);
	},
	createObject: function(shapeType, rawShape, overrideSize) {
		if(!this.rawNode) return null;
		var shape = new shapeType();
		var node = document.createElement('v:' + shapeType.nodeType);
		shape.setRawNode(node);
		this.rawNode.appendChild(node);
		if(overrideSize) this._overrideSize(node);
		shape.setShape(rawShape);
		this._processNewObject(shape);
		return shape;
	},
	_overrideSize: function(node){
		node.style.width  = this.rawNode.style.width;
		node.style.height = this.rawNode.style.height;
		node.coordsize = parseFloat(node.style.width) + " " + parseFloat(node.style.height);
	}
};

dojo.lang.extend(dojo.gfx.Group, creators);
dojo.lang.extend(dojo.gfx.Surface, creators);

delete creators;

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
		default:
			dojo.debug("FATAL ERROR! tagName = " + rawNode.tagName);
	}
	s.attach(node);
	return s;
};

dojo.lang.extend(dojo.gfx.Surface, {
	setDimensions: function(width, height){
		if(!this.rawNode) return this;
		this.rawNode.style.width = width;
		this.rawNode.style.height = height;
		this.rawNode.coordsize = width + " " + height;
		return this;
	},
	getDimensions: function(){
		return this.rawNode ? { width: this.rawNode.style.width, height: this.rawNode.style.height } : null;
	},
	_processNewObject: function(shape){
		// nothing
	}
});

dojo.gfx.createSurface = function(parentNode, width, height){
   var s = new dojo.gfx.Surface();
   s.rawNode = document.createElement("v:group");
   s.rawNode.style.width  = width  + "px";
   s.rawNode.style.height = height + "px";
   s.rawNode.coordsize = width + " " + height;
   s.rawNode.coordorigin = "0 0";
   dojo.byId(parentNode).appendChild(s.rawNode);
   return s;
};

dojo.gfx.attachSurface = function(node){
	var s = new dojo.gfx.Surface();
	s.rawNode = node;
	return s;
};
