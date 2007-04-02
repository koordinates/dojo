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
	// summary: a Container object, which knows when mouse hovers over it, 
	//	and know over which element it hovers
function(node, params){
	// summary: a constructor of the Container
	// node: Node: node or node's id to build the container on
	// params: Object: a dict of parameters, recognized parameters are:
	//	filter: Function: a filter function, which is used to filter out children of the container
	//	creator: Function: a creator function, which takes a data item, and returns an object like that:
	//		{node: newNode, data: usedData, types: arrayOfStrings}
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
	dojo.event.connect(this.node, "ondragstart",   dojo.event.browser, "stopEvent");
	dojo.event.connect(this.node, "onselectstart", dojo.event.browser, "stopEvent");
},
{
	// mouse events
	onMouseOver: function(e){
		// summary: event processor for onmouseover
		// e: Event: mouse event
		if(!dojo.dom.isDescendantOf(e.relatedTarget, this.node)){
			this._changeState("Container", "Over");
			this.onOverEvent();
		}
		var node = this._getChildByEvent(e);
		if(this.current == node){ return; }
		if(this.current){ this._removeItemClass(this.current, "Over"); }
		if(node){ this._addItemClass(node, "Over"); }
		this.current = node;
	},
	onMouseOut: function(e){
		// summary: event processor for onmouseout
		// e: Event: mouse event
		if(dojo.dom.isDescendantOf(e.relatedTarget, this.node)){ return; }
		if(this.current){
			this._removeItemClass(this.current, "Over");
			this.current = null;
		}
		this._changeState("Container", "");
		this.onOutEvent();
	},
	// methods
	getAllNodes: function(){
		// summary: returns a list (an array) of all valid child nodes
		var t = [];
		var c = this.node.tagName.toLowerCase() == "table" ? this.parent.getElementsByTagName("tr") : this.node.childNodes;
		for(var i = 0; i < c.length; ++i){
			var n = c[i];
			if(this.nodeFilter(n)){
				t.push(n);
			}
		}
		return t;	// Array
	},
	insertNodes: function(data, before, anchor){
		// summary: inserts an array of new nodes before/after an anchor node
		// data: Array: a list of data items, which should be processed by the creator function
		// before: Boolean: insert before the anchor, if true, and after the anchot otherwise
		// anchor: Node: the anchor node to be used as a point of insertion
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
		return this;	// self
	},
	// utilities
	onOverEvent: function(){
		// summary: this function is called once, when mouse is over our container
	},
	onOutEvent: function(){
		// summary: this function is called once, when mouse is out of our container
	},
	_changeState: function(type, newState){
		// summary: changes a named state to new state value
		// type: String: a name of the state to change
		// newState: String: new state
		var prefix = "dojoDnd" + type;
		var state  = type.toLowerCase() + "State";
		dojo.html.replaceClass(this.node, prefix + newState, prefix + this[state]);
		this[state] = newState;
	},
	_addItemClass: function(node, type){
		// summary: adds a class with prefix "dojoDndItem"
		// node: Node: a node
		// type: String: a variable suffix for a class name
		dojo.html.addClass(node, "dojoDndItem" + type);
	},
	_removeItemClass: function(node, type){
		// summary: removes a class with prefix "dojoDndItem"
		// node: Node: a node
		// type: String: a variable suffix for a class name
		dojo.html.removeClass(node, "dojoDndItem" + type);
	},
	_getChildByEvent: function(e){
		// summary: gets a child, which is under the mouse at the moment
		// e: Event: a mouse event
		var node = e.target;
		if(node == this.node){ return null; }
		var parent = node.parentNode;
		while(parent && parent != this.parent && node != this.node){
			node = parent;
			parent = node.parentNode;
		}
		return (parent && this.nodeFilter(node)) ? node : null;	// Node
	}
});

dojo.dnd2._createNode = function(tag){
	// summary: returns a function, which creates an element of given tag 
	//	(SPAN by default) and sets its innerHTML to given text
	// tag: String: a tag name or empty for SPAN
	if(!tag){ return dojo.dnd2._createSpan; }
	return function(text){	// Function
		var n = dojo.doc().createElement(tag);
		n.innerHTML = text;
		return n;
	};
};

dojo.dnd2._createTrTd = function(text){
	// summary: creates a TR/TD structure with given text as an innerHTML of TD
	// text: String: a text for TD
	var tr = dojo.doc().createElement("tr");
	var td = dojo.doc().createElement("td");
	td.innerHTML = text;
	tr.appendChild(td);
	return tr;	// Node
};

dojo.dnd2._createSpan = function(text){
	// summary: creates a SPAN element with given text as its innerHTML
	// text: String: a text for SPAN
	var n = dojo.doc().createElement("span");
	n.innerHTML = text;
	return n;	// Node
};

// dojo.dnd2._defaultCreatorNodes: Object: a dicitionary, which maps container tag names to child tag names
dojo.dnd2._defaultCreatorNodes = {ul: "li", ol: "li", div: "div", p: "div"};

dojo.dnd2._defaultCreator = function(node){
	// summary: takes a container node, and returns an appropriate creator function
	// node: Node: a container node
	var tag = node.tagName.toLowerCase();
	var c = tag == "table" ? dojo.dnd2._createTrTd : dojo.dnd2._createNode(dojo.dnd2._defaultCreatorNodes[tag]);
	var r = dojo.lang.repr ? dojo.lang.repr : function(o){ return o + ""; };
	return function(data, hint){	// Function
		var t = r(data);
		var n = (hint == "avatar" ? dojo.dnd2._createSpan : c)(t);
		n.id = dojo.dom.getUniqueId();
		return {node: n, data: data, types: ["text"]};
	};
};