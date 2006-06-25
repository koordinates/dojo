
dojo.provide("dojo.widget.TreeSelectorV3");

dojo.require("dojo.widget.HtmlWidget");


dojo.widget.tags.addParseTreeHandler("dojo:TreeSelectorV3");


dojo.widget.TreeSelectorV3 = function() {
	dojo.widget.HtmlWidget.call(this);

	this.eventNames = {};

	this.listenedTrees = [];

}

dojo.inherits(dojo.widget.TreeSelectorV3, dojo.widget.HtmlWidget);


dojo.lang.extend(dojo.widget.TreeSelectorV3, {
	widgetType: "TreeSelectorV3",
	selectedNode: null,

	
	eventNamesDefault: {
		select : "select",
		destroy : "destroy",
		deselect : "deselect",
		dblselect: "dblselect" // select already selected node.. Edit or whatever
	},

	initialize: function() {

		for(name in this.eventNamesDefault) {
			if (dojo.lang.isUndefined(this.eventNames[name])) {
				this.eventNames[name] = this.widgetId+"/"+this.eventNamesDefault[name];
			}
		}

	},

	
	listenTree: function(tree) {
		dojo.event.topic.subscribe(tree.eventNames.createNode, this, "onCreateNode");		
		dojo.event.topic.subscribe(tree.eventNames.collapse, this, "onCollapse");
		dojo.event.topic.subscribe(tree.eventNames.moveFrom, this, "onMoveFrom");
		dojo.event.topic.subscribe(tree.eventNames.detach, this, "onDetach");
		dojo.event.topic.subscribe(tree.eventNames.treeDestroy, this, "onTreeDestroy");

		/* remember all my trees to deselect when element is movedFrom them */
		this.listenedTrees.push(tree);
	},


	unlistenTree: function(tree) {
		dojo.event.topic.unsubscribe(tree.eventNames.createNode, this, "onCreateNode");		
		dojo.event.topic.unsubscribe(tree.eventNames.collapse, this, "onCollapse");
		dojo.event.topic.unsubscribe(tree.eventNames.moveFrom, this, "onMoveFrom");
		dojo.event.topic.unsubscribe(tree.eventNames.detach, this, "onDetach");
		dojo.event.topic.unsubscribe(tree.eventNames.treeDestroy, this, "onTreeDestroy");


		for(var i=0; i<this.listenedTrees.length; i++){
           if(this.listenedTrees[i] === tree){
                   this.listenedTrees.splice(i, 1);
                   break;
           }
		}
	},

	onCreateNode: function(message) {
		dojo.event.connect(message.source.labelNode, "onclick", this, "onLabelClick");
	},

	onTreeDestroy: function(message) {
		this.unlistenTree(message.source);
	},


	// deselect node if parent is collapsed
	onCollapse: function(message) {
		if (!this.selectedNode) return;

		var node = message.source;
		var parent = this.selectedNode.parent;
		while (parent !== node && parent.isTreeNode) {
			parent = parent.parent;
		}
		if (parent.isTreeNode) {
			this.deselect();
		}
	},

	onLabelClick: function(message) {		
		var node = message.source;
		var e = message.event;

		if (this.selectedNode === node) {
			if(e.ctrlKey || e.shiftKey || e.metaKey){
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

		dojo.event.topic.publish(this.eventNames.select, {node: node} );
	},

	/**
	 * Deselect node if target tree is out of our concern
	 */
	onMoveFrom: function(message) {
		if (message.child !== this.selectedNode) {
			return;
		}

		if (!dojo.lang.inArray(this.listenedTrees, message.newTree)) {
			this.deselect(); 
		}
	},

	onDetach: function(message) {
		if (message.child !== this.selectedNode) {
			return;
		}

		this.deselect();
	},

	select: function(node){

		node.viewAddEmphase();

		this.selectedNode = node;
	},

	deselect: function(){

		var node = this.selectedNode;

		this.selectedNode = null;
		node.viewRemoveEmphase();
		dojo.event.topic.publish(this.eventNames.deselect, {node: node} );

	}

});



