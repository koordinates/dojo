dojo.provide("dojo.dnd2.move");

dojo.require("dojo.event.*");
dojo.require("dojo.html.layout");

dojo.dnd2.Mover = function(node, e){
	this.node = dojo.byId(node);
	this.mouse_x = e.pageX;
	this.mouse_y = e.pageY;
	var h = dojo.html;
	this.node_pos = h.abs(this.node, true, h.boxSizing.MARGIN_BOX);
	dojo.event.connect(dojo.doc(), "onmousemove", this, "onMouseMove");
	dojo.event.connect(dojo.doc(), "onmouseup",   this, "onMouseUp");
	// cancel text selection and text dragging
	dojo.event.connect(dojo.doc(), "ondragstart",   dojo.event.browser, "stopEvent");
	dojo.event.connect(dojo.doc(), "onselectstart", dojo.event.browser, "stopEvent");
};

dojo.extend(dojo.dnd2.Mover, {
	// mouse event processors
	onMouseMove: function(e){
		var s = this.node.style;
		s.position = "absolute";	// enforcing the absolute mode
		s.left = (e.pageX - this.mouse_x + this.node_pos.x) + "px";
		s.top  = (e.pageY - this.mouse_y + this.node_pos.y) + "px";
	},
	onMouseUp: function(e){
		this.cancel();
	},
	// utilities
	cancel: function(){
		dojo.event.disconnect(dojo.doc(), "onmousemove", this, "onMouseMove");
		dojo.event.disconnect(dojo.doc(), "onmouseup",   this, "onMouseUp");
		dojo.event.disconnect(dojo.doc(), "ondragstart",   dojo.event.browser, "stopEvent");
		dojo.event.disconnect(dojo.doc(), "onselectstart", dojo.event.browser, "stopEvent");
		this.node = null;
	}
});

dojo.dnd2.move = function(node, e){ return new dojo.dnd2.Mover(node, e); };

dojo.dnd2.Moveable = function(node, handle){
	if(!handle){ handle = node; }
	this.node = dojo.byId(node);
	this.handle = dojo.byId(handle);
	if(!this.handle){ this.handle = this.node; }
	dojo.event.connect(this.handle, "onmousedown", this, "onMouseDown");
	// cancel text selection and text dragging
	dojo.event.connect(this.handle, "ondragstart",   dojo.event.browser, "stopEvent");
	dojo.event.connect(this.handle, "onselectstart", dojo.event.browser, "stopEvent");
};

dojo.extend(dojo.dnd2.Moveable, {
	// mouse event processors
	onMouseDown: function(e){
		dojo.dnd2.move(this.node, e);
		dojo.event.browser.stopEvent(e);
	},
	// utilities
	cancel: function(){
		dojo.event.disconnect(this.handle, "onmousedown", this, "onMouseDown");
		dojo.event.disconnect(this.handle, "ondragstart",   dojo.event.browser, "stopEvent");
		dojo.event.disconnect(this.handle, "onselectstart", dojo.event.browser, "stopEvent");
		this.node = this.handle = null;
	}
});