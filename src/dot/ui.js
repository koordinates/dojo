dojo.provide("dojo.dot.ui");

dojo.require("dojo.io.*");
dojo.require("dojo.event.*");


dojo.dot.ui = {
	// autoEmbed: boolean
	//	Whether to automatically auto-embed the default Dojo Offline
	//	widget into this page; default is true. 
	autoEmbed: true,
	
	// autoEmbedID: String
	//	The ID of the DOM element that will contain our
	//	Dojo Offline widget; defaults to the ID 'dot-widget'.
	autoEmbedID: "dot-widget",
	
	_htmlTemplatePath: "src/dot/ui-template/widget.html",
	_cssTemplatePath: "src/dot/ui-template/widget.css",

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
						+ templatePath + ": " + errObj);
			},
			load:		dojo.lang.hitch(this, this._templateLoaded)	 
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
	},
	
	_templateLoaded: function(type, data, evt){
		// inline our HTML
		var container = dojo.byId(this.autoEmbedID);
		container.innerHTML = data;
	}
};

dojo.event.connect(window, "onload", dojo.dot.ui, "_onPageLoad");