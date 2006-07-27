
dojo.provide("dojo.widget.TreeRPCControllerV3");



dojo.require("dojo.event.*");
dojo.require("dojo.json")
dojo.require("dojo.io.*");
dojo.require("dojo.widget.TreeLoadingControllerV3");

dojo.widget.tags.addParseTreeHandler("dojo:TreeRPCControllerV3");

dojo.widget.TreeRPCControllerV3 = function(){
	dojo.widget.TreeLoadingControllerV3.call(this);
}

dojo.inherits(dojo.widget.TreeRPCControllerV3, dojo.widget.TreeLoadingControllerV3);


// TODO: do something with addChild / setChild, so that RPCController become able
// to hook on this and report to server
dojo.lang.extend(dojo.widget.TreeRPCControllerV3, {
	widgetType: "TreeRPCControllerV3",

	
	
	/**
	 * generic routine to process requests with 2 kinds of answers
	 * object with object.error => not ok
	 * any other object => ok
	 */
	processConfirmationResponse: function(response, handler,args) {
				
		if(!dojo.lang.isUndefined(response.error)){
			this.RPCErrorHandler("server", response.error);
			return false;
		}
		
		return handler.apply(this, args);
				
		
		
	},
			
			
	/**
	 * Make request to server about moving children.
	 *
	 * Request returns "true" if move succeeded,
	 * object with error field if failed
	 *
	 * I can't leave DragObject floating until async request returns, need to return false/true
	 * so making it sync way...
	 *
	 * Also, "loading" icon is not shown until function finishes execution, so no indication for remote request.
	*/
	doMove: function(child, newParent, index){

		//if (newParent.isTreeNode) newParent.markLoading();

		var params = {
			// where from
			child: this.getInfo(child),
			childTree: this.getInfo(child.tree),
			// where to
			newParent: this.getInfo(newParent),
			newParentTree: this.getInfo(newParent.tree),
			newIndex: index
		};

		var success;

		this.runRPC({		
			url: this.getRPCUrl('move'),
			/* I hitch to get this.loadOkHandler */
			load: function(response){
				success = this.processConfirmationResponse(
					response,
					dojo.widget.TreeLoadingControllerV3.prototype.doMove,
					[child, newParent, index]
				) ;
			},
			sync: true,
			lock: [child, newParent],
			params: params
		});


		return success;
	},



	doDetach: function(node, callObj, callFunc){

		var success;
		
		var params = {
			node: this.getInfo(node),
			tree: this.getInfo(node.tree)
		}

		this.runRPC({
				url: this.getRPCUrl('detach'),
				/* I hitch to get this.loadOkHandler */
				load: function(response){
					success = this.processConfirmationResponse(
						response,
						dojo.widget.TreeLoadingControllerV3.prototype.doDetach,
						[node, callObj, callFunc]
					) 
				},
				params: params,
				lock: [node]
		});
		
		return success;

	},




	// -----------------------------------------------------------------------------
	//                             Create node stuff
	// -----------------------------------------------------------------------------


	doCreateChild: function(parent, index, output, callObj, callFunc){
			var success;
			
			var params = {
				tree: this.getInfo(parent.tree),
				parent: this.getInfo(parent),
				index: index,
				data: output
			}

			this.runRPC({
				url: this.getRPCUrl('createChild'),
				load: function(response){
					success = this.processConfirmationResponse(
						response,
						dojo.widget.TreeLoadingControllerV3.prototype.doCreateChild,
						[parent, index, response, callObj, callFunc]
					) 
				},
				params: params,
				lock: [parent]
			});

	}
});
