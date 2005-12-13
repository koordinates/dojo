dojo.provide("dojo.widget.Checkbox");

dojo.require("dojo.widget.*");
dojo.require("dojo.event");
dojo.require("dojo.html");
dojo.requireIf("html", "dojo.widget.html.Checkbox");

dojo.widget.tags.addParseTreeHandler("dojo:Checkbox");

dojo.widget.Checkbox = function(){
	dojo.widget.Widget.call(this);
};
dojo.inherits(dojo.widget.Checkbox, dojo.widget.Widget);

dojo.lang.extend(dojo.widget.Checkbox, {
	widgetType: "Checkbox",
});
