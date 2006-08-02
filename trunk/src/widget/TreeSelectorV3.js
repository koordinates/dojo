
dojo.provide("dojo.widget.TreeSelectorV3");

dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.TreeCommon");


dojo.widget.tags.addParseTreeHandler("dojo:TreeSelectorV3");


dojo.widget.TreeSelectorV3 = function() {
	dojo.widget.HtmlWidget.call(this);

	this.eventNames = {};

	this.listenedTrees = [];
	this.selectedNodes = [];
		
}

dojo.inherits(dojo.widget.TreeSelectorV3, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.TreeSelectorV3, dojo.widget.TreeCommon.prototype);

// TODO: add multiselect
dojo.lang.extend(dojo.widget.TreeSelectorV3, {
	widgetType: "TreeSelectorV3",

	listenTreeEvents: ["afterAddChild","afterCollapse","afterTreeChange", "afterDetach", "beforeTreeDestroy"],
		
	selectedNode: null,
	
	allowMulti: true,
	
	eventNamesDefault: {
		select : "select",
		destroy : "destroy",
		deselect : "deselect",
		dblselect: "dblselect" // select already selected node.. Edit or whatever
	},

	initialize: function(args) {

		for(name in this.eventNamesDefault) {
			if (dojo.lang.isUndefined(this.eventNames[name])) {
				this.eventNames[name] = this.widgetId+"/"+this.eventNamesDefault[name];
			}
		}
		
		this.onLabelClickHandler =  dojo.lang.hitch(this, this.onLabelClick);
		this.onLabelDblClickHandler =  dojo.lang.hitch(this, this.onLabelDblClick);
	
		
	},


	listenNode: function(node) {
		//if (!node) dojo.debug((new Error()).stack)
		dojo.event.browser.addListener(node.labelNode, "onclick", this.onLabelClickHandler);
		dojo.event.browser.addListener(node.labelNode, "onclick", this.onLabelDblClickHandler);
		
		//dojo.event.connect(node.labelNode, "onclick", this, "onLabelClick");
		//dojo.event.connect(node.labelNode, "ondblclick", this, "onLabelDblClick");
	},
	
	unlistenNode: function(node) {
		dojo.event.browser.removeListener(node.labelNode, "onclick", this.onLabelClickHandler);
		dojo.event.browser.removeListener(node.labelNode, "onclick", this.onLabelDblClickHandler);
		//dojo.event.disconnect(node.labelNode, "onclick", this, "onLabelClick");
		//dojo.event.disconnect(node.labelNode, "ondblclick", this, "onLabelDblClick");
	},


	onAfterAddChild: function(message) {
		this.listenNode(message.child);
	},
	

	onBeforeTreeDestroy: function(message) {
		this.unlistenTree(message.source);
	},


	// deselect node if ancestor is collapsed
	onAfterCollapse: function(message) {
		if (!this.selectedNode) return;

		this.deselectIfAncestorMatch(message.source);		
	},


	onLabelDblClick: function(event) {
		var node = this.domElement2TreeNode(event.target);

		if (this.selectedNode !== node) {
			this.select(node);
		}
		
		dojo.event.topic.publish(this.eventNames.dblselect, { node: node });
	},		
		
	checkDeselectEvent: function(event) {
		return event.ctrlKey || event.shiftKey || event.metaKey;
	},
		
	onLabelClick: function(event) {		
		var node = this.domElement2TreeNode(event.target);

		if (this.selectedNode === node) {
			if(this.checkDeselectEvent(event)){
				// If the node is currently selected, and they select it again while holding
				// down a meta key, it deselects it
				this.deselect();
				return;
			}
			dojo.event.topic.publish(this.eventNames.dblselect, { node: node });
			return;
		}

		if (this.selectedNode) {
			this.deselect();
		}

		this.select(node);

	},

	deselectIfAncestorMatch: function(ancestor) {
		var node = this.selectedNode;
		
		/* pass if selectedNode is descendant of message.node */
		while (node.isTreeNode) {
			if (node === ancestor) {
				this.deselect(); 
				return;					
			}
			node = node.parent;			
		}
	},
	
			
	onAfterChangeTree: function(message) {
		
		
		if (!dojo.lang.inArray(this.listenedTrees, message.newTree)) {
			// moving from our trfee to new one
			
			if (this.selectedNode && message.node.children) {
				this.deselectIfAncestorMatch(message.node);
			}
			
			this.processDescendants(message.node, function(elem) { return elem instanceof dojo.widget.Widget}, this.unlistenNode);					
			
		}
		if (!dojo.lang.inArray(this.listenedTrees, message.oldTree)) {
			// moving from old tree to our tree
			this.processDescendants(message.node, function(elem) { return elem instanceof dojo.widget.Widget}, this.listenNode);			
		}
		
		
	},

	onAfterDetach: function(message) {
		if (this.selectedNode) {
			this.deselectIfAncestorMatch(message.child);
		}
		
	},

	select: function(node){

		this.selectedNode = node;
		
		dojo.event.topic.publish(this.eventNames.select, {node: node} );
	},

	deselect: function(){
		if (!this.selectedNode) {
			return;
		}
		
		var node = this.selectedNode;

		this.selectedNode = null;
		dojo.event.topic.publish(this.eventNames.deselect, {node: node} );

	}

});



