dojo.provide("dojo.data.xml.XMLDataSet");
dojo.require("dojo.event.*");
dojo.require("dojo.data.xml.XpathUtil");
dojo.require("dojo.lang.declare");

//TODO:  Come up with a standard set of topic names
dojo.declare("dojo.data.xml.XMLDataSet",null,{
	initializer: function(query, data){
		this.query = query;
		this.nodeCache = null;
		this.dataCache = {};
		this.registerListeners();
		this.originalData = data;
		this.sortBy = null;
		this.sortDirection = "DOWN";	//TODO:  Replace with constant
		this.populatingNodes = false;	//becomes true when in the populateCache method.  Helps avoid recursion
	},
	
	registerListeners: function() {	}, 
	
	processDataChange: function(message) {
		dojo.debug("processDataChange");
		if (this.nodeCache != null) {	//if nodeCache is null, we've never queried for the data before, and so we don't have to worry about seeing if the data has changed
			var newData = this.evalXPath(message.data, this.query);
			if (newData.length != this.nodeCache.length) {
				//do update
				dojo.debug("Need to notify observers of update");
			}
			else {
				for (var i in newData) {
					if (this.nodeCache[i] != newData[i]) {
						//do update
						dojo.debug("Need to notify observers of update");
						this.nodeCache = newData;
						break;
					}
				}
			}
		} else {
			dojo.debug("No need to process change");
		}
	},
	
	sortData: function(attributePath, direction) {
		//invalidate nodes
		this.nodeCache = null;
		this.sortBy = attributePath;
		this.sortDirection =  direction;
		this.populateCache();
	
	},
	
	populateCache: function() {
		if (this.populatingNodes)	//avoid recursion
			return;
		
		this.populatingNodes = true;
		
		if (this.nodeCache == null) {
			this.nodeCache = dojo.data.xml.XpathUtil.selectNodes(this.originalData, this.query);
		
			//Apply sorting
			/*
			Here's how this works.  For each element in the returned data set (assume that our dataset contains elements),
			create a dojoXMLSortIndex attribute containing the index of the element in the original order ie. the order that the xpath query returns.
			Next get all the values for the column we're sorting by.  The order of the returned array matches up with the dojoXMLSortIndex index.
			Finally, do an array sort with our custom sort function.  The sortFunction will be called with two Element nodes to sort.
			We can get the original sort index from dojoXMLSortIndex and cross reference that with the values in the sorted column.
			That way, given a the elements to compare, it's easy to get the value of the attribute we're sorting by without having to perform an xpath query.
			*/
			if (this.sortBy != null) {
				for (var i in this.nodeCache) {
					this.nodeCache[i].setAttribute("dojoXMLSortIndex", i);
				}
				
				var columnValues = this.getColumn(this.sortBy);
				
				function sortFunction(a,b){
					var aSortIndex = parseInt(a.getAttribute("dojoXMLSortIndex"));
					var bSortIndex = parseInt(b.getAttribute("dojoXMLSortIndex"));
					var aValue = columnValues[aSortIndex];
					var bValue = columnValues[bSortIndex];
					var returnVal = 0;
					if (aValue > bValue)
						returnVal = 1;
					else if (aValue < bValue)
						returnVal = -1;
					return returnVal;
				}
				
				this.nodeCache.sort(sortFunction);
				
				for (var i in this.nodeCache) {
					this.nodeCache[i].removeAttribute("dojoXMLSortIndex");
				}
				
				if (this.sortDirection == "UP")
					this.nodeCache.reverse();
				
				//After sorting, we also need to invalidate the dataCache since the order has changed
				this.dataCache = {};
			}
		}
		this.populatingNodes = false;
	},
	
	getValues: function(path) {
		return this.getColumn(path);	//Column is the more traditional RDB equivalent
	},
	
	getSize: function() {
		this.populateCache();
		return this.nodeCache.length;
	},
	
	getColumn: function(path) {
		this.populateCache();
		var toReturn = [];
		if (this.dataCache[path] != null)
			return this.dataCache[path];
		for (var i = 0; i < this.nodeCache.length; i++) {
			var value = dojo.data.xml.XpathUtil.selectNodes(this.nodeCache[i], path);

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
				if (value.length > 0)	//ignore 0-length arrrays
					toReturn.push(toAdd);
				
			} else if (value != null && dojo.lang.whatAmI(value) != "unknown") {	//sometimes IE returns an unknown object, so check for "unknown"
				
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
		this.dataCache[path] = flatten(toReturn);	//cache the result so that next time we don't have to requery
		return this.dataCache[path];
	},
	
	/* 
	 * set's the node's value and sends out a message topic whose ID is the node that changed.
	 * Any listeners can look up the id using the getId function
	 */
	setValue: function(attXpath, index, value) {
	
		//clear the cache.  Ideally we could use some logic to figure out which values are invalidated, but that's tough for calculated values
		this.dataCache = {};
		this.populateCache();
		dojo.data.xml.XpathUtil.setValue(this.nodeCache[index], null, attXpath, value);
		dojo.event.topic.publish("xml/valueChanged", {id: this.nodeCache[index]} );
	},
	
	getId: function(index) {
		this.populateCache();
		return this.nodeCache[index];
	}
});


