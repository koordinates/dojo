dojo.hostenv.conditionalLoadModule({
	common: ["dojo.io.IO", false, true],
	rhino: ["dojo.io.RhinoIO", false, true],
	browser: ["dojo.io.BrowserIO", false, true]
});
