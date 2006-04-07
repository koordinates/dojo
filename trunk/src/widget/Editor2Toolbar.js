dojo.provide("dojo.widget.Editor2Toolbar");
dojo.provide("dojo.widget.html.Editor2Toolbar");

dojo.require("dojo.widget.*");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.RichText");

dojo.widget.defineWidget(
	"dojo.widget.html.Editor2Toolbar",
	dojo.widget.HtmlWidget,
	{
		templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlEditorToolbar.html"),
		templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlEditorToolbar.css"),

		// DOM Nodes
		wikiWordButton: null,
		styleDropdownButton: null,
		styleDropdownContainer: null,
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

		buttonClick: function(){ dojo.debug("buttonClick"); },

		// event signals
		wikiWordClick: function(){ dojo.debug("wikiWordButtonClick"); },
		styleDropdownClick: function(){
			dojo.debug("styleDropdownClick:", this.styleDropdownContainer);
			dojo.style.toggleShowing(this.styleDropdownContainer);
		},

		copyClick: function(){ this.exec("copy"); },
		boldClick: function(){ this.exec("bold"); },
		italicClick: function(){ this.exec("italic"); },
		underlineClick: function(){ this.exec("underline"); },
		leftClick: function(){ this.exec("justifyleft"); },
		fullClick: function(){ this.exec("justifyfull"); },
		rightClick: function(){ this.exec("justifyright"); },
		pasteClick: function(){ this.exec("paste"); },
		undoClick: function(){ this.exec("undo"); },
		redoClick: function(){ this.exec("redo"); },

		normalTextClick: function(){ this.exec("formatblock", "p"); },
		h1TextClick: function(){ this.exec("formatblock", "h1"); },
		h2TextClick: function(){ this.exec("formatblock", "h2"); },
		h3TextClick: function(){ this.exec("formatblock", "h3"); },
		h4TextClick: function(){ this.exec("formatblock", "h4"); },

		exec: function(what, arg){ }
	}
);
