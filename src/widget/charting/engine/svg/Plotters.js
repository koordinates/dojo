dojo.provide("dojo.widget.charting.engine.svg.Plotters");
dojo.require("dojo.lang.common");
dojo.require("dojo.svg");

dojo.require('dojo.json');

//	Mixin the SVG-specific plotter object.
dojo.mixin(dojo.widget.charting.engine.Plotters, {
	/*********************************************************
	 *	Grouped plotters: need all series on a plot at once.
	 *********************************************************/
	Bar: function(
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* object? */kwArgs,
		/* function? */applyTo
	){
		//	summary
		//	Like Bar, but grouped together.
		var area = plotarea.getArea();
		var group = document.createElementNS(dojo.svg.xmlns.svg, "g");
		
		//	precompile the data
		var n = plot.series.length;	//	how many series
		var data = [];
		for(var i=0; i<n; i++){
			var tmp = plot.series[i].data.evaluate(kwArgs);
			data.push(tmp);
		}

		//	calculate the width of each bar.
		var space = 8;
		var nPoints = data[0].length;
		var width = ((area.right-area.left)-(space*(nPoints-1)))/nPoints;	//	the width of each group.
		var barWidth = width/n;	//	the width of each bar, no spaces.
		var yOrigin = plot.axisY.getCoord(plot.axisX.origin, plotarea, plot);

		for(var i=0; i<nPoints; i++){
			//	calculate offset
			var xStart = area.left+(width*i)+(space*i);
			for(var j=0; j<n; j++){
				var value = data[j][i].y;
				var yA = yOrigin;
				var x = xStart + (barWidth*j);
				var y = plot.axisY.getCoord(value, plotarea, plot);
				var h = Math.abs(yA-y);
				if(value < plot.axisX.origin){
					yA = y;
					y = yOrigin;
				}
				
				var bar=document.createElementNS(dojo.svg.xmlns.svg, "rect");
				bar.setAttribute("fill", data[j][i].series.color);
				bar.setAttribute("stroke-width", "0");
				bar.setAttribute("x", x);
				bar.setAttribute("y", y);
				bar.setAttribute("width", barWidth);
				bar.setAttribute("height", h);
				bar.setAttribute("fill-opacity", "0.65");
				if(applyTo){ applyTo(bar, data[j][i].src); }
				group.appendChild(bar);
			}
		}
		return group;
	},
	HorizontalBar: function(
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* object? */kwArgs,
		/* function? */applyTo
	){
		var area = plotarea.getArea();
		var group = document.createElementNS(dojo.svg.xmlns.svg, "g");
		
		//	precompile the data
		var n = plot.series.length;	//	how many series
		var data = [];
		for(var i=0; i<n; i++){
			var tmp = plot.series[i].data.evaluate(kwArgs);
			data.push(tmp);
		}

		var space = 6;
		var nPoints = data[0].length;
		var h = ((area.bottom-area.top)-(space*(nPoints-1)))/nPoints;
		var barH = h/n;
		var xOrigin = plot.axisX.getCoord(0, plotarea, plot);

		for(var i=0; i<nPoints; i++){
			//	calculate offset
			var yStart = area.top+(h*i)+(space*i);
			for(var j=0; j<n; j++){
				var value = data[j][i].y;
				var y = yStart + (barH*j);
				var xA = xOrigin;
				var x = plot.axisX.getCoord(value, plotarea, plot);
				var w = Math.abs(x-xA);
				if(value > 0){
					x = xOrigin;
				}
				
				var bar=document.createElementNS(dojo.svg.xmlns.svg, "rect");
				bar.setAttribute("fill", data[j][i].series.color);
				bar.setAttribute("stroke-width", "0");
				bar.setAttribute("x", xA);
				bar.setAttribute("y", y);
				bar.setAttribute("width", w);
				bar.setAttribute("height", barH);
				bar.setAttribute("fill-opacity", "0.6");
				if(applyTo){ applyTo(bar, data[j][i].src); }
				group.appendChild(bar);
			}
		}
		return group;
	},
	Gantt: function(
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* object? */kwArgs,
		/* function? */applyTo
	){
		//	BINDINGS: high/low
		var area = plotarea.getArea();
		var group = document.createElementNS(dojo.svg.xmlns.svg, "g");

		//	precompile the data
		var n = plot.series.length;	//	how many series
		var data = [];
		for(var i=0; i<n; i++){
			var tmp = plot.series[i].data.evaluate(kwArgs);
			data.push(tmp);
		}

		var space = 2;
		var nPoints = data[0].length;
		var h = ((area.bottom-area.top)-(space*(nPoints-1)))/nPoints;
		var barH = h/n;
		for(var i=0; i<nPoints; i++){
			//	calculate offset
			var yStart = area.top+(h*i)+(space*i);
			for(var j=0; j<n; j++){
				var high = data[j][i].high;
				var low = data[j][i].low;
				if(low > high){
					var t = high;
					high = low;
					low = t;
				}
				var x = plot.axisX.getCoord(low, plotarea, plot);
				var w = plot.axisX.getCoord(high, plotarea, plot) - x;
				var y = yStart + (barH*j);
				
				var bar=document.createElementNS(dojo.svg.xmlns.svg, "rect");
				bar.setAttribute("fill", data[j][i].series.color);
				bar.setAttribute("stroke-width", "0");
				bar.setAttribute("x", x);
				bar.setAttribute("y", y);
				bar.setAttribute("width", w);
				bar.setAttribute("height", barH);
				bar.setAttribute("fill-opacity", "0.6");
				if(applyTo){ applyTo(bar, data[j][i].src); }
				group.appendChild(bar);
			}
		}
		return group;
	},

	/*********************************************************
	 *	Single plotters: one series at a time.
	 *********************************************************/
	DataBar: function(
		/* array */data, 
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* function? */applyTo
	){
		//	summary
		//	Like Bar.
		var area = plotarea.getArea();
		var group = document.createElementNS(dojo.svg.xmlns.svg, "g");
		
		var n = data.length;
		var w = (area.right-area.left)/(plot.axisX.range.upper - plot.axisX.range.lower);	//	the width of each group.
		var yOrigin = plot.axisY.getCoord(plot.axisX.origin, plotarea, plot);

		for(var i=0; i<n; i++){
			//	calculate offset
			var value = data[i].y;
			var yA = yOrigin;
			var x = plot.axisX.getCoord(data[i].x, plotarea, plot) - (w/2);
			var y = plot.axisY.getCoord(value, plotarea, plot);
			var h = Math.abs(yA-y);
			if(value < plot.axisX.origin){
				yA = y;
				y = yOrigin;
			}
			var bar=document.createElementNS(dojo.svg.xmlns.svg, "rect");
			bar.setAttribute("fill", data[i].series.color);
			bar.setAttribute("stroke-width", "0");
			bar.setAttribute("x", x);
			bar.setAttribute("y", y);
			bar.setAttribute("width", w);
			bar.setAttribute("height", h);
			bar.setAttribute("fill-opacity", "0.65");
			if(applyTo){ applyTo(bar, data[i].src); }
			group.appendChild(bar);
		}
		return group;
	},
	Line: function(
		/* array */data, 
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* function? */applyTo
	){
		var area = plotarea.getArea();
		var line = document.createElementNS(dojo.svg.xmlns.svg, "g");
		var path = document.createElementNS(dojo.svg.xmlns.svg, "path");
		line.appendChild(path);

		path.setAttribute("fill", "none");
		path.setAttribute("stroke", data[0].series.color);
		path.setAttribute("stroke-width" , "2");
		path.setAttribute("stroke-opacity", "0.85");
		if(data[0].series.label != null){
			path.setAttribute("title", data[0].series.label);
		}

		var cmd=[];
		for(var i=0; i<data.length; i++){
			var x = plot.axisX.getCoord(data[i].x, plotarea, plot);
			var y = plot.axisY.getCoord(data[i].y, plotarea, plot);
			if(i==0){ cmd.push("M"); }
			else { cmd.push("L"); }
			cmd.push(x+","+y);
			
			//	points on the line
			var c=document.createElementNS(dojo.svg.xmlns.svg, "circle");
			c.setAttribute("cx",x);
			c.setAttribute("cy",y);
			c.setAttribute("r","3");
			c.setAttribute("fill", data[i].series.color);
			c.setAttribute("fill-opacity", "0.65");
			c.setAttribute("stroke-width", "1");
			c.setAttribute("stroke-opacity", "0.85");
			line.appendChild(c);
			if(applyTo){ applyTo(c, data[i].src); }
		}
		path.setAttribute("d", cmd.join(" "));
		return line;
	},
	CurvedLine: function(
		/* array */data, 
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* function? */applyTo
	){
		var tension = 3;
		var area = plotarea.getArea();
		var line = document.createElementNS(dojo.svg.xmlns.svg, "g");
		var path = document.createElementNS(dojo.svg.xmlns.svg, "path");
		line.appendChild(path);

		path.setAttribute("fill", "none");
		path.setAttribute("stroke", data[0].series.color);
		path.setAttribute("stroke-width" , "2");
		path.setAttribute("stroke-opacity", "0.85");
		if(data[0].series.label != null){
			path.setAttribute("title", data[0].series.label);
		}

		var cmd=[];
		for(var i=0; i<data.length; i++){
			var x = plot.axisX.getCoord(data[i].x, plotarea, plot);
			var y = plot.axisY.getCoord(data[i].y, plotarea, plot);
			var dx = area.left + 1;
			var dy = area.bottom;
			if(i>0){
				dx = x - plot.axisX.getCoord(data[i-1].x, plotarea, plot);
				dy = plot.axisY.getCoord(data[i-1].y, plotarea, plot);
			}

			if(i==0){ cmd.push("M"); }
			else {
				cmd.push("C");
				var cx = x-(tension-1) * (dx/tension);
				cmd.push(cx + "," + dy);
				cx = x - (dx/tension);
				cmd.push(cx + "," + y);
			}
			cmd.push(x+","+y);
			
			//	points on the line
			var c=document.createElementNS(dojo.svg.xmlns.svg, "circle");
			c.setAttribute("cx",x);
			c.setAttribute("cy",y);
			c.setAttribute("r","3");
			c.setAttribute("fill", data[i].series.color);
			c.setAttribute("fill-opacity", "0.65");
			c.setAttribute("stroke-width", "1");
			c.setAttribute("stroke-opacity", "0.85");
			line.appendChild(c);
			if(applyTo){ applyTo(c, data[i].src); }
		}
		path.setAttribute("d", cmd.join(" "));
		return line;
	},
	Area: function(
		/* array */data, 
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* function? */applyTo
	){
		var area = plotarea.getArea();
		var line = document.createElementNS(dojo.svg.xmlns.svg, "g");
		var path = document.createElementNS(dojo.svg.xmlns.svg, "path");
		line.appendChild(path);

		path.setAttribute("fill", data[0].series.color);
		path.setAttribute("fill-opacity", "0.4");
		path.setAttribute("stroke", data[0].series.color);
		path.setAttribute("stroke-width" , "1");
		path.setAttribute("stroke-opacity", "0.85");
		if(data[0].series.label != null){
			path.setAttribute("title", data[0].series.label);
		}

		var cmd=[];
		for(var i=0; i<data.length; i++){
			var x = plot.axisX.getCoord(data[i].x, plotarea, plot);
			var y = plot.axisY.getCoord(data[i].y, plotarea, plot);
			if(i==0){ cmd.push("M"); }
			else { cmd.push("L"); }
			cmd.push(x+","+y);
			
			//	points on the line
			var c=document.createElementNS(dojo.svg.xmlns.svg, "circle");
			c.setAttribute("cx",x);
			c.setAttribute("cy",y);
			c.setAttribute("r","3");
			c.setAttribute("fill", data[i].series.color);
			c.setAttribute("fill-opacity", "0.65");
			c.setAttribute("stroke-width", "1");
			c.setAttribute("stroke-opacity", "0.85");
			line.appendChild(c);
			if(applyTo){ applyTo(c, data[i].src); }
		}
		//	finish it off
		cmd.push("L");
		cmd.push(x + "," + plot.axisY.getCoord(plot.axisX.origin, plotarea, plot));
		cmd.push("L");
		cmd.push(plot.axisX.getCoord(data[0].x, plotarea, plot) + "," +  plot.axisY.getCoord(plot.axisX.origin, plotarea, plot));
		cmd.push("Z");
		path.setAttribute("d", cmd.join(" "));
		return line;
	},
	CurvedArea: function(
		/* array */data, 
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* function? */applyTo
	){
		var tension = 3;
		var area = plotarea.getArea();
		var line = document.createElementNS(dojo.svg.xmlns.svg, "g");
		var path = document.createElementNS(dojo.svg.xmlns.svg, "path");
		line.appendChild(path);

		path.setAttribute("fill", data[0].series.color);
		path.setAttribute("fill-opacity", "0.4");
		path.setAttribute("stroke", data[0].series.color);
		path.setAttribute("stroke-width" , "1");
		path.setAttribute("stroke-opacity", "0.85");
		if(data[0].series.label != null){
			path.setAttribute("title", data[0].series.label);
		}

		var cmd=[];
		for(var i=0; i<data.length; i++){
			var x = plot.axisX.getCoord(data[i].x, plotarea, plot);
			var y = plot.axisY.getCoord(data[i].y, plotarea, plot);
			var dx = area.left + 1;
			var dy = area.bottom;
			if(i>0){
				dx = x - plot.axisX.getCoord(data[i-1].x, plotarea, plot);
				dy = plot.axisY.getCoord(data[i-1].y, plotarea, plot);
			}

			if(i==0){ cmd.push("M"); }
			else {
				cmd.push("C");
				var cx = x-(tension-1) * (dx/tension);
				cmd.push(cx + "," + dy);
				cx = x - (dx/tension);
				cmd.push(cx + "," + y);
			}
			cmd.push(x+","+y);
			
			//	points on the line
			var c=document.createElementNS(dojo.svg.xmlns.svg, "circle");
			c.setAttribute("cx",x);
			c.setAttribute("cy",y);
			c.setAttribute("r","3");
			c.setAttribute("fill", data[i].series.color);
			c.setAttribute("fill-opacity", "0.65");
			c.setAttribute("stroke-width", "1");
			c.setAttribute("stroke-opacity", "0.85");
			line.appendChild(c);
			if(applyTo){ applyTo(c, data[i].src); }
		}
		//	finish it off
		cmd.push("L");
		cmd.push(x + "," + plot.axisY.getCoord(plot.axisX.origin, plotarea, plot));
		cmd.push("L");
		cmd.push(plot.axisX.getCoord(data[0].x, plotarea, plot) + "," +  plot.axisY.getCoord(plot.axisX.origin, plotarea, plot));
		cmd.push("Z");
		path.setAttribute("d", cmd.join(" "));
		return line;
	},
	Scatter: function(
		/* array */data, 
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* function? */applyTo
	){
		var r=7;
		var group = document.createElementNS(dojo.svg.xmlns.svg, "g");
		for (var i=0; i<data.length; i++){
			var x = plot.axisX.getCoord(data[i].x, plotarea, plot);
			var y = plot.axisY.getCoord(data[i].y, plotarea, plot);
			var point = document.createElementNS(dojo.svg.xmlns.svg, "path");
			point.setAttribute("fill", data[i].series.color);
			point.setAttribute("stroke-width", "0");
			point.setAttribute("d",
				"M " + x + "," + (y-r) + " " +
				"Q " + x + "," + y + " " + (x+r) + "," + y + " " +
				"Q " + x + "," + y + " " + x + "," + (y+r) + " " +
				"Q " + x + "," + y + " " + (x-r) + "," + y + " " +
				"Q " + x + "," + y + " " + x + "," + (y-r) + " " +
				"Z"
			);
			if(applyTo){ applyTo(point, data[i].src); }
			group.appendChild(point);
		}
		return group;
	},
	Bubble: function(
		/* array */data, 
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* function? */applyTo
	){
		//	we will expect an additional binding to "size" here.  And it will be raw, no factors.
		var group = document.createElementNS(dojo.svg.xmlns.svg, "g");
		var sizeFactor=1;
		for (var i=0; i<data.length; i++){
			var x = plot.axisX.getCoord(data[i].x, plotarea, plot);
			var y = plot.axisY.getCoord(data[i].y, plotarea, plot);
			if(i==0){
				//	figure out the size factor, start with the axis with the greater range.
				var raw = data[i].size;
				var dy = plot.axisY.getCoord(data[i].y + raw, plotarea, plot)-y;
				sizeFactor = dy/raw;
			}
			if(sizeFactor<1) { sizeFactor = 1; }
			var point = document.createElementNS(dojo.svg.xmlns.svg, "circle");
			point.setAttribute("fill", data[i].series.color);
			point.setAttribute("fill-opacity", "0.8");
			point.setAttribute("stroke", data[i].series.color);
			point.setAttribute("stroke-width", "1");
			point.setAttribute("cx",x);
			point.setAttribute("cy",y);
			point.setAttribute("r", (data[i].size/2)*sizeFactor);
			if(applyTo){ applyTo(point, data[i].src); }
			group.appendChild(point);
		}
		return group;
	}
});
dojo.widget.charting.engine.Plotters["Default"] = dojo.widget.charting.engine.Plotters.Line;
