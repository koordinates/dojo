dojo.hostenv.startPackage("dojo.webui.WidgetManager");
dojo.hostenv.startPackage("dojo.webui.widgetManager");

dojo.hostenv.loadModule("dojo.alg.*");

dojo.webui.widgetManager = new function(){
	this.widgets = [];
	this.widgetIds = [];
	this.root = null; // the root widget

	var widgetCtr = 0;

	this.getUniqueId = function(){
		return widgetCtr++;
	}

	this.add = function(widget){
		this.widgets.push(widget);
		if(widget.widgetId == ""){
			widget.widgetId = widget.widgetType+" "+this.getUniqueId();
		}else if(this.widgetIds[widget.widgetId]){
			dj_debug("widget ID collision on ID: "+widget.widgetId);
		}
		this.widgetIds[widget.widgetId] = widget;
	}

	// FIXME: we should never allow removal of the root widget until all others
	// are removed!
	this.remove = function(widgetIndex){
		var tw = this.widgets[widgetIndex];
		delete this.widgetIds[tw];
		this.widgets.splice(widgetIndex, 1);
	}

	this.getWidgetById = function(id){
		return this.widgetIds[id];
	}

	this.getWidgetsOfType = function(type){
		var lt = type.toLowerCase();
		var ret = [];
		dojo.alg.forEach(this.widgets, function(x){
			if(x.widgetType.toLowerCase() == lt){
				ret.push(x);
			}
		});
		return ret;
	}

	this.getWidgetsByFilter = function(unaryFunc){
		var ret = [];
		dojo.alg.forEach(this.widgets, function(x){
			if(unaryFunc(x)){
				ret.push(x);
			}
		});
		return ret;
	}

	var knownWidgetImplementations = [];

	this.getImplementation = function(widgetName, ctorObject, mixins){
		var impl = this.getImplementationName(widgetName);
		if(impl){
			var tclass = dojo.webui.widgets[impl];
			// dj_debug("new dojo.webui.widgets."+impl+"()");
			// dj_debug(new dojo.webui.widgets[impl]());
			var item = new dojo.webui.widgets[impl](ctorObject);
			//alert(impl+": "+item);
			return item;
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
			if(dojo.render.html.capable){
				if(("html"+widgetName).toLowerCase() == xlc){
					knownWidgetImplementations[xlc] = x;
					return x;
				}
			}else if(dojo.render.svg.capable){
				if(("svg"+widgetName).toLowerCase() == xlc){
					knownWidgetImplementations[xlc] = x;
					return x;
				}
			}
		}

	}

	// FIXME: does it even belong in this name space?
	// NOTE: this method is implemented by DomWidget.js since not all
	// hostenv's would have an implementation.
	this.getWidgetFromPrimitive = function(baseRenderType){
		dj_unimplemented("dojo.webui.widgetManager.getWidgetFromPrimitive");
	}

	this.getWidgetFromEvent = function(nativeEvt){
		dj_unimplemented("dojo.webui.widgetManager.getWidgetFromEvent");
	}

	// FIXME: what else?
}
