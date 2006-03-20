dojo.provide("dojo.widget.html.TitlePane");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.fx.*");

dojo.widget.html.TitlePane = function(){

	dojo.widget.HtmlWidget.call(this);
	this.widgetType = "TitlePane";

	this.labelNode="";
	this.labelNodeClass="";
	this.containerNodeClass="";
	this.label="";

	this.open=true;
	this.templatePath = dojo.uri.dojoUri("src/widget/templates/TitlePane.html");
}

dojo.inherits(dojo.widget.html.TitlePane, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.TitlePane, {
	isContainer: true,
	postCreate: function() {
		if (this.label) {
			this.labelNode.appendChild(document.createTextNode(this.label));
		}

		if (this.labelNodeClass) {
			dojo.html.addClass(this.labelNode, this.labelNodeClass);
		}	

		if (this.containerNodeClass) {
			dojo.html.addClass(this.containerNode, this.containerNodeClass);
		}	

		if (!this.open) {
			dojo.fx.html.wipeOut(this.containerNode,0);
		}
	},

	onLabelClick: function() {
		if (this.open) {
			dojo.fx.html.wipeOut(this.containerNode,250);
			this.open=false;
		}else {
			dojo.fx.html.wipeIn(this.containerNode,250);
			this.open=true;
		}
	},

	setContent: function(content) {
		this.containerNode.innerHTML=content;
	}

	setLabel: function(label) {
		this.labelNode.innerHTML=label;
	}



});

dojo.widget.tags.addParseTreeHandler("dojo:TitlePane");
