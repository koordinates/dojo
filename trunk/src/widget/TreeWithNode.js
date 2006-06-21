
dojo.provide("dojo.widget.TreeWithNode");


dojo.widget.TreeWithNode = {
	
	// I need this to parse children
	isContainer: true,
	
	lockLevel: 0, // lock ++ unlock --, so nested locking works fine
	
	lock: function() {
		//!this.lockLevel && this.markLoading();
		this.lockLevel++;
	},
	unlock: function() {
		if (!this.lockLevel) {
			dojo.raise("unlock: not locked");
		}
		this.lockLevel--;
		//!this.lockLevel && this.unMarkLoading();
	},

	isLocked: function() {
		var node = this;
		while (true) {
			if (node.lockLevel) {
				return true;
			}
			if (node.isTree) {
				break;
			}
			node = node.parent;
		}

		return false;
	},


	uppercaseActionDisabled: function() {		
		for(var i=0; i<this.actionsDisabled.length; i++) {
			this.actionsDisabled[i] = this.actionsDisabled[i].toUpperCase();
		}
	},
	
	
	flushLock: function() {
		this.lockLevel = 0;
		//this.unMarkLoading();
	},
	
	
	actionIsDisabled: function(action) {
		var _this = this;

		var disabled = false;

		if (dojo.lang.inArray(_this.actionsDisabled, action)) {
			disabled = true;
		}

		if (this.isLocked()) {
			disabled = true;
		}
		
		
		if (this.isTreeNode) {
			if (!this.tree.allowAddChildToLeaf && action == this.actions.ADDCHILD && !this.isFolder) {
				disabled = true;
			}
		}

		return disabled;
	},
	
	
	
	addChild: function(child, index) {


		var message = {
			child: child,
			index: index,
			parent: this
		}

		this.doAddChild.apply(this, arguments);

		dojo.event.topic.publish(this.tree.eventNames.addChild, message);
	},
	
	doAddChild: function(child, index) {
		if (dojo.lang.isUndefined(index)) {
			index = this.children.length;
		}
		
		//dojo.debug("doAddChild "+index+" called for "+child);
				
		if (!child.isTreeNode){
			dojo.raise("You can only add TreeNode widgets to a "+this.widgetType+" widget!");
			return;
		}
			
		this.children.splice(index, 0, child);
		child.parent = this;
		
		child.addedTo(this, index);
		
		// taken from DomWidget.registerChild 
		delete dojo.widget.manager.topWidgets[child.widgetId];
				
	},
	
	
	/**
	 * Move child to newParent as last child
	 * redraw tree and update icons.
	 *
	 * Called by target, saves source in event.
	 * events are published for BOTH trees AFTER update.
	*/
	move: function(child, newParent, index) {

		//dojo.debug(child+" "+newParent+" at "+index);

		var oldParent = child.parent;
		var oldTree = child.tree;

		this.doMove.apply(this, arguments);

		var newParent = child.parent;
		var newTree = child.tree;

		var message = {
				oldParent: oldParent, oldTree: oldTree,
				newParent: newParent, newTree: newTree,
				child: child
		};

		/* publish events here about structural changes for both source and target trees */
		dojo.event.topic.publish(oldTree.eventNames.moveFrom, message);
		dojo.event.topic.publish(newTree.eventNames.moveTo, message);

	},


	/* do actual parent change here. Write remove child first */
	doMove: function(child, newParent, index) {
		//var parent = child.parent;
		child.parent.doRemoveNode(child);

		newParent.doAddChild(child, index);
	},

	
	
}
