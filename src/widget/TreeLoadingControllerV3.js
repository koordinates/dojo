
dojo.provide("dojo.widget.TreeLoadingControllerV3");

dojo.require("dojo.widget.TreeBasicControllerV3");
dojo.require("dojo.event.*");
dojo.require("dojo.json")
dojo.require("dojo.io.*");
dojo.require("dojo.Deferred");

dojo.widget.tags.addParseTreeHandler("dojo:TreeLoadingControllerV3");

dojo.Error = function(message, extra) {
	this.message = message;
	this.extra = extra;
	this.stack = (new Error()).stack;	
}

dojo.Error.prototype = new Error();

dojo.CommunicationError = function() {
	dojo.Error.apply(this, arguments);
	this.name="CommunicationError"
}
dojo.inherits(dojo.CommunicationError, dojo.Error);


dojo.FormatError = function() {
	dojo.Error.apply(this, arguments);
	this.name="FormatError"
}
dojo.inherits(dojo.FormatError, dojo.Error);


dojo.RPCError = function() {
	dojo.Error.apply(this, arguments);
	this.name="RPCError"
}
dojo.inherits(dojo.RPCError, dojo.Error);



dojo.widget.TreeLoadingControllerV3 = function() {
	dojo.widget.TreeBasicControllerV3.call(this);
}

dojo.inherits(dojo.widget.TreeLoadingControllerV3, dojo.widget.TreeBasicControllerV3);

dojo.lang.extend(dojo.widget.TreeLoadingControllerV3, {
	widgetType: "TreeLoadingControllerV3",

	

	RPCUrl: "",

	RPCActionParam: "action", // used for GET for RPCUrl

	preventCache: true,

	getDeferredBindHandler: function(/* dojo.rpc.Deferred */ deferred){
		// summary
		// create callback that calls the Deferred's callback method
		return dojo.lang.hitch(this, 
			function(type, obj /*,...*/){
				for(var i=0;i<arguments.length;i++) {
					//dojo.debug("ARG "+i+" \n"+arguments[i]);
				}
				
				if (type=="load" ) {
				//dojo.debug("GO "+deferred);
					
					if(!dojo.lang.isUndefined(obj.error)){
						deferred.errback(new RPCError(obj.error, obj));
						return;
					}
	
					deferred.callback(obj);
					return;
				}
				
				var extra = {}				
				for(var i=1; i<arguments.length;i++) {
					dojo.lang.mixin(extra, arguments[i]);					
				}
				var result = new dojo.CommunicationError(arguments[1], extra);				
				
				
				deferred.errback(result);
				
			}
		);
		
	},

	getRPCUrl: function(action) {

		// RPCUrl=local meant SOLELY for DEMO and LOCAL TESTS.
		// May lead to widgetId collisions
		if (this.RPCUrl == "local") {
			var dir = document.location.href.substr(0, document.location.href.lastIndexOf('/'));
			var localUrl = dir+"/local/"+action;
			//dojo.debug(localUrl);
			return localUrl;	
		}

		if (!this.RPCUrl) {
			dojo.raise("Empty RPCUrl: can't load");
		}

		return this.RPCUrl + ( this.RPCUrl.indexOf("?") > -1 ? "&" : "?") + this.RPCActionParam+"="+action;
	},


	/**
	 * Add all loaded nodes from array obj as node children and expand it
	*/
	loadProcessResponse: function(node, result) {
		dojo.debug("Process response "+node);
				
		if (!dojo.lang.isArray(result)) {
			throw new dojo.FormatError('loadProcessResponse: Not array loaded: '+result);
		}

		node.setChildren(result);
		
	},

	/**
	 * kw = { url, sync, params }
	 */
	runRPC: function(kw) {
		var _this = this;
		
		var deferred = new dojo.Deferred();
		
		dojo.io.bind({
			url: kw.url,			
			handle: this.getDeferredBindHandler(deferred),
			mimetype: "text/json",
			preventCache: this.preventCache,
			sync: kw.sync,
			content: { data: dojo.json.serialize(kw.params) }
		});
		
		return deferred;

	},



	/**
	 * Load children of the node from server
	 * Synchroneous loading doesn't break control flow
	 * I need sync mode for DnD
	*/
	loadRemote: function(node, sync){
		var _this = this;

		var params = {
			node: this.getInfo(node),
			tree: this.getInfo(node.tree)
		};

		
		var deferred = this.runRPC({
			url: this.getRPCUrl('getChildren'),
			sync: sync,
			params: params
		});
		
		deferred.addCallback(function(res) { return _this.loadProcessResponse(node,res) });
		
				
		
		return deferred;

	},

	batchExpandTimeout: 0,

	expand: function(node, sync) {		
		// widget which children are data objects, is UNCHECKED, but has children and shouldn't be loaded
		// so I put children check here too
		
		var deferred = this.loadIfNeeded(node, sync);
				
		deferred.addCallback(function(res) {
			//dojo.debug("Activated callback dojo.widget.TreeBasicControllerV3.prototype.expand(node); "+res);
			dojo.widget.TreeBasicControllerV3.prototype.expand(node);
			return res;
		});
		
		
		return deferred;
	},

	
	loadIfNeeded: function(node, sync) {
		if (node.state == node.loadStates.UNCHECKED && node.isFolder && !node.children.length) {
			// populate deferred with other things to pre-do
			deferred = this.loadRemote(node, sync);			
		} else {
			/* "fake action" here */
			deferred = new dojo.Deferred();
			deferred.callback();
		}
		
		return deferred;
	},
	
	
	runStages: function(check, prepare, make, expose, args) {
		
		if (check && !check.apply(this, args)) {
			return false;
		}
		
		if (prepare) {
			var deferred = prepare.apply(this, args);
		} else {
			var deferred = new dojo.Deferred();
			deferred.callback();
		}
		
		//deferred.addCallback(function(res) { dojo.debug("Prepare fired "+res); return res});
		
		var _this = this;
		deferred.addCallback(function() {			
			return make.apply(_this, args);
		});
		
		//deferred.addCallback(function(res) { dojo.debug("Main fired "+res); return res});
		
				
		// exposer does not affect result
		if (expose) {
			deferred.addCallback(function(res) {
				expose.apply(_this, args);
				return res;
			});
		}
		
		return deferred;
	}
	
});

// ----------------- move -----------------
dojo.lang.extend(dojo.widget.TreeLoadingControllerV3, {
	
	/* actually move the node, without informing viewer */
	prepareMove: function(child, newParent, index, sync) {
		
		return this.loadIfNeeded(newParent, sync);		
	}
	
});

// -------------------- createChild ------------
dojo.lang.extend(dojo.widget.TreeLoadingControllerV3, {	
	

	prepareCreateChild: function(parent, index, data, sync) {
		return this.loadIfNeeded(parent, sync);		
	}

});


dojo.lang.extend(dojo.widget.TreeLoadingControllerV3, {	
	
	prepareClone: function(child, newParent, index, deep, sync) {
		return this.loadIfNeeded(newParent, sync);		
	}

});
