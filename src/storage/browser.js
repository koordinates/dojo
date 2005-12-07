dojo.provide("dojo.storage.browser");
dojo.require("dojo.storage");
dojo.require("dojo.uri.*");

/** Storage provider that uses features in Flash to achieve permanent storage.
		Internally, it uses Flash Shared Objects (Flash 6+) and the External
		Interface API (Flash 8+) to script and store information in Flash
		that can later be retrieved. 
		
		@author Alex Russel, alex@dojotoolkit.org
		@author Brad Neuberg, bkn3@columbia.edu 
*/
dojo.storage.browser.FlashStorageProvider = function() {
	// output the HTML we need to support our Flash object
	this._writeStorage();
	this.flash = (dojo.render.html.ie) ? window["dojoStorage"] : document["dojoStorage"];
	dojo.debug("flash="+this.flash);
	
	// FIXME: Technically, we should wait for a callback from the Flash file
	// itself, since it might not be loaded yet
	this.initialized = true;
}

dojo.inherits(dojo.storage.browser.FlashStorageProvider, 
							dojo.storage.StorageProvider);

// static, class level methods
/** Returns whether this storage provider is 
    available on this platform. Static, class
    level method that can be called to determine
    if we can even instantiate this storage
    provider on this platform.

    @returns True or false if this storage 
    provider is supported.
 */
dojo.storage.browser.FlashStorageProvider.isAvailable = function() {
	return true;
}

/** Returns whether this provider can be installed,
		to upgrade a platform to have the features
		necessary to use this storage provider. */
dojo.storage.browser.FlashStorageProvider.isInstallable = function() {
	return false;
}

/** If this provider can be installed at runtime,
		does so. */
dojo.storage.browser.FlashStorageProvider.install = function() {
}


// instance methods and properties
dojo.lang.extend(dojo.storage.browser.FlashStorageProvider, {
	initialized: false,
	
	/** Puts a key and value into this storage system.

    @param key A string key to use when retrieving 
           this value in the future.
    @param value A value to store; this can be 
           any JavaScript type.
    @param resultsHandler A callback function 
           that will receive two arguments.
           The first argument is one of three 
           values: dojo.storage.SUCCESS,
           dojo.storage.FAILED, or 
           dojo.storage.PENDING; these values 
           determine how the put request went. 
           In some storage systems users can deny
           a storage request, resulting in a 
           dojo.storage.FAILED, while in 
           other storage systems a storage 
           request must wait for user approval,
           resulting in a dojo.storage.PENDING 
           status until the request
           is either approved or denied, 
           resulting in another call back
           with dojo.storage.SUCCESS. 
    
    The second argument in the call back is an 
    optional message that details possible error 
    messages that might have occurred during
    the storage process.
    
    Example:
      var resultsHandler = function(status, message) {
        alert("status="+status+", message="+message);
      };
      dojo.storage.put("test", "hello world", 
                       resultsHandler);
	*/
	put: function(key, value, resultsHandler) { 
		// FIXME: Modify Flash to do results handler callback
		this.flash.set(key, value, dojo.storage.manager.namespace);
	},

	/** Gets the value with the given key. Returns null
	    if this key is not in the storage system.
	
	    @param key A string key to get the value of.
	    @returns Returns any JavaScript object type; 
	    null if the key is not
	    present. */
	get: function(key) {
		var results = this.flash.get(key, dojo.storage.manager.namespace);
		return results;
	},

	/** Determines whether the storage has the given 
	    key. 
	
	      @returns Whether this key is 
	               present or not. */
	hasKey: function(key) {
		if (this.get(key) != null)
			return true;
		else
			return false;
	},

	/** Enumerates all of the available keys in 
	    this storage system.
	
	    @returns Array of string keys in this 
	             storage system.
	 */
	getKeys: function() {},

	/** Completely clears this storage system of all 
	    of it's values and keys. */
	clear: function() {},

	/** Returns whether this storage provider's 
	    values are persisted when this platform 
	    is shutdown. 
	
	    @returns True or false whether this 
	    storage is permanent. */
	isPermanent: function() {
		return false;
	},

	/** The maximum storage allowed by this provider.
	
	    @returns Returns the maximum storage size 
	             supported by this provider, in 
	             thousands of bytes (i.e., if it 
	             returns 60 then this means that 60K 
	             of storage is supported).
	    
	             If this provider can not determine 
	             it's maximum size, then 
	             dojo.storage.SIZE_NOT_AVAILABLE is 
	             returned; if there is no theoretical
	             limit on the amount of storage 
	             this provider can return, then
	             dojo.storage.SIZE_NO_LIMIT is 
	             returned. */
	getMaximumSize: function() {},

	/** Determines whether this provider has a 
	    settings UI.
	
	    @returns True or false if this provider has 
	             the ability to show a
	             a settings UI to change it's 
	             values, change the amount of storage
	             available, etc. */
	hasSettingsUI: function() {
		return false;
	},

	/** If this provider has a settings UI, it is 
	    shown. */
	showSettingsUI: function() {
	},

	/** If this provider has a settings UI, hides
		  it. */
	hideSettingsUI: function() {
	},
	
	_writeStorage: function(){
		var swfloc = dojo.uri.dojoUri("src/storage/Storage.swf").toString();
		dojo.debug("swfloc="+swfloc);
		var storeParts = new Array();
		if(dojo.render.html.ie) {
			storeParts.push('<object');
			storeParts.push('	style="border: 1px solid black;"');
			storeParts.push('	classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"');
			storeParts.push('	codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0"');
			storeParts.push('	width="215" height="138" id="dojoStorage">');
			storeParts.push('	<param name="movie" value="'+swfloc+'">');
			storeParts.push('	<param name="quality" value="high">');
			storeParts.push('</object>');
		} else {
			storeParts.push('<embed src="'+swfloc+'" width="215" height="138" ');
			storeParts.push('	quality="high" ');
			storeParts.push('	pluginspage="http://www.macromedia.com/go/getflashplayer" ');
			storeParts.push('	type="application/x-shockwave-flash" ');
			storeParts.push('	name="dojoStorage">');
			storeParts.push('</embed>');
		}
		
		var results = storeParts.join("");
		var container = document.createElement("div");
		container.id = "dojo-storeContainer";
		container.style.position = "absolute";
		container.style.left = "-300px";
		container.style.top = "-300px";
		container.innerHTML = results;
		
		document.body.appendChild(container);
	}
	
});

