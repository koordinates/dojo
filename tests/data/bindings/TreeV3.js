dojo.provide("tests.data.bindings.TreeV3");
dojo.require("dojo.data.core.Read");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.TreeV3");
dojo.require("dojo.widget.TreeNodeV3");
dojo.require("dojo.widget.TreeBasicControllerV3");

dojo.declare("tests.data.bindings.TreeV3", null,
	function(result, outerDiv) {
		var textarea = document.createElement('textarea');
		var controller = dojo.widget.createWidget("TreeBasicControllerV3");
		var tree = dojo.widget.createWidget("TreeV3", {listeners:[controller.widgetId]});
		outerDiv.appendChild(tree.domNode);
		var rootTreeNode = dojo.widget.createWidget("TreeNodeV3", {title: "root", tree: tree.widgetId});
		tree.addChild(rootTreeNode);
		this._tree = tree;
		this._rootNode = rootTreeNode;
		this.displayItems(result, controller);
	}, {
	
	displayItems: function(result, controller) {
		var items = result.items;
		for (var i = 0; i < items.length; ++i) {
			this.displayItem(result.store, items[i], this._tree, this._rootNode);
		}
		controller.expandToLevel(this._tree, 1);
	},
	
	displayItem: function(store, item, tree, parentTreeNode) {
		var itemName = store.getValue(item, 'text');
		var attributes = store.getAttributes(item);
		var description = '';
		for (var i = 0; i < attributes.length; ++i) {
			var attribute = attributes[i];
			if (attribute != 'text' && attribute != 'children') {
				if (description) { 
					description += ', ';
				}
				description += attribute + ': "' + store.getValue(item, attribute) + '"';
			}
		}
		var treeNodeTitle = itemName;
		if (description) {
			treeNodeTitle += ' <font color="bbbbbb">{' + description + '}</font>'; 
		}
		var treeNode = dojo.widget.createWidget("TreeNodeV3", {title: treeNodeTitle, tree: tree.widgetId});
		parentTreeNode.addChild(treeNode);
		var children = store.getValues(item, 'children');
		for (var i = 0; i < children.length; ++i) {
			var childItem = children[i];
			this.displayItem(store, childItem, tree, treeNode);
		}
	}
});

