dojo.hostenv.startPackage("dojo.webui.widgets.HTMLContextMenu");

dojo.hostenv.loadModule("dojo.webui.widgets.ContextMenu");

dojo.webui.widgets.HTMLContextMenu = function(){
	// if DOMButton turns into a mixin, we should subclass Button instead and
	// just mix in the DOMButton properties.
	dojo.webui.widgets.DomContextMenu.call(this);
	dojo.webui.HTMLWidget.call(this);

	this.templatePath = "src/webui/widgets/templates/HTMLContextMenuTemplate.html";
	this.templateCSSPath = "src/webui/widgets/templates/HTMLContextMenuTemplate.css";

	this.fillInTemplate = function(){
		// this.setLabel();
	}

	this.onShow = function(evt){
		evt.preventDefault();
		evt.stopPropagation();

		// FIXME: use whatever we use to do more general style setting?
		// FIXME: FIX this into something useful
		this.domNode.style.left = evt.clientX + "px";
		this.domNode.style.top = evt.clientY + "px";
		this.domNode.style.display = "block";
		dojo.event.connect(doc, "onclick", this, "onHide");
		return false;
	}
	
	this.onHide = function(){
		// FIXME: use whatever we use to do more general style setting?
		this.domNode.style.display = "none";
		dojo.event.disconnect(doc, "onclick", this, "onHide");
	}
	
	// FIXME: short term hack to show a single context menu in HTML
	// FIXME: need to prevent the default context menu...
	
	var doc = document.documentElement  || document.body;
	dojo.event.connect(doc, "oncontextmenu", this, "onShow");
}

dj_inherits(dojo.webui.widgets.HTMLContextMenu, dojo.webui.widgets.DomContextMenu);
