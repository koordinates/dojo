
dojo.provide("dojo.widget.TreeEmphaseOnSelect");

// selector extension to emphase node

dojo.widget.TreeEmphaseOnSelect = function() { }


dojo.lang.extend(dojo.widget.TreeEmphaseOnSelect, {
	
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
