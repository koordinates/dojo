
dojo.provide("dojo.widget.EditorTreeSelector");

dojo.require("dojo.widget.Container");
dojo.require("dojo.widget.Tree");

dojo.widget.tags.addParseTreeHandler("dojo:EditorTreeSelector");


dojo.widget.EditorTreeSelector = function() {
	dojo.widget.HtmlWidget.call(this);
}

dojo.inherits(dojo.widget.EditorTreeSelector, dojo.widget.HtmlWidget);


dojo.lang.extend(dojo.widget.EditorTreeSelector, {
	widgetType: "EditorTreeSelector",
	selectedNode: null

});



