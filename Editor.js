dojo.provide("dijit.Editor");
dojo.require("dijit._editor.RichText");

dojo.require("dijit.Toolbar");
dojo.require("dijit.ToolbarSeparator");
dojo.require("dijit._editor._Plugin");
dojo.require("dijit._editor.plugins.EnterKeyHandling");
dojo.require("dijit._editor.range");
dojo.require("dijit._Container");
dojo.require("dojo.i18n");
dojo.require("dijit.layout._LayoutWidget");
dojo.requireLocalization("dijit._editor", "commands");

dojo.declare(
	"dijit.Editor",
	dijit._editor.RichText,
	{
		// summary:
		//		A rich text Editing widget
		//
		// description:
		//		This widget provides basic WYSIWYG editing features, based on the browser's
		//		underlying rich text editing capability, accompanied by a toolbar (`dijit.Toolbar`).
		//		A plugin model is available to extend the editor's capabilities as well as the
		//		the options available in the toolbar.  Content generation may vary across
		//		browsers, and clipboard operations may have different results, to name
		//		a few limitations.  Note: this widget should not be used with the HTML
		//		&lt;TEXTAREA&gt; tag -- see dijit._editor.RichText for details.

		// plugins: Object[]
		//		A list of plugin names (as strings) or instances (as objects)
		//		for this widget.
		//
		//		When declared in markup, it might look like:
		//	|	plugins="['bold',{name:'dijit._editor.plugins.FontChoice', command:'fontName', generic:true}]"
		plugins: null,

		// extraPlugins: Object[]
		//		A list of extra plugin names which will be appended to plugins array
		extraPlugins: null,

		constructor: function(){
			// summary:
			//		Runs on widget initialization to setup arrays etc.
			// tags:
			//		private

			if(!dojo.isArray(this.plugins)){
				this.plugins=["undo","redo","|","cut","copy","paste","|","bold","italic","underline","strikethrough","|",
				"insertOrderedList","insertUnorderedList","indent","outdent","|","justifyLeft","justifyRight","justifyCenter","justifyFull",
				"dijit._editor.plugins.EnterKeyHandling" /*, "createLink"*/];
			}

			this._plugins=[];
			this._editInterval = this.editActionInterval * 1000;

			//IE will always lose focus when other element gets focus, while for FF and safari,
			//when no iframe is used, focus will be lost whenever another element gets focus.
			//For IE, we can connect to onBeforeDeactivate, which will be called right before
			//the focus is lost, so we can obtain the selected range. For other browsers,
			//no equivelent of onBeforeDeactivate, so we need to do two things to make sure
			//selection is properly saved before focus is lost: 1) when user clicks another
			//element in the page, in which case we listen to mousedown on the entire page and
			//see whether user clicks out of a focus editor, if so, save selection (focus will
			//only lost after onmousedown event is fired, so we can obtain correct caret pos.)
			//2) when user tabs away from the editor, which is handled in onKeyDown below.
			if(dojo.isIE){
				this.events.push("onBeforeDeactivate");
				this.events.push("onBeforeActivate");
			}
		},

		postCreate: function(){
			//for custom undo/redo
			if(this.customUndo){
				dojo['require']("dijit._editor.range");
				this._steps=this._steps.slice(0);
				this._undoedSteps=this._undoedSteps.slice(0);
//				this.addKeyHandler('z',this.KEY_CTRL,this.undo);
//				this.addKeyHandler('y',this.KEY_CTRL,this.redo);
			}
			if(dojo.isArray(this.extraPlugins)){
				this.plugins=this.plugins.concat(this.extraPlugins);
			}

//			try{
			this.inherited(arguments);
//			dijit.Editor.superclass.postCreate.apply(this, arguments);

			this.commands = dojo.i18n.getLocalization("dijit._editor", "commands", this.lang);

			if(!this.toolbar){
				// if we haven't been assigned a toolbar, create one
				this.toolbar = new dijit.Toolbar({});
				this.header.appendChild(this.toolbar.domNode);
			}

			dojo.forEach(this.plugins, this.addPlugin, this);
			this.onNormalizedDisplayChanged(); //update toolbar button status
//			}catch(e){ console.debug(e); }

			dojo.addClass(this.iframe.parentNode, "dijitEditorIFrameContainer");
			dojo.addClass(this.iframe, "dijitEditorIFrame");
			dojo.attr(this.iframe, "allowTransparency", true);

			this.toolbar.startup();
		},
		destroy: function(){
			dojo.forEach(this._plugins, function(p){
				if(p && p.destroy){
					p.destroy();
				}
			});
			this._plugins=[];
			this.toolbar.destroyRecursive();
			delete this.toolbar;
			this.inherited(arguments);
		},
		addPlugin: function(/*String||Object*/plugin, /*Integer?*/index){
			// summary:
			//		takes a plugin name as a string or a plugin instance and
			//		adds it to the toolbar and associates it with this editor
			//		instance. The resulting plugin is added to the Editor's
			//		plugins array. If index is passed, it's placed in the plugins
			//		array at that index. No big magic, but a nice helper for
			//		passing in plugin names via markup.
			//
			// plugin: String, args object or plugin instance
			//
			// args:
			//		This object will be passed to the plugin constructor
			//
			// index: Integer
			//		Used when creating an instance from
			//		something already in this.plugins. Ensures that the new
			//		instance is assigned to this.plugins at that index.
			var args=dojo.isString(plugin)?{name:plugin}:plugin;
			if(!args.setEditor){
				var o={"args":args,"plugin":null,"editor":this};
				dojo.publish(dijit._scopeName + ".Editor.getPlugin",[o]);
				if(!o.plugin){
					var pc = dojo.getObject(args.name);
					if(pc){
						o.plugin=new pc(args);
					}
				}
				if(!o.plugin){
					console.warn('Cannot find plugin',plugin);
					return;
				}
				plugin=o.plugin;
			}
			if(arguments.length > 1){
				this._plugins[index] = plugin;
			}else{
				this._plugins.push(plugin);
			}
			plugin.setEditor(this);
			if(dojo.isFunction(plugin.setToolbar)){
				plugin.setToolbar(this.toolbar);
			}
		},
		//the following 3 functions are required to make the editor play nice under a layout widget, see #4070
		startup: function(){
			// summary:
			//		Exists to make Editor work as a child of a layout widget.
			//		Developers don't need to call this method.
			// tags:
			//		protected
			//console.log('startup',arguments);
		},
		resize: function(size){
			// summary:
			//		Resize the editor to the specified size, see `dijit.layout._LayoutWidget.resize`
			if(size){
				// we've been given a height/width for the entire editor (toolbar + contents), calls layout()
				// to split the allocated size between the toolbar and the contents
				dijit.layout._LayoutWidget.prototype.resize.apply(this, arguments);
			}
			/*
			else{
				// do nothing, the editor is already laid out correctly.   The user has probably specified
				// the height parameter, which was used to set a size on the iframe
			}
			*/
		},
		layout: function(){
			// summary:
			//		Called from `dijit.layout._LayoutWidget.resize`.  This shouldn't be called directly
			// tags:
			//		protected

			// Converts the iframe (or rather the <div> surrounding it) to take all the available space
			// except what's needed for the header (toolbars) and footer (breadcrumbs, etc).
			// A class was added to the iframe container and some themes style it, so we have to
			// calc off the added margins and padding too. See tracker: #10662
			var areaHeight = (this._contentBox.h - 
				(this.getHeaderHeight() + this.getFooterHeight() + 
				 dojo._getPadBorderExtents(this.iframe.parentNode).h +
				 dojo._getMarginExtents(this.iframe.parentNode).h));
			this.editingArea.style.height = areaHeight + "px";
			if(this.iframe){
				this.iframe.style.height="100%";
			}
			this._layoutMode = true;
		},
		_onIEMouseDown: function(/*Event*/ e){
			// summary:
			//		IE only to prevent 2 clicks to focus
			// tags:
			//		private

			var outsideClientArea = this.document.body.componentFromPoint(e.x, e.y);
			if(!outsideClientArea){
				delete this._savedSelection; // new mouse position overrides old selection
				if(e.target.tagName == "BODY"){
					setTimeout(dojo.hitch(this, "placeCursorAtEnd"), 0);
				}
				this.inherited(arguments);
			}
		},
		onBeforeActivate: function(e){
			this._restoreSelection();
		},
		onBeforeDeactivate: function(e){
			// summary:
			//		Called on IE right before focus is lost.   Saves the selected range.
			// tags:
			//		private
			if(this.customUndo){
				this.endEditing(true);
			}
			//in IE, the selection will be lost when other elements get focus,
			//let's save focus before the editor is deactivated
			if(e.target.tagName != "BODY"){
				this._saveSelection();
			}
			//console.log('onBeforeDeactivate',this);
		},

		/* beginning of custom undo/redo support */

		// customUndo: Boolean
		//		Whether we shall use custom undo/redo support instead of the native
		//		browser support. By default, we only enable customUndo for IE, as it
		//		has broken native undo/redo support. Note: the implementation does
		//		support other browsers which have W3C DOM2 Range API implemented.
		customUndo: dojo.isIE,

		// editActionInterval: Integer
		//		When using customUndo, not every keystroke will be saved as a step.
		//		Instead typing (including delete) will be grouped together: after
		//		a user stops typing for editActionInterval seconds, a step will be
		//		saved; if a user resume typing within editActionInterval seconds,
		//		the timeout will be restarted. By default, editActionInterval is 3
		//		seconds.
		editActionInterval: 3,

		beginEditing: function(cmd){
			// summary:
			//		Called to note that the user has started typing alphanumeric characters, if it's not already noted.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private
			if(!this._inEditing){
				this._inEditing=true;
				this._beginEditing(cmd);
			}
			if(this.editActionInterval>0){
				if(this._editTimer){
					clearTimeout(this._editTimer);
				}
				this._editTimer = setTimeout(dojo.hitch(this, this.endEditing), this._editInterval);
			}
		},
		_steps:[],
		_undoedSteps:[],
		execCommand: function(cmd){
			// summary:
			//		Main handler for executing any commands to the editor, like paste, bold, etc.
			//      Called by plugins, but not meant to be called by end users.
			// tags:
			//		protected
			if(this.customUndo && (cmd == 'undo' || cmd == 'redo')){
				return this[cmd]();
			}else{
				if(this.customUndo){
					this.endEditing();
					this._beginEditing();
				}
				var r;
				try{
					r = this.inherited('execCommand', arguments);
					if(dojo.isWebKit && cmd == 'paste' && !r){ //see #4598: safari does not support invoking paste from js
						throw { code: 1011 }; // throw an object like Mozilla's error
					}
				}catch(e){
					//TODO: when else might we get an exception?  Do we need the Mozilla test below?
					if(e.code == 1011 /* Mozilla: service denied */ && /copy|cut|paste/.test(cmd)){
						// Warn user of platform limitation.  Cannot programmatically access clipboard. See ticket #4136
						var sub = dojo.string.substitute,
							accel = {cut:'X', copy:'C', paste:'V'};
						alert(sub(this.commands.systemShortcut,
							[this.commands[cmd], sub(this.commands[dojo.isMac ? 'appleKey' : 'ctrlKey'], [accel[cmd]])]));
					}
					r = false;
				}
				if(this.customUndo){
					this._endEditing();
				}
				return r;
			}
		},
		queryCommandEnabled: function(cmd){
			// summary:
			//		Returns true if specified editor command is enabled.
			//      Used by the plugins to know when to highlight/not highlight buttons.
			// tags:
			//		protected
			if(this.customUndo && (cmd == 'undo' || cmd == 'redo')){
				return cmd == 'undo' ? (this._steps.length > 1) : (this._undoedSteps.length > 0);
			}else{
				return this.inherited('queryCommandEnabled',arguments);
			}
		},

		_moveToBookmark: function(b){
			// summary:
			//		Selects the text specified in bookmark b
			// tags:
			//		private
			var bookmark = b.mark;
			var mark = b.mark;
			var col = b.isCollapsed;
			if(dojo.isIE){
				if(dojo.isArray(mark)){//IE CONTROL
					bookmark = [];
					dojo.forEach(mark,function(n){
						bookmark.push(dijit.range.getNode(n,this.editNode));
					},this);
				}
			}else{//w3c range
				var r=dijit.range.create(this.window);
				r.setStart(dijit.range.getNode(b.startContainer,this.editNode),b.startOffset);
				r.setEnd(dijit.range.getNode(b.endContainer,this.editNode),b.endOffset);
				bookmark=r;
			}
			dojo.withGlobal(this.window,'moveToBookmark',dijit,[{mark: bookmark, isCollapsed: col}]);
		},

		_changeToStep: function(from, to){
			// summary:
			//		Reverts editor to "to" setting, from the undo stack.
			// tags:
			//		private
			this.setValue(to.text);
			var b=to.bookmark;
			if(!b){ return; }
			this._moveToBookmark(b);
		},
		undo: function(){
			// summary:
			//		Handler for editor undo (ex: ctrl-z) operation
			// tags:
			//		private
//			console.log('undo');
			this.endEditing(true);
			var s=this._steps.pop();
			if(this._steps.length>0){
				this.focus();
				this._changeToStep(s,this._steps[this._steps.length-1]);
				this._undoedSteps.push(s);
				this.onDisplayChanged();
				return true;
			}
			return false;
		},
		redo: function(){
			// summary:
			//		Handler for editor redo (ex: ctrl-y) operation
			// tags:
			//		private

//			console.log('redo');
			this.endEditing(true);
			var s=this._undoedSteps.pop();
			if(s && this._steps.length>0){
				this.focus();
				this._changeToStep(this._steps[this._steps.length-1],s);
				this._steps.push(s);
				this.onDisplayChanged();
				return true;
			}
			return false;
		},
		endEditing: function(ignore_caret){
			// summary:
			//		Called to note that the user has stopped typing alphanumeric characters, if it's not already noted.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private
			if(this._editTimer){
				clearTimeout(this._editTimer);
			}
			if(this._inEditing){
				this._endEditing(ignore_caret);
				this._inEditing=false;
			}
		},
		_getBookmark: function(){
			// summary:
			//		Get the currently selected text
			// tags:
			//		protected
			var b=dojo.withGlobal(this.window,dijit.getBookmark);
			var tmp=[];
			if(b.mark){
				var mark = b.mark;
				if(dojo.isIE){
					if(dojo.isArray(mark)){//CONTROL
						dojo.forEach(mark,function(n){
							tmp.push(dijit.range.getIndex(n,this.editNode).o);
						},this);
						b.mark = tmp;
					}
				}else{//w3c range
					tmp=dijit.range.getIndex(mark.startContainer,this.editNode).o;
					b.mark ={startContainer:tmp,
						startOffset:mark.startOffset,
						endContainer:mark.endContainer === mark.startContainer?tmp:dijit.range.getIndex(mark.endContainer,this.editNode).o,
						endOffset:mark.endOffset};
				}
			}
			return b;
		},
		_beginEditing: function(cmd){
			// summary:
			//		Called when the user starts typing alphanumeric characters.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private
			if(this._steps.length === 0){
				this._steps.push({'text':this.savedContent,'bookmark':this._getBookmark()});
			}
		},
		_endEditing: function(ignore_caret){
			// summary:
			//		Called when the user stops typing alphanumeric characters.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private
			var v=this.getValue(true);

			this._undoedSteps=[];//clear undoed steps
			this._steps.push({text: v, bookmark: this._getBookmark()});
		},
		onKeyDown: function(e){
			// summary:
			//		Handler for onkeydown event.
			// tags:
			//		private

			//We need to save selection if the user TAB away from this editor
			//no need to call _saveSelection for IE, as that will be taken care of in onBeforeDeactivate
			if(!dojo.isIE && !this.iframe && e.keyCode == dojo.keys.TAB && !this.tabIndent){
				this._saveSelection();
			}
			if(!this.customUndo){
				this.inherited(arguments);
				return;
			}
			var k = e.keyCode, ks = dojo.keys;
			if(e.ctrlKey && !e.altKey){//undo and redo only if the special right Alt + z/y are not pressed #5892
				if(k == 90 || k == 122){ //z
					dojo.stopEvent(e);
					this.undo();
					return;
				}else if(k == 89 || k == 121){ //y
					dojo.stopEvent(e);
					this.redo();
					return;
				}
			}
			this.inherited(arguments);

			switch(k){
					case ks.ENTER:
					case ks.BACKSPACE:
					case ks.DELETE:
						this.beginEditing();
						break;
					case 88: //x
					case 86: //v
						if(e.ctrlKey && !e.altKey && !e.metaKey){
							this.endEditing();//end current typing step if any
							if(e.keyCode == 88){
								this.beginEditing('cut');
								//use timeout to trigger after the cut is complete
								setTimeout(dojo.hitch(this, this.endEditing), 1);
							}else{
								this.beginEditing('paste');
								//use timeout to trigger after the paste is complete
								setTimeout(dojo.hitch(this, this.endEditing), 1);
							}
							break;
						}
						//pass through
					default:
						if(!e.ctrlKey && !e.altKey && !e.metaKey && (e.keyCode<dojo.keys.F1 || e.keyCode>dojo.keys.F15)){
							this.beginEditing();
							break;
						}
						//pass through
					case ks.ALT:
						this.endEditing();
						break;
					case ks.UP_ARROW:
					case ks.DOWN_ARROW:
					case ks.LEFT_ARROW:
					case ks.RIGHT_ARROW:
					case ks.HOME:
					case ks.END:
					case ks.PAGE_UP:
					case ks.PAGE_DOWN:
						this.endEditing(true);
						break;
					//maybe ctrl+backspace/delete, so don't endEditing when ctrl is pressed
					case ks.CTRL:
					case ks.SHIFT:
					case ks.TAB:
						break;
				}
		},
		_onBlur: function(){
			// summary:
			//		Called from focus manager when focus has moved away from this editor
			// tags:
			//		protected

			//this._saveSelection();
			this.inherited('_onBlur',arguments);
			this.endEditing(true);
		},
		_saveSelection: function(){
			// summary:
			//		Save the currently selected text in _savedSelection attribute
			// tags:
			//		private
			this._savedSelection=this._getBookmark();
			//console.log('save selection',this._savedSelection,this);
		},
		_restoreSelection: function(){
			// summary:
			//		Re-select the text specified in _savedSelection attribute;
			//		see _saveSelection().
			// tags:
			//		private
			if(this._savedSelection){
				// only restore the selection if the current range is collapsed
				// if not collapsed, then it means the editor does not lose
				// selection and there is no need to restore it
				if(dojo.withGlobal(this.window,'isCollapsed',dijit)){
					this._moveToBookmark(this._savedSelection);
				}
				delete this._savedSelection;
			}
		},

		onClick: function(){
			// summary:
			//		Handler for when editor is clicked
			// tags:
			//		protected
			this.endEditing(true);
			this.inherited(arguments);
		}
		/* end of custom undo/redo support */
	}
);

// Register the "default plugins", ie, the built-in editor commands
dojo.subscribe(dijit._scopeName + ".Editor.getPlugin",null,function(o){
	if(o.plugin){ return; }
	var args = o.args, p;
	var _p = dijit._editor._Plugin;
	var name = args.name;
	switch(name){
		case "undo": case "redo": case "cut": case "copy": case "paste": case "insertOrderedList":
		case "insertUnorderedList": case "indent": case "outdent": case "justifyCenter":
		case "justifyFull": case "justifyLeft": case "justifyRight": case "delete":
		case "selectAll": case "removeFormat": case "unlink":
		case "insertHorizontalRule":
			p = new _p({ command: name });
			break;

		case "bold": case "italic": case "underline": case "strikethrough":
		case "subscript": case "superscript":
			p = new _p({ buttonClass: dijit.form.ToggleButton, command: name });
			break;
		case "|":
			p = new _p({ button: new dijit.ToolbarSeparator() });
	}
//	console.log('name',name,p);
	o.plugin=p;
});
