dojo.provide("dojo.sync");

dojo.lang.mixin(dojo.sync, {
	// onStart: Function
	//	An event handler that will be called
	//	when syncing has started
	onStart: null,
	
	// onRefreshFiles: Function
	//	An event handler that will be called 
	//	when syncing starts refreshing our
	//	offline file cache
	onRefreshFiles: null,

	// onUpload: Function
	//	An event handler that will be called 
	//	when syncing starts uploading any
	//	local data changes we have on the client
	onUpload: null,
	
	// onDownload: Function
	//	An event handler that will be called 
	//	when syncing starts downloading new
	//	material from the server
	onDownload: null,
	
	// onFinished: Function
	//	An event handler that will be called 
	//	when syncing is finished; this will be
	//	called whether an error ocurred or not;
	//	check dojo.sync.successful and
	//	dojo.sync.error for sync details
	onFinished: null,
	
	// onCancel: Function
	//	Called when canceling has been initiated;
	//	canceling will be attempted, followed
	//	by a call to onFinished
	onCancel: null,
	
	// isSyncing: boolean
	//	Whether we are in the middle of a syncing
	//	session.
	isSyncing: false,
	
	// cancelled: boolean
	//	Whether we were cancelled during our last
	//	sync request or not. If we are cancelled, then
	//	successful will be false.
	cancelled: false,
	
	// successful: boolean
	//	Whether the last sync was successful or not.
	//	If false, an error occurred.
	successful: true,
	
	// details: String[]
	//	Details on the sync. If the sync was successful,
	//	this will carry any conflict or merging messages
	//	that might be available; if the sync was 
	//	unsuccessful, this will have an error message.
	//	For both of these, this should be an array of Strings,
	//	where each string carries details on the sync. 
	//	Example: 
	//	dojo.sync.details = ["The document 'foobar' had conflicts - yours one",
	//						"The document 'hello world' was automatically merged"];
	details: null,
	
	// lastSync: Date
	//	The last successful sync that was performed, null
	//	if none.
	lastSync: null,
	
	synchronize: function(){ /* void */
		// summary:
		//	Begin a synchronization session.
		
		if(this.isSyncing == true){
			return;
		}
	
		this.isSyncing = true;
		this.successful = false;
		this.details = null;
		this.cancelled = false;
		
		this.start();
	},
	
	cancel: function(){ /* void */
		// summary:
		//	Attempts to cancel this sync session
		
		if(this.isSyncing == false){
			return;
		}
		
		this.cancelled = true;
		
		if(this.onCancel){
			this.onCancel();
		}
	},
	
	start: function(){ /* void */
		if(this.cancelled == true){
			this.finished();
			return;
		}
		
		if(this.onStart){
			this.onStart();
		}
		
		this.refreshUI();
	},
	
	refreshUI: function(){ /* void */
		if(this.cancelled == true){
			this.finished();
			return;
		}
		
		if(this.onRefreshUI){
			this.onRefreshUI();
		}
		
		window.setTimeout(dojo.lang.hitch(this, this.upload), 2000);
	},
	
	upload: function(){ /* void */
		if(this.cancelled == true){
			this.finished();
			return;
		}
		
		if(this.onUpload){
			this.onUpload();
		}
		
		window.setTimeout(dojo.lang.hitch(this, this.download), 2000);
	},
	
	download: function(){ /* void */
		if(this.cancelled == true){
			this.finished();
			return;
		}
		
		if(this.onDownload){
			this.onDownload();
		}
		
		window.setTimeout(dojo.lang.hitch(this, this.finished), 2000);
	},
	
	finished: function(){ /* void */
		this.isSyncing = false;
		
		if(this.cancelled == false){
			this.successful = true;
			this.details = ["The document 'foobar' had conflicts - yours was chosen",
							"The document 'hello world' was automatically merged"];
			this.lastSync = new Date();
		}else{
			this.successful = false;
		}
		
		if(this.onFinished){
			this.onFinished();
		}
	},
	
	isRecommended: function(){ /* boolean */
		// summary:
		//	Whether syncing is recommended or not.
		// description:
		//	If the user has local data that has not been
		//	synced, then we return true.
		
		var modifiedItems = this.getNumModifiedItems();
		if(modifiedItems > 0){
			return true;
		}else{
			return false;
		}
	},
	
	getNumModifiedItems: function(){ /* int */
		// summary:
		//	Returns the number of local modified items
		// description:
		//	This method internally determines the number
		//	of items a user has locally modified, either
		//	through creation, deletion, or updates.	If thing
		//	has been modified
		
		// FIXME: Implement
		return 5;
	}
});