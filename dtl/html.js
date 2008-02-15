dojo.provide("dojox.dtl.html");

dojo.require("dojox.dtl._base");
dojo.require("dojox.dtl.Context");

(function(){
	var dd = dojox.dtl;

	dd._ObjectMap = dojo.extend(function(){
		this.contents = [];
	},
	{
		get: function(key){
			var contents = this.contents;
			for(var i = 0, content; content = contents[i]; i++){
				if(content[0] === key){
					return content[1];
				}
			}
		},
		put: function(key, value){
			var contents = this.contents;
			for(var i = 0, content; content = contents[i]; i++){
				if(content[0] === key){
					if(arguments.length == 1){
						contents.splice(i, 1);
						return;
					}
					content[1] = value;
					return;
				}
			}
			contents.push([key, value]);
		}
	});

	var ddt = dd.text;
	var ddh = dd.html = {
		types: dojo.mixin({change: -11, attr: -12, custom: -13, elem: 1, text: 3}, ddt.types),
		_attributes: {},
		_re4: /^function anonymous\(\)\s*{\s*(.*)\s*}$/,
		getTemplate: function(text){
			if(typeof this._commentable == "undefined"){
				// Check to see if the browser can handle comments
				this._commentable = false;
				var div = document.createElement("div");
				div.innerHTML = "<!--Test comment handling, and long comments, using comments whenever possible.-->";
				if(div.childNodes.length && div.childNodes[0].nodeType == 8 && div.childNodes[0].data == "comment"){
					this._commentable = true;
				}
			}

			if(!this._commentable){
				// Strip comments
				text = text.replace(/<!--({({|%).*?(%|})})-->/g, "$1");
			}

			var match;

			// Some tags can't contain text. So we wrap the text in tags that they can have.
			if(text.indexOf("<select") != -1 || text.indexOf("<SELECT") != -1){
				var selectRe = /<select[\s\S]*?>([\s\S]+?)<\/select>/ig;
				while(match = selectRe.exec(text)){
					var replace = [];
					// Do it like this to make sure we don't double-wrap
					var tokens = dojox.string.tokenize(match[1], /(<option[\s\S]*?>[\s\S]*?<\/option>)/ig, function(option){ return {data: option}; });
					for(var i = 0; i < tokens.length; i++) {
						if(dojo.isObject(tokens[i])){
							replace.push(tokens[i].data);
						}else{
							replace.push('<option iscomment="true">' + dojo.trim(tokens[i]) + "</option>");
						}
					}
					text = text.replace(match[1], replace.join(""));
				}
			}

			var re = /\b([a-zA-Z]+)="/g;
			while(match = re.exec(text)){
				this._attributes[match[1].toLowerCase()] = true;
			}
			var div = document.createElement("div");
			div.innerHTML = text;
			var output = {nodes: []};
			while(div.childNodes.length){
				output.nodes.push(div.removeChild(div.childNodes[0]))
			}

			return output;
		},
		tokenize: function(/*Node*/ nodes){
			var tokens = [];

			for(var i = 0, node; node = nodes[i++];){
				if(node.nodeType != 1){
					this.__tokenize(node, tokens);
				}else{
					this._tokenize(node, tokens);
				}
			}

			return tokens;
		},
		_swallowed: [],
		_tokenize: function(/*Node*/ node, /*Array*/ tokens){
			var types = this.types;
			var swallowed = this._swallowed;
			var i, j, tag, child;

			if(!tokens.first){
				// Try to efficiently associate tags that use an attribute to
				// remove the node from DOM (eg dojoType) so that we can efficiently
				// locate them later in the tokenizing.
				tokens.first = true;
				var tags = dd.register.getAttributeTags();
				for(i = 0; tag = tags[i]; i++){
					try{
						(tag[2])({ swallowNode: function(){ throw 1; }}, "");
					}catch(e){
						swallowed.push(tag);
					}
				}
			}


			for(i = 0; tag = swallowed[i]; i++){
				var text = node.getAttribute(tag[0]);
				if(text){
					if(node.parentNode && node.parentNode.removeChild){
						node.parentNode.removeChild(node);
					}
					tokens.push([types.custom, (tag[2])({ swallowNode: function(){ return node; }}, text)]);
					return;
				}
			}

			var children = [];
			for(i = 0; child = node.childNodes[i]; i++){
				children.push(child);
			}

			tokens.push([types.elem, node]);

			var change = false;
			if(children.length){
				// Only do a change request if we need to
				tokens.push([types.change, node]);
				change = true;
			}

			for(var key in this._attributes){
				var value = "";
				if(key == "class"){
					value = node.className || value;
				}else if(key == "for"){
					value = node.htmlFor || value;
				}else if(node.getAttribute){
					value = node.getAttribute(key, 2) || value;
					if(key == "href" || key == "src"){
						if(dojo.isIE){
							var hash = location.href.lastIndexOf(location.hash);
							var href = location.href.substring(0, hash).split("/");
							href.pop();
							href = href.join("/") + "/";
							if(value.indexOf(href) == 0){
								value = value.replace(href, "");
							}
							value = decodeURIComponent(value);
						}
						if(value.indexOf("{%") != -1 || value.indexOf("{{") != -1){
							node.setAttribute(key, "");
						}
					}
				}
				if(typeof value == "function"){
					value = value.toString().replace(this._re4, "$1");
				}

				if(!change){
					// Only do a change request if we need to
					tokens.push([types.change, node]);
					change = true;
				}
				// We'll have to resolve attributes during parsing
				tokens.push([types.attr, node, key, value]);
			}

			for(i = 0, child; child = children[i]; i++){
				if(child.nodeType == 1 && child.getAttribute("iscomment")){
					child.parentNode.removeChild(child);
					child = {
						nodeType: 8,
						data: child.innerHTML
					};
				}
				this.__tokenize(child, tokens);
			}

			if(node.parentNode && node.parentNode.tagName){
				if(change){
					tokens.push([types.change, node.parentNode, true]);
				}
				node.parentNode.removeChild(node);
			}else{
				// If this node is parentless, it's a base node, so we have to "up" change to itself
				// and note that it's a top-level to watch for errors
				tokens.push([types.change, node, true, true]);
			}
		},
		__tokenize: function(child, tokens){
			var types = this.types;
			var data = child.data;
			switch(child.nodeType){
				case 1:
					this._tokenize(child, tokens);
					return;
				case 3:
					if(data.match(/[^\s\n]/) && (data.indexOf("{{") != -1 || data.indexOf("{%") != -1)){
						var texts = ddt.tokenize(data);
						for(var j = 0, text; text = texts[j]; j++){
							if(typeof text == "string"){
								tokens.push([types.text, text]);
							}else{
								tokens.push(text);
							}
						}
					}else{
						tokens.push([child.nodeType, child]);
					}
					if(child.parentNode) child.parentNode.removeChild(child);
					return;
				case 8:
					if(data.indexOf("{%") == 0){
						var text = dojo.trim(data.slice(2, -2));
						if(text.substr(0, 5) == "load "){
							var parts = dd.text.pySplit(dojo.trim(text));
							for(var i = 1, part; part = parts[i]; i++){
								dojo["require"](part);
							}
						}
						tokens.push([types.tag, text]);
					}
					if(data.indexOf("{{") == 0){
						tokens.push([types.varr, dojo.trim(data.slice(2, -2))]);
					}
					if(child.parentNode) child.parentNode.removeChild(child);
					return;
			}
		}
	};

	dd.HtmlTemplate = dojo.extend(function(/*String|dojo._Url*/ obj){
		// summary: Use this object for HTML templating
		if(!obj.nodes){
			if(typeof obj == "object"){
				obj = ddt.getTemplateString(obj);
			}
			obj = ddh.getTemplate(obj);
		}

		var tokens = ddh.tokenize(obj.nodes);
		if(dd.tests){
			this.tokens = tokens.slice(0);
		}

		var parser = new dd._HtmlParser(tokens);
		this.nodelist = parser.parse();
	},
	{
		_count: 0,
		_re: /\bdojo:([a-zA-Z0-9_]+)\b/g,
		setClass: function(str){
			this.getRootNode().className = str;
		},
		getRootNode: function(){
			return this.rootNode;
		},
		getBuffer: function(){
			return new dd.HtmlBuffer();
		},
		render: function(context, buffer){
			buffer = buffer || this.getBuffer();
			this.rootNode = null;
			var onSetParent = dojo.connect(buffer, "onSetParent", this, function(node){
				if(!this.rootNode){
					this.rootNode = node || true;
				}
			});
			var output = this.nodelist.render(context || new dd.Context({}), buffer);
			dojo.disconnect(onSetParent);
			buffer._flushCache();
			return output;
		},
		unrender: function(context, buffer){
			return this.nodelist.unrender(context, buffer);
		}
	});

	dd.HtmlBuffer = dojo.extend(function(/*Node*/ parent){
		// summary: Allows the manipulation of DOM
		// description:
		//		Use this to append a child, change the parent, or
		//		change the attribute of the current node.
		this._parent = parent;
		this._cache = [];
	},
	{
		concat: function(/*DOMNode*/ node){
			if(!this._parent){
				if(node.nodeType == 3 && dojo.trim(node.data)){
					throw new Error("Text should not exist outside of the root node in template");
				}
				return this;
			}
			if(this._closed && (node.nodeType != 3 || dojo.trim(node.data))){
				throw new Error("Content should not exist outside of the root node in template");
			}
			if(node.nodeType){
				var caches = this._getCache(this._parent);
				if(node.parentNode === this._parent){
					// If we reach a node that already existed, fill in the cache for this same parent
					for(var i = 0, cache; cache = caches[i]; i++){
						this.onAddNode(node);
						this._parent.insertBefore(cache, node);
						this.onAddNodeComplete(node);
					}
					caches.length = 0;
				}
				if(!node.parentNode || !node.parentNode.tagName){
					caches.push(node);
				}
			}
			return this;
		},
		remove: function(obj){
			if(typeof obj == "string"){
				if(this._parent){
					this._parent.removeAttribute(obj);
				}
			}else{
				if(obj.parentNode){
					this.onRemoveNode();
					if(obj.parentNode){
						obj.parentNode.removeChild(obj);
					}
				}
			}
			return this;
		},
		setAttribute: function(key, value){
			if(key == "class"){
				this._parent.className = value;
			}else if(key == "for"){
				this._parent.htmlFor = value;
			}else if(this._parent.setAttribute){
				this._parent.setAttribute(key, value);
			}
			return this;
		},
		addEvent: function(context, type, fn){
			if(!context.getThis()){ throw new Error("You must use Context.setObject(instance)"); }
			this.onAddEvent(this.getParent(), type, fn);
			return dojo.connect(this.getParent(), type, context.getThis(), fn);
		},
		setParent: function(node, /*Boolean?*/ up, /*Boolean?*/ root){
			if(!this._parent) this._parent = this._first = node;

			if(up && root && node === this._first){
				this._closed = true;
			}

			var caches = this._getCache(this._parent);
			if(caches && caches.length && up){
				for(var i = 0, cache; cache = caches[i]; i++){
					if(cache !== this._parent && (!cache.parentNode || !cache.parentNode.tagName)){
						this.onAddNode(cache);
						this._parent.appendChild(cache);
						this.onAddNodeComplete(cache);
					}
				}
				caches.length = 0;
			}

			this.onSetParent(node, up);
			this._parent = node;
			return this;
		},
		getParent: function(){
			return this._parent;
		},
		onSetParent: function(){
			// summary: Stub called when setParent is used.
		},
		onAddNode: function(node){
			// summary: Stub called before new nodes are added
		},
		onAddNodeComplete: function(node){
			// summary: Stub called after new nodes are added
		},
		onRemoveNode: function(node){
			// summary: Stub called when nodes are removed
		},
		onClone: function(/*DOMNode*/ from, /*DOMNode*/ to){
			// summary: Stub called when a node is duplicated
		},
		onAddEvent: function(/*DOMNode*/ node, /*String*/ type, /*String*/ description){
			// summary: Stub to call when you're adding an event
		},
		_getCache: function(node){
			for(var i = 0, cache; cache = this._cache[i]; i++){
				if(cache[0] === node){
					return cache[1];
				}
			}
			var arr = [];
			this._cache.push([node, arr]);
			return arr;
		},
		_flushCache: function(node){
			for(var i = 0, cache; cache = this._cache[i]; i++){
				if(!cache[1].length){
					this._cache.splice(i--, 1);
				}
			}
		}
	});

	dd._HtmlNode = dojo.extend(function(node){
		// summary: Places a node into DOM
		this.contents = node;
	},
	{
		render: function(context, buffer){
			return buffer.concat(this.contents);
		},
		unrender: function(context, buffer){
			return buffer.remove(this.contents);
		},
		clone: function(buffer){
			return new this.constructor(this.contents);
		}
	});

	dd._HtmlNodeList = dojo.extend(function(/*Node[]*/ nodes){
		// summary: A list of any HTML-specific node object
		// description:
		//		Any object that's used in the constructor or added
		//		through the push function much implement the
		//		render, unrender, and clone functions.
		this.contents = nodes || [];
	},
	{
		parents: new dd._ObjectMap(),
		push: function(node){
			this.contents.push(node);
		},
		unshift: function(node){
			this.contents.unshift(node);
		},
		render: function(context, buffer, /*Node*/ instance){
			buffer = buffer || dd.HtmlTemplate.prototype.getBuffer();

			if(instance){
				var parent = buffer.getParent();
			}
			for(var i = 0; i < this.contents.length; i++){
				buffer = this.contents[i].render(context, buffer);
				if(!buffer) throw new Error("Template node render functions must return their buffer");
			}
			if(parent){
				buffer.setParent(parent);
			}
			return buffer;
		},
		dummyRender: function(context, buffer){
			// summary: A really expensive way of checking to see how a rendering will look.
			//		Used in the ifchanged tag
			var div = document.createElement("div");

			var parent = buffer.getParent();
			var old = this.parents.get(parent);
			this.parents.put(parent, div);
			var nodelist = this.clone(buffer, div);
			if(old){
				this.parents.put(parent, old);
			}else{
				this.parents.put(parent);
			}

			buffer = dd.HtmlTemplate.prototype.getBuffer();
			nodelist.unshift(new dd.ChangeNode(div));
			nodelist.push(new dd.ChangeNode(div, true));
			nodelist.render(context, buffer);
			return div.innerHTML;
		},
		unrender: function(context, buffer){
			for(var i = 0; i < this.contents.length; i++){
				buffer = this.contents[i].unrender(context, buffer);
				if(!buffer) throw new Error("Template node render functions must return their buffer");
			}
			return buffer;
		},
		clone: function(buffer){
			// summary:
			//		Used to create an identical copy of a NodeList, useful for things like the for tag.
			var parent = buffer.getParent();
			var contents = this.contents;
			var nodelist = new dd._HtmlNodeList();
			var cloned = [];
			for(var i = 0; i < contents.length; i++){
				var clone = contents[i].clone(buffer);
				if(clone instanceof dd.ChangeNode || clone instanceof dd._HtmlNode){
					var item = this.parents.get(clone.contents);
					if(item){
						clone.contents = item;
					}else if(parent !== clone.contents && clone instanceof dd._HtmlNode){
						var node = clone.contents;
						clone.contents = clone.contents.cloneNode(false);
						buffer.onClone(node, clone.contents);
						cloned.push(node);
						this.parents.put(node, clone.contents);
					}
				}
				nodelist.push(clone);
			}

			for(var i = 0, clone; clone = cloned[i]; i++){
				this.parents.put(clone);
			}

			return nodelist;
		}
	});

	dd._HtmlVarNode = dojo.extend(function(str){
		// summary: A node to be processed as a variable
		// description:
		//		Will render an object that supports the render function
		// 		and the getRootNode function
		this.contents = new dd._Filter(str);
		this._lists = {};
	},
	{
		render: function(context, buffer){
			this._rendered = true;
			var str = this.contents.resolve(context);
			if(str && str.render && str.getRootNode){
				var root = this._curr = str.getRootNode();
				var lists = this._lists;
				var list = lists[root];
				if(!list){
					list = lists[root] = new dd._HtmlNodeList();
					list.push(new dd.ChangeNode(buffer.getParent()));
					list.push(new dd._HtmlNode(root));
					list.push(str);
					list.push(new dd.ChangeNode(buffer.getParent(), true));
				}
				return list.render(context, buffer);
			}else{
				if(!this._txt) this._txt = document.createTextNode(str);
				if(this._txt.data != str) this._txt.data = str;
				return buffer.concat(this._txt);
			}
			return buffer;
		},
		unrender: function(context, buffer){
			if(this._rendered){
				this._rendered = false;
				if(this._curr){
					return this._lists[this._curr].unrender(context, buffer);
				}else if(this._txt){
					return buffer.remove(this._txt);
				}
			}
			return buffer;
		},
		clone: function(){
			return new this.constructor(this.contents.getExpression());
		}
	});

	dd.ChangeNode = dojo.extend(function(node, /*Boolean?*/ up, /*Bookean*/ root){
		// summary: Changes the parent during render/unrender
		this.contents = node;
		this._up = up;
		this._root = root;
	},
	{
		render: function(context, buffer){
			return buffer.setParent(this.contents, this._up, this._root);
		},
		unrender: function(context, buffer){
			if(!this.contents.parentNode){
				return buffer;
			}
			if(!buffer.getParent()){
				return buffer;
			}
			return buffer.setParent(this.contents);
		},
		clone: function(buffer){
			return new this.constructor(this.contents, this._up, this._root);
		}
	});

	dd.AttributeNode = dojo.extend(function(key, value){
		// summary: Works on attributes
		this._key = key;
		this._value = value;
		this._tpl = new dd.Template(value);
		this.contents = "";
	},
	{
		render: function(context, buffer){
			var key = this._key;
			var value = this._tpl.render(context);
			if(this._rendered){
				if(value != this.contents){
					this.contents = value;
					return buffer.setAttribute(key, value);
				}
			}else{
				this._rendered = true;
				this.contents = value;
				return buffer.setAttribute(key, value);
			}
			return buffer;
		},
		unrender: function(context, buffer){
			if(this._rendered){
				this._rendered = false;
				this.contents = "";
				return buffer.remove(this.contents);
			}
			return buffer;
		},
		clone: function(){
			return new dd.AttributeNode(this._key, this._value);
		}
	});

	dd._HtmlTextNode = dojo.extend(function(str){
		// summary: Adds a straight text node without any processing
		this.contents = document.createTextNode(str);
	},
	{
		set: function(data){
			this.contents.data = data;
		},
		render: function(context, buffer){
			return buffer.concat(this.contents);
		},
		unrender: function(context, buffer){
			return buffer.remove(this.contents);
		},
		clone: function(){
			return new this.constructor(this.contents.data);
		}
	});

	dd._HtmlParser = dojo.extend(function(tokens){
		// summary: Turn a simple array into a set of objects
		// description:
		//	This is also used by all tags to move through
		//	the list of nodes.
		this.contents = tokens;
	},
	{
		parse: function(/*Array?*/ stop_at){
			var types = ddh.types;
			var terminators = {};
			var tokens = this.contents;
			if(!stop_at){
				stop_at = [];
			}
			for(var i = 0; i < stop_at.length; i++){
				terminators[stop_at[i]] = true;
			}
			var nodelist = new dd._HtmlNodeList();
			while(tokens.length){
				var token = tokens.shift();
				var type = token[0];
				var value = token[1];
				if(type == types.custom){
					nodelist.push(value);
				}else if(type == types.change){
					nodelist.push(new dd.ChangeNode(value, token[2], token[3]));
				}else if(type == types.attr){
					var fn = ddt.getTag("attr:" + token[2], true);
					if(fn && token[3]){
						nodelist.push(fn(null, token[2] + " " + token[3]));
					}else if(dojo.isString(token[3]) && (token[3].indexOf("{%") != -1 || token[3].indexOf("{{") != -1)){
						nodelist.push(new dd.AttributeNode(token[2], token[3]));
					}
				}else if(type == types.elem){
					var fn = ddt.getTag("node:" + value.tagName.toLowerCase(), true);
					if(fn){
						// TODO: We need to move this to tokenization so that it's before the
						// 				node and the parser can be passed here instead of null
						nodelist.push(fn(null, value, value.tagName.toLowerCase()));
					}
					nodelist.push(new dd._HtmlNode(value));
				}else if(type == types.varr){
					nodelist.push(new dd._HtmlVarNode(value));
				}else if(type == types.text){
					nodelist.push(new dd._HtmlTextNode(value.data || value));
				}else if(type == types.tag){
					if(terminators[value]){
						tokens.unshift(token);
						return nodelist;
					}
					var cmd = value.split(/\s+/g);
					if(cmd.length){
						cmd = cmd[0];
						var fn = ddt.getTag(cmd);
						if(typeof fn != "function"){
							throw new Error("Function not found for " + cmd);
						}
						var tpl = fn(this, value);
						if(tpl){
							nodelist.push(tpl);
						}
					}
				}
			}

			if(stop_at.length){
				throw new Error("Could not find closing tag(s): " + stop_at.toString());
			}

			return nodelist;
		},
		next: function(){
			// summary: Used by tags to discover what token was found
			var token = this.contents.shift();
			return {type: token[0], text: token[1]};
		},
		skipPast: function(endtag){
			return dd.Parser.prototype.skipPast.call(this, endtag);
		},
		getVarNodeConstructor: function(){
			return dd._HtmlVarNode;
		},
		getTextNodeConstructor: function(){
			return dd._HtmlTextNode;
		},
		getTemplate: function(/*String*/ loc){
			return new dd.HtmlTemplate(ddh.getTemplate(loc));
		}
	});

})();