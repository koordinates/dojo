
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
	doMove: function(child, newParent, index, sync){

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


		var deferred = this.runRPC({		
			url: this.getRPCUrl('move'),
			sync: sync,			
			params: params
		});

		var _this = this;
		var args = arguments;	
		
		//deferred.addCallback(function(res) { dojo.debug("doMove fired "+res); return res});
		
		deferred.addCallback(function() {			
			dojo.widget.TreeBasicControllerV3.prototype.doMove.apply(_this,args);
		});

		
		return deferred;
	},

	doDetach: function(node, callObj, callFunc){

		
		var params = {
			node: this.getInfo(node),
			tree: this.getInfo(node.tree)
		}

		var deferred = this.runRPC({
			url: this.getRPCUrl('detach'),
			sync: sync,
			params: params			
		});
		
		
		var _this = this;
		var args = arguments;
		
		deferred.addCallback(function() {			
			dojo.widget.TreeBasicControllerV3.prototype.doDetach.apply(_this,args);
		});
		
						
		return deferred;

	},

	doDestroyNode: function(node, sync){

		
		var params = {
			node: this.getInfo(node),
			tree: this.getInfo(node.tree)
		}

		var deferred = this.runRPC({
			url: this.getRPCUrl('destroy'),
			sync: sync,
			params: params			
		});
		
		
		var _this = this;
		var args = arguments;
		
		deferred.addCallback(function() {			
			dojo.widget.TreeBasicControllerV3.prototype.doDestroyNode.apply(_this,args);
		});
		
						
		return deferred;

	},
	


	// -----------------------------------------------------------------------------
	//                             Create node stuff
	// -----------------------------------------------------------------------------


	doCreateChild: function(parent, index, data, sync){		
			
		var params = {
			tree: this.getInfo(parent.tree),
			parent: this.getInfo(parent),
			index: index,
			data: data
		}

		var deferred = this.runRPC({
			url: this.getRPCUrl('createChild'),
			sync: sync,
			params: params
		});
		
		var _this = this;
		var args = arguments;
		
		
		deferred.addCallback(function() {			
			dojo.widget.TreeBasicControllerV3.prototype.doCreateChild.apply(_this,args);
		});
		
						
		return deferred;
	},
	
	
	doClone: function(child, newParent, index, deep, sync) {
		
		var params = {
			child: this.getInfo(child),
			newParent: this.getInfo(newParent),
			index: index,
			deep: deep ? true : false, // undefined -> false
			tree: this.getInfo(child.tree)
		}
		
		
		var deferred = this.runRPC({
			url: this.getRPCUrl('clone'),
			sync: sync,
			params: params
		});
		
		var _this = this;
		var args = arguments;
		
		deferred.addCallback(function() {			
			dojo.widget.TreeBasicControllerV3.prototype.doClone.apply(_this,args);
		});
		
						
		return deferred;	
	}
	
	
});
