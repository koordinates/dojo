dojo.provide("dojo.dnd2.container");

dojo.require("dojo.lang.declare");
dojo.require("dojo.dom");
dojo.require("dojo.event.*");
dojo.require("dojo.html.style");

/*
	Container states:
		""		- normal state
		"over"	- mouse over a container
	Container item states:
		""		- normal state
		"over"	- mouse over a container item
*/

dojo.declare("dojo.dnd2.Container", null, 
function(node, filter, creator){
	// general variables
	this.node = node;
	this.node_filter  = filter  ? filter  : function(n){ return n.nodeType == 1; };
	this.node_creator = creator ? creator : null; // TODO: add some reasonable default
	// class-specific variables
	this.parent = node;
	this.map = {};
	this.container_state = "";
	dojo.html.addClass(node, "dojo_dnd_container_");
	this.current = null;
	// mark up children
	var c;
	if(node.tagName.toLowerCase() == "table"){
		c = node.getElementsByTagName("tbody");
		if(c && c.length){
			this.parent = c[0];
		}
		c = this.parent.getElementsByTagName("tr");
	}else{
		c = node.childNodes;
	}
	for(var i = 0; i < c.length; ++i){
		var n = c[i];
		if(this.node_filter(n)){
			n.id = dojo.dom.getUniqueId();
		}
	}
	// set up events
	dojo.event.connectBefore(dojo.body(), "onmousemove", this, "onMouseMoveGlobal");
	// cancel text selection and text dragging
	dojo.event.connect(node, "ondragstart",   this, "cancelEvent");
	dojo.event.connect(node, "onselectstart", this, "cancelEvent");
},
{
	// mouse events
	onMouseMoveGlobal: function(e){
		var node = this.getChildByEvent(e);
		if(!node){
			if(this.container_state == "over"){
				if(this.current){
					this.removeItemClass(this.current, "over");
					this.current = null;
				}
				this.changeState("container", "");
				this.onOutEvent();
			}
			return;
		}
		if(this.container_state != "over"){
			this.changeState("container", "over");
		}
		if(node == this.node){ return; }
		if(this.current != node){
			if(this.current){
				this.removeItemClass(this.current, "over");
			}
			this.addItemClass(node, "over");
			this.current = node;
		}
	},
	// methods
	getAllNodes: function(){
		var t = [];
		var c = this.node.tagName.toLowerCase() == "table" ? this.parent.getElementsByTagName("tr") : this.node.childNodes;
		for(var i = 0; i < c.length; ++i){
			var n = c[i];
			if(this.node_filter(n)){
				t.push(n);
			}
		}
		return t;
	},
	insertNodes: function(data, before, anchor){
		if(!this.parent.firstChild){
			anchor = null;
		}else if(before){
			if(!anchor){
				anchor = this.parent.firstChild;
			}
		}else{
			if(anchor){
				anchor = anchor.nextSibling;
			}
		}
		if(anchor){
			for(var i = 0; i < data.length; ++i){
				var t = this.node_creator(data[i]);
				this.map[t.node.id] = {data: t.data, types: t.types};
				this.parent.insertBefore(t.node, anchor);
			}
		}else{
			for(var i = 0; i < data.length; ++i){
				var t = this.node_creator(data[i]);
				this.map[t.node.id] = {data: t.data, types: t.types};
				this.parent.appendChild(t.node);
			}
		}
	},
	onOutEvent: function(){},
	// utilities
	cancelEvent: function(e){ e.stopPropagation(); e.preventDefault(); },
	changeState: function(type, new_state){
		var prefix = "dojo_dnd_" + type + "_";
		var state  = type + "_state";
		dojo.html.replaceClass(this.node, prefix + new_state, prefix + this[state]);
		this[state] = new_state;
	},
	addItemClass:    function(node, type){ dojo.html.addClass(node, "dojo_dnd_item_" + type); },
	removeItemClass: function(node, type){ dojo.html.removeClass(node, "dojo_dnd_item_" + type); },
	getChildByEvent: function(e){
		var node = e.target;
		if(node == this.node){ return node; }
		var parent = node.parentNode;
		while(parent && parent != this.parent && node != this.node){
			node = parent;
			parent = node.parentNode;
		}
		return parent ? (node.nodeType == 1 ? node : this.node) : null;
	}
});
