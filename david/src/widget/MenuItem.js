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
	templateString: '<li style="margin: 0;"></li>',
	label: "",

	fillInTemplate: function () {
		//dojo.widget.HtmlMenuItem.superclass.fillInTemplate.apply(this, arguments);
		this.domNode.appendChild(document.createTextNode(this.label));
		this.domNode.className = "MenuItem";
		
		dojo.event.connect(this.domNode, "onmouseover", this, "onMouseOver");
		dojo.event.connect(this.domNode, "onmouseout", this, "onMouseOut");
		dojo.event.connect(this.domNode, "onmousedown", this, "onMouseDown");
		dojo.event.connect(this.domNode, "onmouseup", this, "onMouseUp");
		dojo.event.connect(this.domNode, "onclick", this, "onClick");
	},
	
	onMouseOver: function (e) {
		dojo.xml.htmlUtil.addClass(this.domNode, "hover");
	},
	
	onMouseOut: function (e) {
		dojo.xml.htmlUtil.removeClass(this.domNode, "hover");
	},
	
	onClick: function (e) {},
	onMouseDown: function (e) {},
	onMouseUp: function (e) {},
});
