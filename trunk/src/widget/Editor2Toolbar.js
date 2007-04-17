dojo.provide("dojo.widget.Editor2Toolbar");

dojo.require("dojo.lang.*");
dojo.require("dojo.widget.*");
dojo.require("dojo.event.*");
dojo.require("dojo.html.layout");
dojo.require("dojo.html.display");
dojo.require("dojo.widget.RichText");

dojo.lang.declare("dojo.widget.HandlerManager", null,
	function(){
		this._registeredHandlers=[];
	},
{
	// summary: internal base class for handler function management
	registerHandler: function(/*Object*/obj, /*String*/func){
		// summary: register a handler
		// obj: object which has the function to call
		// func: the function in the object
		if(arguments.length == 2){
			this._registeredHandlers.push(function(){return obj[func].apply(obj, arguments);});
		}else{
			/* obj: Function
			    func: null
			    pId: f */
			this._registeredHandlers.push(obj);
		}
	},
	removeHandler: function(func){
		// summary: remove a registered handler
		var i=0,handle,handles=this._registeredHandlers;
		while(handle=handles[i++]){
			if(func === handle){
				delete this._registeredHandlers[--i];
				return;
			}
		}
		dojo.debug("HandlerManager handler "+func+" is not registered, can not remove.");
	},
	destroy: function(){
		var i=this._registeredHandlers.length-1,handles=this._registeredHandlers;
		while(handles[i--]){
			delete this._registeredHandlers[i+1];
		}
	}
});

dojo.widget.Editor2ToolbarItemManager = new dojo.widget.HandlerManager;
dojo.lang.mixin(dojo.widget.Editor2ToolbarItemManager,
{
	getToolbarItem: function(/*String*/name){
		// summary: return a toobar item with the given name
		var item;
		name = name.toLowerCase();
		var i=0, handle, handles=this._registeredHandlers;
		while(handle=handles[i++]){
			item = handle(name);
			if(item){
				return item;
			}
		}

		_deprecated = function(cmd, plugin){
			if(!dojo.widget['Editor2Plugin'] || !dojo.widget.Editor2Plugin[plugin]){
				dojo.deprecated('Toolbar item '+name+" is now defined in plugin dojo.widget.Editor2Plugin."+plugin+". It shall be required explicitly", "0.6");
				dojo['require']("dojo.widget.Editor2Plugin."+plugin); //avoid loading by the build
			}
		}
		if(name == 'forecolor' || name == 'hilitecolor'){
			_deprecated(name, 'ColorPicker')
		}

		switch(name){
			case 'forecolor':
			case 'hilitecolor':
				item = new dojo.widget.Editor2ToolbarColorPaletteButton(name);
				break;
			case 'plainformatblock':
				item = new dojo.widget.Editor2ToolbarFormatBlockPlainSelect("formatblock");
				break;
			//TODO:
//			case 'inserthtml':
			case 'blockdirltr':
			case 'blockdirrtl':
			case 'dirltr':
			case 'dirrtl':
			case 'inlinedirltr':
			case 'inlinedirrtl':
				dojo.debug("Not yet implemented toolbar item: "+name);
				break;
			default:
				//simple button, which just call a command with name
				item = new dojo.widget.Editor2ToolbarButton(name);
//				dojo.debug("dojo.widget.Editor2ToolbarItemManager.getToolbarItem: Unknown toolbar item: "+name);
		}
		return item;
	}
});

dojo.addOnUnload(dojo.widget.Editor2ToolbarItemManager, "destroy");

dojo.declare("dojo.widget.Editor2ToolbarButton", null,
	function(name){
		this._name = name;
//		this._command = editor.getCommand(name);
	},
{
	// summary:
	//		dojo.widget.Editor2ToolbarButton is the base class for all toolbar item in Editor2Toolbar
	create: function(/*DomNode*/node, /*dojo.widget.Editor2Toolbar*/toolbar, /*Boolean*/nohover){
		// summary: create the item
		// node: the dom node which is the root of this toolbar item
		// toolbar: the Editor2Toolbar widget this toolbar item belonging to
		// nohover: whether this item in charge of highlight this item
		this._domNode = node;
		var cmd = toolbar.parent.getCommand(this._name); //FIXME: maybe an issue if different instance has different language
		if(cmd){
			this._domNode.title = cmd.getText();
		}
		//make this unselectable: different browsers
		//use different properties for this, so use
		//js do it automatically
		this.disableSelection(this._domNode);

		this._parentToolbar = toolbar;
		dojo.event.connect(this._domNode, 'onclick', this, 'onClick');
		if(!nohover){
			dojo.event.connect(this._domNode, 'onmouseover', this, 'onMouseOver');
			dojo.event.connect(this._domNode, 'onmouseout', this, 'onMouseOut');
		}
	},
	disableSelection: function(/*DomNode*/rootnode){
		// summary: disable selection on the passed node and all its children
		dojo.html.disableSelection(rootnode);
		var i=0,node,nodes = rootnode.all || rootnode.getElementsByTagName("*");
		while(node=nodes[i++]){
			dojo.html.disableSelection(node);
		}
	},
	onMouseOver: function(){
		var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
		if(curInst){
			var _command = curInst.getCommand(this._name);
			if(_command && _command.getState() != dojo.widget.Editor2Manager.commandState.Disabled){
				this.highlightToolbarItem();
			}
		}
	},
	onMouseOut: function(){
		this.unhighlightToolbarItem();
	},
	destroy: function(){
		// summary: destructor
		this._domNode = null;
//		delete this._command;
		this._parentToolbar = null;
	},
	onClick: function(e){
		if(this._domNode && !this._domNode.disabled && this._parentToolbar.checkAvailability()){
			e.preventDefault();
			e.stopPropagation();
			var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
			if(curInst){
				var _command = curInst.getCommand(this._name);
				if(_command){
					_command.execute();
				}
			}
		}
	},
	refreshState: function(){
		// summary: update the state of the toolbar item
		var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
		var em = dojo.widget.Editor2Manager;
		if(curInst){
			var _command = curInst.getCommand(this._name);
			if(_command){
				var state = _command.getState();
				if(state != this._lastState){
					switch(state){
						case em.commandState.Latched:
							this.latchToolbarItem();
							break;
						case em.commandState.Enabled:
							this.enableToolbarItem();
							break;
						case em.commandState.Disabled:
						default:
							this.disableToolbarItem();
					}
					this._lastState = state;
				}
			}
		}
		return em.commandState.Enabled;
	},

	latchToolbarItem: function(){
		this._domNode.disabled = false;
		this.removeToolbarItemStyle(this._domNode);
		dojo.html.addClass(this._domNode, 'ToolbarButtonLatched');
	},

	enableToolbarItem: function(){
		this._domNode.disabled = false;
		this.removeToolbarItemStyle(this._domNode);
		dojo.html.addClass(this._domNode, 'ToolbarButtonEnabled');
	},

	disableToolbarItem: function(){
		this._domNode.disabled = true;
		this.removeToolbarItemStyle(this._domNode);
		dojo.html.addClass(this._domNode, 'ToolbarButtonDisabled');
	},

	highlightToolbarItem: function(){
		dojo.html.addClass(this._domNode, 'ToolbarButtonHighlighted');
	},

	unhighlightToolbarItem: function(){
		dojo.html.removeClass(this._domNode, 'ToolbarButtonHighlighted');
	},

	removeToolbarItemStyle: function(){
		dojo.html.removeClass(this._domNode, 'ToolbarButtonEnabled');
		dojo.html.removeClass(this._domNode, 'ToolbarButtonLatched');
		dojo.html.removeClass(this._domNode, 'ToolbarButtonDisabled');
		this.unhighlightToolbarItem();
	}
});

dojo.declare("dojo.widget.Editor2ToolbarFormatBlockPlainSelect", dojo.widget.Editor2ToolbarButton, {
	// summary: dojo.widget.Editor2ToolbarFormatBlockPlainSelect provides a simple select for setting block format

	create: function(node, toolbar){
//		dojo.widget.Editor2ToolbarFormatBlockPlainSelect.superclass.create.apply(this, arguments);
		this._domNode = node;
		this._parentToolbar = toolbar;
		//TODO: check node is a select
		this._domNode = node;
		this.disableSelection(this._domNode);
		dojo.event.connect(this._domNode, 'onchange', this, 'onChange');
	},

	destroy: function(){
		this._domNode = null;
	},

	onChange: function(){
		if(this._parentToolbar.checkAvailability()){
			var sv = this._domNode.value.toLowerCase();
			var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
			if(curInst){
				var _command = curInst.getCommand(this._name);
				if(_command){
					_command.execute(sv);
				}
			}
		}
	},

	refreshState: function(){
		if(this._domNode){
			dojo.widget.Editor2ToolbarFormatBlockPlainSelect.superclass.refreshState.call(this);
			var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
			if(curInst){
				var _command = curInst.getCommand(this._name);
				if(_command){
					var format = _command.getValue();
					if(!format){ format = ""; }
					dojo.lang.forEach(this._domNode.options, function(item){
						if(item.value.toLowerCase() == format.toLowerCase()){
							item.selected = true;
						}
					});
				}
			}
		}
	}
});

dojo.widget.defineWidget(
	"dojo.widget.Editor2Toolbar",
	dojo.widget.HtmlWidget,
	function(){
		dojo.event.connect(this, "fillInTemplate", dojo.lang.hitch(this, function(){
			if(dojo.render.html.ie){
				this.domNode.style.zoom = 1.0;
			}
		}));
	},
	{
		// summary:
		//		dojo.widget.Editor2Toolbar is the main widget for the toolbar associated with an Editor2

		templatePath: dojo.uri.moduleUri("dojo.widget", "templates/EditorToolbar.html"),
		templateCssPath: dojo.uri.moduleUri("dojo.widget", "templates/EditorToolbar.css"),

//		itemNodeType: 'span', //all the items (with attribute dojoETItemName set) defined in the toolbar should be a of this type

		postCreate: function(){
			var i=0,node,nodes = dojo.html.getElementsByClass("dojoEditorToolbarItem", this.domNode/*, this.itemNodeType*/);

			this.items = {};
			while(node=nodes[i++]){
				var itemname = node.getAttribute("dojoETItemName");
				if(itemname){
					var item = dojo.widget.Editor2ToolbarItemManager.getToolbarItem(itemname);
					if(item){
						item.create(node, this);
						this.items[itemname.toLowerCase()] = item;
					}else{
						//hide unsupported toolbar items
						node.style.display = "none";
					}
				}
			}
		},

		update: function(){
			// summary: update all the toolbar items
			for(var cmd in this.items){
				this.items[cmd].refreshState();
			}
		},

		shareGroup: '',
		checkAvailability: function(){
			// summary: returns whether items in this toolbar can be executed
			// description: 
			//		For unshared toolbar, when clicking on a toolbar, the corresponding
			//		editor will be focused, and this function always return true. For shared
			//		toolbar, if the current focued editor is not one of the instances sharing
			//		this toolbar, this function return false, otherwise true.
			var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
			if(!this.shareGroup||!curInst){
				this.parent.focus();
				return true;
			}
			return (this.shareGroup == curInst.toolbarGroup);
		},
		destroy: function(){
			for(var it in this.items){
				this.items[it].destroy();
				delete this.items[it];
			}
			dojo.widget.Editor2Toolbar.superclass.destroy.call(this);
		}
	}
);
