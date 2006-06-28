
dojo.provide("dojo.widget.TreeNodeV3");

dojo.require("dojo.event.*");
dojo.require("dojo.io.*");

// make it a tag
dojo.widget.tags.addParseTreeHandler("dojo:TreeNodeV3");


// # //////////

dojo.widget.TreeNodeV3 = function() {
	if (arguments.length) dojo.widget.HtmlWidget.call(this);

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

	icons: {
		expandOpen: dojo.uri.dojoUri("src/widget/templates/images/TreeV3/expand_minus.gif"),
		expandClosed: dojo.uri.dojoUri("src/widget/templates/images/TreeV3/expand_plus.gif"),
		expandLeaf: dojo.uri.dojoUri("src/widget/templates/images/TreeV3/expand_leaf.gif")
	},		

	viewAddEmphase: function() {
		//dojo.debug(this.labelNode)
		dojo.html.addClass(this.labelNode, 'TreeNodeEmphased');
	},


	viewRemoveEmphase: function() {
		//dojo.debug('unmark')
		dojo.html.removeClass(this.labelNode, 'TreeNodeEmphased');
	},


	expandNode: null,
	labelNode: null,

	// expandNode has +- CSS background. Not img.src for performance, background src string resides in single place.
	// selection in KHTML/Mozilla disabled treewide, IE requires unselectable for every node
	// you can add unselectable if you want both in postCreate of tree and in this template

	// create new template and put into prototype
	nodeTemplate: function() {
		var domNode = document.createElement("div");
		dojo.html.setClass(domNode, "TreeNode");
		
		var expandNode = document.createElement("img");
		dojo.html.setClass(expandNode, "TreeExpand");
		
		// need <span> inside <div>
		// div for multiline support, span for styling exactly the text, not whole line
		var labelNode = document.createElement("span");
		
		var contentNode = document.createElement("div");
		dojo.html.setClass(contentNode, "TreeContent");
		
		domNode.appendChild(expandNode);
		domNode.appendChild(contentNode);
		contentNode.appendChild(labelNode);
		
		return domNode;
	}(),
	
	
	// fast buildRendering 	
	buildRendering: function() {
		//dojo.profile.start("buildRendering - cloneNode");
		this.domNode = this.nodeTemplate.cloneNode(true);
		//dojo.profile.end("buildRendering - cloneNode");
		this.expandNode = this.domNode.firstChild;		
		this.contentNode = this.domNode.childNodes[1];
		this.labelNode = this.contentNode.firstChild;
		
		this.domNode.widgetId = this.widgetId;
		
		//dojo.profile.start("buildRendering - innerHTML");
		this.labelNode.innerHTML = this.title;
		//dojo.profile.end("buildRendering - innerHTML");
		
	},
	

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
			dojo.html.setClass(div, "TreeContainer");
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
	
	setFolder: function() {
		this.isFolder = true;
		this.viewSetExpand();
		dojo.event.topic.publish(this.tree.eventNames.setFolder, { source: this });
	},
	
	
		
	unsetFolder: function() {
		this.isFolder = false;
		this.viewSetExpand();
		dojo.event.topic.publish(this.tree.eventNames.unsetFolder, { source: this });
	},
	
	
	insertNode: function(parent, index) {
		if (!parent.containerNode) {
			parent.viewAddContainer();
		}
		if (!index) index = 0;
		//dojo.debug("insertNode "+this+" before "+index);
		
		if (index==0) {
			dojo.dom.prependChild(this.domNode, parent.containerNode);
		} else {
			dojo.dom.insertAfter(this.domNode, parent.children[index-1].domNode);
		}
	},
	
	updateTree: function(newTree) {
		if (this.tree !== newTree) {
			var message = {oldTree:this.tree, newTree:newTree, node:this}
			dojo.event.topic.publish(this.tree.eventNames.treeChange, message );		
			dojo.event.topic.publish(newTree.eventNames.treeChange, message );
			dojo.lang.forEach(this.getDescendants(), function(elem) { elem.tree = newTree; });
		}	
	},
	
	
	/**
	 * called every time the widget is added with createWidget,
	 * not called in batch procession
	 * HTML & widget.createWidget only
	 * Layout MUST be removed when node is detached
	 */
	addedTo: function(parent, index) {
		//dojo.profile.start("addedTo");
		//dojo.debug(this + " addedTo "+parent+" index "+index);
		//dojo.debug(parent.children);
		//dojo.debug(parent.containerNode.innerHTML);
		
		//dojo.debug((new Error()).stack);
		
		this.insertNode(parent, index);
				
		if (this.tree !== parent.tree) {
			this.updateTree(parent.tree);
		}
		
		if (parent.isTreeNode) {
			if (!parent.isFolder) {
				//	dojo.debug("folder parent "+parent+ " isfolder "+parent.isFolder);
				parent.setFolder();
				parent.state = parent.loadStates.LOADED;
			}
		}
		
		//dojo.debug("update this");
		this.viewAddLayout();
	
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
		

		var message = {
			child: this,
			index: index,
			parent: parent
		}
		
		dojo.event.topic.publish(this.tree.eventNames.addChild, message);

		//dojo.profile.end("addedTo");
		
				
	},
	
	/**
	 * Fast program-only creation of widget
	 * 	
	 */
	createSimple: function(args) {
		// I pass no args and ignore default controller
		//dojo.profile.start(this.widgetType+" createSimple");
		//dojo.profile.start(this.widgetType+" createSimple constructor");
		var treeNode = new (dojo.widget[this.widgetType])();
		//dojo.profile.end(this.widgetType+" createSimple constructor");
		
		if (!args["tree"]) {
			dojo.raise("Tree should be passed in arguments");
		}
		
		//dojo.profile.start(this.widgetType+" createSimple mixin");		
		for(var x in args){ // fastMixIn			
			treeNode[x] = args[x];
		}
		//dojo.profile.end(this.widgetType+" createSimple mixin");
		
				
		/* HtmlWidget.postMixIn */
		treeNode.toggleObj = dojo.lfx.toggle[treeNode.toggle.toLowerCase()] || dojo.lfx.toggle.plain;

		//dojo.profile.start(this.widgetType + " manager");
		dojo.widget.manager.add(treeNode);
		//dojo.profile.end(this.widgetType + " manager");
		
		//dojo.profile.start(this.widgetType + " buildRendering");
		treeNode.buildRendering();		
		//dojo.profile.end(this.widgetType + " buildRendering");
		
		/* piece from postCreate that we should do */
		//dojo.profile.start(this.widgetType + " expand");
		treeNode.viewSetExpand();
		//dojo.profile.end(this.widgetType + " expand");
		
		if (treeNode.isFolder) {
			dojo.event.topic.publish(treeNode.tree.eventNames.setFolder, { source: treeNode });
		}
		
		
		dojo.event.topic.publish(treeNode.tree.eventNames.createNode, { source: treeNode } );		
		
		//dojo.profile.end(this.widgetType+" createSimple");
		
		return treeNode;
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
		
		this.viewSetExpand();
		
		if (this.isFolder && !this.children.length) {
			/* controller listens for folders to add events, but setFolder is only called
			  in HTML/program when children exist */			  
			dojo.event.topic.publish(this.tree.eventNames.setFolder, { source: this });
		}
		
		dojo.event.topic.publish(this.tree.eventNames.createNode, { source: this } );			
		
		//dojo.debug("postcreate " + this.title);
	},
	
	
	
	// can override e.g for case of div with +- text inside
	viewUpdateLayout: function() {
		//dojo.profile.start("viewUpdateLayout");
		this.viewRemoveLayout();
		this.viewAddLayout();
		//dojo.profile.end("viewUpdateLayout");	
	},
	
	viewAddContainer: function() {
		// make controller only if children exist
		this.containerNode = this.containerNodeTemplate.cloneNode(true);
		this.domNode.appendChild(this.containerNode);
	},
	
	viewAddLayout: function() {
		//dojo.profile.start("viewAddLayout");
		//dojo.debug("viewAddLayout in");
		if (this.parent["isTree"]) {
			//dojo.debug("Parent isTree => add isTreeRoot");
			
			// use setClass, not addClass for speed
			dojo.html.setClass(this.domNode, dojo.html.getClass(this.domNode) + ' isTreeRoot')
		}
		//dojo.debug(this.parent.children.length);
		if (this.isLastNode()) {
			//dojo.debug("Checked last node for "+this);
			//dojo.debug("Parent last is "+this.parent.children[this.parent.children.length-1]);
			//dojo.debug("last node => add isTreeLast");
			dojo.html.setClass(this.domNode, dojo.html.getClass(this.domNode) + ' isTreeLast')			
		}
		//dojo.profile.end("viewAddLayout");
		//dojo.debug("viewAddLayout out");
		
	},
	
	
	viewRemoveLayout: function() {		
		//dojo.profile.start("viewRemoveLayout");
		//dojo.debug((new Error()).stack);
		dojo.html.removeClass(this.domNode, "TreeRoot");
		dojo.html.removeClass(this.domNode, "isTreeLast");
		//dojo.profile.end("viewRemoveLayout");
	},
		
		
	viewSetExpand: function() {
		//dojo.profile.start("viewSetExpand");
		
		if (this.isFolder) {			
			var expand = this.isExpanded ? "expandOpen" : "expandClosed";
		} else {
			var expand = "expandLeaf";
		}
		this.expandNode.src = this.icons[expand];
		//dojo.profile.end("viewSetExpand");
		
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
		
		dojo.event.topic.publish(this.tree.eventNames.treeDetach, {tree:this.tree});
		
	},

	/* node does not leave tree */
	doDetach: function() {
		var parent = this.parent;
		
		if (!parent) return;
		
		var index = this.getParentIndex();
		
		
		this.viewRemoveLayout();
		
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
		
		this.parent = null;
	},
	
	
	/**
	 * publish destruction event so that controller may unregister/unlisten
	 */
	destroy: function() {
		dojo.event.topic.publish(this.tree.eventNames.nodeDestroy, { source: this } );

		return dojo.widget.HtmlWidget.prototype.destroy.apply(this, arguments);
	},
	
	expand: function(){
		if (this.isExpanded) return;

		if (this.children.length) {
			this.showChildren();
		}

		this.isExpanded = true;

		this.viewSetExpand();

		dojo.event.topic.publish(this.tree.eventNames.expand, {source: this} );
	},

	collapse: function(){
		if (!this.isExpanded) return;

		if (this.children.length) {
			this.hideChildren();
		}
		
		this.isExpanded = false;

		this.viewSetExpand();

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



