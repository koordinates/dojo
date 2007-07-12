dojo.provide("dijit.util.focus");

dijit.util.focus = new function(){
	// summary:
	//		This class is used to save the current focus / selection on the screen,
	//		and restore it later.   It's typically used for popups (menus and dialogs),
	//		but can also be used for a menubar or toolbar.   (For example, in the editor
	//		the user might type Ctrl-T to focus the toolbar, and then when he/she selects
	//		a menu choice, focus is returned to the editor window.)
	//
	//		Note that it doesn't deal with submenus off of an original menu;
	//		From this class's perspective it's all part of one big menu.
	//
	//		The widget must implement a close() callback, which will close dialogs or
	//		a context menu, and for a menubar, it will close the submenus and remove
	//		highlighting classes on the root node.


	/////////////////////////////////////////////////////////////
	// Keep track of currently focused and previously focused element

	var curFocus, prevFocus;	
	function onFocus(/*DomNode*/ node){
		if(node && node.tagName && node.tagName.toLowerCase() == "body"){
			node = null;
		}
		if(!node){
			// this is just a blur event (focus moved off of old object onto nothing).
			// since we aren't reporting blur events, just ignore it.
			return;
		}
		if(node !== curFocus){
			prevFocus = curFocus;
			curFocus = node;
			
			// Publish event that this node received focus.
			// Note that on IE this event comes late (up to 100ms late) so it may be out of order
			// w.r.t. other events.   Use sparingly.
			dojo.publish("focus", [node]);
		}
	}

	dojo.addOnLoad(function(){
		if(dojo.isIE){
			// TODO: to make this more deterministic should delay updating curFocus/prevFocus for 10ms?
			window.setInterval(function(){ onFocus(document.activeElement); }, 100);
		}else{
			dojo.body().addEventListener('focus', function(evt){ onFocus(evt.target); }, true);
		}
	});

	/////////////////////////////////////////////////////////////////
	// Main methods, called when a dialog/menu is opened/closed

	var isCollapsed = function(){
		// summary: tests whether the current selection is empty
		var _window = dojo.global;
		var _document = dojo.doc;
		if(_document.selection){ // IE
			return !_document.selection.createRange().text; // Boolean
		}else if(_window.getSelection){
			var selection = _window.getSelection();
			if(dojo.isString(selection)){ // Safari
				return !selection; // Boolean
			}else{ // Mozilla/W3
				return selection.isCollapsed || !selection.toString(); // Boolean
			}
		}
	};

	var getBookmark = function(){
		// summary: Retrieves a bookmark that can be used with moveToBookmark to return to the same range
		var bookmark, selection = dojo.doc.selection;
		if(selection){ // IE
			var range = selection.createRange();
			if(selection.type.toUpperCase()=='CONTROL'){
				bookmark = range.length ? dojo._toArray(range) : null;
			}else{
				bookmark = range.getBookmark();
			}
		}else{
			selection = null;
			//TODO: why a try/catch?  check for getSelection instead?
			try{selection = dojo.global.getSelection();}
			catch(e){/*squelch*/}
			if(selection){
				var range = selection.getRangeAt(0);
				bookmark = range.cloneRange();
			}else{
				console.debug("No idea how to store the current selection for this browser!");
			}
		}
		return bookmark; // Array
	};

	var moveToBookmark = function(/*Object*/bookmark){
		// summary: Moves current selection to a bookmark
		// bookmark: this should be a returned object from dojo.html.selection.getBookmark()
		var _document = dojo.doc;
		if(_document.selection){ // IE
			var range;
			if(dojo.isArray(bookmark)){
				range = _document.body.createControlRange();
				dojo.forEach(bookmark, range.addElement);
			}else{
				range = _document.selection.createRange();
				range.moveToBookmark(bookmark);
			}
			range.select();
		}else{ //Moz/W3C
			var selection;
			//TODO: why a try/catch?  check for getSelection instead?
			try{selection = dojo.global.getSelection();}
			catch(e){ console.debug(e); /*squelch?*/}
			if(selection && selection.removeAllRanges){
				selection.removeAllRanges();
				selection.addRange(bookmark);
			}else{
				console.debug("No idea how to restore selection for this browser!");
			}
		}
	};

	this.save = function(/*Widget*/menu, /*Window*/ openedForWindow){
		// summary:
		//	called when a popup appears (either a top level menu or a dialog),
		//	or when a toolbar/menubar receives focus
		//
		// menu:
		//	the menu that's being opened
		//
		// openedForWindow:
		//	iframe in which menu was opened
		//
		// returns:
		//	a handle to restore focus/selection

		return {
			// Node to return focus to
			focus: dojo.isDescendant(curFocus, menu.domNode) ? prevFocus : curFocus,
			
			// Previously selected text
			bookmark: 
				!dojo.withGlobal(openedForWindow||dojo.global, isCollapsed) ?
				dojo.withGlobal(openedForWindow||dojo.global, getBookmark) :
				null,
				
			openedForWindow: openedForWindow
		}; // Object
	};

	this.restore = function(/*Object*/ handle){
		// summary:
		//	notify the manager that menu is closed; it will return focus to
		//	the specified handle

		var restoreFocus = handle.focus,
			bookmark = handle.bookmark,
			openedForWindow = handle.openedForWindow;
			
		// focus on element that was focused before menu stole the focus
		if(restoreFocus){
			restoreFocus.focus();
		}

		//do not need to restore if current selection is not empty
		//(use keyboard to select a menu item)
		if(bookmark && dojo.withGlobal(openedForWindow||dojo.global, isCollapsed)){
			if(openedForWindow){
				openedForWindow.focus();
			}
			try{
				dojo.withGlobal(openedForWindow||dojo.global, moveToBookmark, null, [bookmark]);
			}catch(e){
				/*squelch IE internal error, see http://trac.dojotoolkit.org/ticket/1984 */
			}
		}
	};
}();

dijit.util.widgetFocusTracer = new function(){
	// summary:
	//	This utility class will trace whenever focus enters/leaves a widget so
	//	that the widget can fire onFocus/onBlur events.
	//
	//	Actually, "focus" isn't quite the right word because we keep track of
	//	a whole stack of "active" widgets.  Example:  Combobutton --> Menu -->
	//	MenuItem.   The onBlur event for Combobutton doesn't fire due to focusing
	//	on the Menu or a MenuItem, since they are considered part of the
	//	Combobutton widget.  It only happens when focus is shifted
	//	somewhere completely different.

	// List of currently active widgets (focused widget and it's ancestors)
	var activeStack=[];

	// List of everything we need to disconnect
	this._connects = [];

	this.register = function(/*Window?*/targetWindow){
		// summary:
		//		Registers listeners on the specified window (either the main
		//		window or an iframe) to detect when the user has clicked somewhere

		if(!targetWindow){ //see comment below
			try{
				targetWindow = dijit.util.window.getDocumentWindow(window.top && window.top.document || window.document);
			}catch(e){ return; /* squelch error for cross domain iframes and abort */ }
		}

		var self = this;
		this._connects.push(dojo.connect(targetWindow.document, "onmousedown", this, function(evt){
			self._onEvent(evt.target||evt.srcElement);
		}));
		//this._connects.push(dojo.connect(targetWindow, "onscroll", this, ???);4
		
		this._focusListener = dojo.subscribe("focus", this, "_onEvent");

		dojo.forEach(targetWindow.frames, function(frame){
			try{
				//do not remove dijit.util.window.getDocumentWindow, see comment in it
				var win = dijit.util.window.getDocumentWindow(frame.document);
				if(win){
					this.register(win);
				}
			}catch(e){ /* squelch error for cross domain iframes */ }
		}, this);
	};

	this._onEvent = function(/*DomNode*/ node){
		// summary
		//	Trace to see which widget event was on, or
		//	if it was on a "free node", not associated w/any widget.
		//	Fire onBlur and onFocus events if focus has changed
		//	(including case where we are no longer focused on any widget)

		// compute stack of active widgets (ex: ComboButton --> Menu --> MenuItem)
		var stack=[];
		try{
			while(node){
				if(node.host){
					node=dijit.byId(node.host).domNode;
				}else{
					var id = node.getAttribute && node.getAttribute("widgetId");
					if(id){
						stack.unshift(id);
					}
					node=node.parentNode;
				}
			}
		}catch(e){ /* squelch */ }

		// compare old stack to new stack to see how many elements they have in common
		for(var nCommon=0; nCommon<Math.min(activeStack.length, stack.length); nCommon++){
			if(activeStack[nCommon] != stack[nCommon]){
				break;
			}
		}

		// for all elements that have gone out of focus, send blur event
		for(var i=activeStack.length-1; i>=nCommon; i--){
			var widget = dijit.byId(activeStack[i]);
			dojo.publish("widgetBlur", [widget]);
			if(widget._onBlur){
				widget._onBlur();
			}
		}

		// for all element that have come into focus, send focus event
		for(var i=nCommon; i<stack.length; i++){
			var widget = dijit.byId(stack[i]);
			dojo.publish("widgetFocus", [widget]);
			if(widget._onFocus){
				widget._onFocus();
			}
		}
		
		activeStack = stack;
	};

	// register top window
	dojo.addOnLoad(this, "register");
	
	// #3531: causes errors, commenting out for now
	//dojo.addOnUnload(this, "_disconnectHandlers");
}();