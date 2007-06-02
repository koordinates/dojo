dojo.provide("dojo.off");

dojo.require("dojo.io.*");
dojo.require("dojo.event.*");
dojo.require("dojo.storage.Gears");
dojo.require("dojo.sql");

// Author: Brad Neuberg, bkn3@columbia.edu, http://codinginparadise.org

// summary:
//	dojo.off is the main object for
//	offline applications.
dojo.lang.mixin(dojo.off, {
	// NETWORK_CHECK: int
	//	Time in seconds on how often we should check the
	//	status of the network with an automatic background
	//	timer. Defaults to 30.
	NETWORK_CHECK: 20,
	
	// STORAGE_NAMESPACE: String
	//	The namespace we use to save core data into
	//	Dojo Storage.
	STORAGE_NAMESPACE: "dojo_offline",
	
	// enabled: boolean
	//	Whether offline ability is enabled or not. Defaults to true.
	enabled: true,

	// isOnline: boolean
	//	true if we are online, false if not
	isOnline: false,
	
	// availabilityURL: String
	//	The URL to check for site availability. 
	//	We do a GET request
	//	on this URL to check for site availability. 
	//	By default we check for a simple text file
	//	in src/off/network_check.txt that has one value
	//	it, the value '1'.
	availabilityURL: djConfig.baseRelativePath + "src/off/network_check.txt",
	
	// goingOnline: boolean
	//	True if we are attempting to go online, false otherwise
	goingOnline: false,
	
	// coreOperationFailed: boolean
	//	A flag set by the Dojo Offline framework that indicates
	//	that the user denied some operation that required the
	//	offline cache or an operation failed in some critical
	//	way that was unrecoverable. For example, if the offline cache is
	//	Google Gears and we try to get a Gears database, a
	//	popup window appears asking the user whether they
	//	will approve or deny this request. If the user denies
	//	the request, and we are doing some operation that is
	//	core to Dojo Offline, then we set this flag to 'true'. 
	//	This flag causes a 'fail fast' condition, turning off 
	//	offline ability.
	coreOperationFailed: false,
	
	// doNetworkChecking: boolean
	//	Whether to have a timing interval in the background doing
	//	automatic network checks at regular intervals; the length
	//	of time between checks is controlled by 
	//	dojo.off.NETWORK_CHECK. Defaults to true.
	doNetworkChecking: true,
	
	// hasOfflineCache: boolean
	//  Determines if an offline cache is available or installed;
	//	an offline cache is a facility that can truely cache offline
	//	resources, such as JavaScript, HTML, etc. in such a way that
	//	they won't be removed from the cache inappropriately like
	//	a browser cache would. If this is false then an offline cache
	//	will be installed. Only Google Gears is currently supported as
	//	an offline cache. Future possible offline caches include
	//	Firefox 3.
	hasOfflineCache: null,
	
	// browserRestart: boolean
	//	If true, the browser must be restarted to register the
	//	existence of a new host added offline (from a call to
	//	addHostOffline); if false, then nothing is needed.
	browserRestart: false,
	
	_onLoadListeners: new Array(),
	_initializeCalled: false,
	_storageLoaded: false,
	_pageLoaded: false,
	
	onOnline: function(){ /* void */
		// summary:
		//	Called when we go online.
		// description:
		//	This method is called when
		//	we are successfully online.
		//	The default implementation is
		//	to perform a synchronization.
		//	Override with your own implementation
		//	if you don't want the default behavior
	},
	
	onOffline: function(){ /* void */
		// summary:
		//	Called when we go offline.
		// description: 
		//	This method is called when we
		//	move offline.
	},
	
	goOffline: function(){ /* void */
		// summary:
		//	Manually goes offline, away from the network.
		if(dojo.sync.isSyncing == true
			|| this.goingOnline == true){
			return;
		}
		
		this.goingOnline = false;
		this.isOnline = false;
	},
	
	goOnline: function(finishedCallback){ /* void */
		//dojo.debug("goOnline");
		// summary:
		//	Attempts to go online.
		// description:
		//	Attempts to go online, making sure this web
		//	application's web site is available. 'callback'
		//	is called asychronously with the result of whether
		//	we were able to go online or not.
		// finishedCallback: Function
		//	An optional callback function that will receive one argument:
		//	whether the site is available or not
		//	and is boolean. If this function is not present we call
		//	dojo.off.onOnline instead if we are able to go online.
		
		if(dojo.sync.isSyncing == true
			|| dojo.off.goingOnline == true){
			return;
		}
		
		this.goingOnline = true;
		this.isOnline = false;
		
		// see if can reach our web application's web site
		this._isSiteAvailable(finishedCallback);
	},
	
	addOnLoad: function(func){ /* void */
		// summary:
		//	Adds an onload listener to know when
		//	Dojo Offline can be used.
		// description:
		//	Adds a listener to know when Dojo Offline
		//	can be used. This ensures that the Dojo
		//	Offline framework is loaded, that the
		//	local Dojo Storage system is ready to
		//	be used, and that the page is finished
		//	loading. 
		// func: Function
		//	A function to call when Dojo Offline
		//	is ready to go
		this._onLoadListeners.push(func);
	},
	
	removeOnLoad: function(func){ /* void */
		// summary:
		//	Removes the given onLoad listener
		for(var i = 0; i < this._onLoadListeners.length; i++){
			if(func == this._onLoadListeners[i]){
				this._onLoadListeners = this._onLoadListeners.splice(i, 1);
				break;
			}
		}
	},
	
	save: function(){ /* void */
		// summary:
		//	Causes the Dojo Offline framework to save its configuration data
		//	into local storage.	
	},
	
	load: function(finishedCallback /* Function */){ /* void */
		// summary:
		//	Causes the Dojo Offline framework to load its configuration data
		//	from local storage
		dojo.sync.load(finishedCallback);
	},
	
	initialize: function(){ /* void */
		//dojo.debug("dojo.off.initialize");
		
		// summary:
		//	Called when a Dojo Offline-enabled application
		//	is finished configuring Dojo Offline, and is ready
		//	for Dojo Offline to initialize itself.
		// description:
		//	When an application has finished filling
		//	out the variables Dojo Offline needs to work, such
		//	as dojo.off.ui.appName, it should call this method
		//	to tell Dojo Offline to initialize itself. This method
		//	is needed for a rare edge case. In some conditions,
		//	especially if we are dealing with a compressed Dojo build,
		//	the entire Dojo Offline subsystem might initialize itself
		//	and be running even before the JavaScript for an application
		//	has had a chance to run and configure Dojo Offline, causing
		//	Dojo Offline to have incorrect initialization parameters for
		//	a given app, such as no value for dojo.off.ui.appName. This
		//	method is provided to prevent this scenario, to slightly
		//	'slow down' Dojo Offline so it can be configured before running
		//	off and doing its thing.	
		this._initializeCalled = true;
		
		if(this._storageLoaded == true
			&& this._pageLoaded == true
			&& this._initializeCalled == true){
			this._onLoad();
		}
	},
	
	onSave: function(isCoreSave, status, key, value, namespace){
		// summary:
		//	A standard function that can be registered which is
		//	called when some piece of data is saved locally.
		// description:
		//	Applications can override this method to be notified
		//	when offline data is attempting to be saved. This can
		//	be used to provide UI feedback while saving, and for
		//	providing appropriate error feedback if saving fails
		//	due to a user not allowing the save to occur.
		// isCoreSave: boolean
		//	If true, then this save was for a core piece of data necessary for
		//	the functioning of Dojo Offline. If false, then it is a piece of
		//	normal data being saved for offline access. Dojo Offline will
		//	'fail fast' if some core piece of data could not be saved, automatically
		//	setting dojo.off.coreOperationFailed to 'true' and dojo.off.enabled to 'false'.
		// status: dojo.storage.SUCCESS, dojo.storage.PENDING, dojo.storage.FAILED
		//	Whether the save succeeded, whether it is pending based on a UI dialog
		//	asking the user for permission, or whether it failed.
		// key: String
		//	The key that we are attempting to persist
		// value: Object
		//	The object we are trying to persist
		// namespace: String
		//	The Dojo Storage namespace we are saving this key/value pair
		//	into, such as "default", "Documents", "Contacts", etc. Optional.
		if(isCoreSave == true && status == dojo.storage.FAILED){
			dojo.off.coreOperationFailed = true;
			dojo.off.enabledabled = false;
			
			// FIXME: Stop the background network thread
			dojo.off.onCoreOperationFailed();
		}
	},
	
	onOfflineCacheInstalled: function(){
		// summary:
		//	A function that can be overridden that is called 
		//	when a user has installed the offline cache after
		//	the page has been loaded. If a user didn't have an offline cache
		//	when the page loaded, a UI of some kind might have prompted them
		//	to download one. This method is called if they have downloaded
		//	and installed an offline cache so a UI can reinitialize itself
		//	to begin using this offline cache.
	},
	
	onCoreOperationFailed: function(){
		// summary:
		//	Called when a core operation during interaction with the
		//	offline cache is denied by the user. Some offline caches,
		//	such as Google Gears, prompts the user to approve or deny
		//	caching files, using the database, and more. If the user 
		//	denies a request that is core to Dojo Offline's operation,
		//	we set dojo.off.coreOperationFailed to true and call this
		//	method for listeners that would like to respond some how
		//	to Dojo Offline 'failing fast'.
	},
	
	standardSaveHandler: function(status, isCoreSave, dataStore, item){
		// summary:
		//	Called by portions of the Dojo Offline framework
		//	as a standard way to handle local save's; this method
		//	is 'package private' and should not be used outside
		//	of the Dojo Offline package.
		if(status == dojo.storage.FAILED
			&& isCoreSave == true){
			this.coreOperationFailed = true;
			this.enabled = false;	
		}
		
		if(this.onSave){
			onSave(status, isCoreSave, dataStore, item);
		}
	},
	
	_checkOfflineCacheAvailable: function(finishedCallback){
		// is a true, offline cache running on this machine?
		this.hasOfflineCache = dojo.render.html.gears.capable;
		
		finishedCallback();
	},
	
	_onLoad: function(){
		dojo.debug("dojo.off._onLoad");
		// both local storage and the page are finished loading
		
		// cache the Dojo JavaScript -- just use the default dojo.js
		// name for the most common scenario
		// FIXME: TEST: Make sure syncing doesn't break if dojo.js
		// can't be found, or report an error to developer
		dojo.off.files.cache([djConfig.baseRelativePath + "dojo.js"]);
		
		// if we are debugging, we must individually add all dojo.require()
		// JS files to offline cache
		this._cacheDebugResources();
		
		// workaround or else we will get an error on page load
		// from Dojo that it can't find 'dojo.debug' for optimized builds
		dojo.off.files.cache(djConfig.baseRelativePath + "src/debug.js");
		
		// make sure that resources needed by all of our underlying
		// Dojo Storage storage providers will be available
		// offline
		dojo.off.files.cache(dojo.storage.manager.getResourceList());
		
		// see if we have an offline cache; when done, move
		// on to the rest of our startup tasks
		this._checkOfflineCacheAvailable(dojo.lang.hitch(this, this._onOfflineCacheChecked));
	},
	
	_onOfflineCacheChecked: function(){
		dojo.debug("dojo.off._onOfflineCacheChecked");
		// this method is part of our _onLoad series of startup tasks
		dojo.debug("hasOfflineCache="+this.hasOfflineCache);
		dojo.debug("coreOperationFailed="+this.coreOperationFailed);
		dojo.debug("enabled="+this.enabled);
		
		// if we have an offline cache, see if we have been added to the 
		// list of available offline web apps yet
		if(this.hasOfflineCache == true && this.enabled == true){
			// load framework data; when we are finished, continue
			// initializing ourselves
			this.load(dojo.lang.hitch(this, this._finishStartingUp));
		}else if(this.hasOfflineCache == true && this.enabled == false){
			// we have an offline cache, but it is disabled for some reason
			// perhaps due to the user denying a core operation
			this._finishStartingUp();
		}else{
			this._keepCheckingUntilInstalled();
		}
	},
	
	_keepCheckingUntilInstalled: function(){
		// this method is part of our _onLoad series of startup tasks
		
		// kick off a background interval that keeps
		// checking to see if an offline cache has been
		// installed since this page loaded
			
		// FIXME: Gears: See if we are installed somehow after the
		// page has been loaded
		
		// now continue starting up
		this._finishStartingUp();
	},
	
	_finishStartingUp: function(){
		dojo.debug("dojo.off._finishStartingUp");
		// this method is part of our _onLoad series of startup tasks
		
		if(this.enabled == true){
			// kick off a thread to check network status on
			// a regular basis
			this._startNetworkThread();

			// try to go online
			var self = this;
			this.goOnline(function(){
				// indicate we are ready to be used
				for(var i = 0; i < self._onLoadListeners.length; i++){
					self._onLoadListeners[i]();
				}
			});
		}else{ // we are disabled or a core operation failed
			dojo.debug("this.coreOperationFailed="+this.coreOperationFailed);
			if(this.coreOperationFailed == true){
				this.onCoreOperationFailed();
			}else{
				for(var i = 0; i < this._onLoadListeners.length; i++){
					this._onLoadListeners[i]();
				}
			}
		}
	},
	
	_onPageLoad: function(){
		//dojo.debug("dojo.off._onPageLoad");
		this._pageLoaded = true;
		
		if(this._pageLoaded == true
			&& this._storageLoaded == true
			&& this._initializeCalled == true){
			this._onLoad();		
		}
	},
	
	_onStorageLoad: function(){
		//dojo.debug("dojo.off._onStorageLoad");
		this._storageLoaded = true;
		
		// were we able to initialize storage? if
		// not, then this is a core operation, and
		// let's indicate we will need to fail fast
		if(dojo.storage.initialized == false){
			dojo.debug("failed initialization!");
			this.coreOperationFailed = true;
			this.enabled = false;
		}
		
		if(this._pageLoaded == true
			&& this._storageLoaded == true
			&& this._initializeCalled == true){
			this._onLoad();		
		}
	},
	
	_isSiteAvailable: function(finishedCallback){
		//dojo.debug("isSiteAvailable");
		// summary:
		//	Determines if our web application's website
		//	is available.
		// description:
		//	This method will asychronously determine if our
		//	web application's web site is available, which is
		//	a good proxy for network availability. The URL
		//	dojo.off.availabilityURL is used, which defaults
		//	to this site's domain name (ex: foobar.com). We
		//	check for dojo.off.AVAILABILITY_TIMEOUT (in seconds)
		//	and abort after that
		// finishedCallback: Function
		//	An optional callback function that will receive one argument:
		//	whether the site is available or not
		//	and is boolean. If this function is not present we call
		//	dojo.off.onOnline instead if we are able to go online.
		var self = this;
		var bindArgs = {
			url:	 dojo.off._getAvailabilityURL(),
			sync:		false,
			mimetype:	"text/plain",
			error:		function(type, errObj){
				//dojo.debug("_isSiteAvailable.error, type="+type+", errObj="+errObj.message);
				self.goingOnline = false;
				self.isOnline = false;
				if(finishedCallback){
					finishedCallback(false);
				}
			},
			load:		function(type, data, evt){
				//dojo.debug("_isSiteAvailable.load, type="+type+", data="+data+", evt="+evt);	
				self.goingOnline = false;
				self.isOnline = true;
				
				if(finishedCallback){
					finishedCallback(true);
				}else if(self.onOnline){
					self.onOnline();
				}
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
	},
	
	_startNetworkThread: function(){
		//dojo.debug("startNetworkThread");
		// kick off a thread that does periodic
		// checks on the status of the network
		if(this.doNetworkChecking == false){
			return;
		}
		
		window.setInterval(function(){
			var bindArgs = {
				url:	 dojo.off._getAvailabilityURL(),
				sync:		false,
				mimetype:	"text/plain",
				error:		function(type, errObj){
					//dojo.debug("dojo.off.networkThread.error, type="+type+", errObj="+errObj);
					if(dojo.off.isOnline == true){
						dojo.off.isOnline = false;
						dojo.off.onOffline();
					}
				},
				load:		function(type, data, evt){
					//dojo.debug("dojo.off.networkThread.load, type="+type+", data="+data+", evt="+evt);	
					if(dojo.off.isOnline == false){
						dojo.off.isOnline = true;
						dojo.off.onOnline();
					}
				}
			};
			
			// dispatch the request
			dojo.io.bind(bindArgs);
		}, this.NETWORK_CHECK * 1000);
	},
	
	_getAvailabilityURL: function(){
		var url = this.availabilityURL;
		
		// bust the browser's cache to make sure we are really talking to
		// the server
		if(url.indexOf("?") == -1){
			url += "?";
		}else{
			url += "&";
		}
		url += "browserbust=" + new Date().getTime();
		
		return url;
	},
	
	_onOfflineCacheInstalled: function(){
		if(this.onOfflineCacheInstalled){
			this.onOfflineCacheInstalled();
		}
	},
	
	_cacheDebugResources: function(){
		// if we are debugging, we must add all of the 
		// individual dojo.require() JS files to our offline
		// cache list so that this app will load while offline
		// even when we are debugging. we want to do this in 
		// such a way that we don't hard code them here.
		if(djConfig.isDebug == false){
			return;
		}
		
		// make sure the dojo bootstrap system is available offline
		dojo.off.files.cache(djConfig.baseRelativePath + "src/bootstrap1.js");
		dojo.off.files.cache(djConfig.baseRelativePath + "src/loader.js");
		// FIXME: make this more generic for non-browser host environments
		dojo.off.files.cache(djConfig.baseRelativePath + "src/hostenv_browser.js");
		
		// in src/loader.js, in the function 
		// dojo.hostenv.loadUri, we added code to capture
		// any uris that fwere loaded for dojo packages
		// with calls to dojo.require()
		// so we can add them to our list of captured
		// files here
		if(typeof dojo.hostenv.loadedUris != "undefined"
			&& dojo.hostenv.loadedUris.length > 0){
			dojo.off.files.cache(dojo.hostenv.loadedUris);
		}
	}
});


// wait until the storage system is finished loading
dojo.storage.manager.addOnLoad(dojo.lang.hitch(dojo.off, dojo.off._onStorageLoad));

// wait until the page is finished loading
dojo.event.connect(window, "onload", dojo.off, dojo.off._onPageLoad);