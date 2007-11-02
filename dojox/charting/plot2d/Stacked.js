dojo.provide("dojox.charting.plot2d.Stacked");

dojo.require("dojox.charting.plot2d.common");
dojo.require("dojox.charting.plot2d.Default");

dojo.require("dojox.lang.functional");

(function(){
	var df = dojox.lang.functional, dc = dojox.charting.plot2d.common,
		purgeGroup = df.lambda("item.purgeGroup()");

	dojo.declare("dojox.charting.plot2d.Stacked", dojox.charting.plot2d.Default, {
		calculateAxes: function(dim){
			var stats = dc.collectStackedStats(this.series);
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
			if(this.dirty){
				dojo.forEach(this.series, purgeGroup);
				this.cleanGroup();
				var s = this.group;
				df.forEachReversed(this.series, function(item){ item.cleanGroup(s); });
			}
			var t = this.chart.theme, stroke, outline, color, marker;
			for(var i = this.series.length - 1; i >= 0; --i){
				var run = this.series[i];
				if(!this.dirty && !run.dirty){ continue; }
				run.cleanGroup();
				var s = run.group,
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
					var fill = run.fill ? run.fill : dc.augmentFill(t.series.fill, color);
					s.createPolyline(apoly).setFill(fill);
				}
				if(this.opt.lines || this.opt.markers){
					// need a stroke
					stroke = run.stroke ? dc.makeStroke(run.stroke) : dc.augmentStroke(t.series.stroke, color);
					if(run.outline || t.series.outline){
						outline = dc.makeStroke(run.outline ? run.outline : t.series.outline);
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
				run.dirty = false;
				// update the accumulator
				for(var j = 0; j < run.data.length; ++j){
					var v = run.data[j];
					if(isNaN(v)){ v = 0; }
					acc[j] -= v;
				}
			}
			this.dirty = false;
			return this;
		}
	});
})();
