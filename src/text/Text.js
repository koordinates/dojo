// hostenv.loadModule("dojo.alg.*");
dojo.hostenv.startPackage("dojo.text.Text");

dojo.text = new function(){
	this.trim = function(iString){
		if(!iString){ // allow String.prototyp-ing
			iString = this; 
		}
		if(typeof iString != "string"){ return iString; }
		if(!iString.length){ return iString; }
		return iString.replace(/^\s*/, "").replace(/\s*$/, "");
	}

	// Parameterized string function
	//  str - formatted string with %{values} to be replaces
	//  pairs - object of name: "value" value pairs
	//  killExtra - remove all remaining %{values} after pairs are inserted
	this.paramString = function(str, pairs, killExtra) {
		if(typeof str != "string") { // allow String.prototype-ing
			pairs = str;
			str = this;
		}

		for(var name in pairs) {
			var re = new RegExp("\\%\\{" + name + "\\}", "g");
			str = str.replace(re, pairs[name]);
		}

		if(killExtra) {
			str = str.replace(/%\{([^\}\s]+)\}/g, "");
		}

		return str;
	}
}

dojo.text.Text = {}; // duh, alex.
