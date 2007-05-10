dojo.provide("dijit.util.manager");

dijit.util.manager = new function(){
	// summary
	//	manager class for the widgets.

	// registry of widgets
	var registry = {};

	var widgetTypeCtr = {};

	this.getUniqueId = function(/*String*/widgetType){
		// summary
		//	Generates a unique id for a given widgetType

		var widgetId;
		do{
			widgetId = widgetType + "_" +
				(widgetTypeCtr[widgetType] !== undefined ?
					++widgetTypeCtr[widgetType] : widgetTypeCtr[widgetType] = 0);
		}while(registry[widgetId]);
		return widgetId;
	}

	this.add = function(/*Widget*/ widget){
		// summary
		//	Adds a widget to the registry

		if(!widget.id){
			widget.id = this.getUniqueId(widget.declaredClass.replace("\.","_"));
		}
		registry[widget.id] = widget;
	}

	this.remove = function(id){
		// summary
		//	Removes a widget from the registry by id, but does not destroy the widget

		delete registry.id;
	}

	this.destroyAll = function(){
		// summary
		//	Destroys all the widgets

		for(var id in registry){
			registry[id]._destroy();
		}
	}

	this.getWidgets = function(){
		// summary
		//	Returns the hash of id->widget
		return registry;
	}

	this.byNode = function(/* DOMNode */ node){
		// summary
		//	Returns the widget as referenced by node.?
		return registry[node.widgetId];
	}
};

dojo.addOnUnload(function(){
	dijit.util.manager.destroyAll();
});

dijit.byId = function(/*String*/id){
	// summary
	//	Returns a widget by its id
	return dijit.util.manager.getWidgets()[id];
};
