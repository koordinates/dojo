dojo.provide("dojo.jaxer");

if(typeof Jaxer != 'undefined' && typeof Jaxer.Log != 'undefined'){
	console.debug = Jaxer.Log.debug;
	console.warn = Jaxer.Log.warn;
	console.error = Jaxer.Log.error;
	console.info = Jaxer.Log.info;
	console.log = Jaxer.Log.warn;
}

var onserverload = dojo._loadInit;
