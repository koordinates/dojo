dojo.provide("dojox.charting.plot2d.renderers");

dojo.require("dojo.colors");
dojo.require("dojox.gfx");
dojo.require("dojox.lang.functional");
dojo.require("dojox.charting.scaler");

(function(){
	var dc = dojox.charting, 
		df = dojox.lang.functional,
		du = dojox.lang.utils;
	
	var makeStroke = function(stroke){
		if(!stroke){ return stroke; }
		if(typeof stroke == "string" || stroke instanceof dojo.Color){
			stroke = {color: stroke};
		}
		return dojox.gfx.makeParameters(dojox.gfx.defaultStroke, stroke);
	};

	var augmentColor = function(target, color){
		var t = new dojo.Color(target),
			c = new dojo.Color(color);
		c.a = t.a;
		return c;
	};
	
	var augmentStroke = function(stroke, color){
		var s = makeStroke(stroke);
		if(s){
			s.color = augmentColor(s.color, color);
		}
		return s;
	};

	var augmentFill = function(fill, color){
		var fc, c = new dojo.Color(color);
		if(typeof fill == "string" || fill instanceof dojo.Color){
			return augmentColor(fill, color);
		}
		return fill;
	};
	
	var defaultStats = {hmin: 1, hmax: 0, vmin: Number.POSITIVE_INFINITY, vmax: Number.NEGATIVE_INFINITY};
	
	var collectSimpleStats = function(series){
		var stats = dojo.clone(defaultStats);
		for(var i = 0; i < series.length; ++i){
			var run = series[i];
			stats.hmax = Math.max(stats.hmax, run.data.length);
			var haveMin = ("min" in run), haveMax = ("max" in run);
			if(haveMin){
				stats.vmin = Math.min(stats.vmin, run.min);
				if(haveMax){
					stats.vmax = Math.max(stats.vmax, run.max);
				}else{
					dojo.forEach(run.data, function(val){
						if(isNaN(val)){ val = 0; }
						stats.vmax = Math.max(stats.vmax, val);
					});
				}
			}else{
				if(haveMax){
					stats.vmax = Math.max(stats.vmax, run.max);
					dojo.forEach(run.data, function(val){
						if(isNaN(val)){ val = 0; }
						stats.vmin = Math.min(stats.vmin, val);
					});
				}else{
					dojo.forEach(run.data, function(val){
						if(isNaN(val)){ val = 0; }
						stats.vmin = Math.min(stats.vmin, val);
						stats.vmax = Math.max(stats.vmax, val);
					});
				}
			}
		}
		return stats;
	};
	
	var collectStackedStats = function(series){
		// collect statistics
		var stats = dojo.clone(defaultStats);
		if(series.length){
			// 1st pass: find the maximal length of runs
			stats.hmax = df.foldl(series, "seed, run -> Math.max(seed, run.data.length)", stats.hmax);
			// 2nd pass: stack values
			for(var i = 0; i < stats.hmax; ++i){
				var v = series[0].data[i];
				if(isNaN(v)){ v = 0; }
				stats.vmin = Math.min(stats.vmin, v);
				for(var j = 1; j < series.length; ++j){
					var t = series[j].data[i];
					if(isNaN(t)){ t = 0; }
					v += t;
				}
				stats.vmax = Math.max(stats.vmax, v);
			}
		}
		return stats;
	};

	dojo.declare("dojox.charting.plot2d.renderers.Base", null, {
		constructor: function(kwArgs, chart){
			this.chart = chart;
			this.group = null;
		},
		purge: function(){
			if(this.group){
				this._clearGroup();
				this.group = null;
			}
			return this;
		},
		clear: function(){
			this.series = [];
			this._hAxis = null;
			this._vAxis = null;
			return this;
		},
		setAxis: function(axis){
			if(axis){
				this[axis.vertical ? "_vAxis" : "_hAxis"] = axis;
			}
			return this;
		},
		addSeries: function(run){
			this.series.push(run);
			return this;
		},
		calculateAxes: function(dim){
			return this;
		},
		render: function(dim, offsets){
			return this;
		},
		
		// utilities
		_calc: function(dim, stats){
			// calculate scaler
			if(this._hAxis){
				if(!this._hAxis.initialized()){
					this._hAxis.calculate(stats.hmin, stats.hmax, dim.width);
				}
				this._hScaler = this._hAxis.getScaler();
			}else{
				this._hScaler = {bounds: {lower: stats.hmin, upper: stats.hmax}, 
					scale: dim.width / (stats.hmax - stats.hmin)};
			}
			if(this._vAxis){
				if(!this._vAxis.initialized()){
					this._vAxis.calculate(stats.vmin, stats.vmax, dim.height);
				}
				this._vScaler = this._vAxis.getScaler();
			}else{
				this._vScaler = {bounds: {lower: stats.vmin, upper: stats.vmax}, 
					scale: dim.height / (stats.vmax - stats.vmin)};
			}
		},
		_clearGroup: function(){
			if(this.group){
				this.group.clear();
			}else{
				this.group = this.chart.surface.createGroup();
			}
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.Default", dojox.charting.plot2d.renderers.Base, {
		defaultParams: {
			hAxis: "x",		// use a horizontal axis named "x"
			vAxis: "y",		// use a vertical axis named "y"
			lines:   true,	// draw lines
			areas:   false,	// draw areas
			markers: false,	// draw markers
			shadows: 0		// draw shadows
		},
		optionalParams: {},	// no optional parameters
		
		constructor: function(kwArgs, chart){
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			this.series = [];
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
		},
		
		calculateAxes: function(dim){
			this._calc(dim, collectSimpleStats(this.series));
			return this;
		},
		render: function(dim, offsets){
			this._clearGroup();
			var t = this.chart.theme, s = this.group, stroke, outline, color, marker;
			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i],
					lpoly = dojo.map(run.data, function(v, i){
						return {
							x: this._hScaler.scale * (i + 1 - this._hScaler.bounds.lower) + offsets.l,
							y: dim.height - offsets.b - this._vScaler.scale * (v - this._vScaler.bounds.lower)
						};
					}, this);
				if(!run.fill || !run.stroke){
					// need autogenerated color
					color = new dojo.Color(t.next("color"));
				}
				if(this.opt.areas){
					var apoly = dojo.clone(lpoly);
					apoly.push({x: lpoly[lpoly.length - 1].x, y: dim.height - offsets.b});
					apoly.push({x: lpoly[0].x, y: dim.height - offsets.b});
					apoly.push(lpoly[0]);
					var fill = run.fill ? run.fill : augmentFill(t.series.fill, color);
					s.createPolyline(apoly).setFill(fill);
				}
				if(this.opt.lines || this.opt.markers){
					// need a stroke
					stroke = run.stroke ? makeStroke(run.stroke) : augmentStroke(t.series.stroke, color);
					if(run.outline || t.series.outline){
						outline = makeStroke(run.outline ? run.outline : t.series.outline);
						outline.width = 2 * outline.width + stroke.width;
					}
				}
				if(this.opt.markers){
					// need a marker
					marker = run.marker ? run.marker : t.next("marker");
				}
				if(this.opt.shadows && stroke){
					var sh = this.opt.shadows, shadowColor = new dojo.Color([0, 0, 0, 0.3]),
						spoly = dojo.map(lpoly, function(c){
							return {x: c.x + sh.dx, y: c.y + sh.dy};
						}),
						shadowStroke = dojo.clone(outline ? outline : stroke);
					shadowStroke.color = shadowColor;
					shadowStroke.width += sh.dw ? sh.dw : 0;
					if(this.opt.lines){
						s.createPolyline(spoly).setStroke(shadowStroke);
					}
					if(this.opt.markers){
						dojo.forEach(spoly, function(c){
							s.createPath("M" + c.x + " " + c.y + " " + marker).setStroke(shadowStroke).setFill(shadowColor);
						}, this);
					}
				}
				if(this.opt.lines){
					if(outline){
						s.createPolyline(lpoly).setStroke(outline);
					}
					s.createPolyline(lpoly).setStroke(stroke);
				}
				if(this.opt.markers){
					dojo.forEach(lpoly, function(c){
						var path = "M" + c.x + " " + c.y + " " + marker;
						if(outline){
							s.createPath(path).setStroke(outline);
						}
						s.createPath(path).setStroke(stroke).setFill(stroke.color);
					}, this);
				}
			}
			return this;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.Lines", dojox.charting.plot2d.renderers.Default, {
		constructor: function(kwArgs, chart){
			this.opt.lines = true;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.Areas", dojox.charting.plot2d.renderers.Default, {
		constructor: function(kwArgs, chart){
			this.opt.lines = true;
			this.opt.areas = true;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.Markers", dojox.charting.plot2d.renderers.Default, {
		constructor: function(kwArgs, chart){
			this.opt.markers = true;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.MarkersOnly", dojox.charting.plot2d.renderers.Default, {
		constructor: function(kwArgs, chart){
			this.opt.lines   = false;
			this.opt.markers = true;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.Stacked", dojox.charting.plot2d.renderers.Default, {
		calculateAxes: function(dim){
			var stats = collectStackedStats(this.series);
			this._maxRunLength = stats.hmax;
			this._calc(dim, stats);
			return this;
		},
		render: function(dim, offsets){
			// stack all values
			var acc = df.repeat(this._maxRunLength, "-> 0", 0);
			for(var i = 0; i < this.series.length; ++i){
				var run = this.series[i];
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j];
					if(isNaN(v)){ v = 0; }
					acc[j] += v;
				}
			}
			// draw runs in backwards
			this._clearGroup();
			var t = this.chart.theme, s = this.group, stroke, outline, color, marker;
			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i],
					lpoly = dojo.map(acc, function(v, i){
						return {
							x: this._hScaler.scale * (i + 1 - this._hScaler.bounds.lower) + offsets.l,
							y: dim.height - offsets.b - this._vScaler.scale * (v - this._vScaler.bounds.lower)
						};
					}, this);
				if(!run.fill || !run.stroke){
					// need autogenerated color
					color = new dojo.Color(t.next("color"));
				}
				if(this.opt.areas){
					var apoly = dojo.clone(lpoly);
					apoly.push({x: lpoly[lpoly.length - 1].x, y: dim.height - offsets.b});
					apoly.push({x: lpoly[0].x, y: dim.height - offsets.b});
					apoly.push(lpoly[0]);
					var fill = run.fill ? run.fill : augmentFill(t.series.fill, color);
					s.createPolyline(apoly).setFill(fill);
				}
				if(this.opt.lines || this.opt.markers){
					// need a stroke
					stroke = run.stroke ? makeStroke(run.stroke) : augmentStroke(t.series.stroke, color);
					if(run.outline || t.series.outline){
						outline = makeStroke(run.outline ? run.outline : t.series.outline);
						outline.width = 2 * outline.width + stroke.width;
					}
				}
				if(this.opt.markers){
					// need a marker
					marker = run.marker ? run.marker : t.next("marker");
				}
				if(this.opt.shadows && stroke){
					var sh = this.opt.shadows, shadowColor = new dojo.Color([0, 0, 0, 0.3]),
						spoly = dojo.map(lpoly, function(c){
							return {x: c.x + sh.dx, y: c.y + sh.dy};
						}),
						shadowStroke = dojo.clone(outline ? outline : stroke);
					shadowStroke.color = shadowColor;
					shadowStroke.width += sh.dw ? sh.dw : 0;
					if(this.opt.lines){
						s.createPolyline(spoly).setStroke(shadowStroke);
					}
					if(this.opt.markers){
						dojo.forEach(spoly, function(c){
							s.createPath("M" + c.x + " " + c.y + " " + marker).setStroke(shadowStroke).setFill(shadowColor);
						}, this);
					}
				}
				if(this.opt.lines){
					if(outline){
						s.createPolyline(lpoly).setStroke(outline);
					}
					s.createPolyline(lpoly).setStroke(stroke);
				}
				if(this.opt.markers){
					dojo.forEach(lpoly, function(c){
						var path = "M" + c.x + " " + c.y + " " + marker;
						if(outline){
							s.createPath(path).setStroke(outline);
						}
						s.createPath(path).setStroke(stroke).setFill(stroke.color);
					}, this);
				}
				// update the accumulator
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j];
					if(isNaN(v)){ v = 0; }
					acc[j] -= v;
				}
			}
			return this;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.StackedLines", dojox.charting.plot2d.renderers.Stacked, {
		constructor: function(kwArgs, chart){
			this.opt.lines = true;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.StackedAreas", dojox.charting.plot2d.renderers.Stacked, {
		constructor: function(kwArgs, chart){
			this.opt.lines = true;
			this.opt.areas = true;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.Columns", dojox.charting.plot2d.renderers.Base, {
		defaultParams: {
			hAxis: "x",		// use a horizontal axis named "x"
			vAxis: "y",		// use a vertical axis named "y"
			gap:	0,		// gap between columns in pixels
			shadows: null	// draw shadows
		},
		optionalParams: {},	// no optional parameters
		
		constructor: function(kwArgs, chart){
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			this.series = [];
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
		},
		
		calculateAxes: function(dim){
			var stats = collectSimpleStats(this.series);
			stats.hmin -= 0.5;
			stats.hmax += 0.5;
			this._calc(dim, stats);
			return this;
		},
		render: function(dim, offsets){
			this._clearGroup();
			var t = this.chart.theme, s = this.group, color, stroke, fill, f,
				gap = this.opt.gap < this._hScaler.scale / 3 ? this.opt.gap : 0;
			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i];
				if(!run.fill || !run.stroke){
					// need autogenerated color
					color = new dojo.Color(t.next("color"));
				}
				stroke = run.stroke ? run.stroke : augmentStroke(t.series.stroke, color);
				fill = run.fill ? run.fill : augmentFill(t.series.fill, color);
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j],
						width  = this._hScaler.scale - 2 * gap,
						height = this._vScaler.scale * (v - this._vScaler.bounds.lower);
					if(width >= 1 && height >= 1){
						s.createRect({
							x: offsets.l + this._hScaler.scale * (j + 0.5 - this._hScaler.bounds.lower) + gap,
							y: dim.height - offsets.b - this._vScaler.scale * (v - this._vScaler.bounds.lower),
							width: width, height: height
						}).setFill(fill).setStroke(stroke);
					}
				}
			}
			return this;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.StackedColumns", dojox.charting.plot2d.renderers.Columns, {
		calculateAxes: function(dim){
			var stats = collectStackedStats(this.series);
			this._maxRunLength = stats.hmax;
			stats.hmin -= 0.5;
			stats.hmax += 0.5;
			this._calc(dim, stats);
			return this;
		},
		render: function(dim, offsets){
			// stack all values
			var acc = df.repeat(this._maxRunLength, "-> 0", 0);
			for(var i = 0; i < this.series.length; ++i){
				var run = this.series[i];
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j];
					if(isNaN(v)){ v = 0; }
					acc[j] += v;
				}
			}
			// draw runs in backwards
			this._clearGroup();
			var t = this.chart.theme, s = this.group, color, stroke, fill, f,
				gap = this.opt.gap < this._hScaler.scale / 3 ? this.opt.gap : 0;
			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i];
				if(!run.fill || !run.stroke){
					// need autogenerated color
					color = new dojo.Color(t.next("color"));
				}
				stroke = run.stroke ? run.stroke : augmentStroke(t.series.stroke, color);
				fill = run.fill ? run.fill : augmentFill(t.series.fill, color);
				for(var j = 0; j < acc.length; ++j){
					var v = acc[j],
						width  = this._hScaler.scale - 2 * gap,
						height = this._vScaler.scale * (v - this._vScaler.bounds.lower);
					if(width >= 1 && height >= 1){
						s.createRect({
							x: offsets.l + this._hScaler.scale * (j + 0.5 - this._hScaler.bounds.lower) + gap,
							y: dim.height - offsets.b - this._vScaler.scale * (v - this._vScaler.bounds.lower),
							width: width, height: height
						}).setFill(fill).setStroke(stroke);
					}
				}
				// update the accumulator
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j];
					if(isNaN(v)){ v = 0; }
					acc[j] -= v;
				}
			}
			return this;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.ClusteredColumns", dojox.charting.plot2d.renderers.Columns, {
		render: function(dim, offsets){
			this._clearGroup();
			var t = this.chart.theme, s = this.group, color, stroke, fill, f,
				gap = this.opt.gap < this._hScaler.scale / 3 ? this.opt.gap : 0,
				thickness = (this._hScaler.scale - 2 * gap) / this.series.length;
			for(var i = 0; i < this.series.length; ++i){
				var run = this.series[i];
				if(!run.fill || !run.stroke){
					// need autogenerated color
					color = new dojo.Color(t.next("color"));
				}
				stroke = run.stroke ? run.stroke : augmentStroke(t.series.stroke, color);
				fill = run.fill ? run.fill : augmentFill(t.series.fill, color);
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j],
						width  = thickness,
						height = this._vScaler.scale * (v - this._vScaler.bounds.lower);
					if(width >= 1 && height >= 1){
						s.createRect({
							x: offsets.l + this._hScaler.scale * (j + 0.5 - this._hScaler.bounds.lower) + gap + thickness * i,
							y: dim.height - offsets.b - this._vScaler.scale * (v - this._vScaler.bounds.lower),
							width: width, height: height
						}).setFill(fill).setStroke(stroke);
					}
				}
			}
			return this;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.Bars", dojox.charting.plot2d.renderers.Base, {
		defaultParams: {
			hAxis: "x",		// use a horizontal axis named "x"
			vAxis: "y",		// use a vertical axis named "y"
			gap:	0,		// gap between columns in pixels
			shadows: null	// draw shadows
		},
		optionalParams: {},	// no optional parameters
		
		constructor: function(kwArgs, chart){
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			this.series = [];
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
		},
		
		calculateAxes: function(dim){
			var stats = collectSimpleStats(this.series), t;
			stats.hmin -= 0.5;
			stats.hmax += 0.5;
			t = stats.hmin, stats.hmin = stats.vmin, stats.vmin = t;
			t = stats.hmax, stats.hmax = stats.vmax, stats.vmax = t;
			this._calc(dim, stats);
			return this;
		},
		render: function(dim, offsets){
			this._clearGroup();
			var t = this.chart.theme, s = this.group, color, stroke, fill, f,
				gap = this.opt.gap < this._vScaler.scale / 3 ? this.opt.gap : 0;
			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i];
				if(!run.fill || !run.stroke){
					// need autogenerated color
					color = new dojo.Color(t.next("color"));
				}
				stroke = run.stroke ? run.stroke : augmentStroke(t.series.stroke, color);
				fill = run.fill ? run.fill : augmentFill(t.series.fill, color);
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j],
						width  = this._hScaler.scale * (v - this._hScaler.bounds.lower),
						height = this._vScaler.scale - 2 * gap;
					if(width >= 1 && height >= 1){
						s.createRect({
							x: offsets.l,
							y: dim.height - offsets.b - this._vScaler.scale * (j + 1.5 - this._vScaler.bounds.lower) + gap,
							width: width, height: height
						}).setFill(fill).setStroke(stroke);
					}
				}
			}
			return this;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.StackedBars", dojox.charting.plot2d.renderers.Bars, {
		calculateAxes: function(dim){
			var stats = collectStackedStats(this.series), t;
			this._maxRunLength = stats.hmax;
			stats.hmin -= 0.5;
			stats.hmax += 0.5;
			t = stats.hmin, stats.hmin = stats.vmin, stats.vmin = t;
			t = stats.hmax, stats.hmax = stats.vmax, stats.vmax = t;
			this._calc(dim, stats);
			return this;
		},
		render: function(dim, offsets){
			// stack all values
			var acc = df.repeat(this._maxRunLength, "-> 0", 0);
			for(var i = 0; i < this.series.length; ++i){
				var run = this.series[i];
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j];
					if(isNaN(v)){ v = 0; }
					acc[j] += v;
				}
			}
			// draw runs in backwards
			this._clearGroup();
			var t = this.chart.theme, s = this.group, color, stroke, fill, f,
				gap = this.opt.gap < this._vScaler.scale / 3 ? this.opt.gap : 0;
			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i];
				if(!run.fill || !run.stroke){
					// need autogenerated color
					color = new dojo.Color(t.next("color"));
				}
				stroke = run.stroke ? run.stroke : augmentStroke(t.series.stroke, color);
				fill = run.fill ? run.fill : augmentFill(t.series.fill, color);
				for(var j = 0; j < acc.length; ++j){
					var v = acc[j],
						width  = this._hScaler.scale * (v - this._hScaler.bounds.lower),
						height = this._vScaler.scale - 2 * gap;
					if(width >= 1 && height >= 1){
						s.createRect({
							x: offsets.l,
							y: dim.height - offsets.b - this._vScaler.scale * (j + 1.5 - this._vScaler.bounds.lower) + gap,
							width: width, height: height
						}).setFill(fill).setStroke(stroke);
					}
				}
				// update the accumulator
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j];
					if(isNaN(v)){ v = 0; }
					acc[j] -= v;
				}
			}
			return this;
		}
	});

	dojo.declare("dojox.charting.plot2d.renderers.ClusteredBars", dojox.charting.plot2d.renderers.Bars, {
		render: function(dim, offsets){
			this._clearGroup();
			var t = this.chart.theme, s = this.group, color, stroke, fill, f,
				gap = this.opt.gap < this._vScaler.scale / 3 ? this.opt.gap : 0,
				thickness = (this._vScaler.scale - 2 * gap) / this.series.length;
			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i];
				if(!run.fill || !run.stroke){
					// need autogenerated color
					color = new dojo.Color(t.next("color"));
				}
				stroke = run.stroke ? run.stroke : augmentStroke(t.series.stroke, color);
				fill = run.fill ? run.fill : augmentFill(t.series.fill, color);
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j],
						width  = this._hScaler.scale * (v - this._hScaler.bounds.lower),
						height = thickness;
					if(width >= 1 && height >= 1){
						s.createRect({
							x: offsets.l,
							y: dim.height - offsets.b - this._vScaler.scale * (j + 1.5 - this._vScaler.bounds.lower) 
								+ gap + thickness * (this.series.length - i - 1),
							width: width, height: height
						}).setFill(fill).setStroke(stroke);
					}
				}
			}
			return this;
		}
	});
	
	dojo.declare("dojox.charting.plot2d.renderers.Grid", null, {
		defaultParams: {
			hAxis: "x",			// use a horizontal axis named "x"
			vAxis: "y",			// use a vertical axis named "y"
			hMajorLines: true,	// draw horizontal major lines
			hMinorLines: false,	// draw horizontal minor lines
			vMajorLines: true,	// draw vertical major lines
			vMinorLines: false,	// draw vertical minor lines
			hStripes: "none",	// TBD
			vStripes: "none"	// TBD
		},
		optionalParams: {},	// no optional parameters
		
		constructor: function(kwArgs, chart){
			this.chart = chart;
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
			this.group = null;
		},
		purge: function(){
			if(this.group){
				this._clearGroup();
				this.group = null;
			}
			return this;
		},
		clear: function(){
			this._hAxis = null;
			this._vAxis = null;
			return this;
		},
		setAxis: function(axis){
			if(axis){
				this[axis.vertical ? "_vAxis" : "_hAxis"] = axis;
			}
			return this;
		},
		addSeries: function(run){
			// nothing
			return this;
		},
		calculateAxes: function(dim){
			// nothing
			return this;
		},
		render: function(dim, offsets){
			// draw horizontal stripes and lines
			this._clearGroup();
			var s = this.group, ta = this.chart.theme.axis,
				scaler = this._vAxis.getScaler();
			if(this.opt.hMinorLines && scaler.minor.tick){
				for(var i = 0; i < scaler.minor.count; ++i){
					var y = dim.height - offsets.b - scaler.scale * 
							(scaler.minor.start - scaler.bounds.lower + i * scaler.minor.tick);
					s.createLine({
						x1: offsets.l,
						y1: y,
						x2: dim.width - offsets.r,
						y2: y
					}).setStroke(ta.minorTick);
				}
			}
			if(this.opt.hMajorLines && scaler.major.tick){
				for(var i = 0; i < scaler.major.count; ++i){
					var y = dim.height - offsets.b - scaler.scale * 
							(scaler.major.start - scaler.bounds.lower + i * scaler.major.tick);
					s.createLine({
						x1: offsets.l,
						y1: y,
						x2: dim.width - offsets.r,
						y2: y
					}).setStroke(ta.majorTick);
				}
			}
			// draw vertical stripes and lines
			scaler = this._hAxis.getScaler();
			if(this.opt.vMinorLines && scaler.minor.tick){
				for(var i = 0; i < scaler.minor.count; ++i){
					var x = offsets.l + scaler.scale * 
							(scaler.minor.start - scaler.bounds.lower + i * scaler.minor.tick);
					s.createLine({
						x1: x,
						y1: offsets.t,
						x2: x,
						y2: dim.height - offsets.b
					}).setStroke(ta.minorTick);
				}
			}
			if(this.opt.vMajorLines && scaler.major.tick){
				for(var i = 0; i < scaler.major.count; ++i){
					var x = offsets.l + scaler.scale * 
							(scaler.major.start - scaler.bounds.lower + i * scaler.major.tick);
					s.createLine({
						x1: x,
						y1: offsets.t,
						x2: x,
						y2: dim.height - offsets.b
					}).setStroke(ta.majorTick);
				}
			}
			return this;
		},
		_clearGroup: function(){
			if(this.group){
				this.group.clear();
			}else{
				this.group = this.chart.surface.createGroup();
			}
		}
	});
})();
