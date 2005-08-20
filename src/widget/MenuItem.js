dojo.provide("dojo.widget.MenuItem");
dojo.provide("dojo.widget.DomMenuItem");
dojo.provide("dojo.widget.HtmlMenuItem");

dojo.require("dojo.widget.Widget");
dojo.require("dojo.widget.DomWidget");
dojo.require("dojo.widget.HtmlWidget");


dojo.widget.tags.addParseTreeHandler("dojo:MenuItem");

/* MenuItem
 ***********/
 
dojo.widget.MenuItem = function () {
	dojo.widget.MenuItem.superclass.constructor.call(this);
}
dj_inherits(dojo.widget.MenuItem, dojo.widget.Widget);

dojo.lang.extend(dojo.widget.MenuItem, {
	widgetType: "MenuItem",
	isContainer: false,
	
	label: ""
});


/* DomMenuItem
 **************/
dojo.widget.DomMenuItem = function(){
	dojo.widget.DomMenuItem.superclass.constructor.call(this);
}
dj_inherits(dojo.widget.DomMenuItem, dojo.widget.DomWidget);

dojo.lang.extend(dojo.widget.DomMenuItem, {
	widgetType: "MenuItem"
});

/* HtmlMenuItem
 ***************/

dojo.widget.HtmlMenuItem = function () {
	dojo.widget.HtmlMenuItem.superclass.constructor.call(this);
}
dj_inherits(dojo.widget.HtmlMenuItem, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.HtmlMenuItem, {
	widgetType: "MenuItem",
	label: "",

	buildRendering: function () {
		dojo.widget.HtmlMenuItem.superclass.buildRendering.apply(this, arguments);
		this.domNode = document.createElement("li");
		with (this.domNode.style) {
			margin = "0"; padding = "2px 1em";
		}
	},

	fillInTemplate: function () {
		//dojo.widget.HtmlMenuItem.superclass.fillInTemplate.apply(this, arguments);
		alert(this.domNode);
		this.domNode.appendChild(document.createTextNode(this.label));
	}
});
