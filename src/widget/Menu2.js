dojo.provide("dojo.widget.Menu2");
dojo.provide("dojo.widget.html.Menu2");
dojo.provide("dojo.widget.PopupMenu2");
dojo.provide("dojo.widget.MenuItem2");
dojo.provide("dojo.widget.MenuBar2");

dojo.require("dojo.html.*");
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

	currentSubmenu: null,
	currentSubmenuTrigger: null,
	parentMenu: null,
	parentMenuBar: null,
	isShowingNow: false,
	menuIndex: 0,

	eventNaming: "default",

	templateString: '<table class="dojoPopupMenu2" border=0 cellspacing=0 cellpadding=0 style="display: none;"><tbody dojoAttachPoint="containerNode"></tbody></table>',
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlMenu2.css"),

	submenuDelay: 500,
	submenuOverlap: 5,
	contextMenuForWindow: false,
	openEvent: null,

	initialize: function(args, frag) {
		if (this.eventNaming == "default") {
			for (var eventName in this.eventNames) {
				this.eventNames[eventName] = this.widgetId+"/"+eventName;
			}
		}
	},

	postCreate: function(){
		// attach menu to document body if it's not already there
		if (this.domNode.parentNode != document.body){
			document.body.appendChild(this.domNode);
		}

		if (this.contextMenuForWindow){
			var doc = document.documentElement  || document.body;
			dojo.widget.Menu2.OperaAndKonqFixer.fixNode(doc);
			dojo.event.connect(doc, "oncontextmenu", this, "onOpen");
		} else if ( this.targetNodeIds.length > 0 ){
			for(var i=0; i<this.targetNodeIds.length; i++){
				this.bindDomNode(this.targetNodeIds[i]);
			}
		}

		this.subscribeSubitemsOnOpen();
	},

	subscribeSubitemsOnOpen: function() {
		var subItems = this.getChildrenOfType(dojo.widget.MenuItem2);

		//dojo.debug(subItems)

		for(var i=0; i<subItems.length; i++) {
			//dojo.debug(subItems[i]);
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
	bindDomNode: function(nodeName){
		var node = dojo.byId(nodeName);

		// fixes node so that it supports oncontextmenu if not natively supported, Konqueror, Opera more?
		dojo.widget.Menu2.OperaAndKonqFixer.fixNode(node);

		dojo.event.kwConnect({
			srcObj:     node,
			srcFunc:    "oncontextmenu",
			targetObj:  this,
			targetFunc: "onOpen",
			once:       true
		});
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

	/**
	 * Open the menu at position (x,y), relative to document.body
	 */
	open: function(x, y, parent, explodeSrc){
		if (this.isShowingNow){ return; }

		// if explodeSrc isn't specified then explode from my parent widget
		explodeSrc = explodeSrc || parent["domNode"] || [];

		var parentMenu = (parent && parent.widgetType=="PopupMenu2") ? parent : null;

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
		dojo.html.placeOnScreenPoint(this.domNode, x, y, [0, 0], true);
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

		this.closeSubmenu();
		this.hide();
		this.isShowingNow = false;
		dojo.widget.html.Menu2Manager.closed(this);

		if (this.parentMenuBar){
			this.parentMenuBar.closedMenu(this);
		}
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

		this.open(e.pageX, e.pageY, null, [e.pageX, e.pageY]);

		if(e["preventDefault"]){
			e.preventDefault();
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
		if (this.is_hovering){ return; }
		if (this.is_open){ return; }

		this.parent.closeSubmenu();
		this.highlightItem();

		if (this.is_hovering){ this.stopSubmenuTimer(); }
		this.is_hovering = true;
		this.startSubmenuTimer();
	},

	onUnhover: function(){
		if (!this.is_open){ this.unhighlightItem(); }

		this.is_hovering = false;
		this.stopSubmenuTimer();
	},

	// Internal function for clicks
	_onClick: function(){
		if (this.disabled){ return; }

		if (this.submenuId){
			if (!this.is_open){
				this.stopSubmenuTimer();
				this.openSubmenu();
			}
		}else{
			this.parent.closeAll();
		}

		// for some browsers the onMouseOut doesn't get called (?), so call it manually
		this.onUnhover();

		// user defined handler for click
		this.onClick();

		dojo.event.topic.publish(this.eventNames.engage, this);
	},

	// User defined function to handle clicks
	onClick: function() { },

	highlightItem: function(){
		dojo.html.addClass(this.domNode, 'dojoMenuItem2Hover');
	},

	unhighlightItem: function(){
		dojo.html.removeClass(this.domNode, 'dojoMenuItem2Hover');
	},

	startSubmenuTimer: function(){
		this.stopSubmenuTimer();

		if (this.disabled){ return; }

		var self = this;
		var closure = function(){ return function(){ self.openSubmenu(); } }();

		this.hover_timer = window.setTimeout(closure, this.parent.submenuDelay);
	},

	stopSubmenuTimer: function(){
		if (this.hover_timer){
			window.clearTimeout(this.hover_timer);
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
	this.focusNode = null;

	dojo.event.connect(document, 'onmousedown', this, 'onClick');
	dojo.event.connect(window, "onscroll", this, "onClick");

	this.closed = function(menu){
		if (this.currentMenu == menu){
			this.currentMenu = null;
			this.currentButton = null;
		}
	};

	this.opened = function(menu, button){
		if (menu == this.currentMenu){ return; }

		if (this.currentMenu){
			this.currentMenu.close();
		}

		this.currentMenu = menu;
		this.currentButton = button;
	};

	this.onClick = function(e){
		if (!this.currentMenu){ return; }

		var scrolloffset = dojo.html.getScrollOffset();

		// starting from the base menu, perform a hit test
		// and exit when one succeeds

		var m = this.currentMenu;
		while (m){
			if(dojo.html.overElement(m.domNode, e)){
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
 	*	if it does its supported and we dont need to implement our own
 	*/

 	// gets called if we have support for oncontextmenu
 	if (!dojo.lang.isFunction(document.oncontextmenu)){
 		document.oncontextmenu = function(){
 			implement = false;
 			delfunc = true;
 		}
 	}

 	if (document.createEvent){ // moz, safari has contextmenu event, need to do livecheck on this env.
 		try {
 			var e = document.createEvent("MouseEvents");
 			e.initMouseEvent("contextmenu", 1, 1, window, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, null);
 			document.dispatchEvent(e);
 		} catch (e) {/* assume not supported */}
 	} else {
 		// IE no need to implement custom contextmenu
 		implement = false;
 	}

 	// clear this one if it wasn't there before
 	if (delfunc){
 		delete document.oncontextmenu;
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
 			if (window.opera){
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
	templateString: '<div class="dojoMenuBar2"><table class="dojoMenuBar2Client"><tr dojoAttachPoint="containerNode"></tr></table></div>',

	// override PopupMenu2 to open the submenu below us rather than to our right
	openSubmenu: function(submenu, from_item){
		// open the menu to the right of the current menu item
		var fromPos = dojo.style.getAbsolutePosition(from_item.domNode, true);
		var ourPos = dojo.style.getAbsolutePosition(this.domNode, true);
		var our_h = dojo.style.getInnerHeight(this.domNode);
		var x = fromPos.x;
		var y = ourPos.y + our_h;

		this.currentSubmenu = submenu;
		this.currentSubmenu.open(x, y, this, from_item.domNode);

		this.currentSubmenu.parentMenuBar = this;
		this.currentSubmenuTrigger = from_item;
		this.currentSubmenuTrigger.is_open = true;
	},

	itemHover: function(item){
		if (item == this.currentItem) return;

		if (this.currentItem){
			this.currentItem.unhighlightItem();

			if (this.isExpanded){
				this.closeSubmenu();
			}
		}

		this.currentItem = item;
		this.currentItem.highlightItem();

		if (this.isExpanded){
			this.currentItem.expandMenu();
		}
	},

	itemUnhover: function(item){
		if (item != this.currentItem) return;

		if (this.currentItem && !this.isExpanded){
			this.currentItem.unhighlightItem();
			this.currentItem = null;
		}
	},

	itemClick: function(item){
		if (item != this.currentItem){
			this.itemHover(item);
		}

		if (this.isExpanded){
			this.isExpanded = false;
			this.closeSubmenu();

		}else{
			this.isExpanded = true;
			this.currentItem.expandMenu();
		}
	},

	closedMenu: function(menu){
		if (this.currentSubmenu == menu){
			this.isExpanded = false;
			this.itemUnhover(this.currentItem);
		}
	}
});

dojo.widget.defineWidget(
	"dojo.widget.MenuBarItem2",
	dojo.widget.MenuItem2,
{
	templateString:
		 '<td class="dojoMenuBarItem2 dojoMenuBarItem2Label" dojoAttachEvent="onMouseOver: onHover; onMouseOut: onUnhover; onClick: _onClick;">'
		+'<span><span>${this.caption}</span>${this.caption}</span>'
		+'</td>',

	onHover: function(){
		this.parent.itemHover(this);
	},

	onUnhover: function(){
		this.parent.itemUnhover(this);
	},

	_onClick: function(){
		this.parent.itemClick(this);
	},

	highlightItem: function(){
		dojo.html.addClass(this.domNode, 'dojoMenuBarItem2Hover');
	},

	unhighlightItem: function(){
		dojo.html.removeClass(this.domNode, 'dojoMenuBarItem2Hover');
	},

	expandMenu: function(){
		var submenu = dojo.widget.getWidgetById(this.submenuId);
		if (submenu){
			this.parent.openSubmenu(submenu, this);
		}
	},

	setDisabled: function(value){
		this.disabled = value;

		if (this.disabled){
			dojo.html.addClass(this.domNode, 'dojoMenuBarItem2Disabled');
		}else{
			dojo.html.removeClass(this.domNode, 'dojoMenuBarItem2Disabled');
		}
	}
});