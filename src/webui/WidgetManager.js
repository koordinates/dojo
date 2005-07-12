dojo.hostenv.startPackage("dojo.webui.WidgetManager");
dojo.hostenv.startPackage("dojo.webui.widgetManager");

dojo.hostenv.loadModule("dojo.alg.*");
dojo.hostenv.loadModule("dojo.webui.widgets.Parse");

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
		var tw = this.widgets[widgetIndex].widgetId;
		delete this.widgetIds[tw];
		this.widgets.splice(widgetIndex, 1);
	}
	
	// FIXME: suboptimal performance
	this.removeById = function(id) {
		for (var i=0; i<this.widgets.length; i++){
			if(this.widgets[i].widgetId == id){
				this.remove(i);
				break;
			}
		}
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

	// map of previousally discovered implementation names to constructors
	var knownWidgetImplementations = [];

	// support manually registered widget packages
	var widgetPackages = ["dojo.webui.widgets"];

	this.registerWidgetPackage = function(pname) {
		widgetPackages.push(pname);
	}

	this.getImplementation = function(widgetName, ctorObject, mixins){
		// try and find a name for the widget
		var impl = this.getImplementationName(widgetName);
				
		if(impl){
			var item = new impl(ctorObject);
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

		// look for a rendering-context specific version of our widget name
		for(var i = 0; i < widgetPackages.length; i++){
			var pn = widgetPackages[i];
			var pkg = dj_eval_object_path(pn);

			for(var x in pkg){
				var xlc = (new String(x)).toLowerCase();
				for(var y in dojo.render){
					if((dojo.render[y]["capable"])&&(dojo.render[y].capable === true)){
						var ps = dojo.render[y].prefixes;
						for(var z=0; z<ps.length; z++){
							if((ps[z]+widgetName).toLowerCase() == xlc){
								knownWidgetImplementations[xlc] = pkg[x];
								return pkg[x];
							}
						}
					}
				}
				/*
				// this is the fallback to the base class. There's still some debate as to whether or not this is a good idea.
				if((widgetName.toLowerCase()== xlc)&&(typeof pkg[x] == "function")){
					knownWidgetImplementations[xlc] = pkg[x];
					return pkg[x];
				}
				*/
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
