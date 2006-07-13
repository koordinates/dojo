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


	icons: {
		expandOpen: dojo.uri.dojoUri("src/widget/templates/images/TreeV3/expand_minus.gif"),
		expandClosed: dojo.uri.dojoUri("src/widget/templates/images/TreeV3/expand_plus.gif"),
		expandLeaf: dojo.uri.dojoUri("src/widget/templates/images/TreeV3/expand_leaf.gif")
	},		

	
	addEmphase: function() {		
		this.tree.emphasedNodes[this.widgetId] = true;
		this.viewAddEmphase();
	},

	viewAddEmphase: function() {
		//dojo.debug(this.labelNode)
		dojo.html.addClass(this.labelNode, 'TreeNodeEmphased');
	},

	removeEmphase: function() {
		delete this.tree.emphasedNodes[this.widgetId];
		this.viewRemoveEmphase();
	},
	
	viewRemoveEmphase: function() {
		//dojo.debug('unmark')
		dojo.html.removeClass(this.labelNode, 'TreeNodeEmphased');
	},

	expandChildrenChecked: false,

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
	
	/**
	 * override for speed 
	 
	postInitialize: function(args, frag, parentComp){
		var sourceNodeRef = this.getFragNodeRef(frag);
		
		var oldNode = sourceNodeRef.parentNode.replaceChild(this.domNode, sourceNodeRef);
		if (!parentComp) {
			dojo.debug(this);
		}
		parentComp.registerChild(this, args.dojoinsertionindex);
			
		dojo.widget.getParser().createSubComponents(frag, this);
	},*/ 
		
	
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
	
	object: {},

	title: "",
	
	isFolder: null, // set by widget depending on children/args

	contentNode: null, // the item label
	
	expandClass: "",


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
		//dojo.debug("SetFolder in "+this);
		this.isFolder = true;
		this.viewSetExpand();
		this.viewAddContainer(); // all folders have container.		
		dojo.event.topic.publish(this.tree.eventNames.setFolder, { source: this });
	},
	
	
	
	initialize: function(args, frag, parent) {
		
		dojo.profile.start("initialize");
		
		// set tree from args or from parent
		//dojo.debug("initialize in "+this);
		if (args.tree) {
			this.tree = dojo.lang.isString(args.tree) ? dojo.widget.manager.getWidgetById(args.tree) : args.tree;			
		} else if (parent.tree) {
			this.tree = parent.tree;
		} 
		
		if (!this.tree) {
			dojo.raise("Can't evaluate tree from arguments or parent");
		}
				
		
		if (this.children.length || args.isFolder) {
			//dojo.debug("children found");
			//dojo.debug(this.children);
			//dojo.debug("isFolder "+args.isFolder);
			
			// viewSetExpand for Folder is set here also
			this.setFolder();			
		} else {			
			this.viewSetExpand();
		}
		
		dojo.event.topic.publish(this.tree.eventNames.treeChange, {oldTree:null, newTree:this.tree, node:this} );
		
		
		dojo.profile.end("initialize");
		
		//dojo.debug("initialize out "+this);
		//dojo.debug(this+" parent "+parent);
	},
		
	unsetFolder: function() {
		this.isFolder = false;
		this.viewSetExpand();
		dojo.event.topic.publish(this.tree.eventNames.unsetFolder, { source: this });
	},
	
	
	insertNode: function(parent, index) {
		
		if (!index) index = 0;
		//dojo.debug("insertNode "+this+" parent "+parent+" before "+index);
		
		if (index==0) {
			dojo.dom.prependChild(this.domNode, parent.containerNode);
		} else {
			dojo.dom.insertAfter(this.domNode, parent.children[index-1].domNode);
		}
	},
	
	updateTree: function(newTree) {

		if (this.tree === newTree) {
			return;
		}
		
		var oldTree = this.tree;
		
		var message = {oldTree:oldTree, newTree:newTree, node:this}
		
		dojo.event.topic.publish(this.tree.eventNames.treeChange, message );		
		dojo.event.topic.publish(newTree.eventNames.treeChange, message );
		
		
		dojo.lang.forEach(this.getDescendants(),
			function(elem) {			
				elem.tree = newTree;			
		});
		
		for (var emphasedNodeId in oldTree.emphasedNodes) {
			delete oldTree.emphasedNodes[emphasedNodeId];
			newTree.emphasedNodes[emphasedNodeId] = true;
		}
				
	},
	
	
	/**
	 * called every time the widget is added with createWidget or created wia markup
	 * from addChild -> registerChild or from postInitialize->registerChild
	 * not called in batch procession
	 * HTML & widget.createWidget only
	 * Layout MUST be removed when node is detached
	 * 
	 */
	addedTo: function(parent, index) {
		//dojo.profile.start("addedTo");
		//dojo.debug(this + " addedTo "+parent+" index "+index);
		//dojo.debug(parent.children);
		//dojo.debug(parent.containerNode.innerHTML);
		
		//dojo.debug((new Error()).stack);
					
				
		/*if (!this.tree) {
			dojo.debug("NEVER HAPPENS?");
			// special case, happens in markup only
			this.tree = parent.tree;
		} else*/
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
		
		var siblingsCount = parent.children.length;
		
		// setFolder works BEFORE insertNode
		this.insertNode(parent, index);
		
		
		this.viewAddLayout();
	
		
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
	 * Fast program-only hacky creation of widget
	 * 	
	 */
	createSimple: function(args, parent) {
		// I pass no args and ignore default controller
		//dojo.profile.start(this.widgetType+" createSimple");
		//dojo.profile.start(this.widgetType+" createSimple constructor");
		var treeNode = new (dojo.widget[this.widgetType])();
		//dojo.profile.end(this.widgetType+" createSimple constructor");
		
		//dojo.profile.start(this.widgetType+" createSimple mixin");		
		for(var x in args){ // fastMixIn			
			treeNode[x] = args[x];
		}
		
		
		//dojo.profile.end(this.widgetType+" createSimple mixin");
		
				
		// HtmlWidget.postMixIn 
		treeNode.toggleObj = dojo.lfx.toggle[treeNode.toggle.toLowerCase()] || dojo.lfx.toggle.plain;

		//dojo.profile.start(this.widgetType + " manager");
		dojo.widget.manager.add(treeNode);
		//dojo.profile.end(this.widgetType + " manager");
		
		//dojo.profile.start(this.widgetType + " buildRendering");
		treeNode.buildRendering();		
		//dojo.profile.end(this.widgetType + " buildRendering");
		
		treeNode.initialize(args, {}, parent);
		
		//dojo.profile.end(this.widgetType+"createSimple");
		
		return treeNode;
	},
	
	
	
	// can override e.g for case of div with +- text inside
	viewUpdateLayout: function() {
		//dojo.profile.start("viewUpdateLayout");
		//dojo.debug("UpdateLayout in "+this);

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
		//dojo.debug("viewAddLayout in "+this);
		
		if (this.parent["isTree"]) {
			//dojo.debug("Parent isTree => add isTreeRoot");
			
			// use setClass, not addClass for speed
			dojo.html.setClass(this.domNode, dojo.html.getClass(this.domNode) + ' isTreeRoot')
		}
		//dojo.debug(this.parent.children.length);
		//dojo.debug(this.parent.children[this.parent.children.length-1]);
		if (this.isLastNode()) {
			//dojo.debug("Checked last node for "+this);
			//dojo.debug("Parent last is "+this.parent.children[this.parent.children.length-1]);
			//dojo.debug("last node => add isTreeLast for "+this);
			dojo.html.setClass(this.domNode, dojo.html.getClass(this.domNode) + ' isTreeLast')			
		}
		//dojo.profile.end("viewAddLayout");
		//dojo.debug("viewAddLayout out");
		
	},
	
	
	viewRemoveLayout: function() {		
		//dojo.debug("viewRemoveLayout in "+this);
		//dojo.profile.start("viewRemoveLayout");
		//dojo.debug((new Error()).stack);
		dojo.html.removeClass(this.domNode, "TreeRoot");
		dojo.html.removeClass(this.domNode, "isTreeLast");
		//dojo.profile.end("viewRemoveLayout");
	},
		
		
	viewSetExpand: function() {
		//dojo.profile.start("viewSetExpand");
		
		//dojo.debug("viewSetExpand in "+this);
		
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
		//dojo.debug("doDetach in "+this+" parent "+this.parent+" class "+dojo.html.getClass(this.domNode));
		
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
		
		/**
		 * Send event before actual work, because handlers may want to use parent etc
		 */
		var message = {oldTree:this.tree, newTree:null, node:this}		
		
		dojo.event.topic.publish(this.tree.eventNames.treeChange, message );
				
		// clean emphasedNodes with current parent
		for (var emphasedNodeId in this.tree.emphasedNodes) {
			var node = dojo.widget.manager.getWidgetById(emphasedNodeId);
			while (node.isTreeNode) {
				if (node === this) {
					delete oldTree.emphasedNodes[emphasedNodeId];
					break;
				}
				node = node.parent;
			}		
		}
		
		this.doDetach();			
				
		return dojo.widget.HtmlWidget.prototype.destroy.apply(this, arguments);
	},
	
	
	expand: function(){
		if (this.isExpanded) return;

		//dojo.debug("expand in "+this);
		
		if (!this.expandChildrenChecked) {
			this.setChildren(this.children);
			this.expandChildrenChecked = true;
		}
		
		// no matter if I have children or not. need to show/hide container anyway.
		// e.g empty folder is expanded => then child is added
		this.showChildren();
		

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
	},
	
	toString: function() {
		return '[TreeNodeV3, '+this.title+']';
	}


});