dojo.provide("dojo.widget.svg.HslColorPicker");

dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.HslColorPicker");
dojo.require("dojo.math");
dojo.require("dojo.html");
dojo.require("dojo.svg");
dojo.require("dojo.graphics.color");

dojo.widget.svg.HslColorPicker=function(){
	dojo.widget.HslColorPicker.call(this);
	dojo.widget.HtmlWidget.call(this);
};
dojo.inherits(dojo.widget.svg.HslColorPicker, dojo.widget.HtmlWidget);
dojo.lang.extend(dojo.widget.svg.HslColorPicker, {
	//	widget props
	templatePath: dojo.uri.dojoUri("src/widget/templates/HslColorPicker.svg"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HslColorPicker.css"),
	fillInTemplate: function() {
		dojo.svg.g.suspend();
		this.hueSliderNode.setAttributeNS("http://www.w3.org/1999/xlink", "href", dojo.uri.dojoUri("src/widget/templates/images/hue.png"));
		dojo.svg.g.resume();
	}
});
