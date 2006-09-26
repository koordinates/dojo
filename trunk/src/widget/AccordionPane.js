dojo.provide("dojo.widget.AccordionPane");

dojo.require("dojo.widget.*");
dojo.require("dojo.html.*");
dojo.require("dojo.html.selection");
dojo.require("dojo.widget.html.layout");

/*
 * AccordionPane is a box with a title that contains another widget (often a ContentPane).
 * It works in conjunction w/an AccordionContainer.
 */
dojo.widget.defineWidget(
	"dojo.widget.AccordionPane",
	dojo.widget.HtmlWidget,
{
	// parameters
	open: false,
	label: "",
	labelNodeClass: "",
	containerNodeClass: "",
	
	open: true,
	templatePath: dojo.uri.dojoUri("src/widget/templates/AccordionPane.html"),

	isContainer: true,

	// methods
    fillInTemplate: function() {
		dojo.widget.AccordionPane.superclass.fillInTemplate.call(this);
		dojo.html.disableSelection(this.labelNode);
	},

	setLabel: function(label) {
		this.labelNode.innerHTML=label;
	},
	
	resizeTo: function(width, height){
		dojo.html.setMarginBox(this.domNode, {width: width, height: height});
		var children = [
			{domNode: this.labelNode, layoutAlign: "top"},
			{domNode: this.containerNode, layoutAlign: "client"}
		];
		dojo.widget.html.layout(this.domNode, children);
		var childSize = dojo.html.getContentBox(this.containerNode);
		this.children[0].resizeTo(childSize.width, childSize.height);
	},

	getLabelHeight: function() {
		return dojo.html.getMarginBox(this.labelNode).height;
	},

	onLabelClick: function() {
		this.parent.selectPage(this);
	}
});
