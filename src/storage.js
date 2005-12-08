/** FIXME: Write better docs.

		@author Alex Russel, alex@dojotoolkit.org
		@author Brad Neuberg, bkn3@columbia.edu 
*/

// FIXME: should we require JSON here?
dojo.require("dojo.lang.*");
dojo.require("dojo.event.*");
dojo.provide("dojo.storage");
dojo.provide("dojo.storage.StorageProvider");

/** Initializes the storage systems and figures out the best available 
	storage options on this platform. */
dojo.storage.manager = new function(){
	this.currentProvider = null;
	this.available = false;
	this.initialized = false;
	
	// TODO: Provide a way for applications to override the default namespace
	this.namespace = "*";

	this.initialize = function(){
		// autodetect the best storage provider we can provide on this platform
		this.autodetect();
	}
	
	/** Instructs the storageManager to use the given storage class for all
		storage requests.
		
		Example:
		
		dojo.storage.setProvider(dojo.storage.browser.IEStorageProvider)
	*/
	this.setProvider = function(storageClass){
	
	}
	
	this.autodetect = function(){
		// Autodetects the best possible persistent storage provider available
		// on this platform.
		dojo.debug("autodetect");
		// right now we only support Flash
		if (this.initialized == true) // already finished
			return;
			
		// do data migration if this user has moved to a better storage provider
		this.migrator = new dojo.storage._StorageMigrator();
		if (this.migrator.needsMigration()){
			this.migrator.migrate();
			this.initialized = true;
			this.available = true;
		}
		else {
			dojo.debug("doing the hard work");
			// right now we only support Flash
			if (dojo.storage.browser.FlashStorageProvider.isAvailable()){
				// create this provider
				this.currentProvider = new dojo.storage.browser.FlashStorageProvider();
				
				// copy our properties over to dojo.storage so it can be
				// scripted easily
				for (var i in this.currentProvider)
					dojo.storage[i] = this.currentProvider[i];
				this.currentProvider = dojo.storage;
				dojo.debug("dojo.storage copied into="+dojo.storage);
				dojo.debug("currentProvider="+this.currentProvider);
				
				this.initialized = true;
				this.available = true;
			}
			else { // no storage available
				this.initialized = true;
				this.available = false;
			}
		}	
	}
	
	/** Returns whether any storage options are available. */
	this.isAvailable = function(){
		return this.available;
	}

	/** Determines if this platform supports
			the given storage provider.
			
			Example:
			
			dojo.storage.manager.supportsProvider(
				"dojo.storage.browser.InternetExplorerStorageProvider");
	*/
	this.supportsProvider = function(storageClass){
		// construct this class dynamically
		try {
			// dynamically call the given providers class level isAvailable()
			// method
			var results = eval(storageClass + ".isAvailable()");
			if (results == null || typeof results == "undefined")
				return false;
			return results;
		}
		catch (exception){
			dojo.debug("exception="+exception);
			return false;
		}
	}

	/** Gets the current provider. */
	this.getProvider = function(){
		return this.currentProvider;
	}
}

/** The base class for all storage providers. */

/** The constructor will be called after the page is finished loading,
	  so you should do all of your initialization in here, such as writing out
	  DOM nodes needed by your provider, initializing plugings, etc. */
dojo.storage.StorageProvider = function(){
	// do initialization
}

dojo.storage.SUCCESS = "success";
dojo.storage.FAILED = "failed";
dojo.storage.PENDING = "pending";

// Returned by getMaximumSize() if this storage provider can not determine the
// maximum amount of data it can support.
dojo.storage.SIZE_NOT_AVAILABLE = -1;

// Returned by getMaximumSize() if this storage provider has no theoretical
// limit on the amount of data it can store.
dojo.storage.SIZE_NO_LIMIT = -2;

dojo.lang.extend(dojo.storage.StorageProvider, {
	/** Puts a key and value into this storage system.

	@param	key A string key to use when retrieving this value in the future.
	@param	value A value to store; this can be any JavaScript type.
	@param	resultsHandler A callback function that will receive two arguments.
			The first argument is one of three values: dojo.storage.SUCCESS,
			dojo.storage.FAILED, or dojo.storage.PENDING; these values
			determine how the put request went.	 In some storage systems users
			can deny a storage request, resulting in a dojo.storage.FAILED,
			while in other storage systems a storage request must wait for user
			approval, resulting in a dojo.storage.PENDING status until the
			request is either approved or denied, resulting in another call
			back with dojo.storage.SUCCESS. 
	
	The second argument in the call back is an optional message that details
	possible error messages that might have occurred during the storage
	process.
	
	Example:
	  var resultsHandler = function(status, message){
		alert("status="+status+", message="+message);
	  };
	  dojo.storage.put("test", "hello world", 
					   resultsHandler);
	*/
	put: function(key, value, resultsHandler){ },

	/** Gets the value with the given key. Returns null if this key is not in
		the storage system.
	
		@param key A string key to get the value of.
		@returns Returns any JavaScript object type; null if the key is not
		present.
	*/
	get: function(key){},

	hasKey: function(key){
		// Determines whether the storage has the given key. 
		return (this.get(key) != null);
	},

	/** Enumerates all of the available keys in this storage system.
	
		@returns Array of string keys in this storage system.
	 */
	getKeys: function(){},

	// Completely clears this storage system of all of it's values and keys.
	clear: function(){},

	isPermanent: function(){
		/** Returns whether this storage provider's 
			values are persisted when this platform is shutdown. 
		*/
		return false;
	},

	/** The maximum storage allowed by this provider.
	
		@returns	Returns the maximum storage size supported by this
					provider, in thousands of bytes (i.e., if it returns 60
					then this means that 60K of storage is supported).

					If this provider can not determine it's maximum size, then
					dojo.storage.SIZE_NOT_AVAILABLE is returned; if there is no
					theoretical limit on the amount of storage this provider
					can return, then dojo.storage.SIZE_NO_LIMIT is returned.
	*/
	getMaximumSize: function(){},

	/** Determines whether this provider has a 
		settings UI.
	
		@returns	True or false if this provider has the ability to show a a
					settings UI to change it's values, change the amount of
					storage available, etc.
	*/
	hasSettingsUI: function(){
		return false;
	},

	showSettingsUI: function(){
		// If this provider has a settings UI, it is shown.
		dojo.unimplemented("dojo.storage.StorageProvider.showSettingsUI");
	},

	hideSettingsUI: function(){
		// If this provider has a settings UI, hides it.
		dojo.unimplemented("dojo.storage.StorageProvider.hideSettingsUI");
	}
	
});

/** 
	A private class that helps the storageManager to migrate a user's data to
	an upgraded storage system, if this occurs. This is necessary so that we
	can migrate data between storage providers if a user "upgrades" their
	browser. For example, if they are on Internet Explorer, and we store data
	using InternetExplorerStorageProvider, and they later install Flash, we
	don't want to have applications "lose" their data when we autodetect Flash
	and move to the FlashStorageProvider.
*/
dojo.storage._StorageMigrator = function(){
}

dojo.lang.extend(dojo.storage._StorageMigrator, {
	/** Determines if migration is needed. */
	needsMigration: function(){
		return false;
	},
	
	/** Does the migration process if it is needed. */
	migrate: function(){
	},

	/** Determines if we have already chosen a
		  storage provider from a previous session. */
	_hasSavedProvider: function(){
	},

	/** Persists the current storage provider choice
			as a cookie. */
	_saveProvider: function(){
	},

	/** Loads the storage provider choice chosen in
			previous sessions. */
	_loadProvider: function(){
	},
	
	/** Migrates data from an old storage provider
			to a new, better one. */
	_migrateData: function(){
	}
});

dojo.addOnLoad(function(){
	dojo.storage.manager.initialize();
});
