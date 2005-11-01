/* Copyright (c) 2004-2005 The Dojo Foundation, Licensed under the Academic Free License version 2.1 or above */dojo.provide("dojo.widget.Tree");
dojo.provide("dojo.widget.HtmlTree");

dojo.require("dojo.event.topic");
dojo.require("dojo.fx.html");
//dojo.require("dojo.widget.Widget");
//dojo.require("dojo.widget.DomWidget");
dojo.require("dojo.widget.HtmlContainer");

dojo.widget.HtmlTree = function(){
	dojo.widget.HtmlContainer.call(this);
	this.items = [];
}
dojo.inherits(dojo.widget.HtmlTree, dojo.widget.HtmlContainer);

dojo.lang.extend(dojo.widget.HtmlTree, {
	widgetType: "Tree",
	templatePath: dojo.uri.dojoUri("src/widget/templates/Tree.html"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/TreeNode.css"),

	items: [],

	// copy children widgets output directly to parent (this node), to avoid
	// errors trying to insert an <li> under a <div>
	snarfChildDomOutput: true,

	publishSelectionTopic: "",
	publishExpandedTopic: "",
	publishCollapsedTopic: "",
	preChildIcon: null,
	nestedChildIcon: null,
	snarfChildDomOutput: true,

	initialize: function(args, frag){
		dojo.widget.HtmlTreeNode.superclass.initialize.call(this, args, frag);
		//  when we add a child, automatically wire it.
		dojo.event.connect(this, "addChild", this, "wireNode");	
		dojo.event.connect(this, "addWidgetAsDirectChild", this, "wireNode");
	},

	wireNode: function(node) {
		node.tree = this;

		dojo.event.connect(node, "onSelect", this, "nodeSelected");
		dojo.event.connect(node, "onExpand", this, "nodeExpanded");
		dojo.event.connect(node, "onCollapse", this, "nodeCollapsed");
		dojo.event.connect(this, "nodeSelected", node, "onTreeNodeSelected");

		// when a child is added to this node, we need to wire that new node too
		dojo.event.connect(node, "addChild", this, "wireNode");
		dojo.event.connect(node, "addWidgetAsDirectChild", this, "wireNode");
	},

	nodeSelected: function (item, e) {
		//this.publishSelectionTopic.sendMessage("Node Selected: " + item.id);
		dojo.event.topic.publish(this.publishSelectionTopic, item.id);
	},

	nodeExpanded: function (item, e) {
		//this.publishSelectionTopic.sendMessage("Node Selected: " + item.id);
		dojo.event.topic.publish(this.publishExpandedTopic, item.id);
	},

	nodeCollapsed: function (item, e) {
		//this.publishSelectionTopic.sendMessage("Node Selected: " + item.id);
		dojo.event.topic.publish(this.publishCollapsedTopic, item.id);
	}
});

// make it a tag
dojo.widget.tags.addParseTreeHandler("dojo:Tree");

dojo.require("dojo.widget.TreeNode");
dojo.require("dojo.widget.HtmlTreeNode");
