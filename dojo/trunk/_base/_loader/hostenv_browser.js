if(typeof window != 'undefined'){
	dojo.isBrowser = true;
	dojo._name = "browser";


	// attempt to figure out the path to dojo if it isn't set in the config
	(function(){
		var d = dojo;
		// this is a scope protection closure. We set browser versions and grab
		// the URL we were loaded from here.

		// grab the node we were loaded from
		if(document && document.getElementsByTagName){
			var scripts = document.getElementsByTagName("script");
			var rePkg = /dojo\.js([\?\.]|$)/i;
			for(var i = 0; i < scripts.length; i++){
				var src = scripts[i].getAttribute("src");
				if(!src){ continue; }
				var m = src.match(rePkg);
				if(m){
					// find out where we came from
					if(!djConfig["baseUrl"]){
						djConfig["baseUrl"] = src.substring(0, m.index);
					}
					// and find out if we need to modify our behavior
					var cfg = scripts[i].getAttribute("djConfig");
					if(cfg){
						var cfgo = eval("({ "+cfg+" })");
						for(var x in cfgo){
							djConfig[x] = cfgo[x];
						}
					}
					break; // "first Dojo wins"
				}
			}
		}
		d._baseUrl = djConfig["baseUrl"];

		// fill in the rendering support information in dojo.render.*
		var n = navigator;
		var dua = n.userAgent;
		var dav = n.appVersion;
		var tv = parseFloat(dav);

		d.isOpera = (dua.indexOf("Opera") >= 0) ? tv : 0;
		d.isKhtml = (dav.indexOf("Konqueror") >= 0)||(dav.indexOf("Safari") >= 0) ? tv : 0;
		d.isSafari = (dav.indexOf("Safari") >= 0) ? tv : 0;
		var geckoPos = dua.indexOf("Gecko");
		d.isMozilla = d.isMoz = ((geckoPos >= 0)&&(!d.isKhtml)) ? tv : 0;
		d.isFF = 0;
		d.isIE = 0;
		try{
			if(d.isMoz){
				d.isFF = parseFloat(dua.split("Firefox/")[1].split(" ")[0]);
			}
			if((document.all)&&(!d.isOpera)){
				d.isIE = parseFloat(dav.split("MSIE ")[1].split(";")[0]);
			}
		}catch(e){}

		var cm = document["compatMode"];
		d.isQuirks = (cm == "BackCompat")||(cm == "QuirksMode")||(d.isIE < 6);

		// TODO: is the HTML LANG attribute relevant?
		d.locale = d.locale || (d.isIE ? n.userLanguage : n.language).toLowerCase();

		d._println = console.debug;

		// These are in order of decreasing likelihood; this will change in time.
		d._XMLHTTP_PROGIDS = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];

		d._xhrObj= function(){
			// summary: 
			//		does the work of portably generating a new XMLHTTPRequest
			//		object.
			var http = null;
			var last_e = null;
			try{ http = new XMLHttpRequest(); }catch(e){}
			if(!http){
				for(var i=0; i<3; ++i){
					var progid = dojo._XMLHTTP_PROGIDS[i];
					try{
						http = new ActiveXObject(progid);
					}catch(e){
						last_e = e;
					}

					if(http){
						dojo._XMLHTTP_PROGIDS = [progid];  // so faster next time
						break;
					}
				}

				/*if(http && !http.toString) {
					http.toString = function() { "[object XMLHttpRequest]"; }
				}*/
			}

			if(!http){
				throw new Error("XMLHTTP not available: "+last_e);
			}

			return http; // XMLHTTPRequest instance
		}

		var isDocumentOk = function(http){
			var stat = http["status"];
			// allow a 304 use cache, needed in konq (is this compliant with
			// the http spec?)
			return Boolean((!stat)||((200 <= stat)&&(300 > stat))||(stat==304));
		}

		d._blockAsync = false;
		d._getText = function(uri, async_cb, fail_ok){
			// summary: Read the contents of the specified uri and return those contents.
			// uri:
			//		A relative or absolute uri. If absolute, it still must be in
			//		the same "domain" as we are.
			// async_cb:
			//		If not specified, load synchronously. If specified, load
			//		asynchronously, and use async_cb as the progress handler which
			//		takes the xmlhttp object as its argument. If async_cb, this
			//		function returns null.
			// fail_ok:
			//		Default false. If fail_ok and !async_cb and loading fails,
			//		return null instead of throwing.

			// need to block async callbacks from snatching this thread as the result
			// of an async callback might call another sync XHR, this hangs khtml forever
			// hostenv._blockAsync must also be checked in BrowserIO's watchInFlight()
			// NOTE: must be declared before scope switches ie. this._xhrObj()
			if(!async_cb){ this._blockAsync = true; }

			var http = this._xhrObj();

			if(async_cb){
				var _this = this, timer = null, gbl = dojo.global();
				http.onreadystatechange = function(){
					if(timer){ gbl.clearTimeout(timer); timer = null; }
					if(_this._blockAsync){
						timer = gbl.setTimeout(function(){
							http.onreadystatechange.apply(this);
						}, 10);
					}else{
						if(4==http.readyState){
							if(isDocumentOk(http)){
								// console.debug("LOADED URI: "+uri);
								async_cb(http.responseText);
							}
						}
					}
				}
			}

			http.open('GET', uri, async_cb ? true : false);
			try{
				http.send(null);
				if(async_cb){
					return null;
				}
				if(!isDocumentOk(http)){
					var err = Error("Unable to load "+uri+" status:"+ http.status);
					err.status = http.status;
					err.responseText = http.responseText;
					throw err;
				}
			}catch(e){
				this._blockAsync = false;
				if((fail_ok)&&(!async_cb)){
					return null;
				}else{
					throw e;
				}
			}

			this._blockAsync = false;
			return http.responseText; // String
		}
	})();

	dojo._handleNodeEvent = function(/*DomNode*/node, /*String*/evtName, /*Function*/fp){
		// summary:
		//		non-destructively adds the specified function to the node's
		//		evtName handler.
		// node: the DomNode to add the handler to
		// evtName: should be in the form "click" for "onclick" handlers
		var oldHandler = node["on"+evtName] || function(){};
		node["on"+evtName] = function(){
			fp.apply(node, arguments);
			oldHandler.apply(node, arguments);
		}
		return true;
	}

	//	BEGIN DOMContentLoaded, from Dean Edwards (http://dean.edwards.name/weblog/2006/06/again/)
	dojo._loadInit = function(e){
		// allow multiple calls, only first one will take effect
		// A bug in khtml calls events callbacks for document for event which isnt supported
		// for example a created contextmenu event calls DOMContentLoaded, workaround
		var type = (e && e.type) ? e.type.toLowerCase() : "load";
		if(arguments.callee.initialized || (type!="domcontentloaded" && type!="load")){ return; }
		arguments.callee.initialized = true;
		if(typeof dojo["_khtmlTimer"] != 'undefined'){
			clearInterval(dojo._khtmlTimer);
			delete dojo._khtmlTimer;
		}

		if(dojo._inFlightCount == 0){
			dojo._modulesLoaded();
		}
	}

	//	START DOMContentLoaded
	// Mozilla and Opera 9 expose the event we could use
	if(document.addEventListener){
		// NOTE: 
		//		due to a threading issue in Firefox 2.0, we can't enable
		//		DOMContentLoaded on that platform. For more information, see:
		//		http://trac.dojotoolkit.org/ticket/1704
		if(dojo.isOpera|| (dojo.isMoz && (djConfig["enableMozDomContentLoaded"] === true))){
			document.addEventListener("DOMContentLoaded", dojo._loadInit, null);
		}

		//	mainly for Opera 8.5, won't be fired if DOMContentLoaded fired already.
		//  also used for Mozilla because of trac #1640
		window.addEventListener("load", dojo._loadInit, null);
	}

	// 	for Internet Explorer. readyState will not be achieved on init call,
	// 	but dojo doesn't need it however, we'll include it because we don't
	// 	know if there are other functions added that might.  Note that this has
	// 	changed because the build process strips all comments -- including
	// 	conditional ones.
	if(dojo.isIE){
		document.write('<scr'+'ipt defer src="//:" '
			+ 'onreadystatechange="if(this.readyState==\'complete\'){dojo._loadInit();}">'
			+ '</scr'+'ipt>'
		);
	}

	if(/(WebKit|khtml)/i.test(navigator.userAgent)){ // sniff
		dojo._khtmlTimer = setInterval(function(){
			if(/loaded|complete/.test(document.readyState)){
				dojo._loadInit(); // call the onload handler
			}
		}, 10);
	}
	//	END DOMContentLoaded

	// IE WebControl hosted in an application can fire "beforeunload" and "unload"
	// events when control visibility changes, causing Dojo to unload too soon. The
	// following code fixes the problem
	// Reference: http://support.microsoft.com/default.aspx?scid=kb;en-us;199155
	if(dojo.isIE){
		dojo._handleNodeEvent(window, "beforeunload", function(){
			dojo._unloading = true;
			window.setTimeout(function() {
				dojo._unloading = false;
			}, 0);
		});
	}

	dojo._handleNodeEvent(window, "unload", function(){
		if((!dojo.isIE)||(dojo.isIE && dojo._unloading)){
			dojo.unloaded();
		}
	});

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

	try{
		if(dojo.isIE){
			document.namespaces.add("v","urn:schemas-microsoft-com:vml");
			document.createStyleSheet().addRule("v\\:*", "behavior:url(#default#VML)");
		}
	}catch(e){ }

	// stub, over-ridden by debugging code. This will at least keep us from
	// breaking when it's not included
	dojo._writeIncludes = function(){}

	//TODOC:  HOW TO DOC THIS?
	// @global: dojo._currentDocument
	// summary:
	//		Current document object. 'dojo._currentDocument' can be modified
	//		for temporary context shifting.
	// description:
	//    dojo.doc() returns dojo._currentDocument. Refer to dojo.doc() rather
	//    than referring to 'window.document' to ensure your code runs
	//    correctly in managed contexts.
	if(this["document"]){
		dojo._currentDocument = this.document;
	}

	dojo.doc = function(){
		// summary:
		//		return the document object associated with the dojo.global()
		return dojo._currentDocument;
	}

	dojo.body = function(){
		// summary:
		//		return the body object associated with dojo.doc()

		// Note: document.body is not defined for a strict xhtml document
		return dojo.doc().body || dojo.doc().getElementsByTagName("body")[0];
	}

	dojo.setContext = function(/*Object*/globalObject, /*DocumentElement*/globalDocument){
		// summary:
		//		changes the behavior of many core Dojo functions that deal with
		//		namespace and DOM lookup, changing them to work in a new global
		//		context. The varibles dojo._currentContext and dojo._currentDocument
		//		are modified as a result of calling this function.
		dojo._currentContext = globalObject;
		dojo._currentDocument = globalDocument;
	};

	dojo._fireCallback = function(callback, context, cbArguments){
		if((context)&&((typeof callback == "string")||(callback instanceof String))){
			callback = context[callback];
		}
		return (context ? callback.apply(context, cbArguments || [ ]) : callback());
	}

	dojo.withGlobal = function(	/*Object*/globalObject, 
								/*Function*/callback, 
								/*Object?*/thisObject, 
								/*Array?*/cbArguments){
		// summary:
		//		Call callback with globalObject as dojo.global() and
		//		globalObject.document as dojo.doc(). If provided, globalObject
		//		will be executed in the context of object thisObject
		// description:
		//		When callback() returns or throws an error, the dojo.global()
		//		and dojo.doc() will be restored to its previous state.
		var rval;
		var oldGlob = dojo._currentContext;
		var oldDoc = dojo._currentDocument;
		try{
			dojo.setContext(globalObject, globalObject.document);
			rval = dojo._fireCallback(callback, thisObject, cbArguments);
		}finally{
			dojo.setContext(oldGlob, oldDoc);
		}
		return rval;
	}

	dojo.withDoc = function(	/*Object*/documentObject, 
								/*Function*/callback, 
								/*Object?*/thisObject, 
								/*Array?*/cbArguments){
		// summary:
		//		Call callback with documentObject as dojo.doc(). If provided,
		//		callback will be executed in the context of object thisObject
		// description:
		//		When callback() returns or throws an error, the dojo.doc() will
		//		be restored to its previous state.
		var rval;
		var oldDoc = dojo._currentDocument;
		try{
			dojo._currentDocument = documentObject;
			rval = dojo._fireCallback(callback, thisObject, cbArguments);
		}finally{
			dojo._currentDocument = oldDoc;
		}
		return rval;
	}

} //if (typeof window != 'undefined')

//Load debug code if necessary.
// dojo.requireIf((djConfig["isDebug"] || djConfig["debugAtAllCosts"]), "dojo.debug");

//window.widget is for Dashboard detection
//The full conditionals are spelled out to avoid issues during builds.
//Builds may be looking for require/requireIf statements and processing them.
// dojo.requireIf(djConfig["debugAtAllCosts"] && !window.widget && !djConfig["useXDomain"], "dojo.browser_debug");
// dojo.requireIf(djConfig["debugAtAllCosts"] && !window.widget && djConfig["useXDomain"], "dojo.browser_debug_xd");
