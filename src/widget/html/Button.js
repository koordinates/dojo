dojo.provide("dojo.widget.html.Button");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.Button");

dojo.widget.html.Button = function(){
	// mix in the button properties
	dojo.widget.Button.call(this);
	dojo.widget.HtmlWidget.call(this);

	this.templatePath = dojo.uri.dojoUri("src/widget/templates/HtmlButtonTemplate.html");
	this.templateCssPath = dojo.uri.dojoUri("src/widget/templates/HtmlButtonTemplate.css");

	// FIXME: freaking implement this already!
	this.foo = function(){ alert("bar"); }

	this.label = "huzzah!";
	this.labelNode = null;

	this.setLabel = function(){
		this.labelNode.innerHTML = this.label;
		// this.domNode.label = this.label;
	}

	this.fillInTemplate = function(){
		this.setLabel();
	}

	this.onFoo = function(){ }
}
dj_inherits(dojo.widget.html.Button, dojo.widget.HtmlWidget);
