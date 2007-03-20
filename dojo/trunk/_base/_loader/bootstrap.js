// TODOC: HOW TO DOC THE BELOW?
// @global: djConfig
// summary:
//		Application code can set the global 'djConfig' prior to loading
//		the library to override certain global settings for how dojo works.
// description:  The variables that can be set are as follows:
//			- isDebug: false
//			- baseScriptUri: ""
//			- baseRelativePath: ""
//			- libraryScriptUri: ""
//			- locale: undefined
//			- extraLocale: undefined
//			- preventBackButtonFix: true
// note:
//		'djConfig' does not exist under 'dojo.*' so that it can be set before the
//		'dojo' variable exists.
// note:
//		Setting any of these variables *after* the library has loaded does
//		nothing at all.


(function(){
	// make sure djConfig is defined
	if(typeof this["djConfig"] == "undefined"){
		this.djConfig = {};
	}

	// firebug stubs
	if(!this["console"]){
		this.console = {};
	}
	var cn = [
		"assert", "count", "debug", "dir", "dirxml", "error", "group",
		"groupEnd", "info", "log", "profile", "profileEnd", "time",
		"timeEnd", "trace", "warn"
	];
	var i=0, tn;
	while(tn=cn[i++]){
		if(!console[tn]){
			console[tn] = function(){};
		}
	}

	//TODOC:  HOW TO DOC THIS?
	// dojo is the root variable of (almost all) our public symbols -- make sure it is defined.
	if(typeof this["dojo"] == "undefined"){
		this.dojo = {};
	}

	dojo._currentContext = this;

	dojo.global = function(){
		// summary:
		//		return the current global context object
		//		(e.g., the window object in a browser).
		// description:
		//		Refer to 'dojo.global()' rather than referring to window to ensure your
		//		code runs correctly in contexts other than web browsers (eg: Rhino on a server).
		return this._currentContext;
	}

	var _config = {
		isDebug: false,
		allowQueryConfig: false,
		baseScriptUri: "",
		baseRelativePath: "",
		libraryScriptUri: "",
		preventBackButtonFix: true,
		delayMozLoadingFix: false
	};

	for(var option in _config){
		if(typeof djConfig[option] == "undefined"){
			djConfig[option] = _config[option];
		}
	}

	var _platforms = ["Browser", "Rhino", "Spidermonkey", "Mobile"];
	var t;
	while(t=_platforms.shift()){
		dojo["is"+t] = false;
	}
})();


// Override locale setting, if specified
dojo.locale = djConfig.locale;

dojo._baseUrl = "./";

//TODOC:  HOW TO DOC THIS?
dojo.version = {
	// summary: version number of this instance of dojo.
	major: 0, minor: 9, patch: 0, flag: "preM1",
	revision: Number("$Rev$".match(/[0-9]+/)[0]),
	toString: function(){
		with(dojo.version){
			return major + "." + minor + "." + patch + flag + " (" + revision + ")";	// String
		}
	}
}

dojo.getObject = function(/*String*/name, /*Boolean*/create, /*Object*/obj){
	// summary: 
	//		gets an object from a dot-separated string, such as "A.B.C"
	//	description: 
	//		useful for longer api chains where you have to test each object in
	//		the chain
	//	name: 	
	//		Path to an object, in the form "A.B.C".
	//	obj:
	//		Optional. Object to use as root of path. Defaults to
	//		'dojo.global()'. Null may be passed.
	//	create: 
	//		Optional. If true, Objects will be created at any point along the
	//		'path' that is undefined.
	var tprop, tobj = obj||dojo.global();
	var parts=name.split("."), i=0, lobj, tmp, tname;
	do{
		lobj = tobj;
		tname = parts[i];
		tmp = tobj[parts[i]];
		if((create)&&(!tmp)){
			tmp = tobj[parts[i]] = {};
		}
		tobj = tmp;
		i++;
	}while(i<parts.length && tobj);
	return tobj; // Object
}

dojo.exists = function(/*String*/name, /*Object*/obj){
	// summary: 
	//		determine if an object supports a given method
	// description: 
	//		useful for longer api chains where you have to test each object in
	//		the chain
	// name: 	
	//		Path to an object, in the form "A.B.C".
	// obj:
	//		Optional. Object to use as root of path. Defaults to
	//		'dojo.global()'. Null may be passed.
	return (!!dojo.getObject(name, false, obj)); // Boolean
}

dojo["eval"] = function(/*String*/ scriptFragment){
	// summary: 
	//		Perform an evaluation in the global scope.  Use this rather than
	//		calling 'eval()' directly.
	// description: 
	//		Placed in a separate function to minimize size of trapped
	//		evaluation context.
	// note:
	//	 - JSC eval() takes an optional second argument which can be 'unsafe'.
	//	 - Mozilla/SpiderMonkey eval() takes an optional second argument which is the
	//  	 scope object for new symbols.

	// FIXME: investigate Joseph Smarr's technique for IE:
	//		http://josephsmarr.com/2007/01/31/fixing-eval-to-use-global-scope-in-ie/
	//	see also:
	// 		http://trac.dojotoolkit.org/ticket/744
	return dojo.global().eval ? dojo.global().eval(scriptFragment) : eval(scriptFragment); 	// mixed
}

dojo.deprecated = function(/*String*/ behaviour, /*String?*/ extra, /*String?*/ removal){
	// summary: 
	//		Log a debug message to indicate that a behavior has been
	//		deprecated.
	// extra: Text to append to the message.
	// removal: 
	//		Text to indicate when in the future the behavior will be removed.
	var message = "DEPRECATED: " + behaviour;
	if(extra){ message += " " + extra; }
	if(removal){ message += " -- will be removed in version: " + removal; }
	console.debug(message);
}

dojo.experimental = function(/* String */ moduleName, /* String? */ extra){
	// summary: Marks code as experimental.
	// description: 
	//		This can be used to mark a function, file, or module as
	//		experimental.  Experimental code is not ready to be used, and the
	//		APIs are subject to change without notice.  Experimental code may be
	//		completed deleted without going through the normal deprecation
	//		process.
	// moduleName: 
	//		The name of a module, or the name of a module file or a specific
	//		function
	// extra: 
	//		some additional message for the user
	// examples:
	//		dojo.experimental("dojo.data.Result");
	//		dojo.experimental("dojo.weather.toKelvin()", "PENDING approval from NOAA");
	var message = "EXPERIMENTAL: " + moduleName;
	message += " -- Not yet ready for use.  APIs subject to change without notice.";
	if(extra){ message += " " + extra; }
	console.debug(message);
}

dojo._getText = function(/*String*/ uri){
	//	summary:	
	//		Read the plain/text contents at the specified 'uri'.
	//	description:
	//		If 'getText()' is not implemented, then it is necessary to
	//		override 'loadUri()' with an implementation that doesn't
	//		rely on it.

	// NOTE: platform specializations need to implement this
}

// vim:ai:ts=4:noet:textwidth=80
