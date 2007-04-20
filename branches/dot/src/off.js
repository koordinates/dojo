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
	
	// pacTestURL: String
	//	The URL to use to check to see if our PAC file 
	//	(Proxy AutoConfig) has an entry for this web 
	//	application. If it doesn't, then we will end up
	//	retrieving the version off our web server. If it does,
	//	the PAC file will redirect it to the local proxy, which
	//	will return a different version.
	pacTestURL: djConfig.baseRelativePath + "src/off/pac_check.txt",
	
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
	
	// hasOfflineCache: boolean
	//  Determines if an offline cache is available or installed;
	//	an offline cache is a facility that can truely cache offline
	//	resources, such as JavaScript, HTML, etc. in such a way that
	//	they won't be removed from the cache inappropriately like
	//	a browser cache would. If this is false, and 
	//	dojo.off.requireOfflineCache is true, then an offline cache
	//	will be installed
	hasOfflineCache: null,
	
	// browserRestart: boolean
	//	If true, the browser must be restarted to register the
	//	existence of a new host added offline (from a call to
	//	addHostOffline); if false, then nothing is needed.
	browserRestart: false,
	
	_OFFLINE_CACHE_URL: "http://localhost:8123/polipo/offline?",
	
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
		
		// if we have a local proxy tell it our new network
		// status
		this._tellCacheNetworkStatus(false, this.onOffline);
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
		//	setting dojo.off.coreSaveFailed to 'true' and dojo.off.enabled to 'false'.
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
			dojo.off.coreSaveFailed = true;
			dojo.off.enabled = false;
			
			// FIXME: Stop the background network thread
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
	
	addOfflineHost: function(resultsCallback /* Function(successful) */){
		// summary:
		//	Makes the this web application's host name, such as 
		//  "sitepen.com", offline-enabled with a true offline cache.
		// description:
		//  If a true offline cache is available on this platform, this
		//  means this hosts resources are made truly available
		//  offline and will not disappear from the offline cache
		//  as it might from a browser cache. The host name this
		//  page was served from is the host that is used, such
		//  as "sitepen.com".
		// resultsCallback:
		//  A Function that will be called with the results of this
		//  add attempt; if it was successful, you will get true; if
		//  not, you will receive false
		if(this.requireOfflineCache == false){
			resultsCallback(true);
		}
		
		if(this.hasOfflineCache != true){
			resultsCallback(false);
		}
		
		this._talkToOfflineCache("addOfflineHost", resultsCallback);
	},
	
	removeOfflineHost: function(resultsCallback /* Function(successful) */){
		// summary:
		//	Removes this web application's host name, such as "sitepen.com",
		//  from being offline enabled.
		// description:
		//  If a true offline cache is available on this platform, this
		//  means this hosts resources are made truly available
		//  offline and will not disappear from the offline cache
		//  as it might from a browser cache. The host name this
		//  page was served from is the host that is used, such
		//  as "sitepen.com".
		// resultsCallback:
		//  A Function that will be called with the results of this
		//  remove attempt; if it was successful, you will get true; if
		//  not, you will receive false
		if(this.requireOfflineCache == false){
			resultsCallback(true);
		}
		
		if(this.hasOfflineCache != true){
			resultsCallback(false);
		}
		
		this._talkToOfflineCache("removeOfflineHost", resultsCallback);
	},
	
	isHostAvailableOffline: function(resultsHandler /* function(availableOffline) */){
		// summary:
		//	Checks to see if this host is already available
		//	in our offline list with a previous call to
		//	addHostOffline().
		// resultsHandler: function
		//	Results callback with the asynchronous results; must
		//	have one argument, which will be given a true or
		//	false result based on whether this host is available
		//	offline in our list of offline web apps
		this._talkToOfflineCache("isHostAvailableOffline", resultsHandler);
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
	
	_checkOfflineCacheAvailable: function(finishedCallback){
		var self = this;
		
		// is an true, offline cache running on this machine as a
		// local web proxy distributed with DOT?
		if(this.requireOfflineCache == false){
			self.hasOfflineCache = false;
			resultsCallback();
			return;
		}
		
		// give the local proxy 200 milliseconds to respond
		var timer = setTimeout(function(){
			self.hasOfflineCache = false;
			finishedCallback();
		}, 200);
		
		this._talkToOfflineCache("isRunning", function(results){
			self.hasOfflineCache = true;
			window.clearTimeout(timer);
			finishedCallback();
		});
	},
	
	_onLoad: function(){
		//dojo.debug("dojo.off._onLoad");
		// both local storage and the page are finished loading
		
		// make sure that resources needed by all of our underlying
		// Dojo Storage storage providers will be available
		// offline
		dojo.off.files.cache(dojo.storage.manager.getResourceList());
		
		// load framework data; when we are finished, continue
		// initializing ourselves
		this.load(dojo.lang.hitch(this, this._onFrameworkDataLoaded));
	},
	
	_onFrameworkDataLoaded: function(){
		// this method is part of our _onLoad series of startup tasks
		
		if(this.requireOfflineCache == false){
			this._finishStartingUp();
			return;
		}
		
		// see if we have an offline cache; when done, move
		// on to the rest of our startup tasks
		this._checkOfflineCacheAvailable(dojo.lang.hitch(this, this._onOfflineCacheChecked));
	},
	
	_onOfflineCacheChecked: function(){
		// this method is part of our _onLoad series of startup tasks
		
		// if we have an offline cache, see if we have been added to the 
		// list of available offline web apps yet
		if(this.hasOfflineCache == true){
			this.isHostAvailableOffline(dojo.lang.hitch(this, this._onHostAvailabilityChecked));
		}else{
			this._keepCheckingUntilInstalled();
		}
	},
	
	_keepCheckingUntilInstalled: function(){
		// this method is part of our _onLoad series of startup tasks
		
		// kick off a background interval that keeps
		// checking to see if an offline cache has been
		// installed since this page loaded
			
		
		var installInterval = window.setInterval(dojo.lang.hitch(this, function(){
			// see if we are available yet
			this._checkOfflineCacheAvailable(dojo.lang.hitch(this, function(){
				if(this.hasOfflineCache == true){
					window.clearTimeout(installInterval);
					this._onOfflineCacheInstalled();
				}
			}));
		}), 1000);
		
		// now continue starting up
		this._finishStartingUp();
	},
	
	_onHostAvailabilityChecked: function(availableOffline){
		// this method is part of our _onLoad series of startup tasks
		
		// if we are not available offline, try to add ourselves 
		// to the list of available offline web apps
		if(availableOffline == false){
			this.addOfflineHost(dojo.lang.hitch(this, this._onHostAdded));
		}else{
			// see if we are in the PAC file yet
			this._checkPAC(dojo.lang.hitch(this, this._finishStartingUp));
		}
	},
	
	_onHostAdded: function(){
		// this method is part of our _onLoad series of startup tasks
		
		// FIXME: We should deal with the situation where
		// the local proxy _couldnt_ add this host correctly
		
		// see if our PAC file (Proxy AutoConfig) has this web application
		// in its list yet -- it might not, if we just added it, which means
		// the browser won't see it until it is restarted
		this._checkPAC(dojo.lang.hitch(this, this._finishStartingUp));
	},
	
	_finishStartingUp: function(){
		// this method is part of our _onLoad series of startup tasks
		
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
	},
	
	_onPageLoad: function(){
		this._pageLoaded = true;
		
		if(this._pageLoaded == true
			&& this._storageLoaded == true
			&& this._initializeCalled == true){
			this._onLoad();		
		}
	},
	
	_onStorageLoad: function(){
		this._storageLoaded = true;
		
		if(this._pageLoaded == true
			&& this._storageLoaded == true
			&& this._initializeCalled == true){
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
				
				// if we have a local proxy tell it our new network
				// status
				self._tellCacheNetworkStatus(true, function(){
					if(finishedCallback){
						finishedCallback(true);
					}else if(self.onOnline){
						self.onOnline();
					}
				});
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
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
					//dojo.debug("dojo.off.networkThread.error, type="+type+", errObj="+errObj);
					if(dojo.off.isOnline == true){
						dojo.off.isOnline = false;
						// if we have a local proxy tell it our new network
						// status
						dojo.off._tellCacheNetworkStatus(false, 
										dojo.lang.hitch(dojo.off, dojo.off.onOffline));
					}
				},
				load:		function(type, data, evt){
					//dojo.debug("dojo.off.networkThread.load, type="+type+", data="+data+", evt="+evt);	
					if(dojo.off.isOnline == false){
						dojo.off.isOnline = true;
						// if we have a local proxy tell it our new network
						// status
						dojo.off._tellCacheNetworkStatus(true, 
										dojo.lang.hitch(dojo.off, dojo.off.onOnline));
					}
				}
			};
			
			// dispatch the request
			dojo.io.bind(bindArgs);
		}, this.NETWORK_CHECK * 1000);
	},
	
	_getAvailabilityURL: function(){
		var url = this.availabilityURL;
		// bust the proxy cache to make sure we are really talking to
		// the server
		if(url.indexOf("?") == -1){
			url += "?";
		}else{
			url += "&";
		}
		url += "proxybust=" + new Date().getTime();
		
		return url;
	},
	
	_tellCacheNetworkStatus: function(isOnline, finishedCallback){
		if(this.requireOfflineCache == false
			|| this.hasOfflineCache == false){
			if(finishedCallback){
				finishedCallback();
			}
			return;
		}
		
		var methodName;
		
		// tell our local proxy what our network status is
		if(isOnline == true){ /* we just went online */
			methodName = "goOnline";
		}else{ /* we just went offline */
			methodName = "goOffline";
		}
		
		this._talkToOfflineCache(methodName, function(method, results){
			if(finishedCallback){
				finishedCallback();
			}
		});
	},
	
	_talkToOfflineCache: function(methodName, resultsCallback){
		//dojo.debug("talkToOfflineCache, methodName="+methodName);
		// causes us to talk to our local proxy that is running on
		// localhost, communicating to it through it's API that
		// is exposed by us calling it through JSONP
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		var url = this._OFFLINE_CACHE_URL + methodName;
		script.setAttribute("src", url);
		window.offlineCacheCallback = function(name, results){
			if(name == "UnknownMethod"){
				dojo.raise("Programming error in dojo.off._talkToOfflineCache: " + name);
				return;
			}
			
			// avoid memory leaks on IE
			head = null;
			script = null;
			
			resultsCallback(results);
		}
		
		head.appendChild(script);
	},
	
	_checkPAC: function(resultsCallback){
		// The basic idea here is to see if the browser's
		// current PAC file (Proxy AutoConfig), which should
		// be set to a generated file created by the local 
		// Dojo Offline Proxy, has our web application in its
		// list of web apps yet. Browsers currently only refresh
		// their PAC file on browser startup, so if we have added
		// this web app during this browser session a browser
		// restart will be necessary for the browser to pick it up.
		// To detect this, we grab a file given by dojo.off.pacTestURL. If
		// our PAC file doesn't have our web app yet, then this file
		// will simply be a text file pulled off our web server 
		// containing the string "the web application is not in PAC file". 
		// If it is in our PAC file, the browser will end up talking to 
		// the local proxy instead of the web server, and the local 
		// proxy will return the magic string 
		// "the web application is inside the PAC file"
		
		var bindArgs = {
			url:	 dojo.off.pacTestURL 
								+ "?browserbust=" + new Date().getTime(),
			sync:		false,
			mimetype:	"text/plain",
			error:		function(type, errObj){
				//dojo.debug("_checkPac, type="+type+", errObj="+errObj);
				dojo.off.browserRestart = false;
				resultsCallback();
			},
			load:		function(type, data, evt){
				//dojo.debug("_checkPac, load, data="+data);
				if(data.indexOf("the web application is not in PAC file") != -1){
					dojo.off.browserRestart = true;
				}else{
					dojo.off.browserRestart = false;
				}
				resultsCallback();
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
	},
	
	_onOfflineCacheInstalled: function(){
		// try to add ourselves offline now
		this.addOfflineHost(dojo.lang.hitch(this, function(){
			// FIXME: We should deal with the situation where
			// the local proxy _couldnt_ add this host correctly
		
			// see if our PAC file (Proxy AutoConfig) has this web application
			// in its list yet -- it might not, if we just added it, which means
			// the browser won't see it until it is restarted
			this._checkPAC(dojo.lang.hitch(this, function(){
				// finally, call any listeners that were waiting to
				// know whether an offline cache has been installed
				// since the page loaded
				if(this.onOfflineCacheInstalled){
					this.onOfflineCacheInstalled();
				}
			}));
		}));
	}
});


// wait until the storage system is finished loading
dojo.storage.manager.addOnLoad(dojo.lang.hitch(dojo.off, dojo.off._onStorageLoad));

// wait until the page is finished loading
dojo.event.connect(window, "onload", dojo.off, dojo.off._onPageLoad);