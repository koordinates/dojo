/* TODO:
 * - font selector
 * - test, bug fix, more features :)
*/
dojo.provide("dojo.widget.Editor2");
dojo.require("dojo.io.*");
dojo.require("dojo.html.*");
dojo.require("dojo.html.layout");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.RichText");
dojo.require("dojo.widget.Editor2Toolbar");

// dojo.require("dojo.widget.ColorPalette");
// dojo.require("dojo.string.extras");

//API to manage current focused Editor2 Instance
dojo.widget.Editor2Manager = {
	//private variables
	_currentInstance: null,
	_loadedCommands: {},

	destroy: function(){
		this._currentInstance = null;
		for(var cmd in this._loadedCommands){
			this._loadedCommands[cmd].destory();
		}
	},

	commandState: {Disabled: 0, Latched: 1, Enabled: 2},
	//Public API
	getCurrentInstance: function(){
		return this._currentInstance;
	},
	setCurrentInstance: function(inst){
		this._currentInstance = inst;
	},
	registerCommand: function(name, cmd){
		name = name.toLowerCase();
		if(this._loadedCommands[name]){
			delete this._loadedCommands[name];
		}
		this._loadedCommands[name] = cmd;
	},
	getCommand: function(name){
		name = name.toLowerCase();
		var oCommand = this._loadedCommands[name];
		if(oCommand){
			return oCommand;
		}

		switch(name){
			case 'htmltoggle':
				//Editor2 natively provide the htmltoggle functionalitity
				//and it is treated as a builtin command 
				oCommand = new dojo.widget.Editor2BrowserCommand(name);
				break;
			case 'formatblock':
				oCommand = new dojo.widget.Editor2FormatBlockCommand(name);
				break;
			case 'anchor':
				oCommand = new dojo.widget.Editor2Command(name);
				break;

			//dialog command
			case 'createlink':
				oCommand = new dojo.widget.Editor2DialogCommand(name, 
						{href: dojo.uri.dojoUri("src/widget/templates/Editor2/Dialog/createlink.html"), 
							title: "Insert/Edit Link", width: "300px", height: "200px"});
				break;
			case 'insertimage':
				oCommand = new dojo.widget.Editor2DialogCommand(name, 
						{href: dojo.uri.dojoUri("src/widget/templates/Editor2/Dialog/insertimage.html"), 
							title: "Insert/Edit Image", width: "400px", height: "270px"});
				break;
			// By default we assume that it is a builtin simple command.
			default:
				var curtInst = this.getCurrentInstance();
				if((curtInst && curtInst.queryCommandAvailable(name)) ||
					(!curtInst && dojo.widget.Editor2.prototype.queryCommandAvailable(name))){
					oCommand = new dojo.widget.Editor2BrowserCommand(name);
				}else{
					dojo.debug("dojo.widget.Editor2Manager.getCommand: Unknown command "+name);
					return;
				}
		}
		this._loadedCommands[name] = oCommand;
		return oCommand;
	}//,
//	registerPerInstancePlugin: function(name){
//		if(!this._perInstancePlugins){ this._perInstancePlugins = []; }
//		this._perInstancePlugins.push(name);
//	},
//	getPlugin: function(pluginname, editor){
//		dojo.require(pluginname);
//		if(dojo.lang.find(this._perInstancePlugins, pluginname) != -1){
//			var plugin = dojo.evalObjPath(pluginname);
//			return new plugin(editor);
//		}
//		return null;
//	}
};

dojo.addOnUnload(dojo.widget.Editor2Manager, "destroy");

/* base class for all command in Editor2 */
dojo.lang.declare("dojo.widget.Editor2Command",null,{
		initializer: function(name){
			this._name = name;
		},
		//this function should be re-implemented in subclass
		execute: function(para){
			alert("Please implement your own execute() function for subclass of Editor2Command.");
		},
		//default implemetation always returns Enabled
		getState: function(){
			return dojo.widget.Editor2Manager.commandState.Enabled;
		},
		destory: function(){}
	}
);

dojo.lang.declare("dojo.widget.Editor2BrowserCommand", dojo.widget.Editor2Command, {
		execute: function(para){
			var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
			if(curInst){
				dojo.debug("execute "+this._name);
				curInst.execCommand(this._name, para);
			}
		},
		getState: function(){
			var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
			if(curInst){
				try{
					if(curInst.queryCommandEnabled(this._name)){
						if(curInst.queryCommandState(this._name)){
							return dojo.widget.Editor2Manager.commandState.Latched;
						}else{
							return dojo.widget.Editor2Manager.commandState.Enabled;
						}
					}else{
						return dojo.widget.Editor2Manager.commandState.Disabled;
					}
				}catch (e) {
					//dojo.debug("exception when getting state for command "+this._name+": "+e);
					return dojo.widget.Editor2Manager.commandState.Enabled;
				}
			}
			return dojo.widget.Editor2Manager.commandState.Disabled;
		},
		getValue: function(){
			var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
			if(curInst){
				try{
					return curInst.queryCommandValue(this._name);
				}catch(e){}
			}
		}
	}
);

dojo.lang.declare("dojo.widget.Editor2FormatBlockCommand", dojo.widget.Editor2BrowserCommand, {
		/* In none-ActiveX mode under IE, <p> and no <p> text can not be distinguished
		getCurrentValue: function(){
			var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
			if(!curInst){ return ''; }

			var h = dojo.render.html;
			
			// safari f's us for selection primitives
			if(h.safari){ return ''; }

			var selectedNode = (h.ie) ? curInst.document.selection.createRange().parentElement() : curInst.window.getSelection().anchorNode;
			// make sure we actuall have an element
			while((selectedNode)&&(selectedNode.nodeType != 1)){
				selectedNode = selectedNode.parentNode;
			}
			if(!selectedNode){ return ''; }

			var formats = ["p", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "address"];
			// gotta run some specialized updates for the various
			// formatting options
			var type = formats[dojo.lang.find(formats, selectedNode.nodeName.toLowerCase())];
			while((selectedNode!=curInst.editNode)&&(!type)){
				selectedNode = selectedNode.parentNode;
				if(!selectedNode){ break; }
				type = formats[dojo.lang.find(formats, selectedNode.nodeName.toLowerCase())];
			}
			if(!type){
				type = "";
			}
			return type;
		}*/
	}
);

dojo.require("dojo.widget.FloatingPane");
dojo.widget.defineWidget(
	"dojo.widget.Editor2Dialog",
	[dojo.widget.FloatingPane, dojo.widget.ModalDialogBase],
	{
		modal: true,
		templatePath: dojo.uri.dojoUri("src/widget/templates/Editor2/EditorDialog.html"),
		executeScripts: true,
		refreshOnShow: true, //for debug for now

		width: false,
		height: false,

		windowState: "minimized",
		displayCloseAction: true,

		postCreate: function(){
			if(this.modal){
				dojo.widget.ModalDialogBase.prototype.postCreate.call(this);
			}else{
				with(this.domNode.style) {
					zIndex = 999;
					display = "none";
				}
//				dojo.body().appendChild(this.domNode);
			}
			dojo.widget.Editor2Dialog.superclass.postCreate.call(this);
			if(this.width && this.height){
				with(this.domNode.style){
					width = this.width;
					height = this.height;
				}
			}
		},
		show: function(){
			dojo.widget.Editor2Dialog.superclass.show.apply(this, arguments);
			if(this.modal){
				dojo.widget.ModalDialogBase.prototype.show.call(this);
			}
			this.placeModalDialog();
			if(this.modal){
				//place the background div under this modal pane
				this.shared.bg.style.zIndex = this.domNode.style.zIndex-1;
			}
		},
		closeWindow: function(){
			this.hide();
			dojo.widget.Editor2Dialog.superclass.closeWindow.apply(this, arguments);
		},
		hide: function(){
			if(this.modal){
				dojo.widget.ModalDialogBase.prototype.hide.call(this);
			}else{
				dojo.widget.Editor2Dialog.superclass.hide.call(this);
			}
		}
	}
);

dojo.lang.declare("dojo.widget.Editor2DialogCommand", dojo.widget.Editor2BrowserCommand, 
	function(name, dialogParas){
		this.dialogParas = dialogParas;
	},
{
	execute: function(){
		if(!this.dialog){
			if(!this.dialogParas.href){
				alert("Href should be set for dojo.widget.Editor2DialogCommand.dialogParas!");
				return;
			}
			this.dialog = dojo.widget.createWidget("Editor2Dialog", this.dialogParas);

			dojo.body().appendChild(this.dialog.domNode);

			dojo.event.connect(this, "destroy", this.dialog, "destroy");
		}
		this.dialog.show();
	}
});

//uncomment these plugins to enable them
//dojo.require("dojo.widget.Editor2Plugin.FindReplace");

//ContextMenu plugin should come before all other plugins which support
//contextmenu, otherwise the menu for that plugin won't be shown
dojo.require("dojo.widget.Editor2Plugin.ContextMenu");
//dojo.require("dojo.widget.Editor2Plugin.TableOperation");
//dojo.require("dojo.widget.Editor2Plugin.ToolbarDndSupport");

dojo.widget.defineWidget(
	"dojo.widget.Editor2",
	dojo.widget.RichText,
	{
		saveUrl: "",
		saveMethod: "post",
		saveArgName: "editorContent",
		closeOnSave: false,
		shareToolbar: false,
		toolbarAlwaysVisible: false,
		htmlEditing: false,
		_inSourceMode: false,
		_htmlEditNode: null,

		toolbarWidget: null,
		scrollInterval: null,
		toolbarTemplatePath: "src/widget/templates/EditorToolbarOneline.html",
//		toolbarTemplatePath: "src/widget/templates/Editor2/EditorToolbarFCKStyle.html",
//		toolbarTemplateCssPath: "src/widget/templates/Editor2/FCKDefault/EditorToolbarFCKStyle.css",

		plugins: "",

		editorOnLoad: function(){
			dojo.profile.start("dojo.widget.Editor2::editorOnLoad");

			dojo.event.topic.publish("dojo.widget.Editor2::preLoadingToolbar", this);
			if(this.toolbarAlwaysVisible){
				dojo.require("dojo.widget.Editor2Plugin.AlwaysShowToolbar");
			}

			var toolbars = dojo.widget.byType("Editor2Toolbar");
			if((!toolbars.length)||(!this.shareToolbar)){
				var tbOpts = {};
				this.toolbarTemplatePath = this.toolbarTemplatePath || "src/widget/templates/EditorToolbarOneline.html";
				tbOpts.templatePath = dojo.uri.dojoUri(this.toolbarTemplatePath);
				if(this.toolbarTemplateCssPath){
					tbOpts.templateCssPath = this.toolbarTemplateCssPath;
				}
				if(this.toolbarWidget){
					this.toolbarWidget.show();
				}else{
					this.toolbarWidget = dojo.widget.createWidget("Editor2Toolbar", 
											tbOpts, this.domNode, "before");
					dojo.event.connect(this, "close", this.toolbarWidget, "hide");
					dojo.event.connect(this, "destroy", this.toolbarWidget, "destroy");
				}

				this.toolbarLoaded();
			}else{
				// FIXME: 	selecting in one shared toolbar doesn't clobber
				// 			selection in the others. This is problematic.
				this.toolbarWidget = toolbars[0];
			}

			dojo.event.topic.registerPublisher("Editor2.clobberFocus", this, "clobberFocus");
			dojo.event.topic.subscribe("Editor2.clobberFocus", this, "setBlur");

			dojo.event.topic.publish("dojo.widget.Editor2::onLoad", this);
			dojo.profile.end("dojo.widget.Editor2::editorOnLoad");
		},

		//event for plugins to use
		toolbarLoaded: function(){},

		registerLoadedPlugin: function(/*Object*/obj){
			if(!this.loadedPlugins){
				this.loadedPlugins = [];
			}
			this.loadedPlugins.push(obj);
		},
		unregisterLoadedPlugin: function(/*Object*/obj){
			for(var i in this.loadedPlugins){
				if(this.loadedPlugins[i] === obj){
					delete this.loadedPlugins[i];
					return;
				}
			}
			dojo.debug("dojo.widget.Editor2.unregisterLoadedPlugin: unknow plugin object: "+obj);
		},
		//override the default one to provide extra commands
		execCommand: function(command, argument){
			switch(command.toLowerCase()){
				case 'htmltoggle':
					this.toggleHtmlEditing();
					break;
				default:
					dojo.widget.Editor2.superclass.execCommand.call(this, command, argument);
			}
		},
		queryCommandEnabled: function(command, argument){
			switch(command.toLowerCase()){
				case 'htmltoggle':
					return true;
				default:
					if(this._inSourceMode){ return false;}
					return dojo.widget.Editor2.superclass.queryCommandEnabled.call(this, command, argument);
			}
		},
		queryCommandState: function(command, argument){
			switch(command.toLowerCase()){
				case 'htmltoggle':
					return this._inSourceMode;
				default:
					return dojo.widget.Editor2.superclass.queryCommandState.call(this, command, argument);
			}
		},

		onClick: function(e){
			dojo.widget.Editor2.superclass.onClick.call(this, e);
			//if Popup is used, call dojo.widget.PopupManager.onClick
			//manually when click in the editing area to close all
			//open popups (dropdowns) 
			if(dojo.widget.PopupManager){
				if(!e){ //IE
					e = this.window.event;
				}
				dojo.widget.PopupManager.onClick(e);
			}
		},

		clobberFocus: function(){},
		save: function(){ dojo.debug("Editor2.save"); },
		insertImage: function(){ dojo.debug("Editor2.insertImage"); },
		toggleHtmlEditing: function(){
			if(this===dojo.widget.Editor2Manager.getCurrentInstance()){
				if(!this._inSourceMode){
					this._inSourceMode = true;

					if(!this._htmlEditNode){
						this._htmlEditNode = dojo.doc().createElement("textarea");
						dojo.html.insertBefore(this._htmlEditNode, this.domNode);
					}
					this._htmlEditNode.style.display = "";
					this._htmlEditNode.style.width = "100%";
					this._htmlEditNode.style.height = dojo.html.getBorderBox(this.editNode).height+"px";
					this._htmlEditNode.value = this.editNode.innerHTML;

					with(this.domNode.style){
						if(this.object){
							//activeX object doesn't like to be hidden, so move it outside of screen instead
							position = "absolute";
							left = "-2000px";
							top = "-2000px";
						}else{
							display = "none";
						}
					}
				}else{
					this._inSourceMode = false;

					//In IE activeX mode, if _htmlEditNode is focused,
					//when toggling, an error would occur, so unfocus it
					this._htmlEditNode.blur();

					with(this.domNode.style){
						if(this.object){
							position = "";
							left = "";
							top = "";
						}else{
							display = "";
						}
					}

					dojo.lang.setTimeout(this, "replaceEditorContent", 1, this._htmlEditNode.value);
					this._htmlEditNode.style.display = "none";
					this.focus();
				}
				this.updateToolbar(true);
			}
		},

		setFocus: function(){
			dojo.debug("setFocus: start "+this.widgetId);
			if(dojo.widget.Editor2Manager.getCurrentInstance() === this){ return; }

			this.clobberFocus();
			 dojo.debug("setFocus:", this);
			dojo.widget.Editor2Manager.setCurrentInstance(this);
		},

		setBlur: function(){
			 dojo.debug("setBlur:", this);
			//dojo.event.disconnect(this.toolbarWidget, "exec", this, "execCommand");
		},

		_updateToolbarLastRan: null,
		_updateToolbarTimer: null,
		_updateToolbarFrequency: 500,

		updateToolbar: function(force){
			if((!this.isLoaded)||(!this.toolbarWidget)){ return; }

			// keeps the toolbar from updating too frequently
			// TODO: generalize this functionality?
			var diff = new Date() - this._updateToolbarLastRan;
			if( (!force)&&(this._updateToolbarLastRan)&&
				((diff < this._updateToolbarFrequency)) ){

				clearTimeout(this._updateToolbarTimer);
				var _this = this;
				this._updateToolbarTimer = setTimeout(function() {
					_this.updateToolbar();
				}, this._updateToolbarFrequency/2);
				return;

			}else{
				this._updateToolbarLastRan = new Date();
			}
			// end frequency checker

			//TODO
			//if((cmd == "inserthtml") || (cmd == "save")){ return; }

			//IE has the habit of generating events even when this editor is blurred, prevent this
			if(dojo.widget.Editor2Manager.getCurrentInstance() !== this){ return; }

			this.toolbarWidget.update();
		},

		destroy: function(){
			//clean all loaded plugins
			for(var index in this.loadedPlugins){
				this.loadedPlugins[index].destroy();
				delete this.loadedPlugins[index];
			}
			this._htmlEditNode = null;
			this.document = null;
			this.window = null;
			this.object = null;
			dojo.widget.Editor2.superclass.destroy.call(this);
		},

		onDisplayChanged: function(e){
			dojo.widget.Editor2.superclass.onDisplayChanged.call(this,e);
			this.updateToolbar();
		},

		onLoad: function(){
			try{
				dojo.widget.Editor2.superclass.onLoad.call(this);
			}catch(e){ // FIXME: debug why this is throwing errors in IE!
				dojo.debug(e);
			}
			this.editorOnLoad();
		},

		onFocus: function(){
			dojo.widget.Editor2.superclass.onFocus.call(this);
			this.setFocus();
		},

		_save: function(e){
			// FIXME: how should this behave when there's a larger form in play?
			if(!this.isClosed){
				dojo.debug("save attempt");
				if(this.saveUrl.length){
					var content = {};
					content[this.saveArgName] = this.getEditorContent();
					dojo.io.bind({
						method: this.saveMethod,
						url: this.saveUrl,
						content: content
					});
				}else{
					dojo.debug("please set a saveUrl for the editor");
				}
				if(this.closeOnSave){
					this.close(e.getName().toLowerCase() == "save");
				}
			}
		}
	},
	"html"
);
