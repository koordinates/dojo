dojo.provide("dojo.widget.html.Container");

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.Container");

dojo.widget.html.Container = function(){
	dojo.widget.HtmlWidget.call(this);
}

dojo.inherits(dojo.widget.html.Container, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.Container, {
	widgetType: "Container",

	isContainer: true,
	containerNode: null,
	domNode: null
});

dojo.widget.tags.addParseTreeHandler("dojo:Container");
