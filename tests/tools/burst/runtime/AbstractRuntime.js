/**
* @file AbstractRuntime.js
*
* Abstract class burst.runtime.AbstractRuntime, an abstraction layer for the ECMAScript runtime.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst.runtime;

/**
* Abstract base class definining the minimum that an environment must provide.
* Has both mandatory to implement methods and some that are implemented in this class.
*
* The singleton instance is available from the static function burst.runtime.AbstractRuntime.getRuntime()
* which returns <var>bu_Runtime</var>
*
* This interface includes such important matters as:
* - how to load scripts
* - how to write output (for potential debug output)
* - how to determine our current working directory/url
*
* Note that differentiating among browsers is done in burst.web.UserAgent.
* This class is just for differentiating among whole environments,
* of which a browser is one.
*
* (Note that maintainers must do more to add a new environment implementation
* than the methods defined here; in particular the constructor must implement
* <code>isPresent()</code> and must be in burst.runtime.AbstractRuntime.ALL_CTORS.)
*/
//=java public abstract class AbstractRuntime {
var BU_AbstractRuntime = function () {
}
burst.runtime.AbstractRuntime = BU_AbstractRuntime;

/** 
* Return an identifier for this environment, such as 'DOM' or 'SpiderMonkey'.
* Mandatory to implement.
*/
//:CLAMETHOD String name()
BU_AbstractRuntime.prototype.name = function() {bu_unimplemented('burst.runtime.AbstractRuntime.name')};

/** 
* Return the version string supplied by this environment. This is the version
* of its software, not the ECMAScript version it implements.
* Optional to implement; a default implementation returns null.
*/
//:CLAMETHOD String version()
BU_AbstractRuntime.prototype.version = function() {return null};

/** 
* Return the base url of this library's installation.
* All script urls will be resolved with this base url prior to calling <var>readEvalAsync</var> or <var>readEvalSync</var> .
* The return value typically ends with '/'. 
* Mandatory to implement.
* @param relpath Optional. The relative path of the file which contains the definition of this function, to aid in implementation.
*/ 
//:CLAMETHOD String getBaseURI(String relpath)
BU_AbstractRuntime.prototype.getBaseURI = function(relpath) {
    var uri = this.getCurrentScriptURI(relpath);
    if (relpath) {
	var ind = uri.indexOf(relpath);
	if (ind == -1) throw "(AbstractRuntime.js) could not find relpath '" + relpath + "' in uri '" + uri + "'";
	return uri.substring(0,ind);
    }
    var last_slash = uri.indexOf('/');
    return last_slash == -1 ? '' : uri.substring(0, last_slash + 1);
};

// used in base class implementation of getBaseURI
BU_AbstractRuntime.prototype.getCurrentScriptURI = function() {bu_unimplemented('burst.runtime.AbstractRuntime.getCurrentScriptURI');}

/**
* Read the contents of the specified url and execute it in the global scope.
*
* In a ECMAScript shell, this is typically done via a global <var>load()</var> function.
* In a browser, this is typically done via a dynamically created <var>script</var> element.
*
* This interface does not mandate a completion handler. 
* The caller should expect that in general the implementation may finish asynchronously,
* though it may choose to actually be synchronous if it likes.
*
* If there are errors (in reading, parsing, or execution) they are expected to be thrown.
*
* The only urls that must be accepted are ones in the same origin as the library itself,
* and in fact it is expected that urls from any other origin will probably fail.
* This means for example that in a shell the url is a relative or absolute local file.
* In a browser, it would be 'http:' or 'ftp:' or 'file:' or whatever the library is loading as.
*
* At least one of readEvalAsync or readEvalSync is mandatory to implement.
*/
//:CLAMETHOD void readEvalAsync(String url, Function done_handler)
BU_AbstractRuntime.prototype.readEvalAsync = function(url) {bu_unimplemented('burst.runtime.AbstractRuntime.readEvalAsync')};

/**
The synchronous version.
There is no requirement that the result of the eval be returned, but it might.
*/
//:CLAMETHOD void readEvalSync(String url)
BU_AbstractRuntime.prototype.readEvalSync = function(url) {bu_unimplemented('burst.runtime.AbstractRuntime.readEvalSync')};

/**
Fetch text contents at the specified url.
*/
//:CLAMETHOD void getTextAsync(String url, Function handler, Boolean nocache)
BU_AbstractRuntime.prototype.getTextAsync = function(url, handler, nocache) {
    return this.getURIRequest().getTextAsync(url, handler, nocache);
}

/**
Fetch Document object at the specified url.
*/
//:CLAMETHOD void getDocumentAsync(String url, Function handler)
BU_AbstractRuntime.prototype.getDocumentAsync = function(url, handler, progress_handler) {
    return this.getURIRequest().getDocumentAsync(url, handler, progress_handler);
}

/**
Return an instance of a subclass of burst.io.AbstractURIRequest which is supported in this
environment. Used by getTextAsync and getDocumentAsync .
*/
BU_AbstractRuntime.prototype.getURIRequest = function() {
    if (bu_Runtime.has_HttpRequest()) {
	return new burst.io.XmlHttpURIRequest();
    }
    else if (typeof navigator != 'undefined') {
	return new burst.io.IframeURIRequest.getInstance();
    }
    else {throw Error("(AbstractRuntime.js) no available URIRequest class");}
}

/**
Convenience function, available from base class.
If readEvalAsync is available, use that and return null.
Else if readEvalSync is available, use that and return the result of immediately calling done_handler.
Otherwise throw.
*/
//:CLAMETHOD readEval(String url, Function done_handler)
BU_AbstractRuntime.prototype.readEval = function(url, done_handler) {
  // if (typeof bu_Runtime.readEvalAsync == 'function')
  if (bu_Runtime.readEvalAsync !== BU_AbstractRuntime.prototype.readEvalAsync) {
     bu_Runtime.readEvalAsync(url, done_handler);
     return null;
  }
  // else if (typeof bu_Runtime.readEvalSync == 'function')
  else if (bu_Runtime.readEvalSync !== BU_AbstractRuntime.prototype.readEvalSync) {
     bu_Runtime.readEvalSync(url);
     return done_handler ? done_handler() : null;
  }
  else throw Error("(AbstractRuntime.js) neither readEvalAsync nor readEvalSync is implemented, for url '" + url + "'");
}



/** 
* Print the provided line. 
* The line does not itself contain an EOL; the callee should provide one. 
* Optional to implement, but there is no default implementation.
* If the environment does not provide this, then there is no default destination for logging.
*/
//:CLAMETHOD void println(String line)
//BU_AbstractRuntime.prototype.println = function(line) {}

/** 
* Exit the whole process with the specified exit code. 
* Optional to implement, but there is no default implementation.
*/
//:CLAMETHOD void exit(Number exitcode)
//BU_AbstractRuntime.prototype.exit = function(exitcode) {}

BU_AbstractRuntime.prototype.has_msxml = function() {
   return (typeof ActiveXObject !== 'undefined');
}

BU_AbstractRuntime.prototype.has_moz_XMLHttpRequest = function() {
   return (typeof XMLHttpRequest !== 'undefined');
}

/**
* Whether the environment supports issuing http requests.
*/
//:CLAMETHOD Boolean has_HttpRequest()
BU_AbstractRuntime.prototype.has_HttpRequest = function() {
  // moz or IE
  return this.has_moz_XMLHttpRequest() || this.has_msxml();
}

//=java } // class burst.runtime.AbstractRuntime

bu_loaded('burst.runtime.AbstractRuntime');
