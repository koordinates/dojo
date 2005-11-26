dojo.provide("dojo.widget.html.Tooltip");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.Tooltip");
dojo.require("dojo.uri");
dojo.require("dojo.widget.*");
dojo.require("dojo.event");
dojo.require("dojo.style");
dojo.require("dojo.html");

dojo.widget.html.Tooltip = function(){
	// mix in the tooltip properties
	dojo.widget.Tooltip.call(this);
	dojo.widget.HtmlWidget.call(this);
}
dojo.inherits(dojo.widget.html.Tooltip, dojo.widget.HtmlWidget);
dojo.lang.extend(dojo.widget.html.Tooltip, {

	// Constructor arguments (should these be in tooltip.js rather than html/tooltip.js???)
	caption: "undefined",
	delay: 500,
	connectId: "",

	templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlTooltipTemplate.html"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlTooltipTemplate.css"),

	containerNode: null,
	connectNode: null,

	hovering: false,
	displayed: false,

	fillInTemplate: function(args, frag){
		if(this.caption != "undefined"){
			this.domNode.appendChild(document.createTextNode(this.caption));
		}
		dojo.html.body().appendChild(this.domNode);
		this.connectNode = dojo.byId(this.connectId);
	},
	
	postCreate: function(args, frag){
		dojo.event.connect(this.connectNode, "onmouseover", this, "onMouseOver");
		dojo.event.connect(this.connectNode, "onmouseout", this, "onMouseOut");
	},
	
	onMouseOver: function(e) {
		this.hovering = true;

		// record mouse position and monitor changes to it
		this.mouseX = e.pageX || e.clientX + dojo.html.body().scrollLeft;
		this.mouseY = e.pageY || e.clientY + dojo.html.body().scrollTop;
		dojo.event.connect(this.connectNode, "onmousemove", this, "onMouseMove");

		// display after given delay
		dojo.lang.setTimeout(this, this.display, this.delay);
	},
	
	onMouseMove: function(e) {
		this.mouseX = e.pageX || e.clientX + dojo.html.body().scrollLeft;
		this.mouseY = e.pageY || e.clientY + dojo.html.body().scrollTop;
	},

	display: function() {
		if ( this.hovering ){
			this.domNode.style.top = this.mouseY + 15 + "px";
			this.domNode.style.left = this.mouseX + 10 + "px";
			this.show();
			this.displayed=true;
		}
	},

	onMouseOut: function() {
		dojo.event.disconnect(this.connectNode, "onmousemove", this, "onMouseMove");
		// TODO: how do I cancel the timer?
		if ( this.displayed ) {
			this.hide();
			this.displayed=false;
		}
		this.hovering = false;
	}
});
