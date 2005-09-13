dojo.provide("dojo.widget.Manager");
dojo.require("dojo.alg.*");

dojo.widget.manager = new function(){
	this.widgets = [];
	this.widgetIds = [];
	this.root = null; // the root widget

	var widgetTypeCtr = {};

	this.getUniqueId = function (widgetType) {
		return widgetType + "_" + (widgetTypeCtr[widgetType] != undefined ?
			widgetTypeCtr[widgetType]++ : widgetTypeCtr[widgetType] = 0);
	}

	this.add = function(widget){
		this.widgets.push(widget);
		if(widget.widgetId == ""){
			widget.widgetId = this.getUniqueId(widget.widgetType);
		}else if(this.widgetIds[widget.widgetId]){
			dj_debug("widget ID collision on ID: "+widget.widgetId);
		}
		this.widgetIds[widget.widgetId] = widget;
	}

	this.destroyAll = function(){
		for(var x=this.widgets.length-1; x>=0; x--){
			try{
				// this.widgets[x].destroyChildren();
				this.widgets[x].destroy(true);
				delete this.widgets[x];
			}catch(e){ }
		}
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

	this.getWidgetsByType = function(type){
		var lt = type.toLowerCase();
		var ret = [];
		dojo.alg.forEach(this.widgets, function(x){
			if(x.widgetType.toLowerCase() == lt){
				ret.push(x);
			}
		});
		return ret;
	}

	this.getWidgetsOfType = function (id) {
		dj_deprecated("getWidgetsOfType is depecrecated, use getWidgetsByType");
		return dojo.widget.manager.getWidgetsByType(id);
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
	var widgetPackages = ["dojo.widget", "dojo.webui.widgets"];
	for (var i=0; i<widgetPackages.length; i++) {
		// convenience for checking if a package exists (reverse lookup)
		widgetPackages[widgetPackages[i]] = true;
	}

	this.registerWidgetPackage = function(pname) {
		if(!widgetPackages[pname]){
			widgetPackages[pname] = true;
			widgetPackages.push(pname);
		}
	}

	this.getImplementation = function(widgetName, ctorObject, mixins){
		// try and find a name for the widget
		var impl = this.getImplementationName(widgetName);
				
		if(impl){
//			var props = [];
//			for (var prop in impl) { props.push(prop); }
//			dj_debug(props.join(", "));
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

		var lowerCaseWidgetName = widgetName.toLowerCase();

		var impl = knownWidgetImplementations[lowerCaseWidgetName];
		if (impl) { return impl; }

		// first store a list of the render prefixes we are capable of rendering
		var renderPrefixes = [];
		for (var renderer in dojo.render) {
			if (dojo.render[renderer]["capable"] === true) {
				var prefixes = dojo.render[renderer].prefixes;
				for (var i = 0; i < prefixes.length; i++) {
					renderPrefixes.push(prefixes[i].toLowerCase());
				}
			}
		}

		// look for a rendering-context specific version of our widget name
		for(var i = 0; i < widgetPackages.length; i++){
			var widgetPackage = dj_eval_object_path(widgetPackages[i]);

			for (var j = 0; j < renderPrefixes.length; j++) {
				if (!widgetPackage[renderPrefixes[j]]) { continue; }
				for (var widgetClass in widgetPackage[renderPrefixes[j]]) {
					if (widgetClass.toLowerCase() != lowerCaseWidgetName) { continue; }
					dj_debug(widgetPackage[renderPrefixes[j]][widgetClass]);
					knownWidgetImplementations[lowerCaseWidgetName] =
						widgetPackage[renderPrefixes[j]][widgetClass];
					return knownWidgetImplementations[lowerCaseWidgetName];
				}
			}

			for (var j = 0; j < renderPrefixes.length; j++) {
				for (var widgetClass in widgetPackage) {
					if (widgetClass.toLowerCase() !=
						(renderPrefixes[j] + lowerCaseWidgetName)) { continue; }
	
					knownWidgetImplementations[lowerCaseWidgetName] =
						widgetPackage[widgetClass];
					return knownWidgetImplementations[lowerCaseWidgetName];
				}
			}
		}
		
		throw new Error('Could not locate "' + widgetName + '" class');
	}

	// FIXME: does it even belong in this name space?
	// NOTE: this method is implemented by DomWidget.js since not all
	// hostenv's would have an implementation.
	this.getWidgetFromPrimitive = function(baseRenderType){
		dj_unimplemented("dojo.widget.manager.getWidgetFromPrimitive");
	}

	this.getWidgetFromEvent = function(nativeEvt){
		dj_unimplemented("dojo.widget.manager.getWidgetFromEvent");
	}

	// FIXME: what else?
}
