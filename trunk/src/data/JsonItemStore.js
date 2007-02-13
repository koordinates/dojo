dojo.provide("dojo.data.JsonItemStore");

dojo.require("dojo.data.core.SimpleBaseStore");
dojo.require("dojo.io");
dojo.require("dojo.lang.common");
dojo.require("dojo.experimental");
dojo.experimental("dojo.data.JsonItemStore");

dojo.declare("dojo.data.JsonItemStore", dojo.data.core.SimpleBaseStore, 
	function(/* object */ keywordParameters) {
		// summary: initializer
		// keywordParameters: {url: String}
		this._arrayOfItems = [];
		this._loadFinished = false;
		this._jsonFileUrl = keywordParameters.url;
		this._features = { 'dojo.data.core.Read': true };
		this._itemsByIdentity = null;
	}, {
	/* summary:
	 *   The JsonItemStore implements the dojo.data.core.Read API and reads
	 *   data from JSON files that have contents in this format --
	 *   { items: [
	 *       { name:'Kermit', color:'green', age:12, friends:['Gonzo', {reference:{name:'Fozzie Bear'}}]},
	 *       { name:'Fozzie Bear', wears:['hat', 'tie']},
	 *       { name:'Miss Piggy', pets:'Foo-Foo'}
	 *   ]}
	 */
	
	_assertIsItem: function(/* item */ item) {
		if (!this.isItem(item)) { 
			throw new Error("dojo.data.JsonItemStore: a function was passed an item argument that was not an item");
		}
	},
	
	getValue: function(/* item */ item, /* attribute || attribute-name-string */ attribute, /* value? */ defaultValue) {
		// summary: See dojo.data.core.Read.getValue()
		var values = this.getValues(item, attribute);
		var value = (values.length > 0) ? values[0] : defaultValue;
		return value;
	},
		
	getValues: function(/* item */ item, /* attribute || attribute-name-string */ attribute) {
		// summary: See dojo.data.core.Read.getValues()
		this._assertIsItem(item);
		return item[attribute];
	},
	
	getAttributes: function(/* item */ item) {
		// summary: See dojo.data.core.Read.getAttributes()
		this._assertIsItem(item);
		var attributes = [];
		for (var key in item) {
			attributes.push(key);
		}
		return attributes;
	},

	hasAttribute: function(/* item */ item, /* attribute || attribute-name-string */ attribute) {
		// summary: See dojo.data.core.Read.hasAttribute()
		return (this.getValues(item, attribute).length > 0);
	},
	
	containsValue: function(/* item */ item, /* attribute || attribute-name-string */ attribute, /* anything */ value) {
		// summary: See dojo.data.core.Read.containsValue()
		var values = this.getValues(item, attribute);
		for (var i = 0; i < values.length; ++i) {
			var possibleValue = values[i];
			if (value == possibleValue) {
				return true;
			}
		}
		return false; // boolean
	},
	
	isItem: function(/* anything */ something) {
		// summary: See dojo.data.core.Read.isItem()
		for (var i = 0; i < this._arrayOfItems.length; ++i) {
			var possibleItem = this._arrayOfItems[i];
			if (something == possibleItem) {
				return true;
			}
		}
		return false; // boolean
	},
	
	isItemLoaded: function(/* anything */ something) {
		// summary: See dojo.data.core.Read.isItemLoaded()
		return this.isItem(something);
	},
	
	loadItem: function(/* item */ item) {
		// summary: See dojo.data.core.Read.loadItem()
		this._assertIsItem(item);
		return item;
	},
	
	// find: function(/* object? */ keywordArgs) {
	//     /* find() is implemented in  dojo.data.core.SimpleBaseStore */
	// },
	
	getFeatures: function() {
		// summary: See dojo.data.core.Read.getFeatures()
		return this._features;
	},
	
	_findItems: function(/* object? */ keywordArgs, /* function */ findCallback, /* function */ errorCallback) {
		var self = this;
		var bindHandler = function(type, data, evt) {
			if (type == "load") {
				self._loadFinished = true;
				self._arrayOfItems = self._getItemsFromLoadedData(data);
				keywordArgs.items = self._arrayOfItems;
				findCallback(keywordArgs);
			} else if(type == "error" || type == 'timeout') {
				var errorObject = data;
				errorCallback(errorObject);
			}
		};
		if (this._loadFinished) {
			keywordArgs.items = self._arrayOfItems;
			findCallback(keywordArgs);
		} else {
			if (this._jsonFileUrl) {
				var bindRequest = dojo.io.bind({
					url: this._jsonFileUrl, // example: "muppets.json",
					handle: bindHandler,
					mimetype: "text/json",
					sync: false });
				keywordArgs.abort = bindRequest.abort;
			}
		}
	},
	
	_getItemsFromLoadedData: function(/* object */ dataObject) {
		var arrayOfItems = dataObject.items;
		
		// We need to do some transformations to convert the data structure
		// that we read from the file into a format that will be convenient
		// to work with in memory..
		
		// Step 1: We walk through all the attribute values of all the items, 
		// and replace single values with arrays.  For example, we change this:
        //     { name:'Miss Piggy', pets:'Foo-Foo'}
        // into this:
		//     { name:['Miss Piggy'], pets:['Foo-Foo']}
		
		for (var i = 0; i < arrayOfItems.length; ++i) {
			var item = arrayOfItems[i];
			for (var key in item) {
				var value = item[key];
				if (!dojo.lang.isArray(value)) {
					item[key] = [value];
				}
			}
		}
		
		// Step 2: We walk through all the attribute values of all the items,
		// and replace references with pointers to items.  For example, we change:
        //     { name:['Kermit'], friends:[{reference:{name:'Miss Piggy'}}] }
		// into this:
        //     { name:['Kermit'], friends:[miss_piggy] } 
		// (where miss_piggy is the object representing the 'Miss Piggy' item).
		for (i = 0; i < arrayOfItems.length; ++i) {
			item = arrayOfItems[i]; // example: { name:['Kermit'], friends:[{reference:{name:'Miss Piggy'}}] }
			for (key in item) {
				var arrayOfValues = item[key]; // example: [{reference:{name:'Miss Piggy'}}]
				for (var j = 0; j < arrayOfItems.length; ++j) {
					value = arrayOfValues[j]; // example: {reference:{name:'Miss Piggy'}}
					if (typeof value == "object" && value.reference) {
						var referenceDescription = value.reference; // example: {name:'Miss Piggy'}
						for (var k = 0; k < arrayOfItems.length; ++k) {
							var candidateItem = arrayOfItems[k];
							var found = true;
							for (var refKey in referenceDescription) {
								if (candidateItem[refKey] != referenceDescription[refKey]) { 
									found = false; 
								}
							}
							if (found) { 
								arrayOfValues[j] = candidateItem; 
							}
						}
					}
				}
			}
		}
		
		// Some data files specify an optional 'identifier', which is the name
		// of an attribute that holds the identity of each item.  If this data
		// file specified an identifier attribute, then build an identifer
		// 
		var identifier = dataObject.identifier;
		if (identifier) {
			this._features['dojo.data.core.Identity'] = identifier;
			this._itemsByIdentity = {};
			for (i = 0; i < arrayOfItems.length; ++i) {
				item = arrayOfItems[i];
				arrayOfValues = item[identifier];
				identity = arrayOfValues[0];
				this._itemsByIdentity[identity] = item;
			}
		}

		return arrayOfItems;
	},
	
	getIdentity: function(/* item */ item) {
		// summary: See dojo.data.core.Identity.getIdentity()
		var identifier = this._features['dojo.data.core.Identity'];
		var arrayOfValues = item[identifier];
		return arrayOfValues[0];
	},

	findByIdentity: function(/* string */ identity) {
		// summary: See dojo.data.core.Identity.findByIdentity()
		return this._itemsByIdentity[identity];
	}

});


