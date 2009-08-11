dojo.provide("dojox.charting.axis2d.Base");

dojo.require("dojox.axis2d.common");
dojo.require("dojox.charting.Element");

dojo.required("dojox.charting.Element", function() {

dojo.declare("dojox.charting.axis2d.Base", dojox.charting.Element, {
	constructor: function(chart, kwArgs){
		this.vertical = kwArgs && kwArgs.vertical;
	},
	clear: function(){
		return this;
	},
	initialized: function(){
		return false;
	},
	calculate: function(min, max, span){
		return this;
	},
	getScaler: function(){
		return null;
	},
	getTicks: function(){
		return null;
	},
	getOffsets: function(){
		return {l: 0, r: 0, t: 0, b: 0};
	},
	render: function(dim, offsets){
		return this;
	}
});

dojo.provided("dojox.charting.axis2d.Base");

});