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
	//	|	if(dojo.isSafari && navigator.userAgent.indexOf("iPhone") != -1){ 
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
	isFF: 2,
	//	isIE: Number | undefined
	//		Version as a Number if client is MSIE(PC). undefined otherwise. Corresponds to
	//		major detected IE version (6, 7, 8, etc.)
	isIE: 6,
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

//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
if(typeof window != 'undefined'){
//>>excludeEnd("webkitMobile");
	dojo.isBrowser = true;
	dojo._name = "browser";


	// attempt to figure out the path to dojo if it isn't set in the config
//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	(function(){
		var d = dojo;
//>>excludeEnd("webkitMobile");

		// this is a scope protection closure. We set browser versions and grab
		// the URL we were loaded from here.

		// grab the node we were loaded from
		if(document && document.getElementsByTagName){
			var scripts = document.getElementsByTagName("script");
			var rePkg = /dojo(\.xd)?\.js(\W|$)/i;
			for(var i = 0; i < scripts.length; i++){
				var src = scripts[i].getAttribute("src");
				if(!src){ continue; }
				var m = src.match(rePkg);
				if(m){
					// find out where we came from
					if(!d.config.baseUrl){
						d.config.baseUrl = src.substring(0, m.index);
					}
					// and find out if we need to modify our behavior
					var cfg = scripts[i].getAttribute("djConfig");
					if(cfg){
						var cfgo = eval("({ "+cfg+" })");
						for(var x in cfgo){
							dojo.config[x] = cfgo[x];
						}
					}
					break; // "first Dojo wins"
				}
			}
		}
		d.baseUrl = d.config.baseUrl;

		// fill in the rendering support information in dojo.render.*
		var n = navigator;
		var dua = n.userAgent,
			dav = n.appVersion,
			tv = parseFloat(dav);

		if(dua.indexOf("Opera") >= 0){ d.isOpera = tv; }
		if(dua.indexOf("AdobeAIR") >= 0){ d.isAIR = 1; }
		d.isKhtml = (dav.indexOf("Konqueror") >= 0) ? tv : 0;
		d.isWebKit = parseFloat(dua.split("WebKit/")[1]) || undefined;
		d.isChrome = parseFloat(dua.split("Chrome/")[1]) || undefined;

		// safari detection derived from:
		//		http://developer.apple.com/internet/safari/faq.html#anchor2
		//		http://developer.apple.com/internet/safari/uamatrix.html
		var index = Math.max(dav.indexOf("WebKit"), dav.indexOf("Safari"), 0);
		if(index && !dojo.isChrome){
			// try to grab the explicit Safari version first. If we don't get
			// one, look for less than 419.3 as the indication that we're on something
			// "Safari 2-ish".
			d.isSafari = parseFloat(dav.split("Version/")[1]);
			if(!d.isSafari || parseFloat(dav.substr(index + 7)) <= 419.3){
				d.isSafari = 2;
			}
		}

		//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		if(dua.indexOf("Gecko") >= 0 && !d.isKhtml && !d.isWebKit){ d.isMozilla = d.isMoz = tv; }
		if(d.isMoz){
			//We really need to get away from this. Consider a sane isGecko approach for the future.
			d.isFF = parseFloat(dua.split("Firefox/")[1]) || parseFloat(dua.split("Minefield/")[1]) || parseFloat(dua.split("Shiretoko/")[1]) || undefined;
		}
		if(document.all && !d.isOpera){
			d.isIE = parseFloat(dav.split("MSIE ")[1]) || undefined;
			//In cases where the page has an HTTP header or META tag with
			//X-UA-Compatible, then it is in emulation mode, for a previous
			//version. Make sure isIE reflects the desired version.
			//document.documentMode of 5 means quirks mode.
			if(d.isIE >= 8 && document.documentMode != 5){
				d.isIE = document.documentMode;
			}
		}

		//Workaround to get local file loads of dojo to work on IE 7
		//by forcing to not use native xhr.
		if(dojo.isIE && window.location.protocol === "file:"){
			dojo.config.ieForceActiveXXhr=true;
		}
		//>>excludeEnd("webkitMobile");

		var cm = document.compatMode;
		d.isQuirks = cm == "BackCompat" || cm == "QuirksMode" || d.isIE < 6;

		// TODO: is the HTML LANG attribute relevant?
		d.locale = dojo.config.locale || (d.isIE ? n.userLanguage : n.language).toLowerCase();

		// These are in order of decreasing likelihood; this will change in time.
		//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		d._XMLHTTP_PROGIDS = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
		//>>excludeEnd("webkitMobile");

		d._xhrObj = function(){
			// summary: 
			//		does the work of portably generating a new XMLHTTPRequest object.
			var http, last_e;
			//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
			if(!dojo.isIE || !dojo.config.ieForceActiveXXhr){
			//>>excludeEnd("webkitMobile");
				try{ http = new XMLHttpRequest(); }catch(e){}
			//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
			}
			if(!http){
				for(var i=0; i<3; ++i){
					var progid = d._XMLHTTP_PROGIDS[i];
					try{
						http = new ActiveXObject(progid);
					}catch(e){
						last_e = e;
					}

					if(http){
						d._XMLHTTP_PROGIDS = [progid];  // so faster next time
						break;
					}
				}
			}
			//>>excludeEnd("webkitMobile");

			if(!http){
				throw new Error("XMLHTTP not available: "+last_e);
			}

			return http; // XMLHTTPRequest instance
		}

		d._isDocumentOk = function(http){
			var stat = http.status || 0;
			return (stat >= 200 && stat < 300) || 	// Boolean
				stat == 304 || 						// allow any 2XX response code
				stat == 1223 || 						// get it out of the cache
				(!stat && (location.protocol=="file:" || location.protocol=="chrome:") ); // Internet Explorer mangled the status code
		}

		//See if base tag is in use.
		//This is to fix http://trac.dojotoolkit.org/ticket/3973,
		//but really, we need to find out how to get rid of the dojo._Url reference
		//below and still have DOH work with the dojo.i18n test following some other
		//test that uses the test frame to load a document (trac #2757).
		//Opera still has problems, but perhaps a larger issue of base tag support
		//with XHR requests (hasBase is true, but the request is still made to document
		//path, not base path).
		var owloc = window.location+"";
		var base = document.getElementsByTagName("base");
		var hasBase = (base && base.length > 0);

		d._getText = function(/*URI*/ uri, /*Boolean*/ fail_ok){
			// summary: Read the contents of the specified uri and return those contents.
			// uri:
			//		A relative or absolute uri. If absolute, it still must be in
			//		the same "domain" as we are.
			// fail_ok:
			//		Default false. If fail_ok and loading fails, return null
			//		instead of throwing.
			// returns: The response text. null is returned when there is a
			//		failure and failure is okay (an exception otherwise)

			// NOTE: must be declared before scope switches ie. this._xhrObj()
			var http = this._xhrObj();

			if(!hasBase && dojo._Url){
				uri = (new dojo._Url(owloc, uri)).toString();
			}

			if(d.config.cacheBust){
				//Make sure we have a string before string methods are used on uri
				uri += "";
				uri += (uri.indexOf("?") == -1 ? "?" : "&") + String(d.config.cacheBust).replace(/\W+/g,"");
			}

			http.open('GET', uri, false);
			try{
				http.send(null);
				if(!d._isDocumentOk(http)){
					var err = Error("Unable to load "+uri+" status:"+ http.status);
					err.status = http.status;
					err.responseText = http.responseText;
					throw err;
				}
			}catch(e){
				if(fail_ok){ return null; } // null
				// rethrow the exception
				throw e;
			}
			return http.responseText; // String
		}
		

		var _w = window;
		var _handleNodeEvent = function(/*String*/evtName, /*Function*/fp){
			// summary:
			//		non-destructively adds the specified function to the node's
			//		evtName handler.
			// evtName: should be in the form "onclick" for "onclick" handlers.
			// Make sure you pass in the "on" part.
			var oldHandler = _w[evtName] || function(){};
			_w[evtName] = function(){
				fp.apply(_w, arguments);
				oldHandler.apply(_w, arguments);
			};
		};


		d._windowUnloaders = [];
		
		d.windowUnloaded = function(){
			// summary:
			//		signal fired by impending window destruction. You may use
			//		dojo.addOnWindowUnload() to register a listener for this
			//		event. NOTE: if you wish to dojo.connect() to this method
			//		to perform page/application cleanup, be aware that this
			//		event WILL NOT fire if no handler has been registered with
			//		dojo.addOnWindowUnload. This behavior started in Dojo 1.3.
			//		Previous versions always triggered dojo.windowUnloaded. See
			//		dojo.addOnWindowUnload for more info.
			var mll = d._windowUnloaders;
			while(mll.length){
				(mll.pop())();
			}
		};

		var _onWindowUnloadAttached = 0;
		d.addOnWindowUnload = function(/*Object?|Function?*/obj, /*String|Function?*/functionName){
			// summary:
			//		registers a function to be triggered when window.onunload
			//		fires. 
			//	description:
			//		The first time that addOnWindowUnload is called Dojo
			//		will register a page listener to trigger your unload
			//		handler with. Note that registering these handlers may
			//		destory "fastback" page caching in browsers that support
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

			d._onto(d._windowUnloaders, obj, functionName);
			if(!_onWindowUnloadAttached){
				_onWindowUnloadAttached = 1;
				_handleNodeEvent("onunload", d.windowUnloaded);
			}
		};

		var _onUnloadAttached = 0;
		d.addOnUnload = function(/*Object?|Function?*/obj, /*String|Function?*/functionName){
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

			d._onto(d._unloaders, obj, functionName);
			if(!_onUnloadAttached){
				_onUnloadAttached = 1;
				_handleNodeEvent("onbeforeunload", dojo.unloaded);
			}
		};

//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	})();
//>>excludeEnd("webkitMobile");

	dojo._initFired = false;
	//	BEGIN DOMContentLoaded, from Dean Edwards (http://dean.edwards.name/weblog/2006/06/again/)
	dojo._loadInit = function(e){
		dojo._initFired = true;
		// allow multiple calls, only first one will take effect
		// A bug in khtml calls events callbacks for document for event which isnt supported
		// for example a created contextmenu event calls DOMContentLoaded, workaround
		var type = e && e.type ? e.type.toLowerCase() : "load";
		if(arguments.callee.initialized || (type != "domcontentloaded" && type != "load")){ return; }
		arguments.callee.initialized = true;
		if("_khtmlTimer" in dojo){
			clearInterval(dojo._khtmlTimer);
			delete dojo._khtmlTimer;
		}

		if(dojo._inFlightCount == 0){
			dojo._modulesLoaded();
		}
	}

	if(!dojo.config.afterOnLoad){
		//	START DOMContentLoaded
		// Mozilla and Opera 9 expose the event we could use
		//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		if(document.addEventListener){
			// NOTE: 
			//		due to a threading issue in Firefox 2.0, we can't enable
			//		DOMContentLoaded on that platform. For more information, see:
			//		http://trac.dojotoolkit.org/ticket/1704
			if(dojo.isWebKit > 525 || dojo.isOpera || dojo.isFF >= 3 || (dojo.isMoz && dojo.config.enableMozDomContentLoaded === true)){
		//>>excludeEnd("webkitMobile");
				document.addEventListener("DOMContentLoaded", dojo._loadInit, null);
		//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
			}
	
			//	mainly for Opera 8.5, won't be fired if DOMContentLoaded fired already.
			//  also used for Mozilla because of trac #1640
			window.addEventListener("load", dojo._loadInit, null);
		}
		//>>excludeEnd("webkitMobile");
	
		//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
		if(dojo.isAIR){
			window.addEventListener("load", dojo._loadInit, null);
		}else if((dojo.isWebKit < 525) || dojo.isKhtml){
			dojo._khtmlTimer = setInterval(function(){
				if(/loaded|complete/.test(document.readyState)){
					dojo._loadInit(); // call the onload handler
				}
			}, 10);
		}
		//>>excludeEnd("webkitMobile");
		//	END DOMContentLoaded
	}

	//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
	if(dojo.isIE){
		// 	for Internet Explorer. readyState will not be achieved on init
		// 	call, but dojo doesn't need it however, we'll include it
		// 	because we don't know if there are other functions added that
		// 	might.  Note that this has changed because the build process
		// 	strips all comments -- including conditional ones.
		if(!dojo.config.afterOnLoad){
			document.write('<scr'+'ipt defer src="//:" '
				+ 'onreadystatechange="if(this.readyState==\'complete\'){' + dojo._scopeName + '._loadInit();}">'
				+ '</scr'+'ipt>'
			);
		}

		try{
			document.namespaces.add("v","urn:schemas-microsoft-com:vml");
			document.createStyleSheet().addRule("v\\:*", "behavior:url(#default#VML);  display:inline-block");
		}catch(e){}
	}
	//>>excludeEnd("webkitMobile");


	/*
	OpenAjax.subscribe("OpenAjax", "onload", function(){
		if(dojo._inFlightCount == 0){
			dojo._modulesLoaded();
		}
	});

	OpenAjax.subscribe("OpenAjax", "onunload", function(){
		dojo.unloaded();
	});
	*/
//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
} //if (typeof window != 'undefined')

//Register any module paths set up in djConfig. Need to do this
//in the hostenvs since hostenv_browser can read djConfig from a
//script tag's attribute.
(function(){
//>>excludeEnd("webkitMobile");
	var mp = dojo.config["modulePaths"];
	if(mp){
		for(var param in mp){
			dojo.registerModulePath(param, mp[param]);
		}
	}
//>>excludeStart("webkitMobile", kwArgs.webkitMobile);
})();
//>>excludeEnd("webkitMobile");

//Load debug code if necessary.
if(dojo.config.isDebug){
	dojo.require("dojo._firebug.firebug");
}

if(dojo.config.debugAtAllCosts){
	dojo.config.useXDomain = true;
	dojo.require("dojo._base._loader.loader_xd");
	dojo.require("dojo._base._loader.loader_debug");
	dojo.require("dojo.i18n");
}
