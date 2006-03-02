dojo.provide("dojo.widget.vml.Chart");

dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.Chart");
dojo.require("dojo.math");
dojo.require("dojo.html");
//dojo.require("dojo.vml");
dojo.require("dojo.graphics.color");

dojo.widget.vml.Chart=function(){
	dojo.widget.Chart.call(this);
	dojo.widget.HtmlWidget.call(this);
};
dojo.inherits(dojo.widget.vml.Chart, dojo.widget.HtmlWidget);
dojo.lang.extend(dojo.widget.vml.Chart, {
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
		this.parseData();
		this.initialize();
		this.render();
	},
	parseData:function(){
	},
	initialize:function(){
	},
	destroy:function(){
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

		var xmin=chart.properties.padding.left;
		var xmax=chart.properties.width-chart.properties.padding.right;
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
		
		var ymin=chart.properties.height-chart.properties.padding.bottom;
		var ymax=chart.properties.padding.top;
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
	};	
	plotters[types.Line]=function(series, chart){
	};
	plotters[types.Scatter]=function(series, chart){
	};	
	plotters[types.Bubble]=function(series, chart){
	};
}();
