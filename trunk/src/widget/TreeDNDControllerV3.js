
dojo.provide("dojo.widget.TreeDNDControllerV3");

dojo.widget.tags.addParseTreeHandler("dojo:TreeDNDControllerV3");


dojo.widget.TreeDNDControllerV3 = function() {
	this.dragSources = {};

	this.dropTargets = {};
	
	this.listenedTrees = [];
}

dojo.inherits(dojo.widget.TreeDNDControllerV3, dojo.widget.HtmlWidget);


dojo.lang.extend(dojo.widget.TreeDNDControllerV3, dojo.widget.TreeCommon.prototype);

dojo.lang.extend(dojo.widget.TreeDNDControllerV3, {
	widgetType: "TreeDNDControllerV3",
	
	listenTreeEvents: ["treeChange","treeDestroy", "addChild"],
	
	initialize: function(args) {
		this.treeController = dojo.widget.manager.getWidgetById(args.controller)
		
	},

	onTreeDestroy: function(message) {
		this.unlistenTree(message.source);
	},
	
	// first DND registration happens in addChild
	// because I have information about parent on this stage and can use it
	// to check locking or other things
	onAddChild: function(message) {
		this.listenNode(message.child);
	},


	onTreeChange: function(message) {
		
		if (!message.oldTree) return;
		
		if (!dojo.lang.inArray(this.listenedTrees, message.newTree)) {			
			this.processDescendants(message.node, function(elem) { return elem instanceof dojo.widget.Widget}, this.unlistenNode);
		}		
		
		if (!dojo.lang.inArray(this.listenedTrees, message.oldTree)) {
			// we have new node
			this.processDescendants(message.node, function(elem) { return elem instanceof dojo.widget.Widget}, this.listenNode);	
		}
		//dojo.profile.end("onTreeChange");
	},
	
	
	/**
	 * Controller(node model) creates DNDNodes because it passes itself to node for synchroneous drops processing
	 * I can't process DnD with events cause an event can't return result success/false
	*/
	listenNode: function(node) {
		
		if (!node.tree.DNDMode) return;
		if (this.dragSources[node.widgetId] || this.dropTargets[node.widgetId]) return;

	
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


	unlistenNode: function(node) {

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
