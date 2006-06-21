
dojo.provide("dojo.widget.TreeNodeV3");

dojo.require("dojo.event.*");
dojo.require("dojo.io.*");

// make it a tag
dojo.widget.tags.addParseTreeHandler("dojo:TreeNodeV3");


// # //////////

dojo.widget.TreeNodeV3 = function() {
	dojo.widget.HtmlWidget.call(this);

	this.actionsDisabled = [];
}

dojo.inherits(dojo.widget.TreeNodeV3, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.TreeNodeV3, dojo.widget.TreeWithNode);


dojo.lang.extend(dojo.widget.TreeNodeV3, {
	widgetType: "TreeNodeV3",

	/*
	 * dynamic loading-related stuff. 
	 * When an empty folder node appears, it is "UNCHECKED" first,
	 * then after RPC call it becomes LOADING and, finally LOADED
	 */
	loadStates: {
		UNCHECKED: "UNCHECKED",
    	LOADING: "LOADING",
    	LOADED: "LOADED"
	},

	/*
	 * Basic actions one can perform on nodes.
	 */
	actions: {
		MOVE: "MOVE",
    	REMOVE: "REMOVE",
    	EDIT: "EDIT",
    	ADDCHILD: "ADDCHILD"
	},

	expandNode: null,

	// expandNode has +- CSS background. Not img.src for performance, background src string resides in single place.
	// selection in KHTML/Mozilla disabled treewide, IE requires unselectable for every node
	// you can add unselectable if you want both in postCreate of tree and in this template
	//
	// FIXME: place hook on onContentClick event in selector when nodeCreate happens
	templateString: '<div class="TreeNode" widgetId="${this.widgetId}">'
	    + '<div class="TreeExpand" dojoAttachPoint="expandNode"></div>\n'
		+ '<div class="TreeContent" dojoAttachPoint="contentNode">${this.title}</div>\n' // can add more labels with hooks
		+ '</div>\n', 


	isTreeNode: true,

	objectId: "", // the widget represents an object

	title: "",
	
	isFolder: false,

	contentNode: null, // the item label
	
	expandLevel: "", // expand to level
	expandClass: "",

	tree: null,

	isExpanded: false,

	state: "UNCHECKED",  // after creation will change to loadStates: "loaded/loading/unchecked"

	containerNode: null,

	containerNodeTemplate: function() {
			var div = document.createElement('div');
			div.style.display = 'none';			
			dojo.html.addClass(div, "TreeContainer");
			return div;
		}(),

	getInfo: function() {
		// No title here (title may be widget)
		var info = {
			widgetId: this.widgetId,
			objectId: this.objectId,
			index: this.getParentIndex()			
		}

		return info;
	},

	initialize: function(args, frag){

		//dojo.debug("Init title "+this.title+ "ch len"+this.children.length);
		
		this.uppercaseActionDisabled();
		
		this.expandLevel = parseInt(this.expandLevel);
		
		//dojo.debug("initialize " + this.title);
		
		
	},

	
	setFolder: function() {
		this.isFolder = true;
		this.viewUpdateExpand();
		dojo.event.topic.publish(this.tree.eventNames.setFolder, { source: this });
	},
	
	
	
	unsetFolder: function() {
		this.isFolder = false;
		this.viewUpdateExpand();
		dojo.event.topic.publish(this.tree.eventNames.unsetFolder, { source: this });
	},
	
	
	insertNode: function(parent, index) {
		if (!parent.containerNode) {
			parent.viewAddContainer();
		}
		
		if (parent.children.length==1) {
			//dojo.debug("insertNode append to "+parent);
			parent.containerNode.appendChild(this.domNode);
		} else if (index==0) {
			//dojo.debug("insertNode "+this+" before "+parent.children[index]);
			dojo.dom.insertBefore(this.domNode, parent.children[0].domNode, true);
		} else {
			dojo.dom.insertAfter(this.domNode, parent.children[index-1].domNode, true);
		}
	},
	
	updateTree: function(parent) {
		if (this.tree !== parent.tree) {
			var myTree = parent.tree;
			dojo.lang.forEach(this.getDescendants(), function(elem) { elem.tree = myTree; });
		}
	},
				
	
	/**
	 * called every time the widget is added
	 * both HTML & program way
	 */
	addedTo: function(parent, index) {
		
		//dojo.debug(this + " addedTo "+parent+" index "+index);
		
		//dojo.debug(parent.containerNode.innerHTML);
		
		//dojo.debug((new Error()).stack);
		
		this.insertNode(parent, index);
		
		this.updateTree(parent);
		
		if (parent.isTreeNode) {
			if (!parent.isFolder) {
				//	dojo.debug("folder parent "+parent+ " isfolder "+parent.isFolder);
				parent.setFolder();
				parent.state = parent.loadStates.LOADED;
			}
		}
		
		//dojo.debug("update this");
		this.viewUpdateLayout();
	
		var siblingsCount = parent.children.length;
		
		//dojo.debug("siblings "+parent.children);
		
		if (siblingsCount > 1) {
			if (index == 0) {				
				parent.children[1].viewUpdateLayout();		
			}
			if (index == siblingsCount-1) {
				parent.children[siblingsCount-2].viewUpdateLayout();		
			}
		}
		
				
	},
	
	postCreate: function(args) {
		
		
		if (!args["tree"] && !this.parent["tree"]) {
			dojo.raise("Tree should be passed in arguments or be known to parent");
		}
				
		var tree;
		if (this.parent) {
			var tree = this.parent["tree"];
		}
		if (!tree) {
			tree = dojo.widget.manager.getWidgetById(args["tree"]);
		}
			
		if (!tree["isTree"]) {
			dojo.raise("Tree has no 'isTree' flag set");
		}
		
		this.tree = tree;
		
		this.viewAddExpand();
		
		dojo.event.topic.publish(this.tree.eventNames.createNode, { source: this } );			
		
		//dojo.debug("postcreate " + this.title);
	},
	
	
	// can override e.g for case of div with +- text inside
	viewUpdateExpand: function() {
		this.viewRemoveExpand();
		this.viewAddExpand();		
	},
	
	
	// can override e.g for case of div with +- text inside
	viewUpdateLayout: function() {
		this.viewRemoveLayout();
		this.viewAddLayout();		
	},
	
	viewAddContainer: function() {
		// make controller only if children exist
		this.containerNode = this.containerNodeTemplate.cloneNode(true);
		this.domNode.appendChild(this.containerNode);
	},
	
	viewAddLayout: function() {
		//dojo.debug("viewAddLayout in");
		if (this.parent["isTree"]) {
			//dojo.debug("Parent isTree => add isTreeRoot");
			dojo.html.addClass(this.domNode, "isTreeRoot");
		}
		//dojo.debug(this.parent.children.length);
		if (this.isLastNode()) {
			//dojo.debug("Checked last node for "+this);
			//dojo.debug("Parent last is "+this.parent.children[this.parent.children.length-1]);
			//dojo.debug("last node => add isTreeLast");
			dojo.html.addClass(this.domNode, "isTreeLast");			
		}
		//dojo.debug("viewAddLayout out");
		
	},
	
	
	viewRemoveLayout: function() {
		var _this = this;
		dojo.html.removeClass(_this.domNode, "TreeRoot");
		dojo.html.removeClass(_this.domNode, "isTreeLast");
	},
	
	viewRemoveExpand: function() {
		//dojo.debug("viewRemoveExpand "+this.expandClass);
		dojo.html.removeClass(this.expandNode, this.expandClass);
	},
	
		
	viewGetExpandClass: function() {
		
		if (this.isFolder) {			
			return this.isExpanded ? "TreeExpandOpen" : "TreeExpandClosed";
		} else {
			return "TreeExpandLeaf";
		}
	},
	
	viewAddExpand: function() {
		// add class for expandNode		
		this.expandClass = this.viewGetExpandClass();
		//dojo.debug("viewAddExpand "+this+" "+this.expandClass);
		dojo.html.addClass(this.expandNode, this.expandClass);
	},	
	
	
	
// ================================ detach from parent ===================================

	detach: function() {
		if (!this.parent) return;

		var oldTree = this.tree;
		var oldParent = this.parent;

		this.doDetach.apply(this, arguments);

		dojo.event.topic.publish(oldTree.eventNames.detach,
			{ child: this, tree: oldTree, parent: oldParent }
		);
	},


	doDetach: function() {
		var parent = this.parent;
		
		if (!parent) return;
		
		var index = this.getParentIndex();
		
		dojo.widget.DomWidget.prototype.removeChild.call(parent, this);
		
		var siblingsCount = parent.children.length;
		
		//dojo.debug("siblings "+parent.children);
		
		if (siblingsCount > 0) {
			if (index == 0) {	// deleted first node => update new first
				parent.children[0].viewUpdateLayout();		
			}
			if (index == siblingsCount) { // deleted last node
				parent.children[siblingsCount-1].viewUpdateLayout();		
			}
		}
		/*
		if (parent.children.length == 0) {
			parent.containerNode.style.display = "none";
		}
		*/
		
		// FIXME: move to extension
		if (this.tree.unsetFolderOnEmpty && !parent.children.length && parent.isTreeNode) {
			parent.unsetFolder();
		}

		this.parent = this.tree = null;
	},
	
	
	expand: function(){
		if (this.isExpanded) return;

		if (this.children.length) {
			this.showChildren();
		}

		this.isExpanded = true;

		this.viewUpdateExpand();

		dojo.event.topic.publish(this.tree.eventNames.expand, {source: this} );
	},

	collapse: function(){
		if (!this.isExpanded) return;

		this.hideChildren();
		this.isExpanded = false;

		this.viewUpdateExpand();

		dojo.event.topic.publish(this.tree.eventNames.collapse, {source: this} );
	},

	hideChildren: function(){
		this.tree.toggleObj.hide(
			this.containerNode, this.toggleDuration, this.explodeSrc, dojo.lang.hitch(this, "onHide")
		);

		// if dnd is in action, recalculate changed coordinates 
		if(dojo.exists(dojo, 'dnd.dragManager.dragObjects') && dojo.dnd.dragManager.dragObjects.length) {
			dojo.dnd.dragManager.cacheTargetLocations();
		}
	},

	showChildren: function(){
		this.tree.toggleObj.show(
			this.containerNode, this.toggleDuration, this.explodeSrc, dojo.lang.hitch(this, "onShow")
		);

		
		if(dojo.exists(dojo, 'dnd.dragManager.dragObjects') && dojo.dnd.dragManager.dragObjects.length) {
			dojo.dnd.dragManager.cacheTargetLocations();
		}
	}


});

 

