dojo.provide("dojo.storage");

dojo.require("dojo.lang.*");
dojo.require("dojo.event.*");


dojo.storage = new function(){
	// summary: A singleton for working with Dojo Storage.
	// description:
	//	dojo.storage exposes the current available storage
	//	provider on this platform. It gives you methods such
	//	as dojo.storage.put(), dojo.storage.get(), etc.
	//  
	//  	For more details on Dojo Storage, see the primary
	//	documentation page at
	//	http://manual.dojotoolkit.org/storage.html
	//
	//	Note for storage provider developers who are creating
	//	subclasses-
	//	This is the base class for all storage providers
	//	Specific kinds of Storage Providers should subclass this
	//	and implement these methods. You should avoid initialization
	//	storage provider subclass's constructor; instead, perform 
	//	initialization in your initialize() method. 	
}

dojo.declare("dojo.storage", null, {
	// SUCCESS: String
	//	Flag that indicates a put() call to a 
	//	storage provider was succesful.
	SUCCESS: "success",
	
	// FAILED: String
	//	Flag that indicates a put() call to 
	//	a storage provider failed.
	FAILED: "failed",
	
	// PENDING: String
	//	Flag that indicates a put() call to a 
	//	storage provider is pending user approval.
	PENDING: "pending",
	
	// SIZE_NOT_AVAILABLE: String
	//	Returned by getMaximumSize() if this storage provider can not determine
	//	the maximum amount of data it can support. 
	SIZE_NOT_AVAILABLE: "Size not available",
	
	// SIZE_NO_LIMIT: String
	//	Returned by getMaximumSize() if this storage provider has no theoretical
	//	limit on the amount of data it can store. 
	SIZE_NO_LIMIT: "No size limit",

	// DEFAULT_NAMESPACE: String
	//	The namespace for all storage operations. This is useful if several
	//	applications want access to the storage system from the same domain but
	//	want different storage silos. 
	DEFAULT_NAMESPACE: "default",
	
	// onHideSettingsUI: Function
	//	If a function is assigned to this property, then when the settings
	//	provider's UI is closed this function is called. Useful, for example,
	//	if the user has just cleared out all storage for this provider using
	//	the settings UI, and you want to update your UI.
	onHideSettingsUI: null,

	initialize: function(){
		// summary: 
		//		Allows this storage provider to initialize itself. This is
		//		called after the page has finished loading, so you can not do
		//		document.writes(). Storage Provider subclasses should initialize
		//		themselves inside of here rather than in their function
		//		constructor.
		dojo.unimplemented("dojo.storage.initialize");
	},
	
	isAvailable: function(){ /*Boolean*/
		// summary: 
		//		Returns whether this storage provider is available on this
		//		platform. 
		dojo.unimplemented("dojo.storage.isAvailable");
	},

	put: function(	/*string*/ key,
					/*object*/ value, 
					/*function*/ resultsHandler,
					/*string?*/ namespace){
		// summary:
		//		Puts a key and value into this storage system.
		// description:
		//		Example-
		//			var resultsHandler = function(status, key, message){
		//			  alert("status="+status+", key="+key+", message="+message);
		//			};
		//			dojo.storage.put("test", "hello world", resultsHandler);
		// key:
		//		A string key to use when retrieving this value in the future.
		// value:
		//		A value to store; this can be any JavaScript type.
		// resultsHandler:
		//		A callback function that will receive three arguments. The
		//		first argument is one of three values: dojo.storage.SUCCESS,
		//		dojo.storage.FAILED, or dojo.storage.PENDING; these values
		//		determine how the put request went. In some storage systems
		//		users can deny a storage request, resulting in a
		//		dojo.storage.FAILED, while in other storage systems a storage
		//		request must wait for user approval, resulting in a
		//		dojo.storage.PENDING status until the request is either
		//		approved or denied, resulting in another call back with
		//		dojo.storage.SUCCESS. 
		//		The second argument in the call back is the key name that was being stored.
		//		The third argument in the call back is an optional message that
		//		details possible error messages that might have occurred during
		//		the storage process.
		//	namespace:
		//		Optional string namespace that this value will be placed into;
		//		if left off, the value will be placed into dojo.storage.DEFAULT_NAMESPACE
		
		dojo.unimplemented("dojo.storage.put");
	},

	get: function(/*string*/ key, /*string?*/ namespace){ /*Object*/
		// summary:
		//		Gets the value with the given key. Returns null if this key is
		//		not in the storage system.
		// key:
		//		A string key to get the value of.
		//	namespace:
		//		Optional string namespace that this value will be retrieved from;
		//		if left off, the value will be retrieved from dojo.storage.DEFAULT_NAMESPACE
		// return: Returns any JavaScript object type; null if the key is not present
		dojo.unimplemented("dojo.storage.get");
	},

	hasKey: function(/*string*/ key, /*string?*/ namespace){ /*Boolean*/
		// summary: Determines whether the storage has the given key. 
		return (this.get(key) != null);
	},

	getKeys: function(/*string?*/ namespace){ /*Array*/
		// summary: Enumerates all of the available keys in this storage system.
		// return: Array of available keys
		dojo.unimplemented("dojo.storage.getKeys");
	},
	
	clear: function(/*string?*/ namespace){
		// summary: 
		//		Completely clears this storage system of all of it's values and
		//		keys. If 'namespace' is provided just clears the keys in that
		//		namespace.
		dojo.unimplemented("dojo.storage.clear");
	},
  
	remove: function(/*string*/ key, /*string?*/ namespace){
		// summary: Removes the given key from this storage system.
		dojo.unimplemented("dojo.storage.remove");
	},
	
	getNamespaces: function(){ /*string[]*/
		dojo.unimplemented("dojo.storage.getNamespaces");
	},

	isPermanent: function(){ /*Boolean*/
		// summary:
		//		Returns whether this storage provider's values are persisted
		//		when this platform is shutdown. 
		dojo.unimplemented("dojo.storage.isPermanent");
	},

	getMaximumSize: function(){ /* mixed */
		// summary: The maximum storage allowed by this provider
		// returns: 
		//	Returns the maximum storage size 
	    //	supported by this provider, in 
	    //	thousands of bytes (i.e., if it 
	    //	returns 60 then this means that 60K 
	    //	of storage is supported).
	    //
	    //	If this provider can not determine 
	    //	it's maximum size, then 
	    //	dojo.storage.SIZE_NOT_AVAILABLE is 
	    //	returned; if there is no theoretical
	    //	limit on the amount of storage 
	    //	this provider can return, then
	    //	dojo.storage.SIZE_NO_LIMIT is 
	    //	returned
		dojo.unimplemented("dojo.storage.getMaximumSize");
	},

	hasSettingsUI: function(){ /*Boolean*/
		// summary: Determines whether this provider has a settings UI.
		return false;
	},

	showSettingsUI: function(){
		// summary: If this provider has a settings UI, determined
		// by calling hasSettingsUI(), it is shown. 
		dojo.unimplemented("dojo.storage.showSettingsUI");
	},

	hideSettingsUI: function(){
		// summary: If this provider has a settings UI, hides it.
		dojo.unimplemented("dojo.storage.hideSettingsUI");
	},
	
	getType: function(){ /*String*/
		// summary:
		//		The provider name as a string, such as
		//		"dojo.storage.FlashStorageProvider". 
		dojo.unimplemented("dojo.storage.getType");
	},
	
	isValidKey: function(/*string*/ keyName){ /*Boolean*/
		// summary:
		//		Subclasses can call this to ensure that the key given is valid
		//		in a consistent way across different storage providers. We use
		//		the lowest common denominator for key values allowed: only
		//		letters, numbers, and underscores are allowed. No spaces. 
		if((keyName == null)||(typeof keyName == "undefined")){
			return false;
		}
			
		return /^[0-9A-Za-z_]*$/.test(keyName);
	},
	
	getResourceList: function(){ /* Array[] */
		// summary:
		//	Returns a list of URLs that this
		//	storage provider might depend on.
		// description:
		//	This method returns a list of URLs that this
		//	storage provider depends on to do its work.
		//	This list is used by the Dojo Offline Toolkit
		//	to cache these resources to ensure the machinery
		//	used by this storage provider is available offline.
		//	What is returned is an array of URLs.
		
		return new Array();
	}
});




dojo.storage.manager = new function(){
	// summary: A singleton class in charge of the Dojo Storage system
	// description:
	//		Initializes the storage systems and figures out the best available 
	//		storage options on this platform.	
	
	// currentProvider: Object
	//	The storage provider that was automagically chosen to do storage
	//	on this platform, such as dojo.storage.browser.FlashStorageProvider.
	this.currentProvider = null;
	
	// available: Boolean
	//	Whether storage of some kind is available
	this.available = false;
	
	this._initialized = false;
	this._providers = [];
	this._onLoadListeners = new Array();
	
	this.initialize = function(){
		// summary: 
		//		Initializes the storage system and autodetects the best storage
		//		provider we can provide on this platform
		this.autodetect();
	};
	
	this.register = function(/*string*/ name, /*Object*/ instance) {
		// summary:
		//		Registers the existence of a new storage provider; used by
		//		subclasses to inform the manager of their existence. The
		//		storage manager will select storage providers based on 
		//		their ordering, so the order in which you call this method
		//		matters. 
		// name:
		//		The full class name of this provider, such as
		//		"dojo.storage.browser.FlashStorageProvider".
		// instance:
		//		An instance of this provider, which we will use to call
		//		isAvailable() on. 
		this._providers[this._providers.length] = instance;
		this._providers[name] = instance;
	};
	
	this.setProvider = function(storageClass){
		// summary:
		//		Instructs the storageManager to use the given storage class for
		//		all storage requests.
		// description:
		//		Example-
		//			dojo.storage.setProvider(
		//				dojo.storage.browser.IEStorageProvider)
	
	};
	
	this.autodetect = function(){
		// summary:
		//		Autodetects the best possible persistent storage provider
		//		available on this platform. 
		if(this._initialized == true){ // already finished
			return;
		}
			
		// go through each provider, seeing if it can be used
		var providerToUse = null;
		for(var i = 0; i < this._providers.length; i++){
			providerToUse = this._providers[i];
			// a flag to force the storage manager to use a particular 
			// storage provider type, such as 
			// djConfig = {forceStorageProvider: "dojo.storage.browser.WhatWGStorageProvider"};
			if(dojo.lang.isUndefined(djConfig["forceStorageProvider"]) == false
				&& providerToUse.getType() == djConfig["forceStorageProvider"]){
				// still call isAvailable for this provider, since this helps some
				// providers internally figure out if they are available
				providerToUse.isAvailable();
				break;
			}else if(dojo.lang.isUndefined(djConfig["forceStorageProvider"]) == true
						&& providerToUse.isAvailable()){
				break;
			}
		}	
		
		if(providerToUse == null){ // no provider available
			this._initialized = true;
			this.available = false;
			this.currentProvider = null;
			dojo.raise("No storage provider found for this platform");
		}
			
		// create this provider and copy over it's properties
		this.currentProvider = providerToUse;
	  	for(var i in providerToUse){
	  		dojo.storage[i] = providerToUse[i];
		}
		dojo.storage.manager = this;
		
		// have the provider initialize itself
		dojo.storage.initialize();
		
		this._initialized = true;
		this.available = true;
	};
	
	this.isAvailable = function(){ /*Boolean*/
		// summary: Returns whether any storage options are available.
		return this.available;
	};
	
	this.addOnLoad = function(func){ /* void */
		// summary:
		//	Adds an onload listener to know when
		//	Dojo Offline can be used.
		// description:
		//	Adds a listener to know when Dojo Offline
		//	can be used. This ensures that the Dojo
		//	Offline framework is loaded and that the
		//	local Dojo Storage system is ready to
		//	be used. This method is useful if you
		//	don't want to have a dependency on
		//	Dojo Events when using Dojo Storage.
		// func: Function
		//	A function to call when Dojo Offline
		//	is ready to go
		this._onLoadListeners.push(func);
		
		if(this.isInitialized() == true){
			this.fireLoaded();
		}
	};
	
	this.removeOnLoad = function(func){ /* void */
		// summary:
		//	Removes the given onLoad listener
		for(var i = 0; i < this._onLoadListeners.length; i++){
			if(func == this._onLoadListeners[i]){
				this._onLoadListeners = this._onLoadListeners.splice(i, 1);
				break;
			}
		}
	};
	
	this.isInitialized = function(){ /*Boolean*/
	 	// summary:
		//		Returns whether the storage system is initialized and ready to
		//		be used. 

		// FIXME: This should REALLY not be in here, but it fixes a tricky
		// Flash timing bug
		if(this.currentProvider.getType() == "dojo.storage.browser.FlashStorageProvider"
			&& dojo.flash.ready == false){
			return false;
		}else{
			return this._initialized;
		}
	};

	this.supportsProvider = function(/*string*/ storageClass){ /* Boolean */
		// summary: Determines if this platform supports the given storage provider.
		// description:
		//		Example-
		//			dojo.storage.manager.supportsProvider(
		//				"dojo.storage.browser.InternetExplorerStorageProvider");

		// construct this class dynamically
		try{
			// dynamically call the given providers class level isAvailable()
			// method
			var provider = eval("new " + storageClass + "()");
			var results = provider.isAvailable();
			if(results == null || typeof results == "undefined")
				return false;
			return results;
		}catch (exception){
			return false;
		}
	};

	this.getProvider = function(){ /* Object */
		// summary: Gets the current provider
		return this.currentProvider;
	};
	
	this.loaded = function(){
		// summary:
		//		The storage provider should call this method when it is loaded
		//		and ready to be used. Clients who will use the provider will
		//		connect to this method to know when they can use the storage
		//		system. You can either use dojo.event.connect to connect to this
		//		function, or can use dojo.storage.manager.addOnLoad() to add
		//		a listener that does not depend on the dojo.event package.
		// description:
		//		Example 1-
		//			if(dojo.storage.manager.isInitialized() == false){ 
		//				dojo.event.connect(dojo.storage.manager, "loaded", TestStorage, 
	    //				TestStorage.initialize);
		//			}else{
		//				dojo.event.connect(dojo, "loaded", TestStorage, TestStorage.initialize);
		//			}
		//		Example 2-
		//			dojo.storage.manager.addOnLoad(someFunction);
		this.fireLoaded();
	};
	
	this.fireLoaded = function(){
		for(var i = 0; i < this._onLoadListeners.length; i++){
			this._onLoadListeners[i]();
		}
	};
	
	this.getResourceList = function(){
		// summary:
		//	Returns a list of whatever resources are necessary for
		//	storage providers to work. 
		// description:
		//	This will return all files
		//	needed by all storage providers for this particular
		//	environment type. For example, if we are in the
		//	browser environment, then this will return the hidden
		//	SWF files needed by the FlashStorageProvider, even if
		//	we don't need them for the particular browser we are
		//	working within. This is meant to faciliate Dojo Offline,
		//	which must retrieve all resources we need offline into
		//	the offline cache -- we retrieve everything needed, in case
		//	another browser that requires different storage mechanisms
		//	hits the local offline cache. For example, if we were to 
		//	sync against Dojo Offline on Firefox 2, then we would not
		//	grab the FlashStorageProvider resources needed for Safari.
		var results = new Array();
		for(var i = 0; i < dojo.storage.manager._providers.length; i++){
			var currentProvider = dojo.storage.manager._providers[i];
			var resources = currentProvider.getResourceList();
			for(var j = 0; j < resources.length; j++){
				results[results.length] = resources[j];
			}
		}
		
		return results;
	}
};
