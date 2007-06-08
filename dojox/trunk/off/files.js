dojo.provide("dojox.off.files");

// Author: Brad Neuberg, bkn3@columbia.edu, http://codinginparadise.org

// summary:
//	Helps maintain resources that should be
//	available offline, such as CSS files.
// description:
//	dojox.off.files makes it easy to indicate
//	what resources should be available offline,
//	such as CSS files, JavaScript, HTML, etc.
dojox.off.files = {
	listOfURLs: [],
	
	// refreshing: boolean
	//	Whether we are currently in the middle
	//	of refreshing our list of offline files.
	refreshing: false,

	_cancelID: null,
	
	_error: false,
	_errorMessages: [],
	_finishedCallback: null,
	_currentFileIndex: 0,
	_store: null,
	
	cache: function(urlOrList){ /* void */
		// summary:
		//	Caches a file or list of files to be available offline. This can
		//	either be a full URL, such as http://foobar.com/index.html,
		//	or a relative URL, such as ../index.html. This URL
		//	is not actually cached until dojo.sync.synchronize() is called.
		// urlOrList: String or Array[]
		//	A URL of a file to cache or an
		//	Array of Strings of files to cache
		if(dojo.isString(urlOrList)){
			this.listOfURLs.push(urlOrList);
		}else{
			this.listOfURLs = this.listOfURLs.concat(urlOrList);
		}
	},
	
	remove: function(url){ /* void */
		// summary:
		//		Removes a URL from the list of files to cache.
		// description:
		//		Removes a URL from the list of URLs to cache. Note that this
		//		does not actually remove the file from the offline cache;
		//		instead, it just prevents us from refreshing this file at a
		//		later time, so that it will naturally time out and be removed
		//		from the offline cache
		// url: String
		//		The URL to remove
		for(var i = 0; i < this.listOfURLs.length; i++){
			if(this.listOfURLs[i] == url){
				this.listOfURLs = this.listOfURLs.splice(i, 1);
				break;
			}
		}
	},
	
	isAvailable: function(url){ /* boolean */
		// summary:
		//		Determines whether the given resource is available offline.
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
		//dojo.debug("dojox.off.files.refresh");
		// summary:
		//	Refreshes our list of offline resources,
		//	making them available offline.
		// finishedCallback: Function
		//	A callback that receives two arguments: whether an error
		//	occurred, which is a boolean; and an array of error message strings
		//	with details on errors encountered. If no error occured then message is
		//	empty array with length 0.
		try{
			this.refreshing = true;
		
			// get our local server
			var localServer = google.gears.factory.create("beta.localserver", "1.0");
			var storeName = dojox.off.STORAGE_NAMESPACE + "_store";
		
			// refresh everything by simply removing
			// any older stores
			// FIXME: Explore whether this is truly needed -
			// workaround for versioning without using
			// Gears ManagedResourceStore
			localServer.removeStore(storeName);
		
			// open/create the resource store
			localServer.openStore(storeName);
			var store = localServer.createStore(storeName);
			this._store = store;
		
			// add our list of files to capture
			var self = this;
			this._currentFileIndex = 0;
			this._cancelID = store.capture(this.listOfURLs, function(url, success, captureId){
				//dojo.debug("store.capture, url="+url+", success="+success);
				if(success == false){
					self._cancelID = null;
					self.refreshing = false;
					var errorMsgs = [];
					errorMsgs.push("Unable to capture: " + url);
					finishedCallback(true, errorMsgs);
					return;
				}else{
					self._currentFileIndex++;
				}
			
				if(self._currentFileIndex >= self.listOfURLs.length){
					self._cancelID = null;
					self.refreshing = false;
					finishedCallback(false, []);
				}
			});
		}catch(e){
			this.refreshing = false;
	
			if(typeof e.message != "undefined"){
				e = e.message;
			}
			
			// can't refresh files -- core operation --
			// fail fast
			dojox.off.coreOperationFailed = true;
			dojox.off.enabled = false;
			dojox.off.onCoreOperationFailed();
		}
	},
	
	abortRefresh: function(){
		if(this.refreshing == false){
			return;
		}
		
		this._store.abortCapture(this._cancelID);
		this.refreshing = false;
	}
}
