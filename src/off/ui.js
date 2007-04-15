dojo.provide("dojo.off.ui");

dojo.require("dojo.html.common");
dojo.require("dojo.html.style");
dojo.require("dojo.event.common");
dojo.require("dojo.event.browser");
dojo.require("dojo.io.common");
dojo.require("dojo.io.BrowserIO");

// Author: Brad Neuberg, bkn3@columbia.edu, http://codinginparadise.org

// summary:
//	dojo.off.ui provides a standard,
//	default user-interface for a 
//	Dojo Offline Widget that can easily
//	be dropped into applications that would
//	like to work offline.
dojo.lang.mixin(dojo.off.ui, {
	// appName: String
	//	This application's name, such as "Foobar". Note that
	//	this is a string, not HTML, so embedded markup will
	//	not work, including entities. Only the following
	//	characters are allowed: numbers, letters, and spaces
	appName: "setme",
	
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
	//	src/off/ui-template/learnhow.html, relative to
	//	your Dojo installation. Make sure to set
	//	dojo.to.ui.customLearnHowPath to true if you want
	//	a custom Learn How page.
	learnHowPath: djConfig.baseRelativePath
					+ "src/off/ui-template/learnhow.html",
	
	// customLearnHowPath: boolean
	//	Whether the developer is using their own custom page
	//	for the Learn How instructional page; defaults to false.
	//	Use in conjunction with dojo.off.ui.learnHowPath.
	customLearnHowPath: false,
	
	htmlTemplatePath: djConfig.baseRelativePath + "src/off/ui-template/widget.html",
	cssTemplatePath: djConfig.baseRelativePath + "src/off/ui-template/widget.css",
	onlineImagePath: djConfig.baseRelativePath + "src/off/ui-template/greenball.png",
	offlineImagePath: djConfig.baseRelativePath + "src/off/ui-template/redball.png",
	rollerImagePath: djConfig.baseRelativePath + "src/off/ui-template/roller.gif",
	checkmarkImagePath: djConfig.baseRelativePath + "src/off/ui-template/checkmark.png",
	learnHowJSPath: djConfig.baseRelativePath + "src/off/ui-template/learnhow.js",
	
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
			this._setSyncMessage("Sync Successful");
			if(checkmark){
				checkmark.style.display = "inline";
			}
		}else if(dojo.sync.cancelled == true){
			this._setSyncMessage("Sync Cancelled");
			
			if(checkmark){
				checkmark.style.display = "none";
			}
		}else{
			this._setSyncMessage("Sync Error");
			
			var messages = dojo.byId("dot-sync-messages");
			if(messages){
				dojo.html.addClass(messages, "dot-sync-error");
			}
			
			if(checkmark){
				checkmark.style.display = "none";
			}
		}
		
		if(dojo.sync.details.length > 0 && details){
			details.style.display = "inline";
		}
	},
	
	onCancel: function(){
		// summary:
		//	Updates our UI as we attempt sync canceling
		this._setSyncMessage("Canceling Sync...");
	},
	
	onOnline: function(){
		// summary:
		//	Called when we go online.
		// description:
		//	When we go online, this method is called to update
		//	our UI. Default behavior is to update the Offline
		//	Widget UI and to attempt a synchronization.
		
		// update UI
		this._updateNetworkIndicator();
				
		// synchronize, but pause for a few seconds
		// so that the user can orient themselves -
		// 1 second
		if(dojo.sync.autoSync == true){
			window.setTimeout(dojo.lang.hitch(dojo.sync, dojo.sync.synchronize), 1000);
		}
	},
	
	onOffline: function(){
		// summary:
		//	Called when we go offline
		// description:
		//	When we go offline, this method is called to update
		//	our UI. Default behavior is to update the Offline
		//	Widget UI.
		
		// update UI
		this._updateNetworkIndicator();
		this._setSyncMessage("You are working offline");
		
		// clear old details
		var details = dojo.byId("dot-sync-details");
		if(details){
			details.style.display = "none";
		}
	},
	
	onSave: function(status, isCoreSave, dataStore, item){
		if(status == dojo.storage.FAILED
			&& isCoreSave == true){
			alert("Please increase the amount of local storage available "
					+ "to this application");
			this._showConfiguration();
			if(dojo.storage.hasSettingsUI()){
				dojo.storage.showSettingsUI();
			}		
			
			// FIXME: Be able to know if storage size has changed
			// due to user configuration
		}
	},
	
	onLoad: function(){
		// summary:
		//	A function that can be overridden that allows your
		//	application to know when Dojo Offline, the page, and
		//	the Offline Widget are all initialized and ready to be
		//	used.
	},
	
	onOfflineCacheInstalled: function(){
		dojo.debug("onOfflineCacheInstalled");
		// summary:
		//	A function that can be overridden that is called 
		//	when a user has installed the offline cache after
		//	the page has been loaded. If a user didn't have an offline cache
		//	when the page loaded, a UI of some kind might have prompted them
		//	to download one. This method is called if they have downloaded
		//	and installed an offline cache so a UI can reinitialize itself
		//	to begin using this offline cache.
		
		// clear out the 'needs offline cache' info
		this._hideNeedsOfflineCache();
		
		// check to see if we need a browser restart
		// to be able to use this web app offline --
		// some browsers can't see updates to a
		// Proxy AutoConfig (PAC) file done after the
		// browser has been loaded until a restart
		// has occurred
		if(dojo.off.requireOfflineCache == true
			&& dojo.off.hasOfflineCache == true
			&& dojo.off.browserRestart == true){
			this._needsBrowserRestart();
			return;
		}else{
			var browserRestart = dojo.byId("dot-widget-browser-restart");
			if(browserRestart){
				browserRestart.style.display = "none";
			}
		}
		
		// update our sync UI
		this._updateSyncUI();
		
		// register our event listeners for our main buttons
		this._initMainEvtHandlers();
		
		// if offline is disabled, disable everything
		this._setOfflineEnabled(dojo.off.enabled);
		
		// try to go online
		this._testNetwork();
	},

	_initialize: function(){
		//dojo.debug("dojo.off.ui._initialize");
		// make sure our app name is correct
		if(this._validateAppName(this.appName) == false){
			alert("You must set dojo.off.ui.appName; it can only contain "
					+ "letters, numbers, and spaces; right now it "
					+ "is incorrectly set to '" + dojo.off.ui.appName + "'");
			dojo.off.enabled = false;
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
		dojo.off.onOnline = dojo.lang.hitch(this, this.onOnline);
		dojo.off.onOffline = dojo.lang.hitch(this, this.onOffline);
		
		// cache our default UI resources
		dojo.off.files.cache([
							this.htmlTemplatePath,
							this.cssTemplatePath,
							this.onlineImagePath,
							this.offlineImagePath,
							this.rollerImagePath,
							this.checkmarkImagePath
							]);
		
		// embed the offline widget UI
		if(this.autoEmbed == true){
			this._doAutoEmbed();
		}
	},
	
	_doAutoEmbed: function(){
		// fetch our HTML for the offline widget
		var templatePath = this.htmlTemplatePath;
		var bindArgs = {
			url:	 templatePath,
			sync:		false,
			mimetype:	"text/html",
			error:		function(type, errObj){
				dojo.off.enabled = false;
				alert("Error loading the Dojo Offline Widget from "
						+ templatePath + ": " + errObj.message);
			},
			load:		dojo.lang.hitch(this, this._templateLoaded)	 
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
	},
	
	_templateLoaded: function(type, data, evt){
		// inline our HTML
		var container = dojo.byId(this.autoEmbedID);
		if(container){
			container.innerHTML = data;
		}
		
		// fill out our image paths
		this._initImages();
		
		// update our network indicator status ball
		this._updateNetworkIndicator();
		
		// update our 'Learn How' text
		this._initLearnHow();
		
		// check offline cache settings
		if(dojo.off.requireOfflineCache == true
			&& dojo.off.hasOfflineCache == false){
			this._showNeedsOfflineCache();
			return;
		}
		
		// check to see if we need a browser restart
		// to be able to use this web app offline --
		// some browsers can't see updates to a
		// Proxy AutoConfig (PAC) file done after the
		// browser has been loaded until a restart
		// has occurred
		if(dojo.off.requireOfflineCache == true
			&& dojo.off.hasOfflineCache == true
			&& dojo.off.browserRestart == true){
			this._needsBrowserRestart();
			return;
		}else{
			var browserRestart = dojo.byId("dot-widget-browser-restart");
			if(browserRestart){
				browserRestart.style.display = "none";
			}
		}
		
		// update our sync UI
		this._updateSyncUI();
		
		// register our event listeners for our main buttons
		this._initMainEvtHandlers();
		
		// if offline is disabled, disable everything
		this._setOfflineEnabled(dojo.off.enabled);
		
		// try to go online
		this._testNetwork();
	},
	
	_testNetwork: function(){
		var finishedCallback = dojo.lang.hitch(this, function(isOnline){
			// display our online/offline results
			this._goOnlineFinished(isOnline);
			
			// indicate that our default UI 
			// and Dojo Offline are now ready to
			// be used
			if(this.onLoad){
				this.onLoad();
			}
		});
		dojo.off.goOnline(finishedCallback);
	},
	
	_updateNetworkIndicator: function(){
		var onlineImg = dojo.byId("dot-widget-network-indicator-online");
		var offlineImg = dojo.byId("dot-widget-network-indicator-offline");
		var titleText = dojo.byId("dot-widget-title-text");
		
		if(onlineImg && offlineImg){
			if(dojo.off.isOnline == true){
				onlineImg.style.display = "inline";
				offlineImg.style.display = "none";
			}else{
				onlineImg.style.display = "none";
				offlineImg.style.display = "inline";
			}
		}
		
		if(titleText){
			if(dojo.off.isOnline == true){
				titleText.innerHTML = "Online";
			}else{
				titleText.innerHTML = "Offline";
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
			var dojoPath = djConfig.baseRelativePath;
			this.learnHowPath += "?appName=" + encodeURIComponent(this.appName)
									+ "&requireOfflineCache=" + dojo.off.requireOfflineCache
									+ "&hasOfflineCache=" + dojo.off.hasOfflineCache
									+ "&runLink=" + encodeURIComponent(this.runLink)
									+ "&runLinkText=" + encodeURIComponent(this.runLinkText)
									+ "&baseRelativePath=" + encodeURIComponent(dojoPath);
			
			// cache our Learn How JavaScript page and
			// the HTML version with full query parameters
			// so it is available offline without a cache miss					
			dojo.off.files.cache(this.learnHowJSPath);
			dojo.off.files.cache(this.learnHowPath);
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
		var roller = dojo.byId("dot-roller");
		var checkmark = dojo.byId("dot-success-checkmark");
		var syncMessages = dojo.byId("dot-sync-messages");
		var details = dojo.byId("dot-sync-details");
		var cancel = dojo.byId("dot-sync-cancel");
		
		if(dojo.sync.isSyncing == true){
			this._clearSyncMessage();
			
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
			
			if(cancel){
				cancel.style.display = "inline";
			}
		}else{		
			if(roller){
				roller.style.display = "none";
			}
			
			if(cancel){
				cancel.style.display = "none";
			}
		}
	},
	
	_setSyncMessage: function(message){
		var syncMessage = dojo.byId("dot-sync-messages");
		
		if(syncMessage){
			syncMessage.innerHTML = message;
		}
	},
	
	_clearSyncMessage: function(){
		this._setSyncMessage("");
	},
	
	_initImages: function(){	
		var onlineImg = dojo.byId("dot-widget-network-indicator-online");
		if(onlineImg){
			onlineImg.setAttribute("src", this.onlineImagePath);
		}
		
		var offlineImg = dojo.byId("dot-widget-network-indicator-offline");
		if(offlineImg){
			offlineImg.setAttribute("src", this.offlineImagePath);
		}
		
		var roller = dojo.byId("dot-roller");
		if(roller){
			roller.setAttribute("src", this.rollerImagePath);
		}
		
		var checkmark = dojo.byId("dot-success-checkmark");
		if(checkmark){
			checkmark.setAttribute("src", this.checkmarkImagePath);
		}
	},
	
	_showDetails: function(evt){
		// cancel the button's default behavior
		evt.preventDefault();
		evt.stopPropagation();
		
		if(dojo.sync.details.length == 0){
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
	
	_goOnlineFinished: function(isOnline){
		var roller = dojo.byId("dot-roller");
		if(roller){
			roller.style.display = "none";
		}
		
		if(isOnline){
			this._clearSyncMessage();
			this.onOnline();
		}else{
			this._setSyncMessage("Network not available");
			this.onOffline();
		}
	},
	
	_needsBrowserRestart: function(){
		var browserRestart = dojo.byId("dot-widget-browser-restart");
		if(browserRestart){
			dojo.html.addClass(browserRestart, "dot-needs-browser-restart");
		}
		
		var appName = dojo.byId("dot-widget-browser-restart-app-name");
		if(appName){
			appName.innerHTML = "";
			appName.appendChild(document.createTextNode(this.appName));
		}
		
		var status = dojo.byId("dot-sync-status");
		if(status){
			status.style.display = "none";
		}
	},
	
	_showNeedsOfflineCache: function(){
		var widgetContainer = dojo.byId("dot-widget-container");
		if(widgetContainer){
			dojo.html.addClass(widgetContainer, "dot-needs-offline-cache");
		}
	},
	
	_hideNeedsOfflineCache: function(){
		var widgetContainer = dojo.byId("dot-widget-container");
		if(widgetContainer){
			dojo.html.removeClass(widgetContainer, "dot-needs-offline-cache");
		}
	},
	
	_initMainEvtHandlers: function(){
		var detailsButton = dojo.byId("dot-sync-details-button");
		if(detailsButton){
			dojo.event.connect(detailsButton, "onclick", this, this._showDetails);
		}
		var cancelButton = dojo.byId("dot-sync-cancel-button");
		if(cancelButton){
			dojo.event.connect(cancelButton, "onclick", this, this._cancel);
		}
	},
	
	_setOfflineEnabled: function(enabled){
		var elems = new Array();
		elems.push(dojo.byId("dot-sync-status"));
		
		for(var i = 0; i < elems.length; i++){
			if(elems[i]){
				if(enabled){
					elems[i].style.visibility = "visible";
				}else{
					elems[i].style.visibility = "hidden";
				}
			}
		}
	}
});

// register ourselves to know when failed saves have 
// occurred
dojo.off.onSave = dojo.lang.hitch(dojo.off.ui, dojo.off.ui.onSave);

// register ourselves to know when an offline cached has
// been installed even after the page is finished loading
dojo.off.onOfflineCacheInstalled = 
				dojo.lang.hitch(dojo.off.ui, dojo.off.ui.onOfflineCacheInstalled);

// start our magic when the Dojo Offline framework is ready to go
dojo.off.addOnLoad(dojo.lang.hitch(dojo.off.ui, dojo.off.ui._initialize));