dojo.require("dojo.gfx.m2d");
dojo.provide("dojo.gfx.*");

dojo.requireIf(dojo.render.svg.capable, "dojo.gfx.svg");
dojo.requireIf(!dojo.render.svg.capable && dojo.render.vml.capable, "dojo.gfx.vml");

dojo.require("dojo.experimental");
dojo.experimental("dojo.gfx.*");

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
