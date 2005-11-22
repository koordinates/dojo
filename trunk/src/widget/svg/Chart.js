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

	//	state
	_isInitialized:false,
	hasData:false,

	//	chart props
	vectorNode:null,
	plotArea:null,
	dataGroup:null,
	axisGroup:null,

	properties:{
		height:400,	//	defaults, will resize to the domNode.
		width:600,
		plotType:null,
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
		this.parseData();
		this.initialize();
		this.render();
	},
	parseData:function(){
	},
	initialize:function(){
		//	begin by grabbing the table, and reading it in.
		var table=this.domNode.getElementsByTagName("table")[0];
		if (!table) return;

		//	properties off the table
		if (table.getAttribute("width")) this.properties.width=table.getAttribute("width");
		if (table.getAttribute("height")) this.properties.height=table.getAttribute("height");
		if (table.getAttribute("plotType")) this.properties.plotType=table.getAttribute("plotType");
		if (table.getAttribute("padding")){
			if (table.getAttribute("padding").indexOf(",") > -1)
				var p=table.getAttribute("padding").split(","); 
			else var p=table.getAttribute("padding").split(" ");
			if (p.length==1){
				var pad=parseFloat(p[0]);
				this.properties.padding.top=pad;
				this.properties.padding.right=pad;
				this.properties.padding.bottom=pad;
				this.properties.padding.left=pad;
			} else if(p.length==2){
				var padV=parseFloat(p[0]);
				var padH=parseFloat(p[1]);
				this.properties.padding.top=padV;
				this.properties.padding.right=padH;
				this.properties.padding.bottom=padV;
				this.properties.padding.left=padH;
			} else if(p.length==4){
				this.properties.padding.top=parseFloat(p[0]);
				this.properties.padding.right=parseFloat(p[1]);
				this.properties.padding.bottom=parseFloat(p[2]);
				this.properties.padding.left=parseFloat(p[3]);
			}
		}

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
			var color=columns[i].getAttribute("color");
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
		rect.setAttribute("x", this.properties.padding.left);
		rect.setAttribute("y", this.properties.padding.top);
		rect.setAttribute("width", this.properties.width-this.properties.padding.left-this.properties.padding.right);
		rect.setAttribute("height", this.properties.height-this.properties.padding.bottom-this.properties.padding.bottom);
		rect.setAttribute("fill", "#fff");
		this.plotArea.appendChild(rect);

		//	data group
		this.dataGroup = document.createElementNS(dojo.svg.xmlns.svg, "g");
		this.plotArea.appendChild(this.dataGroup);

		//	axis group
		this.axisGroup = document.createElementNS(dojo.svg.xmlns.svg, "g");
		this.plotArea.appendChild(this.axisGroup);

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
		this.axisGroup.appendChild(line);
		
		//	x axis units.
		
		//	y axis
		var line=document.createElementNS(dojo.svg.xmlns.svg, "line");
		var pos=this.properties.axes.y.position;
		var stroke=1;
		if (pos=="left"){
			line.setAttribute("x1", this.properties.padding.left-stroke);
			line.setAttribute("x2", this.properties.padding.left-stroke);
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
		line.setAttribute("style", "stroke:#000;stroke-width:"+stroke+";");
		this.axisGroup.appendChild(line);

		//	y axis units

		this.domNode.appendChild(this.vectorNode);
		dojo.svg.g.resume();

		//	this is last.
		this.assignColors();
		this._isInitialized=true;
	},
	destroy:function(){
		while(this.domNode.childNodes.length>0){
			this.domNode.removeChild(this.domNode.childNodes.item(0));
		}
		this.vectorNode=this.plotArea=this.dataGroup=this.axisGroup=null;
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
	Scatter:"scatter",
	Bubble:"bubble"
};

dojo.widget.svg.Chart.Plotter=new function(){
	var _this=this;
	var plotters = {};
	var types=dojo.widget.svg.Chart.PlotTypes;
	
	this.getX=function(value, chart){
		var v=parseFloat(value);
		var min=chart.properties.axes.x.range.min;
		var max=chart.properties.axes.x.range.max;
		var ofst=0-min;
		min+=ofst; max+=ofst; v+=ofst;

		var xmin=chart.properties.padding.left;
		var xmax=chart.properties.width-chart.properties.padding.right;

		return (
			((xmax-xmin)/max)*v
		)+xmin;
	};
	this.getY=function(value, chart){
		var v=parseFloat(value);
		var max=chart.properties.axes.y.range.max;
		var min=chart.properties.axes.y.range.min;
		var ofst=0;
		if(min<0)ofst+=Math.abs(min);
		min+=ofst; max+=ofst; v+=ofst;
		
		var ymin=chart.properties.height-chart.properties.padding.bottom;
		var ymax=chart.properties.padding.top;
		return (((ymin-ymax)/(max-min))*(max-v))+ymax;
	};

	this.addPlotter=function(name, func){
		plotters[name]=func;
	};
	this.plot=function(series, chart){
		if (series.values.length==0) return;
		if (series.plotType && plotters[series.plotType]){
			return plotters[series.plotType](series, chart);
		}
		else if (chart.plotType && plotters[chart.plotType]){
			return plotters[chart.plotType](series, chart);
		}
//		else {
//			return plotters[types.Bar](series, chart);
//		}
	};

	//	plotting
	plotters[types.Bar]=function(series, chart){
		var space=1;
		for (var i=0; i<series.values.length; i++){
			var x=_this.getX(series.values[i].x, chart);
			var y=_this.getY(series.values[i].value, chart);

			var w;
			if (i==0){
				w=((_this.getX(series.values[i+1].x, chart)-x)/2);
				x=(chart.properties.padding.left+space+1)-(w/2);
			} else if (i==series.values.length-1){
				var lastX = _this.getX(series.values[i-1].x, chart);
				x = (chart.properties.width-chart.properties.padding.right);
				var lastW = x-lastX;
				lastX+=(lastW+space)/2;
				w=x-lastX;
				x-=w;
			} else{
				w=_this.getX(series.values[i+1].x, chart)-x-space;
				x-=(w/2);
			}
			var h=(chart.properties.height-chart.properties.padding.bottom)-y;

			var bar=document.createElementNS(dojo.svg.xmlns.svg, "rect");
			bar.setAttribute("fill", series.color);
			bar.setAttribute("title", series.values[i].x + ": " + series.values[i].value);
			bar.setAttribute("stroke-width", "0");
			bar.setAttribute("x", x);
			bar.setAttribute("y", y);
			bar.setAttribute("width", w);
			bar.setAttribute("height", h);
			bar.setAttribute("fill-opacity", "0.85");
			chart.dataGroup.appendChild(bar);
		}
	};
	plotters[types.Line]=function(series, chart){
		var tension=3;
		var line = document.createElementNS(dojo.svg.xmlns.svg, "path");
		line.setAttribute("fill", "none");
		line.setAttribute("stroke", series.color);
		line.setAttribute("stroke-width", "1.5");
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
				dx=x-_this.getX(series.values[i-1].x, chart);
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
		var r=3;
		for (var i=0; i<series.values.length; i++){
			var point=document.createElementNS(dojo.svg.xmlns.svg, "circle");
			point.setAttribute("r", r);
			point.setAttribute("stroke-width", 0);
			point.setAttribute("fill", series.color);
			point.setAttribute("cx", _this.getX(series.values[i].x, chart));
			point.setAttribute("cy", _this.getY(series.values[i].value, chart));
			point.setAttribute("title", series.values[i].x + ", " + series.values[i].value);
			chart.dataGroup.appendChild(point);
		}
	};
	plotters[types.Bubble]=function(series, chart){
		//	added param for series[n].value: size
		var minR=3;
		for (var i=0; i<series.values.length; i++){
			var point=document.createElementNS(dojo.svg.xmlns.svg, "circle");
			point.setAttribute("stroke-width", 0);
			point.setAttribute("fill", series.color);
			point.setAttribute("r", Math.max(parseFloat(series.values[i].size)/2, minR));
			point.setAttribute("cx", _this.getX(series.values[i].x, chart));
			point.setAttribute("cy", _this.getY(series.values[i].value, chart));
			point.setAttribute("title", series.values[i].x + ", " + series.values[i].value);
			chart.dataGroup.appendChild(point);
		}
	};
}();
