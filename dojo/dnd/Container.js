dojo.provide("dojo.dnd.Container");

dojo.required("dojo.dnd.common");
dojo.required("dojo.parser");

/*
	Container states:
		""		- normal state
		"Over"	- mouse over a container
	Container item states:
		""		- normal state
		"Over"	- mouse over a container item
*/

dojo.declare("dojo.dnd.Container", null, {
	// summary: a Container object, which knows when mouse hovers over it, 
	//	and over which element it hovers
	
	// object attributes (for markup)
	skipForm: false,
	
	constructor: function(node, params){
		// summary: a constructor of the Container
		// node: Node: node or node's id to build the container on
		// params: Object: a dict of parameters, recognized parameters are:
		//	creator: Function: a creator function, which takes a data item, and returns an object like that:
		//		{node: newNode, data: usedData, type: arrayOfStrings}
		//	skipForm: Boolean: don't start the drag operation, if clicked on form elements
		//	dropParent: Node: node or node's id to use as the parent node for dropped items
		//		(must be underneath the 'node' parameter in the DOM)
		//	_skipStartup: Boolean: skip startup(), which collects children, for deferred initialization
		//		(this is used in the markup mode)
		this.node = dojo.byId(node);
		if(!params){ params = {}; }
		this.creator = params.creator || null;
		this.skipForm = params.skipForm;
		this.parent = params.dropParent && dojo.byId(params.dropParent);
		
		// class-specific variables
		this.map = {};
		this.current = null;

		// states
		this.containerState = "";
		dojo.addClass(this.node, "dojoDndContainer");
		
		// mark up children
		if(!(params && params._skipStartup)){
			this.startup();
		}

		// set up events
		this.events = [
			dojo.connect(this.node, "onmouseover", this, "onMouseOver"),
			dojo.connect(this.node, "onmouseout",  this, "onMouseOut"),
			// cancel text selection and text dragging
			dojo.connect(this.node, "ondragstart",   this, "onSelectStart"),
			dojo.connect(this.node, "onselectstart", this, "onSelectStart")
		];
	},
	
	// object attributes (for markup)
	creator: function(){},	// creator function, dummy at the moment
	
	// abstract access to the map
	getItem: function(/*String*/ key){
		// summary: returns a data item by its key (id)
		return this.map[key];	// Object
	},
	setItem: function(/*String*/ key, /*Object*/ data){
		// summary: associates a data item with its key (id)
		this.map[key] = data;
	},
	delItem: function(/*String*/ key){
		// summary: removes a data item from the map by its key (id)
		delete this.map[key];
	},
	forInItems: function(/*Function*/ f, /*Object?*/ o){
		// summary: iterates over a data map skipping members, which 
		//	are present in the empty object (IE and/or 3rd-party libraries).
		o = o || dojo.global;
		var m = this.map, e = dojo.dnd._empty;
		for(var i in m){
			if(i in e){ continue; }
			f.call(o, m[i], i, this);
		}
		return o;	// Object
	},
	clearItems: function(){
		// summary: removes all data items from the map
		this.map = {};
	},
	
	// methods
	getAllNodes: function(){
		// summary: returns a list (an array) of all valid child nodes
		return dojo.query("> .dojoDndItem", this.parent);	// NodeList
	},
	sync: function(){
		// summary: synch up the node list with the data map
		var map = {};
		this.getAllNodes().forEach(function(node){
			if(node.id){
				var item = this.getItem(node.id);
				if(item){
					map[node.id] = item;
					return;
				}
			}else{
				node.id = dojo.dnd.getUniqueId();
			}
			var type = node.getAttribute("dndType"),
				data = node.getAttribute("dndData");
			map[node.id] = {
				data: data || node.innerHTML,
				type: type ? type.split(/\s*,\s*/) : ["text"]
			};
		}, this);
		this.map = map;
		return this;	// self
	},
	insertNodes: function(data, before, anchor){
		// summary: inserts an array of new nodes before/after an anchor node
		// data: Array: a list of data items, which should be processed by the creator function
		// before: Boolean: insert before the anchor, if true, and after the anchor otherwise
		// anchor: Node: the anchor node to be used as a point of insertion

		var i, len, t;

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
		len = data.length;
		if(anchor){
			for(i = 0; i < len; ++i){
				t = this._normalizedCreator(data[i]);
				this.setItem(t.node.id, {data: t.data, type: t.type});
				this.parent.insertBefore(t.node, anchor);
			}
		}else{
			for(i = 0; i < len; ++i){
				t = this._normalizedCreator(data[i]);
				this.setItem(t.node.id, {data: t.data, type: t.type});
				this.parent.appendChild(t.node);
			}
		}
		return this;	// self
	},
	destroy: function(){
		// summary: prepares the object to be garbage-collected
		dojo.forEach(this.events, dojo.disconnect);
		this.clearItems();
		this.node = this.parent = this.current = null;
	},

	// markup methods
	markupFactory: function(params, node){
		params._skipStartup = true;
		return new dojo.dnd.Container(node, params);
	},
	startup: function(){
		// summary: collects valid child items and populate the map
		
		// set up the real parent node
		if(!this.parent){
			// use the standard algorithm, if not assigned
			this.parent = this.node;
			if(this.parent.tagName.toLowerCase() == "table"){
				var c = this.parent.getElementsByTagName("tbody");
				if(c && c.length){ this.parent = c[0]; }
			}
		}
		this.defaultCreator = dojo.dnd._defaultCreator(this.parent);

		// process specially marked children
		this.sync();
	},

	// mouse events
	onMouseOver: function(e){
		// summary: event processor for onmouseover
		// e: Event: mouse event
		var n = e.relatedTarget;
		while(n){
			if(n == this.node){ break; }
			try{
				n = n.parentNode;
			}catch(x){
				n = null;
			}
		}
		if(!n){
			this._changeState("Container", "Over");
			this.onOverEvent();
		}
		n = this._getChildByEvent(e);
		if(this.current == n){ return; }
		if(this.current){ this._removeItemClass(this.current, "Over"); }
		if(n){ this._addItemClass(n, "Over"); }
		this.current = n;
	},
	onMouseOut: function(e){
		// summary: event processor for onmouseout
		// e: Event: mouse event
		for(var n = e.relatedTarget; n;){
			if(n == this.node){ return; }
			try{
				n = n.parentNode;
			}catch(x){
				n = null;
			}
		}
		if(this.current){
			this._removeItemClass(this.current, "Over");
			this.current = null;
		}
		this._changeState("Container", "");
		this.onOutEvent();
	},
	onSelectStart: function(e){
		// summary: event processor for onselectevent and ondragevent
		// e: Event: mouse event
		if(!this.skipForm || !dojo.dnd.isFormElement(e)){
			dojo.stopEvent(e);
		}
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
		//dojo.replaceClass(this.node, prefix + newState, prefix + this[state]);
		dojo.removeClass(this.node, prefix + this[state]);
		dojo.addClass(this.node, prefix + newState);
		this[state] = newState;
	},
	_addItemClass: function(node, type){
		// summary: adds a class with prefix "dojoDndItem"
		// node: Node: a node
		// type: String: a variable suffix for a class name
		dojo.addClass(node, "dojoDndItem" + type);
	},
	_removeItemClass: function(node, type){
		// summary: removes a class with prefix "dojoDndItem"
		// node: Node: a node
		// type: String: a variable suffix for a class name
		dojo.removeClass(node, "dojoDndItem" + type);
	},
	_getChildByEvent: function(e){
		// summary: gets a child, which is under the mouse at the moment, or null
		// e: Event: a mouse event
		var node = e.target;
		if(node){
			for(var parent = node.parentNode; parent; node = parent, parent = node.parentNode){
				if(parent == this.parent && dojo.hasClass(node, "dojoDndItem")){ return node; }
			}
		}
		return null;
	},
	_normalizedCreator: function(item, hint){
		// summary: adds all necessary data to the output of the user-supplied creator function
		var t = (this.creator || this.defaultCreator).call(this, item, hint);

		// NOTE: what are the possible values for type?

		if(!dojo.isArray(t.type)){ t.type = ["text"]; }
		if(!t.node.id){ t.node.id = dojo.dnd.getUniqueId(); }
		dojo.addClass(t.node, "dojoDndItem");
		return t;
	}
});

dojo.dnd._createNode = function(tag){
	// summary: returns a function, which creates an element of given tag 
	//	(SPAN by default) and sets its innerHTML to given text
	// tag: String: a tag name or empty for SPAN
	if(!tag){ return dojo.dnd._createSpan; }
	return function(text){	// Function
		return dojo.create(tag, {innerHTML: text});	// Node
	};
};

dojo.dnd._createTrTd = function(text){
	// summary: creates a TR/TD structure with given text as an innerHTML of TD
	// text: String: a text for TD
	var tr = dojo.create("tr");
	dojo.create("td", {innerHTML: text}, tr);
	return tr;	// Node
};

dojo.dnd._createSpan = function(text){
	// summary: creates a SPAN element with given text as its innerHTML
	// text: String: a text for SPAN
	return dojo.create("span", {innerHTML: text});	// Node
};

// dojo.dnd._defaultCreatorNodes: Object: a dicitionary, which maps container tag names to child tag names
dojo.dnd._defaultCreatorNodes = {ul: "li", ol: "li", div: "div", p: "div"};

dojo.dnd._defaultCreator = function(node){
	// summary: takes a parent node, and returns an appropriate creator function
	// node: Node: a container node
	var tag = node.tagName.toLowerCase();
	var c = tag == "tbody" || tag == "thead" ? dojo.dnd._createTrTd :
			dojo.dnd._createNode(dojo.dnd._defaultCreatorNodes[tag]);
	return function(item, hint){	// Function
		var isObj = item && dojo.isObject(item), data, type, n;
		if(isObj && item.tagName && item.nodeType && item.getAttribute){
			// process a DOM node
			data = item.getAttribute("dndData") || item.innerHTML;
			type = item.getAttribute("dndType");
			type = type ? type.split(/\s*,\s*/) : ["text"];
			n = item;	// this node is going to be moved rather than copied
		}else{
			// process a DnD item object or a string
			data = (isObj && item.data) ? item.data : item;
			type = (isObj && item.type) ? item.type : ["text"];
			n = (hint == "avatar" ? dojo.dnd._createSpan : c)(String(data));
		}
		n.id = dojo.dnd.getUniqueId();
		return {node: n, data: data, type: type};
	};
};
