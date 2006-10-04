dojo.provide("dojo.widget.charting.engine.vml.Plotters");
dojo.require("dojo.lang.common");

/*
 *	Mixin the VML-specific plotter object.
 */
dojo.mixin(dojo.widget.charting.engine.Plotters, {
	Line: function(
		/* array */data, 
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* function? */applyTo
	){
		var tension = 3;
		var area = plotarea.getArea();
		var line=document.createElement("div");
		line.style.position="absolute";
		line.style.top="0px";
		line.style.left="0px";
		line.style.width=plotarea.size.width+"px";
		line.style.height=plotarea.size.height+"px";

		var path=document.createElement("v:shape");
		path.setAttribute("strokeweight", "2px");
		path.setAttribute("strokecolor", data[0].series.color);
		path.setAttribute("fillcolor", "none");
		path.setAttribute("filled", "false");
		path.setAttribute("coordsize", (area.right-area.left) + "," + (area.bottom-area.top));
		path.style.position="absolute";
		path.style.top="0px";
		path.style.left="0px";
		path.style.width=area.right-area.left+"px";
		path.style.height=area.bottom-area.top+"px";
		var stroke=document.createElement("v:stroke");
		stroke.setAttribute("opacity", "0.8");
		path.appendChild(stroke);

		var cmd = [];
		var r=3;
		for(var i=0; i<data.length; i++){
			var x = Math.round(plot.axisX.getCoord(data[i].x, plotarea, plot));
			var y = Math.round(plot.axisY.getCoord(data[i].y, plotarea, plot));

			if (i==0){
				cmd.push("m");
				cmd.push(x+","+y);
			}else{
				var lastx = Math.round(plot.axisX.getCoord(data[i-1].x, plotarea, plot));
				var lasty = Math.round(plot.axisY.getCoord(data[i-1].y, plotarea, plot));
				var dx=x-lastx;
				var dy=y-lasty;
				
				cmd.push("c");
				var cx=Math.round((x-(tension-1)*(dx/tension)));
				cmd.push(cx+","+lasty);
				cx=Math.round((x-(dx/tension)));
				cmd.push(cx+","+y);
				cmd.push(x+","+y);
			}

			//	add the circle.
			var c = document.createElement("v:oval");
			c.setAttribute("strokeweight", "1px");
			c.setAttribute("strokecolor", data[i].series.color);
			c.setAttribute("fillcolor", data[i].series.color);
			var str=document.createElement("v:stroke");
			str.setAttribute("opacity","0.8");
			c.appendChild(str);
			str=document.createElement("v:fill");
			str.setAttribute("opacity","0.6");
			c.appendChild(str);
			var s=c.style;
			s.position="absolute";
			s.top=(y-r)+"px";
			s.left=(x-r)+"px";
			s.width=(r*2)+"px";
			s.height=(r*2)+"px";
			line.appendChild(c);
			if(applyTo){ applyTo(c, data[i].src); }
		}
		path.setAttribute("path", cmd.join(" ")+" e");
		line.appendChild(path);
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
		var line=document.createElement("div");
		line.style.position="absolute";
		line.style.top="0px";
		line.style.left="0px";
		line.style.width=plotarea.size.width+"px";
		line.style.height=plotarea.size.height+"px";

		var path=document.createElement("v:shape");
		path.setAttribute("strokeweight", "1px");
		path.setAttribute("strokecolor", data[0].series.color);
		path.setAttribute("fillcolor", data[0].series.color);
		path.setAttribute("coordsize", (area.right-area.left) + "," + (area.bottom-area.top));
		path.style.position="absolute";
		path.style.top="0px";
		path.style.left="0px";
		path.style.width=area.right-area.left+"px";
		path.style.height=area.bottom-area.top+"px";
		var stroke=document.createElement("v:stroke");
		stroke.setAttribute("opacity", "0.8");
		path.appendChild(stroke);
		var fill=document.createElement("v:fill");
		fill.setAttribute("opacity", "0.4");
		path.appendChild(fill);

		var cmd = [];
		var r=3;
		for(var i=0; i<data.length; i++){
			var x = Math.round(plot.axisX.getCoord(data[i].x, plotarea, plot));
			var y = Math.round(plot.axisY.getCoord(data[i].y, plotarea, plot));

			if (i==0){
				cmd.push("m");
				cmd.push(x+","+y);
			}else{
				var lastx = Math.round(plot.axisX.getCoord(data[i-1].x, plotarea, plot));
				var lasty = Math.round(plot.axisY.getCoord(data[i-1].y, plotarea, plot));
				var dx=x-lastx;
				var dy=y-lasty;
				
				cmd.push("c");
				var cx=Math.round((x-(tension-1)*(dx/tension)));
				cmd.push(cx+","+lasty);
				cx=Math.round((x-(dx/tension)));
				cmd.push(cx+","+y);
				cmd.push(x+","+y);
			}

			//	add the circle.
			var c = document.createElement("v:oval");
			c.setAttribute("strokeweight", "1px");
			c.setAttribute("strokecolor", data[i].series.color);
			c.setAttribute("fillcolor", data[i].series.color);
			var str=document.createElement("v:stroke");
			str.setAttribute("opacity","0.8");
			c.appendChild(str);
			str=document.createElement("v:fill");
			str.setAttribute("opacity","0.6");
			c.appendChild(str);
			var s=c.style;
			s.position="absolute";
			s.top=(y-r)+"px";
			s.left=(x-r)+"px";
			s.width=(r*2)+"px";
			s.height=(r*2)+"px";
			line.appendChild(c);
			if(applyTo){ applyTo(c, data[i].src); }
		}
		cmd.push("l");
		cmd.push(x + "," + Math.round(plot.axisY.getCoord(0, plotarea, plot)));
		cmd.push("l");
		cmd.push(Math.round(plot.axisX.getCoord(0, plotarea, plot)) + "," +  Math.round(plot.axisY.getCoord(0, plotarea, plot)));
		path.setAttribute("path", cmd.join(" ")+" e");
		line.appendChild(path);
		return line;
	},
	Scatter: function(
		/* array */data, 
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* function? */applyTo
	){
		return document.createElement("div");
	},
	Bubble: function(
		/* array */data, 
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* function? */applyTo
	){
		return document.createElement("div");
	}
});
dojo.widget.charting.engine.Plotters["Default"] = dojo.widget.charting.engine.Plotters.Line;
