dojo.require("dojo.storage.*");
dojo.require("dojo.off.*");
dojo.require("dojo.off.ui");
dojo.require("dojo.sync");

// configure how we should work offline

// set our application name
dojo.off.ui.appName = "Hello World";

// add our list resources we need offline
// Hello World resources
dojo.off.files.cache([
					"helloworld.html",
					"helloworld.js"
					]);

// Dojo resources
dojo.off.files.cache([
					djConfig.baseRelativePath + "dojo.js"
					]);
					
var HelloWorld = {
	initialize: function(){
		dojo.debug("Dojo Offline and Dojo Storage are ready to be used; the page is also finished loading");
	}
}
					
// Wait until Dojo Offline and Dojo Storage are ready
// before we initialize ourselves. When this gets called the page
// is also finished loading.
dojo.off.ui.onLoad = dojo.lang.hitch(HelloWorld, HelloWorld.initialize);
					
