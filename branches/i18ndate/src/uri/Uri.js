dojo.provide("dojo.uri.Uri");

dojo.uri = new function() {
	this.dojoUri = function (uri) {
		// returns a Uri object resolved relative to the dojo root
		return new dojo.uri.Uri(dojo.hostenv.getBaseScriptUri(), uri);
	}
	
	// returns a Uri object relative to a (top-level) module
	// for example dojo.uri.moduleUri("dojo","Editor"), or dojo.uri.moduleUri("acme","someWidget")
	this.moduleUri = function(module, uri){
		var loc = dojo.hostenv.getModulePrefix(module);
		if(!loc){return null;}
		if(loc.lastIndexOf("/") != loc.length-1){loc += "/";}
		return new dojo.uri.Uri(dojo.hostenv.getBaseScriptUri()+loc,uri);
	}

	this.Uri = function (/*uri1, uri2, [...]*/) {
		// An object representing a Uri.
		// Each argument is evaluated in order relative to the next until
		// a conanical uri is producued. To get an absolute Uri relative
		// to the current document use
		//      new dojo.uri.Uri(document.baseURI, uri)

		// TODO: support for IPv6, see RFC 2732

		// resolve uri components relative to each other
		var uri = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			if(!arguments[i]) { continue; }

			// Safari doesn't support this.constructor so we have to be explicit
			var relobj = new dojo.uri.Uri(arguments[i].toString());
			var uriobj = new dojo.uri.Uri(uri.toString());
			
			if (relobj.path == "" && relobj.scheme == null &&
				relobj.authority == null && relobj.query == null) {
				if (relobj.fragment != null) { uriobj.fragment = relobj.fragment; }
				relobj = uriobj;
			}
			
			if (relobj.scheme != null && relobj.authority != null)
				uri = "";
			if (relobj.scheme != null) { uri += relobj.scheme + ":"; }
			if (relobj.authority != null) { uri += "//" + relobj.authority; }
			uri += relobj.path;
			if (relobj.query != null) { uri += "?" + relobj.query; }
			if (relobj.fragment != null) { uri += "#" + relobj.fragment; }
		}
		
		this.uri = uri.toString();

		// break the uri into its main components
		var regexp = "^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$";
	    var r = this.uri.match(new RegExp(regexp));

		this.scheme = r[2] || (r[1] ? "" : null);
		this.authority = r[4] || (r[3] ? "" : null);
		this.path = r[5]; // can never be undefined
		this.query = r[7] || (r[6] ? "" : null);
		this.fragment  = r[9] || (r[8] ? "" : null);
		
		if (this.authority != null) {
			// server based naming authority
			regexp = "^((([^:]+:)?([^@]+))@)?([^:]*)(:([0-9]+))?$";
			r = this.authority.match(new RegExp(regexp));
			
			this.user = r[3] || null;
			this.password = r[4] || null;
			this.host = r[5];
			this.port = r[7] || null;
		}
	
		this.toString = function(){ return this.uri; }
	}
};
