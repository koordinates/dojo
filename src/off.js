dojo.provide("dojo.off");

dojo.require("dojo.io.*");
dojo.require("dojo.event.*");

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
	
	// enabled: boolean
	//	Whether offline ability is enabled or not. Defaults to true.
	enabled: true,

	// isOnline: boolean
	//	true if we are online, false if not
	isOnline: false,
	
	// requireOfflineCache: boolean
	//	An offline cache is a cache that can correctly and
	//	truely cache the UI resources of an application for
	//	offline use, such as its HTML, JavaScript, etc. An
	//	offline cache won't remove these files, for example. 
	//	No browser's currently
	//	support native offline cache's; FireFox 3 has plans
	//	for one. If true, then we require an offline cache,
	//	and must either install one or have one natively
	//	supported by this browser; if false, then we will
	//	rely on the browser's ordinary cache, which can be
	//	made to work but is not always reliable. Defaults to
	//	true.
	requireOfflineCache: true,
	
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
	
	// coreSaveFailed: boolean
	//	A flag set by the Dojo Offline framework that indicates
	//	that saving a piece of important core data failed. This
	//	flag causes a 'fail fast' condition, turning off offline
	//	ability.
	coreSaveFailed: false,
	
	// doNetworkChecking: boolean
	//	Whether to have a timing interval in the background doing
	//	automatic network checks at regular intervals; the length
	//	of time between checks is controlled by 
	//	dojo.off.NETWORK_CHECK. Defaults to true.
	doNetworkChecking: true,
	
	_onLoadListeners: new Array(),
	_storageLoaded: false,
	_pageLoaded: false,
	
	hasOfflineCache: function(){ /* boolean */
		// summary: 
		//	Returns whether we have an offline cache available
		// description:
		//	Determines if an offline cache is available or installed;
		//	an offline cache is a facility that can truely cache offline
		//	resources, such as JavaScript, HTML, etc. in such a way that
		//	they won't be removed from the cache inappropriately like
		//	a browser cache would. If this is false, and 
		//	dojo.off.requireOfflineCache is true, then an offline cache
		//	will be installed
	
		// FIXME: Implement
		return false;
	},
	
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
		
		if(this.onOffline){
			this.onOffline();
		}
	},
	
	goOnline: function(finishedCallback){ /* void */
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
	
	clear: function(){ /* void */
		// summary:
		//	Clears out local data
		// description:
		//	This method will clear application-level data
		//	stored on the client; it will leave data that
		//	is important for Dojo Offline's functioning
		//	alone.
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
	
	load: function(){ /* void */
		// summary:
		//	Causes the Dojo Offline framework to load its configuration data
		//	from local storage
	},
	
	onSave: function(isCoreSave, status, namespace, key, value){
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
		//	setting dojo.off.coreSaveFailed to 'true' and dojo.off.enabled to 'false'.
		// status: dojo.storage.SUCCESS, dojo.storage.PENDING, dojo.storage.FAILED
		//	Whether the save succeeded, whether it is pending based on a UI dialog
		//	asking the user for permission, or whether it failed.
		// namespace: String
		//	The Dojo Storage namespace we are saving this key/value pair
		//	into, such as "default", "Documents", "Contacts", etc.
		// key: String
		//	The key that we are attempting to persist
		// value: Object
		//	The object we are trying to persist
	},
	
	_onLoad: function(){
		// both local storage and the page are finished loading
		
		// make sure that resources needed by our underlying
		// Dojo Storage storage provider will be available
		// offline
		dojo.off.files.cache(dojo.storage.getResourceList());
		
		// load framework data
		this.load();
		
		// kick off a thread to check network status on
		// a regular basis
		this._startNetworkThread();
		
		// indicate we are ready to be used
		for(var i = 0; i < this._onLoadListeners.length; i++){
			this._onLoadListeners[i]();
		}
	},
	
	_onPageLoad: function(){
		this._pageLoaded = true;
		
		if(this._pageLoaded == true
			&& this._storageLoaded == true){
			this._onLoad();		
		}
	},
	
	_onStorageLoad: function(){
		this._storageLoaded = true;
		
		if(this._pageLoaded == true
			&& this._storageLoaded == true){
			this._onLoad();		
		}
	},
	
	_isSiteAvailable: function(finishedCallback){
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
		
		var bindArgs = {
			url:	 dojo.off._getAvailabilityURL(),
			sync:		false,
			mimetype:	"text/plain",
			error:		function(type, errObj){
				//dojo.debug("error, type="+type+", errObj="+errObj);
				dojo.off.goingOnline = false;
				dojo.off.isOnline = false;
				if(finishedCallback){
					finishedCallback(false);
				}
			},
			load:		function(type, data, evt){
				//dojo.debug("load, type="+type+", data="+data+", evt="+evt);	
				dojo.off.goingOnline = false;
				dojo.off.isOnline = true;
				if(finishedCallback){
					finishedCallback(true);
				}else if(dojo.off.onOnline){
					dojo.off.onOnline();
				}
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
	},
	
	standardSaveHandler: function(status, isCoreSave, dataStore, item){
		// summary:
		//	Called by portions of the Dojo Offline framework
		//	as a standard way to handle local save's; this method
		//	is 'package private' and should not be used outside
		//	of the Dojo Offline package.
		if(status == dojo.storage.FAILED
			&& isCoreSave == true){
			this.coreSaveFailed = true;
			this.enabled = false;	
		}
		
		if(this.onSave){
			onSave(status, isCoreSave, dataStore, item);
		}
	},
	
	_startNetworkThread: function(){
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
					//dojo.debug("error, type="+type+", errObj="+errObj);
					if(dojo.off.isOnline == true){
						dojo.off.isOnline = false;
						dojo.off.onOffline();
					}
				},
				load:		function(type, data, evt){
					//dojo.debug("load, type="+type+", data="+data+", evt="+evt);	
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
		// cache bust to make sure we are really talking to
		// the server
		if(url.indexOf("?") == -1){
			url += "?";
		}else{
			url += "&";
		}
		url += new Date().getTime();
		
		return url;
	}
});


// wait until the storage system is finished loading
dojo.storage.manager.addOnLoad(dojo.lang.hitch(dojo.off, dojo.off._onStorageLoad));

// wait until the page is finished loading
dojo.event.connect(window, "onload", dojo.off, dojo.off._onPageLoad);