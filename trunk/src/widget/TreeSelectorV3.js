
dojo.provide("dojo.widget.TreeSelectorV3");

dojo.require("dojo.widget.HtmlWidget");


dojo.widget.tags.addParseTreeHandler("dojo:TreeSelectorV3");


dojo.widget.TreeSelectorV3 = function() {
	dojo.widget.HtmlWidget.call(this);

	this.eventNames = {};

	this.listenedTrees = [];

}

dojo.inherits(dojo.widget.TreeSelectorV3, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.TreeSelectorV3, dojo.widget.TreeCommon.prototype);

dojo.lang.extend(dojo.widget.TreeSelectorV3, {
	widgetType: "TreeSelectorV3",
	selectedNode: null,

	listenTreeEvents: ["addChild","collapse","treeChange", "detach", "treeDestroy"],
	
	
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
		
		// TODO: cancel/restore selection on dnd eventsd
		if (args['dndcontroller']) {
			dojo.widget.manager.getWidgetById(args['dndcontroller']).listenTree(this)
		}

	},


	listenNode: function(node) {
		dojo.event.connect(node.labelNode, "onclick", this, "onLabelClick");
		dojo.event.connect(node.labelNode, "ondblclick", this, "onLabelDblClick");
	},
	
	unlistenNode: function(node) {
		dojo.event.disconnect(node.labelNode, "onclick", this, "onLabelClick");
		dojo.event.disconnect(node.labelNode, "ondblclick", this, "onLabelDblClick");
	},


	onAddChild: function(message) {
		this.listenNode(message.source);
	},
	

	onTreeDestroy: function(message) {
		this.unlistenTree(message.source);
	},


	// deselect node if ancestor is collapsed
	onCollapse: function(message) {
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
		

		
	onLabelClick: function(event) {		
		var node = this.domElement2TreeNode(event.target);

		if (this.selectedNode === node) {
			if(event.ctrlKey || event.shiftKey || event.metaKey){
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
	
			
	onTreeChange: function(message) {
		
		
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

	onDetach: function(message) {
		if (this.selectedNode) {
			this.deselectIfAncestorMatch(message.child);
		}
		
	},

	select: function(node){

		node.viewAddEmphase();

		this.selectedNode = node;
		
		dojo.event.topic.publish(this.eventNames.select, {node: node} );
	},

	deselect: function(){

		var node = this.selectedNode;

		this.selectedNode = null;
		node.viewRemoveEmphase();
		dojo.event.topic.publish(this.eventNames.deselect, {node: node} );

	}

});



