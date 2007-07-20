dojo.provide("dijit._base.manager");

dijit.manager = new function(){
	// summary
	//	manager class for the widgets.

	// registry of widgets
	var registry = {};

	var widgetTypeCtr = {};

	this.getUniqueId = function(/*String*/widgetType){
		// summary
		//	Generates a unique id for a given widgetType

		var id;
		do{
			id = widgetType + "_" +
				(widgetTypeCtr[widgetType] !== undefined ?
					++widgetTypeCtr[widgetType] : widgetTypeCtr[widgetType] = 0);
		}while(registry[id]);
		return id; // String
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

		delete registry[id];
	}

	this.destroyAll = function(){
		// summary
		//	Destroys all the widgets

		for(var id in registry){
			registry[id].destroy();
		}
	}

	this.getWidgets = function(){
		// summary:
		//		Returns the hash of id->widget
		return registry; // Object
	}

	this.byNode = function(/* DOMNode */ node){
		// summary:
		//		Returns the widget as referenced by node
		return registry[node.getAttribute("widgetId")]; // Widget
	}
};

if(dojo.isIE && dojo.isIE < 7){
	// Only run this for IE6 because we think it's only necessary in that case,
	// and because it causes problems on FF.  See bugt #3531 for details.
	dojo.addOnUnload(function(){
		dijit.manager.destroyAll();
	});
}

//FIXME: either remove isString/type widget support or fix the docs
dijit.byId = function(/*String*/id){
	// summary:
	//		Returns a widget by its id
	return (dojo.isString(id)) ? dijit.manager.getWidgets()[id] : id; // Widget
};
