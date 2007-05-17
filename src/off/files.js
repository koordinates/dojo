dojo.provide("dojo.off.files");

// Author: Brad Neuberg, bkn3@columbia.edu, http://codinginparadise.org

// summary:
//	Helps maintain resources that should be
//	available offline, such as CSS files.
// description:
//	dojo.off.files makes it easy to indicate
//	what resources should be available offline,
//	such as CSS files, JavaScript, HTML, etc.
dojo.off.files = {
	listOfURLs: new Array(),
	
	_refreshCounter: 0,
	_error: false,
	_errorMessages: new Array(),
	_finishedCallback: null,
	
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
		//	dojo.off.files.refresh() causes an XHR request to 
		//	be called on each of our URLs that we indicated we want
		//	to cache with calls to dojo.off.files.cache(). These
		//	XHR requests will either cause the browser or offline
		//	cache to actually talk to the server and get fresh versions
		//	of these files, or will cause the browser/offline cache
		//	to simply return it's native, cached version. This is
		//	dependent on the HTTP/1.1 caching headers applied to these
		//	files.
		// finishedCallback: Function
		//	A callback that receives two arguments: whether an error
		//	occurred, which is a boolean; and an array of error message strings
		//	with details on errors encountered. If no error occured then message is
		//	empty array with length 0.
		
		// shoot off an XHR request for each file
		dojo.off.files._refreshCounter = 0;
		dojo.off.files._error = false;
		dojo.off.files._errorMessages = new Array();
		dojo.off.files._finishedCallback = finishedCallback;
		for(var i = 0; i < this.listOfURLs.length; i++){
			var url = this.listOfURLs[i];
			
			// Add 'browserbust' to the end to break the browser cache
			// and force this file to be reloaded through the local proxy
			if(dojo.off.requireOfflineCache == true){
				if(url.indexOf("?") == -1){
					url += "?";
				}else{
					url += "&";
				}
				
				url += "browserbust=" + new Date().getTime();
			}
			
			// Firefox can't handle many XHR requests done quickly; do
			// them on a slight timeout so Firefox doesn't get confused
			window.setTimeout("dojo.off.files._loadFile(\"" + url + "\")", 10);
		}	
	},
	
	_loadFile: function(url){
		var xhr = dojo.hostenv.getXmlhttpObject();
		xhr.url = url;
		
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && dojo.off.files._error != true){ /* Loaded */
				if(xhr.status == 200){
					// FIXME: As an aid to programmers, check the caching headers
					// returned and make sure they have correct values if
					// requireOfflineCache = false
				}else{
					// remove the browserbust string
					var url = xhr.url;
					if(url.indexOf("browserbust=") != -1){
						url = url.replace(/browserbust\=[0-9]*/, "");
						if(url.charAt(url.length - 1) == "?"){
							url = url.replace(/\?$/, "");
						}
					}
					
					// log our error
					dojo.off.files._error = true;
					var msg = "Error loading offline resource " + url + ": "
									+ xhr.statusText;
					dojo.off.files._errorMessages.push(msg); 
									
				}
				
				// see if we are finished with all of
				// the files
				dojo.off.files._refreshCounter++;
				if(dojo.off.files._refreshCounter == dojo.off.files.listOfURLs.length
					|| dojo.off.files._error == true){
					dojo.off.files._finishedCallback(dojo.off.files._error,
													dojo.off.files._errorMessages);
				}
			}
		};
		xhr.open("GET", url, true);
		xhr.send(null);
	}

	// FIXME: This code is left here for reference;
	// remove it when we don't need it anymore since
	// we don't need to load/save dojo.off.files info
	/*
	save: function(){ 
		try{
			dojo.storage.put(this._STORAGE_KEY, 
							 this.listOfURLs, 
							 function(status){
							 	dojo.off.standardSaveHandler(status, true);	
							 });
		}catch(exp){
			dojo.off.standardSaveHandler(dojo.storage.FAILED, true);
		}
	},
	
	load: function(){ 
		var list = dojo.storage.get(this._STORAGE_KEY);
		if(list != null){
			this.listOfURLs = list;
		}
	}*/
}