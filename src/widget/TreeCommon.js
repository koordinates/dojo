
dojo.provide("dojo.widget.TreeCommon");
dojo.require("dojo.widget.*"); // for dojo.widget.manager

dojo.widget.TreeCommon = function() {	
}

dojo.lang.extend(dojo.widget.TreeCommon, {
	
	
	listenTreeEvents: [],
	
	listenTree: function(tree) {
		
		//dojo.debug("listenTree in "+this+" tree "+tree);
		
		var _this = this;
		
		dojo.lang.forEach(this.listenTreeEvents, function(event) {
			var eventHandler =  "on" + event.charAt(0).toUpperCase() + event.substr(1);
			//dojo.debug("subscribe "+tree.eventNames[event]+" "+eventHandler);
			dojo.event.topic.subscribe(tree.eventNames[event], _this, eventHandler);
		});
		
		/**
		 * remember that I listen to this tree. No unbinding/binding/deselection
		 * needed when transfer between listened trees
		 */
		this.listenedTrees.push(tree);
		
	},			
	
	// interface functions
	listenNode: function() {},	
	unlistenNode: function() {},
			
	unlistenTree: function(tree) {
		
		var _this = this;
	
		dojo.lang.forEach(this.listenTreeEvents, function(event) {
			var eventHandler =  "on" + event.charAt(0).toUpperCase() + event.substr(1);
			dojo.event.topic.unsubscribe(tree.eventNames[event], _this, eventHandler);
		});
		
		
		for(var i=0; i<this.listenedTrees.length; i++){
           if(this.listenedTrees[i] === tree){
                   this.listenedTrees.splice(i, 1);
                   break;
           }
		}
	},
	
	domElement2TreeNode: function(domElement) {
		while (domElement && !domElement.widgetId) {
			domElement = domElement.parentNode;
		}
		
		if (!domElement) {
			dojo.raise("domElement2TreeNode couldnt detect widget");
		}
		
		return dojo.widget.manager.getWidgetById(domElement.widgetId);
	},
	
	
	processDescendants: function(elem, filter, func) {
		if (!filter.call(this,elem)) {
			return;
		}
		var stack = [elem]
		while (elem = stack.pop()) {
			func.call(this,elem);
	        dojo.lang.forEach(elem.children, function(elem) { filter.call(this,elem) && stack.push(elem) });
		}
    }	
	
	
		
		
	
	
});