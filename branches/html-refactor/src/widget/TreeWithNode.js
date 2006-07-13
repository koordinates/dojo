
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
	
	
	expandLevel: "", // expand to level automatically
		
	

	isLocked: function() {
		var node = this;
		while (true) {
			if (node.lockLevel) {
				return true;
			}
			if (node.isTree) {
				break;
			}
			if (!node.parent) {
				dojo.raise("Tried to check isLocked at parent, but no parent");
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
		
	
	/**
	 * childrenArray is array of Widgets or array of Objects
	 * widgets may be both attached and detached
	 *
	 * Use Cases
	 * 1) lots of widgets are packed and passed in.
	 *  - widgets are created
	 *  - widgets have no parent (detached or not attached yet)
	 *
	 * 2) array of widgets and data objects passed in with flag makeWidgetsFromChildren
	 *  - some widgets are not created
	 *  - all objects have no parent
	 *
	 * 3) expand is called with makeWidgetsFromChildren=true
	 *  - some objects need to be turned into widgets
	 *  - some widgets have parent (e.g markup), some widgets and objects do not
	 */
	setChildren: function(childrenArray) {
		//dojo.profile.start("setChildren");
		
		if (this.isTreeNode && !this.isFolder) {
			//	dojo.debug("folder parent "+parent+ " isfolder "+parent.isFolder);
			this.setFolder();
			this.state = this.loadStates.LOADED;
		}
		
		this.children = childrenArray;
			
		for(var i=0; i<this.children.length; i++) {
			var child = this.children[i]
			
			if (!(child instanceof dojo.widget.Widget)) {
				if (child instanceof Array) {
					// arguments for createWidget
					child = this.children[i] = dojo.widget.createWidget(child, {}, this);
				} else {
					child = this.children[i] = dojo.widget.TreeNodeV3.prototype.createSimple(child, this);					
				}
				//child = this.children[i] = dojo.widget.createWidget("TreeNodeV3", child);
				
				//dojo.debugShallow(child)
				
				//dojo.debug("setChildren creates node "+child);
			}
			
			child.parent = this;
			if (this.tree !== child.tree) {				
				child.updateTree(this.tree);
			}
			
			//dojo.debug("Add layout for "+child);
			child.viewAddLayout();
			this.containerNode.appendChild(child.domNode);
					
				var message = {
					child: child,
					index: i,
					parent: this
				}
			
				// just in case..			
				delete dojo.widget.manager.topWidgets[child.widgetId];
		
				dojo.event.topic.publish(this.tree.eventNames.addChild, message);
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
