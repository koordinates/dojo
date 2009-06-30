/*
 summary:
		This is the "source loader" for Dojo. This dojo.js ensures that all
		Base APIs are available once its execution is complete and attempts to
		automatically determine the correct host environment to use.
 description:
		"dojo.js" is the basic entry point into the toolkit for all uses and
		users. The "source loader" is replaced by environment-specific builds
		and so you should not assume that built versions of the toolkit will
		function in all supported platforms (Browsers, Rhino, Spidermonkey,
		etc.). In most cases, users will receive pre-built dojo.js files which
		contain all of the Base APIs in a single file and which specialize for
		the Browser platform. After loading dojo.js, you will be able to do the
		following with the toolkit:
			All platforms:
				- load other packages (dojo core, dijit, dojox, and custom
				  modules) to better structure your code and take advantage of
				  the inventive capabilities developed by the broad Dojo
				  community
				- perform basic network I/O
				- use Dojo's powerful language supplementing APIs
				- take advantage of the Dojo event system to better structure
				  your application
			Browser only:
				- use Dojo's powerful and blisteringly-fast CSS query engine to
				  upgrade and active your web pages without embedding
				  JavaScript in your markup
				- get and set accurate information about element style 
				- shorten the time it takes to build and manipulate DOM
				  structures with Dojo's HTML handling APIs
				- create more fluid UI transitions with Dojo's robust and
				  battle-tested animation facilities

 NOTE:
		If you are reading this file, you have received a "source" build of
		Dojo. Unless you are a Dojo developer, it is very unlikely that this is
		what you want. While functionally identical to builds, source versions
		of Dojo load more slowly than pre-processed builds.

		We strongly recommend that your applications always use a build of
		Dojo. To download such a build or find out how you can create
		customized, high-performance packages of Dojo suitable for use with
		your application, please visit:

			http://dojotoolkit.org

		Regards,
		The Dojo Team
*/

var dojo;

// Only try to load Dojo if we don't already have one. Dojo always follows
// a "first Dojo wins" policy.

if(typeof dojo == "undefined"){
	dojo = {
		_scopeName: "dojo",
		_scopePrefix: "",
		_scopePrefixArgs: "",
		_scopeSuffix: "",
		_scopeMap: {},
		_scopeMapRev: {}
	};

	dojo["eval"] = function(){
		//	summary: 
		//		Perform an evaluation in the (almost) global scope. Use this rather than
		//		calling 'eval()' directly.
		//	description: 
		//	returns:
		//		The result of the evaluation
		if (arguments.length == 1 || !arguments[1]) { 
			return eval(arguments[0]);
		}
		return (new Function(arguments[0]))();
	};

	(function(){

		// Feature detection

		var reFeaturedMethod = new RegExp('^function|object$', 'i');

		// summary:
		// Test for host object property referencing an object to be called
		//
		// description:
		// If the referenced object will not be called, use isHostObjectProperty
		// Allowed properties may be of type function, object (IE and possibly others) or unknown (IE ActiveX methods)
		// Object types exclude null.
		//
		// Does NOT assert that an arbitrary property is callable
		// Pass only names of properties universally implemented as methods
		// This does NOT include properties that are methods in some browsers but not others
		// This test will not discriminate between such implementations and
		// applications should never call such objects
		//
		// example:
		//
		// if (dojo.isHostMethod(document, 'getElementById')) {
		//     anElement = document.getElementById(id);
		// }

		dojo.isHostMethod = function(/* Host object */ o, /* String */ m) {
			var t = typeof o[m];
			return !!((reFeaturedMethod.test(t) && o[m]) || t == 'unknown'); /* Boolean */
		};

		// summary:
		// Test for host object property that will be evaluated (e.g. assigned, type converted)
		//
		// description:
		// Similar to isHostMethod, but does not allow unknown types, which are known to throw errors when evaluated
		// If the property will be called, use isHostMethod
		//
		// example:
		//
		// if (dojo.isHostObjectProperty(document, 'all')) {
		//     allElements = document.all;
		// }

		dojo.isHostObjectProperty = function(/* Host object */ o, /* String */ p) {
			var t = typeof o[p];
			return !!(reFeaturedMethod.test(t) && o[p]); /* Boolean */
		};

		dojo._getWin = function() {
			return dojo.global.window || dojo.global;
		};

		var root;

		// Default to browser environment

		var hostEnv = "browser";
		var isRhino, isSpidermonkey, isFFExt;

/*=====
dojo.global = {
	//	summary:
	//		Reference to the Global Object
	//		(typically the window object in a browser).
	//	description:
	//		Refer to 'dojo.global' rather than referring to window to ensure your
	//		code runs correctly in contexts other than web browsers (e.g. Rhino on a server).
}
=====*/

		dojo.global = this;

		var getWin = dojo._getWin;
		var isHostMethod = dojo.isHostMethod;
		var isHostObjectProperty = dojo.isHostObjectProperty;
		var win = getWin();
		var doc = win.document;

		if(
			typeof this.load == "function" &&
			(this.Packages == "function" || typeof this.Packages == "object")
		){
			// Rhino environments make Java code available via the Packages
			// object. Obviously, this check could be "juiced" if someone
			// creates a "Packages" object and a "load" function, but we've
			// never seen this happen in the wild yet.
			isRhino = true;
			hostEnv = "rhino";
		}else if(typeof this.load == "function"){
			// Spidermonkey has a very spartan environment. The only thing we
			// can count on from it is a "load" function.
			isSpidermonkey = true;
			hostEnv = "spidermonkey";
		}else if(
			isHostObjectProperty(this, 'ChromeWindow') &&
			win instanceof this.ChromeWindow &&
			isHostObjectProperty(this, 'Components')){
			try{
				(this.Components.classes["@mozilla.org/moz/jssubscript-loader;1"]);
				isFFExt = true;
				hostEnv = "ff_ext";
			}catch(e){
				/* squelch Permission Denied error, which means this is not an extension */
			}
		}

		// NOTE: In which environments is this possible?

		if (this.Jaxer && this.Jaxer.isOnServer) {
			this.load = this.Jaxer.load;
		}

/*=====
// note:
//		'djConfig' does not exist under 'dojo.*' so that it can be set before the
//		'dojo' variable exists.
// note:
//		Setting any of these variables *after* the library has loaded does
//		nothing at all.

var djConfig = {
	// summary:
	//		Application code can set the global 'djConfig' prior to loading
	//		the library to override certain global settings for how dojo works.
	//
	// isDebug: Boolean
	//		Defaults to `false`. If set to `true`, ensures that Dojo provides
	//		extended debugging feedback via Firebug. If Firebug is not available
	//		on your platform, setting `isDebug` to `true` will force Dojo to
	//		pull in (and display) the version of Firebug Lite which is
	//		integrated into the Dojo distribution, thereby always providing a
	//		debugging/logging console when `isDebug` is enabled. Note that
	//		Firebug's `console.*` methods are ALWAYS defined by Dojo. If
	//		`isDebug` is false and you are on a platform without Firebug, these
	//		methods will be defined as no-ops.
	isDebug: false,
	// debugAtAllCosts: Boolean
	//		Defaults to `false`. If set to `true`, this triggers an alternate
	//		mode of the package system in which dependencies are detected and
	//		only then are resources evaluated in dependency order via
	//		`<script>` tag inclusion. This may double-request resources and
	//		cause problems with scripts which expect `dojo.require()` to
	//		preform synchronously. `debugAtAllCosts` can be an invaluable
	//		debugging aid, but when using it, ensure that all code which
	//		depends on Dojo modules is wrapped in `dojo.addOnLoad()` handlers.
	//		Due to the somewhat unpredictable side-effects of using
	//		`debugAtAllCosts`, it is strongly recommended that you enable this
	//		flag as a last resort. `debugAtAllCosts` has no effect when loading
	//		resources across domains. For usage information, see the
	//		[Dojo Book](http://dojotoolkit.org/book/book-dojo/part-4-meta-dojo-making-your-dojo-code-run-faster-and-better/debugging-facilities/deb)
	debugAtAllCosts: false,
	// locale: String
	//		The locale to assume for loading localized resources in this page,
	//		specified according to [RFC 3066](http://www.ietf.org/rfc/rfc3066.txt).
	//		Must be specified entirely in lowercase, e.g. `en-us` and `zh-cn`.
	//		See the documentation for `dojo.i18n` and `dojo.requireLocalization`
	//		for details on loading localized resources. If no locale is specified,
	//		Dojo assumes the locale of the user agent, according to `navigator.userLanguage`
	//		or `navigator.language` properties.
	locale: undefined,
	// extraLocale: Array
	//		No default value. Specifies additional locales whose
	//		resources should also be loaded alongside the default locale when
	//		calls to `dojo.requireLocalization()` are processed.
	extraLocale: undefined,
	// baseUrl: String
	//		The directory in which `dojo.js` is located. Under normal
	//		conditions, Dojo auto-detects the correct location from which it
	//		was loaded. You may need to manually configure `baseUrl` in cases
	//		where you have renamed `dojo.js` or in which `<base>` tags confuse
	//		some browsers (e.g. IE 6). The variable `dojo.baseUrl` is assigned
	//		either the value of `djConfig.baseUrl` if one is provided or the
	//		auto-detected root if not. Other modules are located relative to
	//		this path. The path should end in a slash.
	baseUrl: undefined,
	// modulePaths: Object
	//		A map of module names to paths relative to `dojo.baseUrl`. The
	//		key/value pairs correspond directly to the arguments which
	//		`dojo.registerModulePath` accepts. Specifiying
	//		`djConfig.modulePaths = { "foo": "../../bar" }` is the equivalent
	//		of calling `dojo.registerModulePath("foo", "../../bar");`. Multiple
	//		modules may be configured via `djConfig.modulePaths`.
	modulePaths: {},
	// afterOnLoad: Boolean 
	//		Indicates Dojo was added to the page after the page load. In this case
	//		Dojo will not wait for the page DOMContentLoad/load events and fire
	//		its dojo.addOnLoad callbacks after making sure all outstanding
	//		dojo.required modules have loaded.
	afterOnLoad: false,
	// addOnLoad: Function or Array
	//		Adds a callback via dojo.addOnLoad. Useful when Dojo is added after
	//		the page loads and djConfig.afterOnLoad is true. Supports the same
	//		arguments as dojo.addOnLoad. When using a function reference, use
	//		`djConfig.addOnLoad = function(){};`. For object with function name use
	//		`djConfig.addOnLoad = [myObject, "functionName"];` and for object with
	//		function reference use
	//		`djConfig.addOnLoad = [myObject, function(){}];`
	addOnLoad: null,
	// require: Array
	//		An array of module names to be loaded immediately after dojo.js has been included
	//		in a page. 
	require: [],
	// defaultDuration: Array
	//		Default duration, in milliseconds, for wipe and fade animations within dijits.
	//		Assigned to dijit.defaultDuration.
	defaultDuration: 200,
	// dojoBlankHtmlUrl: String
	//		Used by some modules to configure an empty iframe. Used by dojo.io.iframe and
	//		dojo.back, and dijit popup support in IE where an iframe is needed to make sure native
	//		controls do not bleed through the popups. Normally this configuration variable 
	//		does not need to be set, except when using cross-domain/CDN Dojo builds.
	//		Save dojo/resources/blank.html to your domain and set `djConfig.dojoBlankHtmlUrl` 
	//		to the path on your domain your copy of blank.html.
	dojoBlankHtmlUrl: undefined
}
=====*/
		
		if(this.djConfig && this.djConfig.baseUrl){
			// if the user explicitly tells us where Dojo has been loaded from
			// (or should be loaded from) via djConfig, skip the auto-detection
			// routines.
			root = this.djConfig.baseUrl;
		}else{
			root = "./";
			if(isSpidermonkey){

				// Detect the base path via an exception.

				try{
					throw new Error(""); 
				}catch(e2){
					var uri = e2.fileName || e2.sourceURL;
					if (typeof uri == 'string' && uri && uri.indexOf('dojo.js') != -1) {
						root = uri.split("dojo.js")[0];
					}
				}
			}

			if (!this.djConfig) {
				this.djConfig = {};
			}

	
			// Attempt to figure out the path to dojo if it is not set in the config

			if (doc && isHostMethod(doc, 'getElementsByTagName')){
				var i, scripts = doc.getElementsByTagName("script");
				var rePkg = /dojo\.js(\W|$)/i;

				for(i = 0; i < scripts.length; i++){
					var m, src = scripts[i].src;
					if(src){
						m = src.match(rePkg);
						if(m){
							root = this.djConfig.baseUrl = src.substring(0, m.index);
						}
					}
				}
			}			
		}

		var done, envScript = root + "_base/_loader/hostenv_" + hostEnv + ".js";
		
		if (isHostMethod(this, 'load')){
			try {
				this.load(envScript);
				done = true;
			} catch(e4) {
			}
		}
		if(!done && isFFExt){
			try {
				var l = this.Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(this.Components.interfaces.mozIJSSubScriptLoader);
				if (l && isHostMethod(l, 'loadSubScript')) {
					l.loadSubScript(envScript, this);
					done = true;
				}
			} catch(e5) {
			}
		}
		if (!done) {
			try{
				doc.write("<script type='text/javascript' src='"+envScript+"'></script>");
			}catch(e3){
				// XML parse mode or other environment without document.write

				// NOTE: XML parse mode won't work with these scripts
				//       The HEAD element is not closed at this point,
				//       so mutation is ill-advised

				throw new Error('Failed to load environment');
			}
		}

		win = doc = null; // Discard host object references
	})();
}

(function(){

	// for-in filter

	var isOwnProperty = function(o, p) {
		var prop = o.constructor.prototype[p];
		return typeof prop == 'undefined' || prop !== o[p];
	};

	dojo.isOwnProperty = isOwnProperty;

	// firebug stubs

	if(typeof this.loadFirebugConsole == "undefined"){
		if (!dojo.isHostObjectProperty(this, 'console')) {
			this.console = {};
		}

		var cn = [
			"log", "assert", "count", "debug", "dir", "dirxml", "error", "group",
			"groupEnd", "info", "profile", "profileEnd", "time", "timeEnd",
			"trace", "warn" 
		];
		var i=0, tn;
		var emptyFunction = function(){};
		var logFunctionFactory = function(tcn){
			return function() {
				var a = Array.prototype.slice.call(arguments, 0);
				a.unshift(tcn+":");
				this.console.log(a.join(" "));
			};
		};
		var logInConsole = dojo.isHostMethod(this.console, 'log');

		i = cn.length;
		while(i--){
			tn=cn[i];
			if(!dojo.isHostMethod(this.console, tn)){
				this.console[tn] = logInConsole ? logFunctionFactory(tn) : emptyFunction;
			}
		}
	}

	// Need placeholders for dijit and dojox for scoping code.

	if(typeof this.dijit == "undefined"){
		this.dijit = {_scopeName: "dijit"};
	}
	if(typeof this.dojox == "undefined"){
		this.dojox = {_scopeName: "dojox"};
	}
	
	if(!dojo._scopeArgs){
		dojo._scopeArgs = [this.dojo, this.dijit, this.dojox];
	}


	dojo.config =/*===== djConfig = =====*/{
		isDebug: false,
		debugAtAllCosts: false
	};

	var djConfig = this.djConfig;
	if(djConfig){
		for(var opt in djConfig){
			if (isOwnProperty(djConfig, opt)) {
				dojo.config[opt] = djConfig[opt];
			}
		}
	}

/*=====
	// Override locale setting, if specified
	dojo.locale = {
		// summary: the locale as defined by Dojo (read-only)
	};
=====*/
	dojo.locale = dojo.config.locale;

	var rev = "$Rev: 16633 $".match(/\d+/); 

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
		major: 1, minor: 3, patch: 0, flag: "dev",
		revision: rev ? +rev[0] : NaN,
		toString: function(){
			var v = dojo.version;
			return v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + ")";	// String
		}
	};

	// Register with the OpenAjax hub
	if(typeof this.OpenAjax != "undefined"){
		this.OpenAjax.hub.registerLibrary(dojo._scopeName, "http://dojotoolkit.org", dojo.version.toString());
	}

	// Test for enumeration bug in IE

	var maskedDontEnumBleedsThrough = (function() {
		var x, o = { toString:1 };
		for (x in o) {
			if (x == 'toString') {
				return false;
			}
		}
		return true;
	})();

	dojo._mixin = function(/*Object*/ obj, /*Object*/ props){
		// summary:
		//		Adds all properties and methods of props to obj.
		for(var x in props){
			obj[x] = props[x];
		}
		if (maskedDontEnumBleedsThrough) {
			var index, val, names = ['constructor', 'toString', 'valueOf', 'toLocaleString', 'isPrototypeOf', 'propertyIsEnumerable', 'hasOwnProperty'];
			for (index = names.length; index--;) {
				if (isOwnProperty(props, names[index])) {
					val = props[names[index]];
					if(typeof val != "undefined"){
						obj[names[index]] = val;
					}
				}
			}
		}
		return obj; // Object
	};

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
		//	|			console.log(this.quip);
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
		//	|			braces: true
		//	|		},
		//	|		{
		//	|			name: "Carl Brutanananadilewski"
		//	|		}
		//	|	);
		//	|	
		//	|	// will print "Carl Brutanananadilewski"
		//	|	console.log(flattened.name);
		//	|	// will print "true"
		//	|	console.log(flattened.braces);
		if(!obj){ obj = {}; }
		for(var i=1, l=arguments.length; i<l; i++){
			dojo._mixin(obj, arguments[i]);
		}
		return obj; // Object
	};

	dojo._getProp = function(/*Array*/parts, /*Boolean*/create, /*Object*/context){
		var obj=context || dojo.global;
		for(var i=0, p; obj && (p=parts[i]); i++){
			if(!i && this._scopeMap[p]){
				p = this._scopeMap[p];
			}
			obj = (p in obj ? obj[p] : (create ? obj[p]={} : undefined));
		}
		return obj; // mixed
	};

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
		var parts=name.split("."), p=parts.pop(), obj=dojo._getProp(parts, true, context);
		return obj && p ? (obj[p]=value) : undefined; // Object
	};

	dojo.getObject = function(/*String*/name, /*Boolean?*/create, /*Object?*/context){
		// summary: 
		//		Get a property from a dot-separated string, such as "A.B.C"
		//	description: 
		//		Useful for longer api chains where you have to test each object in
		//		the chain, or when you have an object reference in string format.
		//	name: 	
		//		Path to an property, in the form "A.B.C".
		//	create: 
		//		Optional. Defaults to `false`. If `true`, Objects will be
		//		created at any point along the 'path' that is undefined.
		//	context:
		//		Optional. Object to use as root of path. Defaults to
		//		'dojo.global'. Null may be passed.
		return dojo._getProp(name.split("."), create, context); // Object
	};

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
		return !!dojo.getObject(name, false, obj); // Boolean
	};


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
	dojo.deprecated = dojo.experimental = function(){};

	dojo.mixin(dojo, {
		_loadedModules: {},
		_inFlightCount: 0,
		_hasResource: {},

		_modulePrefixes: {
			dojo: 	{	name: "dojo", value: "." },
			// dojox: 	{	name: "dojox", value: "../dojox" },
			// dijit: 	{	name: "dijit", value: "../dijit" },
			doh: 	{	name: "doh", value: "../util/doh" },
			tests: 	{	name: "tests", value: "tests" }
		},

		_moduleHasPrefix: function(/*String*/module){
			// summary: checks to see if module has been established
			var mp = this._modulePrefixes;
			return !!(mp[module] && mp[module].value); // Boolean
		},

		_getModulePrefix: function(/*String*/module){
			// summary: gets the prefix associated with module
			var mp = this._modulePrefixes;
			if(this._moduleHasPrefix(module)){
				return mp[module].value; // String
			}
			return module; // String
		},

		_loadedUrls: [],

		//WARNING: 
		//		This variable is referenced by packages outside of bootstrap:
		//		FloatingPane.js and undo/browser.js
		_postLoad: false,
		
		//Egad! Lots of test files push on this directly instead of using dojo.addOnLoad.
		_loaders: [],
		_unloaders: [],
		_loadNotifying: false
	});

	//>>excludeStart("xdomainExclude", fileName.indexOf("dojo.xd.js") != -1 && kwArgs.loader == "xdomain");
	dojo._loadPath = function(/*String*/relpath, /*String?*/module, /*Function?*/cb){
		// 	summary:
		//		Load a Javascript module given a relative path
		//
		//	description:
		//		Loads and interprets the script located at relpath, which is
		//		relative to the script root directory.  If the script is found but
		//		its interpretation causes a runtime exception, that exception is
		//		not caught by us, so the caller will see it.  We return a true
		//		value if and only if the script is found.
		//
		// relpath: 
		//		A relative path to a script (no leading '/', and typically ending
		//		in '.js').
		// module: 
		//		A module whose existance to check for after loading a path.  Can be
		//		used to determine success or failure of the load.
		// cb: 
		//		a callback function to pass the result of evaluating the script

		var uri = (/^\w+:/.test(relpath) ? "" : this.baseUrl) + relpath;

		if (this._postLoad || !dojo._writeScript) {

			// NOTE: Replace with script injection (safe after load event has fired.)

			try{
				return module ? this._loadUriAndCheck(uri, module, cb) : this._loadUri(uri, cb); // Boolean
			}catch(e){
				console.error(e);
				return false; // Boolean
			}

		} else {

			// NOTE: Like XD, can't signal whether file was found
			//       Doesn't matter as failure should be immediately apparent

			dojo._writeScript(uri);
			return true;
		}
	};

	dojo._loadUri = function(/*String*/uri, /*Function?*/cb){
		//	summary:
		//		Loads JavaScript from a URI
		//	description:
		//		Reads the contents of the URI, and evaluates the contents.  This is
		//		used to load modules as well as resource bundles. Returns true if
		//		it succeeded. Returns false if the URI reading failed.  Throws if
		//		the evaluation throws.
		//	uri: a uri which points at the script to be loaded
		//	cb: 
		//		a callback function to process the result of evaluating the script
		//		as an expression, typically used by the resource bundle loader to
		//		load JSON-style resources

		if(this._loadedUrls[uri]){
			return true; // Boolean
		}
		var that = this;
		var finished = function(contents) {
			that._loadedUrls[uri] = true;
			that._loadedUrls.push(uri);
			if(cb){
				contents = '('+contents+')';
			}else{
				//Only do the scoping if no callback. If a callback is specified,
				//it is most likely the i18n bundle stuff.

				// NOTE: Review this

				contents = that._scopePrefix + contents + that._scopeSuffix;
			}

			var result, dojoEval = dojo['eval'];
			try {

				// NOTE: Second argument mean return value will be ignored

				result = dojoEval(contents, !cb);
			} catch(e) {
				console.log('Load failed ' + uri + ' ' + (e.description || e));
			}
			if(cb){ cb(result); }
		};
		var result = this._getText(uri, true, finished);

		return !!result;
	};
	//>>excludeEnd("xdomainExclude");

	dojo._loadUriAndCheck = function(/*String*/uri, /*String*/moduleName, /*Function?*/cb){
		// summary: calls loadUri and checks that it loaded synchronously
		var ok = false;
		try{
			ok = this._loadUri(uri, cb);
		}catch(e){
			console.error("Failed loading " + uri + " with error: " + e);
		}
		return !!(ok && this._loadedModules[moduleName]); // Boolean
	};

	dojo.loaded = function(){
		// summary:
		//		signal fired when initial environment and package loading is
		//		complete. You should use dojo.addOnLoad() instead of doing a 
		//		direct dojo.connect() to this method in order to handle
		//		initialization tasks that require the environment to be
		//		initialized. In a browser host,	declarative widgets will 
		//		be constructed when this function	finishes runing.
		this._loadNotifying = true;
		this._postLoad = true;
		var mll = dojo._loaders;

		//Clear listeners so new ones can be added
		//For other xdomain package loads after the initial load.
		this._loaders = [];

		for(var x = 0; x < mll.length; x++){
			mll[x]();
		}

		this._loadNotifying = false;
		
		//Make sure nothing else got added to the onload queue
		//after this first run. If something did, and we are not waiting for any
		//more inflight resources, run again.
		if(dojo._postLoad && !dojo._inFlightCount && mll.length){
			dojo._callLoaded();
		}
	};

	dojo.unloaded = function(){
		// summary:
		//		signal fired by impending environment destruction. You should use
		//		dojo.addOnUnload() instead of doing a direct dojo.connect() to this 
		//		method to perform page/application cleanup methods. See 
		//		dojo.addOnUnload for more info.
		var mll = dojo._unloaders;
		while(mll.length){
			(mll.pop())();
		}
	};

	dojo._onto = function(arr, obj, fn){
		if(!fn){
			arr.push(obj);
		}else if(fn){
			var func = (typeof fn == "string") ? obj[fn] : fn;
			arr.push(function(){ func.call(obj); });
		}
	};

	dojo.addOnLoad = function(/*Object?*/obj, /*String|Function*/functionName){
		// summary:
		//		Registers a function to be triggered after the DOM has finished
		//		loading and widgets declared in markup have been instantiated.
		//		Images and CSS files may or may not have finished downloading when
		//		the specified function is called.  (Note that widgets' CSS and HTML
		//		code is guaranteed to be downloaded before said widgets are
		//		instantiated.)
		// example:
		//	|	dojo.addOnLoad(functionPointer);
		//	|	dojo.addOnLoad(object, "functionName");
		//	|	dojo.addOnLoad(object, function(){ /* ... */});

		dojo._onto(dojo._loaders, obj, functionName);

		//Added for xdomain loading. dojo.addOnLoad is used to
		//indicate callbacks after doing some dojo.require() statements.
		//In the xdomain case, if all the requires are loaded (after initial
		//page load), then immediately call any listeners.
		if(dojo._postLoad && !dojo._inFlightCount && !dojo._loadNotifying){
			dojo._callLoaded();
		}
	};

	//Support calling dojo.addOnLoad via djConfig.addOnLoad. Support all the
	//call permutations of dojo.addOnLoad. Mainly useful when dojo is added
	//to the page after the page has loaded.
	var dca = dojo.config.addOnLoad;
	if(dca){
		dojo.addOnLoad[Object.prototype.toString.call(dca) == '[object Array]' ? "apply" : "call"](dojo, dca);
	}

	dojo._modulesLoaded = function(){
		if(dojo._postLoad){ return; }
		if(dojo._inFlightCount > 0){ 
			console.warn("files still in flight!");
			return;
		}
		dojo._callLoaded();
	};

	// Test for host object properties that are typically callable (e.g. document.getElementById) or known to be callable in some implementations (e.g. document.all in Safari)
	// which may be of type function, object (IE and possibly others) or unknown (IE ActiveX methods)

	var isHostMethod = dojo.isHostMethod;
	var getWin = dojo._getWin;

	if (isHostMethod(getWin(), 'setTimeout')) {
		dojo._setMethodTimeout = function(methodName, delay) {
			var scopeName = dojo._scopeName;

			// NOTE: Why use dojo.global here?

			var space = dojo.global[scopeName];
			var fn = function() {
				return space[methodName]();
			};
			fn.toString = function() {
				return 'dojo.global["' + scopeName + '"].' + methodName + '();';
			};		
			getWin().setTimeout(fn, delay);
		};
	}

	dojo._callLoaded = function(){
		var doc = getWin().document;

		// Make sure the parser has hit the opening body tag
		// Non-browsers will skip this.

		if (dojo._setMethodTimeout) {
			dojo._setMethodTimeout((doc && doc.body === null) ? '_callLoaded' : 'loaded', 10);
		} else {
			dojo.loaded();
		}
	};

	dojo._getModuleSymbols = function(/*String*/modulename){
		// summary:
		//		Converts a module name in dotted JS notation to an array
		//		representing the path in the source tree
		var syms = modulename.split(".");
		for(var i = syms.length; i>0; i--){
			var parentModule = syms.slice(0, i).join(".");
			if((i==1) && !this._moduleHasPrefix(parentModule)){		
				// Support default module directory (sibling of dojo) for top-level modules 
				syms[0] = "../" + syms[0];
			}else{
				var parentModulePath = this._getModulePrefix(parentModule);
				if(parentModulePath != parentModule){
					syms.splice(0, i, parentModulePath);
					break;
				}
			}
		}
		return syms; // Array
	};

	dojo._global_omit_module_check = false;

	dojo.loadInit = function(/*Function*/init){
		//	summary:
		//		Executes a function that needs to be executed for the loader's dojo.requireIf
		//		resolutions to work. This is needed mostly for the xdomain loader case where
		//		a function needs to be executed to set up the possible values for a dojo.requireIf
		//		call.
		//	init:
		//		a function reference. Executed immediately.
		//	description: This function is mainly a marker for the xdomain loader to know parts of
		//		code that needs be executed outside the function wrappper that is placed around modules.
		//		The init function could be executed more than once, and it should make no assumptions
		//		on what is loaded, or what modules are available. Only the functionality in Dojo Base
		//		is allowed to be used. Avoid using this method. For a valid use case,
		//		see the source for dojox.gfx.
		init();
	};

	dojo._loadModule = dojo.require = function(/*String*/moduleName, /*Boolean?*/omitModuleCheck){
		//	summary:
		//		loads a Javascript module from the appropriate URI
		//	moduleName:
		//		module name to load, using periods for separators,
		//		 e.g. "dojo.date.locale".  Module paths are de-referenced by dojo's
		//		internal mapping of locations to names and are disambiguated by
		//		longest prefix. See `dojo.registerModulePath()` for details on
		//		registering new modules.
		//	omitModuleCheck:
		//		if `true`, omitModuleCheck skips the step of ensuring that the
		//		loaded file actually defines the symbol it is referenced by.
		//		For example if it called as `dojo.require("a.b.c")` and the
		//		file located at `a/b/c.js` does not define an object `a.b.c`,
		//		and exception will be throws whereas no exception is raised
		//		when called as `dojo.require("a.b.c", true)`
		//	description:
		//		`dojo.require("A.B")` first checks to see if symbol A.B is
		//		defined. If it is, it is simply returned (nothing to do).
		//	
		//		If it is not defined, it will look for `A/B.js` in the script root
		//		directory.
		//	
		//		`dojo.require` throws an excpetion if it cannot find a file
		//		to load, or if the symbol `A.B` is not defined after loading.
		//	
		//		It returns the object `A.B`.
		//	
		//		`dojo.require()` does nothing about importing symbols into
		//		the current namespace.  It is presumed that the caller will
		//		take care of that. For example, to import all symbols into a
		//		local block, you might write:
		//	
		//		|	with (dojo.require("A.B")) {
		//		|		...
		//		|	}
		//	
		//		And to import just the leaf symbol to a local variable:
		//	
		//		|	var B = dojo.require("A.B");
		//	   	|	...
		//	returns: the required namespace object

		var module, ok, relpath;

		omitModuleCheck = this._global_omit_module_check || omitModuleCheck;

		//Check if it is already loaded.

		module = this._loadedModules[moduleName];
		if(module){
			return module;
		}

		// convert periods to slashes

		relpath = this._getModuleSymbols(moduleName).join("/") + '.js';

		ok = this._loadPath(relpath, omitModuleCheck ? null : moduleName);

		if (!omitModuleCheck) {
			if(!ok){
				throw new Error("Could not load '" + moduleName + "'; last tried '" + relpath + "'");
			}

			// Check that the symbol was defined
			// Don't bother if we're doing xdomain (asynchronous) loading (or writing scripts during loading.)

			if(!this._isXDomain && !this._writeScript){
				module = this._loadedModules[moduleName];
				if(!module){
					throw new Error("Symbol '" + moduleName + "' is not defined after loading '" + relpath + "'"); 
				}
			}
		}

		return module;
	};

	dojo.provide = function(/*String*/ resourceName){
		//	summary:
		//		Each javascript source file must have at least one
		//		`dojo.provide()` call at the top of the file, corresponding to
		//		the file name.  For example, `js/dojo/foo.js` must have
		//		`dojo.provide("dojo.foo");` before any calls to
		//		`dojo.require()` are made.
		//	description:
		//		Each javascript source file is called a resource.  When a
		//		resource is loaded by the browser, `dojo.provide()` registers
		//		that it has been loaded.
		//	
		//		For backwards compatibility reasons, in addition to registering
		//		the resource, `dojo.provide()` also ensures that the javascript
		//		object for the module exists.  For example,
		//		`dojo.provide("dojox.data.FlickrStore")`, in addition to
		//		registering that `FlickrStore.js` is a resource for the
		//		`dojox.data` module, will ensure that the `dojox.data`
		//		javascript object exists, so that calls like 
		//		`dojo.data.foo = function(){ ... }` don't fail.
		//
		//		In the case of a build where multiple javascript source files
		//		are combined into one bigger file (similar to a .lib or .jar
		//		file), that file may contain multiple dojo.provide() calls, to
		//		note that it includes multiple resources.

		//Make sure we have a string.
		resourceName = resourceName + "";
		return (dojo._loadedModules[resourceName] = dojo.getObject(resourceName, true)); // Object
	};

	//Start of old bootstrap2:

	dojo.platformRequire = function(/*Object*/modMap){
		//	summary:
		//		require one or more modules based on which host environment
		//		Dojo is currently operating in
		//	description:
		//		This method takes a "map" of arrays which one can use to
		//		optionally load dojo modules. The map is indexed by the
		//		possible dojo.name_ values, with two additional values:
		//		"default" and "common". The items in the "default" array will
		//		be loaded if none of the other items have been choosen based on
		//		dojo.name_, set by your host environment. The items in the
		//		"common" array will *always* be loaded, regardless of which
		//		list is chosen.
		//	example:
		//		|	dojo.platformRequire({
		//		|		browser: [
		//		|			"foo.sample", // simple module
		//		|			"foo.test",
		//		|			["foo.bar.baz", true] // skip object check in _loadModule (dojo.require)
		//		|		],
		//		|		default: [ "foo.sample._base" ],
		//		|		common: [ "important.module.common" ]
		//		|	});

		var common = modMap.common || [];
		var result = common.concat(modMap[dojo._name] || modMap["default"] || []);

		for(var x=0; x<result.length; x++){
			var curr = result[x];
			if(curr.constructor == Array){
				dojo._loadModule.apply(dojo, curr);
			}else{
				dojo._loadModule(curr);
			}
		}
	};

	dojo.requireIf = function(/*Boolean*/ condition, /*String*/ resourceName){
		// summary:
		//		If the condition is true then call dojo.require() for the specified
		//		resource
		if(condition === true){
			// FIXME: why do we support chained require()'s here? does the build system?
			var args = [];
			for(var i = 1; i < arguments.length; i++){ 
				args.push(arguments[i]);
			}
			dojo.require.apply(dojo, args);
		}
	};

	dojo.requireAfterIf = dojo.requireIf;

	dojo.registerModulePath = function(/*String*/module, /*String*/prefix){
		//	summary: 
		//		maps a module name to a path
		//	description: 
		//		An unregistered module is given the default path of ../[module],
		//		relative to Dojo root. For example, module acme is mapped to
		//		../acme.  If you want to use a different module name, use
		//		dojo.registerModulePath. 
		//	example:
		//		If your dojo.js is located at this location in the web root:
		//	|	/myapp/js/dojo/dojo/dojo.js
		//		and your modules are located at:
		//	|	/myapp/js/foo/bar.js
		//	|	/myapp/js/foo/baz.js
		//	|	/myapp/js/foo/thud/xyzzy.js
		//		Your application can tell Dojo to locate the "foo" namespace by calling:
		//	|	dojo.registerModulePath("foo", "../../foo");
		//		At which point you can then use dojo.require() to load the
		//		modules (assuming they provide() the same things which are
		//		required). The full code might be:
		//	|	<script type="text/javascript" 
		//	|		src="/myapp/js/dojo/dojo/dojo.js"></script>
		//	|	<script type="text/javascript">
		//	|		dojo.registerModulePath("foo", "../../foo");
		//	|		dojo.require("foo.bar");
		//	|		dojo.require("foo.baz");
		//	|		dojo.require("foo.thud.xyzzy");
		//	|	</script>
		dojo._modulePrefixes[module] = { name: module, value: prefix };
	};

	dojo.requireLocalization = function(/*String*/moduleName, /*String*/bundleName, /*String?*/locale, /*String?*/availableFlatLocales){
		// summary:
		//		Declares translated resources and loads them if necessary, in the
		//		same style as dojo.require.  Contents of the resource bundle are
		//		typically strings, but may be any name/value pair, represented in
		//		JSON format.  See also `dojo.i18n.getLocalization`.
		//
		// description:
		//		Load translated resource bundles provided underneath the "nls"
		//		directory within a package.  Translated resources may be located in
		//		different packages throughout the source tree.  
		//
		//		Each directory is named for a locale as specified by RFC 3066,
		//		(http://www.ietf.org/rfc/rfc3066.txt), normalized in lowercase.
		//		Note that the two bundles in the example do not define all the
		//		same variants.  For a given locale, bundles will be loaded for
		//		that locale and all more general locales above it, including a
		//		fallback at the root directory.  For example, a declaration for
		//		the "de-at" locale will first load `nls/de-at/bundleone.js`,
		//		then `nls/de/bundleone.js` and finally `nls/bundleone.js`.  The
		//		data will be flattened into a single Object so that lookups
		//		will follow this cascading pattern.  An optional build step can
		//		preload the bundles to avoid data redundancy and the multiple
		//		network hits normally required to load these resources.
		//
		// moduleName: 
		//		name of the package containing the "nls" directory in which the
		//		bundle is found
		//
		// bundleName: 
		//		bundle name, i.e. the filename without the '.js' suffix
		//
		// locale: 
		//		the locale to load (optional)  By default, the browser's user
		//		locale as defined by dojo.locale
		//
		// availableFlatLocales: 
		//		A comma-separated list of the available, flattened locales for this
		//		bundle. This argument should only be set by the build process.
		//
		//	example:
		//		A particular widget may define one or more resource bundles,
		//		structured in a program as follows, where moduleName is
		//		mycode.mywidget and bundleNames available include bundleone and
		//		bundletwo:
		//	|		...
		//	|	mycode/
		//	|		mywidget/
		//	|			nls/
		//	|				bundleone.js (the fallback translation, English in this example)
		//	|				bundletwo.js (also a fallback translation)
		//	|				de/
		//	|					bundleone.js
		//	|					bundletwo.js
		//	|				de-at/
		//	|					bundleone.js
		//	|				en/
		//	|					(empty; use the fallback translation)
		//	|				en-us/
		//	|					bundleone.js
		//	|				en-gb/
		//	|					bundleone.js
		//	|				es/
		//	|					bundleone.js
		//	|					bundletwo.js
		//	|				  ...etc
		//	|				...
		//

		this.require("dojo.i18n");
		var args = Array.prototype.slice.call(arguments, 0);
		this._applyLocalization = function() {
			this.i18n._requireLocalization.apply(dojo.hostenv, args);
		};
		if (this.i18n && this.i18n._requireLocalization) {

			// Environment loaded i18n module synchronously

			dojo._applyLocalization();
		} else {

			// During loading, browsers use document.write, which loads modules in order, but asynchronously

			(this.global.window || this.global).document.write('<script type="text/javascript"> dojo._applyLocalization(); delete dojo._applyLocalization; </script>');
		}
	};

	var ore = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$");
	var ire = new RegExp("^((([^\\[:]+):)?([^@]+)@)?(\\[([^\\]]+)\\]|([^\\[:]*))(:([0-9]+))?$");

	dojo._Url = function(/*dojo._Url||String...*/){
		// summary: 
		//		Constructor to create an object representing a URL.
		//		It is marked as private, since we might consider removing
		//		or simplifying it.
		// description: 
		//		Each argument is evaluated in order relative to the next until
		//		a canonical uri is produced. To get an absolute Uri relative to
		//		the current document use:
		//      	new dojo._Url(document.baseURI, url)

		var n = null;

		var _a = arguments;
		var uri = [_a[0]];
		// resolve uri components relative to each other
		for(var i = 1; i<_a.length; i++){
			if(!_a[i]){ continue; }

			// Safari doesn't support this.constructor so we have to be explicit
			// FIXME: Tracked (and fixed) in Webkit bug 3537.
			//		http://bugs.webkit.org/show_bug.cgi?id=3537
			var relobj = new dojo._Url(_a[i]+"");
			var uriobj = new dojo._Url(uri[0]+"");

			if(!relobj.path && !relobj.scheme && !relobj.authority && !relobj.query){
				if(relobj.fragment != n){
					uriobj.fragment = relobj.fragment;
				}
				relobj = uriobj;
			}else if(!relobj.scheme){
				relobj.scheme = uriobj.scheme;

				if(!relobj.authority){
					relobj.authority = uriobj.authority;

					if(relobj.path.charAt(0) != "/"){
						var path = uriobj.path.substring(0,
							uriobj.path.lastIndexOf("/") + 1) + relobj.path;

						var segs = path.split("/");
						for(var j = 0; j < segs.length; j++){
							if(segs[j] == "."){
								// flatten "./" references
								if(j == segs.length - 1){
									segs[j] = "";
								}else{
									segs.splice(j, 1);
									j--;
								}
							}else if(j > 0 && !(j == 1 && !segs[0]) &&
								segs[j] == ".." && segs[j-1] != ".."){
								// flatten "../" references
								if(j == (segs.length - 1)){
									segs.splice(j, 1);
									segs[j - 1] = "";
								}else{
									segs.splice(j - 1, 2);
									j -= 2;
								}
							}
						}
						relobj.path = segs.join("/");
					}
				}
			}

			uri = [];
			if(relobj.scheme){
				uri.push(relobj.scheme, ":");
				//if (relobj.scheme == 'file') {
				//	uri.push('//');
				//}
			}
			if(relobj.authority){
				uri.push("//", relobj.authority);
			}
			uri.push(relobj.path);
			if(relobj.query){
				uri.push("?", relobj.query);
			}
			if(relobj.fragment){
				uri.push("#", relobj.fragment);
			}
		}

		this.uri = uri.join("");

		// break the uri into its main components
		var r = this.uri.match(ore);

		this.scheme = r[2] || (r[1] ? "" : n);
		this.authority = r[4] || (r[3] ? "" : n);
		this.path = r[5]; // can never be undefined
		this.query = r[7] || (r[6] ? "" : n);
		this.fragment  = r[9] || (r[8] ? "" : n);

		if(this.authority != n){
			// server based naming authority
			r = this.authority.match(ire);

			this.user = r[3] || n;
			this.password = r[4] || n;
			this.host = r[6] || r[7]; // ipv6 || ipv4
			this.port = r[9] || n;
		}
	};

	dojo._Url.prototype.toString = function(){ return this.uri; };

	dojo.moduleUrl = function(/*String*/module, /*dojo._Url||String*/url){
		//	summary: 
		//		Returns a `dojo._Url` object relative to a module.
		//	example:
		//	|	var pngPath = dojo.moduleUrl("acme","images/small.png");
		//	|	console.dir(pngPath); // list the object properties
		//	|	// create an image and set it's source to pngPath's value:
		//	|	var img = document.createElement("img");
		// 	|	// NOTE: we assign the string representation of the url object
		//	|	img.src = pngPath.toString(); 
		//	|	// add our image to the document
		//	|	dojo.body().appendChild(img);
		//	example: 
		//		you may de-reference as far as you like down the package
		//		hierarchy.  This is sometimes handy to avoid lenghty relative
		//		urls or for building portable sub-packages. In this example,
		//		the `acme.widget` and `acme.util` directories may be located
		//		under different roots (see `dojo.registerModulePath`) but the
		//		the modules which reference them can be unaware of their
		//		relative locations on the filesystem:
		//	|	// somewhere in a configuration block
		//	|	dojo.registerModulePath("acme.widget", "../../acme/widget");
		//	|	dojo.registerModulePath("acme.util", "../../util");
		//	|	
		//	|	// ...
		//	|	
		//	|	// code in a module using acme resources
		//	|	var tmpltPath = dojo.moduleUrl("acme.widget","templates/template.html");
		//	|	var dataPath = dojo.moduleUrl("acme.util","resources/data.json");

		var loc = dojo._getModuleSymbols(module).join('/');
		if(!loc){ return null; }
		if(loc.lastIndexOf("/") != loc.length-1){
			loc += "/";
		}
		
		//If the path is an absolute path (starts with a / or is on another
		//domain/xdomain) then don't add the baseUrl.
		var colonIndex = loc.indexOf(":");
		if(loc.charAt(0) != "/" && (colonIndex == -1 || colonIndex > loc.indexOf("/"))){
			loc = dojo.baseUrl + loc;
		}

		return new dojo._Url(loc, url); // String
	};
})();

// *** TODO: Exclude this if not cross-domain build

if(
	this.djConfig&&
	(this.djConfig.forceXDomain || this.djConfig.useXDomain)
){

	dojo.provide("dojo._base._loader.loader_xd");

	dojo._xdReset = function(){
		//summary: Internal xd loader function. Resets the xd state.

		//This flag indicates where or not we have crossed into cross-domain territory. Once any resource says
		//is deemed to be cross-domain.

		this._isXDomain = dojo.config.useXDomain || false;

		this._xdTimer = 0;
		this._xdInFlight = {};
		this._xdOrderedReqs = [];
		this._xdDepMap = {};
		this._xdContents = [];
		this._xdDefList = [];
	};

	//Call reset immediately to set the state.
	dojo._xdReset();

	dojo._xdCreateResource = function(/*String*/contents, /*String*/resourceName, /*String*/resourcePath){
		//summary: Internal xd loader function. Creates an xd module source given an
		//non-xd module contents.

		//Remove comments. Not perfect, but good enough for dependency resolution.
		var depContents = contents.replace(/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg , "");

		//Find dependencies.
		var deps = [];
		var depRegExp = /dojo.(require|requireIf|provide|requireAfterIf|platformRequire|requireLocalization)\s*\(([\w\W]*?)\)/mg;
		var done, match;
		while(!done){
			match = depRegExp.exec(depContents);
			if (match) {
				if(match[1] == "requireLocalization"){
					//Need to load the local bundles asap, since they are not
					//part of the list of modules watched for loading.
					dojo["eval"](match[0]);
				}else{
					deps.push('"' + match[1] + '", ' + match[2]);
				}
			} else {
				done = true;
			}
		}

		//Create resource object and the call to _xdResourceLoaded.

		var output = [];
		output.push(dojo._scopeName + "._xdResourceLoaded(function(" + dojo._scopePrefixArgs + "){\n");

		//See if there are any dojo.loadInit calls

		var loadInitCalls = dojo._xdExtractLoadInits(contents);
		if(loadInitCalls){

			//Adjust fileContents since extractLoadInits removed something.

			contents = loadInitCalls[0];
		
			//Add any loadInit calls to the top of the xd file.

			for(var i = 1; i < loadInitCalls.length; i++){
				output.push(loadInitCalls[i] + ";\n");
			}
		}

		output.push("return {");

		//Add dependencies

		if(deps.length > 0){
			output.push("depends: [");
			for(i = 0; i < deps.length; i++){
				if(i > 0){
					output.push(",\n");
				}
				output.push("[" + deps[i] + "]");
			}
			output.push("],");
		}

		//Add the contents of the file inside a function.
		//Pass in scope arguments so we can support multiple versions of the
		//same module on a page.

		output.push("\ndefineResource: function(" + dojo._scopePrefixArgs + "){");

		//Don't put in the contents in the debugAtAllCosts case
		//since the contents may have syntax errors. Let those
		//get pushed up when the script tags are added to the page
		//in the debugAtAllCosts case.

		if(!dojo.config.debugAtAllCosts || resourceName == "dojo._base._loader.loader_debug"){
			output.push(contents);
		}
		//Add isLocal property so we know if we have to do something different
		//in debugAtAllCosts situations.
		output.push("\n}, resourceName: '" + resourceName + "', resourcePath: '" + resourcePath + "'};});");

		return output.join(""); //String
	};

dojo._xdExtractLoadInits = function(/*String*/fileContents){
	//Extracts
	var regexp = /dojo.loadInit\s*\(/g;
	regexp.lastIndex = 0;

	var parenRe = /[\(\)]/g;
	parenRe.lastIndex = 0;

	var results = [];
	var matches;
	while((matches = regexp.exec(fileContents))){
		//Find end of the call by finding the matching end paren
		parenRe.lastIndex = regexp.lastIndex;
		var matchCount = 1;
		var parenMatch;
		while((parenMatch = parenRe.exec(fileContents))){
			if(parenMatch[0] == ")"){
				matchCount -= 1;
			}else{
				matchCount += 1;
			}
			if(!matchCount){
				break;
			}
		}
		
		if(matchCount){
			throw "unmatched paren around character " + parenRe.lastIndex + " in: " + fileContents;
		}

		//Put the master matching string in the results.
		var startIndex = regexp.lastIndex - matches[0].length;
		results.push(fileContents.substring(startIndex, parenRe.lastIndex));

		//Remove the matching section.
		var remLength = parenRe.lastIndex - startIndex;
		fileContents = fileContents.substring(0, startIndex) + fileContents.substring(parenRe.lastIndex, fileContents.length);

		//Move the master regexp past the last matching paren point.
		regexp.lastIndex = parenRe.lastIndex - remLength;

		regexp.lastIndex = parenRe.lastIndex;
	}

	if(results.length > 0){
		results.unshift(fileContents);
	}

	return (results.length ? results : null);
};

dojo._xdIsXDomainPath = function(/*string*/relpath) {
    //summary: Figure out whether the path is local or x-domain
	//If there is a colon before the first / then, we have a URL with a protocol.
    
	var colonIndex = relpath.indexOf(":");
	var slashIndex = relpath.indexOf("/");

	if(colonIndex > 0 && colonIndex < slashIndex){
		return true;
	}else{
		//Is the base script URI-based URL a cross domain URL?
		//If so, then the relpath will be evaluated relative to
		//baseUrl, and therefore qualify as xdomain.
		//Only treat it as xdomain if the page does not have a
		//host (file:// url) or if the baseUrl does not match the
		//current domain.

		var url = this.baseUrl, win = dojo.getWin();
		colonIndex = url.indexOf(":");
		slashIndex = url.indexOf("/");
		if(colonIndex > 0 && colonIndex < slashIndex && (!win.location.host || url.indexOf("http://" + win.location.host))){
			return true;
		}
	}
    return false;     
};

dojo._loadPath = function(/*String*/relpath, /*String?*/module, /*Function?*/cb){
	//summary: Internal xd loader function. Overrides loadPath() from loader.js.
	//xd loading requires slightly different behavior from loadPath().

	var currentIsXDomain = this._xdIsXDomainPath(relpath);
	this._isXDomain |= currentIsXDomain;
	var uri = (/^\w+:/.test(relpath) ? "" : this.baseUrl) + relpath;

	if (this._postLoad || !dojo._writeScript) {

		// NOTE: Replace with script injection (safe after load event has fired.)

		try {
			return (module && !currentIsXDomain) ? this._loadUriAndCheck(uri, module, cb) : this._loadUri(uri, cb); // Boolean
		} catch(e) {
			console.error(e);
			return false; // Boolean
		}
	} else {
		dojo._writeScript(uri);
		return true;
	}
};

dojo._loadUri = function(/*String*/uri, /*Function?*/cb, /*boolean*/currentIsXDomain, /*String?*/module){
	//summary: Internal xd loader function. Overrides loadUri() from loader.js.
	//		xd loading requires slightly different behavior from loadPath().
	//description: Wanted to override getText(), but it is used by
	//		the widget code in too many, synchronous ways right now.

	if(this._loadedUrls[uri]){
		return 1; //Boolean
	}

	//Add the module (resource) to the list of modules.
	//Only do this work if we have a module name. Otherwise, 
	//it is a non-xd i18n bundle, which can load immediately and does not 
	//need to be tracked. Also, don't track dojo.i18n, since it is a prerequisite
	//and will be loaded correctly if we load it right away: it has no dependencies.
	if(this._isXDomain && module && module != "dojo.i18n"){
		this._xdOrderedReqs.push(module);

		//Add to waiting resources if it is an xdomain resource.
		//Don't add non-xdomain i18n bundles, those get evaled immediately.
		if(currentIsXDomain || uri.indexOf("/nls/") == -1){
			this._xdInFlight[module] = true;

			//Increment inFlightCount
			//This will stop the modulesLoaded from firing all the way.
			this._inFlightCount++;
		}

		//Start timer

		if(!this._xdTimer){
			dojo._setMethodTimeout('_xdWatchInFlight', 100); // *** 100?
		}
		this._xdStartTime = (new Date()).getTime();
	}

	if (currentIsXDomain){

		//Fix name to be a .xd.fileextension name.

		var lastIndex = uri.lastIndexOf('.');
		if(lastIndex <= 0){
			lastIndex = uri.length - 1;
		}

		var xdUri = uri.substring(0, lastIndex) + ".xd";
		if(lastIndex != uri.length - 1){
			xdUri += uri.substring(lastIndex, uri.length);
		}

		xdUri = xdUri.replace("app:/", "/");

		//Add to script src

		var doc = dojo._getWin().document;
		var element = doc.createElement("script");
		element.type = "text/javascript";
		element.src = xdUri;
		if(!this._headElement){
			this._headElement = doc.getElementsByTagName("head")[0] || doc.getElementsByTagName("html")[0];

			//Head element may not exist, particularly in html
			//html 4 or tag soup cases where the page does not
			//have a head tag in it. Use html element, since that will exist.
		}
		this._headElement.appendChild(element);
	}else{
		var contents = this._getText(uri, null, true);
		if(!contents){ return false; /*boolean*/}
		
		//If this is not xdomain, or if loading a i18n resource bundle, then send it down
		//the normal eval/callback path.

		if(this._isXDomain && uri.indexOf("/nls/") == -1 && module != "dojo.i18n"){
			var res = this._xdCreateResource(contents, module, uri);
			dojo["eval"](res);
		}else{
			if(cb){
				contents = '('+contents+')';
			}else{
				//Only do the scoping if no callback. If a callback is specified,
				//it is most likely the i18n bundle stuff.

				// NOTE: Review this

				contents = this._scopePrefix + contents + this._scopeSuffix;
			}
			var value = dojo["eval"](contents, !cb);
			if(cb){
				cb(value);
			}
		}
	}

	//These steps are done in the non-xd loader version of this function.
	//Maintain these steps to fit in with the existing system.

	this._loadedUrls[uri] = true;
	this._loadedUrls.push(uri);
	return true; //Boolean
};

dojo._xdResourceLoaded = function(/*Function*/res){
	//summary: Internal xd loader function. Called by an xd module resource when
	//it has been loaded via a script tag.
	
	//Evaluate the function with scopeArgs for multiversion support.
	res = res.apply(dojo.global, dojo._scopeArgs);

	//Work through dependencies.
	var deps = res.depends;
	var requireList = null;
	var requireAfterList = null;
	var provideList = [];
	if(deps && deps.length > 0){
		var dep = null;
		for(var i = 0; i < deps.length; i++){
			dep = deps[i];

			//Look for specific dependency indicators.
			if (dep[0] == "provide"){
				provideList.push(dep[1]);
			}else{
				if(!requireList){
					requireList = [];
				}
				if(!requireAfterList){
					requireAfterList = [];
				}

				var unpackedDeps = this._xdUnpackDependency(dep);
				if(unpackedDeps.requires){
					requireList = requireList.concat(unpackedDeps.requires);
				}
				if(unpackedDeps.requiresAfter){
					requireAfterList = requireAfterList.concat(unpackedDeps.requiresAfter);
				}
			}

			//Call the dependency indicator to allow for the normal dojo setup.
			//Only allow for one dot reference, for the i18n._preloadLocalizations calls
			//(and maybe future, one-dot things).

			var depType = dep[0];
			var objPath = depType.split(".");
			if(objPath.length == 2){
				dojo[objPath[0]][objPath[1]].apply(dojo[objPath[0]], dep.slice(1));
			}else{
				dojo[depType].apply(dojo, dep.slice(1));
			}
		}


		//If loading the debugAtAllCosts module, eval it right away since we need
		//its functions to properly load the other modules.

		if(provideList.length == 1 && provideList[0] == "dojo._base._loader.loader_debug"){
			res.defineResource(dojo);
		}else{
			//Save off the resource contents for definition later.
			var contentIndex = this._xdContents.push({
					content: res.defineResource,
					resourceName: res.resourceName,
					resourcePath: res.resourcePath,
					isDefined: false
				}) - 1;
	
			//Add provide/requires to dependency map.
			for(i = 0; i < provideList.length; i++){
				this._xdDepMap[provideList[i]] = { requires: requireList, requiresAfter: requireAfterList, contentIndex: contentIndex };
			}
		}

		//Now update the inflight status for any provided resources in this loaded resource.
		//Do this at the very end (in a *separate* for loop) to avoid shutting down the 
		//inflight timer check too soon.
		for(i = 0; i < provideList.length; i++){
			this._xdInFlight[provideList[i]] = false;
		}
	}
};

dojo._xdLoadFlattenedBundle = function(/*String*/moduleName, /*String*/bundleName, /*String?*/locale, /*Object*/bundleData){
	//summary: Internal xd loader function. Used when loading
	//a flattened localized bundle via a script tag.
	locale = locale || "root";
	var jsLoc = dojo.i18n.normalizeLocale(locale).replace('-', '_');
 	var bundleResource = [moduleName, "nls", bundleName].join(".");
	var bundle = dojo.provide(bundleResource);
	bundle[jsLoc] = bundleData;
	
	//Assign the bundle for the original locale(s) we wanted.
	var mapName = [moduleName, jsLoc, bundleName].join(".");
	var bundleMap = dojo._xdBundleMap[mapName];
	var isOwnProperty = dojo.isOwnProperty;
	if(bundleMap){
		for(var param in bundleMap){
			if (isOwnProperty(bundleMap, param)) {
				bundle[param] = bundleData;
			}
		}
	}
};

dojo._xdInitExtraLocales = function(){

	// Simulate the extra locale work that dojo.requireLocalization does.

	var extra = dojo.config.extraLocale;
	if(extra){
		if(!dojo.isArray(extra)){
			extra = [extra];
		}

		dojo._xdReqLoc = dojo.xdRequireLocalization;
		dojo.xdRequireLocalization = function(m, b, locale, fLocales){
			dojo._xdReqLoc(m,b,locale, fLocales);
			if(locale){return;}
			for(var i=0; i<extra.length; i++){
				dojo._xdReqLoc(m,b,extra[i], fLocales);
			}
		};
	}
};

dojo._xdBundleMap = {};

dojo.xdRequireLocalization = function(/*String*/moduleName, /*String*/bundleName, /*String?*/locale, /*String*/availableFlatLocales){
	//summary: Internal xd loader function. The xd version of dojo.requireLocalization.
	

	//Account for allowing multiple extra locales. Do this here inside the function
	//since dojo._xdInitExtraLocales() depends on djConfig being set up, but that only
	//happens after hostenv_browser runs. loader_xd has to come before hostenv_browser
	//though since hostenv_browser can do a dojo.require for the debug module.
	if(dojo._xdInitExtraLocales){
		dojo._xdInitExtraLocales();
		dojo._xdInitExtraLocales = null;
		dojo.xdRequireLocalization.apply(dojo, arguments);
		return;
	}

	var locales = availableFlatLocales.split(",");
	
	//Find the best-match locale to load.
	//Assumes dojo.i18n has already been loaded. This is true for xdomain builds,
	//since it is included in dojo.xd.js.
	var jsLoc = dojo.i18n.normalizeLocale(locale);

	var bestLocale = "";
	for(var i = 0; i < locales.length; i++){
		//Locale must match from start of string.
		if(!jsLoc.indexOf(locales[i])){
			if(locales[i].length > bestLocale.length){
				bestLocale = locales[i];
			}
		}
	}

	var fixedBestLocale = bestLocale.replace('-', '_');
	//See if the bundle we are going to use is already loaded.
 	var bundleResource = dojo.getObject([moduleName, "nls", bundleName].join("."));
	if(bundleResource && bundleResource[fixedBestLocale] && this.bundle){
		// *** What is this?
		this.bundle[jsLoc.replace('-', '_')] = bundleResource[fixedBestLocale];
	}else{
		//Need to remember what locale we wanted and which one we actually use.
		//Then when we load the one we are actually using, use that bundle for the one
		//we originally wanted.
		var mapName = [moduleName, (fixedBestLocale||"root"), bundleName].join(".");
		var bundleMap = dojo._xdBundleMap[mapName];
		if(!bundleMap){
			bundleMap = dojo._xdBundleMap[mapName] = {};
		}
		bundleMap[jsLoc.replace('-', '_')] = true;
		
		//Do just a normal dojo.require so the resource tracking stuff works as usual.
		dojo.require(moduleName + ".nls" + (bestLocale ? "." + bestLocale : "") + "." + bundleName);
	}
};

// Replace dojo.requireLocalization with a wrapper
dojo._xdRealRequireLocalization = dojo.requireLocalization;
dojo.requireLocalization = function(/*String*/moduleName, /*String*/bundleName, /*String?*/locale, /*String*/availableFlatLocales){
    // summary: loads a bundle intelligently based on whether the module is 
    // local or xd. Overrides the local-case implementation.
    
    var modulePath = this.moduleUrl(moduleName).toString();
    if (this._xdIsXDomainPath(modulePath)) {
        // call cross-domain loader
        return dojo.xdRequireLocalization.apply(dojo, arguments);
    } else {
        // call local-loader
        return dojo._xdRealRequireLocalization.apply(dojo, arguments);
    }
};

//This is a bit brittle: it has to know about the dojo methods that deal with dependencies
//It would be ideal to intercept the actual methods and do something fancy at that point,
//but I have concern about knowing which provide to match to the dependency in that case,
//since scripts can load whenever they want, and trigger new calls to dojo._xdResourceLoaded().
dojo._xdUnpackDependency = function(/*Array*/dep){
	//summary: Internal xd loader function. Determines what to do with a dependency
	//that was listed in an xd version of a module contents.

	//Extract the dependency(ies).
	var newDeps = null;
	var newAfterDeps = null;
	switch(dep[0]){
		case "requireIf":
		case "requireAfterIf":
			//First arg (dep[1]) is the test. Depedency is dep[2].
			if(dep[1] === true){
				newDeps = [{name: dep[2], content: null}];
			}
			break;
		case "platformRequire":
			var modMap = dep[1];
			var common = modMap.common||[];
			newDeps = (modMap[dojo.hostenv.name_]) ? common.concat(modMap[dojo.hostenv.name_]||[]) : common.concat(modMap["default"]||[]);	
			//Flatten the array of arrays into a one-level deep array.
			//Each result could be an array of 3 elements  (the 3 arguments to dojo.require).
			//We only need the first one.
			if(newDeps){
				for(var i = 0; i < newDeps.length; i++){
					if(dojo.isArray(newDeps[i])){
						newDeps[i] = {name: newDeps[i][0], content: null};
					}else{
						newDeps[i] = {name: newDeps[i], content: null};
					}
				}
			}
			break;
		case "require":
			//Just worry about dep[1]
			newDeps = [{name: dep[1], content: null}];
			break;
		case "i18n._preloadLocalizations":
			//We can eval these immediately, since they load i18n bundles.
			//Since i18n bundles have no dependencies, whenever they are loaded
			//in a script tag, they are evaluated immediately, so we do not have to
			//treat them has an explicit dependency for the dependency mapping.
			//We can call it immediately since dojo.i18n is part of dojo.xd.js.
			dojo.i18n._preloadLocalizations.apply(dojo.i18n._preloadLocalizations, dep.slice(1));
			break;
	}

	//The requireIf and requireAfterIf needs to be evaluated after the current resource is evaluated.
	if(dep[0] == "requireAfterIf" || dep[0] == "requireIf"){
		newAfterDeps = newDeps;
		newDeps = null;
	}
	return {requires: newDeps, requiresAfter: newAfterDeps}; //Object
};

dojo._xdWalkReqs = function(){
	//summary: Internal xd loader function. 
	//Walks the requires and evaluates module resource contents in
	//the right order.
	var reqChain = null;
	var req;
	for(var i = 0; i < this._xdOrderedReqs.length; i++){
		req = this._xdOrderedReqs[i];
		if(this._xdDepMap[req]){
			reqChain = [req];
			reqChain[req] = true; //Allow for fast lookup of the req in the array
			this._xdEvalReqs(reqChain);
		}
	}
};

dojo._xdEvalReqs = function(/*Array*/reqChain){
	//summary: Internal xd loader function. 
	//Does a depth first, breadth second search and eval of required modules.
	while(reqChain.length > 0){
		var req = reqChain[reqChain.length - 1];
		var res = this._xdDepMap[req];
		var i, reqs, nextReq;
		if(res){
			//Trace down any requires for this resource.
			//START dojo._xdTraceReqs() inlining for small Safari 2.0 call stack
			reqs = res.requires;
			if(reqs && reqs.length > 0){
				for(i = 0; i < reqs.length; i++){
					nextReq = reqs[i].name;
					if(nextReq && !reqChain[nextReq]){
						//New req depedency. Follow it down.
						reqChain.push(nextReq);
						reqChain[nextReq] = true;
						this._xdEvalReqs(reqChain);
					}
				}
			}
			//END dojo._xdTraceReqs() inlining for small Safari 2.0 call stack

			//Evaluate the resource.

			var contents = this._xdContents[res.contentIndex];
			if(!contents.isDefined){
				var content = contents.content;
				content.resourceName = contents.resourceName;
				content.resourcePath = contents.resourcePath;
				this._xdDefList.push(content);
				contents.isDefined = true;
			}
			this._xdDepMap[req] = null;

			//Trace down any requireAfters for this resource.
			//START dojo._xdTraceReqs() inlining for small Safari 2.0 call stack
			reqs = res.requiresAfter;
			if(reqs && reqs.length > 0){
				for(i = 0; i < reqs.length; i++){
					nextReq = reqs[i].name;
					if(nextReq && !reqChain[nextReq]){
						//New req depedency. Follow it down.
						reqChain.push(nextReq);
						reqChain[nextReq] = true;
						this._xdEvalReqs(reqChain);
					}
				}
			}
			//END dojo._xdTraceReqs() inlining for small Safari 2.0 call stack
		}

		//Done with that require. Remove it and go to the next one.

		reqChain.pop();
	}
};

	dojo._xdClearInterval = function(){
		//summary: Internal xd loader function.
		//Clears the interval timer used to check on the
		//status of in-flight xd module resource requests.
	
		// NOTE: What sets this interval (and using what object?)

		(dojo.global.window || dojo.global).clearInterval(this._xdTimer);
		this._xdTimer = 0;
	};

	dojo._xdWatchInFlight = function(){
		//summary: Internal xd loader function.
		//Monitors in-flight requests for xd module resources.

		var noLoads = "";
		var waitInterval = (dojo.config.xdWaitSeconds || 15) * 1000;
		var expired = (this._xdStartTime + waitInterval) < (new Date()).getTime();

		//If any xdInFlight are true, then still waiting for something to load.
		//Come back later. If we timed out, report the things that did not load.
		for(var param in this._xdInFlight){
			if(this._xdInFlight[param] === true){
				if(expired){
					noLoads += param + " ";
				}else{
					return;
				}
			}
		}

		//All done. Clean up and notify.

		this._xdClearInterval();

		if(expired){
			throw new Error("Could not load cross-domain resources: " + noLoads);
		}

		this._xdWalkReqs();
	
		var defLength = this._xdDefList.length;
		for(var i= 0; i < defLength; i++){
			var content = dojo._xdDefList[i];
			if(dojo.config.debugAtAllCosts && content.resourceName){
				if(!this._xdDebugQueue){
					this._xdDebugQueue = [];
				}
				this._xdDebugQueue.push({resourceName: content.resourceName, resourcePath: content.resourcePath});
			}else{
				//Evaluate the resource to bring it into being.
				//Pass in scope args to allow multiple versions of modules in a page.	
				content.apply(dojo.global, dojo._scopeArgs);
			}
		}

		//Evaluate any resources that were not evaled before.
		//This normally shouldn't happen with proper dojo.provide and dojo.require
		//usage, but providing it just in case. Note that these may not be executed
		//in the original order that the developer intended.

		for(i = 0; i < this._xdContents.length; i++){
			var current = this._xdContents[i];
			if(current.content && !current.isDefined){
				//Pass in scope args to allow multiple versions of modules in a page.	
				current.content.apply(dojo.global, dojo._scopeArgs);
			}
		}

		//Clean up for the next round of xd loading.
		this._xdReset();

		if(this._xdDebugQueue && this._xdDebugQueue.length > 0){
			this._xdDebugFileLoaded();
		}else{
			this._xdNotifyLoaded();
		}
	};

     	dojo._xdNotifyLoaded = function(){

		//Clear in-flight count so we will finally do finish work.

		this._inFlightCount = 0; 
	
		//Only trigger call loaded if dj_load_init has run.

		if(this._initFired && !this._loadNotifying){ 
			this._callLoaded();
		}
	};

}
