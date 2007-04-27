dojo.provide("dojo.dnd.manager");

dojo.require("dojo.dnd.common");
dojo.require("dojo.dnd.avatar");

dojo.dnd.Manager = function(){
	// summary: the manager of DnD operations (usually a singleton)
	this.avatar  = null;
	this.source = null;
	this.nodes = [];
	this.copy  = true;
	this.target = null;
	this.canDropFlag = false;
	this.events = {};
};

dojo.extend(dojo.dnd.Manager, {
	// methods
	overSource: function(source){
		// summary: called when a source detected a mouse-over conditiion
		// source: Object: the reporter
		if(this.avatar){
			this.target = (source && source.targetState != "Disabled") ? source : null;
			this.avatar.update();
		}
		dojo.publish("dndSourceOver", [source]);
	},
	outSource: function(source){
		// summary: called when a source detected a mouse-out conditiion
		// source: Object: the reporter
		if(this.avatar){
			if(this.target == source){
				this.target = null;
				this.canDropFlag = false;
				this.avatar.update();
				dojo.publish("dndSourceOver", [null]);
			}
		}else{
			dojo.publish("dndSourceOver", [null]);
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
		dojo.publish("dndStart", [source, nodes, copy]);
		this.events = {
			onmousemove:	dojo.connect(dojo.doc, "onmousemove", this, "onMouseMove"),
			onmouseup:		dojo.connect(dojo.doc, "onmouseup",   this, "onMouseUp"),
			onkeydown:		dojo.connect(dojo.doc, "onkeydown",   this, "onKeyDown"),
			onkeyup:		dojo.connect(dojo.doc, "onkeyup",     this, "onKeyUp")
		};
		//dojo.html.addClass(dojo.body(), "dojoDnd" + (copy ? "Copy" : "Move"));
		var c = "dojoDnd" + (copy ? "Copy" : "Move");
		if(!new RegExp("(^|\\s+)" + c + "(\\s+|$)").test(dojo.body().className)){
			dojo.body().className += " dojoDndContainer";
		}
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
		//dojo.html.removeClass(dojo.body(), "dojoDndCopy");
		//dojo.html.removeClass(dojo.body(), "dojoDndMove");
		dojo.body().className = dojo.body().className.
			replace(/(^|\s+)dojoDndCopy(\s+|$)/, "$1$2").
			replace(/(^|\s+)dojoDndMove(\s+|$)/, "$1$2");
		var t = {};
		for(var i in this.events){
			if(!(i in t)){
				dojo.disconnect(dojo.doc, i, this.events[i]);
			}
		}
		this.events = {};
		this.avatar.destroy();
		this.avatar = null;
		this.source = null;
		this.nodes = [];
	},
	makeAvatar: function(){
		// summary: makes the avatar, it is separate to be overwritten dynamically, if needed
		return new dojo.dnd.Avatar(this);
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
			s.left = (e.pageX + 10 + (isNaN(a.offX) ? 0 : a.offX)) + "px";
			s.top  = (e.pageY + 10 +  (isNaN(a.offY) ? 0 : a.offY)) + "px";
			if(this.copy != dojo.dnd.multiSelectKey(e)){ 
				this._setCopyStatus(dojo.dnd.multiSelectKey(e));
			}
		}
	},
	onMouseUp: function(e){
		// summary: event processor for onmouseup
		// e: Event: mouse event
		if(this.avatar){
			if(this.target && this.canDropFlag){
				dojo.publish("dndDrop", [this.source, this.nodes, dojo.dnd.multiSelectKey(e)]);
			}else{
				dojo.publish("dndCancel");
			}
			this.stopDrag();
		}
	},
	// keyboard event processors
	onKeyDown: function(e){
		// summary: event processor for onkeydown, watching for CTRL for copy/move status
		// e: Event: keyboard event
		if(this.avatar && e.keyCode == dojo._keys.CTRL && !this.copy){ this._setCopyStatus(true); }
	},
	onKeyUp: function(e){
		// summary: event processor for onkeyup, watching for CTRL for copy/move status
		// e: Event: keyboard event
		if(this.avatar && e.keyCode == dojo._keys.CTRL && this.copy){ this._setCopyStatus(false); }
	},
	// utilities
	_setCopyStatus: function(copy){
		// summary: changes the copy status
		// copy: Boolean: the copy status
		this.copy = copy;
		this.source._markDndStatus(this.copy);
		this.updateAvatar();
		//dojo.html.replaceClass(dojo.body(), "dojoDnd" + (this.copy ? "Copy" : "Move"), "dojoDnd" + (this.copy ? "Move" : "Copy"));
		dojo.body().className = dojo.body().className.replace(
			new RegExp("(^|\\s+)" + "dojoDnd" + (this.copy ? "Copy" : "Move") + "(\\s+|$)"), 
			"$1 " + "dojoDnd" + (this.copy ? "Move" : "Copy") + " $2");
	}
});

// summary: the manager singleton variable, can be overwritten, if needed
dojo.dnd._manager = null;

dojo.dnd.manager = function(){
	// summary: returns the current DnD manager, creates one if it is not created yet
	if(!dojo.dnd._manager){
		dojo.dnd._manager = new dojo.dnd.Manager();
	}
	return dojo.dnd._manager;	// Object
};
