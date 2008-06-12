dojo.provide("dojox.data.ServiceStore");

// note that dojox.rpc.Service is not required, you can create your own services

// A ServiceStore is a readonly data store that provides a data.data interface to an RPC service.
// var myServices = new dojox.rpc.Service(dojo.moduleUrl("dojox.rpc.tests.resources", "test.smd"));
// var serviceStore = new dojox.data.ServiceStore({service:myServices.ServiceStore});
// 
// The ServiceStore also supports lazy loading. References can be made to objects that have not been loaded.
//  For example if a service returned:
// {"name":"Example","lazyLoadedObject":{"$ref":"obj2"}}
//
// And this object has accessed using the dojo.data API:
// var obj = serviceStore.getValue(myObject,"lazyLoadedObject");
// The object would automatically be requested from the server (with an object id of "obj2").
//

dojo.declare("dojox.data.ServiceStore",
	null,
	{
		constructor: function(options){
			//summary:
			//		ServiceStore constructor, instantiate a new ServiceStore 
			// 		A ServiceStore can be configured from a JSON Schema. Queries are just 
			// 		passed through as URLs for XHR requests, 
			// 		so there is nothing to configure, just plug n play.
			// 		Of course there are some options to fiddle with if you want:
			// options: 
			// 		Keyword arguments
			// The *schema* parameter
			//		This is a schema object for this store. This should be JSON Schema format.
			// 
			// The *service* parameter
			// 		This is the service object that is used to retrieve lazy data and save results 
			// 		The function should be directly callable with a single parameter of an object id to be loaded
			//
			// The *idAttribute* parameter
			//		Defaults to 'id'. The name of the attribute that holds an objects id.
			//		This can be a preexisting id provided by the server.  
			//		If an ID isn't already provided when an object
			//		is fetched or added to the store, the autoIdentity system
			//		will generate an id for it and add it to the index. 
			//
			// The *syncMode* parameter
			//		Setting this to true will set the store to using synchronous calls by default.
			//		Sync calls return their data immediately from the calling function, so
			//		callbacks are unnecessary

			//setup a byId alias to the api call	
			this.byId=this.fetchItemByIdentity;
			// if the advanced json parser is enabled, we can pass through object updates as onSet events
			if(options){
				dojo.mixin(this,options);
			}
			this.idAttribute = this.idAttribute || (this.schema && this.schema._idAttr);
		},

		getSchema: function(){
			return this.schema; 
		},
		getValue: dojo.isIE ? // we use different versions for optimum performance for 
			// each browser, getValue is the work horse of Dojo Data, it must be as fast as possible 
			function(item, property, defaultValue){
				// summary:
				//	Gets the value of an item's 'property'
				//
				//	item: /* object */
				//	property: /* string */
				//		property to look up value for	
				//	defaultValue: /* string */
				//		the default value
				var value = item[property];
				return value ? // performance guard against property in item check
						(value.errback && // guarding the instanceof provides significant performance improvement on IE, IE has very slow instanceof performance
						value instanceof dojo.Deferred) ? // check for the a Deferred to indicate it is not loaded 
							(dojox.rpc._sync = true) &&  // tell the service to operate synchronously (I have some concerns about the "thread" safety with FF3, as I think it does event stacking on sync calls)loadItem()
							dojox.data.ServiceStore.prototype.loadItem({item:value}) : 
							value : // return the plain value;
							property in item ? value : defaultValue;// not in item -> return default value
	
			} : function(item,property, defaultValue){
				var value = item[property];
				return value ? // performance guard against property in item check
						value instanceof dojo.Deferred ? // check for the a Deferred to indicate it is not loaded, all non-IE browsers have fast instanceof checks 
							(dojox.rpc._sync = true) &&  // tell the service to operate synchronously (I have some concerns about the "thread" safety with FF3, as I think it does event stacking on sync calls)loadItem()
							dojox.data.ServiceStore.prototype.loadItem({item:value}) : 
							value : // return the plain value;
							property in item ? value : defaultValue; // not in item -> return default value;

		},
		getValues: function(item, property){
			// summary:
			//		Gets the value of an item's 'property' and returns
			//		it.  If this value is an array it is just returned,
			//		if not, the value is added to an array and that is returned.
			//
			//	item: /* object */
			//	property: /* string */
			//		property to look up value for	
	
			var val = this.getValue(item,property);
			return val instanceof Array ? val : [val];
		},

		getAttributes: function(item){
			// summary:
			//	Gets the available attributes of an item's 'property' and returns
			//	it as an array. 
			//
			//	item: /* object */

			var res = [];
			for(var i in item){
				res.push(i);
			}
			return res;
		},

		hasAttribute: function(item,attribute){
			// summary:
			//		Checks to see if item has attribute
			//
			//	item: /* object */
			//	attribute: /* string */
			return attribute in item;		
		},

		containsValue: function(item, attribute, value){
			// summary:
			//		Checks to see if 'item' has 'value' at 'attribute'
			//
			//	item: /* object */
			//	attribute: /* string */
			//	value: /* anything */
			return dojo.indexOf(this.getValues(item,attribute),value) > -1;
		},


		isItem: function(item){
			// summary:
			//		Checks to see if a passed 'item'
			//		really belongs to this ServiceStore.  
			//
			//	item: /* object */
			//	attribute: /* string */
		
			// we have no way of determining if it belongs, we just have object returned from
			// 	service queries
			return true; 
		},

		isItemLoaded: function(item){
			// summary:
			//		returns isItem() :)
			//
			//		item: /* object */

			return !(item instanceof dojo.Deferred && item.fired < 0);
		},

		loadItem: function(args){
			// summary:
			// 		Loads an item that has not been loaded yet. Lazy loading should happen through getValue. 
			// 		However, if you access a value directly through property access, you can use this to load
			// 		a lazy (Deferred) value.
			//
			var item;
			if(args.item instanceof dojo.Deferred && args.item.fired < 0){
				args.item.addCallback(function(result){
					item = result; // in synchronous mode this can allow loadItem to return the value
					if(args.onItem){
						args.onItem.call(args.scope,result);				
					}
				});
				if(args.onError){
					args.item.addErrback(dojo.hitch(args.scope, args.onError));
				}
			}
			return item;
		},
		_currentId : 0,
		_index : {},
		_processResults : function(results){
			// this should return an object with the items as an array and the total count of 
			// items (maybe more than currently in the result set).
			// for example:
			//	| {totalCount:10,[{id:1},{id:2}]}

			for (var i in results){
				// index the results, assigning ids as necessary
				var obj = results[i]; 
				if (obj && typeof obj == 'object'){
					var id = obj.__id;
					if(!id){// if it hasn't been assigned yet
						if(this.idAttribute){
							// use the defined id if available
							id = obj[this.idAttribute];
						}else{
							id = this._currentId++;
						}
						id = this.service.servicePath + id;
						obj.__id = id;
						this._index[id] = obj;
					}
				}
			}
			return {totalCount:results.length, items: results};
		},
		close: function(request){
			return request && request.abort && request.abort();
		},
		_rootQueries:[],//objects that represent the result "root" queries			
		fetch: function(args){
			// summary:
			//		Standard fetch
			//
			//	query: /* string or object */
			//		Defaults to "". This is basically passed to the XHR request as the URL to get the data
			//
			//	start: /* int */
			//		Starting item in result set
			//
			//	count: /* int */
			//		Maximum number of items to return
			//
			// dontCache: /* boolean */
			//
			//	syncMode: /* boolean */
			//		Indicates that the call should be fetch synchronously if possible (this is not always possible)
			//
			//	onBegin: /* function */
			//		called before any results are returned. Parameters
			//		will be the count and the original fetch request
			//	
			//	onItem: /*function*/
			//		called for each returned item.  Parameters will be
			//		the item and the fetch request
			//
			//	onComplete: /* function */
			//		called on completion of the request.  Parameters will	
			//		be the complete result set and the request
			//
			//	onError: /* function */
			//		called in the event of an error

			args = args || {};

			var query=args.query;
			if(!args.syncMode){args.syncMode = this.syncMode;}
			var self = this;
			dojox.rpc._sync = this.syncMode;
			var scope = args.scope || self;
			var defResult = this.service(query);
			defResult.addCallback(function(results){
				
				var resultSet = self._processResults(results, defResult);
				results = args.results = resultSet.items;
				if(args.onBegin){
					args.onBegin.call(scope, resultSet.totalCount, args);
				}
				if(args.onItem){
					for(var i=0; i<results.length;i++){	
						args.onItem.call(scope, results[i], args);
					}
				}					
				if(args.onComplete){
					args.onComplete.call(scope, results, args);
				}
				return results;
			});
			defResult.addErrback(args.onError && dojo.hitch(scope, args.onError));
			args.abort = function(){
				// abort the request
				defResult.ioArgs.xhr.abort();
			};
			args.store = this;
			return args;
		},
		

		getFeatures: function(){
			// summary:
			// 		return the store feature set

			return { 
				"dojo.data.api.Read": true,
				"dojo.data.api.Identity": true, 
				"dojo.data.api.Schema": this.schema
			};
		},

		getLabel: function(item){
			// summary
			//		returns the label for an item. Just gets the "label" attribute.
			//	
			return this.getValue(item,"label");
		},

		getLabelAttributes: function(item){
			// summary:
			//		returns an array of attributes that are used to create the label of an item
			return ["label"];
		},

		//Identity API Support

		
		getIdentity: function(item){
			if(!item.__id){
				throw new Error("Identity attribute not found");
			}
			var prefix = this.service.servicePath;
			// support for relative referencing with ids
			return item.__id.substring(0,prefix.length) != prefix ?  item.__id : item.__id.substring(prefix.length); // String
		},

		getIdentityAttributes: function(item){
			// summary:
			//		returns the attributes which are used to make up the 
			//		identity of an item.  Basically returns this.idAttribute

			return [this.idAttribute];
		},

		fetchItemByIdentity: function(args){
			// summary: 
			//		fetch an item by its identity, by looking in our index of what we have loaded
			
			args.onItem.call(args.scope,this._index[this.service.servicePath + args.identity]);
		}
	
	}
);
