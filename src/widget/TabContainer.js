dojo.provide("dojo.widget.TabContainer");

dojo.require("dojo.lang.func");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.event.*");
dojo.require("dojo.html.selection");
dojo.require("dojo.widget.html.layout");

// A TabContainer is a container that has multiple panes, but shows only
// one pane at a time.  There are a set of tabs corresponding to each pane,
// where each tab has the title (aka label) of the pane, and optionally a close button.
//
// Publishes topics <widgetId>-addPane, <widgetId>-removePane, and <widgetId>-selectPane
// TODO: split off tabpanel into a separate widget
dojo.widget.defineWidget("dojo.widget.TabContainer", dojo.widget.HtmlWidget, {
	isContainer: true,
	//enableSubWidgets: true,

	// Constructor arguments
	labelPosition: "top",
	closeButton: "none",

	// if false, TabContainers size changes according to size of currently selected tab
	doLayout: true,

	templatePath: dojo.uri.dojoUri("src/widget/templates/TabContainer.html"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/TabContainer.css"),

	selectedTab: "",		// initially selected tab (widgetId)

	fillInTemplate: function(args, frag) {
		// Copy style info from input node to output node
		var source = this.getFragNodeRef(frag);
		dojo.html.copyStyle(this.domNode, source);

		// create the tab list that will have a tab (ie, a button) for each tab panel
		this.tablist = dojo.widget.createWidget("TabList",
			{
				id: this.widgetId + "_tablist",
				labelPosition: this.labelPosition,
				doLayout: this.doLayout,
				tabContainer: this.widgetId
			}, this.tablistNode);
		dojo.widget.TabContainer.superclass.fillInTemplate.call(this, args, frag);
	},

	postCreate: function(args, frag) {
		// Setup each tab panel
		dojo.lang.forEach(this.children, this._setupTab, this);

		this._doSizing();

		// Display the selected tab
		if(this.selectedTabWidget){
			this.selectTab(this.selectedTabWidget, true);
		}
	},

	addChild: function(child, overrideContainerNode, pos, ref, insertIndex){
		this._setupTab(child);
		dojo.widget.TabContainer.superclass.addChild.call(this,child, overrideContainerNode, pos, ref, insertIndex);

		// in case the tab labels have overflowed from one line to two lines
		this._doSizing();
	},

	_setupTab: function(tab){
		// summary
		//   Add the given pane to this tab container
		tab.domNode.style.display="none";

		if(this.closeButton=="tab" || this.closeButton=="pane"){
			tab.tabCloseButton=true;
		}

		if(!this.selectedTabWidget || this.selectedTab==tab.widgetId || tab.selected || (this.children.length==0)){
			// Deselect old tab and select new one
			// We do this instead of calling selectTab in this case, because other wise other widgets
			// listening for addChild and selectTab can run into a race condition
			if(this.selectedTabWidget){
				this._hideTab(this.selectedTabWidget);
			}
			this.selectedTabWidget = tab;
			this._showTab(tab);

		} else {
			this._hideTab(tab);
		}

		dojo.html.addClass(tab.domNode, "dojoTabPane");

		if(this.doLayout){
			with(tab.domNode.style){
				top = dojo.html.getPixelValue(this.containerNode, "padding-top", true);
				left = dojo.html.getPixelValue(this.containerNode, "padding-left", true);
			}
		}

		// publish the addPane event for panes added via addChild(), and the original panes too
		dojo.event.topic.publish(this.widgetId+"-addPane", tab);
	},

	// Configure the content pane to take up all the space except for where the tabs are
	_doSizing: function(){
		if(!this.doLayout){ return; }

		// position the labels and the container node
		var labelAlign=this.labelPosition.replace(/-h/,"");
		var children = [
			{domNode: this.tablist.domNode, layoutAlign: labelAlign},
			{domNode: this.containerNode, layoutAlign: "client"}
		];

		dojo.widget.html.layout(this.domNode, children);

		// size the current tab
		// TODO: should have ptr to current tab rather than searching
		var content = dojo.html.getContentBox(this.containerNode);
		dojo.lang.forEach(this.children, function(child){
			if(child.selected){
				child.resizeTo(content.width, content.height);
			}
		});
	},

	removeChild: function(tab){
		dojo.widget.TabContainer.superclass.removeChild.call(this, tab);

		dojo.html.removeClass(tab.domNode, "dojoTabPane");

		if (this.selectedTabWidget === tab) {
			this.selectedTabWidget = undefined;
			if (this.children.length > 0) {
				this.selectTab(this.children[0], true);
			}
		}

		// remove buttons corresponding to this pane (may cause resize of tablist, so
		// do this before the call to doSizing()
		dojo.event.topic.publish(this.widgetId+"-removePane", tab);

		// in case the tab labels have overflowed from one line to two lines
		this._doSizing();
	},

	selectTab: function(tab, _noRefresh, callingWidget){
		this.correspondingTabButton = callingWidget;

		// Deselect old tab and select new one
		if(this.selectedTabWidget){
			this._hideTab(this.selectedTabWidget);
		}
		this.selectedTabWidget = tab;
		this._showTab(tab, _noRefresh);
		
		dojo.event.topic.publish(this.widgetId+"-selectPane", tab);
	},

	// Keystroke handling for keystrokes on the tab panel itself (that were bubbled up to me)
	// Ctrl-up: focus is returned from the pane to the tab button
	// Alt-del: close tab
	onKey: function(e){ 
		if(e.keyCode == e.KEY_UP_ARROW && e.ctrlKey){
			// set focus to current tab
			var button = this.correspondingTabButton || this.selectedTabWidget.tabButton;
			button.focus();
			dojo.event.browser.stopEvent(e);
		}else if(e.keyCode == e.KEY_DELETE && e.altKey){
			if (this.closeButton == "tab" || this.closeButton == "pane" || this.selectedTabWidget.tabCloseButton){
				this._runOnCloseTab(this.selectedTabWidget);
				dojo.event.browser.stopEvent(e);
			}
		}
	},

	_showTab: function(tab, _noRefresh) {
		tab.selected=true;
		// make sure we dont refresh onClose and on postCreate
		// speeds up things a bit when using refreshOnShow and fixes #646
		if(_noRefresh && tab.refreshOnShow){
			var tmp = tab.refreshOnShow;
			tab.refreshOnShow = false;
			tab.show();
			tab.refreshOnShow = tmp;
		}else{
			tab.show();
		}

		if(this.doLayout){
			var content = dojo.html.getContentBox(this.containerNode);
			tab.resizeTo(content.width, content.height);
		}
	},

	_hideTab: function(tab) {
		tab.selected=false;
		if( this.useVisibility ){
			tab.domNode.style.visibility="hidden";
		}else{
			tab.hide();
		}
	},

	_runOnCloseTab: function(tab) {
		var onc = tab.extraArgs.onClose || tab.extraArgs.onclose;
		var fcn = dojo.lang.isFunction(onc) ? onc : window[onc];
		var remove = dojo.lang.isFunction(fcn) ? fcn(this,tab) : true;
		if(remove) {
			this.removeChild(tab);
			// makes sure we can clean up executeScripts in ContentPane onUnLoad
			tab.destroy();
		}
	},

	onResized: function() {
		this._doSizing();
	},
	
	destroy: function(){
		dojo.event.topic.destroy(this.widgetId+"-addPane");
		dojo.event.topic.destroy(this.widgetId+"-removePane");
		dojo.event.topic.destroy(this.widgetId+"-selectPane");
		this.tabList.destroy();
		this.inherited("destroy");
	}
});


// These arguments can be specified for the children of a TabContainer.
// Since any widget can be specified as a TabContainer child, mix them
// into the base widget class.  (This is a hack, but it's effective.)
dojo.lang.extend(dojo.widget.Widget, {
	label: "",
	selected: false,	// is this tab currently selected?
	tabCloseButton: false
});

// Tab (the thing you click to select a pane)
// Contains the title (aka label) of the pane, and optionally a close-button to destroy the pane

dojo.widget.defineWidget("dojo.widget.TabButton", dojo.widget.HtmlWidget,
{
	templateString: "<div class='dojoTabPaneTab' dojoAttachEvent='onClick'>"
						+"<div dojoAttachPoint='innerDiv'>"
							+"<span dojoAttachPoint='titleNode' tabIndex='-1' waiRole='tab'>${this.label}</span>"
							+"<span dojoAttachPoint='closeButtonNode' class='dojoTabPaneTabClose dojoTabPaneTabCloseImage' style='${this.closeButtonStyle}'"
							+"    dojoAttachEvent='onMouseOver:onCloseButtonMouseOver; onMouseOut:onCloseButtonMouseOut; onClick:onCloseButtonClick'></span>"
						+"</div>"
					+"</div>",

	// parameters
	label: "",			// text string for the label
	tabContainer: "",	// the tab container id
	pane: null,		// child of the tab container corresponding to this label
	closable: false,

	postMixInProperties: function(){
		this.tabContainer = dojo.widget.byId(this.tabContainer);
		this.closeButtonStyle = this.closable ? "" : "display: none";
	},

	fillInTemplate: function(){
		dojo.html.disableSelection(this.titleNode);
	},

	postCreate: function(){
		dojo.event.connect(this.pane, "show", this, "onPaneSelect");
		dojo.event.connect(this.pane, "hide", this, "onPaneDeselect");
	},

	// Clicking a tab button will select the corresponding pane
	onClick: function(){
		this.focus();
		this.tabContainer.selectTab(this.pane, false, this);
	},

	// The close button changes color a bit when you mouse over	
	onCloseButtonMouseOver: function(){
		dojo.html.addClass(this.closeButtonNode, "dojoTabPaneTabCloseHover");
	},

	// Revert close button to normal color on mouse out
	onCloseButtonMouseOut: function(){
		dojo.html.removeClass(this.closeButtonNode, "dojoTabPaneTabCloseHover");
	},

	// Handle clicking the close button for this tab
	onCloseButtonClick: function(evt){
		this.tabContainer._runOnCloseTab(this.pane);
		dojo.event.browser.stopEvent(evt);
	},
	
	// This is run whenever the pane corresponding to this button is selected
	onPaneSelect: function(){
		dojo.html.addClass(this.domNode, "current");
		this.titleNode.setAttribute("tabIndex","0");
	},
	
	// This function is run whenever the pane corresponding to this button is deselected (and another pane is shown)
	onPaneDeselect: function(){
		dojo.html.removeClass(this.domNode, "current");
		this.titleNode.setAttribute("tabIndex","-1");
	},

	// This function is called when the target pane is destroyed or detached from the TabContainer
	destroy: function(){
		dojo.event.disconnect(this.pane, "show", this, "onPaneSelected");
		dojo.event.disconnect(this.pane, "hide", this, "onPaneDeselected");
		this.inherited("destroy");
	},
	
	// This will focus on the this tab label (for accessibility you need to do this when the tab is selected)
	focus: function(){
		this.titleNode.focus();
		this.parent._currentTab = this;
	}
});


// Tab for display in high-contrast mode (where background images don't show up)
dojo.widget.defineWidget(
	"dojo.widget.a11y.TabButton",
	dojo.widget.TabButton,
	{
		imgPath: dojo.uri.dojoUri("src/widget/templates/images/tab_close.gif"),
		
		templateString: "<div class='dojoTabPaneTab' dojoAttachEvent='onClick;onKey'>"
							+"<div dojoAttachPoint='innerDiv'>"
								+"<span dojoAttachPoint='titleNode' tabIndex='-1' waiRole='tab'>${this.label}</span>"
								+"<img class='dojoTabPaneTabClose' src='${this.imgPath}' alt='[x]' style='${this.closeButtonStyle}'"
								+"    dojoAttachEvent='onClick:onCloseButtonClick'>"
							+"</div>"
						+"</div>"
	}
);



// TabList - set of tabs (the things with labels and a close button, that you click to show a tab panel)
// When intialized, the TabList monitors the TabContainer, and whenever a pane is
// added or deleted updates itself accordingly.
dojo.widget.defineWidget(
    "dojo.widget.TabList",
    dojo.widget.HtmlWidget,
	{
		templateString: "<div wairole='tablist' class='dojoTabLabels-${this.labelPosition}' dojoAttachEvent='onKey'></div>",
		isContainer: true,
		_currentTab: null,

		// parameters
		labelPosition: "top",
		doLayout: true,
		tabContainer: "",			// the id of the tab container that I point to

		fillInTemplate: function() {
			dojo.widget.wai.setAttr(this.domNode, "waiRole", "role", "tablist");
			if(!this.doLayout){ dojo.html.addClass(this.domNode, "dojoTabNoLayout"); }
		},

		postCreate: function(){
			this.pane2tab = {};		// mapping from panes to tabs

			// If children have already been added to the tab container then create buttons for them
			var container = dojo.widget.byId(this.tabContainer);
			if(container){
				dojo.lang.forEach(container.children, this.addTab, this);
			}

			dojo.event.topic.subscribe(this.tabContainer+"-addPane", this, "addTab");
			dojo.event.topic.subscribe(this.tabContainer+"-removePane", this, "removeTab");
		},

		destroy: function(){
			dojo.event.topic.unsubscribe(this.tabContainer+"-addPane", this, "addTab");
			dojo.event.topic.unsubscribe(this.tabContainer+"-removePane", this, "removeTab");
			this.inherited("destroy");		
		},

		addTab: function(/* dojo.widget.TabPane */ pane){
			// summary
			//   Called whenever a pane is added to the TabContainer
			//   Create the tab (the thing with the title (aka label) and the close button) corresponding to the pane
			var tab = dojo.widget.createWidget("TabButton", 
				{
					tabContainer: this.tabContainer,
					pane: pane,
					label: pane.label,
					closable: pane.tabCloseButton
				});
			this.addChild(tab);
			this.domNode.appendChild(tab.domNode);
			this.pane2tab[pane]=tab;
			pane.tabButton = tab;	// this value might be overwritten if two tabs point to same TabContainer
		},

		removeTab: function(/* dojo.widget.TabPane */ pane){
			// summary
			//   Called whenever a pane is removed from the TabContainer
			//   Remove the tab (the thing with the title (aka label) and the close button) corresponding to the pane
			this.pane2tab[pane].destroy();
			this.pane2tab[pane] = null;
		},

		onKey: function(evt){
			// summary:
			//   Handle keystrokes on the tablist, for advancing to next/previous tab

			if( (evt.keyCode == evt.KEY_RIGHT_ARROW)||
				(evt.keyCode == evt.KEY_LEFT_ARROW) ){
				var current = 0;
				var next = null;	// the next tab to focus on
				
				// find currently focused tab in children array
				for(var i=0; i < this.children.length; i++){
					if(this.children[i] == this._currentTab){
						current = i; 
						break;
					}
				}
				
				// pick next tab to focus on
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
