dojo.hostenv.startPackage("dojo.io.BrowserIO");

dojo.io.IframeRequest = function(URI, callbackObj, callbackFN){
	dojo.io.AsyncRequest.call(this, URI, callbackObj, callbackFN);

	this.send = function(){
	}
}

dj_inherits(dojo.io.IframeRequest, dojo.io.AsyncRequest);
