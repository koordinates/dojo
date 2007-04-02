dojo.provide("dojo.dnd2.source");

dojo.require("dojo.lang.declare");
dojo.require("dojo.event.*");
dojo.require("dojo.html.style");
dojo.require("dojo.html.layout");

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
	this.isSource = typeof params.isSource == "undefined" ? true : params.isSource;
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
	this.isDragging = false;
	this.mouseDown = false;
	this.targetAnchor = null;
	this.targetBox = null;
	this.before = true;
	// states
	this.sourceState  = "";
	dojo.html.addClass(this.node, "dojoDndSource");
	this.targetState  = "";
	dojo.html.addClass(this.node, "dojoDndTarget");
	if(this.horizontal){ dojo.html.addClass(this.node, "dojoDndHorizontal"); }
	// set up events
	dojo.event.topic.subscribe("dndSourceOver", this, "onDndSourceOver");
	dojo.event.topic.subscribe("dndStart",  this, "onDndStart");
	dojo.event.topic.subscribe("dndDrop",   this, "onDndDrop");
	dojo.event.topic.subscribe("dndCancel", this, "onDndCancel");
},
{
	// mouse event processors
	onMouseMove: function(e){
		if(this.isDragging && this.targetState == "Disabled"){ return; }
		dojo.dnd2.Source.superclass.onMouseMove.call(this, e);
		var m = dojo.dnd2.manager();
		if(this.isDragging){
			// calculate before/after
			var before = false;
			if(this.current){
				if(!this.targetBox || this.targetAnchor != this.current){
					this.targetBox = {
						xy: dojo.html.getAbsolutePosition(this.current, true),
						wh: dojo.html.getBorderBox(this.current)
					};
				}
				if(this.horizontal){
					before = (e.pageX - this.targetBox.xy.x) < (this.targetBox.wh.width / 2);
				}else{
					before = (e.pageY - this.targetBox.xy.y) < (this.targetBox.wh.height / 2);
				}
			}
			if(this.current != this.targetAnchor || before != this.before){
				this.markTargetAnchor(before);
				m.canDrop(!this.current || m.source != this || !(this.current.id in this.selection));
			}
		}else{
			if(this.mouseDown && this.isSource){
				m.startDrag(this, this.getSelectedNodes(), e.ctrlKey);
			}
		}
	},
	onMouseDown: function(e){
		this.mouseDown = true;
		dojo.dnd2.Source.superclass.onMouseDown.call(this, e);
	},
	onMouseUp: function(e){
		this.mouseDown = false;
		dojo.dnd2.Source.superclass.onMouseUp.call(this, e);
	},
	// topic event processors
	onDndSourceOver: function(source){
		if(this != source){
			this.mouseDown = false;
			if(this.targetAnchor){
				this.unmarkTargetAnchor();
			}
		}else if(this.isDragging){
			var m = dojo.dnd2.manager();
			m.canDrop(this.targetState != "Disabled" && (!this.current || m.source != this || !(this.current.id in this.selection)));
		}
	},
	onDndStart: function(source, nodes, copy){
		if(this.isSource){
			this.changeState("Source", this == source ? (copy ? "Copied" : "Moved") : "");
		}
		var accepted = this.accept && this.checkAcceptance(source, nodes);
		this.changeState("Target", accepted ? "" : "Disabled");
		if(accepted){
			dojo.dnd2.manager().overSource(this);
		}
		this.isDragging = true;
	},
	onDndDrop: function(source, nodes, copy){
		do{ //break box
			if(this.containerState != "Over"){ break; }
			var oldCreator = this.nodeCreator;
			if(this != source || copy){
				this.selectNone();
				this.nodeCreator = function(n){
					return oldCreator(source.map[n.id].data);
				};
			}else{
				if(this.current.id in this.selection){ break; }
				this.nodeCreator = function(n){
					var t = source.map[n.id]; return {node: n, data: t.data, types: t.types};
				};
			}
			this.insertNodes(true, nodes, this.before, this.current);
			this.nodeCreator = oldCreator;
			if(this != source && !copy){
				source.deleteSelectedNodes();
			}
		}while(false);
		this.onDndCancel();
	},
	onDndCancel: function(){
		if(this.targetAnchor){
			this.unmarkTargetAnchor();
			this.targetAnchor = null;
		}
		this.before = true;
		this.isDragging = false;
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
		if(this.current == this.targetAnchor && this.before == before){ return; }
		if(this.targetAnchor){
			this.removeItemClass(this.targetAnchor, this.before ? "Before" : "After");
		}
		this.targetAnchor = this.current;
		this.targetBox = null;
		this.before = before;
		if(this.targetAnchor){
			this.addItemClass(this.targetAnchor, this.before ? "Before" : "After");
		}
	},
	unmarkTargetAnchor: function(){
		if(!this.targetAnchor){ return; }
		this.removeItemClass(this.targetAnchor, this.before ? "Before" : "After");
		this.targetAnchor = null;
		this.targetBox = null;
		this.before = true;
	},
	markDndStatus: function(copy){
		this.changeState("Source", copy ? "Copied" : "Moved");
	}
});