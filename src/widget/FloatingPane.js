dojo.provide("dojo.widget.FloatingPane");
dojo.provide("dojo.widget.html.FloatingPane");

//
// this widget provides a window-like floating pane
//

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.Manager");
dojo.require("dojo.html");
dojo.require("dojo.style");
dojo.require("dojo.dom");
dojo.require("dojo.widget.ContentPane");
dojo.require("dojo.widget.LayoutPane");
dojo.require("dojo.dnd.HtmlDragMove");
dojo.require("dojo.dnd.HtmlDragMoveSource");
dojo.require("dojo.dnd.HtmlDragMoveObject");

dojo.widget.html.FloatingPane = function(){
	dojo.widget.html.LayoutPane.call(this);
	this.shadow={};
}

dojo.inherits(dojo.widget.html.FloatingPane, dojo.widget.html.LayoutPane);

dojo.lang.extend(dojo.widget.html.FloatingPane, {
	widgetType: "FloatingPane",

	// Constructor arguments
	title: '',
	iconSrc: '',
	hasShadow: false,
	constrainToContainer: false,
	taskBarId: "",
	resizable: true,	// note: if specified, user must include ResizeHandle
	hideScrollBars: false,

	resizable: false,
	titleBarDisplay: "fancy",

	containerNode: null,
	domNode: null,
	clientPane: null,
	dragBar: null,

	windowState: "normal",
	displayCloseAction: false,

	maxTaskBarConnectAttempts: 5,
	taskBarConnectAttempts: 0,

	minimizeIcon: dojo.uri.dojoUri("src/widget/templates/images/floatingPaneMinimize.gif"),
	maximizeIcon: dojo.uri.dojoUri("src/widget/templates/images/floatingPaneMaximize.gif"),
	restoreIcon: dojo.uri.dojoUri("src/widget/templates/images/floatingPaneRestore.gif"),
	closeIcon: dojo.uri.dojoUri("src/widget/templates/images/floatingPaneClose.gif"),
	titleBarBackground: dojo.uri.dojoUri("src/widget/templates/images/titlebar-bg.jpg"),

	shadowPng: dojo.uri.dojoUri("src/widget/templates/images/shadow"),

	templateString: '<div class="dojoFloatingPane"></div>',
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlFloatingPane.css"),

	addChild: function(child, overrideContainerNode, pos, ref, insertIndex) {
		this.clientPane.addChild(child, overrideContainerNode, pos, ref, insertIndex);
	},

	_makeClientPane: function(node){
		return this.createPane("ContentPane", node, {layoutAlign: "client", id:this.widgetId+"_client"});
	},

	fillInTemplate: function(args, frag){
		var source = this.getFragNodeRef(frag);

		// Copy style info from input node to output node
		this.domNode.style.cssText = source.style.cssText;
		dojo.html.addClass(this.domNode, dojo.html.getClass(source));
	
		// this is our client area
		// TODO: shouldn't be creating clientDiv for RemotePane case, and shouldn't be copying
		// over children either
		var clientDiv = document.createElement('div');
		dojo.dom.moveChildren(source, clientDiv, 0);
		this.domNode.appendChild(clientDiv);
		this.clientPane = this._makeClientPane(clientDiv);
		dojo.html.addClass(this.clientPane.domNode, 'dojoFloatingPaneClient');

		if (this.hideScrollBars) {
			this.clientPane.domNode.style.overflow="hidden";
		}

		if (this.titleBarDisplay != "none") {
			// this is our chrome
			var chromeDiv = document.createElement('div');
			dojo.html.addClass(chromeDiv, 'dojoFloatingPaneDragbar');
			this.dragBar = this.createPane("LayoutPane", chromeDiv, {layoutAlign: 'top', id:this.widgetId+"_chrome"});
			dojo.html.disableSelection(this.dragBar.domNode);
		
			if( this.titleBarDisplay == "fancy"){
				// image background to get gradient
				var img = document.createElement('img');
				img.src = this.titleBarBackground;
				dojo.html.addClass(img, 'dojoFloatingPaneDragbarBackground');
				var backgroundPane = dojo.widget.createWidget("ContentPane", {layoutAlign:"flood", id:this.widgetId+"_titleBackground"}, img);
				this.dragBar.addChild(backgroundPane);
			}

			//Title Bar
			var titleBar = document.createElement('div');
			dojo.html.addClass(titleBar, "dojoFloatingPaneTitleBar");
			dojo.html.disableSelection(titleBar);

			//TitleBarActions
			var titleBarActions = document.createElement('div');
			dojo.html.addClass(titleBarActions, "dojoFloatingPaneActions");

			//Title Icon
			var titleIcon = document.createElement('img');
			dojo.html.addClass(titleIcon,"dojoTitleBarIcon");
			titleIcon.src = this.iconSrc;						
			titleBar.appendChild(titleIcon);

			//Title text  
			var titleText = document.createTextNode(this.title)
			titleBar.appendChild(titleText);

			if (this.resizable) {

				//FloatingPane Action Minimize
				this.minimizeAction = document.createElement("img");
				dojo.html.addClass(this.minimizeAction, "dojoFloatingPaneActionItem");
				this.minimizeAction.src = this.minimizeIcon;	
				titleBarActions.appendChild(this.minimizeAction);
				dojo.event.connect(this.minimizeAction, 'onclick', this, 'minimizeWindow');

				//FloatingPane Action Restore
				this.restoreAction = document.createElement("img");
				dojo.html.addClass(this.restoreAction, "dojoFloatingPaneActionItem");
				this.restoreAction.src = this.restoreIcon;	
				titleBarActions.appendChild(this.restoreAction);
				dojo.event.connect(this.restoreAction, 'onclick', this, 'restoreWindow');

				if (this.windowState != "normal") {
					this.restoreAction.style.display="inline";
				} else {
					this.restoreAction.style.display="none";
				}

				//FloatingPane Action Maximize
				this.maximizeAction = document.createElement("img");
				dojo.html.addClass(this.maximizeAction, "dojoFloatingPaneActionItem");
				this.maximizeAction.src = this.maximizeIcon;	
				titleBarActions.appendChild(this.maximizeAction);
				dojo.event.connect(this.maximizeAction, 'onclick', this, 'maximizeWindow');

				if (this.windowState != "maximized") {
					this.maximizeAction.style.display="inline";	
				} else {
					this.maximizeAction.style.display="none";	
				}	

			}

			if (this.displayCloseAction) {
				//FloatingPane Action Close
				var closeAction= document.createElement("img");
				dojo.html.addClass(closeAction, "dojoFloatingPaneActionItem");
				closeAction.src = this.closeIcon;	
				titleBarActions.appendChild(closeAction);
				dojo.event.connect(closeAction, 'onclick', this, 'closeWindow');
			}


			chromeDiv.appendChild(titleBar);
			chromeDiv.appendChild(titleBarActions);

			var drag = new dojo.dnd.HtmlDragMoveSource(this.domNode);

			if (this.constrainToContainer) {
				drag.constrainTo();
			}

			drag.setDragHandle(this.dragBar.domNode);
		}

		if ( this.resizable ) {
			// add the resize handle
			var resizeDiv = document.createElement('div');
			dojo.html.addClass(resizeDiv, "dojoFloatingPaneResizebar");
			dojo.html.disableSelection(resizeDiv);
			var rh = dojo.widget.createWidget("ResizeHandle", {targetElmId: this.widgetId, id:this.widgetId+"_resize"});
			this.resizePane = this.createPane("ContentPane", resizeDiv, {layoutAlign: "bottom"});
			this.resizePane.addChild(rh);
		}

		// add a drop shadow
		this._makeShadow();

		dojo.event.connect(this.domNode, 'onmousedown', this, 'onMouseDown');

		// Prevent IE bleed-through problem
		this.bgIframe = new dojo.html.BackgroundIframe();
		if( this.bgIframe.iframe ){
			this.domNode.appendChild(this.bgIframe.iframe);
		}
		if ( this.isVisible() ) {
			this.bgIframe.show();
		};

	},

	_makeShadow: function(){
		if ( this.hasShadow ) {
			var y1 = dojo.render.html.ie ? 33 : 30;
			var y2 = dojo.render.html.ie ? -18 : -15;
			this._makeShadowPiece("ul", "top", 15, "left", -15);
			this._makeShadowPiece("l", "top", y1, "left", -15);
			this._makeShadowPiece("ur", "top", 15, "right", -15);
			this._makeShadowPiece("r", "top", y1, "right", -15);
			this._makeShadowPiece("bl", "bottom", y2, "left", -15);
			this._makeShadowPiece("b", "bottom", y2, "left", 0);
			this._makeShadowPiece("br", "bottom", y2, "right", -15);
		}
	},

	_makeShadowPiece: function(name, vertAttach, vertCoord, horzAttach, horzCoord){
		var img;
		var url = this.shadowPng + name.toUpperCase() + ".png";
		if(dojo.render.html.ie){
			img=document.createElement("div");
			img.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+url+"', sizingMethod='scale')";
		}else{
			img=document.createElement("img");
			img.src=url;
		}
		img.style.position="absolute";
		img.style[vertAttach]=vertCoord+"px";
		img.style[horzAttach]=horzCoord+"px";
		img.style.width="15px";
		img.style.height="15px";
		this.shadow[name]=img;
		this.domNode.appendChild(img);
	},

	_sizeShadow: function(width, height){
		height = dojo.render.html.ie ? height-35 : height-32;
		width = width-2;
		if ( this.hasShadow ) {
			// size the side sections of the shadow (the corners are always positioned correctly)
			this.shadow.l.style.height = height+"px";
			this.shadow.r.style.height = height+"px";
			this.shadow.b.style.width = width+"px";
		}
	},

	maximizeWindow: function(evt) {
		this.previousWidth= this.domNode.style.width;
		this.previousHeight= this.domNode.style.height;
		this.previousLeft = this.domNode.style.left;
		this.previousTop = this.domNode.style.top;

		this.domNode.style.width = "100%";
		this.domNode.style.height = "100%";
		this.domNode.style.left = "0px";
		this.domNode.style.top = "0px";
		dojo.widget.html.FloatingPane.superclass.onResized.call(this);
		this.maximizeAction.style.display="none";	
		this.restoreAction.style.display="inline";	
		this.windowState="maximized";
	},

	minimizeWindow: function(evt) {
		this.hide();
		if (this.resizable) {
			this.maximizeAction.style.display="inline";	
			this.restoreAction.style.display="inline";	
		}

		this.windowState = "minimized";
	},

	restoreWindow: function(evt) {
		if (this.previousWidth && this.previousHeight && this.previousLeft && this.previousTop) {
			this.domNode.style.width = this.previousWidth;
			this.domNode.style.height = this.previousHeight;
			this.domNode.style.left = this.previousLeft;
			this.domNode.style.top = this.previousTop;
			dojo.widget.html.FloatingPane.superclass.onResized.call(this);
		}

		if (this.widgetState != "maximized") {
			this.show();
		}

		if (this.resizable) {
			this.maximizeAction.style.display="inline";	
			this.restoreAction.style.display="none";	
		}

		this.bringToTop();
		this.windowState="normal";
	},

	closeWindow: function(evt) {
		this.destroy();
	},

	onMouseDown: function(evt) {
		this.bringToTop();
	},

	bringToTop: function() {
		var floatingPaneStartingZ = 100;
		var floatingPanes= dojo.widget.manager.getWidgetsByType("FloatingPane");
		var windows = []
		var y=0;
		for (var x=0; x<floatingPanes.length; x++) {
			if (this.widgetId != floatingPanes[x].widgetId) {
					windows.push(floatingPanes[x]);
			}
		}

		windows.sort(function(a,b) {
			return a.domNode.style.zIndex - b.domNode.style.zIndex;
		});
		
		windows.push(this);

		for (x=0; x<windows.length;x++) {
			windows[x].domNode.style.zIndex = floatingPaneStartingZ + x;
		}
	},

	postCreate: function(args, fragment, parentComp){

		// move our 'children' into the client pane
		// we already moved the domnodes, but now we need to move the 'children'

		var kids = this.children.concat();
		this.children = [];

		for(var i=0; i<kids.length; i++){
			if (kids[i].ownerPane == this){
				this.children.push(kids[i]);
			}else{
				this.clientPane.addChild(kids[i]);
			}
		}

		if( this.taskBarId ){
			this.taskBarSetup();
		}

		if (dojo.hostenv.post_load_) {
			dojo.addOnLoad(this, "setInitialWindowState");
		} else {
			this.setInitialWindowState();
		}
		
	},

	setInitialWindowState: function() {
		if (this.windowState == "maximized") {
			this.maximizeWindow();
			this.show();
			this.bringToTop();
			return;
		}

		if (this.windowState=="normal") {
			dojo.lang.setTimeout(this, this.onResized, 50);
			this.show();
			this.bringToTop();
			return;
		}

		if (this.windowState=="minimized") {
			this.hide();
			return;
		}

		this.windowState="minimized";
	},

	// add icon to task bar, connected to me
	taskBarSetup: function() {
		var taskbar = dojo.widget.getWidgetById(this.taskBarId);
		if (!taskbar){
			if (this.taskBarConnectAttempts <  this.maxTaskBarConnectAttempts) {
				dojo.lang.setTimeout(this, this.taskBarSetup, 50);
				this.taskBarConnectAttempts++;
			} else {
				dojo.debug("Unable to connect to the taskBar");
			}
			return;
		}
		taskbar.addChild(this);
	},

	onResized: function(){
		if( !this.isVisible() ){ return; }
		var newHeight = dojo.style.getOuterHeight(this.domNode);
		var newWidth = dojo.style.getOuterWidth(this.domNode);
		if( isNaN(newHeight) || isNaN(newWidth) ){
			// Browser needs more time to figure out my size
			this.resizeSoon();
			return;
		}
	
		//if ( newWidth != this.outerWidth || newHeight != this.outerHeight ) {
			this.outerWidth = newWidth;
			this.outerHeight = newHeight;
			this._sizeShadow(newWidth, newHeight);
			dojo.widget.html.FloatingPane.superclass.onResized.call(this);
		//}

		// bgIframe is a child of this.domNode, so position should be relative to [0,0]
		this.bgIframe.size([0, 0, newWidth, newHeight]);
	},

	hide: function(){
		dojo.widget.html.FloatingPane.superclass.hide.call(this);
		this.bgIframe.hide();
	},

	show: function(){
		dojo.widget.html.FloatingPane.superclass.show.call(this);
		this.bgIframe.show();
	},

	createPane: function(type, node, args){
		var pane = dojo.widget.createWidget(type, args, node);
		dojo.widget.html.FloatingPane.superclass.addChild.call(this,pane);
		pane.ownerPane=this;
		return pane;
	}
});

dojo.widget.tags.addParseTreeHandler("dojo:FloatingPane");
