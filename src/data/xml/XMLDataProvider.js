dojo.provide("dojo.data.xml.XMLDataProvider");
dojo.require("dojo.data.xml.XMLDataSet");
dojo.require("dojo.data.xml.DataGridXMLController");
dojo.require("dojo.data.DataProvider");
dojo.require("dojo.io.*");
dojo.require("dojo.animation.Timer");
dojo.require("dojo.data.xml.XpathUtil");

dojo.declare("dojo.data.xml.XMLDataProvider",dojo.data.IDataProvider,{

	issueChangeRequest: function () {
		dojo.event.topic.publish("xmlDataChange", { data: this.xmlData } );
	},
	
	copy: function(source /*Node*/, dest /*Node*/) {
		var newNode = this.xmlData.createElement(source.nodeName);
		//document.write(newNode.nodeName);
		dest.appendChild(newNode);
		//first time through, dest is a document node
		if (dest.nodeType == 1) {
			var atts = source.attributes;
			for (var i  = 0; i < atts.length; i++) {
				newNode.setAttribute(atts.item(i).nodeName, atts.item(i).nodeValue);
			}
		}
		if (source.childNodes) {
			for (var i = 0; i < source.childNodes.length; i++) {
					if (source.childNodes[i].nodeType == 1) {
						this.copy(source.childNodes[i], newNode);
					} else if (source.childNodes[i].nodeType == 3) {
						var text = document.createTextNode(source.childNodes[i].nodeValue);
						newNode.appendChild(text);
					}
			}
		}
	},
	
	init: function(keywordParameters /*Object*/, bindings /*Array*/) {
		var url = keywordParameters.location;
		var refreshRate = keywordParameters.refresh;
		var _defaultInstance = null;
	
		this._dynamicAttributes = [];
		this._changes = [];
		this.dataobjects = [];	//This will store all the data objects create by fetchNodeset
		this.nodeObjectMapKeys = [];
		this.nodeObjectMapValues = [];
		
		this.inBinding = false;
		this.refreshTimer = null;
		
		this.queryMap = [];	//map xpath queries to datasets
		
		//if location starts with #, use a data island, otherwise assume it's a URL
		
		this.xmlData = this.getData(url);
		this.bindings = bindings;
		this.calculateBindings();
		
		//Make sure to recalc bindings whenver there's a change
		//Ideally we should know whether we need to update anythings based on what changed
		dojo.event.topic.subscribe("xml/valueChanged", this, "calculateBindings");
		if (refreshRate) {
		//	this.refreshTimer = new dojo.animation.Timer(refreshRate);
		//	this.refreshTimer.onTick = createCallback(this, url);
			//this.refreshTimer.start();
		}
	},
	
	calculateBindings: function() {
		for (var i in this.bindings) {
			var nodes = dojo.data.xml.XpathUtil.selectNodes(this.xmlData, this.bindings[i].path);
			for (var j in nodes) {
				var node = nodes[j];
				var value = dojo.data.xml.XpathUtil.selectNodes(node, this.bindings[i].value);
				dojo.data.xml.XpathUtil.setValue(this.xmlData, null, this.bindings[i].path + "|" + j, value);
			}
		}
	},
	
	getData: function(url /*String*/) {
		var toReturn = null;
		//There's probably an easier way to copy the data out of an island
		if (url.charAt(0) == '#') {
			var idName = url.substring(1);
			var island = document.getElementById(idName);
			toReturn = dojo.dom.createDocument();
			this.copy(island.childNodes[1], this.xmlData);
			if (this.xmlData === null) {
				dojo.debug("Could not find node with id " + idName);
			}
			toReturn = toReturn.documentElement;
		}else{
			//Do a syncronous bind
			//TODO:  It'd be nice to be able to support asyncronous bind, but this would require differernt interaction between the provider and the control
			//Perhaps we should also support lazy initialization--The data won't be loaded until the first request for the data
			var bindArgs = {
				url: url,
				mimetype: "text/xml",
				sync: true,
				error: function(type, errObj){
					//TODO:  handle error here
					dojo.debug('couldn\'t bind to ' + url);
				},
				load: function(type, data, evt) {
					toReturn = data;
//FIXME:					try {toReturn.setProperty("SelectionLanguage", "XPath");} catch(e) {}	//enable xpath on IE
				}
			};
			
			// dispatch the request
		    var requestObj = dojo.io.bind(bindArgs);
		}
		
		return toReturn;	//Document Node
	},
	
	// No, this should not be here.
	getDataGridController: function() {
		return new dojo.widget.createWidget("DataGridXMLController",{});
	},

	fetchData: function(query /*String*/) {
		if (!this.queryMap[query]) {
			this.queryMap[query] =  new dojo.data.xml.XMLDataSet(query, this.getXMLData());
		} else { }
		return this.queryMap[query];	//dojo.xml.data.XMLDataSet
	},
	
	getXMLData: function() {
		return this.xmlData;	//Document Node
	}
});

