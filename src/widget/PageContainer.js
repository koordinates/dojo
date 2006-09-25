dojo.provide("dojo.widget.PageContainer");

dojo.require("dojo.lang.func");
dojo.require("dojo.widget.*");
dojo.require("dojo.event.*");
dojo.require("dojo.html.selection");

// A PageContainer is a container that has multiple panes, but shows only
// one pane at a time.
//
// Publishes topics <widgetId>-addPane, <widgetId>-removePane, and <widgetId>-selectPane
//
// Can be base class for container, Wizard, Show, etc.
dojo.widget.defineWidget("dojo.widget.PageContainer", dojo.widget.HtmlWidget, {
	isContainer: true,

	// Boolean
	//  if true, change the size of my currently displayed child to match my size
	doLayout: true,

	templateString: "<div dojoAttachPoint='containerNode'></div>",

	// String
	//   id of the initially shown page
	selectedPage: "",

	fillInTemplate: function(args, frag) {
		// Copy style info from input node to output node
		var source = this.getFragNodeRef(frag);
		dojo.html.copyStyle(this.domNode, source);
		dojo.widget.PageContainer.superclass.fillInTemplate.apply(this, arguments);
	},

	postCreate: function(args, frag) {
		// Setup each page panel
		dojo.lang.forEach(this.children, this._setupPage, this);

		// Display the selected page
		if(this.selectedPageWidget){
			this.selectPage(this.selectedPageWidget, true);
		}
	},

	addChild: function(child){
		this._setupPage(child);
		dojo.widget.PageContainer.superclass.addChild.apply(this, arguments);

		// in case the page labels have overflowed from one line to two lines
		this.onResized();
	},

	_setupPage: function(page){
		// Summary: Add the given pane to this page container
		page.domNode.style.display="none";

		if(!this.selectedPageWidget || this.selectedPage==page.widgetId || page.selected || (this.children.length==0)){
			// Deselect old page and select new one
			// We do this instead of calling selectPage in this case, because other wise other widgets
			// listening for addChild and selectPage can run into a race condition
			if(this.selectedPageWidget){
				this._hidePage(this.selectedPageWidget);
			}
			this.selectedPageWidget = page;
			this._showPage(page);

		} else {
			this._hidePage(page);
		}

		dojo.html.addClass(page.domNode, "selected");

		// publish the addPane event for panes added via addChild(), and the original panes too
		dojo.event.topic.publish(this.widgetId+"-addPane", page);
	},

	removeChild: function(/* Widget */page){
		dojo.widget.PageContainer.superclass.removeChild.apply(this, arguments);

		// this will notify any tablists to remove a button; do this first because it may affect sizing
		dojo.event.topic.publish(this.widgetId+"-removePane", page);

		if (this.selectedPageWidget === page) {
			this.selectedPageWidget = undefined;
			if (this.children.length > 0) {
				this.selectPage(this.children[0], true);
			}
		}
	},

	selectPage: function(/* Widget */ page, /* Boolean */ _noRefresh, /* Widget */ callingWidget){
		// summary
		//	Show the given widget (which must be one of my children)
		page = dojo.widget.byId(page);
		this.correspondingPageButton = callingWidget;

		// Deselect old page and select new one
		if(this.selectedPageWidget){
			this._hidePage(this.selectedPageWidget);
		}
		this.selectedPageWidget = page;
		this._showPage(page, _noRefresh);
		page.isFirstPage = (page == this.children[0]);
		page.isLastPage = (page == this.children[this.children.length-1]);
		dojo.event.topic.publish(this.widgetId+"-selectPane", page);
	},

	nextPage: function(){
		// Summary: advance to next page
		var index = dojo.lang.find(this.children, this.selectedPageWidget);
		this.selectPage(this.children[index+1]);
	},

	previousPage: function(){
		// Summary: go back to previous page
		var index = dojo.lang.find(this.children, this.selectedPageWidget);
		this.selectPage(this.children[index-1]);
	},

	onResized: function(){
		// Summary: called when any page is shown, to make it fit the container correctly
		if(this.doLayout && this.selectedPageWidget){
			with(this.selectedPageWidget.domNode.style){
				top = dojo.html.getPixelValue(this.containerNode, "padding-top", true);
				left = dojo.html.getPixelValue(this.containerNode, "padding-left", true);
			}
			var content = dojo.html.getContentBox(this.containerNode);
			this.selectedPageWidget.resizeTo(content.width, content.height);
		}
	},

	_showPage: function(page, _noRefresh) {
		page.selected=true;

		// size the current page (in case this is the first time it's being shown, or I have been resized)
		this.onResized();

		// make sure we dont refresh onClose and on postCreate
		// speeds up things a bit when using refreshOnShow and fixes #646
		if(_noRefresh && page.refreshOnShow){
			var tmp = page.refreshOnShow;
			page.refreshOnShow = false;
			page.show();
			page.refreshOnShow = tmp;
		}else{
			page.show();
		}
	},

	_hidePage: function(page) {
		page.selected=false;
		page.hide();
	},

	closePage: function(page) {
		// Summary:	callback when user tries to remove page from PageContainer
		var onc = page.extraArgs.onClose || page.extraArgs.onclose;
		var fcn = dojo.lang.isFunction(onc) ? onc : window[onc];
		var remove = dojo.lang.isFunction(fcn) ? fcn(this,page) : true;
		if(remove) {
			this.removeChild(page);
			// makes sure we can clean up executeScripts in ContentPane onUnLoad
			page.destroy();
		}
	},

	destroy: function(){
		dojo.event.topic.destroy(this.widgetId+"-addPane");
		dojo.event.topic.destroy(this.widgetId+"-removePane");
		dojo.event.topic.destroy(this.widgetId+"-selectPane");
		this.inherited("destroy");
	}
});


// PageList - set of buttons to select the page in a page list
// When intialized, the PageList monitors the container, and whenever a pane is
// added or deleted updates itself accordingly.
dojo.widget.defineWidget(
    "dojo.widget.PageList",
    dojo.widget.HtmlWidget,
	{
		templateString: "<span wairole='tablist' dojoAttachEvent='onKey'></span>",
		isContainer: true,

		// String
		//	the id of the page container that I point to
		container: "",

		// String
		//	the name of the button widget to create to correspond to each page
		buttonWidget: "PageButton",

		// String
		//	Class name to apply to the top dom node
		"class": "dojoPageList",

		fillInTemplate: function() {
			dojo.html.addClass(this.domNode, this["class"]);  // "class" is a reserved word in JS
			dojo.widget.wai.setAttr(this.domNode, "waiRole", "role", "tablist");
		},

		postCreate: function(){
			this.pane2button = {};		// mapping from panes to tabs

			// If children have already been added to the page container then create buttons for them
			var container = dojo.widget.byId(this.container);
			if(container){
				dojo.lang.forEach(container.children, this.addButton, this);
			}

			dojo.event.topic.subscribe(this.container+"-addPane", this, "addButton");
			dojo.event.topic.subscribe(this.container+"-removePane", this, "removeButton");
		},

		destroy: function(){
			dojo.event.topic.unsubscribe(this.container+"-addPane", this, "addButton");
			dojo.event.topic.unsubscribe(this.container+"-removePane", this, "removeButton");
			this.inherited("destroy");		
		},

		addButton: function(/* Widget */ pane){
			// summary
			//   Called whenever a pane is added to the container
			//   Create button corresponding to the pane	
			var button = dojo.widget.createWidget(this.buttonWidget,
				{
					container: this.container,
					pane: pane,
					label: pane.label,
					closable: pane.tabCloseButton
				});
			this.addChild(button);
			this.domNode.appendChild(button.domNode);
			this.pane2button[pane]=button;
			pane.tabButton = button;	// this value might be overwritten if two tabs point to same container
		},

		removeButton: function(/* Widget */ pane){
			// summary
			//   Called whenever a pane is removed from the container
			//   Remove the button corresponding to the pane
			this.pane2button[pane].destroy();
			this.pane2button[pane] = null;
		},

		onKey: function(evt){
			// summary:
			//   Handle keystrokes on the page list, for advancing to next/previous button

			if( (evt.keyCode == evt.KEY_RIGHT_ARROW)||
				(evt.keyCode == evt.KEY_LEFT_ARROW) ){
				var current = 0;
				var next = null;	// the next button to focus on
				
				// find currently focused button in children array
				var current = dojo.lang.find(this.children, this._currentPage);
				
				// pick next button to focus on
				if(evt.keyCode == evt.KEY_RIGHT_ARROW){
					next = this.children[ (current+1) % this.children.length ]; 
				}else{ // is LEFT_ARROW
					next = this.children[ (current+ (this.children.length-1)) % this.children.length ];
				}
				
				dojo.event.browser.stopEvent(evt);
				next.onClick();
			}
		}
	}
);

// PageButton (the thing you click to select a page)
// Also has infrastructure to help support close (destroy) button for the given page
dojo.widget.defineWidget("dojo.widget.PageButton", dojo.widget.HtmlWidget,
{
	templateString: "<button dojoAttachEvent='onClick' dojoAttachPoint='titleNode'>${this.label}</button>",

	// String
	//  Name to print on the button
	label: "foo",
	
	// String
	//	the PageContainer id
	container: "",
	
	// Widget
	//	child of the page container corresponding to this label
	pane: null,
	
	// Boolean
	//	true iff we should also print a close icon to destroy corresponding pane
	closable: false,

	postCreate: function(){
		dojo.event.connect(this.pane, "show", this, "onPaneSelect");
		dojo.event.connect(this.pane, "hide", this, "onPaneDeselect");
	},

	onClick: function(){
		// summary
		//  Clicking a button will select the corresponding pane
		this.focus();
		var container = dojo.widget.byId(this.container);
		container.selectPage(this.pane, false, this);
	},

	onCloseButtonMouseOver: function(){
		// summary
		//	The close button changes color a bit when you mouse over	
		dojo.html.addClass(this.closeButtonNode, "closeHover");
	},

	onCloseButtonMouseOut: function(){
		// summary
		// 	Revert close button to normal color on mouse out
		dojo.html.removeClass(this.closeButtonNode, "closeHover");
	},

	onCloseButtonClick: function(evt){
		// summary
		//	Handle clicking the close button for this tab
		var container = dojo.widget.byId(this.container);
		container.closePage(this.pane);
		dojo.event.browser.stopEvent(evt);
	},
	
	onPaneSelect: function(){
		// summary
		//	This is run whenever the pane corresponding to this button is selected
		dojo.html.addClass(this.domNode, "current");
		this.titleNode.setAttribute("tabIndex","0");
	},
	
	onPaneDeselect: function(){
		// summary
		//	This function is run whenever the pane corresponding to this button is deselected (and another pane is shown)
		dojo.html.removeClass(this.domNode, "current");
		this.titleNode.setAttribute("tabIndex","-1");
	},

	destroy: function(){
		// summary
		//	This function is called when the target pane is destroyed or detached from the container
		dojo.event.disconnect(this.pane, "show", this, "onPaneSelected");
		dojo.event.disconnect(this.pane, "hide", this, "onPaneDeselected");
		dojo.widget.PageButton.superclass.destroy.apply(this, arguments);
	},
	
	focus: function(){
		// summary
		//	This will focus on the this button (for accessibility you need to do this when the button is selected)
		this.titleNode.focus();
		this.parent._currentPage = this;
	}
});

// These arguments can be specified for the children of a PageContainer.
// Since any widget can be specified as a PageContainer child, mix them
// into the base widget class.  (This is a hack, but it's effective.)
dojo.lang.extend(dojo.widget.Widget, {
	label: "",
	selected: false,	// is this tab currently selected?
	tabCloseButton: false
});
