dojo.provide("dojo.widget.Container");
dojo.provide("dojo.widget.HtmlContainer");

dojo.require("dojo.widget.*");

dojo.widget.HtmlContainer = function(){
	dojo.widget.HtmlWidget.call(this);
}

dojo.inherits(dojo.widget.HtmlContainer, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.HtmlContainer, {
	widgetType: "Container",

	isContainer: true,
	containerNode: null,
	domNode: null
});

dojo.widget.tags.addParseTreeHandler("dojo:Container");
