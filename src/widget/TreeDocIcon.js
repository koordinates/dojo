
dojo.provide("dojo.widget.TreeDocIcon");

dojo.require("dojo.widget.HtmlWidget");

// selector extension to emphase node


dojo.widget.tags.addParseTreeHandler("dojo:TreeDocIcon");


dojo.widget.TreeDocIcon = function() {
	dojo.widget.HtmlWidget.call(this);	
}

dojo.inherits(dojo.widget.TreeDocIcon, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.TreeDocIcon, {
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
