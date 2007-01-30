dojo.provide("dojo.dot.ui");

dojo.require("dojo.io.*");
dojo.require("dojo.event.*");
dojo.require("dojo.html.*");

dojo.lang.mixin(dojo.dot.ui, {
	// appName: String
	//	This application's name, such as "Foobar". Note that
	//	this is a string, not HTML, so embedded markup will
	//	not work, including entities. Only the following
	//	characters are allowed: numbers, letters, and spaces
	appName: "Define dojo.dot.ui.appName",
	
	// autoEmbed: boolean
	//	Whether to automatically auto-embed the default Dojo Offline
	//	widget into this page; default is true. 
	autoEmbed: true,
	
	// autoEmbedID: String
	//	The ID of the DOM element that will contain our
	//	Dojo Offline widget; defaults to the ID 'dot-widget'.
	autoEmbedID: "dot-widget",
	
	// runLink: String
	//	The URL that should be navigated to to run this 
	//	application offline; this will be placed inside of a
	//	link that the user can drag to their desktop and double
	//	click. Note that this URL must exactly match the URL
	//	of the main page of our resource that is offline for
	//	it to be retrieved from the offline cache correctly.
	//	For example, if you have cached your main page as
	//	http://foobar.com/index.html, and you set this to
	//	http://www.foobar.com/index.html, the run link will
	//	not work. By default this value is automatically set to 
	//	the URL of this page, so it does not need to be set
	//	manually unless you have unusual needs.
	runLink: window.location.href,
	
	// runLinkTitle: String
	//	The text that will be inside of the link that a user
	//	can drag to their desktop to run this application offline.
	//	By default this is automatically set to "Run " plus your
	//	application's name.
	runLinkTitle: "Run Application",
	
	// learnHowPath: String
	//	The path to a web page that has information on 
	//	how to use this web app offline; defaults to
	//	src/dot/ui-template/learnhow.html, relative to
	//	your Dojo installation. Make sure to set
	//	dojo.to.ui.customLearnHowPath to true if you want
	//	a custom Learn How page.
	learnHowPath: djConfig.baseRelativePath
					+ "src/dot/ui-template/learnhow.html",
	
	// customLearnHowPath: boolean
	//	Whether the developer is using their own custom page
	//	for the Learn How instructional page; defaults to false.
	//	Use in conjunction with dojo.dot.ui.learnHowPath.
	customLearnHowPath: false,
	
	_htmlTemplatePath: djConfig.baseRelativePath + "src/dot/ui-template/widget.html",
	_cssTemplatePath: djConfig.baseRelativePath + "src/dot/ui-template/widget.css",
	_onlineImagePath: djConfig.baseRelativePath + "src/dot/ui-template/greenball.png",
	_offlineImagePath: djConfig.baseRelativePath + "src/dot/ui-template/redball.png",
	_rollerImagePath: djConfig.baseRelativePath + "src/dot/ui-template/roller.gif",
	_checkmarkImagePath: djConfig.baseRelativePath + "src/dot/ui-template/checkmark.png",
	
	onStart: function(){
		// summary:
		//	Updates our UI when synchronization first starts.
		
		this._updateSyncUI();
	},
	
	onRefreshUI: function(){
		// summary:
		//	Updates our UI when synchronization starts
		//	refreshing offline UI resources
		
		this._setSyncMessage("Downloading UI...");
	},
	
	onUpload: function(){
		// summary:
		//	Updates our UI when synchronization starts
		//	uploading locally changed data
		
		this._setSyncMessage("Uploading new data...");
	},
	
	onDownload: function(){
		// summary:
		//	Updates our UI when synchronization starts
		//	download new server data
		
		this._setSyncMessage("Downloading new data...");
	},
	
	onFinished: function(){
		// summary:
		//	Updates our UI when synchronization
		//	is finished
		this._updateSyncUI();
		
		var checkmark = dojo.byId("dot-success-checkmark");
		var details = dojo.byId("dot-sync-details");
		
		if(dojo.sync.successful == true){
			this._setSyncMessage("Successful");
			if(checkmark){
				checkmark.style.display = "inline";
			}
		}else if(dojo.sync.cancelled == true){
			this._setSyncMessage("Cancelled");
			
			if(checkmark){
				checkmark.style.display = "none";
			}
		}else{
			this._setSyncMessage("Error");
			
			var messages = dojo.byId("dot-sync-messages");
			if(messages){
				dojo.html.addClass(messages, "dot-sync-error");
			}
			
			if(checkmark){
				checkmark.style.display = "none";
			}
		}
		
		if(dojo.sync.details != null && details){
			details.style.display = "inline";
		}
		
		this._updateSyncMetadata();
	},
	
	onCancel: function(){
		// summary:
		//	Updates our UI as we attempt sync canceling
		this._setSyncMessage("Canceling...");
	},
	
	onOnline: function(){
		// summary:
		//	Called when we go online.
		// description:
		//	When we go online, this method is called to update
		//	our UI. Default behavior is to update the Offline
		//	Widget UI, re-enable any screen elements that were disabled
		//	when we went offline, and to attempt a synchronization.
		
		// update UI
		this._updateNetworkIndicator();
		this._updateMoreCommands();
		
		// renable our commands
		var offlineButton = dojo.byId("dot-work-offline-button");
		var onlineButton = dojo.byId("dot-work-online-button");
		var configureButton = dojo.byId("dot-configure-button");
		var syncButton = dojo.byId("dot-sync-button");
		
		if(offlineButton){
			dojo.html.removeClass(offlineButton, "dot-disabled");
		}
		
		if(onlineButton){
			dojo.html.removeClass(onlineButton, "dot-disabled");
		}
		
		if(configureButton){
			dojo.html.removeClass(configureButton, "dot-disabled");
		}
		
		if(syncButton){
			dojo.html.removeClass(syncButton, "dot-disabled");
		}
		
		// TODO: FIXME: Renable previously disabled elements
		
		// synchronize, but pause for a few seconds
		// so that the user can orient themselves -
		// 1 seconds
		window.setTimeout(dojo.lang.hitch(this, this._synchronize), 1000);
	},
	
	onOffline: function(){
		// summary:
		//	Called when we go offline
		// description:
		//	When we go offline, this method is called to update
		//	our UI. Default behavior is to update the Offline
		//	Widget UI, and to disable any screen elements that should be disabled
		//	when we go offline.
		
		// update UI
		this._updateNetworkIndicator();
		this._updateMoreCommands();
		
		// disable sync command
		var syncButton = dojo.byId("dot-sync-button");
		if(syncButton){
			dojo.html.addClass(syncButton, "dot-disabled");
		}
		
		// provide feedback
		this._setSyncMessage("You are now offline");
		var checkmark = dojo.byId("dot-success-checkmark");
		var details = dojo.byId("dot-sync-details");
		if(checkmark){
			checkmark.style.display = "inline";
		}
		if(details){
			details.style.display = "none";
		}
		
		// TODO: FIXME: Disable elements in this web app
	},

	_onPageLoad: function(){
		// make sure our app name is correct
		if(this._validateAppName(this.appName) == false){
			alert("You must set dojo.dot.ui.appName; it can only contain "
					+ "letters, numbers, and spaces; right now it "
					+ "is set to " + dojo.dot.ui.appName);
			dojo.dot.enabled = false;
			return;
		}
		
		// set our run link text to its default
		this.runLinkText = "Run " + this.appName;
		
		// setup our event listeners for Dojo Offline events
		// to update our UI
		dojo.sync.onStart = dojo.lang.hitch(this, this.onStart);
		dojo.sync.onRefreshUI = dojo.lang.hitch(this, this.onRefreshUI);
		dojo.sync.onUpload = dojo.lang.hitch(this, this.onUpload);
		dojo.sync.onDownload = dojo.lang.hitch(this, this.onDownload);
		dojo.sync.onFinished = dojo.lang.hitch(this, this.onFinished);
		dojo.sync.onCancel = dojo.lang.hitch(this, this.onCancel);
		dojo.dot.onOnline = dojo.lang.hitch(this, this.onOnline);
		dojo.dot.onOffline = dojo.lang.hitch(this, this.onOffline);
		
		// embed the offline widget UI
		if(this.autoEmbed == true){
			this._doAutoEmbed();
		}
	},
	
	_doAutoEmbed: function(){
		// fetch our HTML for the offline widget
		var templatePath = this._htmlTemplatePath;
		var bindArgs = {
			url:	 templatePath,
			sync:		false,
			mimetype:	"text/html",
			error:		function(type, errObj){
				dojo.dot.enabled = false;
				alert("Error loading the Dojo Offline Widget from "
						+ templatePath + ": " + errObj.message);
			},
			load:		dojo.lang.hitch(this, this._templateLoaded)	 
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
	},
	
	_templateLoaded: function(type, data, evt){
		// add our CSS
		var head = document.getElementsByTagName("head")[0];
		var cssLink = document.createElement("link");
		cssLink.setAttribute("rel", "stylesheet");
		cssLink.setAttribute("type", "text/css");
		cssLink.setAttribute("href", this._cssTemplatePath);
		head.appendChild(cssLink);
		
		// inline our HTML
		var container = dojo.byId(this.autoEmbedID);
		container.innerHTML = data;
		
		// fill out our image paths
		this._initImages();
		
		// update our network indicator status ball
		this._updateNetworkIndicator();
		
		// update our 'Learn How' text
		this._initLearnHow();
		
		// update our sync UI
		this._updateSyncUI();
		
		// update our sync metadata
		this._updateSyncMetadata();
		
		// register our event listeners for buttons
		var syncButton = dojo.byId("dot-sync-button");
		if(syncButton){
			dojo.event.connect(syncButton, "onclick", this, this._synchronize);
		}
		
		var detailsButton = dojo.byId("dot-sync-details-button");
		if(detailsButton){
			dojo.event.connect(detailsButton, "onclick", this, this._showDetails);
		}
		
		var cancelButton = dojo.byId("dot-sync-cancel-button");
		if(cancelButton){
			dojo.event.connect(cancelButton, "onclick", this, this._cancel);
		}
		
		var onlineButton = dojo.byId("dot-work-online-button");
		if(onlineButton){
			dojo.event.connect(onlineButton, "onclick", this, this._workOnline);
		}
		
		var offlineButton = dojo.byId("dot-work-offline-button");
		if(offlineButton){
			dojo.event.connect(offlineButton, "onclick", this, this._workOffline);
		}
	},
	
	_updateNetworkIndicator: function(){
		var onlineImg = dojo.byId("dot-widget-network-indicator-online");
		var offlineImg = dojo.byId("dot-widget-network-indicator-offline");
		
		if(onlineImg && offlineImg){
			if(dojo.dot.isOnline == true){
				onlineImg.style.display = "inline";
				offlineImg.style.display = "none";
			}else{
				onlineImg.style.display = "none";
				offlineImg.style.display = "inline";
			}
		}
	},
	
	_initLearnHow: function(){
		var learnHow = dojo.byId("dot-widget-learn-how-link");
		
		if(learnHow == null || typeof learnHow == "undefined"){
			return;
		}
		
		if(this.customLearnHowPath == false){
			// add parameters to URL so the Learn How page
			// can customize itself and display itself
			// correctly based on framework settings
			this.learnHowPath += "?appName=" + encodeURIComponent(this.appName)
									+ "&requireDurableCache=" + dojo.dot.requireDurableCache
									+ "&hasDurableCache=" + dojo.dot.hasDurableCache()
									+ "&runLink=" + encodeURIComponent(this.runLink)
									+ "&runLinkText=" + encodeURIComponent(this.runLinkText);
		}
		
		learnHow.setAttribute("href", this.learnHowPath);
		
		var appName = dojo.byId("dot-widget-learn-how-app-name");
		
		if(appName == null || typeof appName == "undefined"){
			return;
		}
		
		appName.innerHTML = "";
		appName.appendChild(document.createTextNode(this.appName));
	},
	
	_validateAppName: function(appName){
		if(appName == null || typeof appName == "undefined"){
			return false;
		}
		
		return (/^[a-z0-9 ]*$/i.test(appName));
	},
	
	_updateSyncUI: function(){
		var syncButtons = dojo.byId("dot-sync-buttons");
		var syncingButtons = dojo.byId("dot-syncing-buttons");
		var roller = dojo.byId("dot-roller");
		var checkmark = dojo.byId("dot-success-checkmark");
		var syncMessages = dojo.byId("dot-sync-messages");
		var details = dojo.byId("dot-sync-details");
		var recommended = dojo.byId("dot-recommended");
		var lastSync = dojo.byId("dot-last-sync");
		var numItems = dojo.byId("dot-num-modified-items");
		
		if(dojo.sync.isSyncing == true){
			this._setSyncMessage("");
			
			if(syncButtons){
				syncButtons.style.display = "none";
			}
			
			if(syncingButtons){
				syncingButtons.style.display = "block";
			}
			
			if(roller){
				roller.style.display = "inline";
			}
			
			if(checkmark){
				checkmark.style.display = "none";
			}
			
			if(syncMessages){
				dojo.html.removeClass(syncMessages, "dot-sync-error");
			}
			
			if(details){
				details.style.display = "none";
			}
			
			if(lastSync){
				lastSync.innerHTML = "";
			}
			
			if(numItems){
				numItems.innerHTML = "";
			}
		}else{
			if(syncButtons){
				syncButtons.style.display = "block";
			}
			
			if(syncingButtons){
				syncingButtons.style.display = "none";
			}
			
			if(roller){
				roller.style.display = "none";
			}
			
			if(recommended){
				if(dojo.sync.isRecommended()){
					recommended.style.display = "inline";
				}else{
					recommended.style.display = "none";
				}
			}
		}
		
		// update further commands present
		// at the bottom of the widget; these
		// change based on the status of syncing
		this._updateMoreCommands();
	},
	
	_synchronize: function(evt){
		// cancel the button's default behavior
		if(evt){
			evt.preventDefault();
			evt.stopPropagation();
		}
		
		// cause the clicked link to lose focus, so
		// that when we are finished it won't be 
		// annoyingly selected by the user
		if(evt){
			var syncButton = dojo.byId("dot-sync-button");
			if(syncButton && syncButton.blur){
				syncButton.blur();
			}
		}
		
		dojo.sync.synchronize();
	},
	
	_setSyncMessage: function(message){
		var syncMessage = dojo.byId("dot-sync-messages");
		
		if(syncMessage){
			syncMessage.innerHTML = message;
		}
	},
	
	_initImages: function(){	
		var onlineImg = dojo.byId("dot-widget-network-indicator-online");
		if(onlineImg){
			onlineImg.setAttribute("src", this._onlineImagePath);
		}
		
		var offlineImg = dojo.byId("dot-widget-network-indicator-offline");
		if(offlineImg){
			offlineImg.setAttribute("src", this._offlineImagePath);
		}
		
		var roller = dojo.byId("dot-roller");
		if(roller){
			roller.setAttribute("src", this._rollerImagePath);
		}
		
		var checkmark = dojo.byId("dot-success-checkmark");
		if(checkmark){
			checkmark.setAttribute("src", this._checkmarkImagePath);
		}
	},
	
	_showDetails: function(evt){
		// cancel the button's default behavior
		evt.preventDefault();
		evt.stopPropagation();
		
		if(dojo.sync.details == null){
			return;
		}
		
		// determine our HTML message to display
		var html = "";
		html += "<html><head><title>Sync Details</title><head><body>";
		html += "<h1>Sync Details</h1>\n";
		html += "<ul>\n";
		for(var i = 0; i < dojo.sync.details.length; i++){
			html += "<li>";
			html += dojo.sync.details[i];
			html += "</li>";	
		}
		html += "</ul>\n";
		html += "<a href='javascript:window.close()' "
				 + "style='text-align: right; padding-right: 2em;'>"
				 + "Close Window"
				 + "</a>\n";
		html += "</body></html>";
		
		// open a popup window with this message
		var windowParams = "height=400,width=600,resizable=true,"
							+ "scrollbars=true,toolbar=no,menubar=no,"
							+ "location=no,directories=no,dependent=yes";

		var popup = window.open("", "SyncDetails", windowParams);
		
		if(popup == null || typeof popup == "undefined"){ // aggressive popup blocker
			alert("Please allow popup windows for this domain; can't display sync details window");
			return;
		}
		
		popup.document.open();
		popup.document.write(html);
		popup.document.close();
		
		// put the focus on the popup window
		if(popup.focus){
			popup.focus();
		}
	},
	
	_cancel: function(evt){
		// cancel the button's default behavior
		evt.preventDefault();
		evt.stopPropagation();
		
		dojo.sync.cancel();
	},
	
	_updateSyncMetadata: function(){
		var lastSyncField = dojo.byId("dot-last-sync");
		var numItemsField = dojo.byId("dot-num-modified-items");
		
		if(lastSyncField){
			if(dojo.sync.lastSync != null){
				lastSyncField.style.display = "block";
				
				var dateStr = this._getDateString(dojo.sync.lastSync);
				lastSyncField.innerHTML = "Updated " + dateStr;
			}else{
				lastSyncField.style.display = "none";
			}
		}	
		
		if(numItemsField){
			var numItems = dojo.sync.getNumModifiedItems();
			if(numItems > 0){
				numItemsField.style.display = "block";
				numItemsField.innerHTML = numItems 
											+ " modified offline items"; 
			}else{
				numItemsField.style.display = "none";
			}
		}
	},
	
	_getDateString: function(date){
		var now = new Date();
		var str;
		
		// today?
		if(now.getFullYear() == date.getFullYear()
			&& now.getMonth() == date.getMonth()
			&& now.getDay() == date.getDay()){
			str = "Today at " + this._getTimeString(date);					
		}else{
			str = date.toLocaleString();
		}
		
		return str;
	},
	
	_getTimeString: function(date){
		var hour = date.getHours();
		var amPM;
		
		if(hour < 12){
			amPM = "AM";
		}else if(hour >= 12 && hour < 24){
			amPM = "PM";
			hour = hour - 12;
		}else if(hour == 24){
			amPM = "AM";
			hour = hour - 12;
		}
		
		var minutes = date.getMinutes();
		if(minutes < 10){
			minutes = "0" + minutes;
		}
		
		return hour + ":" + minutes + " " + amPM;	
	},
	
	_updateMoreCommands: function(){
		var offlineButton = dojo.byId("dot-work-offline-button");
		var onlineButton = dojo.byId("dot-work-online-button");
		var configureButton = dojo.byId("dot-configure-button");
		
		if(dojo.dot.isOnline == true){
			if(offlineButton){
				offlineButton.style.display = "inline";
			}
			
			if(onlineButton){
				onlineButton.style.display = "none";
			}
		}else{
			if(offlineButton){
				offlineButton.style.display = "none";
			}
			
			if(onlineButton){
				onlineButton.style.display = "inline";
			}
		}
		
		if(dojo.sync.isSyncing == true){
			if(offlineButton){
				dojo.html.addClass(offlineButton, "dot-disabled");
			}
			
			if(onlineButton){
				dojo.html.addClass(onlineButton, "dot-disabled");
			}
			
			if(configureButton){
				dojo.html.addClass(configureButton, "dot-disabled");
			}
		}else{
			if(offlineButton){
				dojo.html.removeClass(offlineButton, "dot-disabled");
			}
			
			if(onlineButton){
				dojo.html.removeClass(onlineButton, "dot-disabled");
			}
			
			if(configureButton){
				dojo.html.removeClass(configureButton, "dot-disabled");
			}
		}
	},
	
	_workOnline: function(evt){
		// cancel the button's default behavior
		evt.preventDefault();
		evt.stopPropagation();
		
		if(dojo.sync.isSyncing == true){
			return;
		}
		
		// give the user status feedback
		var checkmark = dojo.byId("dot-success-checkmark");
		var roller = dojo.byId("dot-roller");
		var details = dojo.byId("dot-sync-details");
		this._setSyncMessage("Going online... "
							+ dojo.dot.goOnlineTimeout);
		if(checkmark){
			checkmark.style.display = "none";
		}
		if(roller){
			roller.style.display = "inline";
		}
		if(details){
			details.style.display = "none";
		}
		
		// disable our commands
		var offlineButton = dojo.byId("dot-work-offline-button");
		var onlineButton = dojo.byId("dot-work-online-button");
		var configureButton = dojo.byId("dot-configure-button");
		var syncButton = dojo.byId("dot-sync-button");
		
		if(offlineButton){
			dojo.html.addClass(offlineButton, "dot-disabled");
		}
		
		if(onlineButton){
			dojo.html.addClass(onlineButton, "dot-disabled");
		}
		
		if(configureButton){
			dojo.html.addClass(configureButton, "dot-disabled");
		}
		
		if(syncButton){
			dojo.html.addClass(syncButton, "dot-disabled");
		}
		
		// FIXME: TODO: Add CANCEL link
		
		// try to go online
		dojo.dot.goOnline(dojo.lang.hitch(this, this._goOnlineFinished),
						dojo.lang.hitch(this, this._goOnlineProgress));
	},
	
	_goOnlineFinished: function(isOnline, manuallyCancelled){
		var roller = dojo.byId("dot-roller");
		if(roller){
			roller.style.display = "none";
		}
		
		if(manuallyCancelled == true){
			this._setSyncMessage("Cancelled");
			return;
		}
		
		if(isOnline){
			this._setSyncMessage("You are now online");
			var checkmark = dojo.byId("dot-success-checkmark");
			if(checkmark){
				checkmark.style.display = "inline";
			}
			
			this.onOnline();
		}else{
			this._setSyncMessage("Network not available");
			this.onOffline();
		}
	},
	
	_goOnlineProgress: function(timer){
		var secondsLeft = dojo.dot.goOnlineTimeout - timer;
		this._setSyncMessage("Going online... "
							+ secondsLeft);
	},
	
	_workOffline: function(evt){
		// cancel the button's default behavior
		evt.preventDefault();
		evt.stopPropagation();
		
		if(dojo.sync.isSyncing == true){
			return;
		}
		
		dojo.dot.goOffline();
	}
});

dojo.event.connect(window, "onload", dojo.dot.ui, dojo.dot.ui._onPageLoad);