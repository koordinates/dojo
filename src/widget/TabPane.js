dojo.provide("dojo.widget.TabPane");
dojo.provide("dojo.widget.html.TabPane");
dojo.provide("dojo.widget.Tab");

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.event.*");
dojo.require("dojo.html");
dojo.require("dojo.style");

//////////////////////////////////////////
// TabPane -- a set of Tabs
//////////////////////////////////////////
dojo.widget.html.TabPane = function() {
	dojo.widget.HtmlWidget.call(this);
}

dojo.inherits(dojo.widget.html.TabPane, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.TabPane, {
	widgetType: "TabPane",
    isContainer: true,

	// Constructor arguments
	labelPosition: "top",
	useVisibility: false,		// true-->use visibility:hidden instead of display:none

	templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlTabPane.html"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlTabPane.css"),

	selectedTab: "",		// initially selected tab (widgetId)

	fillInTemplate: function(args, frag) {
		// Copy style info and id from input node to output node
		var source = this.getFragNodeRef(frag);
		this.domNode.style.cssText = source.style.cssText;
		dojo.html.addClass(this.domNode, dojo.html.getClass(source));
		dojo.widget.html.TabPane.superclass.fillInTemplate.call(this, args, frag);
	},

	postCreate: function(args, frag) {
		// Load all the tabs, creating a label for each one
		for(var i=0; i<this.children.length; i++){
			this._setupTab(this.children[i]);
		}

		dojo.html.addClass(this.dojoTabLabels, "dojoTabLabels-"+this.labelPosition);
        this._setPadding();
		this._Resized();
	},

	addChild: function(child, overrideContainerNode, pos, ref, insertIndex){
		this._setupTab(child);
		dojo.widget.html.TabPane.superclass.addChild.call(this,child, overrideContainerNode, pos, ref, insertIndex);

		// in case the tab labels have overflowed from one line to two lines
		this._setPadding();
	},

	_setupTab: function(tab){
		tab.domNode.style.display="none";

		// Create label
		tab.div = document.createElement("div");
		dojo.html.addClass(tab.div, "dojoTabPaneTab");
		var span = document.createElement("span");
		span.innerHTML = tab.label;
		dojo.html.disableSelection(span);
		tab.div.appendChild(span);
		this.dojoTabLabels.appendChild(tab.div);
		
		var self = this;
		dojo.event.connect(tab.div, "onclick", function(){ self.selectTab(tab); });
		
		if(!this.selectedTabWidget || this.selectedTab==tab.widgetId || tab.selected){
    		this.selectedTabWidget = tab;
//            this.selectTab(tab);
        } else {
            this._hideTab(tab);
        }
	},

	// Configure the content pane to take up all the space except for where the tab labels are
	_setPadding: function(){
		var t=dojo.style.getOuterHeight(this.dojoTabLabels);
		var w=dojo.style.getInnerWidth(this.dojoTabLabels);
		var c=dojo.style.getOuterHeight(this.containerNode);
		if(t==0 || c==0){
			// browser needs more time to compute sizes (maybe CSS hasn't downloaded yet)
			dojo.lang.setTimeout(this, this._setPadding, 10);
			return;
		}
		with(this.domNode.style){
			switch (this.labelPosition) {
				case 'top': 
					paddingTop=t+"px";
					break;
				case 'bottom':
					paddingBottom=t+"px";
					break;
				case 'left':
					paddingLeft=w+"px";
					break;
				case 'right':
					paddingRight=w+"px";
					break;
				case 'left-h':
					paddingLeft=w+"px";
					break;
				case 'right-h':
					paddingRight=w+"px";
					break;
			}
		}
	},

    removeChild: function(tab) {
        dojo.widget.html.TabPane.superclass.removeChild.call(this, tab);

        dojo.html.removeClass(tab.domNode, "dojoTabPanel");
        this.ul.removeChild(tab.div);
        delete(tab.div);

        // FIXME: do we need to disconnect event handler?

        if (this.selectedTabWidget === tab) {
            this.selectedTabWidget = undefined;
            if (this.children.length > 0) {
                this.selectTab(this.children[0]);
            }
        }

		// in case the tab labels have overflowed from one line to two lines
		this._setPadding();
    },

    selectTab: function(tab) {
		// Deselect old tab and select new one
		if (this.selectedTabWidget) {
			this._hideTab(this.selectedTabWidget);
		}
		this.selectedTabWidget = tab;
		this._showTab(tab);
		dojo.widget.html.TabPane.superclass.onResized.call(this);
	},
	
	_showTab: function(tab) {
		dojo.html.addClass(tab.div, "current");
		tab.selected=true;
		if ( this.useVisibility && !dojo.render.html.ie ) {
			tab.domNode.style.visibility="visible";
		} else {
			tab.show();
		}
	},

	_hideTab: function(tab) {
		dojo.html.removeClass(tab.div, "current");
		tab.selected=false;
		if( this.useVisibility ){
			tab.domNode.style.visibility="hidden";
		}else{
			tab.hide();
		}
	},

	// TODO: why is this a separate function?  (also, name is weird)
	_Resized: function() {
		// Display the selected tab
		if(this.selectedTabWidget){
			this.selectTab(this.selectedTabWidget);
		} else {
			dojo.widget.html.TabPane.superclass.onResized.call(this);
		}
	},

	onResized: function() {
		// in case the tab labels have overflowed from one line to two lines
		this._setPadding();
	}
});
dojo.widget.tags.addParseTreeHandler("dojo:TabPane");

// These arguments can be specified for the children of a TabPane.
// Since any widget can be specified as a TabPane child, mix them
// into the base widget class.  (This is a hack, but it's effective.)
dojo.lang.extend(dojo.widget.Widget, {
	label: "",
	selected: false	// is this tab currently selected?
});

