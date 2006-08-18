dojo.require("dojo.lang.common");
dojo.require("dojo.math.*");
dojo.provide("dojo.gfx.m2d");

dojo.gfx.Matrix2D = function() {
	if(arguments.length == 1 && arguments[0]){
		dojo.mixin(this, arguments[0]);
	}
};

dojo.extend(dojo.gfx.Matrix2D, {xx: 1, xy: 0, yx: 0, yy: 1, dx: 0, dy: 0});

dojo.mixin(dojo.gfx, {
	// matrix constants
	identity: new dojo.gfx.Matrix2D(),
	flipX:    new dojo.gfx.Matrix2D({xx: -1}),
	flipY:    new dojo.gfx.Matrix2D({yy: -1}),
	flipXY:   new dojo.gfx.Matrix2D({xx: -1, yy: -1}),
	// matrix creators
	translate: function(a, b){
		return arguments.length > 1 ? new dojo.gfx.Matrix2D({dx: a, dy: b}) : new dojo.gfx.Matrix2D({dx: a.x, dy: a.y});
	},
	scale: function(a, b){
		return arguments.length > 1 ? new dojo.gfx.Matrix2D({xx: a, yy: b}) :
			   typeof a == "number" ? new dojo.gfx.Matrix2D({xx: a, yy: a}) : new dojo.gfx.Matrix2D({xx: a.x, yy: a.y});
	},
	rotate: function(angle){
		var c = Math.cos(angle);
		var s = Math.sin(angle);
		return new dojo.gfx.Matrix2D({xx: c, xy: s, yx: -s, yy: c});
	},
	rotateg: function(degree){ return this.rotate(dojo.math.degToRad(degree)); },
	skewX:   function(angle) { return new dojo.gfx.Matrix2D({xy: Math.tan(angle)}); },
	skewXg:  function(degree){ return this.skewX(dojo.math.degToRad(degree)); },
	skewY:   function(angle) { return new dojo.gfx.Matrix2D({yx: -Math.tan(angle)}); },
	skewYg:  function(degree){ return this.skewY(dojo.math.degToRad(degree)); },
	// ensure matrix 2D conformance
	normalizeMatrix: function(matrix){
		return (matrix instanceof dojo.gfx.Matrix2D) ? matrix : new dojo.gfx.Matrix2D(matrix);
	},
	// common operations
	invert: function(matrix){
		var m = this.normalizeMatrix(matrix);
		var D = m.xx * m.yy - m.xy * m.yx;
		return new dojo.gfx.Matrix2D({xx: m.yy/D, xy: -m.xy/D, yx: -m.yx/D, yy: m.xx/D, 
			dx: (m.yx * m.dy - m.yy * m.dx) / D, dy: (m.xy * m.dx - m.xx * m.dy) / D});
	},
	_multiplyPoint: function(m, x, y){
		return {x: m.xx * x + m.xy * y + m.dx, y: m.yx * x + m.yy * y + m.dy};
	},
	multiplyPoint: function(matrix, a, b){
		var m = this.normalizeMatrix(matrix);
		if(typeof a == "number" && typeof b == "number") return this._multiplyPoint(m, a, b);
		return this._multiplyPoint(m, a.x, a.y);
	},
	multiply: function(matrix, a, b){
		var m = this.normalizeMatrix(matrix);
		// combine matrices
		for(var i = 1; i < arguments.length; ++i){
			var l = m;
			var r = this.normalizeMatrix(arguments[i]);
			m = new dojo.gfx.Matrix2D();
			m.xx = l.xx * r.xx + l.xy * r.yx;
			m.xy = l.xx * r.xy + l.xy * r.yy;
			m.yx = l.yx * r.xx + l.yy * r.yx;
			m.yy = l.yx * r.xy + l.yy * r.yy;
			m.dx = l.xx * r.dx + l.xy * r.dy + l.dx;
			m.dy = l.yx * r.dx + l.yy * r.dy + l.dy;
		}
		return m;
	},
	// high level operations
	_negatePoint: function(point){
		return {x: -point.x, y: -point.y};
	},
	_sandwich: function(m, x, y){
		return this.multiply(this.translate(x, y), m, this.translate(-x, -y));
	},
	scaleAt: function(a, b, c, d){
		switch(arguments.length){
			case 2:
				// a is a scale factor, b is a point
				return this._sandwich(this.scale(a), b.x, b.y);
			case 3:
				if(typeof c == "number"){
					// a is scale factor, b and c are x and y components of a point
					return this._sandwich(this.scale(a), b, c);
				}
				// a and b are scale factor components, c is a point
				return this._sandwich(this.scale(a, b), c.x, c.y);
		}
		// a and b are scale factor components, c and d are components of a point
		return this._sandwich(this.scale(a, b), c, d);
	},
	rotateAt: function(angle, a, b){
		return arguments.length > 1 ?
			// a and b are components of point
			this._sandwich(this.rotate(angle), a, b) :
			// a is a point
			this._sandwich(this.rotate(angle), a.x, a.y);
	},
	rotategAt: function(degree, a, b){
		return arguments.length > 1 ? 
			// a and b are components of point
			this._sandwich(this.rotateg(degree), a, b) :
			// a is a point
			this._sandwich(this.rotateg(degree), a.x, a.y);
	},
	skewXAt: function(angle, a, b){
		return arguments.length > 1 ?
			// a and b are components of point
			this._sandwich(this.skewX(angle), a, b) :
			// a is a point
			this._sandwich(this.skewX(angle), a.x, a.y);
	},
	skewXgAt: function(degree, a, b){
		return arguments.length > 1 ?
			// a and b are components of point
			this._sandwich(this.skewXg(degree), a, b) :
			// a is a point
			this._sandwich(this.skewXg(degree), a.x, a.y);
	},
	skewYAt: function(angle, a, b){
		return arguments.length > 1 ?
			// a and b are components of point
			this._sandwich(this.skewY(angle), a, b) :
			// a is a point
			this._sandwich(this.skewY(angle), a.x, a.y);
	},
	skewYgAt: function(degree, a, b){
		return arguments.length > 1 ?
			// a and b are components of point
			this._sandwich(this.skewYg(degree), a, b) :
			// a is a point
			this._sandwich(this.skewYg(degree), a.x, a.y);
	}
	// TODO: rect-to-rect mapping, scale-to-fit (isotropic and anisotropic versions)
});
