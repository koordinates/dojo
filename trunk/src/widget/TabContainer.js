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
dojo.widget.defineWidget("dojo.widget.TabContainer", dojo.widget.HtmlWidget, {
	isContainer: true,

	// Constructor arguments
	labelPosition: "top",
	closeButton: "none",

	useVisibility: false,		// true-->use visibility:hidden instead of display:none
	
	// if false, TabContainers size changes according to size of currently selected tab
	doLayout: true,

	templatePath: dojo.uri.dojoUri("src/widget/templates/TabContainer.html"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/TabContainer.css"),

	selectedTab: "",		// initially selected tab (widgetId)

	fillInTemplate: function(args, frag) {
		// Copy style info from input node to output node
		var source = this.getFragNodeRef(frag);
		dojo.html.copyStyle(this.domNode, source);

		dojo.widget.TabContainer.superclass.fillInTemplate.call(this, args, frag);
	},

	postCreate: function(args, frag) {
		// Load all the tabs, creating a label for each one
		for(var i=0; i<this.children.length; i++){
			this._setupTab(this.children[i]);
		}

		if (this.closeButton=="pane") {
			var img = this._setupCloseButton("pane");
			this.tablist.appendChild(img);
			dojo.event.connect(img, "onclick", dojo.lang.hitch(this, 
					function(){ this._runOnCloseTab(this.selectedTabWidget); }
				)
			);
		}

		if(!this.doLayout){
			dojo.html.addClass(this.tablist, "dojoTabNoLayout");
			if (this.labelPosition == 'bottom') {
				var p = this.tablist.parentNode;
				p.removeChild(this.tablist);
				p.appendChild(this.tablist);
			}
		}
		
		// TODO: tablist should be separated out into a separate widget, shared w/RemoteTabController
		dojo.html.addClass(this.tablist, "dojoTabLabels-"+this.labelPosition);

		this._doSizing();

		// Display the selected tab
		if(this.selectedTabWidget){
			this.selectTab(this.selectedTabWidget, true);
		}
	},

	addChild: function(child, overrideContainerNode, pos, ref, insertIndex){
		// FIXME need connect to tab Destroy, so call removeChild properly.
		this._setupTab(child);
		dojo.widget.TabContainer.superclass.addChild.call(this,child, overrideContainerNode, pos, ref, insertIndex);

		// in case the tab labels have overflowed from one line to two lines
		this._doSizing();
	},

	_setupTab: function(tab){
		tab.domNode.style.display="none";

		// Create the tab itself (the thing with the title (aka label) and the close button)
		tab.tabButton = dojo.widget.createWidget("TabButton", 
				{
					container: this,
					pane: tab,
					label: tab.label,
					closable: this.closeButton=="tab" || tab.tabCloseButton
				});
		this.tablist.appendChild(tab.tabButton.domNode);

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
	},

	// Configure the content pane to take up all the space except for where the tabs are
	_doSizing: function(){
		if(!this.doLayout){ return; }

		// position the labels and the container node
		var labelAlign=this.labelPosition.replace(/-h/,"");
		var children = [
			{domNode: this.tablist, layoutAlign: labelAlign},
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
		// remove tab label
		tab.tabButton.destroy();

		dojo.widget.TabContainer.superclass.removeChild.call(this, tab);

		dojo.html.removeClass(tab.domNode, "dojoTabPane");

		if (this.selectedTabWidget === tab) {
			this.selectedTabWidget = undefined;
			if (this.children.length > 0) {
				this.selectTab(this.children[0], true);
			}
		}

		// in case the tab labels have overflowed from one line to two lines
		this._doSizing();
	},

	selectTab: function(tab, _noRefresh){
		// Deselect old tab and select new one
		if(this.selectedTabWidget){
			this._hideTab(this.selectedTabWidget);
		}
		this.selectedTabWidget = tab;
		this._showTab(tab, _noRefresh);
	},

	// TODO: this gets removed after I have it in the template itself
	_setupCloseButton: function(type){
		var prefix = "";
		var elemType = "div";
		if (type == "pane"){
			prefix = "dojoTabPanePane";
		}else if (type == "tab"){
			elemType = "span";
			prefix = "dojoTabPaneTab";
		}
		//else bad type - create a div but styles will be invalid
		var div = document.createElement(elemType);
		dojo.html.addClass(div, prefix + "Close " + prefix + "CloseImage");
		dojo.event.connect(div, "onmouseover", function(){ dojo.html.addClass(div, prefix + "CloseHover"); });
		dojo.event.connect(div, "onmouseout", function(){ dojo.html.removeClass(div, prefix + "CloseHover"); });
		
		return div;
	},

	// Handle keystrokes on the tab, for advancing to next/previous tab
	tabNavigation: function(evt, tab){
		if( (evt.keyCode == evt.KEY_RIGHT_ARROW)||
			(evt.keyCode == evt.KEY_LEFT_ARROW) ){
			var current = null;
			var next = null;
			for(var i=0; i < this.children.length; i++){
				if(this.children[i] == tab){
					current = i; 
					break;
				}
			}
			if(evt.keyCode == evt.KEY_RIGHT_ARROW){
				next = this.children[ (current+1) % this.children.length ]; 
			}else{ // is LEFT_ARROW
				next = this.children[ (current+ (this.children.length-1)) % this.children.length ];
			}
			this.selectTab(next);
			dojo.event.browser.stopEvent(evt);
			//next.div.titleNode.focus();	// TODO!!!
		} 
	
	},

	// Keystroke handling for keystrokes on the tab pane itself (that were bubbled up to me)
	// Ctrl-up: focus is returned from the pane to the tab button
	// Alt-del: close tab
	// TODO: this doesn't work w/remote buttons
	keyDown: function(e){ 
		if(e.keyCode == e.KEY_UP_ARROW && e.ctrlKey){
			// set focus to current tab
			this.selectTab(this.selectedTabWidget);
			dojo.event.browser.stopEvent(e);
			// this.selectedTabWidget.div.titleNode.focus();		// TODO!!!
		}else if(e.keyCode == e.KEY_DELETE && e.altKey){
			if (this.closeButton == "tab" || this.closeButton == "pane" || this.selectedTabWidget.tabCloseButton){
				this._runOnCloseTab(this.selectedTabWidget);
				dojo.event.browser.stopEvent(e);
			}
		}
	},

	_showTab: function(tab, _noRefresh) {
		tab.selected=true;
		if ( this.useVisibility && !dojo.render.html.ie){
			tab.domNode.style.visibility="visible";
		}else{
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

dojo.widget.defineWidget(
	"dojo.widget.a11y.TabContainer",
	dojo.widget.TabContainer,
	{
		templateCssPath: dojo.uri.dojoUri("src/widget/templates/TabContainerA11y.css"),
		imgPath: dojo.uri.dojoUri("src/widget/templates/images/tab_close.gif"),
		
		_setupCloseButton: function(type){ 
			var typeClass="";
			if (type == "pane"){
				typeClass = "dojoTabPanePaneClose";
			}else if(type == "tab"){
				typeClass = "dojoTabPaneTabClose";
			}
			var img = document.createElement("img");
			dojo.html.addClass(img, typeClass);
			img.src = this.imgPath;
			img.alt = "[x]";
						
			return img;
		}
	}
);

// Tab (the thing you click to select a pane)
// Contains the title (aka label) of the pane, and optionally a close-button to destroy the pane
// TODO: make accessibility version

dojo.widget.defineWidget("dojo.widget.TabButton", dojo.widget.HtmlWidget,
{
	templateString: "<div class='dojoTabPaneTab' dojoAttachEvent='onClick;onKey'>"
						+"<div dojoAttachPoint='innerDiv'>"
							+"<span dojoAttachPoint='titleNode' tabIndex='-1' waiRole='tab'>${this.label}</span>"
							+"<span dojoAttachPoint='closeButtonNode' class='dojoTabPaneTabClose dojoTabPaneTabCloseImage' style='${this.closeButtonStyle}'"
							+"    dojoAttachEvent='onMouseOver:onCloseButtonMouseOver; onMouseOut:onCloseButtonMouseOut; onClick:onCloseButtonClick'></span>"
						+"</div>"
					+"</div>",

	// parameters
	label: "",			// text string for the label
	container: null,	// the tab container
	pane: null,		// child of the tab container corresponding to this label
	closable: false,

	postMixInProperties: function(){
		this.closeButtonStyle = this.closable ? "" : "display: none";
	},

	fillInTemplate: function(){
		dojo.html.disableSelection(this.titleNode);
	},

	postCreate: function(){
		dojo.event.connect(this.pane, "show", this, "onPaneSelect");
		dojo.event.connect(this.pane, "hide", this, "onPaneDeselect");
		dojo.event.connect(this.container, "removeChild", this, "onRemoveChild");
		dojo.event.connect("before", this.pane, "destroy", this, "destroy");
	},

	// Clicking a tab button will select the corresponding pane
	onClick: function(){
		this.container.selectTab(this.pane);
	},

	// Handle left/right arrow keys (to move to previous/next tab)
	onKey: function(evt){
		this.container.tabNavigation(evt, this.pane);
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
		this.container._runOnCloseTab(this.pane);
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

	// This function is called when a pane is removed (ie, detached) from the Tabcontainer.
	// In this case all buttons connected to that tab should be destroyed
	onRemoveChild: function(pane){
		if(pane==this.pane){
			this.destroy();
		}
	},

	// This function is called when the target pane is destroyed or detached from the TabContainer
	destroy: function(){
		dojo.event.disconnect(this.pane, "show", this, "onPaneSelected");
		dojo.event.disconnect(this.pane, "hide", this, "onPaneDeselected");
		dojo.event.disconnect(this.container, "removeChild", this, "onRemoveChild");
		dojo.event.disconnect("before", this.pane, "destroy", this, "destroy");

		this.inherited("destroy");
	},
	
	// This will focus on the this tab label (for accessibility you need to do this when the tab is selected)
	focus: function(){
		this.titleNode.focus();
	}
});

// TabList - set of Tabs
dojo.widget.defineWidget(
    "dojo.widget.TabList",
    dojo.widget.HtmlWidget,
	{
		templateString: '<div wairole="tablist"></div>',

		fillInTemplate: function() {
			dojo.widget.wai.setAttr(this.domNode, "waiRole", "role", "tablist");
		}
	}
);
