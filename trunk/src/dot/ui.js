dojo.provide("dojo.dot.ui");

dojo.require("dojo.io.*");
dojo.require("dojo.event.*");


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
	
	_htmlTemplatePath: "src/dot/ui-template/widget.html",
	_cssTemplatePath: "src/dot/ui-template/widget.css",
	_onlineImagePath: "src/dot/ui-template/greenball.png",
	_offlineImagePath: "src/dot/ui-template/redball.png",
	_rollerImagePath: "src/dot/ui-template/roller.gif",
	
	onStart: function(){
		// summary:
		//	Updates our UI when synchronization first starts.
		
		dojo.debug("sync started");
		this._updateSyncUI();
	},
	
	onRefreshUI: function(){
		// summary:
		//	Updates our UI when synchronization starts
		//	refreshing offline UI resources
		
		dojo.debug("onRefreshUI");
	},
	
	onUpload: function(){
		// summary:
		//	Updates our UI when synchronization starts
		//	uploading locally changed data
		
		dojo.debug("onUpload");
	},
	
	onDownload: function(){
		// summary:
		//	Updates our UI when synchronization starts
		//	download new server data
		
		dojo.debug("onDownload");
	},
	
	onFinished: function(){
		// summary:
		//	Updates our UI when synchronization
		//	is finished
		
		dojo.debug("onFinished");
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
		
		// setup our event listeners for sync events
		// to update our UI
		dojo.sync.onStart = dojo.lang.hitch(this, this.onStart);
		dojo.sync.onRefreshUI = dojo.lang.hitch(this, this.onRefreshUI);
		dojo.sync.onUpload = dojo.lang.hitch(this, this.onUpload);
		dojo.sync.onDownload = dojo.lang.hitch(this, this.onDownload);
		dojo.sync.onFinished = dojo.lang.hitch(this, this.onFinished);
		
		// embed the offline widget UI
		if(this.autoEmbed == true){
			this._doAutoEmbed();
		}
	},
	
	_doAutoEmbed: function(){
		// fetch our HTML for the offline widget
		var templatePath = djConfig.baseRelativePath + this._htmlTemplatePath;
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
		cssLink.setAttribute("href", djConfig.baseRelativePath + this._cssTemplatePath);
		head.appendChild(cssLink);
		
		// inline our HTML
		var container = dojo.byId(this.autoEmbedID);
		container.innerHTML = data;
		
		// update our network indicator status ball
		this._updateNetworkIndicator();
		
		// update our 'Learn How' text
		this._initLearnHow();
		
		// update our sync UI
		this._updateSyncUI();
		
		// register our event listeners for buttons
		var syncButton = dojo.byId("dot-sync-button");
		if(syncButton){
			dojo.event.connect(syncButton, "onclick", this, this._synchronize);
		}
	},
	
	_updateNetworkIndicator: function(){
		var img = dojo.byId("dot-widget-network-indicator-image");
		
		if(img == null || typeof img == "undefined"){
			return;
		}
		
		var src;
		if(dojo.dot.isOnline == true){
			src = djConfig.baseRelativePath + this._onlineImagePath;
		}else{
			src = djConfig.baseRelativePath + this._offlineImagePath;
		}

		img.setAttribute("src", src);
	},
	
	_initLearnHow: function(){
		var learnHow = dojo.byId("dot-widget-learn-how-link");
		
		if(learnHow == null || typeof learnHow == "undefined"){
			return;
		}
		
		if(this.customLearnHowPath == false){
			// add parameters to URL so the Learn How page
			// can customize itself and display itself
			// correctly
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
		
		if(dojo.sync.isSyncing == true){
			if(syncButtons){
				syncButtons.style.display = "none";
			}
			
			if(syncingButtons){
				syncingButtons.style.display = "block";
			}
			
			dojo.debug("roller="+roller);
			if(roller){
				var src = djConfig.baseRelativePath + this._rollerImagePath;
				dojo.debug("src="+src);
				roller.setAttribute("src", src);
				roller.style.visibility = "visible";
			}
		}else{
			if(syncButtons){
				syncButtons.style.display = "block";
			}
			
			if(syncingButtons){
				syncingButtons.style.display = "none";
			}
			
			if(roller){
				roller.style.visibility = "none";
			}
		}
	},
	
	_synchronize: function(evt){
		// cancel the button's default behavior
		evt.preventDefault();
		evt.stopPropagation();
		
		dojo.sync.synchronize();
	}
});

dojo.event.connect(window, "onload", dojo.dot.ui, dojo.dot.ui._onPageLoad);