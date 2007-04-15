dojo.require("dojo.dom");
dojo.require("dojo.event.*");
dojo.require("dojo.io.*");
dojo.require("dojo.html.*");
dojo.require("dojo.lfx.*");
dojo.require("dojo.widget.Editor2");
dojo.require("dojo.storage.*");
dojo.require("dojo.off.*");
dojo.require("dojo.off.ui");
dojo.require("dojo.sync");

// configure how we should work offline

// set our application name
dojo.off.ui.appName = "Moxie";

// add our list resources we need offline
// Moxie resources
dojo.off.files.cache([
					"editor.html",
					"editor.js",
					"about.html"
					]);

// Dojo resources
dojo.off.files.cache([
					djConfig.baseRelativePath + "dojo.js"
					]);
					
// The Dojo Editor Widget's resources
dojo.off.files.cache([
					djConfig.baseRelativePath + "src/widget/templates/Toolbar.css",
					djConfig.baseRelativePath + "src/widget/templates/EditorToolbar.css",
					djConfig.baseRelativePath + "src/widget/templates/images/tab_close.gif",
					djConfig.baseRelativePath + "src/widget/templates/richtextframe.html",
					djConfig.baseRelativePath + "src/widget/templates/images/toolbar-bg.gif",
					djConfig.baseRelativePath + "src/widget/templates/buttons/aggregate.gif",
					djConfig.baseRelativePath + "nls/dojo_en.js"
					]);

var Moxie = {
	_availableKeys: null,
	_documents: null,

	initialize: function(){
		dojo.debug("Moxie.initialize");
		
		// clear out old values
		dojo.byId("storageKey").value = "";
		dojo.byId("storageValue").value = "";
		
		// initialize our event handlers
		var directory = dojo.byId("directory");
		dojo.event.connect(directory, "onchange", this, this.directoryChange);
		dojo.event.connect(dojo.byId("saveButton"), "onclick", this, this.save);
		
		// load and write out our available keys
		this._loadKeys();
		
		// setup our offline handlers
		this._initOfflineHandlers();
		
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
		
		this._load(key);		
	},
	
	save: function(evt){
		// cancel the button's default behavior
		evt.preventDefault();
		evt.stopPropagation();
		
		// get the new values
		var key = dojo.byId("storageKey").value;
		var richTextControl = dojo.widget.byId("storageValue");
		var value = richTextControl.getEditorContent();
		
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
	
	_save: function(key, value, log){
		this._printStatus("Saving '" + key + "'...");
		
		if(dojo.off.isOnline == true){
			this._saveOnline(key, value, log);
		}else{
			this._saveOffline(key, value);
		}
	},
	
	_saveOnline: function(key, value){
		var self = this;
		var doLoad = function(type, data, evt){
			//dojo.debug("load, type="+type+", data="+data+", evt="+evt);	
			self._printStatus("Saved '" + key + "'");
			
			// add to our list of available keys
			self._addKey(key);
			
			if(dojo.sync.log.isReplaying == false){
				// update the list of available keys
				self._printAvailableKeys();
			}else{
				dojo.sync.log.continueReplay();	
			}
		};
		
		var bindArgs = {
			url:	 "/moxie/" + encodeURIComponent(key),
			sync:		false,
			method:		"POST",
			content:	{"content": value},
			error:		function(type, errObj, http){
				//dojo.debug("error, type="+type+", errObj="+errObj);
				// FIXME: Safari sometimes incorrectly calls us with an
				// error even though the post was successful -- we can
				// determine this because http.status is undefined
				// in this case. Find the real root cause of this in
				// dojo.io.BrowserIO and fix.
				if(typeof http != "undefined" 
					&& typeof http.status != "undefined"){
					var msg = "Unable to save file " + key + ": " + errObj.message;
					if(dojo.sync.log.isReplaying == false){
						alert(msg);
					}else{
						dojo.sync.log.haltReplay(msg);
					}
				}else{
					doLoad(); // For our friend Safari....
				}
			},
			load:		doLoad
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);	
	},
	
	_saveOffline: function(key, value){
		// create a command object to capture this action
		var command = {name: "save", key: key, value: value};
		
		// save it in our command log for replaying when we 
		// go back online
		dojo.sync.log.add(command);
		
		// also add it to our offline, downloaded data
		this._documents.push({fileName: key, content: value});
		var self = this;
		try{
			dojo.storage.put("documents", this._documents, function(status, key, message){
				if(status == dojo.storage.FAILED){
					alert("Unable to locally save your document: " + message);
				}
			});	
		}catch(exp){
			alert("Unable to locally save your document: " + exp);
		}
		
		// update our UI
		this._printStatus("Saved '" + key + "'");
		this._addKey(key);
		this._printAvailableKeys();
	},
	
	_loadKeys: function(){
		if(dojo.off.isOnline == true){
			this._loadKeysOnline();
		}else{
			this._loadKeysOffline();
		}
	},
	
	_loadKeysOnline: function(){
		var self = this;
		var bindArgs = {
			url:	 "/moxie/*",
			sync:		false,
			mimetype:	"text/javascript",
			headers:		{ "Accept" : "text/javascript" },
			error:		function(type, errObj){
				//dojo.debug("error, type="+type+", errObj="+errObj);
				alert("Unable to load our list of available keys from "
						+ "the server");
			},
			load:		function(type, data, evt){
				//dojo.debug("load, type="+type+", data="+data+", evt="+evt);	
				// 'data' is a JSON array, where each entry is a String filename
				// of the available keys
				self._availableKeys = data;
				self._printAvailableKeys();
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);	
	},
	
	_loadKeysOffline: function(){
		this._loadDownloadedData();
		this._printAvailableKeys();
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
		
		// sort our available keys alphabetically
		var keys = this._availableKeys.slice();
		keys.sort();
		
		// add new ones
		for (var i = 0; i < keys.length; i++) {
			var optionNode = document.createElement("option");
			optionNode.appendChild(document.createTextNode(keys[i]));
			optionNode.value = keys[i];
			directory.appendChild(optionNode);
		}
	},
	
	_addKey: function(key){
		var alreadyPresent = false;
		for(var i = 0; i < this._availableKeys.length; i++){
			if(this._availableKeys[i] == key){
				alreadyPresent = true;
				break;
			}	
		}	
		
		if(alreadyPresent == false){
			this._availableKeys.push(key);
		}
	},
	
	_load: function(key){
		this._printStatus("Loading '" + key + "'...");
		
		if(dojo.off.isOnline == true){
			this._loadOnline(key);
		}else{
			this._loadOffline(key);
		}
	},
	
	_loadOnline: function(key){
		// get the value from the server
		var self = this;
		// add 'proxybust' to the URL to make sure we get a fresh
		// copy that is not returned from either the browser's cache
		// or the local offline proxy's cache -- proxybust is a magic
		// string that will bypass the local proxy, and also trick the
		// browser
		var url = "/moxie/" + encodeURIComponent(key) 
					+ "?proxybust=" + new Date().getTime(); 
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
				self._updateEditorContents(data);
			
				// print out that we are done
				self._printStatus("Loaded '" + key + "'");
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);	
	},
	
	_loadOffline: function(key){
		var doc = null;
		for(var i = 0; i < this._documents.length; i++){
			var currentDoc = this._documents[i];
			if(currentDoc.fileName == key){
				doc = currentDoc;
				break;
			}
		}
		
		this._updateEditorContents(doc.content);
	},
	
	_updateEditorContents: function(contents){
		// set the new Editor widget value
		var richTextControl = dojo.widget.byId("storageValue");
		richTextControl.replaceEditorContent(contents);
		// FIXME: Editor2 should be reflowing this height
		// internally; we shouldn't be exposed to this - fix
		// bug in Editor2
		richTextControl._updateHeight();	
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
	},
	
	_initOfflineHandlers: function(){
		// setup what we do when we are replaying our command
		// log when the network reappears
		var self = this;
		dojo.sync.log.onCommand = function(command){
			if(command.name == "save"){
				self._save(command.key, command.value);
			}
		}
		
		// setup how we download our data from the server
		dojo.sync.doDownload = function(){
			// actually download our data
			self._downloadData();
		}
		
		// refresh our UI when we are finished syncing
		dojo.sync.onFinished = function(){
			dojo.off.ui.onFinished();
			
			self._printAvailableKeys();
		}
	},
	
	_downloadData: function(){
		var self = this;
		// add 'proxybust' to the URL to make sure we get a fresh
		// copy that is not returned from either the browser's cache
		// or the local offline proxy's cache -- proxybust is a magic
		// string that will bypass the local proxy, and also trick the
		// browser
		var bindArgs = {
			url:	 "/moxie/download?proxybust=" + new Date().getTime(),
			sync:		false,
			mimetype:	"text/javascript",
			headers:	{ "Accept" : "text/javascript" },
			error:		function(type, errObj){
				//dojo.debug("Moxie._downloadData.error, type="+type+", errObj="+errObj.message);
				var message = "Unable to download our documents from server: "
								+ errObj.message;
				dojo.sync.finishedDownloading(false, message);
			},
			load:		function(type, data, evt){
				//dojo.debug("Moxie._downloadData.load, type="+type+", evt="+evt);	
				self._saveDownloadedData(data);
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);	
	},
	
	_saveDownloadedData: function(data){
		// persist the data into Dojo Storage, with the key
		// "documents". 'data'
		// is a JSON structure passed to us by the server
		// that is an array of object literals, where each literal
		// has a 'fileName' entry and a 'content' entry.
		var self = this;
		try{
			dojo.storage.put("documents", data, function(status, key, message){
				//dojo.debug("_saveDownloadedData.resultHandler, status="+status+", key="+key+", message="+message);
				if(status == dojo.storage.SUCCESS){
					// update our list of available keys
					self._documents = data;
					self._availableKeys = new Array();
					for(var i = 0; i < data.length; i++){
						var fileName = data[i].fileName;
						self._availableKeys.push(fileName);
					}
					
					dojo.sync.finishedDownloading(true);
				}else if(status == dojo.storage.FAILED){
					dojo.sync.finishedDownloading(false, message);
				}
			});	
		}catch(exp){
			dojo.sync.finishedDownloading(false, exp.toString());
		}
	},
	
	_loadDownloadedData: function(){
		this._availableKeys = new Array();
		this._documents = dojo.storage.get("documents");
		if(this._documents == null
			|| typeof this._documents == "undefined"){
			this._documents = new Array();
		}
		
		for(var i = 0; i < this._documents.length; i++){
			var fileName = this._documents[i].fileName;
			this._availableKeys.push(fileName);
		}
	}
};

// Wait until Dojo Offline and the default Offline Widget are ready
// before we initialize ourselves. When this gets called the page
// is also finished loading.
dojo.off.ui.onLoad = dojo.lang.hitch(Moxie, Moxie.initialize);
