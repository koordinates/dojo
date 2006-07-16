
dojo.provide("dojo.widget.TreeDocIcon");

dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.TreeCommon");

// selector extension to emphase node


dojo.widget.tags.addParseTreeHandler("dojo:TreeDocIcon");


dojo.widget.TreeDocIcon = function() {
	dojo.widget.HtmlWidget.call(this);
	
	this.listenedTrees = []
}

dojo.inherits(dojo.widget.TreeDocIcon, dojo.widget.HtmlWidget);


dojo.lang.extend(dojo.widget.TreeDocIcon, dojo.widget.TreeCommon.prototype);

dojo.lang.extend(dojo.widget.TreeDocIcon, {
	widgetType: "TreeDocIcon",
	
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/TreeDocIcon.css"),

	templateString: '<div class="dojoTree"></div>',

	
	listenTreeEvents: ["treeChange","setFolder","unsetFolder"],
	
	
	listenTree: function(tree) {
		dojo.widget.TreeCommon.prototype.listenTree.call(this, tree);
		
		/**
		 * add node with document type icon to node template and Tree.iconNodeTemplate
		 * it will be set to TreeNode.iconNode on node creation
		 * we do not assign document type yet, its node specific
		 */
		var iconNode = document.createElement("div");
		dojo.html.setClass(iconNode, tree.classPrefix+"Icon");
		iconNode.setAttribute("template", "iconNode");
		
		dojo.dom.insertAfter(iconNode, tree.expandNodeTemplate);
		tree.iconNodeTemplate = iconNode;	
	},
	
	setNodeTypeClass: function(node) {
		//dojo.debug("setNodeTypeClass in "+node+" type "+node.getNodeType());
		
		var reg = new RegExp("(^|\\s)"+node.tree.classPrefix+"Icon\\w+",'g');			
		
		var clazz = dojo.html.getClass(node.iconNode).replace(reg,'') + ' ' + node.tree.classPrefix+'Icon'+node.getNodeType();
		dojo.html.setClass(node.iconNode, clazz);		
	},
		
		
	onSetFolder: function(message) {
		this.setNodeTypeClass(message.source);
	},
	
	onUnsetFolder: function(message) {
		this.setNodeTypeClass(message.source);
	},
	
	
	/**
	 * FIXME: can't unlisten yet. TODO: remove node type and stuff ?
	 */
	unlistenNode: function(node) {
	},
	
	unlistenTree: function(tree) {
		dojo.widget.TreeCommon.prototype.unlistenTree.call(this, tree);
	},
	
	onTreeChange: function(message) {
		var _this = this;
		
		if (!dojo.lang.inArray(this.listenedTrees, message.oldTree)) {			
			// moving from old tree to our tree
			this.processDescendants(message.node,
				function(elem) { return elem instanceof dojo.widget.Widget},
				this.setNodeTypeClass
			);
		}
		
	}
	

});
