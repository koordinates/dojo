/**
* @file hostenv_browser.js
*
* Implements the hostenv interface for a browser environment. 
*
* Perhaps it could be called a "dom" or "useragent" environment.
*
* @author Copyright 2004 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 2.1 http://www.opensource.org/licenses/afl-2.1.php
*/

// make jsc shut up (so we can use jsc to sanity check the code even if it will never run it).
/*@cc_on
@if (@_jscript_version >= 7)
var window; var XMLHttpRequest;
@end
@*/

if(typeof window == 'undefined'){
	dj_throw("attempt to use browser hostenv when no window object");
}

// FIXME: remove these when they are 
if(!dojo){ dojo = {}; }
if(!dojo.hostenv){ 
	dojo.hostenv = {};
}

dojo.hostenv.name_ = 'browser';

// These are in order of decreasing likelihood; this will change in time.
var DJ_XMLHTTP_PROGIDS = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];

/**
 * Read the contents of the specified uri and return those contents.
 *
 * @param uri A relative or absolute uri. If absolute, it still must be in the same "domain" as we are.
 * @param async_cb If not specified, load synchronously. If specified, load asynchronously, and use async_cb as the progress handler which takes the xmlhttp object as its argument. If async_cb, this function returns null.
 * @param fail_ok Default false. If fail_ok and !async_cb and loading fails, return null instead of throwing.
 */ 
dojo.hostenv.getText = function(uri, async_cb, fail_ok){
    var http = null;
    if(typeof XMLHttpRequest !== 'undefined'){
		http = new XMLHttpRequest();
	}else if(typeof ActiveXObject !== 'undefined') {
		var last_e = null;

		for(var i=0; i<3; ++i){
			var progid = DJ_XMLHTTP_PROGIDS[i];
			try{
				http = new ActiveXObject(progid);
			}catch(e){
				last_e = e;
			}

			if(http){
				DJ_XMLHTTP_PROGIDS = [progid];  // so faster next time
				dj_debug("successfully made an ActiveXObject using progid ", progid);
				break;
			}else{
				// window.alert("failed new ActiveXObject(" + progid + "): " + e);
			}
		}
	}

	if((last_e)&&(!http)){
		dj_rethrow("Could not create a new ActiveXObject using any of the progids " + DJ_XMLHTTP_PROGIDS.join(', '), last_e);
	}else{
		return dj_throw("No XMLHTTP implementation available, for uri " + uri);
	}

	if(async_cb){
		http.onreadystatechange = function(){ async_cb(http); }
	}

	http.open('GET', uri, async_cb ? true : false);
	http.send(null);
	if(async_cb){
		return null;
	}

	if(http.status != 200){
		if(!fail_ok){
			dj_throw("Request for uri '" + uri + "' resulted in " + http.status + " (" + http.statusText + ")");
			return null;
		}

		if(!http.responseText) {
			if (!fail_ok) dj_throw("Request for uri '" + uri + "' resulted in no responseText");
			return null;
		}
		return http.responseText;
	}
}

dojo.hostenv.dojoml = "http://www.dojotoolkit.org/2004/dojoml";

dojo.hostenv.getTagName = function(node) {
	var tagName = node.tagName;
	if(tagName.substr(0,5).toLowerCase()!="dojo:") {
		
		if(tagName.substr(0,4).toLowerCase()=="dojo") {
			// FIXME: this assuumes tag names are always lower case
			return "dojo:" + tagName.substring(4).toLowerCase();
		}
		
		if(node.getAttribute("dojoType")) {
			return "dojo:" + node.getAttribute("dojoType").toLowerCase();
		}
		
		if(node.getAttributeNS && node.getAttributeNS(dojo.hostenv.dojoml,"type")) {
			return "dojo:" + node.getAttributeNS(dojo.hostenv.dojoml,"type").toLowerCase();
		}
		
		if(node.getAttribute("dojo:type")) {
			return "dojo:" + node.getAttribute("dojo:type").toLowerCase();
		}
	}
	return tagName.toLowerCase();
}

/*
 * It turns out that if we check *right now*, as this script file is being loaded,
 * then the last script element in the window DOM is ourselves.
 * That is because any subsequent script elements haven't shown up in the document
 * object yet.
 */
function dj_last_script_src() {
    var scripts = window.document.getElementsByTagName('script');
    if(scripts.length < 1){ 
		dj_throw("No script elements in window.document, so can't figure out my script src"); 
	}
    var script = scripts[scripts.length - 1];
    var src = script.src;
    if(!src){
		dj_throw("Last script element (out of " + scripts.length + ") has no src");
	}
    return src;
}

if(!dojo.hostenv["library_script_uri_"]){
	dojo.hostenv.library_script_uri_ = dj_last_script_src();
}

dojo.hostenv.println = function(s){
    window.alert(s);
}
