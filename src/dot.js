dojo.provide("dojo.dot");

dojo.lang.mixin(dojo.dot, {
	// isOnline: boolean
	//	true if we are online, false if not
	isOnline: true,
	
	// requireDurableCache: boolean
	//	A durable cache is a cache that can correctly and
	//	truely cache the UI resources of an application for
	//	offline use, such as its HTML, JavaScript, etc. A
	//	durable cache won't remove these files from it's
	//	offline cache, for example. No browser's currently
	//	support native durable cache's; FireFox 3 has plans
	//	for one. If true, then we require a durable cache,
	//	and must either install one or have one natively
	//	supported by this browser; if false, then we will
	//	rely on the browser's ordinary cache, which can be
	//	made to work but is not always reliable. Defaults to
	//	true.
	requireDurableCache: true,
	
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
	
	_goOnlineCancelled: false,
	
	hasDurableCache: function(){ /* boolean */
		// summary: 
		//	Returns whether we have a durable cache available
		// description:
		//	Determines if a durable cache is available or installed;
		//	a durable cache is a facility that can truely cache offline
		//	resource, such as JavaScript, HTML, etc. in such a way that
		//	they won't be removed from the cache inappropriately like
		//	a browser cache would. If this is false, and 
		//	dojo.dot.requireDurableCache is true, then a durable cache
		//	will be installed
	
		// FIXME: Implement
		return true;
	},
	
	cancel: function(){
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
	
	onOnline: function(){
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
	
	onOffline: function(){
		// summary:
		//	Called when we go offline.
		// description: 
		//	This method is called when we
		//	move offline.
	},
	
	goOffline: function(){ /* void */
		// summary:
		//	Manually goes offline, away from the network.
		dojo.debug("goOffline");
		dojo.debug("isSyncing="+dojo.sync.isSyncing);
		dojo.debug("goingOnline="+this.goingOnline);
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
	
	_isSiteAvailable: function(finishedCallback, progressCallback){ /* void */
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
	}
});