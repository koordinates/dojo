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
	
	// isSyncing: boolean
	//	Whether we are in the middle of a syncing
	//	session.
	isSyncing: false,
	
	synchronize: function(){
		// summary:
		//	Begin a synchronization session.
		
		if(this.isSyncing == true){
			return;
		}
	
		this.isSyncing = true;
		
		this.start();
	},
	
	start: function(){
		if(this.onStart){
			this.onStart();
		}
		
		this.refreshUI();
	},
	
	refreshUI: function(){
		if(this.onRefreshUI){
			this.onRefreshUI();
		}
		
		window.setTimeout(dojo.lang.hitch(this, this.upload), 2000);
	},
	
	upload: function(){
		if(this.onUpload){
			this.onUpload();
		}
		
		window.setTimeout(dojo.lang.hitch(this, this.download), 2000);
	},
	
	download: function(){
		if(this.onDownload){
			this.onDownload();
		}
		
		window.setTimeout(dojo.lang.hitch(this, this.finished), 2000);
	},
	
	finished: function(){
		this.successful = true;
		this.isSyncing = false;
		if(this.onFinished){
			this.onFinished();
		}
	}
});