dojo.require("dojo.gfx.m2d");
dojo.provide("dojo.gfx.*");

dojo.require("dojo.experimental");
dojo.experimental("dojo.gfx.*");

dojo.gfx.defaultRenderer = null;

if (dojo.render.svg.capable) {
   dojo.require("dojo.gfx.svg");
   dojo.gfx.defaultRenderer = dojo.gfx.svg;
   dojo.gfx.Gradient = dojo.gfx.svg.Gradient;
   dojo.gfx.LinearGradient = dojo.gfx.svg.LinearGradient;
   dojo.gfx.RadialGradient = dojo.gfx.svg.RadialGradient;
   dojo.gfx.Pattern = dojo.gfx.svg.Pattern;
   dojo.gfx.attachNode = dojo.gfx.svg.attachNode;
} else if (dojo.render.vml.capable) {
   dojo.require("dojo.gfx.vml");
   dojo.gfx.defaultRenderer = dojo.gfx.vml;
   dojo.gfx.Gradient = dojo.gfx.vml.Gradient;
   dojo.gfx.LinearGradient = dojo.gfx.vml.LinearGradient;
   dojo.gfx.RadialGradient = dojo.gfx.vml.RadialGradient;
   dojo.gfx.Pattern = dojo.gfx.vml.Pattern;
   dojo.gfx.attachNode = dojo.gfx.vml.attachNode;
} 
dojo.gfx.defaultRenderer.init();

dojo.gfx.normalizeParameters = function (existed, update) {
    if(update) {
        for(x in existed) {
            if(x in update) {
                existed[x] = update[x];
            }
        }
    }
    return existed;
}

dojo.gfx.GUID = 1;
dojo.gfx.guid = function(){
    return dojo.gfx.GUID++;
};
