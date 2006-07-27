
dojo.provide("dojo.widget.TreeBasicControllerV3");

dojo.require("dojo.event.*");
dojo.require("dojo.json")
dojo.require("dojo.io.*");
dojo.require("dojo.widget.TreeCommon");


dojo.widget.tags.addParseTreeHandler("dojo:TreeBasicControllerV3");


dojo.widget.TreeBasicControllerV3 = function() {
	dojo.widget.HtmlWidget.call(this);
	
	this.listenedTrees = [];
}

dojo.inherits(dojo.widget.TreeBasicControllerV3, dojo.widget.HtmlWidget);


dojo.lang.extend(dojo.widget.TreeBasicControllerV3, dojo.widget.TreeCommon.prototype);

dojo.lang.extend(dojo.widget.TreeBasicControllerV3, {
	widgetType: "TreeBasicControllerV3",

	listenTreeEvents: ["afterChangeTree","afterTreeCreate", "beforeTreeDestroy","afterSetFolder","afterUnsetFolder"],
	


	listenNode: function(node) {
		//dojo.debug("listen "+node);
		dojo.event.browser.addListener(node.expandNode, "onclick", this.onExpandClickHandler);
		//dojo.event.connect(node.expandNode, "onclick", this, "onExpandClick");
	},

	unlistenNode: function(node) {
		dojo.event.browser.removeListener(node.expandNode, "onclick", this.onExpandClickHandler);
		//dojo.event.disconnect(node.expandNode, "onclick", this, "onExpandClick");
	},
	
	
	onAfterSetFolder: function(message) {
		//dojo.debug("setFolder "+message.source)
		this.listenNode(message.source);
	},
	
	
	onAfterUnsetFolder: function(message) {
		this.unlistenNode(message.source);
	},

	initialize: function() {
		this.onExpandClickHandler =  dojo.lang.hitch(this, this.onExpandClick)
	},
		
	
	getInfo: function(elem) {
		return elem.getInfo();
	},

	onAfterChangeTree: function(message) {
		//dojo.debugShallow(message);
		
		
		//dojo.profile.start("onTreeChange");
		
		// we listen/unlisten only if tree changed, not when its assigned first time
		if (!message.oldTree) {
			if (message.node.expandLevel > 0) {
				this.expandToLevel(message.node, message.node.expandLevel);				
			}
			
			//dojo.profile.end("onTreeChange");
			return; 
		}
		            
		if (!dojo.lang.inArray(this.listenedTrees, message.newTree)) {
			// I got this message because node leaves me (oldtree)
			/**
			 * clean all folders that I listen. I don't listen to non-folders.
			 */
			this.processDescendants(message.node, function(elem) { return elem.isFolder && elem instanceof dojo.widget.Widget}, this.unlistenNode);
		}		
		
		if (!dojo.lang.inArray(this.listenedTrees, message.oldTree)) {
			// we have new node
			this.processDescendants(message.node, function(elem) { return elem.isFolder && elem instanceof dojo.widget.Widget}, this.listenNode);
		}
		
		//dojo.profile.end("onTreeChange");
	},
	

	// perform actions-initializers for tree
	onAfterTreeCreate: function(message) {
		var tree = message.source;
		var _this = this;
		if (tree.expandLevel) {								
			_this.expandToLevel(tree, tree.expandLevel)
		}
	},

	/**
	 * time between expand calls for batch operations
	 * @see expandToLevel
	 */
	batchExpandTimeout: 20,
	
	
	expandAll: function(nodeOrTree, callback, callobj) {
		
		return this.expandToLevel(nodeOrTree, Number.POSITIVE_INFINITY, callback, callobj);
		
	},
	
	
	collapseAll: function(nodeOrTree) {
		var _this = this;
		
		var filter = function(elem) {
			return (elem instanceof dojo.widget.Widget) && elem.isFolder && elem.isExpanded;
		}
		
		if (nodeOrTree.isTreeNode) {		
			this.processDescendants(nodeOrTree, filter, this.collapse);
		} else if (nodeOrTree.isTree) {
			dojo.lang.forEach(nodeOrTree.children,function(c) { _this.processDescendants(c, filter, _this.collapse) });
		}
	},
	
	
	expandToLevel: function(nodeOrTree, level, callback, callobj) {
		dojo.require("dojo.widget.TreeTimeoutIterator");
		
		var filterFunc = function(elem) {
			var res = elem.isFolder || elem.children && elem.children.length;
			//dojo.debug("Filter "+elem+ " result:"+res);
			return res;
		};
		var callFunc = function(node, iterator) {
			return this.expand(node, false, iterator, iterator.forward);
		}
			
		var iterator = new dojo.widget.TreeTimeoutIterator(nodeOrTree, callFunc, this);
		iterator.setFilter(filterFunc);
		
		if (callback) {
			iterator.setFinish(callback, callobj);
		}
		
		iterator.timeout = this.batchExpandTimeout;
		
		//dojo.debug("here "+nodeOrTree+" level "+level);
		
		iterator.setMaxLevel(nodeOrTree.isTreeNode ? level-1 : level);
		
		
		return iterator.start(nodeOrTree.isTreeNode);
	},
	
	

	getWidgetByNode: function(node) {
		var widgetId;
		while (! (widgetId = node.widgetId) ) {
			node = node.parentNode;
		}
		return dojo.widget.byId(widgetId);
	},

	onExpandClick: function(e){
		//dojo.debugShallow(e)
		var node = this.getWidgetByNode(e.target);
		
		if(node.isLocked()) {
			return;
		}

		if (node.isExpanded){
			this.collapse(node);
		} else {
			this.expand(node);
		}
	},

	/**
	 * callout activated even if node is expanded already
	 */
	expand: function(node, sync, callObj, callFunc) {
		//dojo.debug("Expand "+node);
		
		if (node.isFolder) {
			node.expand(); // skip trees or non-folders
		}
		
		if (callFunc) callFunc.call(callObj, node);
	},

	collapse: function(node) {

		node.collapse();
	
	},
	
// =============================== copy ============================
	canClone: function(child, newParent, deep){
		return true;
	},
	
	
	clone: function(child, newParent, index, deep) {

		/* move sourceTreeNode to new parent */
		if (!this.canClone(child, newParent)) {
			return false;
		}

		var result = this.doClone(child, newParent, index, deep);

		if (!result) return result;

		if (newParent.isTreeNode) {
			this.expand(newParent);
		}

		return result;
	},

	doClone: function(child, newParent, index, deep) {
		dojo.debug("Clone "+child);
		var cloned = child.clone(deep);
		newParent.addChild(cloned, index);
				
		return true;
	},
	
// =============================== move ============================

	/**
	 * Checks whether it is ok to change parent of child to newParent
	 * May incur type checks etc
	 *
	 * It should check only hierarchical possibility w/o index, etc
	 * because in onDragOver event for Between DND mode we can't calculate index at once on onDragOVer.
	 * index changes as client moves mouse up-down over the node
	 */
	canMove: function(child, newParent){

		if (child.actionIsDisabled(child.actions.MOVE)) {
			return false;
		}

		// if we move under same parent then no matter if ADDCHILD disabled for him
		// but if we move to NEW parent then check if action is disabled for him
		// also covers case for newParent being a non-folder in strict mode etc
		if (child.parent !== newParent && newParent.actionIsDisabled(newParent.actions.ADDCHILD)) {
			return false;
		}

		// Can't move parent under child. check whether new parent is child of "child".
		var node = newParent;
		while(node.isTreeNode) {
			//dojo.debugShallow(node.title)
			if (node === child) {
				// parent of newParent is child
				return false;
			}
			node = node.parent;
		}

		return true;
	},


	move: function(child, newParent, index) {

		/* move sourceTreeNode to new parent */
		if (!this.canMove(child, newParent)) {
			return false;
		}

		var result = this.doMove(child, newParent, index);

		if (!result) return result;

		if (newParent.isTreeNode) {
			this.expand(newParent);
		}

		return result;
	},

	doMove: function(child, newParent, index) {
		//dojo.debug("MOVE "+child.tree.move);
		child.tree.move(child, newParent, index);

		return true;
	},

// =============================== detachNode ============================


	canDetachNode: function(child) {
		if (child.actionIsDisabled(child.actions.DETACH)) {
			return false;
		}

		return true;
	},


	detachNode: function(node, callObj, callFunc) {
		if (!this.canDetachNode(node)) {
			return false;
		}

		return this.doDetachNode(node, callObj, callFunc);
	},


	doDetachNode: function(node, callObj, callFunc) {
		node.detach();

		if (callFunc) {
			callFunc.call(dojo.lang.isUndefined(callObj) ? this : callObj, node);
		}
	},


// =============================== destroyNode ============================


	canDestroyNode: function(child) {
		
		if (child.parent && !this.canDetachNode(child)) {
			return false;
		}

		return true;
	},


	destroyNode: function(node, callObj, callFunc) {
		//dojo.debug("destroyNode in "+node)
		if (!this.canDestroyNode(node)) {
			return false;
		}

		return this.doDestroyNode(node, callObj, callFunc);
	},


	doDestroyNode: function(node, callObj, callFunc) {
		node.destroy();

		if (callFunc) {
			callFunc.call(dojo.lang.isUndefined(callObj) ? this : callObj, node);
		}
	},
	
	// -------------------------- Edit node ---------------------
	// TODO: write editing stuff
	canEditLabel: function(node) {
		if (node.actionIsDisabled(parent.actions.EDIT)) return false;

		return true;
	},

	editLabelStart: function(node) {
		if (!this.canEditLabel(node)) {
			return false;
		}

		return this.doEditLabelStart.apply(this, arguments);
	},

	doEditLabelStart: function(node) {
		node.editLabelStart();		
	},
	
	
	// -----------------------------------------------------------------------------
	//                             Create node stuff
	// -----------------------------------------------------------------------------


	canCreateChild: function(parent, index, data) {
		if (parent.actionIsDisabled(parent.actions.ADDCHILD)) return false;

		return true;
	},


	/* send data to server and add child from server */
	/* data may contain an almost ready child, or anything else, suggested to server */
	/*in RPC controllers server responds with child data to be inserted */
	createChild: function(parent, index, data, callObj, callFunc) {
		if (!this.canCreateChild(parent, index, data)) {
			return false;
		}


		return this.doCreateChild.apply(this, arguments);
	},

	doCreateChild: function(parent, index, data, callObj, callFunc) {

		var widgetType = data.widgetType ? data.widgetType : "TreeNodeV3";
		data.tree = parent.tree.widgetId;
		
		var newChild = dojo.widget.createWidget(widgetType, data);

		parent.addChild(newChild, index);

		this.expand(parent);

		if (callFunc) {
			callFunc.apply(callObj, [newChild]);
		}

		return newChild;
	}




});
