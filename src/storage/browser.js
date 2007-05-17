dojo.provide("dojo.storage.browser");

dojo.require("dojo.storage");
dojo.require("dojo.flash");
dojo.require("dojo.json");
dojo.require("dojo.uri.*");


dojo.storage.browser.WhatWGStorageProvider = function(){
	// summary:
	//		Storage provider that uses WHAT Working Group features in Firefox 2 
	//		to achieve permanent storage.
	// description: 
	//		The WHAT WG storage API is documented at 
	//		http://www.whatwg.org/specs/web-apps/current-work/#scs-client-side
	//
	//		You can disable this storage provider with the following djConfig
	//		variable:
	//		var djConfig = { disableWhatWGStorage: true };
	//		
	//		Authors of this storage provider-	
	//			JB Boisseau, jb.boisseau@eutech-ssii.com
	//			Brad Neuberg, bkn3@columbia.edu 
}

dojo.inherits(dojo.storage.browser.WhatWGStorageProvider, dojo.storage);

// instance methods and properties
dojo.lang.extend(dojo.storage.browser.WhatWGStorageProvider, {
	initialized: false,
	
	_domain: null,
	_available: null,
	_statusHandler: null,
	_allNamespaces: null,
	_storageEventListener: null,
	
	initialize: function(){
		if(djConfig["disableWhatWGStorage"] == true){
			return;
		}
		
		// get current domain
		this._domain = location.hostname;
		
		// indicate that this storage provider is now loaded
		this.initialized = true;
		dojo.storage.manager.loaded();	
	},
	
	isAvailable: function(){
		try{
			var myStorage = globalStorage[location.hostname];
		}catch(e){
			this._available = false;
			return this._available;
		}
		
		this._available = true;	
		return this._available;
	},

	put: function(key, value, resultsHandler, namespace){
		if(this.isValidKey(key) == false){
			dojo.raise("Invalid key given: " + key);
		}
		
		// get our full key name, which is namespace + key
		key = this.getFullKey(key, namespace);	
		
		this._statusHandler = resultsHandler;
		
		// serialize the value;
		// handle strings differently so they have better performance
		if(dojo.lang.isString(value)){
			value = "string:" + value;
		}else{
			value = dojo.json.serialize(value);
		}
		
		// register for successful storage events.
		var self = this;
		var storageListener = function(evt){
			// remove any old storage event listener we might have added
			// to the window on old put() requests; Firefox has a bug
			// where it can occassionaly go into infinite loops calling
			// our storage event listener over and over -- this is a 
			// workaround
			// FIXME: Simplify this into a test case and submit it
			// to Firefox
			window.removeEventListener("storage", storageListener, false);
			
			// indicate we succeeded
			resultsHandler.call(null, dojo.storage.SUCCESS, key);
		};
		
		window.addEventListener("storage", storageListener, false);
		
		// try to store the value	
		try{
			var myStorage = globalStorage[this._domain];
			myStorage.setItem(key, value);
		}catch(e){
			// indicate we failed
			this._statusHandler.call(null, dojo.storage.FAILED, 
									key, e.toString());
		}
	},

	get: function(key, namespace){
		if(this.isValidKey(key) == false){
			dojo.raise("Invalid key given: " + key);
		}
		
		// get our full key name, which is namespace + key
		key = this.getFullKey(key, namespace);
		
		// sometimes, even if a key doesn't exist, Firefox
		// will return a blank string instead of a null --
		// this _might_ be due to having underscores in the
		// keyname, but I am not sure.
		
		// FIXME: Simplify this bug into a testcase and
		// submit it to Firefox
		var myStorage = globalStorage[this._domain];
		var results = myStorage.getItem(key);
		
		if(results == null || results == ""){
			return null;
		}
		
		results = results.value;
		
		// destringify the content back into a 
		// real JavaScript object;
		// handle strings differently so they have better performance
		if(!dojo.lang.isUndefined(results) && results != null 
			 && /^string:/.test(results)){
			results = results.substring("string:".length);
		}else{
			results = dojo.json.evalJson(results);
		}
		
		return results;
	},
	
	getNamespaces: function(){
		var results = new Array();
		results.push(dojo.storage.DEFAULT_NAMESPACE);
		
		// simply enumerate through our array and save any string
		// that starts with __
		var found = new Object();
		var myStorage = globalStorage[this._domain];
		var tester = /^__([^_]*)_/;
		for(var i = 0; i < myStorage.length; i++){
			var currentKey = myStorage.key(i);
			if(tester.test(currentKey) == true){
				var currentNS = currentKey.match(tester)[1];
				// have we seen this namespace before?
				if(typeof found[currentNS] == "undefined"){
					found[currentNS] = true;
					results.push(currentNS);
				}
			}
		}
		
		return results;
	},

	getKeys: function(namespace){
		if(namespace == null || typeof namespace == "undefined"){
			namespace = dojo.storage.DEFAULT_NAMESPACE;
		}
		
		if(this.isValidKey(namespace) == false){
			dojo.raise("Invalid namespace given: " + namespace);
		}
		
		// create a regular expression to test the beginning
		// of our key names to see if they match our namespace;
		// if it is the default namespace then test for the presence
		// of no namespace for compatibility with older versions
		// of Dojo Storage
		var namespaceTester;
		if(namespace == dojo.storage.DEFAULT_NAMESPACE){
			namespaceTester = new RegExp("^([^_]{2}.*)$");	
		}else{
			namespaceTester = new RegExp("^__" + namespace + "_(.*)$");
		}
		
		var myStorage = globalStorage[this._domain];
		var keysArray = new Array();
		for(var i = 0; i < myStorage.length; i++){
			var currentKey = myStorage.key(i);
			if(namespaceTester.test(currentKey) == true){
				// strip off the namespace portion
				currentKey = currentKey.match(namespaceTester)[1];
				keysArray.push(currentKey);
			}
		}
		
		return keysArray;
	},

	clear: function(namespace){
		if(namespace == null || typeof namespace == "undefined"){
			namespace = dojo.storage.DEFAULT_NAMESPACE;
		}
		
		if(this.isValidKey(namespace) == false){
			dojo.raise("Invalid namespace given: " + namespace);
		}
		
		// create a regular expression to test the beginning
		// of our key names to see if they match our namespace;
		// if it is the default namespace then test for the presence
		// of no namespace for compatibility with older versions
		// of Dojo Storage
		var namespaceTester;
		if(namespace == dojo.storage.DEFAULT_NAMESPACE){
			namespaceTester = new RegExp("^[^_]{2}");	
		}else{
			namespaceTester = new RegExp("^__" + namespace + "_");
		}
		
		var myStorage = globalStorage[this._domain];
		var keys = new Array();
		for(var i = 0; i < myStorage.length; i++){
			if(namespaceTester.test(myStorage.key(i)) == true){
				keys[keys.length] = myStorage.key(i);
			}
		}
		
		for(var i = 0; i < keys.length; i++){
			myStorage.removeItem(keys[i]);
		}
	},
	
	remove: function(key, namespace){
		// get our full key name, which is namespace + key
		key = this.getFullKey(key, namespace);
		
		var myStorage = globalStorage[this._domain];
		myStorage.removeItem(key);
	},
	
	isPermanent: function(){
		return true;
	},

	getMaximumSize: function(){
		return dojo.storage.SIZE_NO_LIMIT;
	},

	hasSettingsUI: function(){
		return false;
	},
	
	showSettingsUI: function(){
		dojo.raise(this.getType() + " does not support a storage settings user-interface");
	},
	
	hideSettingsUI: function(){
		dojo.raise(this.getType() + " does not support a storage settings user-interface");
	},
	
	getType: function(){
		return "dojo.storage.browser.WhatWGProvider";
	},
	
	getFullKey: function(key, namespace){
		if(namespace == null || typeof namespace == "undefined"){
			namespace = dojo.storage.DEFAULT_NAMESPACE;		
		}
		
		if(this.isValidKey(namespace) == false){
			dojo.raise("Invalid namespace given: " + namespace);
		}
		
		// don't append a namespace string for the default namespace,
		// for compatibility with older versions of Dojo Storage
		if(namespace == dojo.storage.DEFAULT_NAMESPACE){
			return key;
		}else{
			return "__" + namespace + "_" + key;
		}
	}
});




dojo.storage.browser.FlashStorageProvider = function(){
	// summary: Storage provider that uses features in Flash to achieve permanent storage
	// description:
	//		Authors of this storage provider-
	//			Brad Neuberg, bkn3@columbia.edu	
}

dojo.inherits(dojo.storage.browser.FlashStorageProvider, dojo.storage);

// instance methods and properties
dojo.lang.extend(dojo.storage.browser.FlashStorageProvider, {
	initialized: false,
	
	_available: null,
	_statusHandler: null,
	
	initialize: function(){
		if(djConfig["disableFlashStorage"] == true){
			return;
		}
		
		// initialize our Flash
		var loadedListener = function(){
			// indicate our Flash subsystem is now loaded
			dojo.storage._flashLoaded();
		}
		dojo.flash.addLoadedListener(loadedListener);
		var swfloc6 = dojo.uri.moduleUri("dojo", "../Storage_version6.swf").toString();
		var swfloc8 = dojo.uri.moduleUri("dojo", "../Storage_version8.swf").toString();
		dojo.flash.setSwf({flash6: swfloc6, flash8: swfloc8, visible: false});
	},
	
	isAvailable: function(){
		if(djConfig["disableFlashStorage"] == true){
			this._available = false;
		}else{
			this._available = true;
		}
		
		return this._available;
	},

	put: function(key, value, resultsHandler, namespace){
		if(this.isValidKey(key) == false){
			dojo.raise("Invalid key given: " + key);
		}
		
		if(namespace == null || typeof namespace == "undefined"){
			namespace = dojo.storage.DEFAULT_NAMESPACE;		
		}
		
		if(this.isValidKey(namespace) == false){
			dojo.raise("Invalid namespace given: " + namespace);
		}
			
		this._statusHandler = resultsHandler;
		
		// serialize the value;
		// handle strings differently so they have better performance
		if(dojo.lang.isString(value)){
			value = "string:" + value;
		}else{
			value = dojo.json.serialize(value);
		}
		
		dojo.flash.comm.put(key, value, namespace);
	},

	get: function(key, namespace){
		if(this.isValidKey(key) == false){
			dojo.raise("Invalid key given: " + key);
		}
		
		if(namespace == null || typeof namespace == "undefined"){
			namespace = dojo.storage.DEFAULT_NAMESPACE;		
		}
		
		if(this.isValidKey(namespace) == false){
			dojo.raise("Invalid namespace given: " + namespace);
		}
		
		var results = dojo.flash.comm.get(key, namespace);

		if(results == ""){
			return null;
		}
    
		// destringify the content back into a 
		// real JavaScript object;
		// handle strings differently so they have better performance
		if(!dojo.lang.isUndefined(results) && results != null 
			 && /^string:/.test(results)){
			results = results.substring("string:".length);
		}else{
			results = dojo.json.evalJson(results);
		}
    
		return results;
	},

	getKeys: function(namespace){
		if(namespace == null || typeof namespace == "undefined"){
			namespace = dojo.storage.DEFAULT_NAMESPACE;		
		}
		
		if(this.isValidKey(namespace) == false){
			dojo.raise("Invalid namespace given: " + namespace);
		}
		
		var results = dojo.flash.comm.getKeys(namespace);
		
		if(results == ""){
			return [];
		}

		// the results are returned comma seperated; split them
		results = results.split(",");
		
		return results;
	},
	
	getNamespaces: function(){
		var results = dojo.flash.comm.getNamespaces();
		if(results == ""){
			return [dojo.storage.DEFAULT_NAMESPACE];
		}
		
		// the results are returned comma seperated; split them
		results = results.split(",");
		
		return results;
	},

	clear: function(namespace){
		if(namespace == null || typeof namespace == "undefined"){
			namespace = dojo.storage.DEFAULT_NAMESPACE;
		}
		
		if(this.isValidKey(namespace) == false){
			dojo.raise("Invalid namespace given: " + namespace);
		}
		
		dojo.flash.comm.clear(namespace);
	},
	
	remove: function(key, namespace){
		if(namespace == null || typeof namespace == "undefined"){
			namespace = dojo.storage.DEFAULT_NAMESPACE;		
		}
		
		if(this.isValidKey(namespace) == false){
			dojo.raise("Invalid namespace given: " + namespace);
		}
		
		dojo.flash.comm.remove(key, namespace);
	},
	
	isPermanent: function(){
		return true;
	},

	getMaximumSize: function(){
		return dojo.storage.SIZE_NO_LIMIT;
	},

	hasSettingsUI: function(){
		return true;
	},

	showSettingsUI: function(){
		dojo.flash.comm.showSettings();
		dojo.flash.obj.setVisible(true);
		dojo.flash.obj.center();
	},

	hideSettingsUI: function(){
		// hide the dialog
		dojo.flash.obj.setVisible(false);
		
		// call anyone who wants to know the dialog is
		// now hidden
		if(dojo.storage.onHideSettingsUI != null &&
			!dojo.lang.isUndefined(dojo.storage.onHideSettingsUI)){
			dojo.storage.onHideSettingsUI.call(null);	
		}
	},
	
	getType: function(){
		return "dojo.storage.browser.FlashStorageProvider";
	},
	
	getResourceList: function(){ /* Array[] */
		var swfloc6 = dojo.uri.moduleUri("dojo", "../Storage_version6.swf").toString();
		var swfloc8 = dojo.uri.moduleUri("dojo", "../Storage_version8.swf").toString();
		
		var results = dojo.flash.info.getResourceList(swfloc6, swfloc8);
		
		results.push(djConfig.baseRelativePath + "storage_dialog.swf");
				
		return results;
	},
	
	/** Called when the Flash is finished loading. */
	_flashLoaded: function(){
		// get available namespaces
		this._allNamespaces = this.getNamespaces();
		
		this._initialized = true;

		// indicate that this storage provider is now loaded
		dojo.storage.manager.loaded();
	},
	
	//	Called if the storage system needs to tell us about the status
	//	of a put() request. 
	_onStatus: function(statusResult, key){
		var ds = dojo.storage;
		var dfo = dojo.flash.obj;
		
		if(statusResult == ds.PENDING){
			dfo.center();
			dfo.setVisible(true);
		}else{
			dfo.setVisible(false);
		}
		
		if((!dj_undef("_statusHandler", ds))&&(ds._statusHandler != null)){
			ds._statusHandler.call(null, statusResult, key);		
		}
	}
});

// register the existence of our storage providers
dojo.storage.manager.register("dojo.storage.browser.WhatWGStorageProvider",
								new dojo.storage.browser.WhatWGStorageProvider());
dojo.storage.manager.register("dojo.storage.browser.FlashStorageProvider",
								new dojo.storage.browser.FlashStorageProvider());

// now that we are loaded and registered tell the storage manager to initialize
// itself
dojo.storage.manager.initialize();
