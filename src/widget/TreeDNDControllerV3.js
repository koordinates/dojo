
dojo.provide("dojo.widget.TreeDNDControllerV3");

dojo.widget.tags.addParseTreeHandler("dojo:TreeDNDControllerV3");


dojo.widget.TreeDNDControllerV3 = function() {
	this.dragSources = {};

	this.dropTargets = {};
}

dojo.inherits(dojo.widget.TreeDNDControllerV3, dojo.widget.HtmlWidget);



dojo.lang.extend(dojo.widget.TreeDNDControllerV3, {
	widgetType: "TreeDNDControllerV3",
	
	initialize: function(args) {
		this.treeController = dojo.widget.manager.getWidgetById(args.controller)
	},

	listenTree: function(tree) {
		//dojo.debug("Listen tree "+tree);
		dojo.event.topic.subscribe(tree.eventNames.moveFrom, this, "onMoveFrom");
		dojo.event.topic.subscribe(tree.eventNames.moveTo, this, "onMoveTo");
		dojo.event.topic.subscribe(tree.eventNames.addChild, this, "onAddChild");
		dojo.event.topic.subscribe(tree.eventNames.removeNode, this, "onRemoveNode");
		dojo.event.topic.subscribe(tree.eventNames.treeDestroy, this, "onTreeDestroy");
		dojo.event.topic.subscribe(tree.eventNames.nodeDestroy, this, "onNodeDestroy");
	},


	unlistenTree: function(tree) {
		//dojo.debug("Listen tree "+tree);
		dojo.event.topic.unsubscribe(tree.eventNames.moveFrom, this, "onMoveFrom");
		dojo.event.topic.unsubscribe(tree.eventNames.moveTo, this, "onMoveTo");
		dojo.event.topic.unsubscribe(tree.eventNames.addChild, this, "onAddChild");
		dojo.event.topic.unsubscribe(tree.eventNames.removeNode, this, "onRemoveNode");
		dojo.event.topic.unsubscribe(tree.eventNames.treeDestroy, this, "onTreeDestroy");
		dojo.event.topic.unsubscribe(tree.eventNames.nodeDestroy, this, "onNodeDestroy");
	},

	onTreeDestroy: function(message) {
		this.unlistenTree(message.source);
		// I'm not widget so don't use destroy() call and dieWithTree
	},


	onNodeDestroy: function(message) {
		this.unregisterDNDNode(message.source)
		// I'm not widget so don't use destroy() call and dieWithTree
	},


	onAddChild: function(message) {
		this.registerDNDNode(message.child);
	},

	onMoveFrom: function(message) {
		var _this = this;
		dojo.lang.forEach(
			message.child.getDescendants(),
			function(node) { _this.unregisterDNDNode(node); }
		);
	},

	onMoveTo: function(message) {
		var _this = this;
		dojo.lang.forEach(
			message.child.getDescendants(),
			function(node) { _this.registerDNDNode(node); }
		);
	},

	/**
	 * Controller(node model) creates DNDNodes because it passes itself to node for synchroneous drops processing
	 * I can't process DnD with events cause an event can't return result success/false
	*/
	registerDNDNode: function(node) {
		
		if (!node.tree.DNDMode) return;
		if (this.dragSources[node.widgetId] || this.dropTargets[node.widgetId]) return;

		//dojo.debug("registerDNDNode "+node);

		/* I drag label, not domNode, because large domNodes are very slow to copy and large to drag */

		var source = null;
		var target = null;

		if (!node.actionIsDisabled(node.actions.MOVE)) {
			//dojo.debug("reg source")
			var source = new dojo.dnd.TreeDragSourceV3(node.contentNode, this, node.tree.widgetId, node);
			this.dragSources[node.widgetId] = source;
		}

		var target = new dojo.dnd.TreeDropTargetV3(node.contentNode, this.treeController, node.tree.DNDAcceptTypes, node);

		this.dropTargets[node.widgetId] = target;

	},


	unregisterDNDNode: function(node) {

		if (this.dragSources[node.widgetId]) {
			dojo.dnd.dragManager.unregisterDragSource(this.dragSources[node.widgetId]);
			delete this.dragSources[node.widgetId];
		}

		if (this.dropTargets[node.widgetId]) {
			dojo.dnd.dragManager.unregisterDropTarget(this.dropTargets[node.widgetId]);
			delete this.dropTargets[node.widgetId];
		}
	}





});
