
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

	
	flushLock: function() {
		this.lockLevel = 0;
		//this.unMarkLoading();
	},
	
	
	actionIsDisabled: function(action) {

		var disabled = false;

		if (dojo.lang.inArray(this.actionsDisabled, action)) {
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
	
	
	setChildren: function(childrenArray) {
		//dojo.profile.start("setChildren");
		if (!this.containerNode) {
			this.viewAddContainer();
		}
		
		if (this.isTreeNode && !this.isFolder) {
			//	dojo.debug("folder parent "+parent+ " isfolder "+parent.isFolder);
			this.setFolder();
			this.state = this.loadStates.LOADED;
		}
		
		this.children = childrenArray;
			
		for(var i=0; i<childrenArray.length; i++) {
			var child = childrenArray[i]
			child.parent = this;
			if (this.tree !== child.tree) {				
				child.updateTree(this.tree);
			}
			
			child.viewAddLayout();
			this.containerNode.appendChild(child.domNode);
					
			var message = {
				child: child,
				index: i,
				parent: this
			}
			
			dojo.event.topic.publish(this.tree.eventNames.addChild, message);
		
		}
		//dojo.profile.end("setChildren");
		
	},	
	
		
	addChild: function(child, index) {
		if (dojo.lang.isUndefined(index)) {
			index = this.children.length;
		}
		
		//dojo.debug("doAddChild "+index+" called for "+child+" children "+this.children);
				
		if (!child.isTreeNode){
			dojo.raise("You can only add TreeNode widgets to a "+this.widgetType+" widget!");
			return;
		}
			
		this.children.splice(index, 0, child);
		child.parent = this;
				
		child.addedTo(this, index);
		
		// taken from DomWidget.registerChild
		// delete from widget list that are notified on resize etc (no parent)
		delete dojo.widget.manager.topWidgets[child.widgetId];
				
	}
	
	
	
	
}
