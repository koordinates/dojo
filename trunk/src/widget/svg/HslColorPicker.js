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
	hue: "0",
	saturation: "0",
	light: "0",
	storedColor: "#000000",
	templatePath: dojo.uri.dojoUri("src/widget/templates/HslColorPicker.svg"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HslColorPicker.css"),
	fillInTemplate: function() {
		this.height = "131px";
		dojo.svg.g.suspend();
		this.hueSliderNode.setAttributeNS(dojo.dom.xmlns.xlink, "href", dojo.uri.dojoUri("src/widget/templates/images/hue.png"));
		dojo.svg.g.resume();
	},
	onHueClick: function(evt) {
		// get the position that was clicked on the element
		// FIXME: handle document scrolling
		var yPosition = evt.clientY - evt.target.getAttribute("y");
		this.hue = 360 - parseInt((parseInt(yPosition))*(360/parseInt(this.height)));
		this.leftGradientStopColor = "rgb(" + dojo.graphics.color.hsl2rgb(this.hue, 0, 50).join(", ") + ")";
		this.rightGradientStopColor = "rgb(" + dojo.graphics.color.hsl2rgb(this.hue, 100, 50).join(", ") + ")";
		this.leftGradientColorNode.setAttributeNS(null,'stop-color',leftGradientStopColor);
		this.rightGradientColorNode.setAttributeNS(null,'stop-color',rightGradientStopColor);
		this.setStoredColor(dojo.graphics.color.hsl2hex(this.hue, this.saturation, this.light).join(""));
	},
	onHueDrag: function(evt) {
		// TODO
	},
	onSaturationLightClick: function(evt) {
		// TODO
	},
	onSaturationLightDrag: function(evt) {
		// TODO
	},
	setStoredColor: function(rgbHexColor) {
		this.storedColor = rgbHexColor;
	}
});
