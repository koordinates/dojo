/**
 * Tree model does all the drawing, visual node management etc.
 * Throws events about clicks on it, so someone may catch them and process
 * Tree knows nothing about DnD stuff, covered in TreeDragAndDrop and (if enabled) attached by controller
*/

/**
 * TODO: use domNode.cloneNode instead of createElement for grid
 * Should be faster (lyxsus)
 */
dojo.provide("dojo.widget.TreeV3");


dojo.require("dojo.widget.TreeWithNode");
dojo.require("dojo.event.*");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.TreeNodeV3");



// make it a tag
dojo.widget.tags.addParseTreeHandler("dojo:TreeV3");


dojo.widget.TreeV3 = function() {
	dojo.widget.HtmlWidget.call(this);

	this.eventNames = {};
	
	this.DNDAcceptTypes = [];
	this.actionsDisabled = [];
	
	this.beforeInitialize = [];
	
	this.tree = this;

}
dojo.inherits(dojo.widget.TreeV3, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.TreeV3, dojo.widget.TreeWithNode);

dojo.lang.extend(dojo.widget.TreeV3, {
	widgetType: "TreeV3",

	DNDMode: "",

	eventNamesDefault: {

		// tree created.. Perform tree-wide actions if needed
		treeCreate: "treeCreate",
		treeDestroy: "treeDestroy",
		treeChange: "treeChange",

		setFolder: "setFolder",
		unsetFolder: "unsetFolder",
		moveFrom: "moveFrom",
		moveTo: "moveTo",
		addChild: "addChild",
		detach: "detach",
		expand: "expand",
		
		collapse: "collapse"
	},

	classPrefix: "Tree",
	
	/**
	 * is it possible to add a new child to leaf ?
	 */	
	allowAddChildToLeaf: true,
	
	/**
	 * when last children is removed from node should it stop being a "folder" ?
	 */
	unsetFolderOnEmpty: true,

	DNDModes: {
		BETWEEN: 1,
		ONTO: 2
	},

	DNDAcceptTypes: "",

    // will have cssRoot before it 
	//templateCssPath: dojo.uri.dojoUri("src/widget/templates/TreeV3.css"),

	templateString: '<div>\n</div>',

	isExpanded: true, // consider this "root node" to be always expanded

	isTree: true,
	
	objectId: "",


	// expandNode has +- CSS background. Not img.src for performance, background src string resides in single place.
	// selection in KHTML/Mozilla disabled treewide, IE requires unselectable for every node
	// you can add unselectable if you want both in postCreate of tree and in this template

	// create new template and put into prototype
	makeNodeTemplate: function() {
		
		var domNode = document.createElement("div");
		dojo.html.setClass(domNode, this.classPrefix+"Node "+this.classPrefix+"ExpandLeaf "+this.classPrefix+"ChildrenNo");
		
		var expandNode = document.createElement("div");
		dojo.html.setClass(expandNode, this.classPrefix+"Expand");
		expandNode.setAttribute("template", "expandNode");
		
		// need <span> inside <div>
		// div for multiline support, span for styling exactly the text, not whole line
		var labelNode = document.createElement("span");
		labelNode.setAttribute("template", "labelNode");
		
		var contentNode = document.createElement("div");
		dojo.html.setClass(contentNode, this.classPrefix+"Content");
		contentNode.setAttribute("template", "contentNode");
		
		domNode.appendChild(expandNode);
		domNode.appendChild(contentNode);
		contentNode.appendChild(labelNode);
		
		this.nodeTemplate = domNode;
		this.expandNodeTemplate = expandNode;
		this.contentNodeTemplate = contentNode;
		this.labelNodeTemplate = labelNode;
	},

	makeContainerNodeTemplate: function() {
		
		var div = document.createElement('div');
		div.style.display = 'none';			
		dojo.html.setClass(div, this.classPrefix+"Container");
		
		this.containerNodeTemplate = div;
		
	},


	//
	// these icons control the grid and expando buttons for the whole tree
	//

	icons: {
		expandLoading: dojo.uri.dojoUri("src/widget/templates/images/TreeV3/loading.gif")		
	},
		

	
	actions: {
    	ADDCHILD: "ADDCHILD"
	},


	getInfo: function() {
		var info = {
			widgetId: this.widgetId,
			objectId: this.objectId
		}

		return info;
	},

	adjustEventNames: function() {
		
		for(name in this.eventNamesDefault) {
			if (dojo.lang.isUndefined(this.eventNames[name])) {
				this.eventNames[name] = this.widgetId+"/"+this.eventNamesDefault[name];
			}
		}
	},

/*
	initializeSelector: function() {
		if (this.selector) {
			this.selector = dojo.widget.byId(this.selector);
			this.selector.listenTree(this);
		}
			
	},

	initializeMenu: function() {		
		if (this.menu) {
			this.menu = dojo.widget.byId(this.menu);
			this.menu.listenTree(this);
		}
	},
*/

	
	
	adjustDNDMode: function() {
		var _this = this;
		
		var DNDMode = 0;
		dojo.lang.forEach(this.DNDMode.split(';'),
			function(elem) {
				var mode = _this.DNDModes[dojo.string.trim(elem).toUpperCase()];
				if (mode) DNDMode = DNDMode | mode;
			}
		 );
	
		
		this.DNDMode = DNDMode;

	},
	
	/**
	 * publish destruction event so that any listeners should stop listening
	 */
	destroy: function() {
		dojo.event.topic.publish(this.tree.eventNames.treeDestroy, { source: this } );

		return dojo.widget.HtmlWidget.prototype.destroy.apply(this, arguments);
	},

	initialize: function(args){
		
		this.adjustEventNames();
		this.adjustDNDMode();

		this.makeNodeTemplate();
		this.makeContainerNodeTemplate();
		
		//this.initializeSelector();
		//this.initializeController();
		//this.initializeMenu();

		this.containerNode = this.domNode;
		
		dojo.html.setClass(this.domNode, this.classPrefix+"Container");
		
		var _this = this;
		
		//dojo.debug(this.beforeInitialize[1]);
		
		dojo.lang.forEach(this.beforeInitialize,
			function(elem) {
				var t = dojo.widget.manager.getWidgetById(elem);
				if (!t) {
					dojo.raise("No widget for "+elem);
				}
				t.listenTree(_this)
			}
		);		
		

	},

	postCreate: function() {						
		dojo.event.topic.publish(this.eventNames.treeCreate, { source: this } );
	},
	
	
	/**
	 * Move child to newParent as last child
	 * redraw tree and update icons.
	 *
	 * Called by target, saves source in event.
	 * events are published for BOTH trees AFTER update.
	*/
	move: function(child, newParent, index) {
		
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
		//dojo.debug("MOVE "+child+" to "+newParent+" at "+index);

		//var parent = child.parent;
		child.doDetach();

		newParent.addChild(child, index);
	},

	toString: function() {
		return "["+this.widgetType+" ID:"+this.widgetId	+"]"
	}



});



