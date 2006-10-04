dojo.provide("dojo.widget.charting.engine.svg.Plotters");
dojo.require("dojo.lang.common");
dojo.require("dojo.svg");

//	Mixin the SVG-specific plotter object.
dojo.mixin(dojo.widget.charting.engine.Plotters, {
	Line: function(
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
		cmd.push(x + "," + plot.axisY.getCoord(0, plotarea, plot));
		cmd.push("L");
		cmd.push( plot.axisX.getCoord(0, plotarea, plot) + "," +  plot.axisY.getCoord(0, plotarea, plot));
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
