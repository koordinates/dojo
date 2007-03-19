dojo.provide("dojo.dnd2.manager");

dojo.require("dojo.event.*");
dojo.require("dojo.html.style");

dojo.dnd2.Manager = function(){
	this.avatar  = null;
	
	this.source = null;
	this.nodes = [];
	this.copy  = true;
	
	this.target = null;
};

dojo.extend(dojo.dnd2.Manager, {
	// methods
	overSource: function(source){
		dojo.debug("overSource");
		if(this.avatar){
			this.target = source;
		}
		dojo.event.topic.publish("dnd_source_over", source);
	},
	outSource: function(source){
		dojo.debug("outSource");
		if(this.avatar){
			if(this.target == source){
				this.target = null;
				dojo.event.topic.publish("dnd_source_over", null);
			}
		}else{
			dojo.event.topic.publish("dnd_source_over", null);
		}
	},
	startDrag: function(source, nodes, copy){
		dojo.debug("startDrag");
		this.source = source;
		this.nodes  = nodes;
		this.copy   = copy;
		this.avatar = this.makeAvatar();
		dojo.body().appendChild(this.avatar);
		dojo.event.topic.publish("dnd_start", source, nodes, copy);
		dojo.event.connect(dojo.body(), "onmousemove", this, "onMouseMove");
		dojo.event.connect(dojo.body(), "onmouseup",   this, "onMouseUp");
		dojo.html.addClass(dojo.body(), "dojo_dnd_" + (copy ? "copy" : "move"));
	},
	stopDrag: function(){
		dojo.debug("stopDrag");
		dojo.html.removeClass(dojo.body(), "dojo_dnd_copy");
		dojo.html.removeClass(dojo.body(), "dojo_dnd_move");
		dojo.event.disconnect(dojo.body(), "onmousemove", this, "onMouseMove");
		dojo.event.disconnect(dojo.body(), "onmouseup",   this, "onMouseUp");
		this.avatar.parentNode.removeChild(this.avatar);
		this.avatar = null;
		this.source = null;
		this.nodes = [];
	},
	makeAvatar: function(){
		dojo.debug("makeAvatar");
		var a = dojo.doc().createElement("table");
		dojo.html.addClass(a, "dojo_dnd_avatar");
		a.style.position = "absolute";
		var tr = dojo.doc().createElement("tr");
		dojo.html.addClass(tr, "dojo_dnd_avatar_header");
		var td = dojo.doc().createElement("td");
		td.innerHTML = (this.copy ? "copy" : "mov") + "ing " + this.nodes.length + " items";
		tr.appendChild(td);
		a.appendChild(tr);
		var k = Math.min(3, this.nodes.length);
		for(var i = 0; i < k; ++i){
			tr = dojo.doc().createElement("tr");
			dojo.html.addClass(tr, "dojo_dnd_avatar_item");
			td = dojo.doc().createElement("td");
			var t = this.source.node_creator(this.source.map[this.nodes[i].id].data, "avatar");
			td.appendChild(t.node);
			tr.appendChild(td);
			a.appendChild(tr);
		}
		return a;
	},
	updateAvatar: function(){
		dojo.debug("update avatar");
		var t = this.avatar.getElementsByTagName("td");
		for(var i = 0; i < t.length; ++i){
			var n = t[i];
			if(dojo.html.hasClass(n.parentNode, "dojo_dnd_avatar_header")){
				n.innerHTML = (this.copy ? "copy" : "mov") + "ing " + this.nodes.length + " items";
				break;
			}
		}
	},
	// mouse event processors
	onMouseMove: function(e){
		//dojo.debug("onMouseMove", e.target, this.source);
		if(this.avatar){
			var s = this.avatar.style;
			s.left = (e.clientX + 10) + "px";
			s.top  = (e.clientY + 10) + "px";
			if(this.copy != e.ctrlKey){
				this.copy = e.ctrlKey;
				this.source.markDndStatus(this.copy);
				this.updateAvatar();
				dojo.html.replaceClass(dojo.body(), "dojo_dnd_" + (this.copy ? "copy" : "move"), "dojo_dnd_" + (this.copy ? "move" : "copy"));
			}
		}
	},
	onMouseUp: function(e){
		if(this.avatar){
			if(this.target){
				dojo.event.topic.publish("dnd_drop", this.source, this.nodes, this.copy);
			}else{
				dojo.event.topic.publish("dnd_cancel");
			}
			this.stopDrag();
		}
	}
});

dojo.dnd2._manager = null;

dojo.dnd2.manager = function(){
	if(!dojo.dnd2._manager){
		dojo.dnd2.setManager(new dojo.dnd2.Manager());
	}
	return dojo.dnd2._manager;
};

dojo.dnd2.setManager = function(manager){
	dojo.dnd2._manager = manager;
};
