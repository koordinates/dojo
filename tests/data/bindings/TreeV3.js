dojo.provide("tests.data.bindings.TreeV3");
dojo.require("dojo.data.core.Read");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.TreeV3");
dojo.require("dojo.widget.TreeNodeV3");
dojo.require("dojo.widget.TreeBasicControllerV3");

dojo.declare("tests.data.bindings.TreeV3", null,
	function(result, outerDiv, datastoreInfo) {
		var controller = dojo.widget.createWidget("TreeBasicControllerV3");
		var tree = dojo.widget.createWidget("TreeV3", {listeners:[controller.widgetId]});
		outerDiv.appendChild(tree.domNode);
		var rootNodeName = "root";
		var rootTreeNode = dojo.widget.createWidget("TreeNodeV3", {title: rootNodeName, tree: tree.widgetId});
		tree.addChild(rootTreeNode);
		this._tree = tree;
		this._rootNode = rootTreeNode;
		this._nameAttribute = datastoreInfo.nameAttribute;
		this.displayItems(result, controller);
	}, {
	
	displayItems: function(result, controller) {
		if (!result) {
			return;
		}
		var items = result.items;
		for (var i = 0; i < items.length; ++i) {
			this.displayItem(result.store, items[i], this._tree, this._rootNode);
		}
		controller.expandToLevel(this._tree, 1);
	},
	
	displayItem: function(store, item, tree, parentTreeNode) {
		var itemName;
		if (this._nameAttribute) {
			itemName = store.getValue(item, this._nameAttribute);
		} else {
			itemName = "untitled";
		}
		var attributes = store.getAttributes(item);
		var description = '';
		for (var i = 0; i < attributes.length; ++i) {
			var attribute = attributes[i];
			var value = store.getValue(item, attribute);
			if (attribute != this._nameAttribute && !store.isItem(value)) {
				if (description) { 
					description += ', ';
				}
				description += attribute + ': "' + value + '"';
			}
		}
		var treeNodeTitle = itemName;
		if (description) {
			treeNodeTitle += ' <font color="bbbbbb">{' + description + '}</font>'; 
		}
		var treeNode = dojo.widget.createWidget("TreeNodeV3", {title: treeNodeTitle, tree: tree.widgetId});
		parentTreeNode.addChild(treeNode);
		for (i = 0; i < attributes.length; ++i) {
			var attribute = attributes[i];
			var children = store.getValues(item, attribute);
			for (var j = 0; j < children.length; ++j) {
				var childItem = children[j];
				if (store.isItem(childItem)) {
					this.displayItem(store, childItem, tree, treeNode);
				}
			}
		}
	}
});

