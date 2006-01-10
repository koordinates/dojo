dojo.provide("dojo.widget.html.ContentPane");

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.Container");
dojo.require("dojo.widget.ContentPane");

dojo.widget.html.ContentPane = function(){
	dojo.widget.html.Container.call(this);
}
dojo.inherits(dojo.widget.html.ContentPane, dojo.widget.html.Container);

dojo.lang.extend(dojo.widget.html.ContentPane, {
	widgetType: "ContentPane"
});

dojo.widget.tags.addParseTreeHandler("dojo:ContentPane");
