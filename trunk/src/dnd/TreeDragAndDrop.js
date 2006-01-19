/**
 * TreeDrag* specialized on managing subtree drags
 * It selects nodes and visualises what's going on,
 * but delegates real actions upon tree to the controller
 *
 * This code is considered a part of controller
*/

dojo.provide("dojo.dnd.TreeDragAndDrop");
dojo.provide("dojo.dnd.TreeDragSource");
dojo.provide("dojo.dnd.TreeDropTarget");

dojo.require("dojo.dnd.HtmlDragAndDrop");

dojo.dnd.TreeDragSource = function(node, syncController, type, treeNode){
	this.controller = syncController;
	this.treeNode = treeNode;

	dojo.dnd.HtmlDragSource.call(this, node, type);
}

dojo.inherits(dojo.dnd.TreeDragSource, dojo.dnd.HtmlDragSource);

dojo.lang.extend(dojo.dnd.TreeDragSource, {
	onDragStart: function(){
		/* extend adds functions to prototype */
		var dragObject = dojo.dnd.HtmlDragSource.prototype.onDragStart.call(this);
		//dojo.debugShallow(dragObject)

		dragObject.treeNode = this.treeNode;

		dragObject.onDragStart = dojo.lang.hitch(dragObject, function(e) {

			/* save selection */
			this.savedSelectedNode = this.treeNode.tree.selector.selectedNode;
			if (this.savedSelectedNode) {
				this.savedSelectedNode.unMarkSelected();
			}

			var result = dojo.dnd.HtmlDragObject.prototype.onDragStart.apply(this, arguments);

			/* remove background grid from cloned object */
			dojo.lang.forEach(
				this.dragClone.getElementsByTagName('img'),
				function(elem) { elem.style.backgroundImage='' }
			);

			return result;


		});

		dragObject.onDragEnd = function(e) {

			/* restore selection */
			if (this.savedSelectedNode) {
				this.savedSelectedNode.markSelected();
			}
			//dojo.debug(e.dragStatus);

			return dojo.dnd.HtmlDragObject.prototype.onDragEnd.apply(this, arguments);
		}
		//dojo.debug(dragObject.domNode.outerHTML)


		return dragObject;
	},

	onDragEnd: function(e){


		 var res = dojo.dnd.HtmlDragSource.prototype.onDragEnd.call(this, e);


		 return res;
	}
});

// .......................................

dojo.dnd.TreeDropTarget = function(node, syncController, type, treeNode){

	this.treeNode = treeNode;
	this.controller = syncController; // I will sync-ly process drops

	dojo.dnd.HtmlDropTarget.apply(this, [node, type]);

}

dojo.inherits(dojo.dnd.TreeDropTarget, dojo.dnd.HtmlDropTarget);

dojo.lang.extend(dojo.dnd.TreeDropTarget, {

	/**
	 * Check if I can drop sourceTreeNode here
	 * only tree node targets are implemented ATM
	*/
	onDragOver: function(e){

		var sourceTreeNode = e.dragObjects[0].treeNode;


		if (dojo.lang.isUndefined(sourceTreeNode) || !sourceTreeNode || !sourceTreeNode.isTreeNode) {
			dojo.raise("Source is not of EditorTreeNode widgetType or not found");
		}
		//dojo.debug("This " + this.treeNode.title)
		//dojo.debug("Source " + sourceTreeNode);

		// check types compat
		var acceptable = dojo.dnd.HtmlDropTarget.prototype.onDragOver.apply(this, arguments);

		//dojo.debug("Check1 "+acceptable)


		if (!acceptable) return false;

		// can't drop parent to child etc
		acceptable = this.controller.canChangeParent(sourceTreeNode, this.treeNode, 0);


		//dojo.debug("Check2 "+acceptable)

		if (!acceptable) return false;


		// mark current node being dragged into
		if (sourceTreeNode !== this.treeNode) {
			this.treeNode.markSelected();
		}

		return true;

	},

	onDragMove: function(e, dragObjects){
	},

	onDragOut: function(e) {

		this.treeNode.unMarkSelected();

		//return dojo.dnd.HtmlDropTarget.prototype.onDragOut.call(this, e);
	},

	onDrop: function(e){
		this.onDragOut(e);

		//dojo.debug('drop');

		var targetTreeNode = this.treeNode;


		if (!dojo.lang.isObject(targetTreeNode)) {
			dojo.raise("Wrong DropTarget engaged");
		}

		var sourceTreeNode = e.dragObject.treeNode;

		if (!dojo.lang.isObject(sourceTreeNode)) {
			return false;
		}

		// can't drag to same parent in onto mode
		if (sourceTreeNode.parent === targetTreeNode) {
			return false;
		}
		// I don't check that trees are same! Target/source system deals with it

		//tree.changeParentRemote(sourceTreeNode, targetTreeNode);
		return this.controller.processDrop(sourceTreeNode, targetTreeNode, 0);

	}
});


// .......................................

dojo.dnd.TreeDropBetweenTarget = function(node, syncController, type, treeNode){

	this.treeNode = treeNode;
	this.controller = syncController; // I will sync-ly process drops

	dojo.dnd.HtmlDropTarget.apply(this, [node, type]);

}



dojo.inherits(dojo.dnd.TreeDropBetweenTarget, dojo.dnd.HtmlDropTarget);

dojo.lang.extend(dojo.dnd.TreeDropBetweenTarget, {

	indicatorPosition: null,

	indicatorStyle: "2px black solid",
	indicatorVisible: false,
	autoExpandDelay: 1500,

	showIndicator: function(position) {

		// do not change style too often, cause of blinking possible
		if (this.indicatorPosition == position && this.indicatorVisible) {
			return;
		}

		//dojo.debug(position)

		this.hideIndicator();

		this.indicatorPosition = position;
		this.indicatorVisible = true;

		if (position == "before") {
			this.treeNode.labelNode.style.borderTop = this.indicatorStyle;
		} else if (position == "after") {
			this.treeNode.labelNode.style.borderBottom = this.indicatorStyle;
		}


	},

	hideIndicator: function() {
		this.indicatorVisible = false;
		this.treeNode.labelNode.style.borderBottom="";
		this.treeNode.labelNode.style.borderTop="";
	},

	/**
	 * Check if I can drop sourceTreeNode here
	 * only tree node targets are implemented ATM
	 *
	 * returns true for nodes different from current node even if they are siblings.
	*/
	onDragOver: function(e){

		var sourceTreeNode = e.dragObjects[0].treeNode;

		if (dojo.lang.isUndefined(sourceTreeNode) || !sourceTreeNode || !sourceTreeNode.isTreeNode) {
			dojo.raise("Source is not of EditorTreeNode widgetType or not found");
		}

		if (sourceTreeNode === this.treeNode) return false;



		//dojo.debug("This " + this.treeNode)
		//dojo.debug("Source " + sourceTreeNode);
		//dojo.debug("Accepted types "+ this.acceptedTypes)

		// check types compat
		var acceptable = dojo.dnd.HtmlDropTarget.prototype.onDragOver.apply(this, arguments);

		//dojo.debug("Check1 "+acceptable)

		if (!acceptable) return false;

		// can't drop parent to child etc
		acceptable = this.controller.canChangeParent(sourceTreeNode, this.treeNode.parent, this.treeNode.getParentIndex());


		//dojo.debug("Check2 "+acceptable)

		if (!acceptable) return false;

		// set up autoexpand timer

		var _this = this;
		var autoExpand = function () {
			if (dojo.dnd.dragManager.currentDropTarget === _this) {
				_this.controller.expand(_this.treeNode);
			}
		}

		if (this.treeNode.isFolder && !this.treeNode.isExpanded) {
			dojo.lang.setTimeout(autoExpand, _this.autoExpandDelay);
		}


		return true;

	},

	isAdjacentNode: function(sourceNode, position) {


		if (sourceNode === this.treeNode) return true;
		if (sourceNode.getNextSibling() === this.treeNode && position=="before") return true;
		if (sourceNode.getPreviousSibling() === this.treeNode && position=="after") return true;

		return false;
	},

	onDragMove: function(e, dragObjects){

		//dojo.debugShallow(dragObjects);

		var sourceTreeNode = dragObjects[0].treeNode;

		if (dojo.html.gravity(this.treeNode.labelNode, e) & dojo.html.gravity.NORTH) {
			var position = "before";
		} else {
			var position = "after";
		}

		if (!this.isAdjacentNode(sourceTreeNode, position)) {
			this.showIndicator(position);
		}

	},

	onDragOut: function(e) {
		//dojo.debug("Out");

		this.hideIndicator();

		//return dojo.dnd.HtmlDropTarget.prototype.onDragOut.call(this, e);
	},


	onDrop: function(e){
		this.onDragOut(e);

		//dojo.debug('drop');

		var targetTreeNode = this.treeNode;


		if (!dojo.lang.isObject(targetTreeNode)) {
			dojo.raise("Wrong DropTarget engaged");
		}

		var sourceTreeNode = e.dragObject.treeNode;

		if (!dojo.lang.isObject(sourceTreeNode)) {
			return false;
		}

		if (this.isAdjacentNode(sourceTreeNode, this.indicatorPosition)) {
			return false;
		}

		// I don't check that trees are same! Target/source system deals with it

		//tree.changeParentRemote(sourceTreeNode, targetTreeNode);
		var index = this.indicatorPosition == "before" ? targetTreeNode.getParentIndex() : targetTreeNode.getParentIndex()+1;
		if (targetTreeNode.parent === sourceTreeNode.parent
		  && targetTreeNode.getParentIndex() > sourceTreeNode.getParentIndex()) {
		  	index--;  // dragging a node is different for simple changeParent bacause of before-after issues
		}

		return this.controller.processDrop(sourceTreeNode, targetTreeNode.parent, index);

	},

	toString: function() {
		return "[TreeDropBetweenTarget "+this.treeNode+"]";
	}
});
