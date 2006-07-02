dojo.provide("dojo.data.xml.XMLDataSet");
dojo.require("dojo.event.*");
dojo.require("dojo.data.xml.XpathUtil");
dojo.require("dojo.lang.declare");

//TODO:  Come up with a standard set of topic names
dojo.declare("dojo.data.xml.XMLDataSet",null,{
	initializer: function(query, data){
		this.query = query;
		this.dataCache = null;
		this.registerListeners();
		this.originalData = data;
	},
	
	registerListeners: function() {	}, 
	
	processDataChange: function(message) {
		dojo.debug("processDataChange");
		if (this.dataCache != null) {	//if datacache is null, we've never queried for the data before, and so we don't have to worry about seeing if the data has changed
			var newData = this.evalXPath(message.data, this.query);
			if (newData.length != this.dataCache.length) {
				//do update
				dojo.debug("Need to notify observers of update");
			}
			else {
				for (var i in newData) {
					if (this.dataCache[i] != newData[i]) {
						//do update
						dojo.debug("Need to notify observers of update");
						this.dataCache = newData;
						break;
					}
				}
			}
		} else {
			dojo.debug("No need to process change");
		}
	},
	
	populateCache: function() {
		if (this.dataCache == null) {
			this.dataCache = dojo.data.xml.XpathUtil.selectNodes(this.originalData, this.query);
		}
	},
	
	getValues: function(path) {
		return this.getColumn(path);	//Column is the more traditional RDB equivalent
	},
	
	getSize: function() {
		this.populateCache();
		return this.dataCache.length;
	},
	
	getColumn: function(path) {
		this.populateCache();
		var toReturn = [];
		for (var i = 0; i < this.dataCache.length; i++) {
			var value = dojo.data.xml.XpathUtil.selectNodes(this.dataCache[i], path);
			//At this point, it's anyone's guess as to whether the value represents
			//an array of data or a single value.  If there are multiple values, then 
			//it's obvious that it's an array.  Otherwise it could just be a 1-element array
			if (dojo.lang.isArray(value)) {
				var toAdd = [];
				for (var j in value) {
					if (value[j].nodeType == 2) {
						toAdd.push(value[j].nodeValue);
					} else {
						toAdd.push(value[j]);
					}
				}
				toReturn.push(toAdd);
				
			} else {
				if (value.nodeType == 2){	//att node
					toReturn.push(value.nodeValue);
				}else{
					toReturn.push(value);
				}
			}

		}
		
		function flatten(list) {
			if (list.length == 1) {
				return list[0];
			} else {
				//check that everything in the list has a length of one
				var toReturn = [];
				for (var i in list) {
					if (dojo.lang.isArray(list[i])) {
						if (list[i].length != 1) {
							return list; //can't flatten, just return list
						} else {
							toReturn.push(list[i][0]);
						}
					} else {
						toReturn.push(list[i]);
					
					}

						
				}
				return toReturn;
			}
		}
		return flatten(toReturn);
	},
	
	/* 
	 * set's the node's value and sends out a message topic whose ID is the node that changed.
	 * Any listeners can look up the id using the getId function
	 */
	setValue: function(attXpath, index, value) {
		this.populateCache();
		dojo.data.xml.XpathUtil.setValue(this.dataCache[index], null, attXpath, value);
		dojo.event.topic.publish("xml/valueChanged", {id: this.dataCache[index]} );
	},
	
	getId: function(index) {
		this.populateCache();
		return this.dataCache[index];
	}
});


