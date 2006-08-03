
dojo.provide("dojo.widget.TreeEmphaseOnSelect");

dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.TreeSelectorV3");

// selector extension to emphase node


dojo.widget.tags.addParseTreeHandler("dojo:TreeEmphaseOnSelect");


dojo.widget.TreeEmphaseOnSelect = function() {
	dojo.widget.HtmlWidget.call(this);	
}

dojo.inherits(dojo.widget.TreeEmphaseOnSelect, dojo.widget.HtmlWidget);


dojo.lang.extend(dojo.widget.TreeEmphaseOnSelect, {
	widgetType: "TreeEmphaseOnSelect",
	
	selector: "",
	
	initialize: function() {
		this.selector = dojo.widget.byId(this.selector);
		
		dojo.event.topic.subscribe(this.selector.eventNames.select, this, "onSelect");
		dojo.event.topic.subscribe(this.selector.eventNames.deselect, this, "onDeselect");	
	},

	
	onSelect: function(message) {
		//dojo.debug("select "+message.node.widgetId);
		//dojo.debug("before select "+dojo.html.getClass(message.node.labelNode))
		dojo.html.addClass(message.node.labelNode, message.node.tree.classPrefix+'NodeEmphased');
		//dojo.debug("after select "+dojo.html.getClass(message.node.labelNode))
		
	},
	
	onDeselect: function(message) {
		dojo.debug(dojo.html.getClass(message.node.labelNode))
		dojo.html.removeClass(message.node.labelNode, message.node.tree.classPrefix+'NodeEmphased');
	}
	

});
