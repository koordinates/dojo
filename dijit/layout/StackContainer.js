dojo.provide("dijit.layout.StackContainer");

dojo.require("dijit._Templated");
dojo.require("dijit.layout._LayoutWidget");
dojo.requireLocalization("dijit", "common");
dojo.require("dojo.cookie");

dojo.declare(
	"dijit.layout.StackContainer",
	dijit.layout._LayoutWidget,
	{
	// summary: 
	//	A container that has multiple children, but shows only
	//	one child at a time
	//
	// description:
	// 	A container for widgets (ContentPanes, for example) That displays
	//	only one Widget at a time.
	//	
	//	Publishes topics [widgetId]-addChild, [widgetId]-removeChild, and [widgetId]-selectChild
	//
	//	Can be base class for container, Wizard, Show, etc.

	// doLayout: Boolean
	//  if true, change the size of my currently displayed child to match my size
	doLayout: true,

	// persist: Boolean
	//	remembers the selected child across sessions
	persist: false,	// Boolean
	
	baseClass: "dijitStackContainer",

	_started: false,
/*=====
	// selectedChildWidget: Widget
	//	References the currently selected child widget, if any
	//
	selectedChildWidget: null,
=====*/
	postCreate: function(){
		this.inherited(arguments);
		dojo.addClass(this.domNode, "dijitLayoutContainer");
		dijit.setWaiRole(this.containerNode, "tabpanel");
		this.connect(this.domNode, "onkeypress", this._onKeyPress);
	},

	startup: function(){
		if(this._started){ return; }

		var children = this.getChildren();

		// Setup each page panel to be initially hidden
		dojo.forEach(children, this._setupChild, this);

		// Figure out which child to initially display, defaulting to first one
		if(this.persist){
			this.selectedChildWidget = dijit.byId(dojo.cookie(this.id + "_selectedChild"));
		}else{
			dojo.some(children, function(child){
				if(child.selected){
					this.selectedChildWidget = child;
				}
				return child.selected;
			}, this);
		}
		var selected = this.selectedChildWidget;
		if(!selected && children[0]){
			selected = this.selectedChildWidget = children[0];
			selected.selected = true;
		}

		// Publish information about myself so any StackControllers can initialize.
		// This needs to happen before this.inherited(arguments) so that for
		// TabContainer, this._contentBox doesn't include the space for the tab labels.
		dojo.publish(this.id+"-startup", [{children: children, selected: selected}]);

		// Startup each child widget, and do initial layout like setting this._contentBox
		this.inherited(arguments);

		// Size and show the initially selected child
		if(selected){
			this._showChild(selected);
		}
	},

	_setupChild: function(/*Widget*/ child){
		// Summary: prepare the given child

		this.inherited(arguments);

		dojo.addClass(child.domNode, "dijitHidden");

		// remove the title attribute so it doesn't show up when i hover
		// over a node
		child.domNode.title = "";

		return child; // dijit._Widget
	},

	addChild: function(/*Widget*/ child, /*Integer?*/ insertIndex){
		// summary: Adds a widget to the stack
		 
		this.inherited(arguments);

		if(this._started){
			dojo.publish(this.id+"-addChild", [child, insertIndex]);

			// in case the tab titles have overflowed from one line to two lines
			// (or, if this if first child, from zero lines to one line)
			this.layout();

			// if this is the first child, then select it
			if(!this.selectedChildWidget){
				this.selectChild(child);
			}
		}
	},

	removeChild: function(/*Widget*/ page){
		// summary: Removes the pane from the stack

		this.inherited(arguments);

		// If we are being destroyed than don't run the code below (to select another page), because we are deleting
		// every page one by one
		if(this._beingDestroyed){ return; }

		if(this._started){
			// this will notify any tablists to remove a button; do this first because it may affect sizing
			dojo.publish(this.id+"-removeChild", [page]);

			// in case the tab titles now take up one line instead of two lines
			this.layout();
		}

		if(this.selectedChildWidget === page){
			this.selectedChildWidget = undefined;
			if(this._started){
				var children = this.getChildren();
				if(children.length){
					this.selectChild(children[0]);
				}
			}
		}
	},

	selectChild: function(/*Widget*/ page){
		// summary:
		//	Show the given widget (which must be one of my children)

		page = dijit.byId(page);

		if(this.selectedChildWidget != page){
			// Deselect old page and select new one
			this._transition(page, this.selectedChildWidget);
			this.selectedChildWidget = page;
			dojo.publish(this.id+"-selectChild", [page]);

			if(this.persist){
				dojo.cookie(this.id + "_selectedChild", this.selectedChildWidget.id);
			}
		}
	},

	_transition: function(/*Widget*/newWidget, /*Widget*/oldWidget){
		if(oldWidget){
			this._hideChild(oldWidget);
		}
		this._showChild(newWidget);

		// Size the new widget, in case this is the first time it's being shown,
		// or I have been resized since the last time it was shown.
		// Note that page must be visible for resizing to work. 
		if(this.doLayout && newWidget.resize){
			newWidget.resize(this._containerContentBox || this._contentBox);
		}
	},

	_adjacent: function(/*Boolean*/ forward){
		// summary: Gets the next/previous child widget in this container from the current selection
		var children = this.getChildren();
		var index = dojo.indexOf(children, this.selectedChildWidget);
		index += forward ? 1 : children.length - 1;
		return children[ index % children.length ]; // dijit._Widget
	},

	forward: function(){
		// Summary: advance to next page
		this.selectChild(this._adjacent(true));
	},

	back: function(){
		// Summary: go back to previous page
		this.selectChild(this._adjacent(false));
	},

	_onKeyPress: function(e){
		dojo.publish(this.id+"-containerKeyPress", [{ e: e, page: this}]);
	},

	layout: function(){
		if(this.doLayout && this.selectedChildWidget && this.selectedChildWidget.resize){
			this.selectedChildWidget.resize(this._contentBox);
		}
	},

	_showChild: function(/*Widget*/ page){
		var children = this.getChildren();
		page.isFirstChild = (page == children[0]);
		page.isLastChild = (page == children[children.length-1]);
		page.selected = true;

		dojo.removeClass(page.domNode, "dijitHidden");
		dojo.addClass(page.domNode, "dijitVisible");

		if(page._onShow){
			page._onShow(); // trigger load in ContentPane
		}else if(page.onShow){
			page.onShow();
		}
	},

	_hideChild: function(/*Widget*/ page){
		page.selected=false;
		dojo.removeClass(page.domNode, "dijitVisible");
		dojo.addClass(page.domNode, "dijitHidden");

		if(page.onHide){
			page.onHide();
		}
	},

	closeChild: function(/*Widget*/ page){
		// summary:
		//	callback when user clicks the [X] to remove a page
		//	if onClose() returns true then remove and destroy the child
		var remove = page.onClose(this, page);
		if(remove){
			this.removeChild(page);
			// makes sure we can clean up executeScripts in ContentPane onUnLoad
			page.destroyRecursive();
		}
	},

	destroy: function(){
		this._beingDestroyed = true;
		this.inherited(arguments);
	}
});

// For back-compat, remove for 2.0
dojo.require("dijit.layout.StackController");


// These arguments can be specified for the children of a StackContainer.
// Since any widget can be specified as a StackContainer child, mix them
// into the base widget class.  (This is a hack, but it's effective.)
dojo.extend(dijit._Widget, {
	// title: String
	//		Title of this widget.  Used by TabContainer to the name the tab, etc.
	title: "",

	// selected: Boolean
	//		Is this child currently selected?
	selected: false,

	// closable: Boolean
	//		True if user can close (destroy) this child, such as (for example) clicking the X on the tab.
	closable: false,	// true if user can close this tab pane

	onClose: function(){
		// summary: Callback if someone tries to close the child, child will be closed if func returns true
		return true;
	}
});
