dojo.hostenv.loadModule("dojo.event.*");
dojo.hostenv.loadModule("dojo.webui.Widget");

dojo.hostenv.startPackage("dojo.webui.WidgetManager");

dojo.webui.widgetManager = new function(){
	this.widgets = [];

	this.add = function(widget){
		
	}

	// FIXME: we should never allow removal of the root widget until all others
	// are removed!
	this.remove = function(){
	}

	var knownWidgetImplementations = [];

	this.getImplementation = function(widgetName, ctorObject, mixins){
		var ii = this.getImplementationName(widgetName);
		if(ii){
			return new dojo.webui.widgets[impl](ctorObject);
		}
	}

	this.getImplementationName = function(widgetName){
		/*
		 * This is the overly-simplistic implemention of getImplementation (har
		 * har). In the future, we are going to want something that allows more
		 * freedom of expression WRT to specifying different specializations of
		 * a widget.
		 *
		 * Additionally, this implementation treats widget names as case
		 * insensitive, which does not necessarialy mesh with the markup which
		 * can construct a widget.
		 */

		// first, search the knownImplementations list for a suitable match
		var impl = knownWidgetImplementations[widgetName.toLowerCase()];
		if(impl){
			return impl;
		}

		// if we didn't get one there, then we need to run through the
		// classname location algorithm

		// step 1: look for a rendering-context specific version of our widget
		// name
		// /alex goes looking for a good way to do this...
		// ...oh fuck it, for now we' hard-code in an "HTML" prefix and see if
		// it dies, at which point we'll drop the prefix and just try to find
		// the base class.
		for(var x in dojo.webui.widgets){
			var xlc = (new String(x)).toLowerCase();
			if(("html"+widgetname).toLowerCase() == xlc){
				knownWidgetImplementations[xlc] = x;
				return x;
			}
		}
	}
}
