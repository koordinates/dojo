dojo.provide("dijit._editor._Plugin");
dojo.require("dijit._Widget");
dojo.require("dijit.Editor");
dojo.require("dijit.form.Button");

dojo.declare("dijit._editor._Plugin", null, {
	// summary
	//		Base class for a "plugin" to the editor, which is usually
	//		a single button on the Toolbar and some associated code

	constructor: function(/*Object?*/args, /*DomNode?*/node){
		if(args){
			dojo.mixin(this, args);
		}
		this._connects=[];
	},

	// editor: [const] dijit.Editor
	//		Points to the parent editor
	editor: null,

	// iconClassPrefix: [const] String
	//		The CSS class name for the button node is formed from `iconClassPrefix` and `command`
	iconClassPrefix: "dijitEditorIcon",

	// button: dijit._Widget?
	//		Pointer to `dijit.form.Button` or other widget (ex: `dijit.form.FilteringSelect`) that controls this plugin.
	//		If not specified, will be created on initialization according to `buttonClass`
	button: null,

	// queryCommand: ???
	//		TODO: unused, remove
	queryCommand: null,

	// command: String
	//		String like "insertUnorderedList", "outdent", "justifyCenter", etc. that represents an editor command.
	//		Passed to editor.execCommand() if `useDefaultCommand` is true.
	command: "",

	// commandArg: anything
	//		Argument to execCommand() after command.
	//		TODO: unused, remove
	commandArg: null,

	// useDefaultCommand: Boolean
	//		If true, this plugin executes by calling Editor.execCommand() with the argument specified in `command`.
	useDefaultCommand: true,

	// buttonClass: Widget Class
	//		Class for button to control this plugin.   This is used to instantiate the button, unless `button` itself
	//		is specified directly.
	buttonClass: dijit.form.Button,

	getLabel: function(key){
		// summary:
		//		Returns the label to use for the button
		// tags:
		//		private
		return this.editor.commands[key];		// String
	},

	_initButton: function(props){
		// summary:
		//		Initialize the button that will control this plugin.
		//		This code only works for plugins controlling built-in commands in the editor.
		// tags:
		//		protected extension
		if(this.command.length){
			var label = this.getLabel(this.command);
			var className = this.iconClassPrefix+" "+this.iconClassPrefix + this.command.charAt(0).toUpperCase() + this.command.substr(1);
			if(!this.button){
				props = dojo.mixin({
					label: label,
					showLabel: false,
					iconClass: className,
					dropDown: this.dropDown,
					tabIndex: "-1"
				}, props || {});
				this.button = new this.buttonClass(props);
			}
		}
	},

	destroy: function(f){
		// summary:
		//		Destroy this plugin

		// TODO: remove f parameter, it's unused

		dojo.forEach(this._connects, dojo.disconnect);
		if(this.dropDown){
			this.dropDown.destroyRecursive();
		}
	},

	connect: function(o, f, tf){
		// summary:
		//		Make a dojo.connect() that is automatically disconnected when this plugin is destroyed.
		//		Similar to `dijit._Widget.connect`.
		// tags:
		//		protected
		this._connects.push(dojo.connect(o, f, this, tf));
	},

	updateState: function(){
		// summary:
		//		This is called on meaningful events in the editor, such as arrow keys (but not simple typing of
		//		alphanumeric keys).   It gives the plugin a chance to update the CSS of it's button.
		//
		//		For example, the "bold" plugin will highlight/unhighlight the bold button depending on whether the
		//		characters next to the caret are bold or not.
		//
		//		Only makes sense when `useDefaultCommand` is true, as it calls Editor.queryCommandEnabled(`command`).
		var _e = this.editor;
		var _c = this.command;
		if(!_e){ return; }
		if(!_e.isLoaded){ return; }
		if(!_c.length){ return; }
		if(this.button){
			try{
				var enabled = _e.queryCommandEnabled(_c);
				if(this.enabled!==enabled){
					this.enabled=enabled;
					this.button.attr('disabled', !enabled);
				}
				if(typeof this.button.checked == 'boolean'){
					var checked=_e.queryCommandState(_c);
					if(this.checked!==checked){
						this.checked=checked;
						this.button.attr('checked', _e.queryCommandState(_c));
					}
				}
			}catch(e){
				console.debug(e);
			}
		}
	},

	setEditor: function(/*Widget*/ editor){
		// summary:
		//		In the old days this existed so that one toolbar could control multiple editors.
		//		In Dijit 1.0, it's just in the initialization process, to tell the plugin which Editor it's
		//		associated with.
		//
		//		TODO: refactor code to just pass editor to constructor.

		// FIXME: detatch from previous editor!!
		this.editor = editor;

		// FIXME: prevent creating this if we don't need to (i.e., editor can't handle our command)
		this._initButton();

		// FIXME: wire up editor to button here!
		if(this.command.length &&
			!this.editor.queryCommandAvailable(this.command)
		){
			// console.debug("hiding:", this.command);
			if(this.button){
				this.button.domNode.style.display = "none";
			}
		}
		if(this.button && this.useDefaultCommand){
			this.connect(this.button, "onClick",
				dojo.hitch(this.editor, "execCommand", this.command, this.commandArg)
			);
		}
		this.connect(this.editor, "onNormalizedDisplayChanged", "updateState");
	},

	setToolbar: function(/*Widget*/ toolbar){
		// summary:
		//		Like setEditor() this exists from the old days when one toolbar could control multiple editors.
		//		Now, it's just called as part of the initialization process, telling the plugin to add itself
		//		to the toolbar (if there is a button associated with the plugin).
		//
		//		TODO: refactor code to just pass toolbar to constructor.

		if(this.button){
			toolbar.addChild(this.button);
		}
		// console.debug("adding", this.button, "to:", toolbar);
	}
});
