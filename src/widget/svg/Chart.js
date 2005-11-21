dojo.provide("dojo.widget.svg.Chart");

dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.Chart");
dojo.require("dojo.math");
dojo.require("dojo.html");
dojo.require("dojo.svg");
dojo.require("dojo.graphics.color");

dojo.widget.svg.Chart=function(){
	dojo.widget.Chart.call(this);
	dojo.widget.HtmlWidget.call(this);
};
dojo.inherits(dojo.widget.svg.Chart, dojo.widget.HtmlWidget);
dojo.lang.extend(dojo.widget.svg.Chart, {
	//	widget props
	templatePath:null,
	templateCssPath:null,

	//	chart props
	vectorNode:null,
	plotArea:null,
	dataGroup:null,

	properties:{
		height:400,	//	defaults, will resize to the domNode.
		width:600,
		padding:{
			top:10,
			bottom:2,
			left:60,
			right:30
		},
		axes:{
			x:{
				position:"bottom",
				label:"",
				unitLabel:"",
				unitType:Number,
				nUnitsToShow:10,
				range:{
					min:0,
					max:200
				}
			},
			y:{
				position:"left",
				label:"",
				unitLabel:"",
				unitType:Number,
				nUnitsToShow:10,
				range:{
					min:0,
					max:200
				}
			}
		}
	},
	
	fillInTemplate:function(args,frag){
		this.initialize();
		this.render();
	},
	initialize:function(){
		//	begin by grabbing the table, and reading it in.
		var table=this.domNode.getElementsByTagName("table")[0];
		if (!table) return;

		var thead=table.getElementsByTagName("thead")[0];
		var tbody=table.getElementsByTagName("tbody")[0];
		if(!(thead&&tbody)) dojo.raise("dojo.widget.Chart: supplied table must define a head and a body.");

		//	set up the series.
		var columns=thead.getElementsByTagName("tr")[0].getElementsByTagName("th");	//	should be <tr><..>
		
		//	assume column 0 == X
		for (var i=1; i<columns.length; i++){
			var key="column"+i;
			var label=columns[i].innerHTML;
			var plotType=columns[i].getAttribute("plotType")||"line";
			var color=columns[i].getAttribute("color")||null;
			var ds=new dojo.widget.Chart.DataSeries(key,label,plotType,color);
			this.series.push(ds);
		}

		//	ok, get the values.
		var rows=tbody.getElementsByTagName("tr");
		var xMin=Number.MAX_VALUE,xMax=Number.MIN_VALUE;
		var yMin=Number.MAX_VALUE,yMax=Number.MIN_VALUE;

		for(var i=0; i<rows.length; i++){
			var row=rows[i];
			var cells=row.getElementsByTagName("td");
			var x=Number.MIN_VALUE;
			for (var j=0; j<cells.length; j++){
				if (j==0){
					x=parseFloat(cells[j].innerHTML);
					xMin=Math.min(xMin, x);
					xMax=Math.max(xMax, x);
				} else {
					var ds=this.series[j-1];
					var y=parseFloat(cells[j].innerHTML);
					yMin=Math.min(yMin,y);
					yMax=Math.max(yMax,y);
					var o={x:x, value:y};
					ds.add(o);
				}
			}
		}

		//	fix the axes
		this.properties.axes.x.range={min:xMin, max:xMax};
		this.properties.axes.y.range={min:yMin, max:yMax};

		//	table values should be populated, now pop it off.
		this.domNode.removeChild(table);

		//	get the width and the height.
//		this.properties.width=dojo.html.getInnerWidth(this.domNode);
//		this.properties.height=dojo.html.getInnerHeight(this.domNode);

		// ok, lets create the chart itself.
		dojo.svg.g.suspend();		
		if(this.vectorNode) this.destroy();
		this.vectorNode=document.createElementNS(dojo.svg.xmlns.svg, "svg");
		this.vectorNode.setAttribute("width", this.properties.width);
		this.vectorNode.setAttribute("height", this.properties.height);

		//	the plot background.
		this.plotArea = document.createElementNS(dojo.svg.xmlns.svg, "g");
		this.vectorNode.appendChild(this.plotArea);
		var rect = document.createElementNS(dojo.svg.xmlns.svg, "rect");		
		rect.setAttribute("x", "0");
		rect.setAttribute("y", "0");
		rect.setAttribute("width", this.properties.width);
		rect.setAttribute("height", this.properties.height);
		rect.setAttribute("fill", "#fff");
		this.plotArea.appendChild(rect);

		//	x axis
		var line = document.createElementNS(dojo.svg.xmlns.svg, "line");
		var pos=this.properties.axes.x.position;
		if (pos=="top"){
			line.setAttribute("y1", this.properties.padding.top);
			line.setAttribute("y2", this.properties.padding.top);
		}
		else if (pos=="bottom"){
			line.setAttribute("y1", this.properties.height-this.properties.padding.bottom);
			line.setAttribute("y2", this.properties.height-this.properties.padding.bottom);
		}
		else if (pos=="middle") {
			line.setAttribute("y1", "50%");
			line.setAttribute("y2", "50%");
		}
		line.setAttribute("x1","0");
		line.setAttribute("x2","100%");
		line.setAttribute("style","stroke:#000;stroke-width:1;");
		this.plotArea.appendChild(line);
		
		//	x axis units.
		
		//	y axis
		var line=document.createElementNS(dojo.svg.xmlns.svg, "line");
		var pos=this.properties.axes.y.position;
		if (pos=="left"){
			line.setAttribute("x1", this.properties.padding.left);
			line.setAttribute("x2", this.properties.padding.left);
			line.setAttribute("y1", this.properties.padding.top);
			line.setAttribute("y2", this.properties.height-this.properties.padding.bottom);
		}
		else if (pos=="right"){
			line.setAttribute("x1", "94%");		//	FIXME
			line.setAttribute("x2", "94%");
			line.setAttribute("y1", this.properties.padding.top);
			line.setAttribute("y2", this.properties.height-this.properties.padding.bottom);
		}
		else {
			line.setAttribute("x1", "50%");
			line.setAttribute("x2", "50%");
			line.setAttribute("y1", this.properties.padding.top);
			line.setAttribute("y2", this.properties.height-this.properties.padding.bottom);
		}
		line.setAttribute("style", "stroke:#000;stroke-width:1;");
		this.plotArea.appendChild(line);

		//	y axis units

		//	data group
		this.dataGroup = document.createElementNS(dojo.svg.xmlns.svg, "g");
		this.plotArea.appendChild(this.dataGroup);
		this.domNode.appendChild(this.vectorNode);
		dojo.svg.g.resume();

		//	this is last.
		this.assignColors();
	},
	destroy:function(){
		while(this.domNode.childNodes.length>0){
			this.domNode.removeChild(this.domNode.childNodes.item(0));
		}
		this.vectorNode=this.plotArea=this.dataGroup=null;
	},
	render:function(){
		dojo.svg.g.suspend();
		
		if (this.dataGroup){
			while(this.dataGroup.childNodes.length>0){
				this.dataGroup.removeChild(this.dataGroup.childNodes.item(0));
			}
		} else {
			this.initialize();
		}

		//	the remove/append is an attempt to streamline the rendering, it's totally optional
//		var p=this.dataGroup.parentNode;
//		p.removeChild(this.dataGroup);
		for(var i=0; i<this.series.length; i++){
			dojo.widget.svg.Chart.Plotter.plot(this.series[i], this);
		}
//		p.appendChild(this.dataGroup);
		
		dojo.svg.g.resume();
	}
});

dojo.widget.svg.Chart.PlotTypes = {
	Bar:"bar",
	Line:"line",
	Scatter:"scatter"
};

dojo.widget.svg.Chart.Plotter=new function(){
	var _this=this;
	var plotters = {};
	var types=dojo.widget.svg.Chart.PlotTypes;
	this.getX=function(value, chart){
		var v=parseFloat(value);
		var min=chart.properties.axes.x.range.min;
		var max=chart.properties.axes.x.range.max;
		var ofst=0;
		if(min<0)ofst+=Math.abs(min);
		min+=ofst; max+=ofst; v+=ofst;

		return (
				(chart.properties.width-chart.properties.padding.right)
			*v)
			/(max-min);
	};
	this.getY=function(value, chart){
		var v=parseFloat(value);
		var h=chart.properties.height
			-chart.properties.padding.bottom;
		var a=h-chart.properties.padding.top;
		var max=chart.properties.axes.y.range.max;
		var min=chart.properties.axes.y.range.min;
		var ofst=0;
		if(min<0)ofst+=Math.abs(min);
		min+=ofst; max+=ofst; v+=ofst;
		return h-((v/(max-min))*a);
	};

	this.addPlotter=function(name, func){
		plotters[name]=func;
	};
	this.plot=function(series, chart){
		if (series.values.length==0) return;
		if (series.plotType){
			return plotters[series.plotType](series, chart);
		}
		else if (chart.plotType){
			return plotters[chart.plotType](series, chart);
		}
		else {
			return plotters[types.Bar](series, chart);
		}
	};

	//	plotting
	plotters[types.Bar]=function(series, chart){
		var space=2;
		for (var i=0; i<series.values.length; i++){
			var x=_this.getX(series.values[i].x, chart);
			var y=_this.getY(series.values[i].value, chart);

			var w=chart.properties.width-chart.properties.padding.right-x-space;
			if (i<series.values.length-1){
				w=_this.getX(series.values[i+1].x, chart)-x-space;
			}
			var h=y+(chart.properties.height-chart.properties.padding.bottom);

			var bar=document.createElementNS(dojo.svg.xmlns.svg, "rect");
			bar.setAttribute("fill", series.color);
			bar.setAttribute("title", series.values[i].value);
			bar.setAttribute("stroke-width", "0");
			bar.setAttribute("x", x);
			bar.setAttribute("y", y);
			bar.setAttribute("width", w);
			bar.setAttribute("height", h);
			chart.dataGroup.appendChild(bar);
		}
	};
	plotters[types.Line]=function(series, chart){
		var tension=3;
		var line = document.createElementNS(dojo.svg.xmlns.svg, "path");
		line.setAttribute("fill", "none");
		line.setAttribute("stroke", series.color);
		line.setAttribute("stroke-width", "1");
		line.setAttribute("stroke-opacity", "0.85");
		line.setAttribute("title", series.label);
		chart.dataGroup.appendChild(line);

		var path = [];
		for (var i=0; i<series.values.length; i++){
			var x = _this.getX(series.values[i].x, chart)
			var y = _this.getY(series.values[i].value, chart);

			var dx = chart.properties.padding.left+1;
			var dy = chart.properties.height-chart.properties.padding.bottom;
			if (i>0){
				dx=_this.getX(series.values[i-1].x, chart);
				dy=_this.getY(series.values[i-1].value, chart);
			}
			
			if (i==0) path.push("M");
			else {
				path.push("C");
				var cx=x-(tension-1)*(dx/tension);
				path.push(cx+","+dy);
				cx=x-(dx/tension);
				path.push(cx+","+y);
			}
			path.push(x+","+y);
		}
		line.setAttribute("d", path.join(" "));
	};
	plotters[types.Scatter]=function(series, chart){
		var r=5;
		for (var i=0; i<series.values.length; i++){
			var point=document.createElementNS(dojo.svg.xmlns.svg, "circle");
			point.setAttribute("r", r);
			point.setAttribute("stroke-width", 0);
			point.setAttribute("fill", series.color);
			point.setAttribute("cx", _this.getX(series.values[i].x, chart));
			point.setAttribute("cy", _this.getY(series.values[i].value, chart));
			point.setAttribute("title", series.values[i].value);
			chart.dataGroup.appendChild(point);
		}
	};
}();
