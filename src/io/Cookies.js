dojo.hostenv.startPackage("dojo.io.Cookies");

dojo.io.cookies = new function() {
	this.setCookie = function(name, value, days, path, noEscape) {
		var expires;
		if(typeof days == "number") {
			var d = new Date();
			d.setTime(d.getTime()+(days*24*60*60*1000));
			expires = d.toGMTString();
		}
		if(!noEscape) { value = escape(value); }
		document.cookie = name + "=" + value + "; expires=" + expires + "; path=" + (path || "/");
	}

	this.getCookie = function(name, noEscape) {
		var ck = document.cookie;
		var idx = ck.indexOf(name+'=');
		if(idx == -1) { return null; }
		value = document.cookie.substring(idx+name.length+1);
		var end = value.indexOf(';');
		if(end == -1) { end = value.length; }
		value = value.substring(0, end);
		if(!noEscape) { value = unescape(value); }
		return value;
	}

	this.deleteCookie = function(name) {
		this.setCookie(name, "-", "-1");
	}

	this.setObjectCookie = function(name, valuePairs, days, path, clearValues) {
		var pairs = [], cookie, value = "";
		if(!clearValues) { cookie = this.getLongCookie(name); }
		if(days >= 0) {
			if(!cookie) { cookie = {}; }
			for(var i = 0; i < valuePairs.length; i++) {
				if(valuePairs[i][1] == null) {
					delete cookie[ valuePairs[i][0] ];
				} else {
					cookie[ valuePairs[i][0] ] = escape(valuePairs[i][1]);
				}
			}
			for(var prop in cookie) {
				pairs.push(prop + "=" + cookie[prop]);
			}
			value = pairs.join("&");
		}
		this.setCookie(name, value, days, path, true);
	}

	this.getObjectCookie = function(name) {
		var values = null, cookie = this.getCookie(name, true);
		if(cookie) {
			values = {};
			var pairs = cookie.split("&"), set, value;
			for(var i = 0; i < pairs.length; i++) {
				set = pairs[i].split("=");
				value = set[1];
				if( isNaN(value) ) value = unescape(set[1]).replace("'", "\\'");
				values[ set[0] ] = value;
			}
		}
		return values;
	}

	this.isSupported = function() {
		if(typeof navigator.cookieEnabled != "boolean") {
			this.setCookie("__TestingYourBrowserForCookieSupport__", "CookiesAllowed", 90, null, null);
			var cookieVal = this.getCookie("__TestingYourBrowserForCookieSupport__");
			navigator.cookieEnabled = (cookieVal == "CookiesAllowed");
			if(navigator.cookieEnabled) {
				// FIXME: should we leave this around?
				this.deleteCookie("__TestingYourBrowserForCookieSupport__");
			}
		}
		return navigator.cookieEnabled;
	}
};
