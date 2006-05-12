dojo.provide("dojo.widget.Button");
dojo.provide("dojo.widget.DropDownButton");
dojo.provide("dojo.widget.ComboButton");
dojo.require("dojo.widget.Widget");

dojo.widget.tags.addParseTreeHandler("dojo:Button");
dojo.widget.tags.addParseTreeHandler("dojo:dropdownButton");
dojo.widget.tags.addParseTreeHandler("dojo:comboButton");

dojo.widget.Button = function(){
}
dojo.lang.extend(dojo.widget.Button, {
	widgetType: "Button",
	isContainer: true,

	// Constructor arguments
	caption: "",
	disabled: false,
	onClick: function(){ }
});

dojo.widget.DropDownButton = function(){
}
dojo.inherits(dojo.widget.DropDownButton, dojo.widget.Button);
dojo.lang.extend(dojo.widget.DropDownButton, {
	widgetType: "DropDownButton",
	isContainer: true,

	// constructor arguments
	menuId: ''
});

dojo.widget.ComboButton = function(){
}
dojo.inherits(dojo.widget.ComboButton, dojo.widget.Button);
dojo.lang.extend(dojo.widget.ComboButton, {
	widgetType: "ComboButton",
	isContainer: true,

	// constructor arguments
	menuId: ''
});

dojo.requireAfterIf("html", "dojo.widget.html.Button");
