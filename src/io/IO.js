dojo.hostenv.startPackage("dojo.io.IO");

/******************************************************************************
 *	Notes about dojo.io design:
 *	
 *	The dojo.io.* package has the unenviable task of making a lot of different
 *	types of I/O feel natural, despite a universal lack of good (or even
 *	reasonable!) I/O capability in the host environment. So lets pin this down
 *	a little bit further.
 *
 *	Rhino:
 *		perhaps the best situation anywhere. Access to Java classes allows you
 *		to do anything one might want in terms of I/O, both synchronously and
 *		async. Can open TCP sockets and perform low-latency client/server
 *		interactions. HTTP transport is available through Java HTTP client and
 *		server classes. Wish it were always this easy.
 *
 *	xpcshell:
 *		XPCOM for I/O. A cluster-fuck to be sure.
 *
 *	spidermonkey:
 *		S.O.L.
 *
 *	Browsers:
 *		Browsers generally do not provide any useable filesystem access. We are
 *		therefore limited to HTTP for moving information to and from Dojo
 *		instances living in a browser.
 *
 *		XMLHTTP:
 *			Sync or async, allows reading of arbitrary text files (including
 *			JS, which can then be eval()'d), writing requires server
 *			cooperation and is limited to HTTP mechanisms (POST and GET).
 *
 *		<iframe> hacks:
 *			iframe document hacks allow browsers to communicate asynchronously
 *			with a server via HTTP POST and GET operations. With significant
 *			effort and server cooperation, low-latency data transit between
 *			client and server can be acheived via iframe mechanisms (repubsub).
 *
 *		SVG:
 *			Adobe's SVG viewer implements helpful primitives for XML-based
 *			requests, but receipt of arbitrary text data seems unlikely w/o
 *			<![CDATA[]]> sections.
 *
 ******************************************************************************/

dojo.io.Request = function(){
	this.requestPayload = null;
	this.lastResponse = null;

	this.mapToGetParams = function(map){
		dj_unimplemented("dojo.io.Request.mapToGetParams");
	}

	this.listsToGetParams = function(lists){
		dj_unimplemented("dojo.io.Request.listsToGetParams");
	}

	this.send = function(URI){
		dj_unimplemented("dojo.io.Request.send");
	}

	// called upon return, handles the work of returning the received data back
	// to the listening function (which in the synchronous case, is just the
	// return to send()
	this.receive = function(){
		dj_unimplemented("dojo.io.Request.receive");
	}
}

dojo.io.SyncRequest = function(){
	this.send = function(URI){
		dj_unimplemented("dojo.io.SyncRequest.send");
		return false;
	}

	// TODOC: does nothing intentionally, since send returns the payload in the
	// sync case
	this.receive = function(){
		return this.lastResponse;
	} 
}

dj_inherits(dojo.io.SyncRequest, dojo.io.Request);

// FIXME: the ctor should allow fetching of data
dojo.io.AsyncRequest = function(uri, cbo, cbf){

	this.callbackObj = null;
	this.callbackFunctionName = null;

	this.send = function(URI){
		dj_unimplemented("dojo.io.AsyncRequest.send");
		return true;
	}

	this.receive = function(){
		this.callbackObj[this.callbackFunctionName](this.lastResponse);
	}
}

dj_inherits(dojo.io.AsyncRequest, dojo.io.Request);


