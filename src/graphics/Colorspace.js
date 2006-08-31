dojo.provide("dojo.graphics.Colorspace");
dojo.require("dojo.gfx.Colorspace");

dojo.deprecated("dojo.graphics.Colorspace: use dojo.gfx.Colorspace instead.", "0.5");

dojo.graphics.Colorspace = function(){
	dojo.gfx.Colorspace.apply(this, arguments);
};
