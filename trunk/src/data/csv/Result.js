dojo.provide("dojo.data.csv.Result");
dojo.require("dojo.data.Result");
dojo.require("dojo.lang.assert");

dojo.declare("dojo.data.csv.Result", dojo.data.Result, {
	/* Summary:
	 *   dojo.data.csv.Result implements the dojo.data.Result API.  
	 */
	initializer: 
		function(/* array */ arrayOfItems, /* object */ dataStore) {
			dojo.lang.assertType(arrayOfItems, Array);
			this._arrayOfItems = arrayOfItems;
			this._dataStore = dataStore;
			this._cancel = false;
			this._inProgress = false;
		},
	forEach:
		function(/* function */ callbackFunction, /* object? */ callbackObject, /* object? */ optionalKeywordArgs) {
			// Summary: See dojo.data.Result.forEach()
			dojo.lang.assertType(callbackFunction, Function); 
			dojo.lang.assertType(callbackObject, Object, {optional:true}); 
			dojo.lang.assertType(optionalKeywordArgs, "pureobject", {optional:true}); 
			this._inProgress = true;
			for (var i in this._arrayOfItems) {
				var item = this._arrayOfItems[i];
				if (!this._cancel) {
					callbackFunction.call(callbackObject, item, i, this);
				}
			}
			this._inProgress = false;
			this._cancel = false;
			
			return true; // boolean
		},
	getLength:
		function() {
			// Summary: See dojo.data.Result.getLength()
			return this._arrayOfItems.length; // integer
		},
	inProgress:
		function() {
			// Summary: See dojo.data.Result.inProgress()
			return this._inProgress; // boolean
		},
	cancel:
		function() {
			// Summary: See dojo.data.Result.cancel()
			if (this._inProgress) {
				this._cancel = true;
			}
		},
	setOnFindCompleted:
		function(/* function */ callbackFunction, /* object? */ callbackObject) {
			// Summary: See dojo.data.Result.setOnFindCompleted()
			dojo.unimplemented('dojo.data.csv.Result.setOnFindCompleted');
		},
	setOnError:
		function(/* function */ errorCallbackFunction, /* object? */ callbackObject) {
			// Summary: See dojo.data.Result.setOnError()
			dojo.unimplemented('dojo.data.csv.Result.setOnError');
		},
	getStore:
		function() {
			// Summary: See dojo.data.Result.getStore()
			return this._dataStore; // an object that implements dojo.data.Read
		}
});

