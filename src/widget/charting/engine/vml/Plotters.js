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
		return document.createElement("div");
	},
	Area: function(
		/* array */data, 
		/* dojo.widget.charting.engine.PlotArea */plotarea,
		/* dojo.widget.charting.engine.Plot */plot,
		/* function? */applyTo
	){
		return document.createElement("div");
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
