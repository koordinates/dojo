dojo.provide("dojo.svg");
dojo.require("dojo.dom");

dojo.lang.mixin(dojo.svg, dojo.dom);

/**
 *	The Graphics object.  Hopefully gives the user a way into
 *	XPlatform rendering functions supported correctly and incorrectly.
**/
dojo.svg.graphics = dojo.svg.g = new function(d){
	this.suspend = function(){
		try { d.documentElement.suspendRedraw(0); } catch(e){ }
	};
	this.resume = function(){
		try { d.documentElement.unsuspendRedraw(0); } catch(e){ }
	};
	this.force = function(){
		try { d.documentElement.forceRedraw(); } catch(e){ }
	};
}(document);

/**
 *	The Animations control object.  Hopefully gives the user a way into
 *	XPlatform animation functions supported correctly and incorrectly.
**/
dojo.svg.animations = dojo.svg.anim = new function(d){
	this.arePaused = function(){
		try {
			return d.documentElement.animationsPaused();
		} catch(e){
			return false;
		}
	} ;
	this.pause = function(){
		try { d.documentElement.pauseAnimations(); } catch(e){ }
	};
	this.resume = function(){
		try { d.documentElement.unpauseAnimations(); } catch(e){ }
	};
}(document);

/**
 *	HttpTransport class
 *	version 0.5.0
 *  XPlatform HTTP Transport utility.  Wraps classes to conform to the
 *  basic MS XmlHttp API, with one exception:  the callback property is
 *  pre-wrapped and set for you, you should expect only the responseText
 *  value to be passed to your callback.
 *  Added to enable dojo.io to work in an environment like ASVG.
**/
dojo.svg.HttpTransport = function(){
	if (!(window.XMLHttpRequest || window.getURL)) 
		dojo.raise("dojo.svg.HttpTransport: implementation not supported.");

	var self = this;
	var http;
	var isASVG = (!window.XMLHttpRequest) && window.getURL;
	var headers = [];
	
	var uri = null;
	var method = "POST";
	var isAsync = true;		//	TODO: allow support of sync ops?
	var cb = function(d){
		var c = d.content || d;
		self.callback(c);
	};
	
	this.callback = function(d){};
	this.setHeader = function(nm, val){ 
		var o = [];
		o[nm] = val;
		headers.push(o);
	};
	this.open = function(meth, url, async){ 
		if (async != null && async == false) 
			dojo.raise("dojo.svg.HttpTransport.open does not support synchronous operations.");
		method = meth;
		uri = url;
	};
	this.send = function(data){
		var d = data || null;
		if (isASVG){
			if (method == "GET") getURL(uri, cb);
			else postURL(uri, data, cb);
		} else {
			http = new XMLHttpRequest();
			if (http.setRequestHeader){
				for (var p in headers){ 
					http.setRequestHeader(p, headers[p]);
				}
			}
			http.onreadystatechange = function(){
				if (http.readyState < 4) return;
				cb(http.responseText);
			}
			http.open(method, uri, isAsync);
			http.send(d);
		}
	};
};

// vim:ts=4:noet:tw=0:
