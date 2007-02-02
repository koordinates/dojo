dojo.require("dojo.dom");
dojo.require("dojo.event.common");
dojo.require("dojo.event.browser");
dojo.require("dojo.html.common");
dojo.require("dojo.html.style");
dojo.require("dojo.lfx.*");
dojo.require("dojo.widget.Editor");
dojo.require("dojo.storage.*");
dojo.require("dojo.dot.*");
dojo.require("dojo.sync");
dojo.require("dojo.dot.ui");

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
					"editor.js"
					]);
					
// Dojo's and the Editor Widget's resources
dojo.dot.files.cache([
					djConfig.baseRelativePath + "dojo.js",
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

	initialize: function(){
		if(this._initialized == true){
			return;
		}
		
		//dojo.debug("Moxie.initialize");
		
		// clear out old values
		dojo.byId("storageKey").value = "";
		dojo.byId("storageValue").value = "";
		
		// write out our available keys
		this._printAvailableKeys();
		
		// initialize our event handlers
		var directory = dojo.byId("directory");
		dojo.event.connect(directory, "onchange", this, this.directoryChange);
		dojo.event.connect(dojo.byId("saveButton"), "onclick", this, this.save);
		
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
	
	_save: function(key, value){
		this._printStatus("Saving '" + key + "'...");
		var self = this;
		var saveHandler = function(status, keyName){
			if(status == dojo.storage.PENDING){
				// The Flash dialog plus the underlying Editor on Firefox
				// creates screen glitches; temporary
				// workaround to just hide the Editors while dialog is showing
				if(dojo.render.html.moz){
					var storageValue = dojo.byId("storageValue");
					storageValue.style.display = "none";
				}
				
				return;
			}
			
			if(status == dojo.storage.FAILED){
				alert("You do not have permission to store data for this web site. "
			        + "Press the Configure button to grant permission.");
			}else if(status == dojo.storage.SUCCESS){
				// clear out the old value
				dojo.byId("storageKey").value = "";
				dojo.byId("storageValue").value = "";
				self._printStatus("Saved '" + key + "'");
				
				// update the list of available keys
				// put this on a slight timeout, because saveHandler is called back
				// from Flash, which can cause problems in Flash 8 communication
				// which affects Safari
				// FIXME: Find out what is going on in the Flash 8 layer and fix it
				// there
				window.setTimeout(function(){ self._printAvailableKeys() }, 1);
			}
			
			// Reshow the Editor (see below)
			if(dojo.render.html.moz){
				var storageValue = dojo.byId("storageValue");
				storageValue.style.display = "block";
			}
		};
		
		try{
			dojo.storage.put(key, value, saveHandler);
		}catch(exp){
			alert(exp);
		}
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
		var availableKeys = dojo.storage.getKeys();
		for (var i = 0; i < availableKeys.length; i++) {
			var optionNode = document.createElement("option");
			optionNode.appendChild(document.createTextNode(availableKeys[i]));
			optionNode.value = availableKeys[i];
			directory.appendChild(optionNode);
		}
	},
	
	_handleLoad: function(key){
		this._printStatus("Loading '" + key + "'...");
		
		// get the value
		var results = dojo.storage.get(key);
		
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
		
		// FIXME: The following code is for Editor1
		// set the new Editor widget value
		var storageValue = dojo.widget.byId("storageValue"); 
		storageValue._richText.editNode.innerHTML = results;
		storageValue._richText._updateHeight();
	
		// print out that we are done
		this._printStatus("Loaded '" + key + "'");
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
