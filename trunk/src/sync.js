dojo.provide("dojo.sync");

// Author: Brad Neuberg, bkn3@columbia.edu, http://codinginparadise.org

// summary:
//	dojo.sync exposes syncing functionality
//	to offline applications
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
	//	local data changes we have on the client.
	//	Applications can either wait until we
	//	call log.onCommand for each of our command
	//	entries to do upload syncing, or could completely
	//	bypass the command log process and just do all
	//	uploading within this method, using the command
	//	log as its dataset for applications that have
	//	complex, custom upload syncing requirements. This
	//	method can also be used to update a UI on the sync
	//	progress.
	onUpload: null,
	
	// onDownload: Function
	//	An event handler that is called
	//	to download any new data that is needed into
	//	persistent storage. Applications are required to
	//	implement this themselves, storing the required data
	//	into persistent local storage using Dojo Storage. 
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
	
	// autoSync: boolean
	//	Whether we do automatically sync on page load
	//	or when we go online. If true we do, if false syncing
	//	must be manually initiated. Defaults to true.
	autoSync: true,
	
	// error: boolean
	//	Whether an error occurred during the syncing process.
	error: false,
	
	synchronize: function(){ /* void */
		// summary:
		//	Begin a synchronization session.
		if(this.isSyncing == true
			|| dojo.off.goingOnline == true
			|| dojo.off.isOnline == false){
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
		
		dojo.off.files.refresh(dojo.lang.hitch(this, function(error, errorMessage){
			if(error == true){
				this.error = true;
				this.successful = false;
				this.details = new Array();
				this.details.push(errorMessage);
				
				this.finished();
			}else{
				this.upload();	
			}
		}));
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
		
		if(this.cancelled == false && this.error == false){
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
	},
	
	save: function(){ /* void */
		// summary:
		//	Causes dojo.sync to save its configuration data
		//	into local storage.	You should not have to call this,
		//	as it is handle automatically by the Dojo Offline
		//	framework.
	},
	
	load: function(){ /* void */
		// summary:
		//	Causes dojo.sync to load its configuration data
		//	from local storage.	You should not have to call this,
		//	as it is handle automatically by the Dojo Offline
		//	framework.
	}
});

// summary:
//	A class that records actions taken by a user when they are
//	offline, suitable for replaying when the network reappears. 
// description:
//	The basic idea behind this method is to record user actions
//	that would normally have to contact a server into a command
//	log when we are offline, so that later when we are online
//	we can simply replay this log in the order user actions happened
//	so that they can be executed against the server, causing synchronization
//	to happen. When we replay, for each of the commands that were added,
//	we call a method named onCommand that applications should override and which
//	will be called over and over for each of our commands -- applications should
//	take the offline command information and use it to talk to a server to have
//	this command actually happen online, 'syncing' ourselves with the server. If
//	the command was "update" with the item that was updated, for example, we might
//	call some RESTian server API that exists for updating an item in our application.
//	The server could either then do sophisticated merging and conflict resolution on
//	the server side, for example, allowing you to pop up a custom merge UI, or could
//	do automatic merging or nothing of the sort. When you are finished with this
//	particular command, your application is then required to call continueReplay() on
//	the log object passed to onCommand() to continue replaying the log, or halt()
//	with the reason for halting to completely stop the syncing/replaying process.
dojo.sync.CommandLog = function(){
}

dojo.sync.CommandLog.prototype = {
	// commands: Array
	//	An array of our command entries, where each one is an
	//	object literal with a 'commandName' entry plus any custom arguments
	//	that were passed to add() when this command entry was added.
	commands: new Array(),
	
	// autoSave: boolean
	//	Whether we automatically save the command log after each call
	//	to add(); defaults to true. For applications that are rapidly
	//	adding many command log entries in a short period of time, 
	//	it can be useful to set this to false and simply call save() 
	//	yourself when you are ready to persist your command log -- 
	//	otherwise performance could be slow as the default action
	//	is to attempt to persist the command log constantly with
	//	calls to add().
	autoSave: true,
	
	replay: function(){ /* void */
		// summary:
		//	Replays all of the commands that have been
		//	cached in this command log when we go back online;
		//	onCommand will be called for each command we have	
	},
	
	onCommand: function(log /* dojo.sync.CommandLog */,
						commandName /* String */){ /* void */
		// summary:
		//	Called when we replay our log, for each of our command
		//	entries.
		// log: dojo.sync.CommandLog
		//	The command log that is processing this command.
		// commandName: String
		//	The command name, such as "create", "delete", "update", etc.
		// description:
		//	This callback should be overridden by applications so that
		//	they can sync themselves when we go back online. When we
		//	replay our command log, this callback is called for each
		//	of our command entries in the order they were added, with 
		//	'commandName' filled in for each command. Any custom parameters
		//	that were passed to add() for this command will also be passed
		//	in to onCommand, so that applications can use this information
		//	to do their syncing, such as contacting a server web-service
		//	to create a new item, for example. 
		// 
		//	Inside your overridden onCommand, you should either call
		//	log.halt(reason) if an error occurred and you would like to halt
		//	command replaying or log.continueReplay() to have the command log
		//	continue replaying its log and proceed to the next command; 
		//	the reason you must call these is the action you execute inside of 
		//	onCommand will probably be asynchronous, since it will be talking on 
		//	the network, and you should call one of these two methods based on 
		//	the result of your network call.
	},
	
	add: function(commandName /* String */){ /* void */
		// summary:
		//	Adds an action to our command log
		// description:
		//	This method will add an action to our
		//	command log, later to be replayed when we
		//	go from offline to online. You can pass
		//	an arbitrary number of custom parameters
		//	after 'commandName' that will be available
		//	when we replay this command when we go online.
		//
		//	Example usage:
		//	
		//	dojo.sync.log.add("create", "document",
		//					  {title: "Message", content: "Hello World"});
		//
		//	"create" is the name of this action; "documents" is the an
		//	optional argument passed in which is the type
		//	of item the command is operating on, such as documents, contacts,
		//	tasks, etc.; and the final argument is a custom object that is
		//	simply the result of this action. In this example, the final argument
		//	is the document that was created. We could have passed in any arbitrary
		//	number of parameters after 'commandName'; the ones given are just suggestions
		//	and will be passed to this CommandLogs onCommand function, which the 
		//	programmer can override, when we are replaying this log.
	},
	
	length: function(){ /* Number */
		// summary:
		//	Returns the length of this 
		//	command log
	},
	
	halt: function(reason /* Anything with a toString() method */){ /* void */
		// summary:
		//	Halts replaying this command log.
		// reason: Anything with a toString() method
		//	The reason we halted; this can be a string, an
		//	Exception, or anything with a toString() method actually.
		// description:
		//	This method is called as we are replaying a command
		//	log; it can be called from dojo.sync.log.onCommand, for
		// 	example, for an application to indicate an error occurred
		//	while replaying this command, halting further processing 
		//	of this command log. Note that any command log entries that
		//	were processed before have their effects retained (i.e. they
		//	are not rolled back), while the command entry that was halted
		//	stays in our list of commands to later be replayed.	
	},
	
	clear: function(){ /* void */
		// summary:
		//	Completely clears this command log of its entries
	},
	
	continueReplay: function(){ /* void */
		// summary:
		//	Indicates that we should continue processing out list
		//	of commands.
		// description:
		//	This method is called by applications that have overridden
		//	log.onCommand() to continue replaying our command log
		//	after the application has finished handling the current
		//	command.
	},
	
	save: function(){ /* void */
		// summary:
		//	Saves this command log to persistent, client-side storage
		// description:
		//	Persists our command log into reliable, local storage; you 
		//	should not normally ever have to call this method, since we
		//	automatically persist our command log after every call
		//	to add(). See 'autoSave' inside this class for details
		//	on how to override this behavior for custom applications.	
	},
	
	load: function(){ /* void */
		// summary:
		//	Loads our command log from reliable, persistent local storage;
		//	you should never have to do this since the Dojo Offline Framework
		//	takes care of doing this for you.
	},

	toString: function(){
		
	}
}