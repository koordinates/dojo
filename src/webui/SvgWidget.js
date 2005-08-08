dojo.require("dojo.webui.DomWidget");
dojo.provide("dojo.webui.SvgWidget");
dojo.provide("dojo.webui.SVGWidget"); // back compat

// SVGWidget is a mixin ONLY
dojo.webui.SvgWidget = function(args){
	// mix in the parent type
	// dojo.webui.DomWidget.call(this);
}
dj_inherits(dojo.webui.SvgWidget, dojo.webui.DomWidget);

dojo.lang.extend(dojo.webui.SvgWidget, {
	getContainerHeight: function(){
		// NOTE: container height must be returned as the INNER height
		dj_unimplemented("dojo.webui.SvgWidget.getContainerHeight");
	},

	getContainerWidth: function(){
		// return this.parent.domNode.offsetWidth;
		dj_unimplemented("dojo.webui.SvgWidget.getContainerWidth");
	},

	setNativeHeight: function(height){
		// var ch = this.getContainerHeight();
		dj_unimplemented("dojo.webui.SVGWidget.setNativeHeight");
	},

	createNodesFromText: function(txt, wrap){
		return dojo.xml.domUtil.createNodesFromText(txt, wrap);
	}
});

dojo.webui.SVGWidget = dojo.webui.SvgWidget;

try{
(function(){
	var tf = function(){
		// FIXME: fill this in!!!
		var rw = new function(){
			dojo.webui.SvgWidget.call(this);
			this.buildRendering = function(){ return; }
			this.destroyRendering = function(){ return; }
			this.postInitialize = function(){ return; }
			this.cleanUp = function(){ return; }
			this.widgetType = "SVGRootWidget";
			this.domNode = document.documentElement;
		}
		var wm = dojo.webui.widgetManager;
		wm.root = rw;
		wm.add(rw);

		// extend the widgetManager with a getWidgetFromNode method
		wm.getWidgetFromNode = function(node){
			var filter = function(x){
				if(x.domNode == node){
					return true;
				}
			}
			var widgets = [];
			while((node)&&(widgets.length < 1)){
				widgets = this.getWidgetsByFilter(filter);
				node = node.parentNode;
			}
			if(widgets.length > 0){
				return widgets[0];
			}else{
				return null;
			}
		}

		wm.getWidgetFromEvent = function(domEvt){
			return this.getWidgetFromNode(domEvt.target);
		}

		wm.getWidgetFromPrimitive = wm.getWidgetFromNode;
	}
	// make sure we get called when the time is right
	dojo.event.connect(dojo.hostenv, "loaded", tf);
})();
}catch(e){ alert(e); }
