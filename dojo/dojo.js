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

/*
note:
	'djConfig' does not exist under 'dojo.*' so that it can be set before the
	'dojo' variable exists.

note:
	Setting any of these variables *after* the library has loaded does
	nothing at all.

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
	//		where you have renamed `dojo.js`, the variable `dojo.baseUrl` is assigned
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
*/

var dojo, djConfig;

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

		// NOTE: Script injection here if post load

		return (new Function(arguments[0]))();
	};

	// for-in filter

	dojo.isOwnProperty = function(o, p) {
		var prop = o.constructor.prototype[p];
		return typeof prop == 'undefined' || prop !== o[p];
	};

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

	dojo.config = {};

	(function(){

		// Feature detection

		var reFeaturedMethod = new RegExp('^(function|object)$', 'i');

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

		// For application gateways to detect one or more API methods

		dojo.areFeatures = function() {
			var i = arguments.length;
			while (i--) {
				if (!dojo[arguments[i]]) {
					return false;
				}
			}
			return true;
		};

		dojo.areNSFeatures = function(ns) {
			ns = dojo[ns];
			if (ns) {
				var features = Array.prototype.slice.call(arguments, 1);
				var i = features.length;
				while (i--) {
					if (!ns[features[i]]) {
						return false;
					}
				}
				return true;
			}
			return false;
		};

		dojo._getWin = function() {
			return dojo.global.window || dojo.global;
		};

		var hostEnv, isRhino, isSpidermonkey, isFFExt, jaxerLoad;
		var getWin = dojo._getWin;
		var isHostMethod = dojo.isHostMethod;
		var isHostObjectProperty = dojo.isHostObjectProperty;
		var win = getWin();
		var doc = win.document;

		// NOTE: Need build exclude directives for these checks

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

			// NOTE: Need real test for this environment

			isSpidermonkey = true;
			hostEnv = "spidermonkey";
		}else if(
			isHostObjectProperty(this, 'ChromeWindow') &&
			win instanceof this.ChromeWindow &&
			isHostObjectProperty(this, 'Components')){
			try {
				isFFExt = (this.Components.classes["@mozilla.org/moz/jssubscript-loader;1"]) || true;
				hostEnv = "ff_ext";
			} catch(e) {
				// Permission denied if not plug-in
			}
		}

		// All else fails, assume browser

		if (!hostEnv) {
			hostEnv = "browser";
		}

		// NOTE: In which environments is this possible?

		if (this.Jaxer && this.Jaxer.isOnServer) {
			jaxerLoad = true;
			this.load = this.Jaxer.load;
		}

		// NOTE: Clean up variable names

		var cfg, cfgo, config, i, l, m, rePkg, src, scripts, scriptPath, x;
		var isOwnProperty = dojo.isOwnProperty;

		dojo.config = config = djConfig || {};

		if (!config.baseUrl && isSpidermonkey){

			// Detect the base path via an exception.

			try{
				throw new Error(""); 
			} catch(e2) {
				var uri = e2.fileName || e2.sourceURL;
				if (typeof uri == 'string' && uri && uri.indexOf('dojo.js') != -1) {
					config.baseUrl = uri.split("dojo.js")[0];
				}
			}
		}

		if (doc && isHostMethod(doc, 'getElementsByTagName')){

			// For browsers and browser extensions
			// Detect Dojo path (if not already specified) and parse djConfig attribute if present

			scripts = doc.getElementsByTagName("script");
			l = scripts.length;
			rePkg = /^(.*)(\\|\/)dojo\.js\W*$/i;

			// First match wins

			for(i = 0; !scriptPath && i < l; i++){
				src = scripts[i].src;
				if(src){
					m = src.match(rePkg);
					if(m){
						cfg = scripts[i].getAttribute("djConfig");
						if (cfg) {

							// NOTE: Attribute overrides declared djConfig object

							cfgo = (new Function("return { " + cfg + " };"))();
							for (x in cfgo){
								if (isOwnProperty(cfgo, x)) {
									config[x] = cfgo[x];
								}
							}
						}
						scriptPath = m[1] + m[2];
					}						
				}
			}

			// Use indicated base or fall back to script path
			
			dojo.baseUrl = config.baseUrl || scriptPath;

			if (!dojo.baseUrl) {
				console.warn('Could not determine base path (using document path.)');
				dojo.baseUrl = "./";
			}
		}

		var done, envScript = dojo.baseUrl + "_base/_loader/hostenv_" + hostEnv + ".js";
		
		if ((isRhino || isSpidermonkey || jaxerLoad) && isHostMethod(this, 'load')){
			try {
				this.load(envScript);
				done = (isRhino && dojo.isRhino) || (isSpidermonkey && dojo.isSpidermonkey) || jaxerLoad;
			} catch(e3) {
			}
		}
		if(!done && isFFExt){
			try {
				var loader = this.Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(this.Components.interfaces.mozIJSSubScriptLoader);
				if (loader && isHostMethod(loader, 'loadSubScript')) {
					loader.loadSubScript(envScript, this);
					done = dojo.isFFExt;
				}
			} catch(e4) {
			}
		}
		if (!done) {
			try{
				doc.write("<script type='text/javascript' src='" + envScript + "'></script>");
			}catch(e5){
				// XML parse mode or other environment without document.write

				// NOTE: XML parse mode won't work with these scripts
				//       The HEAD element is not closed at this point,
				//       so mutation is ill-advised

				throw new Error('Failed to load environment (' + (e5.description || e5) + ')');
			}
		}

		// Discard host object references

		win = scripts = doc = null;
	})();
}

(function(){
	var isOwnProperty = dojo.isOwnProperty;

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

	// Create placeholders for dijit and dojox for scoping code.

	if(typeof this.dijit == "undefined"){
		this.dijit = {_scopeName: "dijit"};
	}
	if(typeof this.dojox == "undefined"){
		this.dojox = {_scopeName: "dojox"};
	}

	// NOTE: Review this
	
	if(!dojo._scopeArgs){
		dojo._scopeArgs = [this.dojo, this.dijit, this.dojox];
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

		if (props) { // For backward compatibility
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

		if (!obj) { obj = {}; }
		for(var i = 1, l = arguments.length; i < l; i++){
			dojo._mixin(obj, arguments[i]);
		}
		return obj; // Object
	};

	dojo._getProp = function(/*Array*/parts, /*Boolean*/create, /*Object*/context){
		var obj = context || dojo.global;

		for(var i = 0, p; obj && (p=parts[i]); i++){
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

	// Stubs for functions declared in dojo._firebug.firebug.

	dojo.deprecated = dojo.experimental = function(){};

	dojo.mixin(dojo, {
		_loadedModules: {},
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
		
		// NOTE: Lots of test files push on this directly instead of using dojo.addOnLoad.

		_loaders: [],
		_unloaders: [],
		_loadNotifying: false
	});

	dojo._protocolPattern = /^\w+:/;

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

		// NOTE: The relpath argument is supposed to be a relative path. (?)

		var absolute = this._protocolPattern.test(relpath) || relpath.charAt(0) == "/";
		var uri = relpath;

		if (!absolute) {
			uri = this.baseUrl + uri;
		} else {
			console.warn('Path should be relative: ' + relpath + '.');
		}

		if (this._postLoad || !this._writeScript) {
			return module ? this._loadUriAndCheck(uri, module, cb) : this._loadUri(uri, cb); // Boolean
		} else {

			// NOTE: Like XD, can't signal whether file was found
			//       Doesn't matter as failure should be immediately apparent

			this._writeScript(uri);			
			return true;
		}
	};

	var dojoEval = dojo['eval'];

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
			console.warn(uri + ' already loaded.');
			return true; // Boolean
		}

		var getTextFinished = function(contents) {
			dojo._loadedUrls[uri] = true;
			dojo._loadedUrls.push(uri);
			if(cb){
				contents = '(' + contents + ')';
			}else{

				// Only do the scoping if no callback. If a callback is specified,
				// it is most likely the i18n bundle stuff.

				// NOTE: Review this

				contents = dojo._scopePrefix + contents + dojo._scopeSuffix;
			}

			var result;

			// NOTE: Second argument means return value will be ignored

			result = dojoEval(contents, !cb);
		
			if(cb){
				cb(result);
			}
		};

		return !!(this._getText(uri, true, getTextFinished));
	};

	dojo._loadUriAndCheck = function(/*String*/uri, /*String*/moduleName, /*Function?*/cb){

		// summary: calls loadUri and checks that it loaded synchronously

		console.warn('Synchronous downloads should be avoided.');
		
		return !!(this._loadUri(uri, cb) && this._loadedModules[moduleName]); // Boolean
	};

	dojo.loaded = function(){

		// summary:
		//		Called when initial environment and package loading is
		//		complete. You should use dojo.addOnLoad() instead of doing a 
		//		direct dojo.connect() to this method in order to handle
		//		initialization tasks that require the environment to be
		//		initialized. In a browser host,	declarative widgets will 
		//		be constructed when this function	finishes runing.

		this._loadNotifying = true;
		this._postLoad = true;
		var x, len, mll = this._loaders;

		// Clear listeners so new ones can be added
		// For modules loaded after the initial load.

		this._loaders = [];

		for(x = 0, len = mll.length; x < len; x++){
			mll[x]();
		}

		this._loadNotifying = false;
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
	};

	// Support calling dojo.addOnLoad via djConfig.addOnLoad. Support all the
	// call permutations of dojo.addOnLoad. Mainly useful when dojo is added
	// to the page after the page has loaded.

	var dca = dojo.config.addOnLoad;
	if(dca){
		dojo.addOnLoad[Object.prototype.toString.call(dca) == '[object Array]' ? "apply" : "call"](dojo, dca);
	}

	dojo._modulesLoaded = function(){
		if(this._postLoad){
			console.warn('Modules already loaded.');
		} else {			
			this._callLoaded();
		}
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

	dojo.required = function(/*String*/moduleName) {

		//	summary: Throws an exception is the module has not been loaded and executed

		if (!this._loadedModules[moduleName]){
			throw new Error('Missing dependency: ' + moduleName + '.');
		}		
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

		omitModuleCheck = dojo._global_omit_module_check || omitModuleCheck;

		// Check if it is already loaded.

		module = dojo._loadedModules[moduleName];
		if (module){
			console.warn(moduleName + ' is already loaded.');
			return module;
		}

		// convert periods to slashes

		relpath = dojo._getModuleSymbols(moduleName).join("/") + '.js';

		ok = dojo._loadPath(relpath, omitModuleCheck ? null : moduleName, null);

		if (!omitModuleCheck) {
			if(!ok){
				throw new Error("Could not load '" + moduleName + "'; last tried '" + relpath + "'");
			}

			// Check that the symbol was defined
			// Don't bother if we're doing xdomain (asynchronous) loading (or writing scripts during loading.)

			if(!dojo._isXDomain && !dojo._writeScript){
				module = dojo._loadedModules[moduleName];
				if(!module){
					throw new Error("Symbol '" + moduleName + "' failed to load from '" + relpath + "'"); 
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

		for(var x = 0; x<result.length; x++){
			var curr = result[x];
			if(dojo.isArray(curr)){
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
			
			dojo.require.apply(dojo, Array.prototype.slice.call(arguments, 1));
		}
	};

	// NOTE: Is this for compatibility with old versions?

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

		// NOTE: The require call does not belong here

		this.require("dojo.i18n");
		var args = Array.prototype.slice.call(arguments, 0);

		var _applyLocalization = function() {
			if (dojo.i18n) {
				dojo.i18n._requireLocalization.apply(dojo.hostenv, args);
			} else {

				// NOTE: Should not get here under normal circumstances (require rules are followed)
			}
		};

		_applyLocalization();
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

		if(loc){
			if (loc.lastIndexOf("/") != loc.length - 1){
				loc += "/";
			}
		
			// Add base to relative path

			if (!dojo._protocolPattern.test(loc) && loc.charAt(0) != "/"){
				loc = dojo.baseUrl + loc;
			}

			return new dojo._Url(loc, url); // String
		}

		return null;
	};
})();