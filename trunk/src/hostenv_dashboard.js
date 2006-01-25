/**
* Dashboard
*/

dojo.hostenv.name_ = 'dashboard';

/**
 * Synchronousl load text from the uri into scope
 */ 
dojo.hostenv.getText = function(uri, async_cb, fail_ok){
	if(widget.system){
		uri = uri.replace(/'/g, "\\'").replace(/ /g, "\\ ");
		var system; // Use the widget's sytem function
		if (uri.indexOf("http") == 0) {
			// It's a remote file
			system = widget.system("/usr/bin/curl -sS " + uri, async_cb ? function(){ async_cb(widget.system.outputString) } : null);
			// The -sS means that curl will not output anything as an error unless it's actually an error.
		}else{
			system = widget.system("/bin/cat " + uri, async_cb ? function(){ async_cb(widget.system.outputString) } : null);
		}

		if((async_cb)||(system["errorString"])){
			// If there is an errorString, it didn't work
			return null;
		}
		return system.outputString;
	}else{
		var http = new XMLHttpRequest();

		if(async_cb){
			http.onreadystatechange = function(){ 
				if((4==http.readyState)&&(http["status"])){
					if(http.status==200){
						dojo.debug("LOADED URI: "+uri);
						async_cb(http.responseText);
					}
				}
			}
		}

		http.open('GET', uri, async_cb ? true : false);
		http.send(null);

		if(async_cb){ return null; }

		return http.responseText;
	}
}

/**
 * Synchronously load the javascript from the uri into scope
 */
dojo.hostenv.loadUri = function(uri, cb){
	dojo.debug("uri: "+uri);

	if(!dojo.hostenv._head){
		dojo.hostenv._head = document.getElementsByTagName("head")[0];
	}
  
	var src;
	if(src = dojo.hostenv.getText(uri)){
		var script = document.createElement("script");
		src = document.createTextNode(src);
		script.setAttribute("type", "text/javascript");
		script.appendChild(src);
		dojo.hostenv._head.appendChild(script);

		return 1;
	}

	return 0;
}

dojo.hostenv.println = alert;
dojo.hostenv.exit = function(){}
