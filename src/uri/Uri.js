dojo.hostenv.startPackage("dojo.uri");

dojo.uri = new function() {
	this.joinPath = function() {
		var arr = [];
		for(var i = 0; i < arguments.length; i++) { arr.push(arguments[i]); }
		return arr.join("/").replace(/\/\//g, "/");
	}
}

dojo.hostenv.startPackage("dojo.uri.Uri");
