dojo.provide("dojo.widget.charting.engine.Axis");
dojo.require("dojo.lang.common");

dojo.widget.charting.engine.Axis = function(/* string? */label, /* string? */scale, /* array? */labels){
	var id = "dojo-charting-axis-"+dojo.widget.charting.engine.Axis.count++;
	this.getId=function(){ return id; };
	this.setId=function(key){ id = key; };
	this.scale = scale || "linear";		//	linear || log
	this.label = label || "";
	this.showLabel = true;		//	show axis label.
	this.showLabels = true;		//	show interval ticks.
	this.showLines = false;		//	if you want lines over the range of the plot area
	this.showTicks = false;		//	if you want tick marks on the axis.
	this.range = { upper : 0, lower : 0 };	//	range of individual axis.
	this.origin = "min"; 			//	this can be any number, "min" or "max". min/max is translated on init.

	this.labels = labels || [];
	this._labels = [];	//	what we really use to draw things.
	this.nodes={ main: null, axis: null, label: null, labels: null, lines: null, ticks: null };
};
dojo.widget.charting.engine.Axis.count = 0;

dojo.extend(dojo.widget.charting.engine.Axis, {
	//	TODO: implement log scaling.
	getCoord: function(
		/* float */val, 
		/* dojo.widget.charting.engine.PlotArea */plotArea, 
		/* dojo.widget.charting.engine.Plot */plot
	){
		//	summary
		//	returns the coordinate of val based on this axis range, plot area and plot.
		val = parseFloat(val, 10);
		var area = plotArea.getArea();
		if(plot.axisX == this){
			var offset = 0 - this.range.lower;
			var min = this.range.lower + offset;	//	FIXME: check this.
			var max = this.range.upper + offset;
			val += offset;
			return (val*((area.right-area.left)/max))+area.left;	//	float
		} else {
			var max = this.range.upper;
			var min = this.range.lower;
			var offset = 0;
			if(min<0){
				offset += Math.abs(min);
			}
			max += offset; min += offset; val += offset;
			var pmin = area.bottom;
			var pmax = area.top;
			return (((pmin-pmax)/(max-min))*(max-val))+pmax;
		}
	},
	initializeOrigin: function(drawAgainst, plane){
		//	figure out the origin value.
		if(isNaN(this.origin)){
			if(this.origin.toLowerCase() == "max"){ 
				this.origin = drawAgainst.range[(plane=="y")?"upper":"lower"]; 
			}
			else if (this.origin.toLowerCase() == "min"){ 
				this.origin = drawAgainst.range[(plane=="y")?"lower":"upper"]; 
			}
			else { this.origin=0; }
		}
	},
	initializeLabels: function(){
		//	Translate the labels if needed.
		if(this.labels.length == 0){
			this.showLabels = false;
			this.showLines = false;
			this.showTicks = false;
		} else {
			if(this.labels[0].label && this.labels[0].value != null){
				for(var i=0; i<this.labels.length; i++){
					this._labels.push(this.labels[i]);
				}
			}
			else if(!isNaN(this.labels[0])){
				for(var i=0; i<this.labels.length; i++){
					this._labels.push({ label: this.labels[i], value: this.labels[i] });
				}
			}
			else {
				// clone me
				var a = [];
				for(var i=0; i<this.labels.length; i++){
					a.push(this.labels[i]);
				}

				//	do the bottom one.
				var s=a.shift();
				this._labels.push({ label: s, value: this.range.lower });

				//	do the top one.
				if(a.length>0){
					var s=a.pop();
					this._labels.push({ label: s, value: this.range.upper });
				}
				//	do the rest.
				if(a.length>0){
					var range = this.range.upper - this.range.lower;
					var step = range / (this.labels.length-1);
					for(var i=1; i<=a.length; i++){
						this._labels.push({
							label: a[i-1],
							value: this.range.lower+(step*i)
						});
					}
				}
			}
		}
	},
	initialize: function(plotArea, plot, drawAgainst, plane){
		//	summary
		//	Initialize the passed axis descriptor.  Note that this should always
		//	be the result of plotArea.getAxes, and not the axis directly!
		this.destroy();
		this.initializeOrigin(drawAgainst, plane);
		this.initializeLabels();
		var node = this.render(plotArea, plot, drawAgainst, plane);
		return node;
	},
	destroy: function(){
		for(var p in this.nodes){
			while(this.nodes[p] && this.nodes[p].childNodes.length > 0){
				this.nodes[p].removeChild(this.nodes[p].childNodes[0]);
			}
			if(this.nodes[p] && this.nodes[p].parentNode){
				this.nodes[p].parentNode.removeChild(this.nodes[p]);
			}
			this.nodes[p] = null;
		}
	}
});

dojo["requireIf"](dojo.render.svg.capable, "dojo.widget.charting.engine.svg.Axis");
dojo["requireIf"](!dojo.render.svg.capable && dojo.render.vml.capable, "dojo.widget.charting.engine.vml.Axis");
