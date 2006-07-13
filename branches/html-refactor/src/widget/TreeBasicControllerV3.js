
// TODO:
// fix dojo.widget.isLast/FirstNode for speed (this === parent.children[..])
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

	listenTreeEvents: ["createNode","treeChange","treeCreate",
					   "treeDestroy","setFolder","unsetFolder"],
	


	listenNode: function(node) {
		dojo.event.connect(node.expandNode, "onclick", this, "onExpandClick");
	},

	unlistenNode: function(node) {
		dojo.event.disconnect(node.expandNode, "onclick", this, "onExpandClick");
	},
	
	
	onSetFolder: function(message) {
		//dojo.debug("setFolder "+message.source)
		this.listenNode(message.source);
	},
	
	
	onUnsetFolder: function(message) {
		this.unlistenNode(message.source);
	},

	onTreeChange: function(message) {
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
	onTreeCreate: function(message) {
		var tree = message.source;
		var _this = this;
		if (tree.expandLevel) {
			dojo.lang.forEach(tree.children,
				function(child) {								
					_this.expandToLevel(child, tree.expandLevel-1)
				}
			);
		}
	},

	expandToLevel: function(node, level) {
		if (level == 0) return;

		var children = node.children;
		var _this = this;

		var handler = function(node, expandLevel) {
			this.node = node;
			this.expandLevel = expandLevel;
			// recursively expand opened node
			this.process = function() {
				//dojo.debug("Process "+node+" level "+level);
				for(var i=0; i<this.node.children.length; i++) {
					var child = node.children[i];

					_this.expandToLevel(child, this.expandLevel);
				}
			};
		}

		var h = new handler(node, level-1);


		this.expand(node, false, h, h.process);

	},


	getWidgetByNode: function(node) {
		var widgetId;
		while (! (widgetId = node.widgetId) ) {
			node = node.parentNode;
		}
		return dojo.widget.manager.getWidgetById(widgetId);
	},

	onExpandClick: function(e){
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

	expand: function(node, sync, callObj, callFunc) {		
		node.expand();
		if (callFunc) callFunc.apply(callObj, [node]);
	},

	collapse: function(node) {

		node.collapse();
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

// =============================== removeNode ============================


	canRemoveNode: function(child) {
		if (child.actionIsDisabled(child.actions.REMOVE)) {
			return false;
		}

		return true;
	},


	removeNode: function(node, callObj, callFunc) {
		if (!this.canRemoveNode(node)) {
			return false;
		}

		return this.doRemoveNode(node, callObj, callFunc);
	},


	doRemoveNode: function(node, callObj, callFunc) {
		node.tree.removeNode(node);

		if (callFunc) {
			callFunc.apply(dojo.lang.isUndefined(callObj) ? this : callObj, [node]);
		}
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

		var newChild = dojo.widget.createWidget(widgetType, data);

		parent.addChild(newChild, index);

		this.expand(parent);

		if (callFunc) {
			callFunc.apply(callObj, [newChild]);
		}

		return newChild;
	}



});
