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
	this.hue = "0";
	this.saturation = "0";
	this.light = "0";
	this.storedColor = "#000000";
};
dojo.inherits(dojo.widget.svg.HslColorPicker, dojo.widget.HtmlWidget);
dojo.lang.extend(dojo.widget.svg.HslColorPicker, {
	//	widget props
	templatePath: dojo.uri.dojoUri("src/widget/templates/HslColorPicker.svg"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HslColorPicker.css"),
	fillInTemplate: function() {
		this.height = "131px";
		dojo.svg.g.suspend();
		this.hueSliderNode.setAttributeNS(dojo.dom.xmlns.xlink, "href", dojo.uri.dojoUri("src/widget/templates/images/hue.png"));
		dojo.svg.g.resume();
		this.setSaturationStopColors();
		this.setHueSlider();
		this.setSaturationLightSlider();
	},
	setSaturationStopColors: function() {
		this.leftGradientStopColor = "rgb(" + dojo.graphics.color.hsl2rgb(this.hue, 0, 50).join(", ") + ")";
		this.rightGradientStopColor = "rgb(" + dojo.graphics.color.hsl2rgb(this.hue, 100, 50).join(", ") + ")";
		this.leftGradientColorNode.setAttributeNS(null,'stop-color',leftGradientStopColor);
		this.rightGradientColorNode.setAttributeNS(null,'stop-color',rightGradientStopColor);
	},
	setHue: function(hue) {
		this.hue = hue;
	},
	setHueSlider: function() {
		// FIXME: need to add some padding around the picker so you can see the slider at the top and bottom of the picker)
		this.hueSliderNode.setAttribute("y", parseInt((hue/360) * parseInt(this.height) - 2) + "px" );
	}
	setSaturationLight: function(saturation, light) {
		this.saturation = saturation;
		this.light = light;
	},
	setSaturationLightSlider: function() {
		// TODO
	}
	onHueClick: function(evt) {
		// get the position that was clicked on the element
		// FIXME: handle document scrolling
		var yPosition = parseInt(evt.clientY - evt.target.getAttribute("y"));
		this.setHue( 360 - parseInt(yPosition*(360/parseInt(this.height))) );
		this.setSaturationStopColors();
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
