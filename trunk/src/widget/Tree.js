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
    toggle: "default",
    toggleDuration: 150,
	snarfChildDomOutput: true,

    initialize: function(args, frag){
        switch (this.toggle) {
           case "wipe"    : this.toggle = new dojo.widget.Tree.WipeToggle();
                            break;
           case "fade"    : this.toggle = new dojo.widget.Tree.FadeToggle();
                            break;
           default        : this.toggle = new dojo.widget.Tree.DefaultToggle();
        }

        //  when we add a child, automatically wire it.
        dojo.event.connect(this, "addChild", this, "wireNode");
    },

    wireNode: function(node) {
        node.tree = this;

		dojo.event.connect(node, "onSelect", this, "nodeSelected");
		dojo.event.connect(node, "onExpand", this, "nodeExpanded");
		dojo.event.connect(node, "onCollapse", this, "nodeCollapsed");
		dojo.event.connect(this, "nodeSelected", node, "onTreeNodeSelected");

        // when a child is added to this node, we need to wire that new node too
        dojo.event.connect(node, "addChild", this, "wireNode");
    },

    getToggle: function () {
        return this.toggle;
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

dojo.widget.Tree.DefaultToggle = function() {
    this.show = function(node) {
        if (node.style) {
            node.style.display = "block";
        }
    }

    this.hide = function(node) {
        if (node.style) {
            node.style.display = "none";
        }
    }
}

dojo.widget.Tree.FadeToggle = function(duration) {
    this.toggleDuration = duration ? duration : 150;
    this.show = function(node) {
        dojo.fx.html.fadeShow(node, this.toggleDuration);
    }

    this.hide = function(node) {
        dojo.fx.html.fadeHide(node, this.toggleDuration);
    }
}

dojo.widget.Tree.WipeToggle = function(duration) {
    this.toggleDuration = duration ? duration : 150;
    this.show = function(node) {
        dojo.fx.html.wipeIn(node, this.toggleDuration);
    }

    this.hide = function(node) {
        dojo.fx.html.wipeOut(node, this.toggleDuration);
    }
}

// make it a tag
dojo.widget.tags.addParseTreeHandler("dojo:Tree");

