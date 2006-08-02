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
	 * then after Rpc call it becomes LOADING and, finally LOADED
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


	tryLazyInit: true,



	expandNode: null,
	labelNode: null,
		
		
	nodeType: "Document",
	
	getNodeType: function() {
		if (this.isFolder) return "Folder";
		return this.nodeType;
	},
	
	cloneProperties: ["actionsDisabled","tryLazyInit","nodeType","objectId","object",
		   "title","isFolder","isExpanded","state"],
	
	
	/**
	 * copy cloneProperties with recursion into them
	 * contains "copy constructor"
	 */
	clone: function(deep) {
		var ret = new this.constructor();
		
		//dojo.debug("start cloning props "+this);
		
		for(var i=0; i<this.cloneProperties.length; i++) {
			var prop = this.cloneProperties[i];
			//dojo.debug("cloning "+prop+ ":" +this[prop]);
			ret[prop] = dojo.lang.shallowCopy(this[prop], true);			
		}
		
		if (this.tree.unsetFolderOnEmpty && !deep && this.isFolder) {
			ret.isFolder = false;
		}
		
		//dojo.debug("cloned props "+this);
		
		ret.toggleObj = this.toggleObj;
		
		dojo.widget.manager.add(ret);
		
		ret.tree = this.tree;
		ret.buildRendering({},{});
		ret.initialize({},{});
				
		if (deep && this.children.length) {
			//dojo.debug("deeper copy start");
			for(var i=0; i<this.children.length; i++) {
				var child = this.children[i];
				//dojo.debug("copy child "+child);
				if (child.clone) {
					ret.children.push(child.clone(deep));
				} else {
					ret.children.push(dojo.lang.shallowCopy(child, deep));
				}
			}
			//dojo.debug("deeper copy end");
			ret.setChildren(ret.children);
		}
		
		
				
		return ret;
	},
			
	markProcessing: function() {		
		dojo.html.addClass(this.expandNode, this.tree.classPrefix+'ExpandLoading');		
	},
	
	unmarkProcessing: function() {
		dojo.html.removeClass(this.expandNode, this.tree.classPrefix+'ExpandLoading');		
	},
	
	
	/**
	 * get information from args & parent, then build rendering
	 */
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
		if (!this.containerNode) { // maybe this node was unfolderized and still has container
			this.viewAddContainer(); // all folders have container.
		}
		//dojo.debug("publish "+this.tree.eventNames.setFolder);
		dojo.event.topic.publish(this.tree.eventNames.afterSetFolder, { source: this });
	},
	
	
	
	initialize: function(args, frag, parent) {
		
		//dojo.profile.start("initialize");
		
		/**
		 * first we populate current widget from args,
		 * then use its data to initialize
		 * args may be empty, all data inside widget for copy constructor
		 */
		if (args.isFolder) {
			this.isFolder = true;
		}
		
		if (this.children.length || this.isFolder) {
			//dojo.debug("children found");
			//dojo.debug(this.children);
			//dojo.debug("isFolder "+args.isFolder);
			
			// viewSetExpand for Folder is set here also
			this.setFolder();			
		} else {
			// set expandicon for leaf 	
			this.viewSetExpand();
		}
		
		//dojo.debug("publish "+this.tree.eventNames.changeTree);
		
		dojo.event.topic.publish(this.tree.eventNames.afterChangeTree, {oldTree:null, newTree:this.tree, node:this} );
		
		
		//dojo.profile.end("initialize");
		
		//dojo.debug("initialize out "+this);
		//dojo.debug(this+" parent "+parent);
	},
		
	unsetFolder: function() {
		this.isFolder = false;
		this.viewSetExpand();		
		dojo.event.topic.publish(this.tree.eventNames.afterUnsetFolder, { source: this });
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
				for(var i=0; i<elem.childNodes.length; i++) {
					var childNode = elem.childNodes[i]
					if (childNode.nodeType != 1) continue;
					// change prefix for classes
					dojo.html.setClass(childNode, dojo.html.getClass(childNode).replace(reg, '$1'+newTree.classPrefix));
					stack.push(childNode);
				}
			}
			
		}
		
		var message = {oldTree:oldTree, newTree:newTree, node:this}
		
		dojo.event.topic.publish(this.tree.eventNames.afterChangeTree, message );		
		dojo.event.topic.publish(newTree.eventNames.afterChangeTree, message );
			
				
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
			if (index == 0 && parent.children[1] instanceof dojo.widget.Widget) {
				parent.children[1].viewUpdateLayout();				
			}
			if (index == siblingsCount-1 && parent.children[siblingsCount-2] instanceof dojo.widget.Widget) {
				parent.children[siblingsCount-2].viewUpdateLayout();			
			}
		} else if (parent.isTreeNode) {
			// added as the first child
			//dojo.debug("added as first");
			parent.viewSetHasChildren();
		}
		
		

		var message = {
			child: this,
			index: index,
			parent: parent
		}
		
		
		dojo.event.topic.publish(this.tree.eventNames.afterAddChild, message);

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
		var treeNode = new parent.tree.defaultChildWidget(); 
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
		if (treeNode.parent) {
			delete dojo.widget.manager.topWidgets[treeNode.widgetId];
		}
		
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
	/*
	viewRemoveContainer: function() {
		// make controller only if children exist
		this.domNode.removeChild(this.containerNode);
		this.containerNode = null;
	},
	*/
	
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

		var oldParent = this.parent;

		this.doDetach.apply(this, arguments);

		dojo.event.topic.publish(this.tree.eventNames.afterDetach,
			{ child: this, tree: this.tree, parent: oldParent }
		);
		
	},
	

	/* node does not leave tree */
	doDetach: function() {
		//dojo.debug("doDetach in "+this+" parent "+this.parent+" class "+dojo.html.getClass(this.domNode));
				
		var parent = this.parent;
		
		//dojo.debug(parent.containerNode.style.display)
		
		if (!parent) return;
		
		var index = this.getParentIndex();
		
		
		this.viewRemoveLayout();
		
		dojo.widget.DomWidget.prototype.removeChild.call(parent, this);
		
		var siblingsCount = parent.children.length;
		
		//dojo.debug("siblingsCount "+siblingsCount);
		
		if (siblingsCount > 0) {
			if (index == 0) {	// deleted first node => update new first
				parent.children[0].viewUpdateLayout();		
			}
			if (index == siblingsCount) { // deleted last node
				parent.children[siblingsCount-1].viewUpdateLayout();		
			}
		} else {
			if (parent.isTreeNode) {
				parent.viewSetHasChildren();
			}
		}
				
		if (this.tree.unsetFolderOnEmpty && !parent.children.length && parent.isTreeNode) {
			parent.unsetFolder();
		}		
		
		//dojo.debug(parent.containerNode.style.display)
		
		this.parent = null;
	},
	
	
	/**
	 * publish destruction event so that controller may unregister/unlisten
	 */
	destroy: function() {
		
		this.detach();
		
		dojo.event.topic.publish(this.tree.eventNames.beforeDestroy, { source: this } );

		return dojo.widget.HtmlWidget.prototype.destroy.apply(this, arguments);
	},
	
	
	expand: function(){
		if (this.isExpanded) return;


		dojo.profile.start("expand "+this);
		
		//dojo.debug("expand in "+this);
		
		dojo.profile.start("expand - lazy init "+this);
		if (this.tryLazyInit) {
			this.setChildren(this.children);
			this.tryLazyInit = false;
		}
		
		dojo.profile.end("expand - lazy init "+this);
		
		
		this.isExpanded = true;

		this.viewSetExpand();

		dojo.profile.start("expand - showChildren "+this);
		
		/**
		 * no matter if I have children or not. need to show/hide container anyway.
		 * use case: empty folder is expanded => then child is added, container already shown all fine
		 */
		this.showChildren();
		
		dojo.profile.end("expand - showChildren "+this);
		
		
		//dojo.profile.start("expand - viewSetExpand "+this);
				
		//dojo.profile.end("expand - viewSetExpand "+this);

		//dojo.profile.start("expand - event "+this);

		
		//dojo.profile.end("expand - event "+this);
		
		dojo.profile.end("expand "+this);
	},


	collapse: function(){
		if (!this.isExpanded) return;

		this.isExpanded = false;
		
		if (this.children.length) {			
			this.hideChildren();
		}
			
		
	},

	hideChildren: function(){
		this.tree.toggleObj.hide(
			this.containerNode, this.toggleDuration, this.explodeSrc, dojo.lang.hitch(this, "onHideChildren")
		);

		// if dnd is in action, recalculate changed coordinates
		// FIXME: resize event here, DnD should catch it
		if(dojo.exists(dojo, 'dnd.dragManager.dragObjects') && dojo.dnd.dragManager.dragObjects.length) {
			// SLOW !!!
			dojo.dnd.dragManager.cacheTargetLocations();
		}
	},

	showChildren: function(){
		
		//dojo.profile.start("Toggler show");
		
		this.tree.toggleObj.show(
			this.containerNode, this.toggleDuration, this.explodeSrc, dojo.lang.hitch(this, "onShowChildren")
		);
		
		//dojo.profile.end("Toggler show");

		
		if(dojo.exists(dojo, 'dnd.dragManager.dragObjects') && dojo.dnd.dragManager.dragObjects.length) {
			// SLOW !!!
			dojo.dnd.dragManager.cacheTargetLocations();
		}
	},
	
	onShowChildren: function() {		
		dojo.event.topic.publish(this.tree.eventNames.afterExpand, {source: this} );		
	},
	
	onHideChildren: function() {
		this.viewSetExpand();
		dojo.event.topic.publish(this.tree.eventNames.afterCollapse, {source: this} );
	},

	/* Edit current node : change properties and update contents */
	setTitle: function(title) {
		this.labelNode.innerHTML = this.title = title;
				
		dojo.event.topic.publish(this.tree.eventNames.afterSetTitle, { source: this, title:title });

	},

	toString: function() {
		return '['+this.widgetType+', '+this.title+']';
	}



});
