dojo.provide("dijit.layout.Dialog");

dojo.require("dojo.dnd.move");

dojo.require("dijit.util.place");
dojo.require("dijit.util.sniff");
dojo.require("dijit.util.popup");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.base.TemplatedWidget");

dojo.declare(
	"dijit.layout.DialogUnderlay",
	[dijit.base.Widget, dijit.base.TemplatedWidget, dijit.base.Layout],
	{
		// summary: the thing that grays out the screen behind the dialog
		
		// Template has two divs; outer div is used for fade-in/fade-out, and also to hold background iframe.
		// Inner div has opacity specified in CSS file.
		templateString: "<div class=dijitDialogUnderlayWrapper><div class=dijitDialogUnderlay dojoAttachPoint='node'></div></div>",
		
		postCreate: function(){
			var b = dojo.body();
			b.appendChild(this.domNode);
			this.bgIframe = new dijit.util.BackgroundIframe(this.domNode);
		},

		layout: function(){
			// summary
			//		Sets the background to the size of the viewport (rather than the size
			//		of the document) since we need to cover the whole browser window, even
			//		if the document is only a few lines long.

			var viewport = dijit.util.getViewport(),
				h = viewport.h,
				w = viewport.w;

			var scroll_offset = dijit.util.getScroll().offset;
			with(this.domNode.style){
				top = scroll_offset.y + "px";
				left = scroll_offset.x + "px";
			}

			var style = this.node.style;
			style.width = w + "px";
			style.height = h + "px";
			
			// process twice since the scroll bar may have been removed
			// by the previous resizing
			viewport = dijit.util.getViewport();
			if(viewport.w != w){ style.width = viewport.w + "px"; }
			if(viewport.h != h){ style.height = viewport.h + "px"; }
		},

		show: function(){
			console.debug("_showBackground");
			this.domNode.style.display = "block";
			this.layout();
			if(this.bgIframe.iframe){
				this.bgIframe.iframe.style.display = "block";
			}
		},

		hide: function(){
			this.domNode.style.display = "none";
			this.domNode.style.width = this.domNode.style.height = "1px";
			if(this.bgIframe.iframe){
				this.bgIframe.iframe.style.display = "none";
			}
		},

		uninitialize: function(){
			if(this.bgIframe){
				this.bgIframe.remove();
			}
		}
	}
);
	
dojo.declare(
	"dijit.layout.Dialog",
	[dijit.layout.ContentPane, dijit.base.TemplatedWidget],
	{
		// summary:
		//		Pops up a modal dialog window, blocking access to the screen
		//		and also graying out the screen Dialog is extended from
		//		ContentPane so it supports all the same parameters (href, etc.)

		templatePath: dojo.moduleUrl("dijit.layout", "templates/Dialog.html"),

		// title: String
		//		Title of the dialog
		title: "",

		// closeNode: String
		//	Id of button or other dom node to click to close this dialog
		closeNode: "",

		_duration: 400,

		startup: function(){
			var closeNode = dojo.byId(this.closeNode);
			this.connect(closeNode, "onclick", "hide");
		},

		onLoad: function(){
			// when href is specified we need to reposition
			// the dialog after the data is loaded
			this._center();
			dijit.layout.Dialog.superclass.onLoad.call(this);
		},

		_trapTabs: function(/*Event*/ e){
			// summary: callback on focus
			if(e.target == this.tabStartOuter){
				if(this._fromTrap){
					this.tabStart.focus();
					this._fromTrap = false;
				}else{
					this._fromTrap = true;
					this.tabEnd.focus();
				}
			}else if(e.target == this.tabStart){
				if(this._fromTrap){
					this._fromTrap = false;
				}else{
					this._fromTrap = true;
					this.tabEnd.focus();
				}
			}else if(e.target == this.tabEndOuter){
				if(this._fromTrap){
					this.tabEnd.focus();
					this._fromTrap = false;
				}else{
					this._fromTrap = true;
					this.tabStart.focus();
				}
			}else if(e.target == this.tabEnd){
				if(this._fromTrap){
					this._fromTrap = false;
				}else{
					this._fromTrap = true;
					this.tabStart.focus();
				}
			}
		},

		_clearTrap: function(/*Event*/ e){
			// summary: callback on blur
			setTimeout(dojo.hitch(this, function(){
				this._fromTrap = false;
			}), 100);
		},

		_setup: function(){
			// summary:
			//		stuff we need to do before showing the Dialog for the first
			//		time (but we defer it until right beforehand, for
			//		performance reasons)

			this._modalconnects = [];

			this._moveable = new dojo.dnd.Moveable(this.domNode, { handle: this.titleBar });

			this._underlay = new dijit.layout.DialogUnderlay();

			var node = this.domNode;
			this._fadeIn = dojo.fadeIn({
				node: node,
				duration: this._duration
			}).combine([
				dojo.fadeIn({
					node: this._underlay.domNode,
					duration: this._duration,
					onBegin: dojo.hitch(this._underlay, "show")
				})
			]);

			this._fadeOut = dojo.fadeOut({
				node: node,
				duration: this._duration,
				onEnd: function(){
					node.style.display="none";
				}
			}).combine([
				dojo.fadeOut({
					node: this._underlay.domNode,
					duration: this._duration,
					onEnd: dojo.hitch(this._underlay, "hide")
				})
			]);
		},

		uninitialize: function(){
			this._underlay.destroy();
		},

		_center: function(){
			// summary: position modal dialog in center of screen

			var scroll_offset = dijit.util.getScroll().offset;
			var viewport_size = dijit.util.getViewport();

			// find the size of the dialog (dialog needs to be showing to get the size)
			var mb = dojo.marginBox(this.domNode);
			var padborder = dojo._getPadBorderExtents(this.domNode);

			var x = scroll_offset.x + (viewport_size.w - mb.w)/2;
			var y = scroll_offset.y + (viewport_size.h - mb.h)/2;
			var maxheight = viewport_size.h - padborder.h;

			with(this.domNode.style){
				left = x + "px";
				top = y + "px";
			}
		},

		_onKey: function(/*Event*/ evt){
			if(evt.keyCode){
				// see if the key is for the dialog
				var node = evt.target;
				while (node != null){
					if(node == this.domNode){
						return; // yes, so just let it go
					}
					node = node.parentNode;
				}
				// this key is for the disabled document window
				if (evt.keyCode != evt.KEY_TAB){ // allow tabbing into the dialog for a11y
					dojo.stopEvent(evt);
				// opera won't tab to a div
				}else if (!dojo.isOpera){
					try{
						this.tabStart.focus();
					}catch(e){}
				}
			}
		},

		show: function(){
			// summary: display the dialog

			// first time we show the dialog, there's some initialization stuff to do			
			if(!this._alreadyInitialized){
				this._setup();
				this._alreadyInitialized=true;
			}

			if(this._fadeOut.status() == "playing"){
				this._fadeOut.stop();
			}

			this._modalconnects.push(dojo.connect(window, "onscroll", this, "layout"));
			this._modalconnects.push(dojo.connect(document.documentElement, "onkeypress", this, "_onKey"));

			dojo.style(this.domNode, "opacity", 0);
			this.domNode.style.display="block";

			this._center();

			this._fromTrap = true;

			this._fadeIn.play();

			// set timeout to allow the browser to render dialog
			setTimeout(dojo.hitch(this, function(){
				try{
					this.tabStart.focus();
				}catch(e){}
			}), 50);

		},

		hide: function(){
			// summary
			//		Hide the dialog

			// if we haven't been initialized yet then we aren't showing and we can just return		
			if(!this._alreadyInitialized){
				return;
			}

			if(this._fadeIn.status() == "playing"){
				this._fadeIn.stop();
			}
			this._fadeOut.play();

			if (this._scrollConnected){
				this._scrollConnected = false;
			}
			dojo.forEach(this._modalconnects, dojo.disconnect);
			this._modalconnects = [];

		},

		layout: function() {
			if(this.domNode.style.display == "block"){
				this._underlay.layout();
				this._center();
			}
		}
	}
);
