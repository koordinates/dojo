/*
 * Adobe SVG Viewer host environment
 */

if(typeof window == 'undefined'){
	dj_throw("attempt to use adobe svg hostenv when no window object");
}

dojo.hostenv.startPackage("dojo.hostenv");

dojo.hostenv.name_ = 'adobesvg';

/**
 * Read the contents of the specified uri and return those contents.
 *
 * @param uri A relative or absolute uri. If absolute, it still must be in the same "domain" as we are.
 * @param async_cb If not specified, load synchronously. If specified, load asynchronously, and use async_cb as the progress handler which takes the xmlhttp object as its argument. If async_cb, this function returns null.
 * @param fail_ok Default false. If fail_ok and !async_cb and loading fails, return null instead of throwing.
 */ 
dojo.hostenv.getText = function(uri, async_cb, fail_ok){
	var http = null;
	
	var async_callback = function(httpResponse){
		if (httpResponse.success) {
			// FIXME: not sure what to pass to the async_cb...
			async_cb();
		} else {
			dj_throw("Request for uri '" + uri + "' resulted in " + httpResponse.status);
		}
		
		if(!httpResponse.content) {
			if (!fail_ok) dj_throw("Request for uri '" + uri + "' resulted in no content");
			return null;
		}
		
		return httpResponse.content;
	}
	
	try {
		http = window.getURL(uri, async_cb);
	} catch(e) {
		return dj_throw("No XMLHTTP implementation available, for uri " + uri);
	}

}

/*
 * It turns out that if we check *right now*, as this script file is being loaded,
 * then the last script element in the window DOM is ourselves.
 * That is because any subsequent script elements haven't shown up in the document
 * object yet.
 */
function dj_last_script_src() {
    // FIXME: this may not work with adobe's viewer, as we may first need a 
		// reference to the svgDocument
		var scripts = window.document.getElementsByTagName('script');
    if(scripts.length < 1){ 
		dj_throw("No script elements in window.document, so can't figure out my script src"); 
	}
    var script = scripts[scripts.length - 1];
		var xlinkNS = "http://www.w3.org/1999/xlink";
    var src = script.getAttributeNS(xlinkNS,"href");
    if(!src){
		dj_throw("Last script element (out of " + scripts.length + ") has no src");
	}
    return src;
}

if(!dojo.hostenv["library_script_uri_"]){
	dojo.hostenv.library_script_uri_ = dj_last_script_src();
}

// dojo.hostenv.loadUri = function(uri){
	/* FIXME: adding a script element doesn't seem to be synchronous, and so
	 * checking for namespace or object existance after loadUri using this
	 * method will error out. Need to figure out some other way of handling
	 * this!
	 */
	/*
	var se = document.createElement("script");
	se.src = uri;
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(se);
	// document.write("<script type='text/javascript' src='"+uri+"' />");
	return 1;
}
*/

dojo.hostenv.println = function(s){
	try{
    // FIXME: this may not work with adobe's viewer, as we may first need a 
		// reference to the svgDocument
		var ti = document.createElement("text");
		var tn = document.createTextNode(s);
		ti.appendChild(tn);
		document.documentElement.appendChild(ti);
	}catch(e){
		
	}
}
