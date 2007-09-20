dojo.provide("dojox.dtl.tag.loader");

dojo.require("dojox.dtl._base");

dojox.dtl.tag.loader.BlockNode = function(name, nodelist){
	this.name = name;
	this.nodelist = nodelist; // Can be overridden
}
dojo.mixin(dojox.dtl.tag.loader.BlockNode.prototype, {
	render: function(context, buffer){
		if(buffer.getParent) var parent = buffer.getParent(); // Need this for HTML tree structure
		if(this.override){
			buffer = this.override.render(context, buffer);
			this.rendered = this.override;
		}else{
			buffer =  this.nodelist.render(context, buffer);
			this.rendered = this.nodelist;
		}
		if(buffer.setParent) buffer.setParent(parent, true); // Need this for HTML tree structure
		this.override = null;
		return buffer;
	},
	unrender: function(context, buffer){
		return this.rendered.unrender(context, buffer);
	},
	setOverride: function(nodelist){
		// summary: In a shared parent, we override, not overwrite
		if(!this.override){
			this.override = nodelist;
		}
	},
	toString: function(){ return "dojox.dtl.tag.loader.BlockNode"; }
});
dojox.dtl.tag.loader.block = function(parser, text){
	var parts = text.split(" ");
	var name = parts[1];
	
	parser._blocks = parser._blocks || {};
	parser._blocks[name] = parser._blocks[name] || [];
	parser._blocks[name].push(name);
	
	var nodelist = parser.parse(["endblock", "endblock " + name]);
	parser.next();
	return new dojox.dtl.tag.loader.BlockNode(name, nodelist);
}

dojox.dtl.tag.loader.ExtendsNode = function(getTemplate, nodelist, shared, parent, key){
	this.getTemplate = getTemplate;
	this.nodelist = nodelist;
	this.shared = shared;
	this.parent = parent;
	this.key = key;
}
dojo.mixin(dojox.dtl.tag.loader.ExtendsNode.prototype, {
	parents: {},
	getParent: function(context){
		if(!this.parent){
			this.parent = this.key.resolve(context);
			if(this.parent && this.parent.indexOf("shared:") == 0){
				this.shared = true;
				this.parent = this.parent.substring(7, parent.length);
			}
		}
		var parent = this.parent;
		if(!parent){
			throw new Error("Invalid template name in 'extends' tag.");
		}
		if(parent.render){
			return parent;
		}
		if(this.parents[parent]){
			return this.parents[parent];
		}
		this.parent = this.getTemplate(dojox.dtl.text.getTemplateString(parent));
		if(this.shared){
			this.parents[parent] = this.parent;
		}
		return this.parent;
	},
	render: function(context, buffer){
		var st = dojox.dtl.text;
		var stbl = dojox.dtl.tag.loader;
		var parent = this.getParent(context);
		var isChild = parent.nodelist[0] instanceof this.constructor;
		var parentBlocks = {};
		for(var i = 0, node; node = parent.nodelist.contents[i]; i++){
			if(node instanceof stbl.BlockNode){
				parentBlocks[node.name] = node;
			}
		}
		for(var i = 0, node; node = this.nodelist.contents[i]; i++){
			if(node instanceof stbl.BlockNode){
				var block = parentBlocks[node.name];
				if(!block){
					if(isChild){
						parent.nodelist[0].nodelist.append(node);
					}
				}else{
					if(this.shared){
						block.setOverride(node.nodelist);
					}else{
						block.nodelist = node.nodelist;
					}
				}
			}
		}
		this.rendered = parent;
		return parent.render(context, buffer);
	},
	unrender: function(context, buffer){
		return this.rendered.unrender(context, buffer);
	},
	toString: function(){
		return "dojox.dtl.block.ExtendsNode";
	}
});
dojox.dtl.tag.loader.extends_ = function(parser, text){
	var parts = text.split(" ");
	var shared = false;
	var parent = null;
	var key = null;
	if(parts[1].charAt(0) == '"' || parts[1].charAt(0) == "'"){
		parent = parts[1].substring(1, parts[1].length - 1);
	}else{
		key = dojox.dtl.text.VarNode(parts[1]);
	}
	if(parent && parent.indexOf("shared:") == 0){
		shared = true;
		parent = parent.substring(7, parent.length);
	}
	var nodelist = parser.parse();
	return new dojox.dtl.tag.loader.ExtendsNode(parser.getTemplate, nodelist, shared, parent, key);
}