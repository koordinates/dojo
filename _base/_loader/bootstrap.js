/*=====
djConfig = {
	// summary:
	//		Application code can set the global 'djConfig' prior to loading
	//		the library to override certain global settings for how dojo works.
	// description:  The variables that can be set are as follows:
	//			- isDebug: false
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
}
=====*/

(function(){
	// firebug stubs
	if((!this["console"])||(!console["firebug"])){
		this.console = {};
	}

	var cn = [
		"assert", "count", "debug", "dir", "dirxml", "error", "group",
		"groupEnd", "info", "log", "profile", "profileEnd", "time",
		"timeEnd", "trace", "warn"
	];
	var i=0, tn;
	while((tn=cn[i++])){
		if(!console[tn]){
			console[tn] = function(){};
		}
	}

	//TODOC:  HOW TO DOC THIS?
	// dojo is the root variable of (almost all) our public symbols -- make sure it is defined.
	if(typeof dojo == "undefined"){
		this.dojo = {
			_scopeName: "dojo",
			_scopePrefix: "",
			_scopePrefixArgs: "",
			_scopeSuffix: "",
			_scopeMap: {},
			_scopeMapRev: {}
		};
	}

	var d = dojo;

	//Need placeholders for dijit and dojox for scoping code.
	if(typeof dijit == "undefined"){
		this.dijit = {_scopeName: "dijit"};
	}
	if(typeof dojox == "undefined"){
		this.dojox = {_scopeName: "dojox"};
	}
	
	if(!d._scopeArgs){
		d._scopeArgs = [dojo, dijit, dojox];
	}

/*=====
dojo.global = {
	//	summary:
	//		Alias for the global scope
	//		(e.g. the window object in a browser).
	//	description:
	//		Refer to 'dojo.global' rather than referring to window to ensure your
	//		code runs correctly in contexts other than web browsers (e.g. Rhino on a server).
}
=====*/
	d.global = this;

	d.config =/*===== djConfig = =====*/{
		isDebug: false,
		libraryScriptUri: "",
		preventBackButtonFix: true,
		delayMozLoadingFix: false
	};

	if(typeof djConfig != "undefined"){
		for(var opt in djConfig){
			d.config[opt] = djConfig[opt];
		}
	}

	var _platforms = ["Browser", "Rhino", "Spidermonkey", "Mobile"];
	var t;
	while((t=_platforms.shift())){
		d["is"+t] = false;
	}

/*=====
	// Override locale setting, if specified
	dojo.locale = {
		// summary: the locale as defined by Dojo (read-only)
	};
=====*/
	dojo.locale = d.config.locale;
	
	var rev = "$Rev$".match(/\d+/);

	dojo.version = {
		// summary: 
		//		version number of dojo
		//	major: Integer
		//		Major version. If total version is "1.2.0beta1", will be 1
		//	minor: Integer
		//		Minor version. If total version is "1.2.0beta1", will be 2
		//	patch: Integer
		//		Patch version. If total version is "1.2.0beta1", will be 0
		//	flag: String
		//		Descriptor flag. If total version is "1.2.0beta1", will be "beta1"
		//	revision: Number
		//		The SVN rev from which dojo was pulled
		major: 1, minor: 1, patch: 0, flag: "dev",
		revision: rev ? Number(rev[0]) : 999999,
		toString: function(){
			with(d.version){
				return major + "." + minor + "." + patch + flag + " (" + revision + ")";	// String
			}
		}
	}

	// Register with the OpenAjax hub
	if(typeof OpenAjax != "undefined"){
		OpenAjax.hub.registerLibrary(dojo._scopeName, "http://dojotoolkit.org", d.version.toString());
	}

	dojo._mixin = function(/*Object*/ obj, /*Object*/ props){
		// summary:
		//		Adds all properties and methods of props to obj. This addition
		//		is "prototype extension safe", so that instances of objects
		//		will not pass along prototype defaults.
		var tobj = {};
		for(var x in props){
			// the "tobj" condition avoid copying properties in "props"
			// inherited from Object.prototype.  For example, if obj has a custom
			// toString() method, don't overwrite it with the toString() method
			// that props inherited from Object.prototype
			if(tobj[x] === undefined || tobj[x] != props[x]){
				obj[x] = props[x];
			}
		}
		// IE doesn't recognize custom toStrings in for..in
		if(d["isIE"] && props){
			var p = props.toString;
			if(typeof p == "function" && p != obj.toString && p != tobj.toString &&
				p != "\nfunction toString() {\n    [native code]\n}\n"){
					obj.toString = props.toString;
			}
		}
		return obj; // Object
	}

	dojo.mixin = function(/*Object*/obj, /*Object...*/props){
		// summary:	
		//		Adds all properties and methods of props to obj and returns the
		//		(now modified) obj.
		//	description:
		//		`dojo.mixin` can mix multiple source objects into a
		//		destionation object which is then returned. Unlike regular
		//		`for...in` iteration, `dojo.mixin` is also smart about avoiding
		//		extensions which other toolkits may unwisely add to the root
		//		object prototype
		//	obj:
		//		The object to mix properties into. Also the return value.
		//	props:
		//		One or more objects whose values are successively copied into
		//		obj. If more than one of these objects contain the same value,
		//		the one specified last in the function call will "win".
		//	example:
		//		make a shallow copy of an object
		//	|	var copy = dojo.mixin({}, source);
		//	example:
		//		many class constructors often take an object which specifies
		//		values to be configured on the object. In this case, it is
		//		often simplest to call `dojo.mixin` on the `this` object:
		//	|	dojo.declare("acme.Base", null, {
		//	|		constructor: function(properties){
		//	|			// property configuration:
		//	|			dojo.mixin(this, properties);
		//	|	
		//	|			console.debug(this.quip);
		//	|			//  ...
		//	|		},
		//	|		quip: "I wasn't born yesterday, you know - I've seen movies.",
		//	|		// ...
		//	|	});
		//	|
		//	|	// create an instance of the class and configure it
		//	|	var b = new acme.Base({quip: "That's what it does!" });
		//	example:
		//		copy in properties from multiple objects
		//	|	var flattened = dojo.mixin(
		//	|		{
		//	|			name: "Frylock",
		//	|			braces: true,
		//	|		}
		//	|		{
		//	|			name: "Carl Brutanananadilewski"
		//	|		}
		//	|	);
		//	|	
		//	|	// will print "Carl Brutanananadilewski"
		//	|	console.debug(flattened.name);
		//	|	// will print "true"
		//	|	console.debug(flattened.braces);
		for(var i=1, l=arguments.length; i<l; i++){
			d._mixin(obj, arguments[i]);
		}
		return obj; // Object
	}

	dojo._getProp = function(/*Array*/parts, /*Boolean*/create, /*Object*/context){
		var obj=context||d.global;
		for(var i=0, p; obj&&(p=parts[i]); i++){
			if(i == 0 && this._scopeMap[p]){
				p = this._scopeMap[p];
			}
			obj = (p in obj ? obj[p] : (create ? obj[p]={} : undefined));
		}
		return obj; // mixed
	}

	dojo.setObject = function(/*String*/name, /*Object*/value, /*Object?*/context){
		// summary: 
		//		Set a property from a dot-separated string, such as "A.B.C"
		//	description: 
		//		Useful for longer api chains where you have to test each object in
		//		the chain, or when you have an object reference in string format.
		//		Objects are created as needed along `path`. Returns the passed
		//		value if setting is successful or `undefined` if not.
		//	name: 	
		//		Path to a property, in the form "A.B.C".
		//	context:
		//		Optional. Object to use as root of path. Defaults to
		//		`dojo.global`.
		//	example:
		//		set the value of `foo.bar.baz`, regardless of whether
		//		intermediate objects already exist:
		//	|	dojo.setObject("foo.bar.baz", value);
		//	example:
		//		without `dojo.setObject`, we often see code like this:
		//	|	// ensure that intermediate objects are available
		//	|	if(!obj["parent"]){ obj.parent = {}; }
		//	|	if(!obj.parent["child"]){ obj.parent.child= {}; }
		//	|	// now we can safely set the property
		//	|	obj.parent.child.prop = "some value";
		//		wheras with `dojo.setObject`, we can shorten that to:
		//	|	dojo.setObject("parent.child.prop", "some value", obj);
		var parts=name.split("."), p=parts.pop(), obj=d._getProp(parts, true, context);
		return (obj && p ? (obj[p]=value) : undefined); // Object
	}

	dojo.getObject = function(/*String*/name, /*Boolean*/create, /*Object*/context){
		// summary: 
		//		Get a property from a dot-separated string, such as "A.B.C"
		//	description: 
		//		Useful for longer api chains where you have to test each object in
		//		the chain, or when you have an object reference in string format.
		//	name: 	
		//		Path to an property, in the form "A.B.C".
		//	context:
		//		Optional. Object to use as root of path. Defaults to
		//		'dojo.global'. Null may be passed.
		//	create: 
		//		Optional. Defaults to `false`. If `true`, Objects will be
		//		created at any point along the 'path' that is undefined.
		return d._getProp(name.split("."), create, context); // Object
	}

	dojo.exists = function(/*String*/name, /*Object?*/obj){
		//	summary: 
		//		determine if an object supports a given method
		//	description: 
		//		useful for longer api chains where you have to test each object in
		//		the chain
		//	name: 	
		//		Path to an object, in the form "A.B.C".
		//	obj:
		//		Object to use as root of path. Defaults to
		//		'dojo.global'. Null may be passed.
		//	example:
		//	|	// define an object
		//	|	var foo = {
		//	|		bar: { }
		//	|	};
		//	|
		//	|	// search the global scope
		//	|	dojo.exists("foo.bar"); // true
		//	|	dojo.exists("foo.bar.baz"); // false
		//	|
		//	|	// search from a particular scope
		//	|	dojo.exists("bar", foo); // true
		//	|	dojo.exists("bar.baz", foo); // false
		return !!d.getObject(name, false, obj); // Boolean
	}


	dojo["eval"] = function(/*String*/ scriptFragment){
		//	summary: 
		//		Perform an evaluation in the global scope. Use this rather than
		//		calling 'eval()' directly.
		//	description: 
		//		Placed in a separate function to minimize size of trapped
		//		exceptions. Calling eval() directly from some other scope may
		//		complicate tracebacks on some platforms.
		//	return:
		//		The result of the evaluation. Often `undefined`


		// note:
		//	 - JSC eval() takes an optional second argument which can be 'unsafe'.
		//	 - Mozilla/SpiderMonkey eval() takes an optional second argument which is the
		//  	 scope object for new symbols.

		// FIXME: investigate Joseph Smarr's technique for IE:
		//		http://josephsmarr.com/2007/01/31/fixing-eval-to-use-global-scope-in-ie/
		//	see also:
		// 		http://trac.dojotoolkit.org/ticket/744
		return d.global.eval ? d.global.eval(scriptFragment) : eval(scriptFragment); 	// Object
	}

	/*=====
		dojo.deprecated = function(behaviour, extra, removal){
			//	summary: 
			//		Log a debug message to indicate that a behavior has been
			//		deprecated.
			//	behaviour: String
			//		The API or behavior being deprecated. Usually in the form
			//		of "myApp.someFunction()".
			//	extra: String?
			//		Text to append to the message. Often provides advice on a
			//		new function or facility to achieve the same goal during
			//		the deprecation period.
			//	removal: String?
			//		Text to indicate when in the future the behavior will be
			//		removed. Usually a version number.
			//	example:
			//	|	dojo.deprecated("myApp.getTemp()", "use myApp.getLocaleTemp() instead", "1.0");
		}

		dojo.experimental = function(moduleName, extra){
			//	summary: Marks code as experimental.
			//	description: 
			//	 	This can be used to mark a function, file, or module as
			//	 	experimental.  Experimental code is not ready to be used, and the
			//	 	APIs are subject to change without notice.  Experimental code may be
			//	 	completed deleted without going through the normal deprecation
			//	 	process.
			//	moduleName: String
			//	 	The name of a module, or the name of a module file or a specific
			//	 	function
			//	extra: String?
			//	 	some additional message for the user
			//	example:
			//	|	dojo.experimental("dojo.data.Result");
			//	example:
			//	|	dojo.experimental("dojo.weather.toKelvin()", "PENDING approval from NOAA");
		}
	=====*/

	//Real functions declared in dojo._firebug.firebug.
	d.deprecated = d.experimental = function(){};

})();
// vim:ai:ts=4:noet
