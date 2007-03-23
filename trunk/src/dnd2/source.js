dojo.provide("dojo.dnd2.source");

dojo.require("dojo.lang.declare");
dojo.require("dojo.event.*");
dojo.require("dojo.html.style");

dojo.require("dojo.dnd2.selector");
dojo.require("dojo.dnd2.manager");

/*
	Container property:
		"Horizontal"- if this is the horizontal container
	Source states:
		""			- normal state
		"Moved"		- this source is being moved
		"Copied"	- this source is being copied
	Target states:
		""			- normal state
		"Disabled"	- the target cannot accept an avatar
	Target anchor state:
		""			- item is not selected
		"Before"	- insert point is before the anchor
		"After"		- insert point is after the anchor
*/

dojo.declare("dojo.dnd2.Source", dojo.dnd2.Selector, 
function(node, params){
	// general variables
	if(!params){ params = {}; }
	this.is_source = typeof params.is_source == "undefined" ? true : params.is_source;
	var types = params.accept instanceof Array ? params.accept : ["text"];
	this.accept = null;
	if(types.length){
		this.accept = {};
		for(var i = 0; i < types.length; ++i){
			this.accept[types[i]] = 1;
		}
	}
	this.horizontal = params.horizontal;
	// class-specific variables
	this.is_dragging = false;
	this.mouse_down = false;
	this.target_anchor = null;
	this.before = true;
	// states
	this.source_state  = "";
	dojo.html.addClass(this.node, "dojoDndSource");
	this.target_state  = "";
	dojo.html.addClass(this.node, "dojoDndTarget");
	if(this.horizontal){ dojo.html.addClass(this.node, "dojoDndHorizontal"); }
	// set up events
	dojo.event.topic.subscribe("dnd_source_over", this, "onDndSourceOver");
	dojo.event.topic.subscribe("dnd_start",  this, "onDndStart");
	dojo.event.topic.subscribe("dnd_drop",   this, "onDndDrop");
	dojo.event.topic.subscribe("dnd_cancel", this, "onDndCancel");
},
{
	// mouse event processors
	onMouseMove: function(e){
		if(this.is_dragging && this.target_state == "Disabled"){ return; }
		dojo.dnd2.Source.superclass.onMouseMove.call(this, e);
		var m = dojo.dnd2.manager();
		if(this.is_dragging){
			// calculate before/after
			var before = false;
			/*
			THIS IS A PLACEHOLDER!
			
			if(this.current){
				if(this.horizontal){
					before = (e.clientX - this.current.clientLeft) < (this.current.offsetWidth / 2);
				}else{
					before = (e.clientY - this.current.clientTop)  < (this.current.offsetHeight / 2);
				}
			}
			*/
			if(this.current != this.target_anchor || before != this.before){
				this.markTargetAnchor(before);
				m.canDrop(!this.current || m.source != this || !(this.current.id in this.selection));
			}
		}else{
			if(this.mouse_down){
				m.startDrag(this, this.getSelectedNodes(), e.ctrlKey);
			}
		}
	},
	onMouseDown: function(e){
		this.mouse_down = true;
		dojo.dnd2.Source.superclass.onMouseDown.call(this, e);
	},
	onMouseUp: function(e){
		this.mouse_down = false;
		dojo.dnd2.Source.superclass.onMouseUp.call(this, e);
	},
	// topic event processors
	onDndSourceOver: function(source){
		if(this != source){
			this.mouse_down = false;
			if(this.target_anchor){
				this.unmarkTargetAnchor();
			}
		}else if(this.is_dragging){
			var m = dojo.dnd2.manager();
			m.canDrop(this.target_state != "Disabled" && (!this.current || m.source != this || !(this.current.id in this.selection)));
		}
	},
	onDndStart: function(source, nodes, copy){
		if(this.is_source){
			this.changeState("Source", this == source ? (copy ? "Copied" : "Moved") : "");
		}
		if(this.accept){
			var accepted = this.checkAcceptance(source, nodes);
			this.changeState("Target", accepted ? "" : "Disabled");
			if(accepted){
				dojo.dnd2.manager().overSource(this);
			}
		}
		this.is_dragging = true;
	},
	onDndDrop: function(source, nodes, copy){
		do{ //break box
			if(this.container_state != "Over"){ break; }
			var old_creator = this.node_creator;
			if(this != source || copy){
				this.selectNone();
				this.node_creator = function(n){
					return old_creator(source.map[n.id].data);
				};
			}else{
				if(this.current.id in this.selection){ break; }
				this.node_creator = function(n){
					var t = source.map[n.id]; return {node: n, data: t.data, types: t.types};
				};
			}
			this.insertNodes(true, nodes, this.before, this.current);
			this.node_creator = old_creator;
			if(this != source && !copy){
				source.deleteSelectedNodes();
			}
		}while(false);
		this.onDndCancel();
	},
	onDndCancel: function(){
		if(this.target_anchor){
			this.unmarkTargetAnchor();
			this.target_anchor = null;
		}
		this.before = true;
		this.is_dragging = false;
		this.changeState("Source", "");
		this.changeState("Target", "");
	},
	// utilities
	onOverEvent: function(){
		dojo.dnd2.Source.superclass.onOverEvent.call(this);
		dojo.dnd2.manager().overSource(this);
	},
	onOutEvent: function(){
		dojo.dnd2.Source.superclass.onOutEvent.call(this);
		dojo.dnd2.manager().outSource(this);
	},
	// methods
	checkAcceptance: function(source, nodes){
		if(this == source){ return true; }
		var accepted = true;
		for(var i = 0; i < nodes.length; ++i){
			var types = source.map[nodes[i].id].types;
			if(types instanceof Array){
				var flag = false;
				for(var j = 0; j < types.length; ++j){
					if(types[j] in this.accept){
						flag = true;
						break;
					}
				}
				if(!flag){
					accepted = false;
					break;
				}
			}else{
				accepted = false;
			}
			if(!accepted){ break; }
		}
		return accepted;
	},
	markTargetAnchor: function(before){
		if(this.current == this.target_anchor && this.before == before){ return; }
		if(this.target_anchor){
			this.removeItemClass(this.target_anchor, this.before ? "Before" : "After");
		}
		this.target_anchor = this.current;
		this.before = before;
		if(this.target_anchor){
			this.addItemClass(this.target_anchor, this.before ? "Before" : "After");
		}
	},
	unmarkTargetAnchor: function(){
		if(!this.target_anchor){ return; }
		this.removeItemClass(this.target_anchor, this.before ? "Before" : "After");
		this.target_anchor = null;
		this.before = true;
	},
	markDndStatus: function(copy){
		this.changeState("Source", copy ? "Copied" : "Moved");
	}
});