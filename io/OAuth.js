dojo.provide("dojox.io.OAuth");
dojo.require("dojox.encoding.digests.SHA1");

/*	dojox.io.OAuth
 *
 * 	Helper class to assemble OAuth URL parameters.
 * 	Based on OAuth implementation at http://oauth.googlecode.com/svn/code/javascript/
 * 	as provided by Netflix.
 */

dojox.io.OAuth = new (function(){
	var encode = this.encode = function(s){
		if(!s){ return ""; }
		return encodeURIComponent(s)
			.replace(/\!/g, "%21")
			.replace(/\*/g, "%2A")
			.replace(/\'/g, "%27")
			.replace(/\(/g, "%28")
			.replace(/\)/g, "%29");
	};

	var decode = this.decode = function(str){
		//	summary:
		//		Break apart the passed string and decode.
		//		Some special cases are handled.
		var a=[], list=str.split("&");
		for(var i=0, l=list.length; i<l; i++){
			var item=list[i];
			if(list[i]==""){ continue; }	//	skip this one.
			if(list[i].indexOf("=")>-1){
				var tmp=list[i].split("=");
				a.push([ decodeURIComponent(tmp[0]), decodeURIComponent(tmp[1]) ]);
			} else {
				a.push([ decodeURIComponent(list[i]), null ]);
			}
		}
		return a;
	};

	function parseUrl(url){
		//	summary:
		//		Create a map out of the passed URL.  Need to pull any
		//		query string parameters off the URL for the base signature string.
        var keys = [
				"source","protocol","authority","userInfo",
				"user","password","host","port",
				"relative","path","directory",
				"file","query","anchor"
			],
			parser=/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			match=parser.exec(url),
			map = {},
			i=keys.length;

		//	create the base map first.
		while(i--){ map[keys[i]] = match[i] || ""; }

		//	create the normalized version of the url and add it to the map
		var p=map.protocol.toLowerCase(),
			a=map.authority.toLowerCase(),
			b=(p=="http"&&map.port==80)||(p=="https"&&map.port==443);
		if(b){
			if(a.lastIndexOf(":")>-1){
				a=a.substring(0, a.lastIndexOf(":"));
			}
		}
		var path=map.path||"/";
		map.url=p+"://"+a+path;

		//	return the map
		return map;
	}

	var tab="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	function nonce(length){
		var s="", tl=tab.length;
		for(var i=0; i<length; i++){
			s+=tab.charAt(Math.floor(Math.random()*tl));
		}
		return s;
	}
	function timestamp(){
		return Math.floor(new Date().valueOf()/1000)-2;
	}
	function signature(data, key, type){
		if(type && type!="PLAINTEXT" && type!="HMAC-SHA1"){
			throw new Error("dojox.io.OAuth: the only supported signature encodings are PLAINTEXT and HMAC-SHA1.");
		}

		if(type=="PLAINTEXT"){
			return key;
		} else {
			//	assume SHA1 HMAC
			return dojox.encoding.digests.SHA1._hmac(data, key);
		}
	}

	function key(args){
		//	summary:
		//		return the key used to sign a message based on the token object.
		return encode(args.consumer.secret) 
			+ "&" 
			+ (args.token && args.token.secret ? encode(args.token.secret) : "");
	}

	function addOAuth(/* dojo.__XhrArgs */args, /* dojox.io.__OAuthArgs */oaa){
		//	summary:
		//		Add the OAuth parameters to the query string/content.
		var o = {
			oauth_consumer_key: oaa.consumer.key,
			oauth_nonce: nonce(16),
			oauth_signature_method: oaa.sig_method || "HMAC-SHA1",
			oauth_timestamp: timestamp(),
			oauth_version: "1.0"
		}
		if(oaa.token){
			o.oauth_token = oaa.token.key;
		}
		args.content = dojo.mixin(args.content||{}, o);
	}

	function convertArgs(args){
		//	summary:
		//		Because of the need to create a base string, we have to do
		//		some manual args preparation instead of relying on the internal
		//		Dojo xhr functions.  But we'll let dojo.xhr assemble things
		//		as it normally would.
		var miArgs = [{}], formObject;

		if(args.form){
			if(!args.content){ args.content = {}; }
			var form = dojo.byId(args.form);
			var actnNode = form.getAttributeNode("action");
			args.url = args.url || (actnNode ? actnNode.value : null);
			formObject = dojo.formToObject(form);
			delete args.form;
		}
		if(formObject){ miArgs.push(formObject); }
		if(args.content){ miArgs.push(args.content); }

		//	pull anything off the query string
		var map = parseUrl(args.url);
		if(map.query){ 
			var tmp = dojo.queryToObject(map.query);
			//	re-encode the values.  sigh
			for(var p in tmp){ tmp[p] = encodeURIComponent(tmp[p]); }
			miArgs.push(tmp);
		}
		args._url = map.url;

		//	now set up all the parameters as an array of 2 element arrays.
		var a = [];
		for(var i=0, l=miArgs.length; i<l; i++){
			var item=miArgs[i];
			for(var p in item){
				if(dojo.isArray(item[p])){
					//	handle multiple values
					for(var j=0, jl=item.length; j<jl; j++){
						a.push([ p, item[j] ]);
					}
				} else {
					a.push([ p, item[p] ]);
				}
			}
		}

		args._parameters = a;
		return args;
	}

	function baseString(/* String */method, /* dojo.__XhrArgs */args, /* dojox.io.__OAuthArgs */oaa){
		//	create and return the base string out of the args.
		addOAuth(args, oaa);
		convertArgs(args);

		var a = args._parameters;

		//	sort the parameters
		a.sort(function(a,b){
			if(a[0]>b[0]){ return 1; }
			if(a[0]<b[0]){ return -1; }
			if(a[1]>b[1]){ return 1; }
			if(a[1]<b[1]){ return -1; }
			return 0;
		});

		//	encode.
		var s = dojo.map(a, function(item){
			return encode(item[0]) + "%3D" + encode(item[1]||"");
		}).join("%26");

		var baseString = method.toUpperCase()
			+ "&" + encode(args._url) 
			+ "&" + s;
		return baseString;
	}

	function sign(method, args, oaa){
		//	return the oauth_signature for this message.
		var k = key(oaa),
			message = baseString(method, args, oaa),
			s = signature(message, k, oaa.sig_method || "HMAC-SHA1");
		args.content["oauth_signature"] = s;
		return args;
	}
	
	/*=====
	 	dojox.io.OAuth.__AccessorArgs = function(key, secret){
			//	key: String
			//		The key or token issued to either the consumer or by the OAuth service.
			//	secret: String
			//		The secret (shared secret for consumers, issued secret by OAuth service).
			this.key = key;
			this.secret = secret;
		};
		dojox.io.OAuth.__OAuthArgs = function(consumer, sig_method, token){
			//	consumer: dojox.io.OAuth.__AccessorArgs
			//		The consumer information issued to your OpenAuth application.
			//	sig_method: String
			//		The method used to create the signature.  Should be PLAINTEXT or HMAC-SHA1.
			//	token: dojox.io.OAuth.__AccessorArgs?
			//		The request token and secret issued by the OAuth service.  If not
			//		issued yet, this should be null.
			this.consumer = consumer;
			this.token = token;
		}
	=====*/

	/*	
	 *	Process goes something like this:
	 *	1. prepare the base string
	 *	2. create the key
	 *	3. create the signature based on the base string and the key
	 *	4. send the request using dojo.xhr[METHOD].
	 */

	this.sign = function(/* String*/method, /* dojo.__XhrArgs */args, /* dojox.io.OAuth.__OAuthArgs */oaa){
		//	summary:
		//		Given the OAuth access arguments, sign the kwArgs that you would pass
		//		to any dojo Ajax method (dojo.xhr*, dojo.io.iframe, dojo.io.script).
		//	example:
		//		Sign the kwArgs object for use with dojo.xhrGet:
		//	|	var oaa = {
		//	|		consumer: {
		//	|			key: "foobar",
		//	|			secret: "barbaz"
		//	|		}
		//	|	};
		//	|
		//	|	var args = dojox.io.OAuth.sign(myAjaxKwArgs);
		//	|	dojo.xhrGet(args);
		return sign(method, args, oaa);
	};


	//	TODO: handle redirect requests?
	this.xhr = function(/* String */method, /* dojo.__XhrArgs */args, /* dojox.io.OAuth.__OAuthArgs */oaa, /* Boolean? */hasBody){
		/*	summary:
		 *		Make an XHR request that is OAuth signed.
		 *	example:
		 *	|	var dfd = dojox.io.OAuth.xhrGet({ 
		 *	|		url: "http://someauthdomain.com/path?foo=bar",
		 *	|		load: function(response, ioArgs){ } 
		 *	|	}, 
		 *	|	{
		 *	|		consumer:{ key: "lasdkf9asdnfsdf", secret: "9asdnfskdfysjr" }
		 *	|	});
		 */
		sign(method, args, oaa);
		return dojo.xhr(method, args, hasBody);
	};

	this.xhrGet = function(/* dojo.__XhrArgs */args, /* dojox.io.OAuth.__OAuthArgs*/ oaa){
		return this.xhr("GET", args, oaa);
	};
	this.xhrPost = this.xhrRawPost = function(/* dojo.__XhrArgs */args, /* dojox.io.OAuth.__OAuthArgs*/ oaa){
		return this.xhr("POST", args, oaa, true);
	};
	this.xhrPut = this.xhrRawPut = function(/* dojo.__XhrArgs */args, /* dojox.io.OAuth.__OAuthArgs*/ oaa){
		return this.xhr("PUT", args, oaa, true);
	};
	this.xhrDelete = function(/* dojo.__XhrArgs */args, /* dojox.io.OAuth.__OAuthArgs*/ oaa){
		return this.xhr("DELETE", args, oaa);
	};
})();
