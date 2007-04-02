dojo.provide("dojo.dnd2.container");

dojo.require("dojo.lang.declare");
dojo.require("dojo.dom");
dojo.require("dojo.event.*");
dojo.require("dojo.html.style");

/*
	Container states:
		""		- normal state
		"Over"	- mouse over a container
	Container item states:
		""		- normal state
		"Over"	- mouse over a container item
*/

dojo.declare("dojo.dnd2.Container", null, 
function(node, params){
	// general variables
	this.node = dojo.byId(node);
	this.nodeFilter  = (params && params.filter)  ? params.filter  : function(n){ return n.nodeType == 1; };
	this.nodeCreator = (params && params.creator) ? params.creator : dojo.dnd2._defaultCreator(this.node);
	// class-specific variables
	this.map = {};
	this.current = null;
	this.parent = this.node;
	// states
	this.containerState = "";
	dojo.html.addClass(this.node, "dojoDndContainer");
	// mark up children
	var c;
	if(this.node.tagName.toLowerCase() == "table"){
		c = this.node.getElementsByTagName("tbody");
		if(c && c.length){
			this.parent = c[0];
		}
		c = this.parent.getElementsByTagName("tr");
	}else{
		c = this.node.childNodes;
	}
	for(var i = 0; i < c.length; ++i){
		var n = c[i];
		if(this.nodeFilter(n)){
			n.id = dojo.dom.getUniqueId();
		}
	}
	// set up events
	dojo.event.connect(this.node, "onmouseover", this, "onMouseOver");
	dojo.event.connect(this.node, "onmouseout",  this, "onMouseOut");
	// cancel text selection and text dragging
	dojo.event.connect(this.node, "ondragstart",   this, "cancelEvent");
	dojo.event.connect(this.node, "onselectstart", this, "cancelEvent");
},
{
	// mouse events
	onMouseOver: function(e){
		if(!dojo.dom.isDescendantOf(e.relatedTarget, this.node)){
			this.changeState("Container", "Over");
			this.onOverEvent();
		}
		var node = this.getChildByEvent(e);
		if(this.current == node){ return; }
		if(this.current){ this.removeItemClass(this.current, "Over"); }
		if(node){ this.addItemClass(node, "Over"); }
		this.current = node;
	},
	onMouseOut: function(e){
		if(dojo.dom.isDescendantOf(e.relatedTarget, this.node)){ return; }
		if(this.current){
			this.removeItemClass(this.current, "Over");
			this.current = null;
		}
		this.changeState("Container", "");
		this.onOutEvent();
	},
	// methods
	getAllNodes: function(){
		var t = [];
		var c = this.node.tagName.toLowerCase() == "table" ? this.parent.getElementsByTagName("tr") : this.node.childNodes;
		for(var i = 0; i < c.length; ++i){
			var n = c[i];
			if(this.nodeFilter(n)){
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
				var t = this.nodeCreator(data[i]);
				this.map[t.node.id] = {data: t.data, types: t.types};
				this.parent.insertBefore(t.node, anchor);
			}
		}else{
			for(var i = 0; i < data.length; ++i){
				var t = this.nodeCreator(data[i]);
				this.map[t.node.id] = {data: t.data, types: t.types};
				this.parent.appendChild(t.node);
			}
		}
		return this;
	},
	// utilities
	onOverEvent: function(){},
	onOutEvent: function(){},
	cancelEvent: function(e){ dojo.event.browser.stopEvent(e); },
	changeState: function(type, newState){
		var prefix = "dojoDnd" + type;
		var state  = type.toLowerCase() + "State";
		dojo.html.replaceClass(this.node, prefix + newState, prefix + this[state]);
		this[state] = newState;
	},
	addItemClass:    function(node, type){ dojo.html.addClass(node, "dojoDndItem" + type); },
	removeItemClass: function(node, type){ dojo.html.removeClass(node, "dojoDndItem" + type); },
	getChildByEvent: function(e){
		var node = e.target;
		if(node == this.node){ return null; }
		var parent = node.parentNode;
		while(parent && parent != this.parent && node != this.node){
			node = parent;
			parent = node.parentNode;
		}
		return (parent && this.nodeFilter(node)) ? node : null;
	}
});

dojo.dnd2._createNode = function(tag){
	if(!tag){ return dojo.dnd2._createSpan; }
	return function(text){
		var n = dojo.doc().createElement(tag);
		n.innerHTML = text;
		return n;
	};
};

dojo.dnd2._createTrTd = function(text){
	var tr = dojo.doc().createElement("tr");
	var td = dojo.doc().createElement("td");
	td.innerHTML = text;
	tr.appendChild(td);
	return tr;
};

dojo.dnd2._createSpan = function(text){
	var n = dojo.doc().createElement("span");
	n.innerHTML = text;
	return n;
};

dojo.dnd2._defaultCreatorNodes = {ul: "li", ol: "li", div: "div", p: "div"};
dojo.dnd2._defaultCreator = function(node){
	var tag = node.tagName.toLowerCase();
	var c = tag == "table" ? dojo.dnd2._createTrTd : dojo.dnd2._createNode(dojo.dnd2._defaultCreatorNodes[tag]);
	var r = dojo.lang.repr ? dojo.lang.repr : function(o){ return o + ""; };
	return function(data, hint){
		var t = r(data);
		var n = (hint == "avatar" ? dojo.dnd2._createSpan : c)(t);
		n.id = dojo.dom.getUniqueId();
		return {node: n, data: data, types: ["text"]};
	};
};