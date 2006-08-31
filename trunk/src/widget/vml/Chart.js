dojo.provide("dojo.widget.vml.Chart");

dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.Chart");
dojo.require("dojo.math");
dojo.require("dojo.html");
//dojo.require("dojo.vml");
dojo.require("dojo.gfx.color");

dojo.widget.defineWidget(
	"dojo.widget.vml.Chart",
	[dojo.widget.HtmlWidget, dojo.widget.Chart],
{
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
				plotAt:0,
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
				plotAt:0,
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
	parseData:function(){
	},
	initialize:function(){
		//	parse the data first.
		this.parseData();

//////////////		
		//	begin by grabbing the table, and reading it in.
		var table=this.domNode.getElementsByTagName("table")[0];
		if (!table) return;
		
		var bRangeX=false;
		var bRangeY=false;
		
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
		if (table.getAttribute("rangeX")){
			var p=table.getAttribute("rangeX");
			if (p.indexOf(",")>-1) p=p.split(",");
			else p=p.split(" ");
			this.properties.axes.x.range.min=parseFloat(p[0]);
			this.properties.axes.x.range.max=parseFloat(p[1]);
			bRangeX=true;
		}
		if (table.getAttribute("rangeY")){
			var p=table.getAttribute("rangeY");
			if (p.indexOf(",")>-1) p=p.split(",");
			else p=p.split(" ");
			this.properties.axes.y.range.min=parseFloat(p[0]);
			this.properties.axes.y.range.max=parseFloat(p[1]);
			bRangeY=true;
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
		var ignore = [
			"accesskey","align","bgcolor","class",
			"colspan","height","id","nowrap",
			"rowspan","style","tabindex","title",
			"valign","width"
		];

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
					var attrs=cells[j].attributes;
					for(var k=0; k<attrs.length; k++){
						var attr=attrs.item(k);
						var bIgnore=false;
						for (var l=0; l<ignore.length; l++){
							if (attr.nodeName.toLowerCase()==ignore[l]){
								bIgnore=true;
								break;
							}
						}
						if(!bIgnore) o[attr.nodeName]=attr.nodeValue;
					}
					ds.add(o);
				}
			}
		}

		//	fix the axes
		if(!bRangeX){
			this.properties.axes.x.range={min:xMin, max:xMax};
		}
		if(!bRangeY){
			this.properties.axes.y.range={min:yMin, max:yMax};
		}

		//	where to plot the axes
		if (table.getAttribute("axisAt")){
			var p=table.getAttribute("axisAt");
			if (p.indexOf(",")>-1) p=p.split(",");
			else p=p.split(" ");
			
			//	x axis
			if (!isNaN(parseFloat(p[0]))){
				this.properties.axes.x.plotAt=parseFloat(p[0]);
			} else if (p[0].toLowerCase()=="ymin"){
				this.properties.axes.x.plotAt=this.properties.axes.y.range.min;
			} else if (p[0].toLowerCase()=="ymax"){
				this.properties.axes.x.plotAt=this.properties.axes.y.range.max;
			}

			// y axis
			if (!isNaN(parseFloat(p[1]))){
				this.properties.axes.y.plotAt=parseFloat(p[1]);
			} else if (p[1].toLowerCase()=="xmin"){
				this.properties.axes.y.plotAt=this.properties.axes.x.range.min;
			} else if (p[1].toLowerCase()=="xmax"){
				this.properties.axes.y.plotAt=this.properties.axes.x.range.max;
			}
		} else {
			this.properties.axes.x.plotAt=this.properties.axes.y.range.min;
			this.properties.axes.y.plotAt=this.properties.axes.x.range.min;
		}

		//	table values should be populated, now pop it off.
		this.domNode.removeChild(table);
///////////


		// render the body of the chart, not the chart data.
		if(this.vectorNode){ this.destroy(); }
		this.vectorNode=document.createElement("div");
		this.vectorNode.style.width=this.properties.width+"px";
		this.vectorNode.style.height=this.properties.height+"px";
		this.vectorNode.style.position="relative";
		this.domNode.appendChild(this.vectorNode);

		var plotWidth=this.properties.width-this.properties.padding.left-this.properties.padding.right;
		var plotHeight=this.properties.height-this.properties.padding.top-this.properties.padding.bottom;

		this.plotArea=document.createElement("div");
		this.plotArea.style.position="absolute";
		this.plotArea.style.backgroundColor="#fff";
		this.plotArea.style.top=(this.properties.padding.top)-2+"px";
		this.plotArea.style.left=(this.properties.padding.left-1)+"px";
		this.plotArea.style.width=plotWidth+"px";
		this.plotArea.style.height=plotHeight+"px";
		this.vectorNode.appendChild(this.plotArea);
		
		this.dataGroup=document.createElement("div");
		this.dataGroup.style.position="absolute";
		this.dataGroup.setAttribute("title", "Data Group");
		this.dataGroup.style.top="0px";
		this.dataGroup.style.left="0px";
		this.dataGroup.style.width=plotWidth+"px";
		this.dataGroup.style.height=plotHeight+"px";
		this.plotArea.appendChild(this.dataGroup);

		this.axisGroup=document.createElement("div");
		this.axisGroup.style.position="absolute";
		this.axisGroup.setAttribute("title", "Axis Group");
		this.axisGroup.style.top="0px";
		this.axisGroup.style.left="0px";
		this.axisGroup.style.width=plotWidth+"px";
		this.axisGroup.style.height=plotHeight+"px";
		this.plotArea.appendChild(this.axisGroup);

		var stroke=1;

		//	x axis
		var line=document.createElement("v:line");
		var y=dojo.widget.vml.Chart.Plotter.getY(this.properties.axes.x.plotAt, this);
		line.setAttribute("from", "0px,"+y+"px");
		line.setAttribute("to", plotWidth+"px,"+y+"px");
		line.style.position="absolute";
		line.style.top="0px";
		line.style.left="0px";
		line.style.antialias="false";
		line.setAttribute("strokecolor", "#666");
		line.setAttribute("strokeweight", stroke*2+"px");
		this.axisGroup.appendChild(line);

		//	y axis
		var line=document.createElement("v:line");
		var x=dojo.widget.vml.Chart.Plotter.getX(this.properties.axes.y.plotAt, this);
		line.setAttribute("from", x+"px,0px");
		line.setAttribute("to", x+"px,"+plotHeight+"px");
		line.style.position="absolute";
		line.style.top="0px";
		line.style.left="0px";
		line.style.antialias="false";
		line.setAttribute("strokecolor", "#666");
		line.setAttribute("strokeweight", stroke*2+"px");
		this.axisGroup.appendChild(line);
		
		//	labels
		var size=10;

		//	x axis labels.
		var t=document.createElement("div");
		t.style.position="absolute";
		t.style.top=(this.properties.height-this.properties.padding.bottom+size+2)+"px";
		t.style.left=this.properties.padding.left+"px";
		t.style.fontFamily="sans-serif";
		t.style.fontSize=size+"px";
		t.innerHTML=dojo.math.round(parseFloat(this.properties.axes.x.range.min),2);
		this.axisGroup.appendChild(t);

		t=document.createElement("div");
		t.style.position="absolute";
		t.style.top=(this.properties.height-this.properties.padding.bottom+size+2)+"px";
		t.style.left=(this.properties.width-this.properties.padding.right-(size/2))+"px";
		t.style.fontFamily="sans-serif";
		t.style.fontSize=size+"px";
		t.innerHTML=dojo.math.round(parseFloat(this.properties.axes.x.range.max),2);
		this.axisGroup.appendChild(t);

		//	y axis labels.
		t=document.createElement("div");
		t.style.position="absolute";
		t.style.top=-1*(size/2)+"px";
		t.style.right=(plotWidth+4)+"px";
		t.style.fontFamily="sans-serif";
		t.style.fontSize=size+"px";
		t.innerHTML=dojo.math.round(parseFloat(this.properties.axes.y.range.max),2);
		this.axisGroup.appendChild(t);
		
		t=document.createElement("div");
		t.style.position="absolute";
		t.style.top=(this.properties.height-this.properties.padding.bottom)+"px";
		t.style.right=(plotWidth+4)+"px";
		t.style.fontFamily="sans-serif";
		t.style.fontSize=size+"px";
		t.innerHTML=dojo.math.round(parseFloat(this.properties.axes.y.range.min),2);
		this.axisGroup.appendChild(t);
		
		//	this is last.
		this.assignColors();
		this._isInitialized=true;
	},
	destroy:function(){
		while(this.domNode.childNodes.length>0){
			this.domNode.removeChild(this.domNode.childNodes[0]);
		}
		this.vectorNode=this.plotArea=this.dataGroup=this.axisGroup=null;
	},
	render:function(){
		if (this.dataGroup){
			while(this.dataGroup.childNodes.length>0){
				this.dataGroup.removeChild(this.dataGroup.childNodes[0]);
			}
		} else {
			this.initialize();
		}
		for(var i=0; i<this.series.length; i++){
			dojo.widget.vml.Chart.Plotter.plot(this.series[i], this);
		}
	}
});

dojo.widget.vml.Chart.Plotter=new function(){
	var _this=this;
	var plotters = {};
	var types=dojo.widget.Chart.PlotTypes;
	
	this.getX=function(value, chart){
		var v=parseFloat(value);
		var min=chart.properties.axes.x.range.min;
		var max=chart.properties.axes.x.range.max;
		var ofst=0-min;
		min+=ofst; max+=ofst; v+=ofst;

		var xmin = 0;
		var xmax=chart.properties.width-chart.properties.padding.left-chart.properties.padding.right;
		var x=(v*((xmax-xmin)/max))+xmin;
		return x;
	};
	this.getY=function(value, chart){
		var v=parseFloat(value);
		var max=chart.properties.axes.y.range.max;
		var min=chart.properties.axes.y.range.min;
		var ofst=0;
		if(min<0)ofst+=Math.abs(min);
		min+=ofst; max+=ofst; v+=ofst;
		
		var ymin=chart.properties.height-chart.properties.padding.top-chart.properties.padding.bottom;
		var ymax = 0;
		var y=(((ymin-ymax)/(max-min))*(max-v))+ymax;
		return y;
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
	};

	//	plotting
	plotters[types.Bar]=function(series, chart){
		var space=1;
		var lastW = 0;
		var ys = [];
		var yAxis=_this.getY(chart.properties.axes.x.plotAt, chart);
		var yA = yAxis;
		for (var i=0; i<series.values.length; i++){
			var x=_this.getX(series.values[i].x, chart);
			var w;
			if (i==series.values.length-1){
				w=lastW;
			} else{
				w=_this.getX(series.values[i+1].x, chart)-x-space;
				lastW=w;
			}
			x-=(w/2);

			var y=_this.getY(series.values[i].value, chart);
			var h=Math.abs(yA-y);
			if (parseFloat(series.values[i].value) < chart.properties.axes.x.plotAt){
				y=yA;
			}

			var bar=document.createElement("v:rect");
			bar.style.position="absolute";
			bar.style.top=y+"px";
			bar.style.left=x+"px";
			bar.style.width=w+"px";
			bar.style.height=h+"px";
			bar.setAttribute("supposedToBe", "top/left/width/height: " 
				+ Math.round(y) + "/"
				+ Math.round(x) + "/"
				+ Math.round(w) + "/"
				+ Math.round(h)
			);
			bar.setAttribute("fillColor", series.color);
			bar.setAttribute("stroked", "false");
			bar.style.antialias="false";
			bar.setAttribute("title", series.label + " (" + i + "): " + series.values[i].value);
		// bar.setAttribute("coordsize", chart.properties.width + "," + chart.properties.height);
			var fill=document.createElement("v:fill");
			fill.setAttribute("opacity", "0.9");
			bar.appendChild(fill);
			chart.dataGroup.appendChild(bar);
		}
	};	
	plotters[types.Line]=function(series, chart){
		var tension=3;

		var line=document.createElement("v:shape");
		line.setAttribute("strokeweight", "2px");
		line.setAttribute("strokecolor", series.color);
		line.setAttribute("fillcolor", "none");
		line.setAttribute("filled", "false");
		line.setAttribute("title", series.label);
		line.setAttribute("coordsize", chart.properties.width + "," + chart.properties.height);
		line.style.position="absolute";
		line.style.top="0px";
		line.style.left="0px";
		line.style.width= chart.properties.width+"px";
		line.style.height=chart.properties.height+"px";
		var stroke=document.createElement("v:stroke");
		stroke.setAttribute("opacity", "0.85");
		line.appendChild(stroke);

		var path = [];
		for (var i=0; i<series.values.length; i++){
			var x = _this.getX(series.values[i].x, chart)
			var y = _this.getY(series.values[i].value, chart);

			if (i==0){
				path.push("m");
				path.push(x+","+y);
			}else{
				var lastx=_this.getX(series.values[i-1].x, chart);
				var lasty=_this.getY(series.values[i-1].value, chart);
				var dx=x-lastx;
				
				path.push("v");
				var cx=x-(tension-1)*(dx/tension);
				path.push(cx+",0");
				cx=x-(dx/tension);
				path.push(cx+","+y-lasty);
				path.push(dx, y-lasty);
			}
		}
		line.setAttribute("path", path.join(" ")+" e");
		chart.dataGroup.appendChild(line);
	};
	plotters[types.Scatter]=function(series, chart){
		var r=8;
		for (var i=0; i<series.values.length; i++){
			var x=_this.getX(series.values[i].x, chart);
			var y=_this.getY(series.values[i].value, chart);
			var mod=r/2;

			var point=document.createElement("v:rect");
			point.setAttribute("fillcolor", series.color);
			point.setAttribute("strokecolor", series.color);
			point.setAttribute("title", series.label + ": " + series.values[i].value);
			point.style.position="absolute";
			point.style.rotation="45";
			point.style.top=(y-mod)+"px";
			point.style.left=(x-mod)+"px";
			point.style.width=r+"px";
			point.style.height=r+"px";
			var fill=document.createElement("v:fill");
			fill.setAttribute("opacity", "0.5");
			point.appendChild(fill);
			chart.dataGroup.appendChild(point);
		}
	};	
	plotters[types.Bubble]=function(series, chart){
		//	added param for series[n].value: size
		var minR=1;
		
		//	do this off the x axis?
		var min=chart.properties.axes.x.range.min;
		var max=chart.properties.axes.x.range.max;
		var ofst=0-min;

		min+=ofst; max+=ofst;
		var xmin=chart.properties.padding.left;
		var xmax=chart.properties.width-chart.properties.padding.right;
		var factor=(max-min)/(xmax-xmin)*25;
		
		for (var i=0; i<series.values.length; i++){
			var size = series.values[i].size;
			if (isNaN(parseFloat(size))) size=minR;
			var mod=(parseFloat(size)*factor)/2;

			var point=document.createElement("v:oval");
			point.setAttribute("strokecolor", series.color);
			point.setAttribute("fillcolor", series.color);
			point.setAttribute("title", series.label + ": " + series.values[i].value + " (" + size + ")");
			point.style.position="absolute";
			point.style.top=(_this.getY(series.values[i].value, chart)-mod) + "px";
			point.style.left=(_this.getX(series.values[i].x, chart)-mod) + "px";
			point.style.width=mod+"px";
			point.style.height=mod+"px";
			chart.dataGroup.appendChild(point);
		}
	};
}();
