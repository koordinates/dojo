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
		evt = evt || window.event;
		dojo.event.browser.stopEvent(evt)

		// FIXME: use whatever we use to do more general style setting?
		// FIXME: FIX this into something useful
		this.domNode.style.left = evt.clientX + "px";
		this.domNode.style.top = evt.clientY + "px";
		this.domNode.style.display = "block";
	}
	
	this.onHide = function(){
		// FIXME: use whatever we use to do more general style setting?
		this.domNode.style.display = "none";
	}
	
	// FIXME: short term hack to show a single context menu in HTML
	// FIXME: need to prevent the default context menu...
	
	dojo.event.connect(document.body, "oncontextmenu", this, "onShow");
}

/*
new function(){ // namespace protection closure
	var hbp = dojo.webui.widgets.HTMLContextMenu.prototype;
	hbp.templateString = ["<button />"].join("");
}; // FIXME: why isnt the (function(){})(); syntax working here??
*/

dj_inherits(dojo.webui.widgets.HTMLContextMenu, dojo.webui.widgets.DomContextMenu);

// dojo.webui.widgets.HTMLContextMenu.prototype.templateString = "<button class='dojoButton' dojoAttachEvent='onClick; onMouseMove: onFoo;' dojoAttachPoint='labelNode'></button>";
