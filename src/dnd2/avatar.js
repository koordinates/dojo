dojo.provide("dojo.dnd2.avatar");

dojo.require("dojo.html.style");
dojo.require("dojo.html.layout");
dojo.require("dojo.html.display");

dojo.dnd2.Avatar = function(manager){
	// summary: an object, which represents transferred DnD items visually
	// manager: Object: a DnD manager object
	this.manager = manager;
	this.construct();
	// calculate various offsets
	this.offX = dojo.dnd2._getOffset(this.node, "left");
	this.offY = dojo.dnd2._getOffset(this.node, "top");
};

dojo.dnd2._getOffset = function(node, side){
	// summary: calculates an offset for a content box
	// node: Node: a node
	// side: String: a side of a box ("left", "right", "top", or "bottom")
	var h = dojo.html;
	return h.getMarginExtent(node, side) + h.getBorderExtent(node, side) + h.getPaddingExtent(node, side);	// Number
};

dojo.extend(dojo.dnd2.Avatar, {
	construct: function(){
		// summary: a constructor function;
		//	it is separate so it can be (dynamically) overwritten in case of need
		var h = dojo.html;
		var a = dojo.doc().createElement("table");
		h.addClass(a, "dojoDndAvatar");
		a.style.position = "absolute";
		a.style.zIndex = 999;
		var b = dojo.doc().createElement("tbody");
		var tr = dojo.doc().createElement("tr");
		h.addClass(tr, "dojoDndAvatarHeader");
		var td = dojo.doc().createElement("td");
		td.innerHTML = this._generateText();
		tr.appendChild(td);
		h.setOpacity(tr, 0.9);
		b.appendChild(tr);
		var k = Math.min(5, this.manager.nodes.length);
		for(var i = 0; i < k; ++i){
			tr = dojo.doc().createElement("tr");
			h.addClass(tr, "dojoDndAvatarItem");
			td = dojo.doc().createElement("td");
			var t = this.manager.source.nodeCreator(this.manager.source.map[this.manager.nodes[i].id].data, "avatar");
			td.appendChild(t.node);
			tr.appendChild(td);
			h.setOpacity(tr, (6 - i) / 10);
			b.appendChild(tr);
		}
		a.appendChild(b);
		this.node = a;
	},
	destroy: function(){
		// summary: a desctructor for the avatar, called to remove all references so it can be garbage-collected
		this.node.parentNode.removeChild(this.node);
		this.node = false;
	},
	update: function(){
		// summary: updates the avatar to reflect the current DnD state
		dojo.html[(this.manager.canDropFlag ? "add" : "remove") + "Class"](this.node, "dojoDndAvatarCanDrop");
		// replace text
		var t = this.node.getElementsByTagName("td");
		for(var i = 0; i < t.length; ++i){
			var n = t[i];
			if(dojo.html.hasClass(n.parentNode, "dojoDndAvatarHeader")){
				n.innerHTML = this._generateText();
				break;
			}
		}
	},
	_generateText: function(){
		// summary: generates a proper text to reflect copying or moving of items
		return (this.manager.copy ? "copy" : "mov") + "ing " + this.manager.nodes.length + " item" + (this.manager.nodes.length != 1 ? "s" : "");	
	}
});