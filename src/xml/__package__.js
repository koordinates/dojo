dojo.hostenv.loadModule("dojo.xml.Parse");
dojo.hostenv.conditionalLoadModule({
	common:		["dojo.xml.domUtil"],
    browser: 	["dojo.xml.htmlUtil"],
    svg: 		["dojo.xml.svgUtil"]
});
