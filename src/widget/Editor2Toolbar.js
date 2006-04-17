dojo.provide("dojo.widget.Editor2Toolbar");
dojo.provide("dojo.widget.html.Editor2Toolbar");

dojo.require("dojo.lang.*");
dojo.require("dojo.widget.*");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.RichText");
dojo.require("dojo.widget.ColorPalette");

dojo.widget.defineWidget(
	"dojo.widget.html.Editor2Toolbar",
	dojo.widget.HtmlWidget,
	{
		commandList: [ "bold", "italic", "underline", "subscript", "superscript",
			"fontname", "fontsize", "forecolor", "hilitecolor", "justifycenter",
			"justifyfull", "justifyleft", "justifyright", "cut", "copy", "paste",
			"delete", "undo", "redo", "createlink", "unlink", "removeformat",
			"inserthorizontalrule", "insertimage", "insertorderedlist",
			"insertunorderedlist", "indent", "outdent", "formatblock", "strikethrough", 
			"inserthtml", "blockdirltr", "blockdirrtl", "dirltr", "dirrtl",
			"inlinedirltr", "inlinedirrtl", "inserttable", "insertcell",
			"insertcol", "insertrow", "deletecells", "deletecols", "deleterows",
			"mergecells", "splitcell"
		],

		templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlEditorToolbar.html"),
		templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlEditorToolbar.css"),

		forecolorPalette: null,
		hilitecolorPalette: null,

		// DOM Nodes
		wikiwordButton: null,
		insertimageButton: null,
		styleDropdownButton: null,
		styleDropdownContainer: null,
		copyButton: null,
		boldButton: null,
		italicButton: null,
		underlineButton: null,
		justifyleftButton: null,
		justifyfullButton: null,
		justifyrightButton: null,
		pasteButton: null,
		undoButton: null,
		redoButton: null,
		linkButton: null,
		insertunorderedlistButton: null,
		insertorderedlistButton: null,
		forecolorButton: null,
		forecolorDropDown: null,
		hilitecolorButton: null,
		hilitecolorDropDown: null,
		formatSelectBox: null,
		inserthorizontalruleButton: null,
		strikethroughButton: null,

		buttonClick: function(e){ e.preventDefault(); /* dojo.debug("buttonClick"); */ },

		buttonMouseOver: function(e){  },
		buttonMouseOut: function(e){  },

		// event signals
		wikiwordClick: function(){ },
		insertimageClick: function(){ },

		styleDropdownClick: function(){
			dojo.debug("styleDropdownClick:", this.styleDropdownContainer);
			dojo.style.toggleShowing(this.styleDropdownContainer);
		},

		copyClick: function(){ this.exec("copy"); },
		boldClick: function(){ this.exec("bold"); },
		italicClick: function(){ this.exec("italic"); },
		underlineClick: function(){ this.exec("underline"); },
		justifyleftClick: function(){ this.exec("justifyleft"); },
		justifyfullClick: function(){ this.exec("justifyfull"); },
		justifyrightClick: function(){ this.exec("justifyright"); },
		pasteClick: function(){ this.exec("paste"); },
		undoClick: function(){ this.exec("undo"); },
		redoClick: function(){ this.exec("redo"); },
		linkClick: function(){ 
			// FIXME: we need to alert the user if they haven't selected any text
			this.exec(	"createlink", 
						prompt("Please enter the URL of the link:", "http://"));
		},
		insertunorderedlistClick: function(){ this.exec("insertunorderedlist"); },
		insertorderedlistClick: function(){ this.exec("insertorderedlist"); },
		inserthorizontalruleClick: function(){ this.exec("inserthorizontalrule"); },
		strikethroughClick: function(){ this.exec("strikethrough"); },

		formatSelectClick: function(){ 
			var sv = this.formatSelectBox.value.toLowerCase();
			this.exec("formatblock", sv);
		},

		normalTextClick: function(){ this.exec("formatblock", "p"); },
		h1TextClick: function(){ this.exec("formatblock", "h1"); },
		h2TextClick: function(){ this.exec("formatblock", "h2"); },
		h3TextClick: function(){ this.exec("formatblock", "h3"); },
		h4TextClick: function(){ this.exec("formatblock", "h4"); },
		indentClick: function(){ this.exec("indent"); },
		outdentClick: function(){ this.exec("outdent"); },


		hideAllDropDowns: function(){
			this.domNode.style.height = "";
			dojo.lang.forEach(dojo.widget.byType("Editor2Toolbar"), function(tb){
				try{
					dojo.style.hide(tb.forecolorDropDown);
					dojo.style.hide(tb.hilitecolorDropDown);
					dojo.style.hide(tb.styleDropdownContainer);
				}catch(e){}
			});
		},

		// FIXME: these methods aren't currently dealing with clicking in the
		// general document to hide the menu
		forecolorClick: function(e){
			// FIXME: if we've been "popped out", we need to set the height of the toolbar.
			e.stopPropagation();
			dojo.style.toggleShowing(this.forecolorDropDown);
			if(!this.forecolorPalette){
				this.forecolorPalette = dojo.widget.createWidget("ColorPalette", {}, this.forecolorDropDown, "first");
				var fcp = this.forecolorPalette.domNode;
				with(this.forecolorDropDown.style){
					width = dojo.html.getOuterWidth(fcp) + "px";
					height = dojo.html.getOuterHeight(fcp) + "px";
					zIndex = 1002;
				}

				dojo.event.connect(	"after",
									this.forecolorPalette, "onColorSelect",
									this, "exec",
									function(mi){
										mi.args.unshift("forecolor");
										return mi.proceed();
									}
				);
				dojo.event.connect(	"after",
									this.forecolorPalette, "onColorSelect",
									dojo.style, "toggleShowing",
									this, function(mi){
										mi.args.unshift(this.forecolorDropDown);
										return mi.proceed();
									}
				);

				dojo.event.kwConnect({
					srcObj:		document.body, 
					srcFunc:	"onclick", 
					targetObj:	this,
					targetFunc:	"hideAllDropDowns",
					once:		true
				});
			}
		},

		hilitecolorClick: function(e){
			e.stopPropagation();
			var h = dojo.html;
			dojo.style.toggleShowing(this.hilitecolorDropDown);
			if(!this.hilitecolorPalette){
				this.hilitecolorPalette = dojo.widget.createWidget("ColorPalette", {}, this.hilitecolorDropDown, "first");
				var hcp = this.hilitecolorPalette.domNode;
				with(this.hilitecolorDropDown.style){
					width = h.getOuterWidth(hcp) + "px";
					height = h.getOuterHeight(hcp) + "px";
					zIndex = 1002;
				}

				if(dojo.render.html.ie){
					this.domNode.style.height = h.getOuterHeight(hcp)+h.getOuterHeight(this.domNode)+"px";
				}

				dojo.event.connect(	"after",
									this.hilitecolorPalette, "onColorSelect",
									this, "exec",
									function(mi){
										mi.args.unshift("hilitecolor");
										return mi.proceed();
									}
				);
				dojo.event.connect(	"after",
									this.hilitecolorPalette, "onColorSelect",
									dojo.style, "toggleShowing",
									this, function(mi){
										mi.args.unshift(this.hilitecolorDropDown);
										return mi.proceed();
									}
				);

				dojo.event.kwConnect({
					srcObj:		document.body, 
					srcFunc:	"onclick", 
					targetObj:	this,
					targetFunc:	"hideAllDropDowns",
					once:		true
				});
			}
		},

		// stub for observers
		exec: function(what, arg){ /* dojo.debug(what, new Date()); */ },

		hideUnusableButtons: function(){
			dojo.lang.forEach(this.commandList,
				function(cmd){
					if(this[cmd+"Button"]){
						var cb = this[cmd+"Button"];
						if(!dojo.widget.html.RichText.prototype.queryCommandAvailable(cmd)){
							cb.style.display = "none";
						}
					}
				},
				this);
		},

		highlightButton: function(name){
			var bn = name+"Button";
			if(this[bn]){
				with(this[bn].style){
					backgroundColor = "White";
					border = "1px solid #aeaeab";
				}
			}
		},

		unhighlightButton: function(name){
			var bn = name+"Button";
			if(this[bn]){
				// dojo.debug("unhighlighting:", name);
				with(this[bn].style){
					backgroundColor = "";
					border = "";
				}
			}
		}
	},
	"html",
	function(){
		dojo.event.connect(this, "fillInTemplate", this, "hideUnusableButtons");
	}
);
