dojo.provide("dojo.dnd2.move");

dojo.require("dojo.event.*");
dojo.require("dojo.html.layout");

dojo.dnd2.Mover = function(node, e){
	// summary: an object, which makes a node follow the mouse
	// node: Node: a node (or node's id) to be moved
	// e: Event: a mouse event, which started the move;
	//	only pageX and pageY properties are used
	this.node = dojo.byId(node);
	this.mouseX = e.pageX;
	this.mouseY = e.pageY;
	var h = dojo.html;
	this.nodePos = h.abs(this.node, true, h.boxSizing.MARGIN_BOX);
	dojo.event.connectOnce(dojo.doc(), "onmousemove", this, "_makeAbsolute");
	dojo.event.connect(dojo.doc(), "onmousemove", this, "onMouseMove");
	dojo.event.connect(dojo.doc(), "onmouseup",   this, "destroy");
	// cancel text selection and text dragging
	dojo.event.connect(dojo.doc(), "ondragstart",   dojo.event.browser, "stopEvent");
	dojo.event.connect(dojo.doc(), "onselectstart", dojo.event.browser, "stopEvent");
};

dojo.extend(dojo.dnd2.Mover, {
	// mouse event processors
	onMouseMove: function(e){
		// summary: event processor for onmousemove
		// e: Event: mouse event
		var s = this.node.style;
		s.left = (e.pageX - this.mouseX + this.nodePos.x) + "px";
		s.top  = (e.pageY - this.mouseY + this.nodePos.y) + "px";
	},
	// utilities
	_makeAbsolute: function(){
		// summary: makes the node absolute; it is meant to be called only once
		this.node.style.position = "absolute";	// enforcing the absolute mode
	},
	destroy: function(){
		// summary: stops the move, deletes all references, so the object can be garbage-collected
		dojo.event.disconnect(dojo.doc(), "onmousemove", this, "_makeAbsolute");
		dojo.event.disconnect(dojo.doc(), "onmousemove", this, "onMouseMove");
		dojo.event.disconnect(dojo.doc(), "onmouseup",   this, "onMouseUp");
		dojo.event.disconnect(dojo.doc(), "ondragstart",   dojo.event.browser, "stopEvent");
		dojo.event.disconnect(dojo.doc(), "onselectstart", dojo.event.browser, "stopEvent");
		this.node = null;
	}
});

dojo.dnd2.Moveable = function(node, handle){
	// summary: an object, which makes a node moveable
	// node: Node: a node (or node's id) to be moved
	// handle: Node: a node (or node's id), which is used as a mouse handle;
	//	if omitted, the node itself is used as a handle
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
		// summary: event processor for onmousedown, creates a Mover for the node
		// e: Event: mouse event
		new dojo.dnd2.Mover(this.node, e);
		dojo.event.browser.stopEvent(e);
	},
	// utilities
	destroy: function(){
		// summary: stops watching for possible move, deletes all references, so the object can be garbage-collected
		dojo.event.disconnect(this.handle, "onmousedown", this, "onMouseDown");
		dojo.event.disconnect(this.handle, "ondragstart",   dojo.event.browser, "stopEvent");
		dojo.event.disconnect(this.handle, "onselectstart", dojo.event.browser, "stopEvent");
		this.node = this.handle = null;
	}
});