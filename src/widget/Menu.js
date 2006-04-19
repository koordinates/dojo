dojo.provide("dojo.widget.Menu");
dojo.provide("dojo.widget.DomMenu");

dojo.deprecated("dojo.widget.Menu, dojo.widget.DomMenu",  "use dojo.widget.Menu2", "0.4");

dojo.require("dojo.widget.*");

dojo.widget.tags.addParseTreeHandler("dojo:menu");

/* Menu
 *******/

dojo.widget.Menu = function () {
	dojo.widget.Menu.superclass.constructor.call(this);
}
dojo.inherits(dojo.widget.Menu, dojo.widget.Widget);

dojo.lang.extend(dojo.widget.Menu, {
	widgetType: "Menu",
	isContainer: true,
	
	items: [],
	push: function(item){
		dojo.connect.event(item, "onSelect", this, "onSelect");
		this.items.push(item);
	},
	onSelect: function(){}
});


/* DomMenu
 **********/

dojo.widget.DomMenu = function(){
	dojo.widget.DomMenu.superclass.constructor.call(this);
}
dojo.inherits(dojo.widget.DomMenu, dojo.widget.DomWidget);

dojo.lang.extend(dojo.widget.DomMenu, {
	widgetType: "Menu",
	isContainer: true,

	push: function (item) {
		dojo.widget.Menu.call(this, item);
		this.domNode.appendChild(item.domNode);
	}
});

dojo.requireIf("html", "dojo.widget.html.Menu");
