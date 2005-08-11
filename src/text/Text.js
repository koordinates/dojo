dojo.provide("dojo.text.Text");

dojo.text = {
	trim: function(iString){
		if(arguments.length == 0){ // allow String.prototyp-ing
			iString = this; 
		}
		if(typeof iString != "string"){ return iString; }
		if(!iString.length){ return iString; }
		return iString.replace(/^\s*/, "").replace(/\s*$/, "");
	},

	// Parameterized string function
	//  str - formatted string with %{values} to be replaces
	//  pairs - object of name: "value" value pairs
	//  killExtra - remove all remaining %{values} after pairs are inserted
	paramString: function(str, pairs, killExtra) {
		if(typeof str != "string") { // allow String.prototype-ing
			pairs = str;
			str = this;
		}

		for(var name in pairs) {
			var re = new RegExp("\\%\\{" + name + "\\}", "g");
			str = str.replace(re, pairs[name]);
		}

		if(killExtra) { str = str.replace(/%\{([^\}\s]+)\}/g, ""); }
		return str;
	},
	
	/** Uppercases the first letter of each word */
	toCapitalized: function (string) {
		if (arguments.length == 0) { string = this; }
		// TODO: implement
		return new String(string);
	}
}

/*
 * We need to make sure that the dojo.text.Text Object exists, the
 * above assignment causes it to be clobbered so we redefine it here.
 */
dojo.text.Text = {};
