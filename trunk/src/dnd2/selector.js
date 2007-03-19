dojo.provide("dojo.dnd2.selector");

dojo.require("dojo.lang.declare");
dojo.require("dojo.event.*");
dojo.require("dojo.html.style");

dojo.require("dojo.dnd2.container");

/*
	Container item states:
		""			- an item is not selected
		"selected"	- an item is selected
		"anchor"	- an item is selected, and is an anchor for a "shift" selection
*/

dojo.declare("dojo.dnd2.Selector", dojo.dnd2.Container, 
function(node, filter, creator, singular){
	// general variables
	this.singular = singular;
	// class-specific variables
	this.selection = {};
	this.anchor = null;
	this.simple_selection = false;
	// set up events
	dojo.event.connect(node, "onmousedown", this, "onMouseDown");
	dojo.event.connect(node, "onmousemove", this, "onMouseMove");
	dojo.event.connect(node, "onmouseup",   this, "onMouseUp");
},
{
	// mouse events
	onMouseDown: function(e){
		if(!this.current){ return; }
		if(!this.singular && !e.ctrlKey && !e.shiftKey && (this.current.id in this.selection)){
			this.simple_selection = true;
			this.cancelEvent(e);
			return;
		}
		if(!this.singular && e.shiftKey){
			if(!e.ctrlKey){
				var empty = {};
				for(var i in this.selection){
					if(!(i in empty)){
						var n = dojo.byId(i);
						this.removeItemClass(n, "selected");
					}
				}
				this.selection = {};
			}
			var c = this.node.tagName.toLowerCase() == "table" ? this.parent.getElementsByTagName("tr") : this.node.childNodes;
			if(!this.anchor){
				var i = 0;
				for(; i < c.length; ++i){
					var n = c[i];
					if(this.node_filter(n)){ break; }
				}
				this.anchor = c[i];
				this.addItemClass(this.anchor, "anchor");
			}
			this.selection[this.anchor.id] = 1;
			if(this.anchor != this.current){
				var i = 0;
				for(; i < c.length; ++i){
					var n = c[i];
					if(!this.node_filter(n)){ continue; }
					if(n == this.anchor || n == this.current){ break; }
				}
				for(++i; i < c.length; ++i){
					var n = c[i];
					if(!this.node_filter(n)){ continue; }
					if(n == this.anchor || n == this.current){ break; }
					this.addItemClass(n, "selected");
					this.selection[n.id] = 1;
				}
				this.addItemClass(this.current, "selected");
				this.selection[this.current.id] = 1;
			}
		}else{
			if(this.singular){
				if(this.anchor == this.current){
					if(e.ctrlKey){
						this.removeItemClass(this.anchor, "anchor");
						this.anchor = null;
						this.selection = {};
					}
				}else{
					if(this.anchor){
						this.removeItemClass(this.anchor, "anchor");
					}
					this.anchor = this.current;
					this.addItemClass(this.anchor, "anchor");
					this.selection = {};
					this.selection[this.current.id] = 1;
				}
			}else{
				if(e.ctrlKey){
					if(this.anchor == this.current){
						this.removeItemClass(this.anchor, "anchor");
						delete this.selection[this.anchor.id];
						this.anchor = null;
					}else{
						if(this.current.id in this.selection){
							this.removeItemClass(this.current, "selected");
							delete this.selection[this.current.id];
						}else{
							if(this.anchor){
								dojo.html.replaceClass(this.anchor, "dojo_dnd_item_selected", "dojo_dnd_item_anchor");
							}
							this.anchor = this.current;
							this.addItemClass(this.current, "anchor");
							this.selection[this.current.id] = 1;
						}
					}
				}else{
					var empty = {};
					for(var i in this.selection){
						if(!(i in empty)){
							var n = dojo.byId(i);
							this.removeItemClass(n, "selected");
						}
					}
					if(this.anchor){
						this.removeItemClass(this.anchor, "anchor");
					}
					this.selection = {};
					this.anchor = this.current;
					this.addItemClass(this.current, "anchor");
					this.selection[this.current.id] = 1;
				}
			}
		}
		this.cancelEvent(e);
	},
	onMouseMove: function(e){
		this.simple_selection = false;
	},
	onMouseUp: function(e){
		if(!this.simple_selection){ return; }
		this.simple_selection = false;
		this.selectNone();
		if(this.current){
			this.anchor = this.current;
			this.addItemClass(this.anchor, "anchor");
			this.selection[this.current.id] = 1;
		}
	},
	// methods
	getSelectedNodes: function(){
		var t = [];
		var empty = {};
		for(var i in this.selection){
			if(!(i in empty)){
				t.push(dojo.byId(i));
			}
		}
		return t;
	},
	selectNone: function(){
		var empty = {};
		for(var i in this.selection){
			if(!(i in empty)){
				this.removeItemClass(dojo.byId(i), "selected");
			}
		}
		if(this.anchor){
			this.removeItemClass(this.anchor, "anchor");
			this.anchor = null;
		}
		this.selection = {};
	},
	selectAll: function(){
		if(this.anchor){
			this.removeItemClass(this.anchor, "anchor");
			this.anchor = null;
		}
		var c = this.node.tagName.toLowerCase() == "table" ? this.parent.getElementsByTagName("tr") : this.node.childNodes;
		for(var i = 0; i < c.length; ++i){
			var n = c[i];
			if(this.node_filter(n)){
				this.addItemClass(n, "selected");
				this.selection[n.id] = 1;
			}
		}
	},
	deleteSelectedNodes: function(){
		var empty = {};
		for(var i in this.selection){
			if(!(i in empty)){
				var n = dojo.byId(i);
				delete this.map[i];
				n.parentNode.removeChild(n);
			}
		}
		this.anchor = null;
		this.selection = {};
	},
	insertNodes: function(add_selected, data, before, anchor){
		var old_creator = this.node_creator;
		if(add_selected){
			var _this = this;
			this.node_creator = function(d){
				var t = old_creator(d);
				_this.addItemClass(t.node, "selected");
				_this.selection[t.node.id] = 1;
				return t;
			};
		}
		dojo.dnd2.Selector.superclass.insertNodes.call(this, data, before, anchor);
		this.node_creator = old_creator;
	}
});
