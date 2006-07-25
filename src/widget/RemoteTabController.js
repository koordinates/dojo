dojo.provide("dojo.widget.RemoteTabController");

//Summary
//Remote Tab Controller widget.  Can be located independently of a tab
//container and control the selection of its tabs
dojo.require("dojo.widget.*");

dojo.widget.defineWidget(
        "dojo.widget.RemoteTabController",
        dojo.widget.HtmlWidget,
	{

                templateCssPath: dojo.uri.dojoUri("src/widget/templates/RemoteTabControl.css"),

		initializer: function() {
			//summary
			//Initialize Remote Tab Controller
			// for passing in as a parameter
			this.tabContainer = "";

			// the reference to the tab container
			this._tabContainer={};

			//hash of tabs
			this.tabs = {}; 

			this.selectedTab="";

			//override these classes to change the style
			this["class"]="dojoRemoteTabController";
			this.labelClass="dojoRemoteTab";
		},

		postCreate: function() {

			dojo.html.addClass(this.domNode, this["class"]);

			if (this.tabContainer) {
				dojo.addOnLoad(dojo.lang.hitch(this, function() {
					this.setTabContainer(dojo.widget.byId(this.tabContainer));
				}));
			}
		},

		setTabContainer: function(/* dojo.widget.TabContainer */ tabContainer) {
			//summary
			//Connect this Remote Tab Controller to an existing TabContainer
			this._tabContainer = tabContainer;
			this.setupTabs();

			dojo.event.connect(this._tabContainer, "_setupTab", this, "setupTabs");
			dojo.event.connect(this._tabContainer, "selectTab", this, "onTabSelected");
		},

		setupTabs: function() {
			//summary
			//Setup tab buttons for each of the TabContainers tabs

			dojo.html.removeChildren(this.domNode);
			dojo.lang.forEach(this._tabContainer.children, this.addTab, this);
		},

		onTabSelected: function(/* dojo.widget.TabPane */tab) {
			//summary
			//Do this when a tab gets selected
			if (this.selectedTab.tab != tab.widgetId) {
				dojo.html.removeClass(this.selectedTab.button, "current");
			}

			this.selectedTab = this.tabs[tab.widgetId];
			dojo.html.addClass(this.selectedTab.button,"current");

		},

		addTab: function(/* dojo.widget.TabPane */tab) {
			//summary
			//Add a new button 

			// Create label
			div = document.createElement("div");
			dojo.html.addClass(div, this.labelClass);
			var innerDiv = document.createElement("div");

			// need inner span so focus rectangle is drawn properly
			var titleSpan = document.createElement("span");
			titleSpan.innerHTML = tab.label;
			titleSpan.tabIndex="-1";

			// set role on tab title
			dojo.widget.wai.setAttr(titleSpan, "waiRole", "role", "tab");
			innerDiv.appendChild(titleSpan);
			dojo.html.disableSelection(titleSpan);

			div.appendChild(innerDiv);
			div.tabTitle=titleSpan;
			this.domNode.appendChild(div);

			var tabObj = {"tab": tab, "button": div};


			if (this._tabContainer.selectedTab == tab.widgetId || tab.selected) {
				this.selectedTab = tabObj;
				dojo.html.addClass(div, "current");
			}

			this.tabs[tab.widgetId] = tabObj;

			dojo.event.connect(div, "onclick", dojo.lang.hitch(this._tabContainer, function() {
				this.selectTab(tab); 
			}));

			dojo.event.connect(div, "onkeydown", dojo.lang.hitch(this._tabContainer, function(evt) {
				this.tabNavigation(evt, tab); 
			}));
		}

	},
	"html"
);
