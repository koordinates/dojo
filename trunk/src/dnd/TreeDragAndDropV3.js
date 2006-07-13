/**
 * TreeDrag* specialized on managing subtree drags
 * It selects nodes and visualises what's going on,
 * but delegates real actions upon tree to the controller
 *
 * This code is considered a part of controller
*/

dojo.provide("dojo.dnd.TreeDragAndDropV3");
dojo.provide("dojo.dnd.TreeDragSourceV3");
dojo.provide("dojo.dnd.TreeDropTargetV3");

dojo.require("dojo.dnd.HtmlDragAndDrop");
dojo.require("dojo.lang.func");
dojo.require("dojo.lang.array");
dojo.require("dojo.lang.extras");
dojo.require("dojo.html");

dojo.dnd.TreeDragSourceV3 = function(node, syncController, type, treeNode){
	this.controller = syncController;
	this.treeNode = treeNode;

	dojo.dnd.HtmlDragSource.call(this, node, type);
}

dojo.inherits(dojo.dnd.TreeDragSourceV3, dojo.dnd.HtmlDragSource);

dojo.lang.extend(dojo.dnd.TreeDragSourceV3, {
	onDragStart: function(){
		/* extend adds functions to prototype */
		var dragObject = dojo.dnd.HtmlDragSource.prototype.onDragStart.call(this);
		//dojo.debugShallow(dragObject)

		dragObject.treeNode = this.treeNode;

		dragObject.onDragStart = function(e) {

				
			var result = dojo.dnd.HtmlDragObject.prototype.onDragStart.apply(this, arguments);


			/* remove background grid from cloned object 
			var cloneGrid = this.dragClone.getElementsByTagName('img');
			for(var i=0; i<cloneGrid.length; i++) {
				cloneGrid.item(i).style.backgroundImage='url()';
			}
			*/
			
			return result;


		}

		dragObject.onDragEnd = function(e) {
						
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

dojo.dnd.TreeDropTargetV3 = function(domNode, controller, type, treeNode){

	this.treeNode = treeNode;
	this.controller = controller; // I will sync-ly process drops
	
	dojo.dnd.HtmlDropTarget.call(this, domNode, type);
}

dojo.inherits(dojo.dnd.TreeDropTargetV3, dojo.dnd.HtmlDropTarget);

dojo.lang.extend(dojo.dnd.TreeDropTargetV3, {

	autoExpandDelay: 1500,
	autoExpandTimer: null,


	position: null,

	indicatorStyle: "2px black solid",

	showIndicator: function(position) {

		// do not change style too often, cause of blinking possible
		if (this.position == position) {
			return;
		}

		//dojo.debug(position)

		this.hideIndicator();

		this.position = position;
		
		var node = this.treeNode;
			
			
		node.contentNode.style.width = dojo.style.getInnerWidth(node.labelNode)+ "px";

		if (position == "onto") {			
			node.contentNode.style.border = this.indicatorStyle;
		} else {
			// FIXME: bottom-top or highlight should cover ONLY top/bottom or div itself,
			// not span whole line (try DND)
			// FAILURE: Can't put span inside div: multiline bottom-top will span multiple lines
			if (position == "before") {
				node.contentNode.style.borderTop = this.indicatorStyle;
			} else if (position == "after") {
				node.contentNode.style.borderBottom = this.indicatorStyle;
			}									
		}  
	},

	hideIndicator: function() {
		this.treeNode.contentNode.style.borderBottom="";
		this.treeNode.contentNode.style.borderTop="";
		this.treeNode.contentNode.style.border = "";
		this.treeNode.contentNode.style.width=""
		this.position = null;
	},



	// is the target possibly ok ?
	// This function is run on dragOver, but drop possibility is also determined by position over node
	// that's why acceptsWithPosition is called
	// doesnt take index into account ( can change while moving mouse w/o changing target )
	/**
	 * Coarse (tree-level) access check.
	 * We can't determine real accepts status w/o position
	*/
	onDragOver: function(e){
		//dojo.debug("onDragOver for "+e);

		var accepts = dojo.dnd.HtmlDropTarget.prototype.onDragOver.apply(this, arguments);

		//dojo.debug("TreeDropTarget.onDragOver accepts:"+accepts)

		if (accepts && this.treeNode.isFolder && !this.treeNode.isExpanded) {
			this.setAutoExpandTimer();
		}

		return accepts;
	},

	/* Parent.onDragOver calls this function to get accepts status */
	accepts: function(dragObjects) {

		var accepts = dojo.dnd.HtmlDropTarget.prototype.accepts.apply(this, arguments);

		if (!accepts) return false;

		var sourceTreeNode = dragObjects[0].treeNode;

		if (dojo.lang.isUndefined(sourceTreeNode) || !sourceTreeNode || !sourceTreeNode.isTreeNode) {
			dojo.raise("Source is not TreeNode or not found");
		}

		if (sourceTreeNode === this.treeNode) return false;

		return true;
	},



	setAutoExpandTimer: function() {
		// set up autoexpand timer
		var _this = this;

		var autoExpand = function () {
			if (dojo.dnd.dragManager.currentDropTarget === _this) {
				_this.controller.expand(_this.treeNode);
			}
		}

		this.autoExpandTimer = dojo.lang.setTimeout(autoExpand, _this.autoExpandDelay);
	},

		

	getAcceptPosition: function(e, sourceTreeNode) {

		var DNDMode = this.treeNode.tree.DNDMode;

		if (DNDMode & dojo.widget.TreeV3.prototype.DNDModes.ONTO &&
			// check if ONTO is allowed localy
			!(
			  !this.treeNode.actionIsDisabled(dojo.widget.TreeNodeV3.prototype.actions.ADDCHILD) // check dynamically cause may change w/o regeneration of dropTarget
			  && sourceTreeNode.parent !== this.treeNode
			  && this.controller.canMove(sourceTreeNode, this.treeNode)
			 )
		) {
			// disable ONTO if can't move
			DNDMode &= ~dojo.widget.TreeV3.prototype.DNDModes.ONTO;
		}


		var position = this.getPosition(e, DNDMode);

		//dojo.debug(DNDMode & +" : "+position);


		// if onto is here => it was allowed before, no accept check is needed
		if (position=="onto" ||
			(!this.isAdjacentNode(sourceTreeNode, position)
			 && this.controller.canMove(sourceTreeNode, this.treeNode.parent)
			)
		) {
			return position;
		} else {
			return false;
		}

	},

	onDragOut: function(e) {
		this.clearAutoExpandTimer();

		this.hideIndicator();
	},


	clearAutoExpandTimer: function() {
		if (this.autoExpandTimer) {
			clearTimeout(this.autoExpandTimer);
			this.autoExpandTimer = null;
		}
	},



	onDragMove: function(e, dragObjects){

		var sourceTreeNode = dragObjects[0].treeNode;

		var position = this.getAcceptPosition(e, sourceTreeNode);

		if (position) {
			this.showIndicator(position);
		}

	},

	isAdjacentNode: function(sourceNode, position) {

		if (sourceNode === this.treeNode) return true;
		if (sourceNode.getNextSibling() === this.treeNode && position=="before") return true;
		if (sourceNode.getPreviousSibling() === this.treeNode && position=="after") return true;

		return false;
	},


	/* get DNDMode and see which position e fits */
	getPosition: function(e, DNDMode) {
		node = dojo.byId(this.treeNode.contentNode);
		var mousey = e.pageY || e.clientY + dojo.body().scrollTop;
		var nodey = dojo.html.getAbsoluteY(node);
		var height = dojo.html.getInnerHeight(node);

		var relY = mousey - nodey;
		var p = relY / height;

		var position = ""; // "" <=> forbidden
		if (DNDMode & dojo.widget.TreeV3.prototype.DNDModes.ONTO
		  && DNDMode & dojo.widget.TreeV3.prototype.DNDModes.BETWEEN) {
			//dojo.debug("BOTH");
			if (p<=0.3) {
				position = "before";
				// if children are expanded then I ignore understrike, cause it is confusing with firstChild
			} else if (p<=0.7 || this.treeNode.isExpanded && this.treeNode.children.length) {
				position = "onto";
			} else {
				position = "after";
			}
		} else if (DNDMode & dojo.widget.TreeV3.prototype.DNDModes.BETWEEN) {
			//dojo.debug("BETWEEN");
			if (p<=0.5 || this.treeNode.isExpanded && this.treeNode.children.length) {
				position = "before";
			} else {
				position = "after";
			}
		}
		else if (DNDMode & dojo.widget.TreeV3.prototype.DNDModes.ONTO) {
			//dojo.debug("ONTO");
			position = "onto";
		}

		dojo.debug(position);

		return position;
	},



	getTargetParentIndex: function(sourceTreeNode, position) {

		var index = position == "before" ? this.treeNode.getParentIndex() : this.treeNode.getParentIndex()+1;
		if (this.treeNode.parent === sourceTreeNode.parent
		  && this.treeNode.getParentIndex() > sourceTreeNode.getParentIndex()) {
		  	index--;  // dragging a node is different for simple move bacause of before-after issues
		}

		return index;
	},


	onDrop: function(e){
		// onDragOut will clean position


		var position = this.position;

//dojo.debug(position);

		this.onDragOut(e);

		var sourceTreeNode = e.dragObject.treeNode;

		if (!dojo.lang.isObject(sourceTreeNode)) {
			dojo.raise("TreeNode not found in dragObject")
		}

		if (position == "onto") {
			return this.controller.move(sourceTreeNode, this.treeNode, 0);
		} else {
			var index = this.getTargetParentIndex(sourceTreeNode, position);
			return this.controller.move(sourceTreeNode, this.treeNode.parent, index);
		}

		//dojo.debug('drop2');



	}


});



dojo.dnd.TreeDNDControllerV3 = function(treeController) {

	// I use this controller to perform actions
	this.treeController = treeController;

	this.dragSources = {};

	this.dropTargets = {};

}
