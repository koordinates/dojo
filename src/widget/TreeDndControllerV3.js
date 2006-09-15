
dojo.provide("dojo.widget.TreeDndControllerV3");

dojo.require("dojo.dnd.TreeDragAndDropV3");
	
dojo.widget.defineWidget(
	"dojo.widget.TreeDndControllerV3",
	[dojo.widget.HtmlWidget, dojo.widget.TreeCommon],
	function() {
		this.dragSources = {};
		this.dropTargets = {};
		this.listenedTrees = {};
	},
{
	listenTreeEvents: ["afterTreeCreate","beforeTreeDestroy"],
	
	initialize: function(args) {
		this.treeController = dojo.lang.isString(args.controller) ? dojo.widget.byId(args.controller) : args.controller;
		
		if (!this.treeController) {
			dojo.raise("treeController must be declared");
		}
		
	},

	onBeforeTreeDestroy: function(message) {
		this.unlistenTree(message.source);
	},
	

	onAfterTreeCreate: function(message) {
		var tree = message.source;
	
		var source = this.makeDragSource(tree);
		//dojo.profile.end("Dnd source "+node);		
		this.dragSources[tree.widgetId] = source;
		

		//dojo.profile.start("Dnd target "+node);		
		//dojo.debug("reg target");
		var target = this.makeDropTarget(tree);
		//dojo.profile.end("Dnd target "+node);		

		this.dropTargets[tree.widgetId] = target;

		//dojo.profile.end("Dnd listenNode "+node);		


	},
	
	/**
	 * Factory method, override it to create special source
	 */
	makeDragSource: function(tree) {
		return new dojo.dnd.TreeDragSourceV3(tree, this, tree.widgetId);
	},


	/**
	 * Factory method, override it to create special target
	 */
	makeDropTarget: function(tree) {
		 return new dojo.dnd.TreeDropTargetV3(tree, this, tree.DndAcceptTypes);
	}


});
