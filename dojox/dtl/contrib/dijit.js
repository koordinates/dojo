dojo.provide("dojox.dtl.contrib.dijit");

dojo.require("dojox.dtl.dom");
dojo.require("dojo.parser");

(function(){

	var ddcd = dd.contrib.dijit;

	ddcd.AttachNode = dojo.extend(function(keys, object){
		this._keys = keys;
		this._object = object;
	},
	{
		render: function(context, buffer){
			if(!this._rendered){
				this._rendered = true;
				for(var i=0, key; key = this._keys[i]; i++){
					context.getThis()[key] = this._object || buffer.getParent();
				}
			}
			return buffer;
		},
		unrender: function(context, buffer){
			if(this._rendered){
				this._rendered = false;
				for(var i=0, key; key = this._keys[i]; i++){
					if(context.getThis()[key] === (this._object || buffer.getParent())){
						delete context.getThis()[key];
					}
				}
			}
			return buffer;
		},
		clone: function(buffer){
			return new this.constructor(this._keys, this._object);
		}
	});

	ddcd.EventNode = dojo.extend(function(command, obj){
		this._command = command;

		var type, events = command.split(/\s*,\s*/);
		var trim = dojo.trim;
		var types = [];
		var fns = [];
		while(type = events.pop()){
			if(type){
				var fn = null;
				if(type.indexOf(":") != -1){
					// oh, if only JS had tuple assignment
					var funcNameArr = type.split(":");
					type = trim(funcNameArr[0]);
					fn = trim(funcNameArr.slice(1).join(":"));
				}else{
					type = trim(type);
				}
				if(!fn){
					fn = type;
				}
				types.push(type);
				fns.push(fn);
			}
		}

		this._types = types;
		this._fns = fns;
		this._object = obj;
		this._rendered = [];
	},
	{
		// _clear: Boolean
		//		Make sure we kill the actual tags (onclick problems, etc)
		_clear: false,
		render: function(context, buffer){
			var resolveFilter = function(item){
				return new dojox.dtl._Filter(item).resolve(context);
			};

			for(var i = 0, type; type = this._types[i]; i++){
				if(!this._clear && !this._object){
					buffer.getParent()[type] = null;
				}
				var fn = this._fns[i];
				var args;
				if(fn.indexOf(" ") != -1){
					if(this._rendered[i]){
						dojo.disconnect(this._rendered[i]);
						this._rendered[i] = false;
					}
					args = dojo.map(fn.split(" ").slice(1), resolveFilter);
					fn = fn.split(" ", 2)[0];
				}
				if(!this._rendered[i]){
					if(!this._object){
						this._rendered[i] = buffer.addEvent(context, type, fn, args);
					}else{
						this._rendered[i] = dojo.connect(this._object, type, context.getThis(), fn);
					}
				}
			}
			this._clear = true;

			return buffer;
		},
		unrender: function(context, buffer){
			while(this._rendered.length){
				dojo.disconnect(this._rendered.pop());
			}
			return buffer;
		},
		clone: function(){
			return new this.constructor(this._command, this._object);
		}
	});

	function cloneNode(n1){
		var n2 = n1.cloneNode(true);
		//if(dojo.isIE){

		// NOTE: Feature test whether cloneNode copies scripts
		//       The text property is not the only possibility

		//var scripts1 = n1.getElementsByTagName('script');
		//var scripts2 = n2.getElementsByTagName('script');

		//var index = scripts2.length;

		//while (index--) {
		//	scripts2[index].text = scripts1[index].text
		//}

		//}
		return n2;
	}

	ddcd.DojoTypeNode = dojo.extend(function(node, parsed){
		var ddcd = dd.contrib.dijit;
		this._node = node;
		this._parsed = parsed;

		var events = node.getAttribute("dojoAttachEvent");
		if(events){
			this._events = new ddcd.EventNode(dojo.trim(events));
		}
		var attach = node.getAttribute("dojoAttachPoint");
		if(attach){
			this._attach = new ddcd.AttachNode(dojo.trim(attach).split(/\s*,\s*/));
		}

		if (!parsed){
			this._dijit = dojo.parser.instantiate([cloneNode(node)])[0];
		}else{
			node = cloneNode(node);
			var old = ddcd.widgetsInTemplate;
			ddcd.widgetsInTemplate = false;
			this._template = new dojox.dtl.DomTemplate(node);
			ddcd.widgetsInTemplate = old;
		}
		ddcd = null;
	},
	{
		render: function(context, buffer){
			if(this._parsed){
				var _buffer = new dojox.dtl.DomBuffer();
				this._template.render(context, _buffer);
				var root = cloneNode(_buffer.getRootNode());
				var div = document.createElement("div");
				div.appendChild(root);
				var rendered = div.innerHTML;
				div.removeChild(root);
				if(rendered != this._rendered){
					this._rendered = rendered;
					if(this._dijit){
						this._dijit.destroyRecursive();
					}
					this._dijit = dojo.parser.instantiate([root])[0];
				}
			}

			var node = this._dijit.domNode;

			if(this._events){
				this._events._object = this._dijit;
				this._events.render(context, buffer);
			}
			if(this._attach){
				this._attach._object = this._dijit;
				this._attach.render(context, buffer);
			}

			return buffer.concat(node);
		},
		unrender: function(context, buffer){
			return buffer.remove(this._dijit.domNode);
		},
		clone: function(){
			return new this.constructor(this._node, this._parsed);
		}
	});

	dojo.mixin(ddcd, {
		widgetsInTemplate: true,
		dojoAttachPoint: function(parser, token){
			return new dd.contrib.dijit.AttachNode(token.contents.slice(16).split(/\s*,\s*/));
		},
		dojoAttachEvent: function(parser, token){
			return new dd.contrib.dijit.EventNode(token.contents.slice(16));
		},
		dojoType: function(parser, token){
			if(dd.contrib.dijit.widgetsInTemplate){
				var node = parser.swallowNode();
				var parsed = false;
				if(token.contents.slice(-7) == " parsed"){
					parsed = true;
					node.setAttribute("dojoType", token.contents.slice(0, -7));
				}
				return new dd.contrib.dijit.DojoTypeNode(node, parsed);
			}
			return dojox.dtl._noOpNode;
		},
		on: function(parser, token){
			// summary: Associates an event type to a function (on the current widget) by name
			var parts = token.contents.split();
			return new dd.contrib.dijit.EventNode(parts[0] + ":" + parts.slice(1).join(" "));
		}
	});

	dojox.dtl.register.tags("dojox.dtl.contrib", {
		"dijit": ["attr:dojoType", "attr:dojoAttachPoint", ["attr:attach", "dojoAttachPoint"], "attr:dojoAttachEvent", [/(attr:)?on(click|key(up))/i, "on"]]
	});

	ddcd = null;
})();