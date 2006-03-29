dojo.provide("dojo.widget.Editor2Toolbar");
dojo.provide("dojo.widget.html.Editor2Toolbar");

dojo.require("dojo.widget.*");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.RichText");

dojo.widget.tags.addParseTreeHandler("dojo:Editor2Toolbar");

dojo.widget.html.Editor2Toolbar = function(){
	dojo.widget.HtmlWidget.call(this);
}

dojo.inherits(dojo.widget.html.Editor2Toolbar, dojo.widget.HtmlWidget);
dojo.lang.extend(dojo.widget.html.Editor2Toolbar, {
	widgetType: "Editor2Toolbar",
	isContainer: false,

	templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlEditorToolbar.html"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlEditorToolbar.css"),

	// DOM Nodes
	wikiWordButton: null,
	styleDropdownButton: null,
	copyButton: null,
	boldButton: null,
	italicButton: null,
	underlineButton: null,
	leftButton: null,
	fullButton: null,
	rightButton: null,
	pasteButton: null,
	undoButton: null,
	redoButton: null,

	// event signals
	wikiWordClick: function(){},
	styleDropdownClick: function(){},
	copyClick: function(){},
	boldClick: function(){},
	italicClick: function(){},
	underlineClick: function(){},
	leftClick: function(){},
	fullClick: function(){},
	rightClick: function(){},
	pasteClick: function(){},
	undoClick: function(){},
	redoClick: function(){}
});
