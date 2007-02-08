dojo.require("dojo.dom");
dojo.require("dojo.event.*");
dojo.require("dojo.io.*");
dojo.require("dojo.html.*");
dojo.require("dojo.lfx.*");
dojo.require("dojo.widget.Editor");
dojo.require("dojo.storage.*");
dojo.require("dojo.dot.*");
dojo.require("dojo.sync");

// configure how we should work offline

// set our application name
dojo.dot.ui.appName = "Moxie";

// we aren't going to need a real offline cache for now;
// we will just have our server return good HTTP/1.1
// caching headers and rely on the browser's native cache
dojo.dot.requireOfflineCache = false;

// add our list resources we need offline
// Moxie resources
dojo.dot.files.cache([
					"editor.html",
					"editor.js",
					"about.html"
					]);

// Dojo resources
dojo.dot.files.cache([
					djConfig.baseRelativePath + "dojo.js"
					]);
					
// The Dojo Editor Widget's resources
dojo.dot.files.cache([
					djConfig.baseRelativePath + "src/widget/templates/Toolbar.css",
					djConfig.baseRelativePath + "src/widget/templates/images/tab_close.gif",
					djConfig.baseRelativePath + "src/widget/templates/richtextframe.html",
					djConfig.baseRelativePath + "src/widget/templates/images/toolbar-bg.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/bold.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/italic.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/underline.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/strikethrough.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/sep.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/justifyleft.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/justifycenter.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/justifyright.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/forecolor.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/hilitecolor.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/insertorderedlist.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/insertunorderedlist.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/outdent.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/indent.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/createlink.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/insertimage.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/inserthorizontalrule.gif"
					]);

var Moxie = {
	_initialized: false,
	_availableKeys: null,

	initialize: function(){
		if(this._initialized == true){
			return;
		}
		
		//dojo.debug("Moxie.initialize");
		
		// clear out old values
		dojo.byId("storageKey").value = "";
		dojo.byId("storageValue").value = "";
		
		// initialize our event handlers
		var directory = dojo.byId("directory");
		dojo.event.connect(directory, "onchange", this, this.directoryChange);
		dojo.event.connect(dojo.byId("saveButton"), "onclick", this, this.save);
		
		// load and write out our available keys
		this._loadAvailableKeys(dojo.lang.hitch(this, this._printAvailableKeys));
		
		this._initialized = true;
	},
	
	directoryChange: function(evt){
		var key = evt.target.value;
		
		// add this value into the form
		var keyNameField = dojo.byId("storageKey");
		keyNameField.value = key;
		
		// if blank key ignore
		if(key == ""){
			return;
		}
		
		this._handleLoad(key);		
	},
	
	save: function(evt){
		// cancel the button's default behavior
		evt.preventDefault();
		evt.stopPropagation();
		
		// get the new values
		var key = dojo.byId("storageKey").value;
		var richTextControl = dojo.widget.byId("storageValue");
		// workaround for bug in Editor
		// FIXME: Find the real root reason for this inside the Editor
		// component and submit patch back to Dojo
		var value;
		if(typeof richTextControl.contentFilters == "undefined"
			|| typeof richTextControl._richText.contentFilters == "undefined"){
			value = richTextControl._richText.getEditorContent();
		}else{
			value = richTextControl.getEditorContent();
		}
		
		if(key == null || typeof key == "undefined" || key == ""){
			alert("Please enter a file name");
			return;
		}
		
		if(value == null || typeof value == "undefined" || value == ""){
			alert("Please enter file contents");
			return;
		}
		
		// do the save
		this._save(key, value)
	},
	
	_save: function(key, value){
		this._printStatus("Saving '" + key + "'...");
		var self = this;
		var bindArgs = {
			url:	 "/moxie/" + encodeURIComponent(key),
			sync:		false,
			method:		"POST",
			content:		{"content": value},
			error:		function(type, errObj, http){
				//dojo.debug("error, type="+type+", errObj="+errObj);
				alert("Unable to save file " + key + ": " + errObj.message);
			},
			load:		function(type, data, evt){
				//dojo.debug("load, type="+type+", data="+data+", evt="+evt);	
				self._printStatus("Saved '" + key + "'");
				
				// add to our list of available keys
				self._availableKeys.push(key);
				
				// update the list of available keys
				self._printAvailableKeys();
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);	
	},
	
	_loadAvailableKeys: function(callback){
		var self = this;
		var bindArgs = {
			url:	 "/moxie/*",
			sync:		false,
			mimetype:	"text/javascript",
			headers:		{ "Accept" : "text/javascript" },
			error:		function(type, errObj){
				//dojo.debug("error, type="+type+", errObj="+errObj);
				alert("Unable to load our list of available keys; "
						+ "Moxie now requires a server component "
						+ "to illustrate true offline usage and "
						+ "server synchronization -- see "
						+ "demos/storage/server for details");
			},
			load:		function(type, data, evt){
				//dojo.debug("load, type="+type+", data="+data+", evt="+evt);	
				self._availableKeys = data;
				callback();
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);	
	},
	
	_printAvailableKeys: function(){
		var directory = dojo.byId("directory");
		
		// clear out any old keys
		directory.innerHTML = "";
		
		// add a blank selection
		var optionNode = document.createElement("option");
		optionNode.appendChild(document.createTextNode(""));
		optionNode.value = "";
		directory.appendChild(optionNode);
		
		// add new ones
		for (var i = 0; i < this._availableKeys.length; i++) {
			var optionNode = document.createElement("option");
			optionNode.appendChild(document.createTextNode(this._availableKeys[i]));
			optionNode.value = this._availableKeys[i];
			directory.appendChild(optionNode);
		}
	},
	
	_handleLoad: function(key){
		this._printStatus("Loading '" + key + "'...");
		
		// get the value from the server
		var self = this;
		// FIXME: I'm sure Dojo can do this internal cache busting itself
		var url = "/moxie/" + encodeURIComponent(key) 
					+ "?cachebust=" + new Date().getTime(); 
		var bindArgs = {
			url:	 url,
			sync:		false,
			mimetype:	"text/html",
			error:		function(type, errObj){
				//dojo.debug("error, type="+type+", errObj="+errObj);
				alert("The file " + key + " is not available: "
						+ errObj.message);
			},
			load:		function(type, data, evt){
				//dojo.debug("load, type="+type+", data="+data+", evt="+evt);	
				// FIXME: The following code is for Editor2
				/*
				
				// set the new Editor widget value
				var richTextControl = dojo.widget.byId("storageValue")
				richTextControl.replaceEditorContent(results);
				// FIXME: Editor2 should be reflowing this height
				// internally; we shouldn't be exposed to this - fix
				// bug in Editor2
				richTextControl._updateHeight();
				*/
				
				// FIXME: The following code is for Editor
				// set the new Editor widget value
				var storageValue = dojo.widget.byId("storageValue"); 
				storageValue._richText.editNode.innerHTML = data;
				storageValue._richText._updateHeight();
			
				// print out that we are done
				self._printStatus("Loaded '" + key + "'");
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);	
	},
	
	_printStatus: function(message){
		// remove the old status
		var top = dojo.byId("top");
		for (var i = 0; i < top.childNodes.length; i++) {
			var currentNode = top.childNodes[i];
			if (currentNode.nodeType == dojo.dom.ELEMENT_NODE &&
					currentNode.className == "status") {
				top.removeChild(currentNode);
			}		
		}
		
		var status = document.createElement("span");
		status.className = "status";
		status.innerHTML = message;
		
		top.appendChild(status);
		dojo.lfx.fadeOut(status, 2000).play();
	}
};

// wait until Dojo Offline and the default Offline Widget are ready
// before we initialize ourselves
dojo.dot.ui.onLoad = dojo.lang.hitch(Moxie, Moxie.initialize);
