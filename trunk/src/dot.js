dojo.provide("dojo.dot");

dojo.lang.mixin(dojo.dot, {
	// enabled: boolean
	//	Whether offline ability is enabled or not. Defaults to true.
	enabled: true,

	// isOnline: boolean
	//	true if we are online, false if not
	isOnline: true,
	
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
	//	The URL to check for site availability; defaults to
	//	this web application's domain name (ex: http://foobar.com:8080).
	availabilityURL: window.location.protocol + "://"
						+ window.location.host + ":"
						+ window.location.port,
	
	// goOnlineTimeout: int
	//	The time in seconds to check for site availability
	//	when going online before aborting attempt.
	goOnlineTimeout: 30,
	
	// goingOnline: boolean
	//	True if we are attempting to go online, false otherwise
	goingOnline: false,
	
	// coreSaveFailed: boolean
	//	A flag set by the Dojo Offline framework that indicates
	//	that saving a piece of important core data failed. This
	//	flag causes a 'fail fast' condition, turning off offline
	//	ability.
	coreSaveFailed: false,
	
	_onLoadListeners: new Array(),
	_goOnlineCancelled: false,
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
		//	dojo.dot.requireOfflineCache is true, then an offline cache
		//	will be installed
	
		// FIXME: Implement
		return false;
	},
	
	cancel: function(){ /* void */
		// summary:
		//	Cancels an attempt to go online.
		// description:
		//	If dojo.dot.goOnline() was called,
		//	this method will manually cancel trying
		//	to go online. Note this method is not
		//	implemented yet.
		
		// FIXME: TODO: Implement cancelling
		// going on to the network
		
		if(dojo.dot.isSyncing == true 
			|| this.goingOnline == false){
			return;		
		}
		
		
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
		this._goOnlineCancelled = false;
		this.isOnline = false;
		
		if(this.onOffline){
			this.onOffline();
		}
	},
	
	goOnline: function(finishedCallback, progressCallback){ /* void */
		// summary:
		//	Attempts to go online.
		// description:
		//	Attempts to go online, making sure this web
		//	application's web site is available. 'callback'
		//	is called asychronously with the result of whether
		//	we were able to go online or not.
		// finishedCallback: Function
		//	An optional callback function that will receive two arguments;
		//	the first is whether the site is available
		//	and we are able to go online; the second is whether the request
		//	was manually cancelled by a call to 
		//	dojo.dot.cancel() and is boolean
		//	(true - manually cancelled; false - not 
		//	manually cancelled)
		// progressCallback: Function
		//	An optional Function callback that will be called
		//	for each second of time that we are waiting for an
		//	online availability check to finish. This function will have
		//	one value, 'timer', which starts at 1 and is incremented
		//	for each second of time that we are waiting for the network
		//	to finish. This function is appropriate for providing
		//	a ticking feedback message UI while a user is waiting,
		//	for example.
		
		if(dojo.sync.isSyncing == true){
			return;
		}
		
		this.goingOnline = true;
		this._goOnlineCancelled = false;
		this.isOnline = false;
		
		// see if can reach our web application's web site
		this._isSiteAvailable(finishedCallback, progressCallback);
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
	
	onSave: function(status, isCoreSave, dataStore, item){
		// summary:
		//	A standard function that can be registered which is
		//	called when some piece of data is saved locally.
		// description:
		//	Applications can override this method to be notified
		//	when offline data is attempting to be saved. This can
		//	be used to provide UI feedback while saving, and for
		//	providing appropriate error feedback if saving fails
		//	due to a user not allowing the save to occur.
		// status: dojo.storage.SUCCESS, dojo.storage.PENDING, dojo.storage.FAILED
		//	Whether the save succeeded, whether it is pending based on a UI dialog
		//	asking the user for permission, or whether it failed.
		// isCoreSave: boolean
		//	If true, then this save was for a core piece of data necessary for
		//	the functioning of Dojo Offline. If false, then it is a piece of
		//	normal data being saved for offline access. Dojo Offline will
		//	'fail fast' if some core piece of data could not be saved, automatically
		//	setting dojo.dot.coreSaveFailed to 'true' and dojo.dot.enabled to 'false'.
		// dataStore: dojo.dot.DataStore
		//	The Dojo Offline DataStore we are trying to save
		// item: dojo.dot.Item
		//	The Item we are trying to save
	},
	
	_onLoad: function(){
		// both local storage and the page are finished loading
		
		// make sure that resources needed by our underlying
		// Dojo Storage storage provider will be available
		// offline
		dojo.dot.files.cache(dojo.storage.getResourceList());
		
		// load framework data
		this.load();
		
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
	
	_isSiteAvailable: function(finishedCallback, progressCallback){
		// summary:
		//	Determines if our web application's website
		//	is available.
		// description:
		//	This method will asychronously determine if our
		//	web application's web site is available, which is
		//	a good proxy for network availability. The URL
		//	dojo.dot.availabilityURL is used, which defaults
		//	to this site's domain name (ex: foobar.com). We
		//	check for dojo.dot.availabilityTimeout (in seconds)
		//	and abort after that
		// finishedCallback: Function
		//	An optional callback function that will receive two arguments;
		//	the first is whether the site is available or not
		//	and is boolean; the second is whether the request
		//	was manually cancelled by a call to 
		//	dojo.dot.cancel() and is boolean
		//	(true - manually cancelled; false - not 
		//	manually cancelled). If this method is present,
		//	we do not call dojo.dot.onOnline.
		// progressCallback: Function
		//	An optional Function callback that will be called
		//	for each second of time that we are waiting for an
		//	availability check to finish. This function will have
		//	one value, 'timer', which starts at 1 and is incremented
		//	for each second of time that we are waiting for the network
		//	to finish. This function is appropriate for providing
		//	a ticking feedback message UI while a user is waiting,
		//	for example.
		
		// create a timer to count progress and check
		// for cancellation
		var timeSoFar = 0;
		var siteFound = false;
		dojo.dot._availabilityCancelled = false;
		var availTimer = window.setInterval(function(){
			timeSoFar++;
			
			// provide feedback
			if(progressCallback){
				progressCallback(timeSoFar);	
			}
			
			// did we find the site?
			if(siteFound == true){
				window.clearInterval(availTimer);
				dojo.dot.isOnline = true;
				dojo.dot.goingOnline = false;
				if(finishedCallback){
					// callback(siteAvailable, manualCancelled)
					finishedCallback(true, false);
				}
				return;
			}
			
			// are we past our timeout?
			if(timeSoFar >= (dojo.dot.availabilityTimeout * 1000)){
				window.clearInterval(availTimer);
				dojo.dot.isOnline = false;
				dojo.dot.goingOnline = false;
				if(finishedCallback){
					// callback(siteAvailable, manualCancelled)
					finishedCallback(false, false);
				}
				return;
			}
			
			// manual cancellation?
			if(dojo.dot._goOnlineCancelled == true){
				window.clearInterval(availTimer);
				dojo.dot.isOnline = false;
				dojo.dot.goingOnline = false;
				if(finishedCallback){
					// callback(siteAvailable, manualCancelled)
					finishedCallback(false, true);
				}
				return;
			}
			
			// FIXME: Remove when actually implemented
			if(timeSoFar >= 3){
				window.clearInterval(availTimer);
				dojo.dot.isOnline = true;
				dojo.dot.goingOnline = false;
				if(finishedCallback){
					// callback(siteAvailable, manualCancelled)
					finishedCallback(true, false);
				}
				return;
			}
		}, 1000);
		
		// FIXME: Actually kick off the network thread
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
	}
});

// summary:
//	Helps maintain resources that should be
//	available offline, such as CSS files.
// description:
//	dojo.dot.files makes it easy to indicate
//	what resources should be available offline,
//	such as CSS files, JavaScript, HTML, etc.
dojo.dot.files = {
	listOfURLs: new Array(),
	
	cache: function(urlOrList){ /* void */
		// summary:
		//	Caches a file or list of files to be
		//	available offline. This can either
		//	be a full URL, such as 
		//	http://foobar.com/index.html,
		//	or a relative URL, such as 
		//	../index.html. This URL
		//	is not actually cached until 
		//	dojo.sync.synchronize() is
		//	called.
		// urlOrList: String or Array[]
		//	A URL of a file to cache or an
		//	Array of Strings of files to cache
		if(dojo.lang.isString(urlOrList)){
			var url = urlOrList;
			this.listOfURLs.push(url);
		}else{
			var listOfURLs = urlOrList;
			
			for(var i = 0; i < listOfURLs.length; i++){
				this.listOfURLs.push(listOfURLs[i]);	
			}	
		}
	},
	
	remove: function(url){ /* void */
		// summary:
		//	Removes a URL from the list
		//	of files to cache.
		// description:
		//	Removes a URL from the list of
		//	URLs to cache. Note that this does
		//	not actually remove the file from
		//	the offline cache; instead, it just
		//	prevents us from refreshing this file
		//	at a later time, so that it will
		//	naturally time out and be removed from
		//	the offline cache
		// url: String
		//	The URL to remove
		for(var i = 0; i < this.listOfURLs.length; i++){
			if(this.listOfURLs[i] == url){
				this.listOfURLs = this.listOfURLs.splice(i, 1);
				break;
			}
		}
	},
	
	isAvailable: function(url){ /* boolean */
		// summary:
		//	Determines whether the given resource
		//	is available offline.
		// url: String
		//	The URL to check
		for(var i = 0; i < this.listOfURLs.length; i++){
			if(this.listOfURLs[i] == url){
				return true;
			}
		}
		
		return false;
	},
	
	refresh: function(finishedCallback){ /* void */
		// summary:
		//	Refreshes our list of offline resources,
		//	making them available offline.
		// description:
		//	dojo.dot.files.refresh() causes an XHR request to 
		//	be called on each of our URLs that we indicated we want
		//	to cache with calls to dojo.dot.files.cache(). These
		//	XHR requests will either cause the browser or offline
		//	cache to actually talk to the server and get fresh versions
		//	of these files, or will cause the browser/offline cache
		//	to simply return it's native, cached version. This is
		//	dependent on the HTTP/1.1 caching headers applied to these
		//	files.
		// finishedCallback: Function
		//	A callback that receives two arguments: whether an error
		//	occurred, which is a boolean; and a message concerning this
		//	error. If no error occured then message is null.
		
		// shoot off an XHR request for each file
		var refreshCounter = 0;
		var error = false;
		var errorMessage = null;
		for(var i = 0; i < this.listOfURLs.length; i++){
			var url = this.listOfURLs[i];
			var bindArgs = {
				url:	 url,
				sync:		false,
				error:		function(type, errObj){
					// log our error
					error = true;
					errorMessage = "Error loading offline resource " + this.url + ": "
									+ errObj.message;
					
					// see if we are finished
					refreshCounter++;
					if(refreshCounter == dojo.dot.files.listOfURLs.length){
						if(finishedCallback){
							finishedCallback(error, errorMessage);	
						}
					}
				},
				load:		function(type, data, evt){
					// FIXME: As an aid to programmers, check the caching headers
					// returned and make sure they have correct values if
					// requireOfflineCache = false
					
					// see if we are finished
					refreshCounter++;
					if(refreshCounter == dojo.dot.files.listOfURLs.length){
						if(finishedCallback){
							finishedCallback(error, errorMessage);	
						}
					}
				}
			};
		
			// dispatch the request
			dojo.io.bind(bindArgs);
		}
	}

	// FIXME: This code is left here for reference;
	// remove it when we don't need it anymore since
	// we don't need to load/save dojo.dot.files info
	/*
	save: function(){ 
		try{
			dojo.storage.put(this._STORAGE_KEY, 
							 this.listOfURLs, 
							 function(status){
							 	dojo.dot.standardSaveHandler(status, true);	
							 });
		}catch(exp){
			dojo.dot.standardSaveHandler(dojo.storage.FAILED, true);
		}
	},
	
	load: function(){ 
		var list = dojo.storage.get(this._STORAGE_KEY);
		if(list != null){
			this.listOfURLs = list;
		}
	}*/
}

// wait until the storage system is finished loading
dojo.storage.manager.addOnLoad(dojo.lang.hitch(dojo.dot, dojo.dot._onStorageLoad));

// wait until the page is finished loading
dojo.event.connect(dojo, "loaded", dojo.dot, dojo.dot._onPageLoad);