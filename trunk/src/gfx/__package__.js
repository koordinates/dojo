dojo.kwCompoundRequire({
	common: [
		"dojo.gfx.color",
		"dojo.gfx.m2d",
		"dojo.gfx.common"
	]
});

// include a renderer conditionally
dojo["requireIf"](dojo.render.svg.capable, "dojo.gfx.svg");
dojo["requireIf"](!dojo.render.svg.capable && dojo.render.vml.capable, "dojo.gfx.vml");

dojo.provide("dojo.gfx.*");