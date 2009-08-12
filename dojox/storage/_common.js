dojo.provide("dojox.storage._common");

dojo.require("dojox.storage.Provider");
dojo.require("dojox.storage.manager");

dojo.required(["dojox.storage.Provider", "dojox.storage.manager"], function() {

	// now that we are loaded and registered tell the storage manager to
	// initialize itself

	dojox.storage.manager.initialize();
});