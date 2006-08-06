
dojo.provide("dojo.widget.TreeRpcControllerV3");



dojo.require("dojo.event.*");
dojo.require("dojo.json")
dojo.require("dojo.io.*");
dojo.require("dojo.widget.TreeLoadingControllerV3");

dojo.widget.tags.addParseTreeHandler("dojo:TreeRpcControllerV3");

dojo.widget.TreeRpcControllerV3 = function(){
	dojo.widget.TreeLoadingControllerV3.call(this);
}

dojo.inherits(dojo.widget.TreeRpcControllerV3, dojo.widget.TreeLoadingControllerV3);


// TODO: do something with addChild / setChild, so that RpcController become able
// to hook on this and report to server
dojo.lang.extend(dojo.widget.TreeRpcControllerV3, {
	widgetType: "TreeRpcControllerV3",

	RpcOnEditStart: true,
				
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


		var deferred = this.runRpc({		
			url: this.getRpcUrl('move'),
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
	}
});


// -------------- detach
dojo.lang.extend(dojo.widget.TreeRpcControllerV3, {
	
	prepareDetach: function(node, sync) {
		var deferred = this.startProcessing(node);		
		return deferred;
	},
	
	finalizeDetach: function(node) {
		this.finishProcessing(node);
	},
		

	doDetach: function(node, sync){

		
		var params = {
			node: this.getInfo(node),
			tree: this.getInfo(node.tree)
		}

		var deferred = this.runRpc({
			url: this.getRpcUrl('detach'),
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
	
	// -------------------------- Inline edit node ---------------------	

	/**
	 * send edit start request if needed
	 * useful for server-side locking 
	 */
	prepareEditLabel: function(node, sync) {
		if (!this.RpcOnEditStart) {
			return;
		}
		
		var _this = this;
		var deferred = this.startProcessing(node);
		
				
		var params = {
			node: this.getInfo(node),
			tree: this.getInfo(node.tree)
		}
		
		deferred.addCallback(function() {
			return _this.runRpc({
			url: _this.getRpcUrl('editLabelStart'),
			sync: sync,
			params: params			
		});
		
		return deferred;
	}
	/*
			

	doEditLabel: function(node, sync) {
		if (!this.editor) {
			dojo.raise(this.widgetType+": no editor specified");
		}
		
		if (this.editor.isClosed()) {
			var deferred = this.doEditLabelFinish(this.editor.saveOnBlur, sync);
			var _this = this;
			var _arguments = arguments;
			deferred.addCallback(function() { _this.doEditLabelStart.apply(_this, _arguments) });
		}
		
		node.editLabelStart();		
	},
	
	setTitle: function(title, editor) {
		node.setTitle(title);
		editor.editor_close(true);
	},*/
	
	

});

dojo.lang.extend(dojo.widget.TreeRpcControllerV3, {

	prepareDestroy: function(node, sync) {
		//dojo.debug(node);
		var deferred = this.startProcessing(node);		
		return deferred;
	},
	
	finalizeDestroy: function(node) {
		this.finishProcessing(node);
	},
		

	doDestroy: function(node, sync){

		
		var params = {
			node: this.getInfo(node),
			tree: this.getInfo(node.tree)
		}

		var deferred = this.runRpc({
			url: this.getRpcUrl('destroy'),
			sync: sync,
			params: params			
		});
		
		
		var _this = this;
		var args = arguments;
		
		deferred.addCallback(function() {			
			dojo.widget.TreeBasicControllerV3.prototype.doDestroy.apply(_this,args);
		});
		
						
		return deferred;

	}
});
	

dojo.lang.extend(dojo.widget.TreeRpcControllerV3, {

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

		var deferred = this.runRpc({
			url: this.getRpcUrl('createChild'),
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
		
		
		var deferred = this.runRpc({
			url: this.getRpcUrl('clone'),
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
