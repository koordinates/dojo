dojo.provide("dojo.widget.TreeNodeV3");

dojo.require("dojo.html.*");
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
    	DETACH: "DETACH",
    	EDIT: "EDIT",
    	ADDCHILD: "ADDCHILD"
	},


	lazyInitEnabled: true,


	expandChildrenChecked: false,

	expandNode: null,
	labelNode: null,
	
	
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
		
	nodeType: "Document",
	
	getNodeType: function() {
		if (this.isFolder) return "Folder";
		return this.nodeType;
	},
	
	
	// fast buildRendering 	
	buildRendering: function(args, fragment, parent) {
		
		
		if (args.tree) {
			this.tree = dojo.lang.isString(args.tree) ? dojo.widget.manager.getWidgetById(args.tree) : args.tree;			
		} else if (parent && parent.tree) {
			this.tree = parent.tree;
		} 
		
		if (!this.tree) {
			dojo.raise("Can't evaluate tree from arguments or parent");
		}
		
		
		//dojo.profile.start("buildRendering - cloneNode");
		
		this.domNode = this.tree.nodeTemplate.cloneNode(true);
		this.expandNode = this.domNode.firstChild;
        this.contentNode = this.domNode.childNodes[1];
        this.labelNode = this.contentNode.firstChild;

		/*
		this.domNode = this.tree.nodeTemplate.cloneNode(false);
		this.expandNode = this.tree.expandNodeTemplate.cloneNode(false);
		this.labelNode = this.tree.labelNodeTemplate.cloneNode(false);
		this.contentNode = this.tree.contentNodeTemplate.cloneNode(false);
		
		this.domNode.appendChild(this.expandNode);
		this.domNode.appendChild(this.contentNode);
		this.contentNode.appendChild(this.labelNode);
		*/
		
		//dojo.profile.end("buildRendering - cloneNode");
		
		
		
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
		//dojo.debug("publish "+this.tree.eventNames.setFolder);
		dojo.event.topic.publish(this.tree.eventNames.setFolder, { source: this });
	},
	
	
	
	initialize: function(args, frag, parent) {
		
		//dojo.profile.start("initialize");
		
		// set tree from args or from parent
		//dojo.debug("initialize in "+this);
						
		
		if (this.children.length || args.isFolder) {
			//dojo.debug("children found");
			//dojo.debug(this.children);
			//dojo.debug("isFolder "+args.isFolder);
			
			// viewSetExpand for Folder is set here also
			this.setFolder();			
		} else {
			// set expandicon for leaf 	
			this.viewSetExpand();
		}
		
		//dojo.debug("publish "+this.tree.eventNames.treeChange);
		
		dojo.event.topic.publish(this.tree.eventNames.treeChange, {oldTree:null, newTree:this.tree, node:this} );
		
		
		//dojo.profile.end("initialize");
		
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
			dojo.html.prependChild(this.domNode, parent.containerNode);
		} else {
			dojo.html.insertAfter(this.domNode, parent.children[index-1].domNode);
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
		
		/**
		 * UNTESTED
		 * changes class prefix for all domnodes when moving between trees
		 */
		if (oldTree.classPrefix != newTree.classPrefix) {
			var stack = [this.domNode]
			var elem;
			var reg = new RegExp("(^|\\s)"+oldTree.classPrefix, "g");
			
			while (elem = stack.pop()) {
				for(i=0; i<elem.childNodes.length; i++) {
					var childNode = elem.childNodes[i]
					if (childNode.nodeType != 1) continue;
					// change prefix for classes
					dojo.html.setClass(childNode, dojo.html.getClass(childNode).replace(reg, '$1'+newTree.classPrefix));
					stack.push(childNode);
				}
			}
			
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
				//dojo.debug("folderize parent "+parent);
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
				if (parent.children[1] instanceof dojo.widget.Widget) {
					parent.children[1].viewUpdateLayout();
				}
			}
			if (index == siblingsCount-1) {
				if (parent.children[siblingsCount-2] instanceof dojo.widget.Widget) {
					parent.children[siblingsCount-2].viewUpdateLayout();
				}
			}
		} else if (parent.isTreeNode) {
			parent.viewSetHasChildren();
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
		treeNode.buildRendering(args, {}, parent);		
		//dojo.profile.end(this.widgetType + " buildRendering");
		
		treeNode.initialize(args, {}, parent);
		
		//dojo.profile.end(this.widgetType+"createSimple");
		
		delete dojo.widget.manager.topWidgets[treeNode.widgetId];
		
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
		this.containerNode = this.tree.containerNodeTemplate.cloneNode(true);
		this.domNode.appendChild(this.containerNode);
	},
	
	
	viewAddLayout: function() {
		//dojo.profile.start("viewAddLayout");
		//dojo.debug("viewAddLayout in "+this);
		
		if (this.parent["isTree"]) {
			//dojo.debug("Parent isTree => add isTreeRoot");
			
			// use setClass, not addClass for speed
			dojo.html.setClass(this.domNode, dojo.html.getClass(this.domNode) + ' '+this.tree.classPrefix+'IsRoot')
		}
		//dojo.debug(this.parent.children.length);
		//dojo.debug(this.parent.children[this.parent.children.length-1]);
		if (this.isLastNode()) {
			//dojo.debug("Checked last node for "+this);
			//dojo.debug("Parent last is "+this.parent.children[this.parent.children.length-1]);
			//dojo.debug("last node => add isTreeLast for "+this);
			dojo.html.setClass(this.domNode, dojo.html.getClass(this.domNode) + ' '+this.tree.classPrefix+'IsLast')			
		}
		//dojo.profile.end("viewAddLayout");
		//dojo.debug("viewAddLayout out");
		
	},
	
	
	viewRemoveLayout: function() {		
		//dojo.debug("viewRemoveLayout in "+this);
		//dojo.profile.start("viewRemoveLayout");
		//dojo.debug((new Error()).stack);
		dojo.html.removeClass(this.domNode, this.tree.classPrefix+"IsRoot");
		dojo.html.removeClass(this.domNode, this.tree.classPrefix+"IsLast");
		//dojo.profile.end("viewRemoveLayout");
	},
		
		
	viewSetExpand: function() {
		//dojo.profile.start("viewSetExpand");
		
		//dojo.debug("viewSetExpand in "+this);
		
		if (this.isFolder) {			
			var expand = this.isExpanded ? this.tree.classPrefix+"ExpandOpen" : this.tree.classPrefix+"ExpandClosed";
		} else {
			var expand = this.tree.classPrefix+"ExpandLeaf";
		}
		var reg = new RegExp("(^|\\s)"+this.tree.classPrefix+"Expand\\w+",'g');			
				
		dojo.html.setClass(this.domNode, dojo.html.getClass(this.domNode).replace(reg,'') + ' '+expand);
		//dojo.debug(dojo.html.getClass(this.domNode))
		//dojo.profile.end("viewSetExpand");
		
	},	
	
	viewSetHasChildren: function() {		
		//dojo.debug(this+' '+this.children.length)
		
		var clazz =  this.tree.classPrefix+'Children'+(this.children.length ? 'Yes' : 'No');

		var reg = new RegExp("(^|\\s)"+this.tree.classPrefix+"Children\\w+",'g');			
		
		dojo.html.setClass(this.domNode, dojo.html.getClass(this.domNode).replace(reg,'') + ' '+clazz);		
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
		} else {
			parent.viewSetHasChildren();
		}
		
		
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
				
	

		this.doDetach();			
				
		return dojo.widget.HtmlWidget.prototype.destroy.apply(this, arguments);
	},
	
	
	expand: function(){
		if (this.isExpanded) return;


		dojo.profile.start("expand");
		
		//dojo.debug("expand in "+this);
		
		dojo.profile.start("expand - lazy init");
		if (this.lazyInitEnabled && !this.expandChildrenChecked) {
			this.setChildren(this.children);
			this.expandChildrenChecked = true;
		}
		
		dojo.profile.end("expand - lazy init");
		
		// no matter if I have children or not. need to show/hide container anyway.
		// e.g empty folder is expanded => then child is added
		
		dojo.profile.start("expand - showChildren");
		
		this.showChildren();
		
		dojo.profile.end("expand - showChildren");
		

		this.isExpanded = true;


		dojo.profile.start("expand - viewSetExpand");
		
		this.viewSetExpand();
		
		dojo.profile.end("expand - viewSetExpand");

		dojo.profile.start("expand - event");

		dojo.event.topic.publish(this.tree.eventNames.expand, {source: this} );
		
		dojo.profile.end("expand - event");
		
		dojo.profile.end("expand");
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
		// FIXME: resize event here, DnD should catch it
		if(dojo.exists(dojo, 'dnd.dragManager.dragObjects') && dojo.dnd.dragManager.dragObjects.length) {
			dojo.dnd.dragManager.cacheTargetLocations();
		}
	},

	showChildren: function(){
		
		dojo.profile.start("Toggler show");
		
		this.tree.toggleObj.show(
			this.containerNode, this.toggleDuration, this.explodeSrc
		);
		
		dojo.profile.end("Toggler show");

		
		if(dojo.exists(dojo, 'dnd.dragManager.dragObjects') && dojo.dnd.dragManager.dragObjects.length) {
			dojo.dnd.dragManager.cacheTargetLocations();
		}
	},
	
	toString: function() {
		return '[TreeNodeV3, '+this.title+']';
	}


});
