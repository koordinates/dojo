dojo.provide("dojo.widget.TreeContextMenuV3");

dojo.require("dojo.event.*");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.Menu2");
dojo.require("dojo.widget.TreeCommon");

dojo.widget.defineWidget(
	"dojo.widget.TreeContextMenuV3",
	[dojo.widget.PopupMenu2, dojo.widget.TreeCommon],
	function() {
		this.listenedTrees = {};
		
	},
{

	listenTreeEvents: ["afterTreeCreate","beforeTreeDestroy"],
	listenNodeFilter: function(elem) { return elem instanceof dojo.widget.Widget},
	
	onAfterTreeCreate: function(message) {
		var tree = message.source;
		this.bindDomNode(tree.domNode);
	},
	
	onBeforeTreeDestroy: function(message) {
		this.unBindDomNode(message.source.domNode);
	},
	
	
	getTreeNode: function() {
		
		var source = this.getTopOpenEvent().target;
		var treeNode = this.domElement2TreeNode(source);
		return treeNode;
	
	},
		
	open: function() {
		var result = dojo.widget.PopupMenu2.prototype.open.apply(this, arguments);

		for(var i=0; i< this.children.length; i++) {
			/* notify children */
			if (this.children[i].menuOpen) {
				this.children[i].menuOpen(this.getTreeNode());
			}
		}
		return result;
	},
	
	close: function(){
		
		for(var i=0; i< this.children.length; i++) {
			/* notify menu entries */
			if (this.children[i].menuClose) {
				this.children[i].menuClose(this.getTreeNode());
			}
		}
		

		var result = dojo.widget.PopupMenu2.prototype.close.apply(this, arguments);
		
		return result
	}
	
});


dojo.widget.defineWidget(
	"dojo.widget.TreeMenuItemV3",
	[dojo.widget.MenuItem2, dojo.widget.TreeCommon],
	function() {
		this.treeActions = [];
	},
{
	// treeActions menu item performs following actions (to be checked for permissions)
	treeActions: "",

	initialize: function(args, frag) {
		for(var i=0; i<this.treeActions.length; i++) {
			this.treeActions[i] = this.treeActions[i].toUpperCase();
		}
	},

		
	getTreeNode: function() {
		var menu = this;

		// FIXME: change to dojo.widget[this.widgetType]
		while (! (menu instanceof dojo.widget.TreeContextMenuV3) ) {
				menu = menu.parent;
		}

		var treeNode = menu.getTreeNode()

		return treeNode;
	},


	menuOpen: function(treeNode) {

		treeNode.viewEmphase()
		this.setDisabled(false); // enable by default

		var _this = this;
		dojo.lang.forEach(_this.treeActions,
			function(action) {
				_this.setDisabled( treeNode.actionIsDisabledNow(action) );
			}
		);

	},
	
	menuClose: function(treeNode) {

		treeNode.viewUnemphase()
	},

	toString: function() {
		return "["+this.widgetType+" node "+this.getTreeNode()+"]";
	}
});
