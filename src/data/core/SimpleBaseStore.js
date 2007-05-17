dojo.provide("dojo.data.core.SimpleBaseStore");

dojo.require("dojo.lang.declare");
dojo.require("dojo.experimental");
dojo.experimental("dojo.data.core.SimpleBaseStore");

dojo.declare("dojo.data.core.SimpleBaseStore", null, null, {
	/* summary:
	 *   The SimpleBaseStore is designed to serve as an abstract base class for
	 *   other datastore implementations.  The SimpleBaseStore should work well
	 *   for any datastore that can respond to a _findItems() call by returning 
	 *   an array of all the found items.  The SimpleBaseStore is not designed 
	 *   to work for datastores that respond to a find() call by incrementally
	 *   loading items, or sequentially loading partial batches of the result
	 *   set.  For datastores that extend SimpleBaseStore, SimpleBaseStore 
	 *   implements a find method that automatically handles seven of the find()
	 *   arguments -- sync, onbegin, onnext, oncompleted, onerror, scope, and 
	 *   saveResult.  The SimpleBaseStore subclass should not implement find(),
	 *   but should instead implement a _findItems() method.  The _findItems() 
	 *   method takes three arguments, the keywordArgs object that was passed 
	 *   to find(), a callback function to be called when the result array is
	 *   available, and an error callback to be called if something goes wrong.
	 *   The _findItems() method should ignore any keywordArgs parameters for
	 *   sycn, onbegin, onnext, oncompleted, onerror, scope, and saveResult.  
	 *   The _findItems() method needs to correctly handle any other keywordArgs
	 *   parameters, including the query parameter and any datastore-specific
	 *   optional parameters (such as maxResults or includeChildren).  The
	 *   _findItems() method must create an array of result items, set
	 *   keywordArgs.items to point to that array, and pass the keywordArgs
	 *   to the callback function -- or, the _findItems() method may, if it 
	 *   wants to, create an new result object (for example, an instance of
	 *   dojo.data.core.Result), set the result.items property of that object,
	 *   and pass that object to the callback function.
	 */
	find: function(/* object? */ keywordArgs) {
		// summary: See dojo.data.core.Read.find()
		keywordArgs = keywordArgs || {};
		if (!keywordArgs.store) {
			keywordArgs.store = this;
		}
		var result = keywordArgs;
		var _errorHandler = function(errorData) {
			if (keywordArgs.onerror) {
				var scope = keywordArgs.scope || dj_global;
				keywordArgs.onerror.call(scope, errorData);
			}
		};
		var _findHandler = function(resultObject) {
			result = resultObject;
			var oldAbortFunction = resultObject.abort || null;
			var aborted = false;
			var items = result.items;
			result.abort = function() {
				aborted = true;
				if (oldAbortFunction) {
					oldAbortFunction.call(result);
				}
			};
			var scope = result.scope || dj_global;
			if (!result.saveResult && result.onnext) {
				result.items = null;
			}
			if (!result.length) {
				result.length = items.length;
			}
			if (!result.store) {
				result.store = this;
			}
			if (result.onbegin) {
				result.onbegin.call(scope, result);
			}
			if (result.onnext) {
				for (var i = 0; i < items.length; ++i) {
					var item = items[i];
					if (!aborted) {
						result.onnext.call(scope, item, result);
					}
				}
			}
			if (result.oncompleted && !aborted) {
				result.oncompleted.call(scope, result);
			}
		};
		this._findItems(keywordArgs, _findHandler, _errorHandler);
		return result;
	}
});


