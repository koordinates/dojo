dojo.provide("dojox.embed.Flash");

(function(){
	/*******************************************************
		dojox.embed.Flash

		Base functionality to insert a flash movie into
		a document on the fly.

		Usage:
		var movie=new dojox.embed.Flash({ args }, containerNode);
	 ******************************************************/
	var fMarkup, fVersion;
	var keyBase = "dojox-embed-flash-", keyCount=0;
	var _baseKwArgs = {
		expressInstall: false,
		width: 320,
		height: 240,
		swLiveConnect: "true",
		allowScriptAccess: "sameDomain",
		allowNetworking:"all",
		style: null,
		redirect: null
	};

	function prep(kwArgs){
		// console.warn("KWARGS:", kwArgs)
		kwArgs = dojo.delegate(_baseKwArgs, kwArgs);

		if(!("path" in kwArgs)){
			console.error("dojox.embed.Flash(ctor):: no path reference to a Flash movie was provided.");
			return null;
		}

		if(!("id" in kwArgs)){
			kwArgs.id = (keyBase + keyCount++);
		}
		return kwArgs;
	}

	if(dojo.isIE){
		fMarkup = function(kwArgs){
			kwArgs = prep(kwArgs);
			if(!kwArgs){ return null; }
			
			var p;
			var path = kwArgs.path;
			if(kwArgs.vars){
				var a = [];
				for(p in kwArgs.vars){
					a.push(p + '=' + kwArgs.vars[p]);
				}
				path += ((path.indexOf("?") == -1) ? "?" : "&") + a.join("&");
			}
			// FIXME: really? +'s?
			var s = '<object id="' + kwArgs.id + '" '
				+ 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" '
				+ 'width="' + kwArgs.width + '" '
				+ 'height="' + kwArgs.height + '"'
				+ ((kwArgs.style)?' style="' + kwArgs.style + '"':'')
				+ '>'
				+ '<param name="movie" value="' + path + '" />';
			if(kwArgs.params){
				for(p in kwArgs.params){
					s += '<param name="' + p + '" value="' + kwArgs.params[p] + '" />';
				}
			}
			s += '</object>';
			return { id: kwArgs.id, markup: s };
		};

		fVersion = (function(){
			var testVersion = 10, testObj = null;
			while(!testObj && testVersion > 7){
				try {
					testObj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + testVersion--);
				}catch(e){ }
			}
			if(testObj){
				var v = testObj.GetVariable("$version").split(" ")[1].split(",");
				return {
					major: (v[0]!=null) ? parseInt(v[0]) : 0, 
					minor: (v[1]!=null) ? parseInt(v[1]) : 0, 
					rev: (v[2]!=null) ? parseInt(v[2]) : 0 
				};
			}
			return { major: 0, minor: 0, rev: 0 };
		})();

		//	attach some cleanup for IE, thanks to deconcept :)
		dojo.addOnUnload(function(){
			var dummy = function(){};
			var objs = dojo.query("object").
				reverse().
				style("display", "none").
				forEach(function(i){
					for(var p in i){
						if((p != "FlashVars") && dojo.isFunction(i[p])){
							try{
								i[p] = dummy;
							}catch(e){}
						}
					}
				});
		});

		//	TODO: ...and double check this fix; is IE really firing onbeforeunload with any kind of href="#" link?
		/*
		var beforeUnloadHandle = dojo.connect(dojo.global, "onbeforeunload", function(){
			try{
				if(__flash_unloadHandler){ __flash_unloadHandler=function(){ }; }
				if(__flash_savedUnloadHandler){ __flash_savedUnloadHandler=function(){ }; }
			} catch(e){ }
			dojo.disconnect(beforeUnloadHandle);
		});
		*/
	} else {
		//	*** Sane browsers branch ******************************************************************
		fMarkup = function(kwArgs){
			kwArgs = prep(kwArgs);
			if(!kwArgs){ return null; }
			
			var p;
			var path = kwArgs.path;
			if(kwArgs.vars){
				var a = [];
				for(p in kwArgs.vars){
					a.push(p + '=' + kwArgs.vars[p]);
				}
				path += ((path.indexOf("?") == -1) ? "?" : "&") + a.join("&");
			}
			var s = '<embed type="application/x-shockwave-flash" '
				+ 'src="' + path + '" '
				+ 'id="' + kwArgs.id + '" '
				+ 'name="' + kwArgs.id + '" '
				+ 'width="' + kwArgs.width + '" '
				+ 'height="' + kwArgs.height + '"'
				+ ((kwArgs.style)?' style="' + kwArgs.style + '" ':'')
				+ 'swLiveConnect="'+kwArgs.swLiveConnect+'" '
				+ 'allowScriptAccess="' +kwArgs.allowScriptAccess+  '" '
				+ 'allowNetworking="' +kwArgs.allowNetworking+  '" '
				
				+ 'pluginspage="' + window.location.protocol + '//www.adobe.com/go/getflashplayer" ';
			if(kwArgs.params){
				for(p in kwArgs.params){
					s += ' ' + p + '="' + kwArgs.params[p] + '"';
				}
			}
			s += ' />';
			return { id: kwArgs.id, markup: s };
		};

		fVersion=(function(){
			var plugin = navigator.plugins["Shockwave Flash"];
			if(plugin && plugin.description){
				var v = plugin.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split(".");
				return { 
					major: (v[0]!=null) ? parseInt(v[0]) : 0, 
					minor: (v[1]!=null) ? parseInt(v[1]) : 0, 
					rev: (v[2]!=null) ? parseInt(v[2]) : 0 
				};
			}
			return { major: 0, minor: 0, rev: 0 };
		})();
	}


	/*=====
	dojox.embed.__flashArgs = function(path, id, width, height, style, params, vars, expressInstall, redirect){
		//	path: String
		//		The URL of the movie to embed.
		//	id: String?
		//		A unique key that will be used as the id of the created markup.  If you don't
		//		provide this, a unique key will be generated.
		//	width: Number?
		//		The width of the embedded movie; the default value is 320px.
		//	height: Number?
		//		The height of the embedded movie; the default value is 240px
		//	style: String?
		//		Any CSS style information (i.e. style="background-color:transparent") you want
		//		to define on the markup.
		//	params: Object?
		//		A set of key/value pairs that you want to define in the resultant markup.
		//	vars: Object?
		//		A set of key/value pairs that the Flash movie will interpret as FlashVars.
		//	expressInstall: Boolean?
		//		Whether or not to include any kind of expressInstall info. Default is false.
		//	redirect: String?
		//		A url to redirect the browser to if the current Flash version is not supported.
		this.id=id;
		this.path=path;
		this.width=width;
		this.height=height;
		this.style=style;
		this.params=params;
		this.vars=vars;
		this.expressInstall=expressInstall;
		this.redirect=redirect;
	}
	=====*/

	//	the main entry point
	dojox.embed.Flash = function(/*dojox.embed.__flashArgs*/ kwArgs, /*DOMNode*/ node){
		//	summary:
		//		Creates a wrapper object around a Flash movie.  Wrapper object will
		//		insert the movie reference in node; when the browser first starts
		//		grabbing the movie, onReady will be fired; when the movie has finished
		//		loading, it will fire onLoad.
		//
		//		If your movie uses ExternalInterface, you should use the onLoad event
		//		to do any kind of proxy setup (see dojox.embed.Flash.proxy); this seems
		//		to be the only consistent time calling EI methods are stable (since the
		//		Flash movie will shoot several methods into the window object before
		//		EI callbacks can be used properly).
		//
		//	id: String
		//		The ID of the internal embed/object tag.  Can be used to get a reference to
		//		the movie itself.
		//	movie: HTMLObject
		//		A reference to the Flash movie itself.
		//
		//	example:
		//		Embed a flash movie in a document using the new operator, and get a reference to it.
		//	|	var movie = new dojox.embed.Flash({
		//	|		path: "path/to/my/movie.swf",
		//	|		width: 400,
		//	|		height: 300
		//	|	}, myWrapperNode);
		//
		//	example:
		//		Embed a flash movie in a document without using the new operator.
		//	|	var movie = dojox.embed.Flash({
		//	|		path: "path/to/my/movie.swf",
		//	|		width: 400,
		//	|		height: 300,
		//	|		style: "position:absolute;top:0;left:0"
		//	|	}, myWrapperNode);
		//
		// File can only be run from a server, due to SWF dependency.
		if(location.href.toLowerCase().indexOf("file://")>-1){
			throw new Error("dojox.av.FLVideo can't be run directly from a file. To instatiate the required SWF correctly it must be run from a server, like localHost.");
		}
		this.id = null;
		this.movie = null;
		this.domNode = null;
		if(node){
			node = dojo.byId(node);
		}
		if(kwArgs && node){
			this.init(kwArgs, node);
		}
	};

	dojo.extend(dojox.embed.Flash, {
		onReady: function(/*HTMLObject*/ movie){
			//	summary
			//		Stub function for you to attach to when the movie reference is first
			//		pushed into the document.
		},
		onLoad: function(/*HTMLObject*/ movie){
			//	summary
			//		Stub function for you to attach to when the movie has finished downloading
			//		and is ready to be manipulated.
		},
		init: function(/*dojox.embed.__flashArgs*/ kwArgs, /*DOMNode?*/ node){
			//	summary
			//		Initialize (i.e. place and load) the movie based on kwArgs.
			this.destroy();		//	ensure we are clean first.
			node = dojo.byId(node || this.domNode);
			if(!node){ throw new Error("dojox.embed.Flash: no domNode reference has been passed."); }

			this._poller = null;
			this._pollCount = 0, this._pollMax = 250;
			if(dojox.embed.Flash.initialized){
				this.id = dojox.embed.Flash.place(kwArgs, node);
				this.domNode = node;
				setTimeout(dojo.hitch(this, function(){
					this.movie = (dojo.isIE) ? dojo.byId(this.id) : document[this.id];
					this.onReady(this.movie);

					this._poller = setInterval(dojo.hitch(this, function(){
						if(this.movie.PercentLoaded() == 100 || this._pollCount++ > this._pollMax){
							clearInterval(this._poller);
							delete this._poller;
							delete this._pollCount;
							delete this._pollMax;
							this.onLoad(this.movie);
						}
					}), 10);
				}), 1);
			}
		},
		_destroy: function(){
			//	summary
			//		Kill the movie and reset all the properties of this object.
			try{
				this.domNode.removeChild(this.movie);
			}catch(e){}
			this.id = this.movie = this.domNode = null;
		},
		destroy: function(){
			//	summary
			//		Public interface for destroying all the properties in this object.
			//		Will also clean all proxied methods.
			if(!this.movie){ return; }
			
			//	remove any proxy functions
			var test = dojo.delegate({ 
				id: true,
				movie: true,
				domNode: true,
				onReady: true,
				onLoad: true 
			});
			for(var p in this){
				if(!test[p]){
					delete this[p];
				}
			}

			//	pull the movie
			if(this._poller){
				//	wait until onLoad to destroy
				dojo.connect(this, "onLoad", this, "_destroy");
			} else {
				this._destroy();
			}
		}
	});

	//	expose information through the constructor function itself.
	dojo.mixin(dojox.embed.Flash, {
		//	summary:
		//		A singleton object used internally to get information
		//		about the Flash player available in a browser, and
		//		as the factory for generating and placing markup in a
		//		document.
		//
		//	minSupported: Number
		//		The minimum supported version of the Flash Player, defaults to 8.
		//	available: Number
		//		Used as both a detection (i.e. if(dojox.embed.Flash.available){ })
		//		and as a variable holding the major version of the player installed.
		//	supported: Boolean
		//		Whether or not the Flash Player installed is supported by dojox.embed.
		//	version: Object
		//		The version of the installed Flash Player; takes the form of
		//		{ major, minor, rev }.  To get the major version, you'd do this:
		//		var v=dojox.embed.Flash.version.major;
		//	initialized: Boolean
		//		Whether or not the Flash engine is available for use.
		//	onInitialize: Function
		//		A stub you can connect to if you are looking to fire code when the 
		//		engine becomes available.  A note: DO NOT use this event to
		//		place a movie in a document; it will usually fire before DOMContentLoaded
		//		is fired, and you will get an error.  Use dojo.addOnLoad instead.
		minSupported : 8,
		available: fVersion.major,
		supported: (fVersion.major >= 8),
		version: fVersion,
		initialized: false,
		onInitialize: function(){
			dojox.embed.Flash.initialized = true;
		},
		__ie_markup__: function(kwArgs){
			return fMarkup(kwArgs);
		},
		proxy: function(/*dojox.embed.Flash*/ obj, /*Array|String*/ methods){
			//	summary:
			//		Create the set of passed methods on the dojox.embed.Flash object
			//		so that you can call that object directly, as opposed to having to
			//		delve into the internal movie to do this.  Intended to make working
			//		with Flash movies that use ExternalInterface much easier to use.
			//
			//	example:
			//		Create "setMessage" and "getMessage" methods on foo.
			//	|	var foo = new dojox.embed.Flash(args, someNode);
			//	|	dojo.connect(foo, "onLoad", dojo.hitch(foo, function(){
			//	|		dojox.embed.Flash.proxy(this, [ "setMessage", "getMessage" ]);
			//	|		this.setMessage("dojox.embed.Flash.proxy is pretty cool...");
			//	|		console.log(this.getMessage());
			//	|	}));
			dojo.forEach((dojo.isArray(methods) ? methods : [ methods ]), function(item){
				this[item] = dojo.hitch(this, function(){
					return (function(){
						return eval(this.movie.CallFunction(
							'<invoke name="' + item + '" returntype="javascript">'
							+ '<arguments>'
							+ dojo.map(arguments, function(item){
								// FIXME: 
								//		investigate if __flash__toXML will
								//		accept direct application via map()
								//		(e.g., does it ignore args past the
								//		first? or does it blow up?)
								return __flash__toXML(item);
							}).join("")
							+ '</arguments>'
							+ '</invoke>'
						));
					}).apply(this, arguments||[]);
				});
			}, obj);
		}
	});

	if(dojo.isIE){
		//	Ugh!
		if(dojo._initFired){
			var e = document.createElement("script");
			e.type = "text/javascript";
			e.src = dojo.moduleUrl("dojox", "embed/IE/flash.js");
			document.getElementsByTagName("head")[0].appendChild(e);
		}else{
			//	we can use document.write.  What a kludge.
			document.write('<scr'+'ipt type="text/javascript" src="' + dojo.moduleUrl("dojox", "embed/IE/flash.js") + '">'
				+ '</scr'+'ipt>');
		}
	}else{
		dojox.embed.Flash.place = function(kwArgs, node){
			var o = fMarkup(kwArgs);
			node = dojo.byId(node);
			if(!node){ 
				node = dojo.doc.createElement("div");
				node.id = o.id+"-container";
				dojo.body().appendChild(node);
			}
			if(o){
				node.innerHTML = o.markup;
			//	return document[o.id];
				return o.id;
			}
			return null;
		}
		dojox.embed.Flash.onInitialize();
	}
})();
