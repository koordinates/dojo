dojo.provide("dijit.layout.TabContainer");

dojo.require("dijit.layout._TabContainerBase");
dojo.require("dijit.layout.TabController");
dojo.require("dijit.layout.ScrollingTabController");

dojo.declare("dijit.layout.TabContainer",
	[dijit.layout._TabContainerBase],
	{
		// summary:
		//		A Container with tabs to select each child (only one of which is displayed at a time).
		// description:
		//		A TabContainer is a container that has multiple panes, but shows only
		//		one pane at a time.  There are a set of tabs corresponding to each pane,
		//		where each tab has the name (aka title) of the pane, and optionally a close button.
	
		// useMenu: [const] Boolean
		//		True if a menu should be used to select tabs when they are too
		//		wide to fit the TabContainer, false otherwise.
		useMenu: true,
	
		// useSlider: [const] Boolean
		//		True if a slider should be used to select tabs when they are too
		//		wide to fit the TabContainer, false otherwise.
		useSlider: true,
	
		// _controllerWidget: String
		//		An optional parameter to overrider the default TabContainer controller used.
		_controllerWidget: null,
	
		_makeController: function(/*DomNode*/ srcNode){
			// summary:
			//		Instantiate tablist controller widget and return reference to it.
			//		Callback from _TabContainerBase.postCreate().
			// tags:
			//		protected extension

			var cls = this.baseClass + "-tabs" + (this.doLayout ? "" : " dijitTabNoLayout"),
				TabController = dojo.getObject(this._controllerWidget);

			return new TabController({
				id: this.id + "_tablist",
				tabPosition: this.tabPosition,
				doLayout: this.doLayout,
				containerId: this.id,
				"class": cls,
				nested: this.nested,
				useMenu: this.useMenu,
				useSlider: this.useSlider,
				tabStripClass: this.tabStrip ? this.baseClass + (this.tabStrip ? "":"No") + "Strip": null
			}, srcNode);
		},

		postMixInProperties: function(){
			this.inherited(arguments);
	
			// Scrolling controller only works for horizontal non-nested tabs
			if(!this._controllerWidget){
				this._controllerWidget = (this.tabPosition == "top" || this.tabPosition == "bottom") && !this.nested ?
							"dijit.layout.ScrollingTabController" : "dijit.layout.TabController";
			}
		}
});

