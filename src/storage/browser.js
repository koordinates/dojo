dojo.provide("dojo.storage.browser");
dojo.require("dojo.storage");
dojo.require("dojo.uri.*");

/** 	Storage provider that uses features in Flash to achieve permanent storage.
		Internally, it uses Flash Shared Objects (Flash 6+) and the External
		Interface API (Flash 8+) to script and store information in Flash that
		can later be retrieved. 
		
		@author Alex Russell, alex@dojotoolkit.org
		@author Brad Neuberg, bkn3@columbia.edu 
*/
dojo.storage.browser.FlashStorageProvider = function(){
	// output the HTML we need to support our Flash object
	this._writeStorage();
	this.flash = (dojo.render.html.ie) ? window["dojoStorage"] : document["dojoStorage"];
	dojo.debug("flash="+this.flash);
	
	// FIXME: Technically, we should wait for a callback from the Flash file
	// itself, since it might not be loaded yet
	this.initialized = true;
}

dojo.inherits(	dojo.storage.browser.FlashStorageProvider, 
				dojo.storage.StorageProvider);

// static, class level methods
/*
	Returns whether this storage provider is available on this platform.
	Static, class level method that can be called to determine if we can even
	instantiate this storage provider on this platform.

    @returns True or false if this storage provider is supported.
*/
dojo.storage.browser.FlashStorageProvider.isAvailable = function(){
	return true;
}

/** Returns whether this provider can be installed, to upgrade a platform to
 * have the features necessary to use this storage provider. */
dojo.storage.browser.FlashStorageProvider.isInstallable = function(){
	return false;
}

dojo.storage.browser.FlashStorageProvider.install = function(){ }


// instance methods and properties
dojo.lang.extend(dojo.storage.browser.FlashStorageProvider, {
	initialized: false,
	
	put: function(key, value, resultsHandler){
		// FIXME: Modify Flash to do results handler callback
		this.flash.set(key, value, dojo.storage.manager.namespace);
	},

	get: function(key){
		var results = this.flash.get(key, dojo.storage.manager.namespace);
		return results;
	},

	isPermanent: function(){
		return false;
	},

	getMaximumSize: function(){},

	hasSettingsUI: function(){
		return true;
	},

	/** If this provider has a settings UI, it is 
	    shown. */
	showSettingsUI: function(){
	},

	/** If this provider has a settings UI, hides
		  it. */
	hideSettingsUI: function(){
	},
	
	_writeStorage: function(){
		var swfloc = dojo.uri.dojoUri("src/storage/Storage.swf").toString();
		dojo.debug("swfloc="+swfloc);
		var storeParts = new Array();
		if(dojo.render.html.ie){
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

