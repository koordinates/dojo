dojo.provide("dojo.data.csv.Result");
dojo.require("dojo.data.Result");
dojo.require("dojo.lang.assert");

dojo.declare("dojo.data.csv.Result", dojo.data.Result, {
	/* summary:
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
		function(/* function or object */ functionOrKeywordObject) {
			dojo.lang.assertType(functionOrKeywordObject, [Function, "pureobject"]); 
			if (dojo.lang.isFunction(functionOrKeywordObject)) {
				var fn = functionOrKeywordObject;
				this._inProgress = true;
				for (var i in this._arrayOfItems) {
					var item = this._arrayOfItems[i];
					if (!this._cancel) {
						fn(item, this);
					}
				}
				this._inProgress = false;
				this._cancel = false;
			} else {
				dojo.unimplemented('dojo.data.csv.Result.forEach({object:someHandlerObject, callback:"someCallbackMethod"})');
			}
			return true; // boolean
		},
	getLength:
		function() {
			return this._arrayOfItems.length; // integer
		},
	inProgress:
		function() {
			return this._inProgress; // boolean
		},
	cancel:
		function() {
			if (this._inProgress) {
				this._cancel = true;
			}
		},
	addCallback:
		function(/* function */ callbackFunction) {
			dojo.unimplemented('dojo.data.csv.Result.addCallback');
		},
	addErrback:
		function(/* function */ errorCallbackFunction) {
			dojo.unimplemented('dojo.data.csv.Result.addErrback');
		},
	getStore:
		function() {
			return this._dataStore; // an object that implements dojo.data.Read
		}
});

