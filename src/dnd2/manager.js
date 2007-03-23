dojo.provide("dojo.dnd2.manager");

dojo.require("dojo.event.*");
dojo.require("dojo.html.style");

dojo.require("dojo.dnd2.avatar");

dojo.dnd2.Manager = function(){
	this.avatar  = null;
	
	this.source = null;
	this.nodes = [];
	this.copy  = true;
	
	this.target = null;
	this.can_drop = false;
};

dojo.extend(dojo.dnd2.Manager, {
	// methods
	overSource: function(source){
		if(this.avatar){
			this.target = (source && source.target_state != "Disabled") ? source : null;
			this.avatar.update();
		}
		dojo.event.topic.publish("dnd_source_over", source);
	},
	outSource: function(source){
		if(this.avatar){
			if(this.target == source){
				this.target = null;
				this.can_drop = false;
				this.avatar.update();
				dojo.event.topic.publish("dnd_source_over", null);
			}
		}else{
			dojo.event.topic.publish("dnd_source_over", null);
		}
	},
	startDrag: function(source, nodes, copy){
		this.source = source;
		this.nodes  = nodes;
		this.copy   = copy;
		this.avatar = this.makeAvatar();
		dojo.body().appendChild(this.avatar.node);
		dojo.event.topic.publish("dnd_start", source, nodes, copy);
		dojo.event.connect(dojo.doc(), "onmousemove", this, "onMouseMove");
		dojo.event.connect(dojo.doc(), "onmouseup",   this, "onMouseUp");
		dojo.event.connect(dojo.doc(), "onkeydown",   this, "onKeyDown");
		dojo.event.connect(dojo.doc(), "onkeyup",     this, "onKeyUp");
		dojo.html.addClass(dojo.body(), "dojoDnd" + (copy ? "Copy" : "Move"));
	},
	canDrop: function(flag){
		var can_drop = this.target && flag;
		if(this.can_drop != can_drop){
			this.can_drop = can_drop;
			this.avatar.update();
		}
	},
	stopDrag: function(){
		dojo.html.removeClass(dojo.body(), "dojoDndCopy");
		dojo.html.removeClass(dojo.body(), "dojoDndMove");
		dojo.event.disconnect(dojo.doc(), "onmousemove", this, "onMouseMove");
		dojo.event.disconnect(dojo.doc(), "onmouseup",   this, "onMouseUp");
		dojo.event.disconnect(dojo.doc(), "onkeydown",   this, "onKeyDown");
		dojo.event.disconnect(dojo.doc(), "onkeyup",     this, "onKeyUp");
		this.avatar.destroy();
		this.avatar = null;
		this.source = null;
		this.nodes = [];
	},
	makeAvatar: function(){ return new dojo.dnd2.Avatar(this); },
	updateAvatar: function(){ this.avatar.update(); },
	// mouse event processors
	onMouseMove: function(e){
		if(this.avatar){
			var s = this.avatar.node.style;
			s.left = (e.pageX + 10) + "px";
			s.top  = (e.pageY + 10) + "px";
			if(this.copy != e.ctrlKey){ this.setCopyStatus(e.ctrlKey); }
		}
	},
	onMouseUp: function(e){
		if(this.avatar){
			if(this.target && this.can_drop){
				dojo.event.topic.publish("dnd_drop", this.source, this.nodes, e.ctrlKey);
			}else{
				dojo.event.topic.publish("dnd_cancel");
			}
			this.stopDrag();
		}
	},
	// keyboard event processors
	onKeyDown: function(e){
		if(this.avatar && e.keyCode == dojo.event.browser.keys.KEY_CTRL && !this.copy){ this.setCopyStatus(true); }
	},
	onKeyUp: function(e){
		if(this.avatar && e.keyCode == dojo.event.browser.keys.KEY_CTRL && this.copy){ this.setCopyStatus(false); }
	},
	// utilities
	setCopyStatus: function(copy){
		this.copy = copy;
		this.source.markDndStatus(this.copy);
		this.updateAvatar();
		dojo.html.replaceClass(dojo.body(), "dojoDnd" + (this.copy ? "Copy" : "Move"), "dojoDnd" + (this.copy ? "Move" : "Copy"));
	}
});

dojo.dnd2._manager = null;

dojo.dnd2.manager = function(){
	if(!dojo.dnd2._manager){
		dojo.dnd2._manager = new dojo.dnd2.Manager();
	}
	return dojo.dnd2._manager;
};