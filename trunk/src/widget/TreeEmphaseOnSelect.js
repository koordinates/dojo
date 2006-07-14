
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
	
	/**
	 * loadExtension: function(target, arguments object)
	 */
	loadExtension: function(selector) {
		dojo.event.topic.subscribe(selector.eventNames.select, this, "onSelect");
		dojo.event.topic.subscribe(selector.eventNames.deselect, this, "onDeselect");		
	},
	
	onSelect: function(message) {
		dojo.html.addClass(message.node.labelNode, 'TreeNodeEmphased');
	},
	
	onDeselect: function(message) {
		dojo.html.removeClass(message.node.labelNode, 'TreeNodeEmphased');
	}
	

});
