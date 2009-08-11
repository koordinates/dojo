dojo.provide("dojox.charting.plot2d.Areas");

dojo.require("dojox.charting.plot2d.Default");

dojo.required("dojox.charting.plot2d.Default", function() {

	dojo.declare("dojox.charting.plot2d.Areas", dojox.charting.plot2d.Default, {
		constructor: function(){
			this.opt.lines = true;
			this.opt.areas = true;
		}
	});

});