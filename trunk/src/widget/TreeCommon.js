
dojo.provide("dojo.widget.TreeCommon");


dojo.widget.TreeCommon = function() {
}

dojo.lang.extend(dojo.widget.TreeCommon, {
	
	listenTree: function(tree) {
		
		var _this = this;
		
		dojo.lang.forEach(this.listenTreeEvents, function(event) {
			var eventHandler =  "on" + event.charAt(0).toUpperCase() + event.substr(1);
			dojo.event.topic.subscribe(tree.eventNames[event], _this, eventHandler);
		});
		
		/**
		 * remember that I listen to this tree. No unbinding/binding/deselection
		 * needed when transfer between listened trees
		 */
		this.listenedTrees.push(tree);
		
	},
	
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
		while (!domElement.widgetId) {
			domElement = domElement.parentNode;
		}
		
		return dojo.widget.manager.getWidgetById(domElement.widgetId);
	}
		
		
	
	
});