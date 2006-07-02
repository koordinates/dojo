dojo.provide("dojo.data.provider.RecordDataProvider");
dojo.require("dojo.data.DataProvider");
/*
dojo require("dojo.data.provider.Base");
dojo require("dojo.data.Item");
dojo require("dojo.data.Attribute");
dojo require("dojo.data.ResultSet");
dojo require("dojo.data.format.Json");
dojo require("dojo.data.format.Csv");
dojo require("dojo.lang.assert");
*/
// TODO/EXPERIMENTAL/UNIMPLEMENTED

/*
Use a single "Record" class associated with the provider itself, having
Attributes based on the column names provided in the data itself.  Does not use refs.
Functionally, this could replace FlatFileProvider (or FlatFileProvider would extend it).
*/

dojo.inherits(dojo.data.js.RecordDataProvider, dojo.data.IDataProvider);
dojo.lang.extend(dojo.data.js.RecordDataProvider, {
});

dojo.data.js.RecordDataProvider = function(/* keywords */ keywordParameters) {
	dojo.lang.assertType(keywordParameters, ["pureobject", "optional"]);
	dojo.data.IDataProvider.call(this);
	this._arrayOfItems = []; // TODO: root object...
	this._resultSet = null;
	this._dictionaryOfAttributes = {};
	if (keywordParameters) {
		var jsonObjects = keywordParameters["jsonObjects"];
		var jsonString  = keywordParameters["jsonString"];
		var fileUrl     = keywordParameters["url"];
		if (jsonObjects) {
			dojo.data.format.Json.loadDataProviderFromArrayOfJsonData(this, jsonObjects);
		}
		if (jsonString) {
			dojo.data.format.Json.loadDataProviderFromFileContents(this, jsonString);
		}
		if (fileUrl) {
			var arrayOfParts = fileUrl.split('.');
			var lastPart = arrayOfParts[(arrayOfParts.length - 1)];
			var formatParser = null;
			if (lastPart == "json") {
				formatParser = dojo.data.format.Json;
			}
			if (lastPart == "csv") {
				formatParser = dojo.data.format.Csv;
			}
			if (formatParser) {
				var fileContents = dojo.hostenv.getText(fileUrl);
				formatParser.loadDataProviderFromFileContents(this, fileContents);
			} else {
				dojo.lang.assert(false, "new dojo.data.js.RecordDataProvider({url: }) was passed a file without a .csv or .json suffix");
			}
		}
	}
};

dojo.data.js.RecordDataProvider.prototype.getProviderCapabilities = function(/* string */ keyword) {
	dojo.lang.assertType(keyword, [String, "optional"]);
	if (!this._ourCapabilities) {
		this._ourCapabilities = {
			transactions: false,
			undo: false,
			login: false,
			versioning: false,
			anonymousRead: true,
			anonymousWrite: false,
			permissions: false,
			queries: false,
			strongTyping: true
//			datatypes: [String, Date, Number]
		};
	}
	if (keyword) {
		return this._ourCapabilities[keyword];
	} else {
		return this._ourCapabilities;
	}
};

dojo.data.js.RecordDataProvider.prototype.registerAttribute = function(/* string or dojo.data.Attribute */ attributeId) {
	var registeredAttribute = this.getAttribute(attributeId);
	if (!registeredAttribute) {
		var newAttribute = new dojo.data.Attribute(this, attributeId);
		this._dictionaryOfAttributes[attributeId] = newAttribute;
		registeredAttribute = newAttribute;
	}
	return registeredAttribute; // dojo.data.Attribute
};

dojo.data.js.RecordDataProvider.prototype.getAttribute = function(/* string or dojo.data.Attribute */ attributeId) {
	var attribute = (this._dictionaryOfAttributes[attributeId] || null);
	return attribute; // dojo.data.Attribute or null
};

dojo.data.js.RecordDataProvider.prototype.getAttributes = function() {
	var arrayOfAttributes = [];
	for (var key in this._dictionaryOfAttributes) {
		var attribute = this._dictionaryOfAttributes[key];
		arrayOfAttributes.push(attribute);
	}
	return arrayOfAttributes; // Array
};

dojo.data.js.RecordDataProvider.prototype.fetchArray = function(query) {
	/**
	 * summary: Returns an Array containing all of the Items.
	 */ 
	return this._arrayOfItems; // Array
};

dojo.data.js.RecordDataProvider.prototype.fetchResultSet = function(query) {
	/**
	 * summary: Returns a ResultSet containing all of the Items.
	 */ 
	if (!this._resultSet) {
		this._resultSet = new dojo.data.ResultSet(this, this.fetchArray(query));
	}
	return this._resultSet; // dojo.data.ResultSet
};

dojo.data.js.RecordDataProvider.prototype._newItem = function() {
	var item = new dojo.data.Item(this);
	this._arrayOfItems.push(item);
	return item; // dojo.data.Item
};

/**
 * @method public dojo.data.js.RecordDataProvider.prototype._newItem
 *	Method to create a new data object, an instance of meta.Class which is passed in as a parameter.
 *	Please note that this method will add all Attributes and References to this dataobject, and set
 *	up a structure for this data object.  But real values for its members are still not set until
 *	set() and add() methods are called later on.
 * @param Class aClass
 *	The Class object from which the data object will be instanciated. If null, an anonymous default class is used
 * @return DataObject dataObject
 *	The dataObject instance that has been created.
 **/
dojo.data.js.RecordDataProvider.prototype._newItem = function(){
	  this.create = function(clazz){
		if (null == clazz){
			dojo.debug("meta.Factory: Unable to create object for null class");
		}
		var dataObject = new DataObject(clazz);
		dataObject.id = _newID();  // TODO: where is this function?
		var allAttrs = dataObject._class.getAllAttributes();//TODO: make class member public
		for (var i = allAttrs.length - 1; i >= 0; --i){
			var attr = allAttrs[i];
			if (attr.type != "id"){
				dataObject.addMember(attr.name, attr);
			}
		}
		var allRefs = dataObject._class.getAllReferences();
		for (var i = allRefs.length - 1; i >= 0; --i){
			var ref = allRefs[i];
			dataObject.addMember(ref.name,ref);
		}
		return dataObject;
}

dojo.data.js.RecordDataProvider.prototype._newAttribute = function(/* String */ attributeId) {
	dojo.lang.assertType(attributeId, String);
	dojo.lang.assert(this.getAttribute(attributeId) === null);
	var attribute = new dojo.data.Attribute(this, attributeId);
	this._dictionaryOfAttributes[attributeId] = attribute;
	return attribute; // dojo.data.Attribute
};

dojo.data.provider.Base.prototype._getResultSets = function() {
	return [this._resultSet]; // Array
};

