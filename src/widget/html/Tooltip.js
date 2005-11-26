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
		var self = this;
		this.timerEvent = function () { self.display.apply(self); };
		dojo.event.connect(this.connectNode, "onmouseover", this, "onMouseOver");
		dojo.event.connect(this.connectNode, "onmousemove", this, "recordMousePosition");
		dojo.event.connect(this.connectNode, "onmouseout", this, "onMouseOut");
	},
	
	onMouseOver: function(e) {
		this.timerEventId = setTimeout(this.timerEvent, this.delay);
		this.recordMousePosition(e);
	},
	
	recordMousePosition: function(e) {
		this.mouseX = e.pageX || e.clientX + dojo.html.body().scrollLeft;
		this.mouseY = e.pageY || e.clientY + dojo.html.body().scrollTop;
	},

	display: function() {
		this.domNode.style.top = this.mouseY + 15 + "px";
		this.domNode.style.left = this.mouseX + 10 + "px";

		if ( this.toggle == "explode" ) {
			if ( !this.explodeSrc) {
				this.explodeSrc = document.createElement("span");
				this.explodeSrc.style.position="absolute";
				//this.explodeSrc.style.display="none";
			}
			this.explodeSrc.style.top=this.mouseY + "px";
			this.explodeSrc.style.left=this.mouseX + "px";
			dojo.html.body().appendChild(this.explodeSrc);	
		}
			
		this.show();
		this.displayed=true;
	},

	onMouseOut: function() {
		if ( this.timerEventId ) {
			clearTimeout(this.timerEventId);
			delete this.timerEventId;
		}
		if ( this.displayed ) {
			this.hide();
			this.displayed=false;
		}
	}
});
