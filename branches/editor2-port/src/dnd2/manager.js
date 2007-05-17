dojo.provide("dojo.dnd2.manager");

dojo.require("dojo.event.*");
dojo.require("dojo.html.style");

dojo.require("dojo.dnd2.common");
dojo.require("dojo.dnd2.avatar");

dojo.dnd2.Manager = function(){
	// summary: the manager of DnD operations (usually a singleton)
	this.avatar  = null;
	this.source = null;
	this.nodes = [];
	this.copy  = true;
	this.target = null;
	this.canDropFlag = false;
};

dojo.extend(dojo.dnd2.Manager, {
	// methods
	overSource: function(source){
		// summary: called when a source detected a mouse-over conditiion
		// source: Object: the reporter
		if(this.avatar){
			this.target = (source && source.targetState != "Disabled") ? source : null;
			this.avatar.update();
		}
		dojo.event.topic.publish("dndSourceOver", source);
	},
	outSource: function(source){
		// summary: called when a source detected a mouse-out conditiion
		// source: Object: the reporter
		if(this.avatar){
			if(this.target == source){
				this.target = null;
				this.canDropFlag = false;
				this.avatar.update();
				dojo.event.topic.publish("dndSourceOver", null);
			}
		}else{
			dojo.event.topic.publish("dndSourceOver", null);
		}
	},
	startDrag: function(source, nodes, copy){
		// summary: called to initiate the DnD operation
		// source: Object: the source which provides items
		// nodes: Array: the list of transferred items
		// copy: Boolean: copy items, if true, move items otherwise
		this.source = source;
		this.nodes  = nodes;
		this.copy   = copy;
		this.avatar = this.makeAvatar();
		dojo.body().appendChild(this.avatar.node);
		dojo.event.topic.publish("dndStart", source, nodes, copy);
		dojo.event.connect(dojo.doc(), "onmousemove", this, "onMouseMove");
		dojo.event.connect(dojo.doc(), "onmouseup",   this, "onMouseUp");
		dojo.event.connect(dojo.doc(), "onkeydown",   this, "onKeyDown");
		dojo.event.connect(dojo.doc(), "onkeyup",     this, "onKeyUp");
		dojo.html.addClass(dojo.body(), "dojoDnd" + (copy ? "Copy" : "Move"));
	},
	canDrop: function(flag){
		// summary: called to notify if the current target can accept items
		var canDropFlag = this.target && flag;
		if(this.canDropFlag != canDropFlag){
			this.canDropFlag = canDropFlag;
			this.avatar.update();
		}
	},
	stopDrag: function(){
		// summary: stop the DnD in progress
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
	makeAvatar: function(){
		// summary: makes the avatar, it is separate to be overwritten dynamically, if needed
		return new dojo.dnd2.Avatar(this);
	},
	updateAvatar: function(){
		// summary: updates the avatar, it is separate to be overwritten dynamically, if needed
		this.avatar.update();
	},
	// mouse event processors
	onMouseMove: function(e){
		// summary: event processor for onmousemove
		// e: Event: mouse event
		var a = this.avatar;
		if(a){
			var s = a.node.style;
			s.left = (e.pageX + 10 + a.offX) + "px";
			s.top  = (e.pageY + 10 + a.offY) + "px";
			if(this.copy != dojo.dnd2.multiSelectKey(e)){ this._setCopyStatus(dojo.dnd2.multiSelectKey(e)); }
		}
	},
	onMouseUp: function(e){
		// summary: event processor for onmouseup
		// e: Event: mouse event
		if(this.avatar){
			if(this.target && this.canDropFlag){
				dojo.event.topic.publish("dndDrop", this.source, this.nodes, dojo.dnd2.multiSelectKey(e));
			}else{
				dojo.event.topic.publish("dndCancel");
			}
			this.stopDrag();
		}
	},
	// keyboard event processors
	onKeyDown: function(e){
		// summary: event processor for onkeydown, watching for CTRL for copy/move status
		// e: Event: keyboard event
		if(this.avatar && e.keyCode == dojo.event.browser.keys.KEY_CTRL && !this.copy){ this._setCopyStatus(true); }
	},
	onKeyUp: function(e){
		// summary: event processor for onkeyup, watching for CTRL for copy/move status
		// e: Event: keyboard event
		if(this.avatar && e.keyCode == dojo.event.browser.keys.KEY_CTRL && this.copy){ this._setCopyStatus(false); }
	},
	// utilities
	_setCopyStatus: function(copy){
		// summary: changes the copy status
		// copy: Boolean: the copy status
		this.copy = copy;
		this.source._markDndStatus(this.copy);
		this.updateAvatar();
		dojo.html.replaceClass(dojo.body(), "dojoDnd" + (this.copy ? "Copy" : "Move"), "dojoDnd" + (this.copy ? "Move" : "Copy"));
	}
});

// summary: the manager singleton variable, can be overwritten, if needed
dojo.dnd2._manager = null;

dojo.dnd2.manager = function(){
	// summary: returns the current DnD manager, creates one if it is not created yet
	if(!dojo.dnd2._manager){
		dojo.dnd2._manager = new dojo.dnd2.Manager();
	}
	return dojo.dnd2._manager;	// Object
};