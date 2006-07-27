
dojo.provide("dojo.widget.TreeLoadingControllerV3");

dojo.require("dojo.widget.TreeBasicControllerV3");
dojo.require("dojo.event.*");
dojo.require("dojo.json")
dojo.require("dojo.io.*");


dojo.widget.tags.addParseTreeHandler("dojo:TreeLoadingControllerV3");


dojo.widget.TreeLoadingControllerV3 = function() {
	dojo.widget.TreeBasicControllerV3.call(this);
}

dojo.inherits(dojo.widget.TreeLoadingControllerV3, dojo.widget.TreeBasicControllerV3);


dojo.lang.extend(dojo.widget.TreeLoadingControllerV3, {
	widgetType: "TreeLoadingControllerV3",

	RPCUrl: "",

	RPCActionParam: "action", // used for GET for RPCUrl


	/**
	 * Common RPC error handler (dies)
	*/
	RPCErrorHandler: function(type, obj, evt) {
		alert( "RPC Error: " + (obj.message||"no message"));
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
	loadProcessResponse: function(node, result, callObj, callFunc) {

		if (!dojo.lang.isUndefined(result.error)) {
			this.RPCErrorHandler("server", result.error);
			return false;
		}

		//dojo.debugShallow(result);

		if (!dojo.lang.isArray(result)) {
			dojo.raise('loadProcessResponse: Not array loaded: '+result);
		}

		node.setChildren(result);
		
		//node.addAllChildren(newChildren);

		//dojo.debug(callFunc);

		if (dojo.lang.isFunction(callFunc)) {
			callFunc.call(callObj ? callObj : this, node, result);
		}
		//this.expand(node);
	},


	/**
	 * takes arguments for dojo.io.bind + lock array
	 * serializes params for call
	 * calls RPC Handler in case of call error and passes result on if all fine
	 */
	runRPC: function(kw) {
		var _this = this;

		// response handler of any type
		var handle = function(type, data, evt) {
			// unlock BEFORE any processing is done
			// so errorHandler may apply locking
			if (kw.lock) {
				dojo.lang.forEach(kw.lock,
					function(t) { t.unlock() }
				);
			}

			if(type == "load"){
				kw.load.call(this, data);
			}else{
				this.RPCErrorHandler(type, data, evt);
			}

		}

		if (kw.lock) {
			dojo.lang.forEach(kw.lock, function(elem) { elem.lock() });
		}


		dojo.io.bind({
			url: kw.url,
			/* I hitch to get this.loadOkHandler */
			handle: dojo.lang.hitch(this, handle),
			mimetype: "text/json",
			preventCache: true,
			sync: kw.sync,
			content: { data: dojo.json.serialize(kw.params) }
		});
	},



	/**
	 * Load children of the node from server
	 * Synchroneous loading doesn't break control flow
	 * I need sync mode for DnD
	*/
	loadRemote: function(node, sync, callObj, callFunc){
		var _this = this;

		var params = {
			node: this.getInfo(node),
			tree: this.getInfo(node.tree)
		};

		//dojo.debug(callFunc)

		this.runRPC({
			url: this.getRPCUrl('getChildren'),
			load: function(result) {
				_this.loadProcessResponse(node, result, callObj, callFunc) ;
			},
			sync: sync,
			lock: [node],
			params: params
		});

	},

	batchExpandTimeout: 0,

	expand: function(node, sync, callObj, callFunc) {		
		// widget which children are data objects, is UNCHECKED, but has children and shouldn't be loaded
		// so I put children check here too
		if (node.state == node.loadStates.UNCHECKED && node.isFolder && !node.children.length) {

			this.loadRemote(node, sync,
				this,
				function(node, newChildren) {
					this.expand(node, sync, callObj, callFunc);
				}
			);

			return;
		}

		dojo.widget.TreeBasicControllerV3.prototype.expand.apply(this, arguments);

	},



	doMove: function(child, newParent, index) {
		/* load nodes into newParent in sync mode, if needed, first */
		if (newParent.isTreeNode && newParent.state == newParent.loadStates.UNCHECKED) {
			this.loadRemote(newParent, true);
		}

		return dojo.widget.TreeBasicControllerV3.prototype.doMove.apply(this, arguments);
	},


	doCreateChild: function(parent, index, data, callObj, callFunc) {

		/* load nodes into newParent in sync mode, if needed, first */
		if (parent.state == parent.loadStates.UNCHECKED) {
			this.loadRemote(parent, true);
		}
		
		// error occured while updating
		if (parent.state == parent.loadStates.UNCHECKED) {
			return false;
		}

		return dojo.widget.TreeBasicControllerV3.prototype.doCreateChild.apply(this, arguments);
	}



});
