/*
 * Adobe SVG Viewer host environment
 */
if(typeof window == 'undefined'){
	dj_throw("attempt to use adobe svg hostenv when no window object");
}

dj_debug = function(){}

dojo.hostenv.startPackage("dojo.hostenv");

dojo.hostenv.name_ = 'adobesvg';

dojo.hostenv.anonCtr = 0;
dojo.hostenv.anon = {};

dojo.hostenv.nameAnonFunc = function(anonFuncPtr, namespaceObj){
	var ret = "_"+this.anonCtr++;
	var nso = (namespaceObj || this.anon);
	while(typeof nso[ret] != "undefined"){
		ret = "_"+this.anonCtr++;
	}
	nso[ret] = anonFuncPtr;
	return ret;
}

dojo.hostenv.getNewAnonFunc = function(){
	var ret = "_"+this.anonCtr++;
	while(typeof this.anon[ret] != "undefined"){
		ret = "_"+this.anonCtr++;
	}
	// this.anon[ret] = function(){};
	eval("dojo.nostenv.anon."+ret+" = function(){};");
	return [ret, this.anon[ret]];
}

/**
 * Read the contents of the specified uri and return those contents.
 *
 * FIXME: Make sure this is consistent with other implementations of getText
 * @param uri A relative or absolute uri. If absolute, it still must be in the same "domain" as we are.
 * @param async_cb If not specified, returns false as synchronous is not
 * supported. If specified, load asynchronously, and use async_cb as the handler which receives the result of the request.
 * @param fail_ok Default false. If fail_ok and !async_cb and loading fails, return null instead of throwing.
 */ 
dojo.hostenv.async_cb = null;

dojo.hostenv.unWindGetTextStack = function(){
	if(dojo.hostenv.inFlightCount>0){
		setTimeout("dojo.hostenv.unWindGetTextStack()", 100);
		return;
	}
	// we serialize because this goddamned environment is too fucked up
	// to know how to do anything else
	dojo.hostenv.inFlightCount++;
	var next = dojo.hostenv.getTextStack.pop();
	dojo.hostenv.async_cb = next[1];
	// http = window.getURL(uri, dojo.hostenv.anon[cbn]);
	window.getURL(next[0], function(result){ 
		dojo.hostenv.inFlightCount--;
		dojo.hostenv.async_cb(result.content);
		dojo.hostenv.unWindGetTextStack();
	});
}

dojo.hostenv.getText = function(uri, async_cb, fail_ok){
	try {
		if(async_cb) {
			dojo.hostenv.getTextStack.push([uri, async_cb, fail_ok]);
			dojo.hostenv.unWindGetTextStack();
		}else{
			return dj_throw("No synchronous XMLHTTP implementation available, for uri " + uri);
		}
	}catch(e){
		return dj_throw("No XMLHTTP implementation available, for uri " + uri);
	}
}


/**
 * Makes an async post to the specified uri.
 *
 * FIXME: Not sure that we need this, but adding for completeness.
 * More details about the implementation of this are available at 
 * http://wiki.svg.org/index.php/PostUrl
 * @param uri A relative or absolute uri. If absolute, it still must be in the same "domain" as we are.
 * @param async_cb If not specified, returns false as synchronous is not
 * supported. If specified, load asynchronously, and use async_cb as the progress handler which takes the xmlhttp object as its argument. If async_cb, this function returns null.
 * @param text Data to post
 * @param fail_ok Default false. If fail_ok and !async_cb and loading fails, return null instead of throwing.
 * @param mime_type optional MIME type of the posted data (such as "text/plain")
 * @param encoding optional encoding for data. null, 'gzip' and 'deflate' are possible values. If browser does not support binary post this parameter is ignored.
 */ 
dojo.hostenv.postText = function(uri, async_cb, text, fail_ok, mime_type, encoding){
	var http = null;
	
	var async_callback = function(httpResponse){
		if (!httpResponse.success) {
			dj_throw("Request for uri '" + uri + "' resulted in " + httpResponse.status);
		}
		
		if(!httpResponse.content) {
			if (!fail_ok) dj_throw("Request for uri '" + uri + "' resulted in no content");
			return null;
		}
		// FIXME: wtf, I'm losing a reference to async_cb
		async_cb(httpResponse.content);
	}
	
	try {
		if(async_cb) {
			http = window.postURL(uri, text, async_callback, mimeType, encoding);
		} else {
		return dj_throw("No synchronous XMLHTTP post implementation available, for uri " + uri);
		}
	} catch(e) {
		return dj_throw("No XMLHTTP post implementation available, for uri " + uri);
	}
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
    var script = scripts.item(scripts.length - 1);
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
		// FIXME: need a way to determine where to position the text for this
    var ti = document.createElement("text");
		var tn = document.createTextNode(s);
		ti.appendChild(tn);
		document.documentElement.appendChild(ti);
	}catch(e){

	}
}
