dojo.provide("dojo.dot.ui");

dojo.require("dojo.io.*");
dojo.require("dojo.event.*");


dojo.lang.mixin(dojo.dot.ui, {
	// autoEmbed: boolean
	//	Whether to automatically auto-embed the default Dojo Offline
	//	widget into this page; default is true. 
	autoEmbed: true,
	
	// autoEmbedID: String
	//	The ID of the DOM element that will contain our
	//	Dojo Offline widget; defaults to the ID 'dot-widget'.
	autoEmbedID: "dot-widget",
	
	// learnHowPath: String
	//	The path to a web page that has information on 
	//	how to use this web app offline; defaults to
	//	src/dot/ui-tempalte/learnhow.html, relative to
	//	your Dojo installation
	learnHowPath: djConfig.baseRelativePath
					+ "src/dot/ui-template/learnhow.html",
					
	// appName: String
	//	This applications name, such as "Foobar". Note that
	//	this is HTML, so you must correctly encode reserved
	//	characters. For example, if you wanted to use brackets
	//	around your appname, you would have "&lt;Foobar&gt;".
	//	HTML markup may also appear in here.
	appName: "Define dojo.dot.ui.appName",
	
	_htmlTemplatePath: "src/dot/ui-template/widget.html",
	_cssTemplatePath: "src/dot/ui-template/widget.css",
	_onlineImagePath: "src/dot/ui-template/greenball.png",
	_offlineImagePath: "src/dot/ui-template/redball.png",

	_onPageLoad: function(){
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
		
		learnHow.setAttribute("href", this.learnHowPath);
		
		var appName = dojo.byId("dot-widget-learn-how-app-name");
		
		if(appName == null || typeof appName == "undefined"){
			return;
		}
		
		appName.innerHTML = this.appName;
	}
});

dojo.event.connect(window, "onload", dojo.dot.ui, "_onPageLoad");