dojo.provide("dojox.storage.Provider");

dojo.declare("dojox.storage.Provider", 
	function(){
		// summary: A singleton for working with dojox.storage.
		// description:
		//		dojox.storage exposes the current available storage provider on this
		//		platform. It gives you methods such as dojox.storage.put(),
		//		dojox.storage.get(), etc.
		//		
		//		For more details on dojox.storage, see the primary documentation
		//		page at
		//			http://manual.dojotoolkit.org/storage.html
		//		
		//		Note for storage provider developers who are creating subclasses-
		//		This is the base class for all storage providers Specific kinds of
		//		Storage Providers should subclass this and implement these methods.
		//		You should avoid initialization storage provider subclass's
		//		constructor; instead, perform initialization in your initialize()
		//		method. 	
	}, {
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
			console.warn("dojox.storage.initialize not implemented");
		},
		
		isAvailable: function(){ /*Boolean*/
			// summary: 
			//		Returns whether this storage provider is available on this
			//		platform. 
			console.warn("dojox.storage.isAvailable not implemented");
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
			//			dojox.storage.put("test", "hello world", resultsHandler);
			// key:
			//		A string key to use when retrieving this value in the future.
			// value:
			//		A value to store; this can be any JavaScript type.
			// resultsHandler:
			//		A callback function that will receive three arguments. The
			//		first argument is one of three values: dojox.storage.SUCCESS,
			//		dojox.storage.FAILED, or dojox.storage.PENDING; these values
			//		determine how the put request went. In some storage systems
			//		users can deny a storage request, resulting in a
			//		dojox.storage.FAILED, while in other storage systems a storage
			//		request must wait for user approval, resulting in a
			//		dojox.storage.PENDING status until the request is either
			//		approved or denied, resulting in another call back with
			//		dojox.storage.SUCCESS. 
			//		The second argument in the call back is the key name that was being stored.
			//		The third argument in the call back is an optional message that
			//		details possible error messages that might have occurred during
			//		the storage process.
			//	namespace:
			//		Optional string namespace that this value will be placed into;
			//		if left off, the value will be placed into dojox.storage.DEFAULT_NAMESPACE
			
			console.warn("dojox.storage.put not implemented");
		},

		get: function(/*string*/ key, /*string?*/ namespace){ /*Object*/
			// summary:
			//		Gets the value with the given key. Returns null if this key is
			//		not in the storage system.
			// key:
			//		A string key to get the value of.
			//	namespace:
			//		Optional string namespace that this value will be retrieved from;
			//		if left off, the value will be retrieved from dojox.storage.DEFAULT_NAMESPACE
			// return: Returns any JavaScript object type; null if the key is not present
			console.warn("dojox.storage.get not implemented");
		},

		hasKey: function(/*string*/ key, /*string?*/ namespace){ /*Boolean*/
			// summary: Determines whether the storage has the given key. 
			return (this.get(key) != null);
		},

		getKeys: function(/*string?*/ namespace){ /*Array*/
			// summary: Enumerates all of the available keys in this storage system.
			// return: Array of available keys
			console.warn("dojox.storage.getKeys not implemented");
		},
		
		clear: function(/*string?*/ namespace){
			// summary: 
			//		Completely clears this storage system of all of it's values and
			//		keys. If 'namespace' is provided just clears the keys in that
			//		namespace.
			console.warn("dojox.storage.clear not implemented");
		},
	  
		remove: function(/*string*/ key, /*string?*/ namespace){
			// summary: Removes the given key from this storage system.
			console.warn("dojox.storage.remove not implemented");
		},
		
		getNamespaces: function(){ /*string[]*/
			console.warn("dojox.storage.getNamespaces not implemented");
		},

		isPermanent: function(){ /*Boolean*/
			// summary:
			//		Returns whether this storage provider's values are persisted
			//		when this platform is shutdown. 
			console.warn("dojox.storage.isPermanent not implemented");
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
			//	dojox.storage.SIZE_NOT_AVAILABLE is 
			//	returned; if there is no theoretical
			//	limit on the amount of storage 
			//	this provider can return, then
			//	dojox.storage.SIZE_NO_LIMIT is 
			//	returned
			console.warn("dojox.storage.getMaximumSize not implemented");
		},

		hasSettingsUI: function(){ /*Boolean*/
			// summary: Determines whether this provider has a settings UI.
			return false;
		},

		showSettingsUI: function(){
			// summary: If this provider has a settings UI, determined
			// by calling hasSettingsUI(), it is shown. 
			console.warn("dojox.storage.showSettingsUI not implemented");
		},

		hideSettingsUI: function(){
			// summary: If this provider has a settings UI, hides it.
			console.warn("dojox.storage.hideSettingsUI not implemented");
		},
		
		getType: function(){ /*String*/
			// summary:
			//		The provider name as a string, such as
			//		"dojox.storage.FlashStorageProvider". 
			console.warn("dojox.storage.getType not implemented");
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
			
			return [];
		}
	}
);
