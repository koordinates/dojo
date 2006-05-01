/* TODO:
 * - font selector
 * - test, bug fix, more features :)
*/
dojo.provide("dojo.widget.Editor2");
dojo.provide("dojo.widget.html.Editor2");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.RichText");
dojo.require("dojo.widget.Editor2Toolbar");
// dojo.require("dojo.widget.ColorPalette");
// dojo.require("dojo.string.extras");

dojo.widget.defineWidget(
	"dojo.widget.html.Editor2",
	dojo.widget.html.RichText,
	{
		saveUrl: "",
		saveMethod: "post",
		saveArgName: "editorContent",
		closeOnSave: false,
		shareToolbar: false,
		staticToolbar: false,

		commandList: dojo.widget.html.Editor2Toolbar.prototype.commandList,
		toolbarWidget: null,
		scrollInterval: null,
		

		editorOnLoad: function(){
			var toolbars = dojo.widget.byType("Editor2Toolbar");
			if((!toolbars.length)||(!this.shareToolbar)){
				var tbOpts = {};
				tbOpts.templatePath = dojo.uri.dojoUri("src/widget/templates/HtmlEditorToolbarOneline.html");
				this.toolbarWidget = dojo.widget.createWidget("Editor2Toolbar", 
										tbOpts, this.domNode, "before");
				dojo.event.connect(this, "destroy", this.toolbarWidget, "destroy");

				// need to set position fixed to wherever this thing has landed
				if(this.toolbarAlwaysVisible){
					var src = document["documentElement"]||window;
					this.scrollInterval = setInterval(dojo.lang.hitch(this, "globalOnScrollHandler"), 100);
					// dojo.event.connect(src, "onscroll", this, "globalOnScrollHandler");
					dojo.event.connect("before", this, "destroyRendering", this, "unhookScroller");
				}
			}else{
				// FIXME: 	should we try harder to explicitly manage focus in
				// 			order to prevent too many editors from all querying
				// 			for button status concurrently?
				this.toolbarWidget = toolbars[0];
			}
			dojo.event.topic.registerPublisher("Editor2.clobberFocus", this.editNode, "onfocus");
			// dojo.event.topic.registerPublisher("Editor2.clobberFocus", this.editNode, "onclick");
			dojo.event.topic.subscribe("Editor2.clobberFocus", this, "setBlur");
			dojo.event.connect(this.editNode, "onfocus", this, "setFocus");
		},

		setFocus: function(){
			dojo.debug("setFocus:", this);
			dojo.event.connect(this.toolbarWidget, "exec", this, "execCommand");
			// dojo.debug(et);
		},

		setBlur: function(){
			dojo.debug("setBlur:", this);
			dojo.event.disconnect(this.toolbarWidget, "exec", this, "execCommand");
		},

		_scrollSetUp: false,
		_fixedEnabled: false,
		_scrollThreshold: false,
		_handleScroll: true,
		globalOnScrollHandler: function(){
			var isIE = dojo.render.html.ie;
			if(!this._handleScroll){ return; }
			var ds = dojo.style;
			var tdn = this.toolbarWidget.domNode;
			var db = document["documentElement"]||document["body"];
			var totalHeight = ds.getOuterHeight(tdn);
			if(!this._scrollSetUp){
				this._scrollSetUp = true;
				var editorWidth =  ds.getOuterWidth(this.domNode); 
				this._scrollThreshold = ds.abs(tdn, false).y;
				// dojo.debug("threshold:", this._scrollThreshold);
				if((isIE)&&(ds.getStyle(db, "background-image")=="none")){
					// set background-image and background-attachment
					// if background-image is not already in use, to take
					// advantage of an IE quirk to enable smooth scrolling
					// of pseudo-position-fixed elements like this one
					with(db.style){
						/*
						backgroundImage = "url(" + dojo.uri.dojoUri("src/widget/templates/images/blank.gif") + ")";
						backgroundAttachment = "fixed";
						*/
					}
				}
			}

			var scrollPos = (window["pageYOffset"]) ? window["pageYOffset"] : (document["documentElement"]||document["body"]).scrollTop;

			// FIXME: need to have top and bottom thresholds so toolbar doesn't keep scrolling past the bottom
			if(scrollPos > this._scrollThreshold){
				// dojo.debug(scrollPos);
				if(!this._fixEnabled){
					this.domNode.style.marginTop = totalHeight+"px";
					if(isIE){
						// FIXME: should we just use setBehvior() here instead?
						var cl = dojo.style.abs(tdn).x;
						document.body.appendChild(tdn);
						tdn.style.left = cl+dojo.style.getPixelValue(document.body, "margin-left")+"px";
						dojo.html.addClass(tdn, "IEFixedToolbar");
					}else{
						with(tdn.style){
							position = "fixed";
							top = "0px";
						}
					}
					tdn.style.zIndex = 1000;
					this._fixEnabled = true;
				}
			}else if(this._fixEnabled){
				this.domNode.style.marginTop = null;
				with(tdn.style){
					position = "";
					top = "";
					zIndex = "";
					if(isIE){
						marginTop = "";
					}
				}
				if(isIE){
					dojo.html.removeClass(tdn, "IEFixedToolbar");
					dojo.html.insertBefore(tdn, this.domNode);
				}
				this._fixEnabled = false;
			}
		},

		unhookScroller: function(){
			this._handleScroll = false;
			clearInterval(this.scrollInterval);
			// var src = document["documentElement"]||window;
			// dojo.event.disconnect(src, "onscroll", this, "globalOnScrollHandler");
			if(dojo.render.html.ie){
				dojo.html.removeClass(this.toolbarWidget.domNode, "IEFixedToolbar");
			}
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

			dojo.lang.forEach(this.commandList, function(cmd){
					if(cmd == "inserthtml"){ return; }
					try{
						if(this.queryCommandEnabled(cmd)){
							if(this.queryCommandState(cmd)){
								this.toolbarWidget.highlightButton(cmd);
							}else{
								this.toolbarWidget.unhighlightButton(cmd);
							}
						}
					}catch(e){
						// alert(cmd+":"+e);
					}
				}, this);
		},

		updateItem: function(item) {
			try {
				var cmd = item._name;
				var enabled = this._richText.queryCommandEnabled(cmd);
				item.setEnabled(enabled, false, true);

				var active = this._richText.queryCommandState(cmd);
				if(active && cmd == "underline") {
					// don't activate underlining if we are on a link
					active = !this._richText.queryCommandEnabled("unlink");
				}
				item.setSelected(active, false, true);
				return true;
			} catch(err) {
				return false;
			}
		},


		_save: function(e){
			// FIXME: how should this behave when there's a larger form in play?
			if(!this.isClosed){
				if(this.saveUrl.length){
					var content = {};
					content[this.saveArgName] = this.getHtml();
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
		},

		wireUpOnLoad: function(){
			if(!dojo.render.html.ie){
				/*
				dojo.event.kwConnect({
					srcObj:		this.document,
					srcFunc:	"click", 
					targetObj:	this.toolbarWidget,
					targetFunc:	"hideAllDropDowns",
					once:		true
				});
				*/
			}
		}
	},
	"html",
	function(){
		dojo.event.connect(this, "fillInTemplate", this, "editorOnLoad");
		dojo.event.connect(this, "onDisplayChanged", this, "updateToolbar");
		dojo.event.connect(this, "onLoad", this, "wireUpOnLoad");
	}
);
