
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

	listenTreeEvents: ["treeChange","treeCreate", "treeDestroy","setFolder","unsetFolder"],
	


	listenNode: function(node) {				
		dojo.event.browser.addListener(node.expandNode, "onclick", this.onExpandClickHandler, false, true);
		//dojo.event.connect(node.expandNode, "onclick", this, "onExpandClick");
	},

	unlistenNode: function(node) {
		dojo.event.browser.removeListener(node.expandNode, "onclick", this.onExpandClickHandler, false);
		//dojo.event.disconnect(node.expandNode, "onclick", this, "onExpandClick");
	},
	
	
	onSetFolder: function(message) {
		//dojo.debug("setFolder "+message.source)
		this.listenNode(message.source);
	},
	
	
	onUnsetFolder: function(message) {
		this.unlistenNode(message.source);
	},

	initialize: function() {
		this.onExpandClickHandler =  dojo.lang.hitch(this, this.onExpandClick)
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

	expandTimeout: 20,
	
	// FIXME: extract iterator
	expandToLevel: function(node, level, sync) {
		if (level == 0) return;
		
		//maybe top widget w/o node.parent
		//this._expandToLevel([node.parent, node.getParentIndex()], level, sync, []);
		
		
		
		var children = node.children;
		var handler;
		
		var _this = this;
		
		if (children.length) {
			var index = 0;
			var next = children[index];
			var found;


			while (!(found = next.isFolder || next.children && next.children.length) && index < children.length-1) {
				next = children[++index];
			}
			
			if (found) {
				var nodeA = [node,index]
				handler = function() {					
					var tid = setTimeout(function() {
						_this._expandToLevel(nodeA, level-1, sync, [nodeA]);
						clearTimeout(tid);
					}, _this.expandTimeout);
				}
			}
			
		}
		
		
		this.expand(node, sync, this, handler);
		

	},

	// FIXME: extract iterator
	_expandToLevel: function(nodeA, level, sync, stack) {
		var _this = this;
		
		var handler;
		
		var found;
		
		var searchIndex = 0;
		var searchNode = nodeA[0].children[ nodeA[1] ];
		
		//dojo.profile.start("_expandToLevel "+nodeA[0].children[ nodeA[1] ]);
		//dojo.debug("_expandToLevel "+nodeA[0].children[ nodeA[1] ])
			
		while(true) {
			//dojo.debug("_expandToLevel check children "+searchNode+" from index "+searchIndex)
			
			// try to find next among children
			
			while (searchIndex < searchNode.children.length) {
				// take next child, unprocessed yet
								
				var child = searchNode.children[searchIndex];
				
				if (child.isFolder || child.children && child.children.length) {					
					found = [searchNode, searchIndex];
					stack.push(found);
					//dojo.debug("child found "+searchNode+" index "+searchIndex);
					break;
				}
				
				searchIndex++;
			}
				
			if (found) break;
			
			if (stack.length) {
				// pop previous parent			
				var p = stack.pop();			
				
				searchIndex = p[1]+1;
				searchNode = p[0];
				
				//dojo.debug("pop parent "+searchNode+" index "+searchIndex);
				
				continue;
			}
			
			break;			
			
		} 
		
		if (found) {
			//dojo.debug("found next "+found[0]+" index "+found);
			
			handler = function() {					
				var tid = setTimeout(function() {
					_this._expandToLevel(found, level-1, sync, stack);
					clearTimeout(tid);
				}, _this.expandTimeout);
			}
		} else {
			//dojo.debug("NOT FOUND");
		}
		
		
	

		this.expand(nodeA[0].children[nodeA[1]], sync, this, handler);

		//dojo.profile.stop("_expandToLevel "+nodeA[0].children[ nodeA[1] ]);
		
		
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
