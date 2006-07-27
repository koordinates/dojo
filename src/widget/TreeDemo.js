
dojo.provide("dojo.widget.TreeDemo");


dojo.widget.TreeDemo = {
	
	bindDemoMenu: function(controller) {
		dojo.event.topic.subscribe('treeContextMenuDestroy/engage',
			function (menuItem) { 
				var node = menuItem.getTreeNode();
				if (confirm("Delete node with descendants: "+node.title.replace(/(<([^>]+)>)/ig," ") +" ?")) {
					controller.destroyNode(node); 
				}
			}
		);


		dojo.event.topic.subscribe('treeContextMenuCreate/engage',
			function (menuItem) {
                controller.createChild(menuItem.getTreeNode(), 0, {title:"New node"});
            }
		);


		dojo.event.topic.subscribe('treeContextMenuUp/engage',
			function (menuItem) {
                var node = menuItem.getTreeNode();
                if (node.isFirstNode()) return;
                controller.move(node, node.parent, node.getParentIndex()-1);
            }
		);


		dojo.event.topic.subscribe('treeContextMenuDown/engage',
			function (menuItem) {
                var node = menuItem.getTreeNode();
                if (node.isLastNode()) return;
                controller.move(node, node.parent, node.getParentIndex()+1);
            }
		);

		//TODO: implement this
		dojo.event.topic.subscribe('treeContextMenuEdit/engage',
			function (menuItem) {
                var node = menuItem.getTreeNode();
                controller.editLabelStart(node);
			}
		);

	}
	
	
	
}
