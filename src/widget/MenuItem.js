dojo.provide("dojo.widget.MenuItem");
dojo.provide("dojo.widget.DomMenuItem");

dojo.deprecated("dojo.widget.MenuItem, dojo.widget.DomMenuItem",  "use dojo.widget.Menu2", "0.4");

dojo.require("dojo.string");
dojo.require("dojo.widget.*");

dojo.widget.tags.addParseTreeHandler("dojo:MenuItem");

/* MenuItem
 ***********/
 
dojo.widget.MenuItem = function(){
	dojo.widget.MenuItem.superclass.constructor.call(this);
}
dojo.inherits(dojo.widget.MenuItem, dojo.widget.Widget);

dojo.lang.extend(dojo.widget.MenuItem, {
	widgetType: "MenuItem",
	isContainer: true
});


/* DomMenuItem
 **************/
dojo.widget.DomMenuItem = function(){
	dojo.widget.DomMenuItem.superclass.constructor.call(this);
}
dojo.inherits(dojo.widget.DomMenuItem, dojo.widget.DomWidget);

dojo.lang.extend(dojo.widget.DomMenuItem, {
	widgetType: "MenuItem"
});

dojo.requireIf("html", "dojo.html");
dojo.requireIf("html", "dojo.widget.html.MenuItem");
