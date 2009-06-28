/*=====
dojo.isBrowser = {
	//	example:
	//	|	if(dojo.isBrowser){ ... }
};

dojo.isFF = {
	//	example:
	//	|	if(dojo.isFF > 1){ ... }
};

dojo.isIE = {
	// example:
	//	|	if(dojo.isIE > 6){
	//	|		// we are IE7
	// 	|	}
};

dojo.isSafari = {
	//	example:
	//	|	if(dojo.isSafari){ ... }
	//	example: 
	//		Detect iPhone:
	//	|	if(dojo.isSafari && typeof window.orientation == 'number'){ 
	//	|		// we are iPhone. Note, iPod touch reports "iPod" above and fails this test.
	//	|	}
};

dojo = {
	// isBrowser: Boolean
	//		True if the client is a web-browser
	isBrowser: true,
	//	isFF: Number | undefined
	//		Version as a Number if client is FireFox. undefined otherwise. Corresponds to
	//		major detected FireFox version (1.5, 2, 3, etc.)
	isFF: 0,
	//	isIE: Number | undefined
	//		Version as a Number if client is MSIE(PC). undefined otherwise. Corresponds to
	//		major detected IE version (6, 7, 8, etc.)
	isIE: 0,
	//	isKhtml: Number | undefined
	//		Version as a Number if client is a KHTML browser. undefined otherwise. Corresponds to major
	//		detected version.
	isKhtml: 0,
	//	isWebKit: Number | undefined
	//		Version as a Number if client is a WebKit-derived browser (Konqueror,
	//		Safari, Chrome, etc.). undefined otherwise.
	isWebKit: 0,
	//	isMozilla: Number | undefined
	//		Version as a Number if client is a Mozilla-based browser (Firefox,
	//		SeaMonkey). undefined otherwise. Corresponds to major detected version.
	isMozilla: 0,
	//	isOpera: Number | undefined
	//		Version as a Number if client is Opera. undefined otherwise. Corresponds to
	//		major detected version.
	isOpera: 0,
	//	isSafari: Number | undefined
	//		Version as a Number if client is Safari or iPhone. undefined otherwise.
	isSafari: 0
	//	isChrome: Number | undefined
	//		Version as a Number if client is Chrome browser. undefined otherwise.
	isChrome: 0
}
=====*/

if(typeof window != 'undefined' && window.document){
	dojo.isBrowser = true;
	dojo._name = "browser";

	// attempt to figure out the path to dojo if it isn't set in the config

	(function(){
		var i, doc = window.document;
		var isHostMethod = dojo.isHostMethod;
		var isHostObjectProperty = dojo.isHostObjectProperty;
		var isOwnProperty = dojo.isOwnProperty;
		var config = dojo.config;
		var require = function(name) {
			dojo.require.call(dojo, name);
		};
		var provide = dojo.provide;

		// We set browser versions and grab
		// the URL we were loaded from here.

		// grab the node we were loaded from
		if(doc && isHostMethod(doc, 'getElementsByTagName')){
			var m, src, scripts = doc.getElementsByTagName("script");
			var rePkg = /dojo(\.xd)?\.js(\W|$)/i;

			for(i = 0; i < scripts.length; i++){
				src = scripts[i].src;

				if(src && (m = src.match(rePkg))){
					// find out where we came from
					if(!config.baseUrl){
						config.baseUrl = src.substring(0, m.index);
					}
					// and find out if we need to modify our behavior
					var cfg = scripts[i].getAttribute("djConfig");
					if(cfg){
						var cfgo = (new Function("return { "+cfg+" };"))();
						for(var x in cfgo){
							if (isOwnProperty(cfgo, x)) {
								config[x] = cfgo[x];
							}
						}
					}
					break; // "first Dojo wins"
				}
			}
		}
		dojo.baseUrl = config.baseUrl;

		// fill in the rendering support information in dojo.render.*
		var n = window.navigator,
			de = doc.documentElement,
			dua = n.userAgent,
			dav = n.appVersion,
			tv = parseFloat(dav);

		if(isHostObjectProperty(window, 'opera') && Object.prototype.toString.call(window.opera) == '[object Opera]'){
			dojo.isOpera = tv;
		} else if (de) {

			// Konquerer

			if (typeof de.style.KhtmlOpacity == 'string') {				
				dojo.isKhtml = tv;

			// Mozilla

			} else if (typeof de.style.MozOpacity == 'string'){
				dojo.isMozilla = dojo.isMoz = tv;
				if (isHostMethod(doc, 'getBoxObjectFor')) {
					dojo.isFF = isHostMethod(doc.documentElement, 'getBoundingClientRect') ? 3 : 2;
				} else {
					dojo.isFF = 4; // NOTE: Should be removed by then
				}

			// IE

			} else if(isHostObjectProperty(doc, 'all') && isHostMethod(window, 'ActiveXObject') && isHostMethod(doc, 'attachEvent') && !isHostMethod(doc, 'addEventListener') && isHostObjectProperty(window, 'external')){
				//In cases where the page has an HTTP header or META tag with
				//X-UA-Compatible, then it is in emulation mode, for a previous
				//version. Make sure isIE reflects the desired version.

				if(typeof doc.documentMode == 'number'){
					dojo.isIE = doc.documentMode;
					dojo.isReallyIE8OrGreater = true;
				} else if (typeof doc.compatMode == 'string') {
					dojo.isIE = isHostMethod(window, 'XMLHttpRequest') ? 7 : 6;
				} else {
					dojo.isIE = 5;
				}

				//Workaround to get local file loads of dojo to work on IE 7
				//by forcing to not use native xhr.
				if(isHostMethod(window, 'ActiveXObject') && window.location.protocol == "file:"){
					config.ieForceActiveXXhr=true;
				}

				// 	In Internet Explorer. readyState will not be achieved on init
				// 	call, but dojo doesn't need it however, we'll include it
				// 	because we don't know if there are other functions added that
				// 	might.  Note that this has changed because the build process
				// 	strips all comments -- including conditional ones.

				if(!config.afterOnLoad && isHostMethod(doc, 'write')){

					// NOTE: Replace this with interval that watches for closing HTML tag

					// doc.write('<script defer src="//:" onreadystatechange="if(this.readyState==\'complete\'){' + dojo._scopeName + '._loadInit();}"></script>');
				}

				// NOTE: Should be in VML module

				if (isHostObjectProperty(doc, 'namespaces') && isHostMethod(window.document.namespaces, 'add')) {
					doc.namespaces.add("v","urn:schemas-microsoft-com:vml");
					if (isHostMethod(doc, 'createStyleSheet')) {
						doc.createStyleSheet().addRule("v\\:*", "behavior:url(#default#VML); display:inline-block");
					}
				}

			// Webkit
			
			} else if (typeof de.style.webkitOpacity == 'string' || typeof de.style.webkitTransition == 'string') {
				dojo.isWebKit = parseFloat(dua.split("WebKit/")[1]) || 1;

				// NOTE: Object inferences for AIR, Chrome and Safari?

				dojo.isChrome = parseFloat(dua.split("Chrome/")[1]) || undefined;

				var index = Math.max(dav.indexOf("WebKit"), dav.indexOf("Safari"), 0);
				if(index && !dojo.isChrome){

					// Try to grab the explicit Safari version first. If we don't get
					// one, look for lack of hasOwnProperty

					dojo.isSafari = parseFloat(dav.split("Version/")[1]);
					if(!dojo.isSafari || !Object.prototype.hasOwnProperty){
						dojo.isSafari = 2;
					}
				}
				if(dua.indexOf("AdobeAIR") >= 0){
					dojo.isAIR = 1;
				}

				// NOTE: Detect orientationchange event

				if (typeof window.orientation == 'number') {
					dojo.isIPhone = 1; // NOTE: Or the like?
				}
			}
		}

		var cm = doc.compatMode || '';

		// This covers all quirks modes, so isn't very useful for inferences
		// Should be deprecated

		dojo.isQuirks = !(/css/i.test(cm));

		dojo.locale = (config.locale || (n.userLanguage || n.language) || (doc.documentElement && de.lang) || '').toLowerCase();

		dojo._XMLHTTP_PROGIDS = ['Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.3.0', 'Msxml2.XMLHTTP.6.0'];

		dojo._xhrObj = function(){
			// summary: 
			//		does the work of portably generating a new XMLHTTPRequest object.
			var http, last_e;
			if(window.XMLHttpRequest && !config.ieForceActiveXXhr){
				try{ http = new XMLHttpRequest(); }catch(e){}
			}
			if(!http && dojo.global.ActiveXObject){
				for(i=3; i--;){
					var progid = dojo._XMLHTTP_PROGIDS[i];
					try{
						http = new dojo.global.ActiveXObject(progid);
					}catch(e2){
						last_e = e2;
					}

					if(http){
						dojo._XMLHTTP_PROGIDS = [progid];  // so faster next time
						break;
					}
				}
			}

			if(!http){
				throw new Error("XMLHTTP not available: "+last_e);
			}

			return http; // XMLHTTPRequest instance
		};

		dojo._isDocumentOk = function(http){
			var stat = http.status || 0;
			return (stat >= 200 && stat < 300) || 	// Boolean
				stat == 304 || 						// allow any 2XX response code
				stat == 1223 || 						// get it out of the cache
				(!stat && (window.location.protocol=="file:" || window.location.protocol=="chrome:") ); // Internet Explorer mangled the status code
		};

		//See if base tag is in use.
		//This is to fix http://trac.dojotoolkit.org/ticket/3973,
		//but really, we need to find out how to get rid of the dojo._Url reference
		//below and still have DOH work with the dojo.i18n test following some other
		//test that uses the test frame to load a document (trac #2757).
		//Opera still has problems, but perhaps a larger issue of base tag support
		//with XHR requests (hasBase is true, but the request is still made to document
		//path, not base path).
		var owloc = window.location.href;
		var base = doc.getElementsByTagName("base");
		var hasBase;
		var baseIndex = base.length;

		while (baseIndex--) {
			if (base[baseIndex].href) {
				hasBase = true;
				break;
			}
		}

		dojo._initFired = false;
		dojo._loadInit = function(e){

			// NOTE: What is this flag for?

			dojo._initFired = true;

			// allow multiple calls, only first one will take effect
			// A bug in khtml calls events callbacks for document for events which are not supported
			// for example a created contextmenu event calls DOMContentLoaded

			var type = e && e.type ? e.type.toLowerCase() : "load";
			if(!arguments.callee.initialized && (type == "domcontentloaded" || type == "load")){
				arguments.callee.initialized = true;
				if(dojo._khtmlTimer){
					window.clearInterval(dojo._khtmlTimer);
					delete dojo._khtmlTimer;
				}

				if(!dojo._inFlightCount){
					dojo._modulesLoaded();
				}
			}
		};

		var emptyFunction = function() {};

		dojo._getText = function(/*URI*/ uri, /*Boolean*/ fail_ok, /*Function*/ cb){

			// summary: Read the contents of the specified uri and return those contents.
			// uri:
			//		A relative or absolute uri. If absolute, it still must be in
			//		the same "domain" as we are.
			// fail_ok:
			//		Default false. If fail_ok and loading fails, return null
			//		instead of throwing.
			// cb:
			//		Callback
			//              Requests are asynchronous only in the event that cb is passed (and config.syncXhrForModules is false)
			//
			// returns: The response text. null is returned when there is a
			//		failure and failure is okay (an exception otherwise)

			var http = this._xhrObj();
			var async = cb && this.config.syncXhrForModules === false;

			if(!hasBase && dojo._Url){
				uri = (new dojo._Url(owloc, uri)).toString();
			}

			if(config.cacheBust){
				uri += (uri.indexOf("?") == -1 ? "?" : "&") + String(config.cacheBust).replace(/\W+/g,"");
			}

			try {
				if (async) {
					http.onreadystatechange = function() {
						if (http.readyState == 4) {
							if (dojo._isDocumentOk(http)) {
								cb(http.responseText);
								http.onreadystatechange = emptyFunction;
							}
						}
					};
				}
				http.open('GET', uri, async);
			}catch(e) {
				if(fail_ok){ return null; } // null
				// re-throw the exception
				throw e;				
			}
			try{
				http.send(null);
				if(!async && !dojo._isDocumentOk(http)){
					var err = new Error("Unable to load "+uri+" status:"+ http.status);					
					throw err;
				}
			}catch(e3){
				if(fail_ok){ return null; } // null
				// re-throw the exception
				throw e3;
			}

			if (async) {
				return true; // Boolean - indicates pending response
			} else {
				if (cb) {
					cb(http.responseText);
				}
				return http.responseText;  // String
			}
		};
		
		// NOTE: Odd name
		var _handleNodeEvent = function(/*String*/evtName, /*Function*/fp){
			// summary:
			//		non-destructively adds the specified function to the node's
			//		evtName handler.
			// evtName: should be in the form "onclick" for "onclick" handlers.
			// Make sure you pass in the "on" part.
			var oldHandler = window[evtName];
			window[evtName] = function(){
				fp.apply(window, arguments);
				if (oldHandler) { oldHandler.apply(window, arguments); }
			};
		};


		dojo._windowUnloaders = [];
		
		dojo.windowUnloaded = function(){
			// summary:
			//		signal fired by impending window destruction. You may use
			//		dojo.addOnWindowUnload() to register a listener for this
			//		event. NOTE: if you wish to dojo.connect() to this method
			//		to perform page/application cleanup, be aware that this
			//		event WILL NOT fire if no handler has been registered with
			//		dojo.addOnWindowUnload. This behavior started in Dojo 1.3.
			//		Previous versions always triggered dojo.windowUnloaded. See
			//		dojo.addOnWindowUnload for more info.
			var mll = dojo._windowUnloaders;
			while(mll.length){
				(mll.pop())();
			}
		};

		var _onWindowUnloadAttached = 0;
		dojo.addOnWindowUnload = function(/*Object?|Function?*/obj, /*String|Function?*/functionName){
			// summary:
			//		registers a function to be triggered when window.onunload
			//		fires. 
			//	description:
			//		The first time that addOnWindowUnload is called Dojo
			//		will register a page listener to trigger your unload
			//		handler with. Note that registering these handlers may
			//		destroy "fastback" page caching in browsers that support
			//		it. Be careful trying to modify the DOM or access
			//		JavaScript properties during this phase of page unloading:
			//		they may not always be available. Consider
			//		dojo.addOnUnload() if you need to modify the DOM or do
			//		heavy JavaScript work since it fires at the eqivalent of
			//		the page's "onbeforeunload" event.
			// example:
			//	|	dojo.addOnWindowUnload(functionPointer)
			//	|	dojo.addOnWindowUnload(object, "functionName");
			//	|	dojo.addOnWindowUnload(object, function(){ /* ... */});

			dojo._onto(dojo._windowUnloaders, obj, functionName);
			if(!_onWindowUnloadAttached){
				_onWindowUnloadAttached = 1;
				_handleNodeEvent("onunload", dojo.windowUnloaded);
			}
		};

		var _onUnloadAttached = 0;
		dojo.addOnUnload = function(/*Object?|Function?*/obj, /*String|Function?*/functionName){
			// summary:
			//		registers a function to be triggered when the page unloads.
			//	description:
			//		The first time that addOnUnload is called Dojo will
			//		register a page listener to trigger your unload handler
			//		with. 
			//
			//		In a browser enviroment, the functions will be triggered
			//		during the window.onbeforeunload event. Be careful of doing
			//		too much work in an unload handler. onbeforeunload can be
			//		triggered if a link to download a file is clicked, or if
			//		the link is a javascript: link. In these cases, the
			//		onbeforeunload event fires, but the document is not
			//		actually destroyed. So be careful about doing destructive
			//		operations in a dojo.addOnUnload callback.
			//
			//		Further note that calling dojo.addOnUnload will prevent
			//		browsers from using a "fast back" cache to make page
			//		loading via back button instantaneous. 
			// example:
			//	|	dojo.addOnUnload(functionPointer)
			//	|	dojo.addOnUnload(object, "functionName")
			//	|	dojo.addOnUnload(object, function(){ /* ... */});

			dojo._onto(dojo._unloaders, obj, functionName);
			if(!_onUnloadAttached){
				_onUnloadAttached = 1;
				_handleNodeEvent("onbeforeunload", dojo.unloaded);
			}
		};
		if(!config.afterOnLoad){
			if(isHostMethod(doc, 'addEventListener')){				
				if(config.syncXhrForModules !== false && config.enableMozDomContentLoaded !== false){
					doc.addEventListener("DOMContentLoaded", dojo._loadInit, false);
				}
			}

			if (isHostMethod(window, 'addEventListener')) {
				window.addEventListener("load", dojo._loadInit, false);
			}

			if(!dojo.isIE && typeof doc.readyState == 'string' && isHostMethod(window, 'setInterval')){
				dojo._khtmlTimer = window.setInterval(function(){
					if(/loaded|complete/i.test(window.document.readyState)){
						dojo._loadInit(); // call the onload handler
					}
				}, 10);
			}
		}

		//Register any module paths set up in djConfig. Need to do this
		//in the hostenvs since hostenv_browser can read djConfig from a
		//script tag's attribute.

		var mp = config.modulePaths;
		if(mp){
			for(var param in mp){
				if (isOwnProperty(mp, param)) {
					dojo.registerModulePath(param, mp[param]);
				}
			}
		}

		//Load debug code if necessary.

		if(config.isDebug){
			require("dojo._firebug.firebug");
		}

		if(config.debugAtAllCosts){
			config.useXDomain = true;
			require("dojo._base._loader.loader_xd");
			require("dojo._base._loader.loader_debug");
			require("dojo.i18n");
		}

		provide("dojo._base"); // All environments
		provide("dojo._base.browser");

		require("dojo._base.lang");
		require("dojo._base.declare");
		require("dojo._base.Deferred");
		require("dojo._base.array");
		require("dojo._base.Color");
		require("dojo._base.window");

		if (!config.noQuery) {
			require("dojo._base.query");
		}
		if (!config.noJson) { // FIXME: XHR should not require JSON
			require("dojo._base.json");
			if (!config.noXhr) {
				if (config.noQuery) {
					throw new Error("XHR requires query"); // FIXME: XHR should not be tangled with query
				}
				require("dojo._base.xhr");
			}
		}

		if (!config.noHtml) {
			require("dojo._base.html");
		}

		if (!config.noNodeList) {
			require("dojo._base.NodeList");
		}

		if (!config.noConnect) {
			require("dojo._base.connect");

			if (!config.noFx) {
				if (config.noHtml) {
					throw new Error("FX requires HTML");
				}
				if (config.noNodeList) {
					throw new Error("FX requires NodeList"); // FIXME: FX should not require NodeList
				}
				require("dojo._base.fx");
			}
			if (!config.noEvent) {
				require("dojo._base.event");
			}
		}

		//Need this to be the last code segment in base, so do not place any
		//requireIf calls in this file. Otherwise, due to how the build system
		//puts all requireIf dependencies after the current file, the require calls
		//could be called before all of base is defined.

		var configRequire = config.require;

		for (var j in configRequire) {
			if (isOwnProperty(configRequire, j)) {
				require(j);
			}
		}

		n = doc = de = null; // Discard host object references
	})();
}
