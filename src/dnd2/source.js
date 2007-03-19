dojo.provide("dojo.dnd2.source");

dojo.require("dojo.lang.declare");
dojo.require("dojo.event.*");
dojo.require("dojo.html.style");

dojo.require("dojo.dnd2.selector");
dojo.require("dojo.dnd2.manager");

/*
	Source states:
		""			- normal state
		"moved"		- this source is being moved
		"copied"	- this source is being copied
	Target states:
		""			- normal state
		"disabled"	- the target cannot accept an avatar
	Target anchor state:
		""			- item is not selected
		"before"	- insert point is before the anchor
		"after"		- insert point is after the anchor
*/

dojo.declare("dojo.dnd2.Source", dojo.dnd2.Selector, 
function(node, filter, creator, singular, is_source, accepted_types, horizontal){
	// general variables
	this.is_source = typeof is_source == "undefined" ? true : is_source;
	var types = accepted_types instanceof Array ? accepted_types : ["text"];
	this.accept = null;
	if(types.length){
		this.accept = {};
		for(var i = 0; i < types.length; ++i){
			this.accept[types[i]] = 1;
		}
	}
	this.horizontal = horizontal;
	// class-specific variables
	this.is_dragging = false;
	this.mouse_down = false;
	this.target_anchor = null;
	this.target_valid = false;
	this.before = false;
	// states
	this.source_state  = "";
	dojo.html.addClass(this.node, "dojo_dnd_source_");
	this.target_state  = "";
	dojo.html.addClass(this.node, "dojo_dnd_target_");
	// set up events
	dojo.event.topic.subscribe("dnd_source_over", this, "onDndSourceOver");
	dojo.event.topic.subscribe("dnd_start",  this, "onDndStart");
	dojo.event.topic.subscribe("dnd_drop",   this, "onDndDrop");
	dojo.event.topic.subscribe("dnd_cancel", this, "onDndCancel");
},
{
	// mouse event processors
	onMouseMove: function(e){
		if(this.is_dragging && this.target_state == "disabled"){ return; }
		if(this.container_state != "over"){
			dojo.dnd2.manager().overSource(this);
		}
		dojo.dnd2.Source.superclass.onMouseMove.call(this, e);
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
				dojo.dnd2.manager().canDrop(!this.current || !(this.current.id in this.selection));
			}
		}else{
			if(this.mouse_down){
				dojo.dnd2.manager().startDrag(this, this.getSelectedNodes(), e.ctrlKey);
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
				this.target_anchor = null;
			}
		}
	},
	onDndStart: function(source, nodes, copy){
		if(this.is_source){
			this.changeState("source", this == source ? (copy ? "copied" : "moved") : "");
		}
		if(this.accept){
			var accepted = this.checkAcceptance(source, nodes);
			this.changeState("target", accepted ? "" : "disabled");
			if(accepted){
				dojo.dnd2.manager().overSource(this);
			}
		}
		this.is_dragging = true;
	},
	onDndDrop: function(source, nodes, copy){
		do{ //break box
			if(this.container_state != "over"){ break; }
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
		this.changeState("source", "");
		this.changeState("target", "");
	},
	// methods
	onOutEvent: function(){
		dojo.dnd2.Source.superclass.onOutEvent.call(this);
		dojo.dnd2.manager().outSource(this);
	},
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
		if(this.current == this.target_anchor){ return; }
		var prefix = this.horizontal ? "h_" : "v_";
		if(this.target_anchor){
			this.removeItemClass(this.target_anchor, prefix + (this.before ? "before" : "after"));
		}
		this.target_anchor = this.current;
		this.before = before;
		if(this.target_anchor){
			this.addItemClass(this.target_anchor, prefix + (this.before ? "before" : "after"));
		}
	},
	unmarkTargetAnchor: function(){
		if(!this.target_anchor){ return; }
		var prefix = this.horizontal ? "h_" : "v_";
		this.removeItemClass(this.target_anchor, prefix + (this.before ? "before" : "after"));
		this.target_anchor = null;
	},
	markDndStatus: function(copy){
		this.changeState("source", copy ? "copied" : "moved");
	}
});
