dojo.hostenv.loadModule("dojo.xml.Parse");
dojo.hostenv.loadModule("dojo.xml.domUtil");
dojo.hostenv.conditionalLoadModule({
    browser: 	["dojo.xml.htmlUtil"],
    svg: 		["dojo.xml.svgUtil"]
});
