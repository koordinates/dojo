dojo.provide("dojo.widget.Accordion");

//
// TODO
// make it prettier
// active dragging upwards doesn't always shift other bars (direction calculation is wrong in this case)
//

// pull in widget infrastructure
dojo.require("dojo.widget.*");
// pull in our superclass
dojo.require("dojo.widget.HtmlSplitPane");

dojo.widget.Accordion = function(){

	dojo.widget.HtmlSplitPane.call(this);
	this.widgetType = "Accordion";
	this._super = dojo.widget.AccordionPanel.superclass;
	dojo.event.connect(this, "postCreate", this, "myPostCreate");
	
}
dojo.inherits(dojo.widget.Accordion, dojo.widget.HtmlSplitPane);
dojo.lang.extend(dojo.widget.Accordion, {
	sizerWidth: 1,
	activeSizing: 1,
	myPostCreate: function(args, frag){
		for(var i=0; i<this.sizers.length; i++){
			var sn = this.sizers[i];
			if(sn){
				sn.style.border = "0px";
			}
		}
		for(var i=0; i<this.children.length; i++){
			this.children[i].setMinHeight();
		}
		this.onResized();
	}
});
dojo.widget.tags.addParseTreeHandler("dojo:Accordion");

dojo.widget.AccordionPanel = function(){
	dojo.widget.HtmlSplitPanePanel.call(this);
	this.widgetType = "AccordionPanel";
	dojo.event.connect(this, "fillInTemplate", this, "myFillInTemplate");
}

dojo.inherits(dojo.widget.AccordionPanel, dojo.widget.HtmlSplitPanePanel);

dojo.lang.extend(dojo.widget.AccordionPanel, {
	sizeMin:0,
	sizeShare: 0,
	open: false,
	labelNode: null,
	initalContentNode: null,
	contentNode: null,
	templatePath: dojo.uri.dojoUri("src/widget/templates/AccordionPanel.html"),
	// templateCssPath: dojo.uri.dojoUri("src/widget/templates/AccordionPanel.css"),

	setMinHeight: function(){
		// now handle our setup
		var lh = dojo.style.getContentHeight(this.labelNode);
		lh += dojo.style.getContentHeight(this.initialContentNode);
		this.sizeMin = lh;
	},

	myFillInTemplate: function(args, frag){
		if(this.open){
			this.sizeShare = 100;
		}
	}
});
dojo.widget.tags.addParseTreeHandler("dojo:AccordionPanel");


