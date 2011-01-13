define("dojo/store/JsonRest", ["dojo", "dojo/store/util/QueryResults"], function(dojo) {

dojo.store.JsonRest = function(options){
	// summary:
	// 		This is a basic store for RESTful communicating with a server through JSON 
	// 		formatted data.
	//	options:
	//		This provides any configuration information that will be mixed into the store
	// options.target:
	// 		The target base URL to use for all requests to the server 
	var store = {
		target: "",
		// summary:
		// 		The indicates the property to use as the identity property. The values of this
		// 		property should be unique.	
		idProperty: "id",
		get: function(id, options){
			//	summary:
			// 		Retrieves an object by it's identity. This will trigger a GET request to the server
			// id:
			// 		The identity to use to lookup the object		
			
			var headers = options || {};
			headers.Accept = "application/javascript, application/json";
			return dojo.xhrGet({
				url:this.target + id,
				handleAs: "json",
				headers: headers
			});
		},		
		getIdentity: function(object){
			//	summary:
			// 		Returns an object's identity
			// object:
			// 		The object to get the identity from		
			return object[this.idProperty];
		},
		put: function(object, options){
			//	summary:
			// 		Stores an object. This will trigger a PUT request to the server 
			// 		if the object has an id, otherwise it will trigger a POST request	
			// object:
			// 		The object to store.
			// options:
			// 		Additional metadata for storing the data		
			// options.id:
			// 		The identity to use for storing the data
			options = options || {};
			var id = ("id" in options) ? options.id : this.getIdentity(object);
			var hasId = typeof id != "undefined";
			return dojo.xhr(hasId && !options.incremental ? "PUT" : "POST", {
					url: hasId ? this.target + id : this.target,
					postData: dojo.toJson(object),
					handleAs: "json",
					headers:{
						"Content-Type": "application/json",
						"If-Match": options.overwrite === true ? "*" : null,
						"If-None-Match": options.overwrite === false ? "*" : null,
					}
				});
		},
		add: function(object, options){
			//	summary:
			// 		Adds an object. This will trigger a PUT request to the server 
			// 		if the object has an id, otherwise it will trigger a POST request	
			// object:
			// 		The object to store.
			// options:
			// 		Additional metadata for storing the data		
			// options.id:
			// 		The identity to use for storing the data
			options = options || {};
			options.overwrite = false;
			return this.put(object, options);
		},
		remove: function(id){
			//	summary:
			// 		Deletes an object by it's identity. This will trigger a DELETE request to the server
			// id:
			// 		The identity to use to delete the object		
			return dojo.xhrDelete({
				url:this.target + id
			});
		},
		query: function(query, options){
			//	summary:
			// 		Queries the store for objects. This will trigger a GET request to the server, with the query added as a query string
			// query:
			// 		The query to use for retrieving objects from the store		
			var headers = {Accept: "application/javascript, application/json"};
			options = options || {};
			
			if(options.start >= 0 || options.count >= 0){
				headers.Range = "items=" + (options.start || '0') + '-' + 
					(("count" in options && options.count != Infinity) ? 
						(options.count + (options.start || 0) - 1) : '');
			}
			if(dojo.isObject(query)){
				query = dojo.objectToQuery(query);
				query = query ? "?" + query: "";
			}
			if(options && options.sort && !options.queryStr){
				query += (query ? "&" : "?") + "sort("
				for(var i = 0; i<options.sort.length; i++){
					var sort = options.sort[i];
					query += (i > 0 ? "," : "") + (sort.descending ? '-' : '+') + encodeURIComponent(sort.attribute); 
				}
				query += ")";
			}
			var results = dojo.xhrGet({
				url: this.target + query,
				handleAs: "json",
				headers: headers
			});
			results.total = results.then(function(){
				var range = results.ioArgs.xhr.getResponseHeader("Content-Range");
				return range && (range=range.match(/\/(.*)/)) && parseInt(range[1]);
			});
			return dojo.store.util.QueryResults(results);
		}
	};
	dojo.mixin(store, options);
	return store;
};

return dojo.store.JsonRest;
});