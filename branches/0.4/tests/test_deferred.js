dojo.require("dojo.logging.Logger");
dojo.require("dojo.Deferred");

function test_Deferred_Callback(){
	var d=new dojo.Deferred();
	d.addCallback(deferredCallback);
	
	setTimeout(function(){d.callback("Test message");}, 100);
}

function deferredCallback(msg){
	dojo.log.debug("deferredCallback called with " + msg);
	jum.assertTrue("defcallback", true);	
}
