dojo.provide("dojo.widget.Editor2Plugin.AlwaysShowToolbar");

//dojo.widget.Editor2Manager.registerPerInstancePlugin("dojo.widget.Editor2Plugin.AlwaysShowToolbar");

dojo.event.topic.subscribe("dojo.widget.Editor2::onLoad", function(editor){
	if(editor.toolbarAlwaysVisible){
		var p = new dojo.widget.Editor2Plugin.AlwaysShowToolbar(editor);
	}
});
dojo.declare("dojo.widget.Editor2Plugin.AlwaysShowToolbar", null,
	function(editor){
		this.editor = editor;
		this.editor.registerLoadedPlugin(this);
		dojo.event.connect(this.editor, "destroy", this, "destroy");
		this.setup();
	},
	{
	_scrollSetUp: false,
	_fixEnabled: false,
	_scrollThreshold: false,
	_handleScroll: true,

	setup: function(){
		var tdn = this.editor.toolbarWidget;
		if(!tdn.tbBgIframe){
			tdn.tbBgIframe = new dojo.html.BackgroundIframe(tdn.domNode);
			tdn.tbBgIframe.onResized();
		}
		this.scrollInterval = setInterval(dojo.lang.hitch(this, "globalOnScrollHandler"), 100);
	},

	globalOnScrollHandler: function(){
		var isIE = dojo.render.html.ie;
		if(!this._handleScroll){ return; }
		var dh = dojo.html;
		var tdn = this.editor.toolbarWidget.domNode;
		var db = dojo.body();
		var totalHeight = dh.getMarginBox(tdn).height;
		if(!this._scrollSetUp){
			this._scrollSetUp = true;
			var editorWidth =  dh.getMarginBox(this.editor.domNode).width; 
			this._scrollThreshold = dh.abs(tdn, true).y;
			// dojo.debug("threshold:", this._scrollThreshold);
			if((isIE)&&(db)&&(dh.getStyle(db, "background-image")=="none")){
				with(db.style){
					backgroundImage = "url(" + dojo.uri.dojoUri("src/widget/templates/images/blank.gif") + ")";
					backgroundAttachment = "fixed";
				}
			}
		}

		var scrollPos = (window["pageYOffset"]) ? window["pageYOffset"] : (document["documentElement"]||document["body"]).scrollTop;

		// FIXME: need to have top and bottom thresholds so toolbar doesn't keep scrolling past the bottom
		if(scrollPos > this._scrollThreshold){
			// dojo.debug(scrollPos);
			if(!this._fixEnabled){
				this.editor.domNode.style.marginTop = totalHeight+"px";
				//remember the size of the toolbar, otherwise it may shrink or expend when floating
				var tdnbox = dojo.html.getMarginBox(tdn);
				if(isIE){
					// FIXME: should we just use setBehvior() here instead?
					tdn.style.left = dojo.html.abs(tdn, dojo.html.boxSizing.MARGIN_BOX).x;

					if(!this.editor.toolbarWidget.spaceTaker){
						this.editor.toolbarWidget.spaceTaker = dojo.doc().createElement('div');
						var spaceTaker = this.editor.toolbarWidget.spaceTaker;
						with(this.editor.toolbarWidget.spaceTaker.style){
							width = tdnbox.width;
							height = tdnbox.height;
						}
						spaceTaker.style.display = "none";
						dojo.html.insertBefore(spaceTaker, tdn);
					}
					dojo.body().appendChild(tdn);

					dojo.html.addClass(tdn, "IEFixedToolbar");
//					if(this.object){
//						dojo.html.addClass(tdn.tbBgIframe, "IEFixedToolbar");
//					}
				}else{
					with(tdn.style){
						position = "fixed";
						top = "0px";
					}
				}
				tdn.style.width = tdnbox.width + "px";
				tdn.style.zIndex = 1000;
				this._fixEnabled = true;
			}
			// if we're showing the floating toolbar, make sure that if
			// we've scrolled past the bottom of the editor that we hide
			// the toolbar for this instance of the editor.

			// TODO: when we get multiple editor toolbar support working
			// correctly, ensure that we check this against the scroll
			// position of the bottom-most editor instance.
			if(!dojo.render.html.safari){
				// safari reports a bunch of things incorrectly here
				var eHeight = (this.height) ? parseInt(this.editor.height) : ((this.editor.object) ? dojo.html.getBorderBox(this.editor.editNode).height : this.editor._lastHeight);
				if(scrollPos > (this._scrollThreshold+eHeight)){
					tdn.style.display = "none";
				}else{
					tdn.style.display = "";
				}
			}
		}else if(this._fixEnabled){
			this.editor.domNode.style.marginTop = null;
			with(tdn.style){
				position = "";
				top = "";
				zIndex = "";
			}
			if(isIE){
				tdn.style.left = "";
				dojo.html.removeClass(tdn, "IEFixedToolbar");
				dojo.html.insertBefore(tdn, this.editor._htmlEditNode||this.editor.domNode);
			}
			tdn.style.width = "";
			this._fixEnabled = false;
		}
	},

	destroy: function(){
		this._handleScroll = false;
		clearInterval(this.scrollInterval);
		this.editor.unregisterLoadedPlugin(this);
		// var src = document["documentElement"]||window;
		// dojo.event.disconnect(src, "onscroll", this, "globalOnScrollHandler");
		if(dojo.render.html.ie){
			dojo.html.removeClass(this.editor.toolbarWidget.domNode, "IEFixedToolbar");
		}
	}
});