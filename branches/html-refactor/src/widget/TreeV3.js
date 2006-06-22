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
	
	this.tree = this;

}
dojo.inherits(dojo.widget.TreeV3, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.TreeV3, dojo.widget.TreeWithNode);

dojo.lang.extend(dojo.widget.TreeV3, {
	widgetType: "TreeV3",


	eventNamesDefault: {
		// new child does not get domNode filled in (only template draft)
		// until addChild->createDOMNode is called(program way) OR createDOMNode (html-way)
		// hook events to operate on new DOMNode, create dropTargets etc
		createNode: "createNode",
		// tree created.. Perform tree-wide actions if needed
		treeCreate: "treeCreate",
		treeDestroy: "treeDestroy",

		setFolder: "setFolder",
		unsetFolder: "unsetFolder",
		moveFrom: "moveFrom",
		moveTo: "moveTo",
		addChild: "addChild",
		detach: "detach",
		expand: "expand",
		
		collapse: "collapse"
	},

	
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
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/TreeV3.css"),

	templateString: '<div class="TreeContainer">\n</div>',

	isExpanded: true, // consider this "root node" to be always expanded

	isTree: true,
	
	objectId: "",

/* don't need to remember it. Just read at creation time and run bind() 
	controller: "",
	selector: "",
	menu: "", // autobind menu if menu's widgetId is set here
*/
	expandLevel: "", // expand to level automatically

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

	initializeController: function(controllerId) {		
		var controller = dojo.widget.byId(controllerId);
	
		controller.listenTree(this); // controller listens to my events
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

		if (this.DNDMode == "off") {
			this.DNDMode = 0;
		} else if (this.DNDMode == "between") {
			this.DNDMode = this.DNDModes.ONTO | this.DNDModes.BETWEEN;
		} else if (this.DNDMode == "onto") {
			this.DNDMode = this.DNDModes.ONTO;
		}

	},
	
	

	initialize: function(args, frag){
		
		this.adjustEventNames();
		this.uppercaseActionDisabled();
		this.adjustDNDMode();

		this.expandLevel = parseInt(this.expandLevel);

		//this.initializeSelector();
		//this.initializeController();
		//this.initializeMenu();

		this.containerNode = this.domNode;
		
		
		if (args['controller']) {
			this.initializeController(args['controller']);
		}
		

	},

	postCreate: function() {
						
		dojo.event.topic.publish(this.eventNames.treeCreate, { source: this } );
	},
	
	toString: function() {
		return "["+this.widgetType+" ID:"+this.widgetId	+"]"
	}



});



