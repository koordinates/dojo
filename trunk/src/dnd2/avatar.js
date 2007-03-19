dojo.provide("dojo.dnd2.avatar");

dojo.require("dojo.html.style");
dojo.require("dojo.html.display");

dojo.dnd2.Avatar = function(manager){
	this.manager = manager;
	this.construct();
};

dojo.extend(dojo.dnd2.Avatar, {
	construct: function(){
		var a = dojo.doc().createElement("table");
		dojo.html.addClass(a, "dojo_dnd_avatar");
		a.style.position = "absolute";
		a.style.zIndex = 999;
		var b = dojo.doc().createElement("tbody");
		var tr = dojo.doc().createElement("tr");
		dojo.html.addClass(tr, "dojo_dnd_avatar_header");
		var td = dojo.doc().createElement("td");
		td.innerHTML = this._generateText();
		tr.appendChild(td);
		dojo.html.setOpacity(tr, 0.9);
		b.appendChild(tr);
		var k = Math.min(5, this.manager.nodes.length);
		for(var i = 0; i < k; ++i){
			tr = dojo.doc().createElement("tr");
			dojo.html.addClass(tr, "dojo_dnd_avatar_item");
			td = dojo.doc().createElement("td");
			var t = this.manager.source.node_creator(this.manager.source.map[this.manager.nodes[i].id].data, "avatar");
			td.appendChild(t.node);
			tr.appendChild(td);
			dojo.html.setOpacity(tr, (6 - i) / 10);
			b.appendChild(tr);
		}
		a.appendChild(b);
		this.node = a;
	},
	destroy: function(){
		this.node.parentNode.removeChild(this.node);
		this.node = false;
	},
	update: function(){
		dojo.html[(this.manager.copy     ? "add" : "remove") + "Class"](this.node, "dojo_dnd_avatar_copy");
		dojo.html[(this.manager.can_drop ? "add" : "remove") + "Class"](this.node, "dojo_dnd_avatar_can_drop");
		// replace text
		var t = this.node.getElementsByTagName("td");
		for(var i = 0; i < t.length; ++i){
			var n = t[i];
			if(dojo.html.hasClass(n.parentNode, "dojo_dnd_avatar_header")){
				n.innerHTML = this._generateText();
				break;
			}
		}
	},
	_generateText: function(){
		return (this.manager.copy ? "copy" : "mov") + "ing " + this.manager.nodes.length + " item" + (this.manager.nodes.length != 1 ? "s" : "");	
	}
});