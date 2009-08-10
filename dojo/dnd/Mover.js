dojo.provide("dojo.dnd.Mover");
dojo.require("dojo.dnd.autoscroll");
dojo.declare("dojo.dnd.Mover", null, {
	constructor: function(node, e, host){

		// summary: an object, which makes a node follow the mouse, 
		//	used as a default mover, and as a base class for custom movers
		// node: Node: a node (or node's id) to be moved
		// e: Event: a mouse event, which started the move;
		//	only pageX and pageY properties are used
		// host: Object?: object which implements the functionality of the move,
		//	 and defines proper events (onMoveStart and onMoveStop)

		this.node = dojo.byId(node);
		this.mouseCoords = {l: e.pageX, t: e.pageY};
		this.marginBox = {};
		this.mouseButton = e.button;
		var h = this.host = host, d = node.ownerDocument, 
			firstEvent = dojo.connect(d, "onmousemove", this, "onFirstMove");
		this.events = [
			dojo.connect(d, "onmousemove", this, "onMouseMove"),
			dojo.connect(d, "onmouseup",   this, "onMouseUp"),
			// cancel text selection and text dragging
			dojo.connect(d, "ondragstart",   dojo.stopEvent),
			dojo.connect(d.body, "onselectstart", dojo.stopEvent),
			firstEvent
		];
		// notify that the move has started
		if(h && h.onMoveStart){
			h.onMoveStart(this);
		}
	},
	// mouse event processors
	onMouseMove: function(e){
		// summary: event processor for onmousemove
		// e: Event: mouse event
		dojo.dnd.autoScroll(e);
		var m = this.marginBox;
		var mc = this.mouseCoords;
		this.host.onMove(this, {l: m.l + (e.pageX - mc.l), t: m.t + (e.pageY - mc.t)});
		dojo.stopEvent(e);
	},
	onMouseUp: function(e){

		// NOTE: what is this line for?

		if(this.mouseButton == 2 ? e.button === 0 : this.mouseButton == e.button){
			this.destroy();
		}
		dojo.stopEvent(e);
	},
	// utilities
	onFirstMove: function(){
		// summary: makes the node absolute; it is meant to be called only once. 
		// 	relative and absolutely positioned nodes are assumed to use pixel units
		var s = dojo.getComputedStyle(this.node), l, t, h = this.host, coords;
		switch(s.position){
		case "fixed":
		case "relative":
		case "absolute":
			l = dojo.getStylePixels(this.node, 'left');
			t = dojo.getStylePixels(this.node, 'top');
		default:
			this.node.style.position = "absolute"; // Make absolute
		}
		if (isNaN(t) || isNaN(l)) {
			coords = dojo.coords(this.node, true);
			l = coords.x;
			t = coords.y;
		}
		this.marginBox.l = l;
		this.marginBox.t = t;
		if(h && h.onFirstMove){
			h.onFirstMove(this);
		}
		dojo.disconnect(this.events.pop());
	},
	destroy: function(){
		// summary: stops the move, deletes all references, so the object can be garbage-collected
		dojo.forEach(this.events, dojo.disconnect);
		// undo global settings
		var h = this.host;
		if(h && h.onMoveStop){
			h.onMoveStop(this);
		}
		// destroy objects
		this.events = this.node = this.host = null;
	}
});