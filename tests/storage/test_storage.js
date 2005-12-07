dojo.require("dojo.dom");
dojo.require("dojo.event.*");
dojo.require("dojo.storage.*");

dojo.hostenv.writeIncludes();

var TestStorage = {
	currentProvider: "default",
	
	initialize: function() {
		// initialize our event handlers
		var storageProvider = document.getElementById("storageProvider");
		dojo.event.connect(storageProvider, "onchange", this,
											 this.changeProvider);
											 
		// add onclick listeners to all of our buttons
		var buttonContainer = document.getElementById("buttonContainer");
		var currentChild = buttonContainer.firstChild;
		while (currentChild.nextSibling != null) {
			if (currentChild.nodeType == dojo.dom.ELEMENT_NODE) {
				var buttonName = currentChild.id;
				var functionName = buttonName.match(/^(.*)Button$/)[1];
				dojo.event.connect(currentChild, "onclick", this, this[functionName]);
			}		
			
			currentChild = currentChild.nextSibling;
		}
		
		
	},
	
	changeProvider: function(evt) {
		var provider = evt.target.value;
		
		this._setProvider(provider);
	},
	
	load: function(evt) {
		dojo.debug("load");
		evt.preventDefault();
		evt.stopPropagation();
		var results;
		var results = dojo.storage.get("message");
		dojo.debug("after getting, results="+results);
	},
	
	save: function(evt) {
		dojo.debug("save");
		evt.preventDefault();
		evt.stopPropagation();
		dojo.debug("dojo.storage.put="+dojo.storage.put);
		dojo.storage.put("message", "Watson, come quickly!");
	},
	
	clear: function(evt) {
		dojo.debug("clear");
		evt.preventDefault();
		evt.stopPropagation();
	},
	
	configure: function(evt) {
		dojo.debug("configure");
		evt.preventDefault();
		evt.stopPropagation();
	},
	
	showAllKeys: function(evt) {
		dojo.debug("showAllKeys");
		evt.preventDefault();
		evt.stopPropagation();
	},
	
	remove: function(evt) {
		dojo.debug("remove");
		evt.preventDefault();
		evt.stopPropagation();
	},
	
	_printProviderMetadata: function() {
		var provider = dojo.storage.manager.getProvider();
		var maximumSize = provider.getMaximumSize();
		var permanent = provider.isPermanent();
		var uiConfig = provider.hasSettingsUI();
		var installable = provider.isInstallable();
		
		// TODO: Complete this
	},
	
	_setProvider: function(provider) {
		// change the provider in dojo
		if (provider == "default")
			dojo.storage.manager.autodetect();
		else {
			if (dojo.storage.manager.supportsProvider(provider)) {
				dojo.storage.manager.setProvider(provider);
			}
			else {
				alert("Your platform does not support features necessary to use "
							+ provider);
				return;
			}
		}
	}
};

dojo.event.connect(window, "onload", TestStorage, TestStorage.initialize);
