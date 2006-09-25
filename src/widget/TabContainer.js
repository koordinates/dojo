dojo.provide("dojo.widget.TabContainer");

dojo.require("dojo.lang.func");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.PageContainer");
dojo.require("dojo.event.*");
dojo.require("dojo.html.selection");
dojo.require("dojo.widget.html.layout");

// A TabContainer is a container that has multiple panes, but shows only
// one pane at a time.  There are a set of tabs corresponding to each pane,
// where each tab has the title (aka label) of the pane, and optionally a close button.
//
// Publishes topics <widgetId>-addPane, <widgetId>-removePane, and <widgetId>-selectPane
dojo.widget.defineWidget("dojo.widget.TabContainer", dojo.widget.PageContainer, {

	// String
	//   Defines where tab labels go relative to tab content.
	//   "top", "bottom", "left-h", "right-h"
	labelPosition: "top",
	
	// String
	//   If closebutton=="tab", then every tab gets a close button.
	//   But this is deprecated.  Should just say tabCloseButton=true on each
	//   pane you want to be closable.
	closeButton: "none",

	templateString: null,	// override setting in PageContainer
	templatePath: dojo.uri.dojoUri("src/widget/templates/TabContainer.html"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/TabContainer.css"),

	// String
	//	initially selected tab (widgetId)
	selectedTab: "",

	fillInTemplate: function() {
		// create the tab list that will have a tab (a.k.a. tab button) for each tab panel
		this.tablist = dojo.widget.createWidget("TabController",
			{
				id: this.widgetId + "_tablist",
				labelPosition: this.labelPosition,
				doLayout: this.doLayout,
				containerId: this.widgetId
			}, this.tablistNode);
		dojo.widget.TabContainer.superclass.fillInTemplate.apply(this, arguments);
	},

	_setupPage: function(tab){
		if(this.closeButton=="tab" || this.closeButton=="pane"){
			tab.tabCloseButton=true;
		}
		dojo.html.addClass(tab.domNode, "dojoTabPane");
		dojo.widget.TabContainer.superclass._setupPage.apply(this, arguments);
	},

	onResized: function(){
		// Summary: Configure the content pane to take up all the space except for where the tabs are
		if(!this.doLayout){ return; }

		// position the labels and the container node
		var labelAlign=this.labelPosition.replace(/-h/,"");
		var children = [
			{domNode: this.tablist.domNode, layoutAlign: labelAlign},
			{domNode: this.containerNode, layoutAlign: "client"}
		];
		dojo.widget.html.layout(this.domNode, children);
		
		dojo.widget.TabContainer.superclass.onResized.apply(this, arguments);
	},

	selectTab: function(tab, _noRefresh, callingWidget){
		this.selectPage(tab, _noRefresh, callingWidget);
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

	destroy: function(){
		this.tabList.destroy();
		dojo.widget.TabContainer.superclass.destroy.apply(this, arguments);
	}
});

// TabController - set of tabs (the things with labels and a close button, that you click to show a tab panel)
// When intialized, the TabController monitors the TabContainer, and whenever a pane is
// added or deleted updates itself accordingly.
dojo.widget.defineWidget(
    "dojo.widget.TabController",
    dojo.widget.PageController,
	{
		templateString: "<div wairole='tablist' dojoAttachEvent='onKey'></div>",

		// String
		//   Defines where tab labels go relative to tab content.
		//   "top", "bottom", "left-h", "right-h"
		labelPosition: "top",

		doLayout: true,

		// String
		//	Class name to apply to the top dom node
		"class": "",

		// String
		//	the name of the tab widget to create to correspond to each page
		buttonWidget: "TabButton",

		postMixInProperties: function() {
			if(!this["class"]){
				this["class"] = "dojoTabLabels-" + this.labelPosition + (this.doLayout ? "" : " dojoTabNoLayout");
			}
			dojo.widget.TabController.superclass.postMixInProperties.apply(this, arguments);
		}
	}
);

// TabButton (the thing you click to select a pane)
// Contains the title (aka label) of the pane, and optionally a close-button to destroy the pane

dojo.widget.defineWidget("dojo.widget.TabButton", dojo.widget.PageButton,
{
	templateString: "<div class='dojoTab' dojoAttachEvent='onClick'>"
						+"<div dojoAttachPoint='innerDiv'>"
							+"<span dojoAttachPoint='titleNode' tabIndex='-1' waiRole='tab'>${this.label}</span>"
							+"<span dojoAttachPoint='closeButtonNode' class='close closeImage' style='${this.closeButtonStyle}'"
							+"    dojoAttachEvent='onMouseOver:onCloseButtonMouseOver; onMouseOut:onCloseButtonMouseOut; onClick:onCloseButtonClick'></span>"
						+"</div>"
					+"</div>",

	postMixInProperties: function(){
		this.closeButtonStyle = this.closable ? "" : "display: none";
		dojo.widget.TabContainer.superclass.postMixInProperties.apply(this, arguments);
	},

	fillInTemplate: function(){
		dojo.html.disableSelection(this.titleNode);
		dojo.widget.TabContainer.superclass.fillInTemplate.apply(this, arguments);
	}
});


// Tab for display in high-contrast mode (where background images don't show up)
dojo.widget.defineWidget(
	"dojo.widget.a11y.TabButton",
	dojo.widget.TabButton,
	{
		imgPath: dojo.uri.dojoUri("src/widget/templates/images/tab_close.gif"),
		
		templateString: "<div class='dojoTab' dojoAttachEvent='onClick;onKey'>"
							+"<div dojoAttachPoint='innerDiv'>"
								+"<span dojoAttachPoint='titleNode' tabIndex='-1' waiRole='tab'>${this.label}</span>"
								+"<img class='close' src='${this.imgPath}' alt='[x]' style='${this.closeButtonStyle}'"
								+"    dojoAttachEvent='onClick:onCloseButtonClick'>"
							+"</div>"
						+"</div>"
	}
);


