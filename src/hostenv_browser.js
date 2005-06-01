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
	dj_throw("no window object");
}

with(dojo.render){
	html.UA = navigator.userAgent;
	html.AV = navigator.appVersion;
	html.capable = true;
	html.support.builtin = true;

	ver = parseFloat(html.AV);
	os.mac = html.AV.indexOf("Macintosh") == -1 ? false : true; 
	os.win = html.AV.indexOf("Windows") == -1 ? false : true; 

	html.opera = html.UA.indexOf("Opera") == -1 ? false : true; 
	html.khtml = ((html.AV.indexOf("Konqueror") >= 0)||(html.AV.indexOf("Safari") >= 0)) ? true : false; 
	html.safari = (html.AV.indexOf("Safari") >= 0) ? true : false; 
	html.moz = ((html.UA.indexOf("Gecko") >= 0)&&(!html.khtml)) ? true : false; 
	html.ie = ((document.all)&&(!html.opera)) ? true : false;
	html.ie50 = html.ie && html.AV.indexOf("MSIE 5.0")>=0;
	html.ie55 = html.ie && html.AV.indexOf("MSIE 5.5")>=0;
	html.ie60 = html.ie && html.AV.indexOf("MSIE 6.0")>=0;

	/*
	// FIXME: need to check for the various SVG plugins and builtin
	// capabilities (as w/ Moz+SVG)
	svg.capable = false;
	// svg.support.plugin = true;
	// svg.support.builtin = false;
	// svg.adobe = true;
	*/
};

// alert(dojo.render.html.safari);

dojo.hostenv.startPackage("dojo.hostenv");

dojo.hostenv.name_ = 'browser';

// These are in order of decreasing likelihood; this will change in time.
var DJ_XMLHTTP_PROGIDS = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];

dojo.hostenv.getXmlhttpObject = function(){
    var http = null;
	var last_e = null;
	try{ http = new XMLHttpRequest(); }catch(e){}
    if(!http){
		// http = new XMLHttpRequest();
	// }else if(typeof ActiveXObject !== 'undefined') {

		for(var i=0; i<3; ++i){
			var progid = DJ_XMLHTTP_PROGIDS[i];
			try{
				http = new ActiveXObject(progid);
			}catch(e){
				last_e = e;
			}

			if(http){
				DJ_XMLHTTP_PROGIDS = [progid];  // so faster next time
				// dj_debug("successfully made an ActiveXObject using progid ", progid);
				break;
			}else{
				// window.alert("failed new ActiveXObject(" + progid + "): " + e);
			}
		}
	}

	if((last_e)&&(!http)){
		dj_rethrow("Could not create a new ActiveXObject using any of the progids " + DJ_XMLHTTP_PROGIDS.join(', '), last_e);
	}else if(!http){
		return dj_throw("No XMLHTTP implementation available, for uri " + uri);
	}

	return http;
}

/**
 * Read the contents of the specified uri and return those contents.
 *
 * @param uri A relative or absolute uri. If absolute, it still must be in the same "domain" as we are.
 * @param async_cb If not specified, load synchronously. If specified, load asynchronously, and use async_cb as the progress handler which takes the xmlhttp object as its argument. If async_cb, this function returns null.
 * @param fail_ok Default false. If fail_ok and !async_cb and loading fails, return null instead of throwing.
 */ 
dojo.hostenv.getText = function(uri, async_cb, fail_ok){

	var http = this.getXmlhttpObject();

	if(async_cb){
		http.onreadystatechange = function(){ 
			if((4==http.readyState)&&(http["status"])){
				// dojo.hostenv.inFlightCount--;
				// async_cb(((200 == http.status)) ? http.responseText : null);
				if(http.status==200){
					dj_debug("LOADED URI: "+uri);
					async_cb(http.responseText);
				// }else{
				//	dj_debug(http.status+": "+http.statusText+" "+uri);
					// async_cb();
				}
			}
		}
	}

	// dojo.hostenv.inFlightCount++;
	http.open('GET', uri, async_cb ? true : false);
	http.send(null);
	if(async_cb){
		return null;
	}

	/*
	if(http.status != 200){
		if(!fail_ok){
			dj_throw("Request for uri '" + uri + "' resulted in " + http.status + " (" + http.statusText + ")");
			return null;
		}

		if(!http.responseText) {
			if (!fail_ok) dj_throw("Request for uri '" + uri + "' resulted in no responseText");
			return null;
		}
	}
	*/
	return http.responseText;
}

dojo.hostenv.appendScript = function(uri) {
	try {
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		script.setAttribute("src", uri);
		document.getElementsByTagName("head").item(0).appendChild(script);
	} catch(e) {
		return null;
	}
	return script;
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
		var ti = document.createElement("div");
		document.body.appendChild(ti);
		ti.innerHTML = s;
	}catch(e){
		try{
			//document.write(s);
			// safari needs the output wrapped in an element for some reason
			document.write("<div>"+s+"</div>");
		}catch(e2){
			//window.alert(s);
			window.status = s;
		}
	}
}

/*
// NOTE: IE seems to have some really fucked up ideas of what "onload" means
// WRT to pulling things out of the cache and executing them. In this case, we
// hit "onload" and THEN execute the JS that exists below the bootstrap2.js
// include in the page. This might be related to the iframe loading, but there
// isn't any way to tell that from the event that's thrown. Grr.
if(dojo.render.html.ie){
	dojo.hostenv._old_modulesLoaded = dojo.hostenv.modulesLoaded;
	dojo.hostenv.modulesLoaded = function(){
		this.modulesLoadedFired = false;
		this._old_modulesLoaded();
		if(this.modulesLoadedFired){
			this.modulesLoadedListeners = [];
		}
	}
}
*/

// FIXME: this and other Dojo-specific events need a more NW-like attachment mechanism
window.onload = function(evt){
	dojo.hostenv.modulesLoaded();
}

dojo.hostenv.modulesLoadedListeners.push(function(){
	if(dojo.hostenv.auto_build_widgets_){
		if(dj_eval_object_path("dojo.webui.widgets.Parse")){
			try{
				var parser = new dojo.xml.Parse();
				var frag  = parser.parseElement(document.body, null, true);
				var fragParser = new dojo.webui.widgets.Parse(frag);
				fragParser.createComponents(frag);
			}catch(e){
				dj_debug("auto-build-widgets error: "+e);
			}
		}
	}
});

// we assume that we haven't hit onload yet. Lord help us.
// document.write("<iframe style='border: 0px; width: 1px; height: 1px; position: absolute; bottom: 0px; right: 0px; visibility: visible;' name='djhistory' id='djhistory' src='"+((dojo.render.html.moz) ? 'about:blank' : (dojo.hostenv.base_relative_path_+'/blank.html'))+"'></iframe>");
if((!window["djConfig"])||(!window["djConfig"]["preventBackButtonFix"])){
	document.write("<iframe style='border: 0px; width: 1px; height: 1px; position: absolute; bottom: 0px; right: 0px; visibility: visible;' name='djhistory' id='djhistory' src='"+(dojo.hostenv.getBaseScriptUri()+'/blank.html')+"'></iframe>");
}
