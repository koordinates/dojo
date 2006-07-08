dojo.provide("dojo.widget.Menu2");
dojo.provide("dojo.widget.html.Menu2");
dojo.provide("dojo.widget.PopupMenu2");
dojo.provide("dojo.widget.MenuItem2");
dojo.provide("dojo.widget.MenuBar2");

dojo.require("dojo.html.*");
dojo.require("dojo.html.iframe");
dojo.require("dojo.style");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");

dojo.widget.defineWidget(
	"dojo.widget.PopupMenu2",
	dojo.widget.HtmlWidget,
{
	initializer: function(){
		this.targetNodeIds = []; // fill this with nodeIds upon widget creation and it becomes context menu for those nodes
		this.queueOnAnimationFinish = [];
	
		this.eventNames =  {
			open: ""
		};
	},

	isContainer: true,
	snarfChildDomOutput: true,
	buddyWidget: null,  //if this is set, this widget will get focused whenever this menu is focused (opened)

	currentSubmenu: null,
	currentSubmenuTrigger: null,
	parentMenu: null,
	isShowingNow: false,
	menuIndex: 0,

	eventNaming: "default",

	templateString: '<table class="dojoPopupMenu2" border=0 cellspacing=0 cellpadding=0 style="display: none;"><tbody dojoAttachPoint="containerNode"></tbody></table>',
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlMenu2.css"),

	submenuDelay: 500,
	submenuOverlap: 5,
	contextMenuForWindow: false,
	openEvent: null,

	_highlighted_option: null,

	initialize: function(args, frag) {
		if (this.eventNaming == "default") {
			for (var eventName in this.eventNames) {
				this.eventNames[eventName] = this.widgetId+"/"+eventName;
			}
		}
	},

	postCreate: function(){
		if (this.contextMenuForWindow){
			var doc = dojo.body();
			this.bindDomNode(doc);
		} else if ( this.targetNodeIds.length > 0 ){
			dojo.lang.forEach(this.targetNodeIds, this.bindDomNode, this);
		}

		this.subscribeSubitemsOnOpen();
	},

	subscribeSubitemsOnOpen: function() {
		var subItems = this.getChildrenOfType(dojo.widget.MenuItem2);

		for(var i=0; i<subItems.length; i++) {
			dojo.event.topic.subscribe(this.eventNames.open, subItems[i], "menuOpen")
		}
	},

	// get open event for current menu
	getTopOpenEvent: function() {
		var menu = this;
		while (menu.parentMenu){ menu = menu.parentMenu; }
		return menu.openEvent;
	},

	// attach menu to given node
	bindDomNode: function(node){
		node = dojo.byId(node);

		var win = dojo.html.getElementWindow(node);
		if(dojo.html.isTag(node,'iframe') == 'iframe'){
			win = dojo.html.iframeContentWindow(node);
			node = dojo.withGlobal(win, dojo.body);
		}
		// fixes node so that it supports oncontextmenu if not natively supported, Konqueror, Opera more?
		dojo.widget.Menu2.OperaAndKonqFixer.fixNode(node);

		dojo.event.kwConnect({
			srcObj:     node,
			srcFunc:    "oncontextmenu",
			targetObj:  this,
			targetFunc: "onOpen",
			once:       true
		});
		
		dojo.widget.html.Menu2Manager.registerWin(win);
	},

	// detach menu from given node
	unBindDomNode: function(nodeName){
		var node = dojo.byId(nodeName);
		dojo.event.kwDisconnect({
			srcObj:     node,
			srcFunc:    "oncontextmenu",
			targetObj:  this,
			targetFunc: "onOpen",
			once:       true
		});

		// cleans a fixed node, konqueror and opera
		dojo.widget.Menu2.OperaAndKonqFixer.cleanNode(node);
	},

	//if buddyWidget is set, it will get focus whenever this menu
	//is focused
	setFocus: function(){
		if(this.buddyWidget && this.buddyWidget.focus){
			this.buddyWidget.focus();
		}
	},

	moveToNext: function(evt){
		this.highlightOption(1);
		return true; //do not pass to parent menu
	},

	moveToPrevious: function(evt){
		this.highlightOption(-1);
		return true; //do not pass to parent menu
	},

	moveToParentMenu: function(evt){
		if(this._highlighted_option && this.parentMenu){
			//only process event in the focused menu
			//and its immediate parentMenu to support
			//MenuBar2
			if(evt._menu2UpKeyProcessed){
				return true; //do not pass to parent menu
			}else{
				this._highlighted_option.onUnhover();
				this.closeSubmenu();
				evt._menu2UpKeyProcessed = true;
			}
		}
		return false;
	},

	moveToChildMenu: function(evt){
		if(this._highlighted_option && this._highlighted_option.submenuId){
			this._highlighted_option._onClick(true);
			return true; //do not pass to parent menu
		}
		return false;
	},

	selectCurrentItem: function(evt){
		if(this._highlighted_option){
			this._highlighted_option._onClick();
			return true;
		}
		return false;
	},

	//return true to stop the event being processed by the
	//parent popupmenu
	processKey: function(evt){
		if(evt.ctrlKey || evt.altKey){ return false; }

		var keyCode = evt.keyCode;
		var rval = false;
		var k = dojo.event.browser.keys;

		// mozilla quirk 
		// space has no keyCode in mozilla
		var keyCode = evt.keyCode;
		if(keyCode==0 && evt.charCode==k.KEY_SPACE){
			keyCode = k.KEY_SPACE;
		}

		switch(keyCode){
 			case k.KEY_DOWN_ARROW:
				rval = this.moveToNext(evt);
				break;
			case k.KEY_UP_ARROW:
				rval = this.moveToPrevious(evt);
				break;
			case k.KEY_RIGHT_ARROW:
				rval = this.moveToChildMenu(evt);
				break;
			case k.KEY_LEFT_ARROW:
				rval = this.moveToParentMenu(evt);
				break;
			case k.KEY_SPACE: //fall through
			case k.KEY_ENTER:
				if(rval = this.selectCurrentItem(evt)){
					break;
				}
				//fall through
			case k.KEY_ESCAPE:
				dojo.widget.html.Menu2Manager.currentMenu.close();
				rval = true;
				break;
		}

		return rval;
	},

	findValidItem: function(dir, curItem){
		if(curItem){
			curItem = dir>0 ? curItem.getNextSibling() : curItem.getPreviousSibling();
		}

		for(var i=0; i < this.children.length; ++i){
			if(!curItem){
				curItem = dir>0 ? this.children[0] : this.children[this.children.length-1];
			}
			if(curItem.onHover){
				return curItem;
			}
			curItem = dir>0 ? curItem.getNextSibling() : curItem.getPreviousSibling();
		}
	},
	
	highlightOption: function(dir){
		var item;
		// || !this._highlighted_option.parentNode
		if((!this._highlighted_option)){
			item = this.findValidItem(dir);
		}else{
			item = this.findValidItem(dir, this._highlighted_option);
		}
		if(item){
			if(this._highlighted_option) {
				this._highlighted_option.onUnhover();
			}
			item.onHover();
			dojo.html.scrollIntoView(item.domNode);
		}
	},

	// User defined function to handle clicks on an item
	onItemClick: function(item) {},

	/**
	 * Open the menu at position (x,y), relative to dojo.body()
	 * Or open(node, parent, explodeSrc, aroundOrient) to open
	 * around node
	 */
	open: function(x, y, parent, explodeSrc, orient){
		if (this.isShowingNow){ return; }

		var around = false, node, aroundOrient;
		if(typeof x == 'object'){
			node = x;
			aroundOrient = explodeSrc;
			explodeSrc = parent;
			parent = y;
			around = true;
		}

		// for unknown reasons even if the domNode is attached to the body in postCreate(),
		// it's not attached here, so have to attach it here.
		dojo.body().appendChild(this.domNode);

		// if explodeSrc isn't specified then explode from my parent widget
		explodeSrc = explodeSrc || parent["domNode"] || [];

		//FIXME: how to check derivation of class?
		var parentMenu = (parent && (parent.widgetType=="PopupMenu2" || parent.widgetType=="MenuBar2")) ? parent : null;

		if ( !parentMenu ) {
			// record whenever a top level menu is opened
			// explodeSrc may or may not be a node - it may also be an [x,y] position array
			var button = explodeSrc instanceof Array ? null : explodeSrc;
			dojo.widget.html.Menu2Manager.opened(this, button);
		}

		// if I click right button and menu is opened, then it gets 2 commands: close -> open
		// so close enables animation and next "open" is put to queue to occur at new location
		if(this.animationInProgress){
			this.queueOnAnimationFinish.push(this.open, arguments);
			return;
		}

		// display temporarily, and move into position, then hide again
		with(this.domNode.style){
			display="";
			zIndex = 200 + this.menuIndex;
		}

		if(around){
			if(!aroundOrient){ //By default, attempt to open above the aroundNode, or below
				aroundOrient = {'BL': 'TL', 'TL': 'BL'};
			}
			dojo.html.placeOnScreenAroundElement(this.domNode, node, [0, 0], true, aroundOrient);
		}else{
			if(!orient){ orient = 'TL,TR,BL,BR';}
			dojo.html.placeOnScreen(this.domNode, x, y, [0, 0], true, orient);
		}
		this.domNode.style.display="none";

		this.parentMenu = parentMenu;
		this.explodeSrc = explodeSrc;
		this.menuIndex = parentMenu ? parentMenu.menuIndex + 1 : 1;

		// then use the user defined method to display it
		this.show();

		this.isShowingNow = true;
	},

	close: function(){
		// If we are in the process of opening the menu and we are asked to close it
		if(this.animationInProgress){
			this.queueOnAnimationFinish.push(this.close, []);
			return;
		}

		if(this._highlighted_option){
			this._highlighted_option.onUnhover();
		}

		this.closeSubmenu();
		this.hide();
		this.isShowingNow = false;

		dojo.widget.html.Menu2Manager.closed(this);
	},

	onShow: function() {
		dojo.widget.HtmlWidget.prototype.onShow.call(this);
		this.processQueue();
	},

	// do events from queue
	processQueue: function() {
		if (!this.queueOnAnimationFinish.length) return;

		var func = this.queueOnAnimationFinish.shift();
		var args = this.queueOnAnimationFinish.shift();

		func.apply(this, args);
	},

	onHide: function() {
		dojo.widget.HtmlWidget.prototype.onHide.call(this);

		this.processQueue();
	},

	closeAll: function(){
		if (this.parentMenu){
			this.parentMenu.closeAll();
		}else{
			this.close();
		}
	},

	closeSubmenu: function(){
		if (this.currentSubmenu == null){ return; }

		this.currentSubmenu.close();
		this.currentSubmenu = null;

		this.currentSubmenuTrigger.is_open = false;
		this.currentSubmenuTrigger.closedSubmenu();
		this.currentSubmenuTrigger = null;
	},

	// open the menu to the right of the current menu item
	openSubmenu: function(submenu, from_item){
		var fromPos = dojo.style.getAbsolutePosition(from_item.domNode, true);
		var our_w = dojo.style.getOuterWidth(this.domNode);
		var x = fromPos.x + our_w - this.submenuOverlap;
		var y = fromPos.y;

		this.currentSubmenu = submenu;

		this.currentSubmenu.open(x, y, this, from_item.domNode);

		this.currentSubmenuTrigger = from_item;
		this.currentSubmenuTrigger.is_open = true;
	},

	onOpen: function(e){
		this.openEvent = e;
		var x = e.pageX, y = e.pageY;

		var win = dojo.html.getElementWindow(e.target);
		var iframe = win.frameElement;
		if(iframe){
			//in IE, scroll should not be counted, while in Moz it is required
			var cood = dojo.style.getAbsolutePosition(iframe, !dojo.render.html.ie);
			x += cood.x - (dojo.render.html.ie ? 0 : dojo.withGlobal(win, dojo.html.getScrollLeft) );
			y += cood.y - (dojo.render.html.ie ? 0 : dojo.withGlobal(win, dojo.html.getScrollTop) );
		}
		this.open(x, y, null, [x, y]);

		if(e["preventDefault"]){
			e.preventDefault();
			e.stopPropagation();
		}
	}
});

dojo.widget.defineWidget(
	"dojo.widget.MenuItem2",
	dojo.widget.HtmlWidget,
{
	initializer: function(){
		this.eventNames = {
			engage: ""
		};
	},

	// Make 4 columns
	//   icon, label, accelerator-key, and right-arrow indicating sub-menu
	templateString:
		 '<tr class="dojoMenuItem2" dojoAttachEvent="onMouseOver: onHover; onMouseOut: onUnhover; onClick: _onClick;">'
		+'<td><div class="dojoMenuItem2Icon" style="${this.iconStyle}"></div></td>'
		+'<td class="dojoMenuItem2Label"><span><span>${this.caption}</span>${this.caption}</span></td>'
		+'<td class="dojoMenuItem2Accel"><span><span>${this.accelKey}</span>${this.accelKey}</span></td>'
		+'<td><div class="dojoMenuItem2Submenu" style="display:${this.arrowDisplay};"></div></td>'
		+'</tr>',

	//
	// internal settings
	//

	is_hovering: false,
	hover_timer: null,
	is_open: false,
	topPosition: 0,

	//
	// options
	//

	caption: 'Untitled',
	accelKey: '',
	iconSrc: '',
	submenuId: '',
	disabled: false,
	eventNaming: "default",
	highlightClass: 'dojoMenuItem2Hover',
	
	postMixInProperties: function(){
		this.iconStyle="";
		if (this.iconSrc){
			if ((this.iconSrc.toLowerCase().substring(this.iconSrc.length-4) == ".png") && (dojo.render.html.ie)){
				this.iconStyle="filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+this.iconSrc+"', sizingMethod='image')";
			}else{
				this.iconStyle="background-image: url("+this.iconSrc+")";
			}
		}
		this.arrowDisplay = this.submenuId ? 'block' : 'none';
	},

	fillInTemplate: function(){
		dojo.html.disableSelection(this.domNode);

		if (this.disabled){
			this.setDisabled(true);
		}

		if (this.eventNaming == "default") {
			for (var eventName in this.eventNames) {
				this.eventNames[eventName] = this.widgetId+"/"+eventName;
			}
		}
	},

	onHover: function(){
		//this is to prevent some annoying behavior when both mouse and keyboard are used
		this.onUnhover();

		if (this.is_hovering){ return; }
		if (this.is_open){ return; }

		if(this.parent._highlighted_option){
			this.parent._highlighted_option.onUnhover();
		}
		this.parent.closeSubmenu();
		this.parent._highlighted_option = this;
		dojo.widget.html.Menu2Manager.setFocusedMenu(this.parent);

		this.highlightItem();

		if (this.is_hovering){ this.stopSubmenuTimer(); }
		this.is_hovering = true;
		this.startSubmenuTimer();
	},

	onUnhover: function(){
		if(!this.is_open){ this.unhighlightItem(); }

		this.is_hovering = false;

		this.parent._highlighted_option = null;

		if(this.parent.parentMenu){
			dojo.widget.html.Menu2Manager.setFocusedMenu(this.parent.parentMenu);
		}

		this.stopSubmenuTimer();
	},

	// Internal function for clicks
	_onClick: function(focus){
		var displayingSubMenu = false;
		if (this.disabled){ return rval; }

		if (this.submenuId){
			if (!this.is_open){
				this.stopSubmenuTimer();
				this.openSubmenu();
			}
			displayingSubMenu = true;
		}else{
			this.parent.closeAll();
		}

		// for some browsers the onMouseOut doesn't get called (?), so call it manually
		if(!displayingSubMenu){ //only onUnhover when no submenu is available
			this.onUnhover();
		}

		// user defined handler for click
		this.onClick();

		dojo.event.topic.publish(this.eventNames.engage, this);

		if(displayingSubMenu && focus){
			dojo.widget.getWidgetById(this.submenuId).highlightOption(1);
		}
		return;
	},

	// User defined function to handle clicks
	// this default function call the parent
	// menu's onItemClick
	onClick: function() {
		this.parent.onItemClick(this);
	},

	highlightItem: function(){
		dojo.html.addClass(this.domNode, this.highlightClass);
	},

	unhighlightItem: function(){
		dojo.html.removeClass(this.domNode, this.highlightClass);
	},

	startSubmenuTimer: function(){
		this.stopSubmenuTimer();

		if (this.disabled){ return; }

		var self = this;
		var closure = function(){ return function(){ self.openSubmenu(); } }();

		this.hover_timer = dojo.lang.setTimeout(closure, this.parent.submenuDelay);
	},

	stopSubmenuTimer: function(){
		if (this.hover_timer){
			dojo.lang.clearTimeout(this.hover_timer);
			this.hover_timer = null;
		}
	},

	openSubmenu: function(){
		// first close any other open submenu
		this.parent.closeSubmenu();

		var submenu = dojo.widget.getWidgetById(this.submenuId);
		if (submenu){
			this.parent.openSubmenu(submenu, this);
		}
	},

	closedSubmenu: function(){
		this.onUnhover();
	},

	setDisabled: function(value){
		this.disabled = value;

		if (this.disabled){
			dojo.html.addClass(this.domNode, 'dojoMenuItem2Disabled');
		}else{
			dojo.html.removeClass(this.domNode, 'dojoMenuItem2Disabled');
		}
	},

	enable: function(){
		this.setDisabled(false);
	},

	disable: function(){
		this.setDisabled(true);
	},

	menuOpen: function(message) {
	}

});

dojo.widget.defineWidget(
	"dojo.widget.MenuSeparator2",
	dojo.widget.HtmlWidget,
{
	templateString: '<tr class="dojoMenuSeparator2"><td colspan=4>'
			+'<div class="dojoMenuSeparator2Top"></div>'
			+'<div class="dojoMenuSeparator2Bottom"></div>'
			+'</td></tr>',

	postCreate: function(){
		dojo.html.disableSelection(this.domNode);
	}
});

//
// the menu manager makes sure we don't have several menus
// open at once. the root menu in an opening sequence calls
// opened(). when a root menu closes it calls closed(). then
// everything works. lovely.
//

dojo.widget.html.Menu2Manager = new function(){

	this.currentMenu = null;
	this.currentButton = null;		// button that opened current menu (if any)
	this.currentFocusMenu = null;	// the (sub)menu which receives key events
	this.focusNode = null;
	this.registeredWindows = [];

	//In Opera, only onkeypress works, while in IE, only onkeydown works
	//In Moz, both work. so use onkeydown in IE, otherwise use onkeypress 
	//for keyevents (FIXME: safari/konqueror?)
	this._keyEventName = dojo.doc().createEvent ? "onkeypress" : "onkeydown";

	this.registerWin = function(win){
		if(!win.__Menu2ManagerRegistered)
		{
			dojo.event.connect(win.document, 'onmousedown', this, 'onClick');
			dojo.event.connect(win, "onscroll", this, "onClick");
			dojo.event.connect(win.document, this._keyEventName, this, 'onKeyPress');
			win.__Menu2ManagerRegistered = true;
			this.registeredWindows.push(win);
		}
	};

	/*
		This function register all the iframes and the top window,
		so that whereever the user clicks in the page, the popup 
		menu will be closed
		In case you add an iframe after onload event, please call
		dojo.widget.html.Menu2Manager.registerWin manually
	*/
	this.registerAllWindows = function(targetWindow){
		//starting from window.top, clicking everywhere in this page 
		//should close popup menus
		if(!targetWindow)  targetWindow = dojo.html.getDocumentWindow(window.top.document); //see comment below

		this.registerWin(targetWindow);

		for (var i = 0; i < targetWindow.frames.length; i++){
			//do not remove  dojo.html.getDocumentWindow, see comment in it
			var win = dojo.html.getDocumentWindow(targetWindow.frames[i].document);
			if(win){
				this.registerAllWindows(win);
			}
		}
	};
	
	dojo.addOnLoad(this, "registerAllWindows");
	
	this.closed = function(menu){
		if (this.currentMenu == menu){
			this.currentMenu = null;
			this.currentButton = null;
			this.currentFocusMenu = null;
		}
	};

	this.opened = function(menu, button){
		if (menu == this.currentMenu){ return; }

		if (this.currentMenu){
			this.currentMenu.close();
		}

		this.currentMenu = menu;
		this.currentFocusMenu = menu;
		this.currentButton = button;
	};

	this.setFocusedMenu = function(menu){
		this.currentFocusMenu = menu;
	};

	this.onKeyPress = function(e){
		if(!this.currentMenu || !this.currentMenu.isShowingNow){ return; }

		var m = this.currentFocusMenu;
		while (m){
			if(m.processKey(e)){
				e.preventDefault();
				e.stopPropagation();
				break;
			}
			m = m.parentMenu;
		}
	},

	this.onClick = function(e){
		if (!this.currentMenu){ return; }

		var scrolloffset = dojo.html.getScrollOffset();

		// starting from the base menu, perform a hit test
		// and exit when one succeeds

		var m = this.currentMenu;
		
		if(!e){ //IE
			//In IE, no way to tell under which registeredWindows
			//this event is generated. Thus we have to check
			//each registered one, and set the event
			for(var i=0;i<this.registeredWindows.length;++i){
				if(this.registeredWindows[i].event){
					e = this.registeredWindows[i].event;
					break;
				}
			}
		}

		while (m){
			if(dojo.html.overElement(m.domNode, e) || dojo.dom.isDescendantOf(e.target, m.domNode)){
				this.currentMenu.setFocus();
				return;
			}
			m = m.currentSubmenu;
		}

		// Also, if user clicked the button that opened this menu, then
		// that button will send the menu a close() command, so this code
		// shouldn't try to close the menu.  Closing twice messes up animation.
		if (this.currentButton && dojo.html.overElement(this.currentButton, e)){
			return;
		}

		// the click didn't fall within the open menu tree
		// so close it

		this.currentMenu.close();
	};
}

// ************************** make contextmenu work in konqueror and opera *********************
dojo.widget.Menu2.OperaAndKonqFixer = new function(){
 	var implement = true;
 	var delfunc = false;

 	/** 	dom event check
 	*
 	*	make a event and dispatch it and se if it calls function below,
 	*	if it indeed is supported and we dont need to implement our own
 	*/

 	// gets called if we have support for oncontextmenu
 	if (!dojo.lang.isFunction(dojo.doc().oncontextmenu)){
 		dojo.doc().oncontextmenu = function(){
 			implement = false;
 			delfunc = true;
 		}
 	}

 	if (dojo.doc().createEvent){ // moz, safari has contextmenu event, need to do livecheck on this env.
 		try {
 			var e = dojo.doc().createEvent("MouseEvents");
 			e.initMouseEvent("contextmenu", 1, 1, dojo.global(), 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, null);
 			dojo.doc().dispatchEvent(e);
 		} catch (e) {/* assume not supported */}
 	} else {
 		// IE no need to implement custom contextmenu
 		implement = false;
 	}

 	// clear this one if it wasn't there before
 	if (delfunc){
 		delete dojo.doc().oncontextmenu;
 	}
 	/***** end dom event check *****/


 	/**
 	*	this fixes a dom node by attaching a custom oncontextmenu function that gets called when apropriate
 	*	@param	node	a dom node
 	*
 	*	no returns
 	*/
 	this.fixNode = function(node){
 		if (implement){
 			// attach stub oncontextmenu function
 			if (!dojo.lang.isFunction(node.oncontextmenu)){
 				node.oncontextmenu = function(e){/*stub*/}
 			}

 			// attach control function for oncontextmenu
 			if (dojo.render.html.opera){
 				// opera
 				// listen to ctrl-click events
 				node._menufixer_opera = function(e){
 					if (e.ctrlKey){
 						this.oncontextmenu(e);
 					}
 				};

 				dojo.event.connect(node, "onclick", node, "_menufixer_opera");

 			} else {
 				// konqueror
 				// rightclick, listen to mousedown events
 				node._menufixer_konq = function(e){
 					if (e.button==2 ){
 						e.preventDefault(); // need to prevent browsers menu
 						this.oncontextmenu(e);
 					}
 				};

 				dojo.event.connect(node, "onmousedown", node, "_menufixer_konq");
 			}
 		}
 	}

 	/**
 	*	this cleans up a fixed node, prevent memoryleak?
 	*	@param node	node to clean
 	*
 	*	no returns
 	*/
 	this.cleanNode = function(node){
 		if (implement){
 			// checks needed if we gets a non fixed node
 			if (node._menufixer_opera){
 				dojo.event.disconnect(node, "onclick", node, "_menufixer_opera");
 				delete node._menufixer_opera;
 			} else if(node._menufixer_konq){
 				dojo.event.disconnect(node, "onmousedown", node, "_menufixer_konq");
 				delete node._menufixer_konq;
 			}
 			if (node.oncontextmenu){
 				delete node.oncontextmenu;
 			}
 		}
 	}
};

dojo.widget.defineWidget(
	"dojo.widget.MenuBar2",
	dojo.widget.PopupMenu2,
{
	menuOverlap: 2,

	templateString: '<div class="dojoMenuBar2"><table class="dojoMenuBar2Client"><tr dojoAttachPoint="containerNode"></tr></table></div>',

	close: function(){
		if(this._highlighted_option){
			this._highlighted_option.onUnhover();
		}

		this.closeSubmenu();
	},

	processKey: function(evt){
		if(evt.ctrlKey || evt.altKey){ return false; }

		var keyCode = evt.keyCode;
		var rval = false;
		var k = dojo.event.browser.keys;

		switch(keyCode){
 			case k.KEY_DOWN_ARROW:
				rval = this.moveToChildMenu(evt);
				break;
			case k.KEY_UP_ARROW:
				rval = this.moveToParentMenu(evt);
				break;
			case k.KEY_RIGHT_ARROW:
				rval = this.moveToNext(evt);
				break;
			case k.KEY_LEFT_ARROW:
				rval = this.moveToPrevious(evt);
				break;
			default:
				rval = this.inherited("processKey", evt);
				break;
		}

		return rval;
	},

	postCreate: function(){
		this.inherited("postCreate");
		dojo.widget.html.Menu2Manager.opened(this);
		this.isShowingNow = true;
	},

	/*
	 * override PopupMenu2 to open the submenu below us rather than to our right
	 */
	openSubmenu: function(submenu, from_item){
		var fromPos = dojo.style.getAbsolutePosition(from_item.domNode, true);
		var ourPos = dojo.style.getAbsolutePosition(this.domNode, true);
		var our_h = dojo.style.getInnerHeight(this.domNode);
		var x = fromPos.x;
		var y = ourPos.y + our_h - this.menuOverlap;

		this.currentSubmenu = submenu;
		this.currentSubmenu.open(x, y, this, from_item.domNode);

		this.currentSubmenuTrigger = from_item;
		this.currentSubmenuTrigger.is_open = true;
	}
});

dojo.widget.defineWidget(
	"dojo.widget.MenuBarItem2",
	dojo.widget.MenuItem2,
{
	templateString:
		 '<td class="dojoMenuBarItem2" dojoAttachEvent="onMouseOver: onHover; onMouseOut: onUnhover; onClick: _onClick;">'
		+'<span><span>${this.caption}</span>${this.caption}</span>'
		+'</td>',

	highlightClass: 'dojoMenuBarItem2Hover',

	setDisabled: function(value){
		this.disabled = value;
		if (this.disabled){
			dojo.html.addClass(this.domNode, 'dojoMenuBarItem2Disabled');
		}else{
			dojo.html.removeClass(this.domNode, 'dojoMenuBarItem2Disabled');
		}
	}
});
