dojo.provide("dojo.widget.Dialog");
dojo.provide("dojo.widget.HtmlDialog");

dojo.require("dojo.widget.*");
dojo.require("dojo.event.*");
dojo.require("dojo.graphics.*");
dojo.require("dojo.fx.*");
dojo.require("dojo.html");

dojo.widget.tags.addParseTreeHandler("dojo:dialog");

dojo.widget.HtmlDialog = function(){
	dojo.widget.HtmlWidget.call(this);
}

dojo.inherits(dojo.widget.HtmlDialog, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.HtmlDialog, {
	templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlDialog.html"),
	widgetType: "Dialog",
	isContainer: true,

	_scrollConnected: 0,

	// Only supports fade right now
	effect: "fade",
	effectDuration: 250,

	bg: null,
	bgColor: "black",
	bgOpacity: 0.4,
	followScroll: 1,
	_fromTrap: false,

	trapTabs: function(e){
		if(e.target == this.tabStart) {
			if(this._fromTrap) {
				this._fromTrap = false;
			} else {
				this._fromTrap = true;
				this.tabEnd.focus();
			}
		} else if(e.target == this.tabEnd) {
			if(this._fromTrap) {
				this._fromTrap = false;
			} else {
				this._fromTrap = true;
				this.tabStart.focus();
			}
		}
	},

	clearTrap: function(e) {
		var _this = this;
		setTimeout(function() {
			_this._fromTrap = false;
		}, 100);
	},

	postCreate: function(args, frag, parentComp) {
		dojo.html.body().appendChild(this.domNode);
		this.nodeRef = frag["dojo:"+this.widgetType.toLowerCase()]["nodeRef"];
		if(this.nodeRef) {
			this.setContent(this.nodeRef);
		}
		this.bg = document.createElement("div");
		this.bg.className = "dialogUnderlay";
		with(this.bg.style) {
			position = "absolute";
			left = top = "0px";
			width = dojo.html.getOuterWidth(dojo.html.body()) + "px";
			zIndex = 998;
			display = "none";
		}
		this.setBackgroundColor(this.bgColor);
		dojo.html.body().appendChild(this.bg);
		with(this.domNode.style) {
			position = "absolute";
			zIndex = 999;
			display = "none";
		}
	},

	setContent: function(content) {
		if(typeof content == "string") {
			this.containerNode.innerHTML = content;
		} else if(content.nodeType != undefined) {
			// dojo.dom.removeChildren(this.containerNode);
			this.containerNode.appendChild(content);
		} else {
			dojo.raise("Tried to setContent with unknown content (" + content + ")");
		}
	},

	setBackgroundColor: function(color) {
		if(arguments.length >= 3) {
			color = dojo.graphics.color.rgb2hex(arguments[0], arguments[1], arguments[2]);
		}
		this.bg.style.backgroundColor = color;
		return this.bgColor = color;
	},
	
	setBackgroundOpacity: function(op) {
		if(arguments.length == 0) { op = this.bgOpacity; }
		dojo.style.setOpacity(this.bg, op);
		try {
			this.bgOpacity = dojo.style.getOpacity(this.bg);
		} catch (e) {
			this.bgOpacity = op;
		}
		return this.bgOpacity;
	},

	sizeBackground: function() {
		var h = document.documentElement.scrollHeight || dojo.html.body().scrollHeight;
		this.bg.style.height = h + "px";
	},

	placeDialog: function() {

		var scroll_offset = dojo.html.getScrollOffset();
		var viewport_size = dojo.html.getViewportSize();

		// find the size of the dialog
		// we should really be using dojo.style but i'm not sure
		// which (inner, outer, box, content, client) --cal
		this.domNode.style.display = "block";
		var w = this.domNode.offsetWidth;
		var h = this.domNode.offsetHeight;
		this.domNode.style.display = "none";

		var x = scroll_offset[0] + (viewport_size[0] - w)/2;
		var y = scroll_offset[1] + (viewport_size[1] - h)/2;

		with(this.domNode.style) {
			left = x + "px";
			top = y + "px";
		}
	},

	show: function() {
		this.setBackgroundOpacity();
		this.sizeBackground();
		this.placeDialog();
		switch((this.effect||"").toLowerCase()) {
			case "fade":
				this.bg.style.display = "block";
				this.domNode.style.display = "block";
				var _this = this;
				dojo.fx.fade(this.domNode, this.effectDuration, 0, 1, function(node) {
					if(dojo.lang.isFunction(_this.onShow)) {
						_this.onShow(node);
					}
				});
				break;
			default:
				this.bg.style.display = "block";
				this.domNode.style.display = "block";
				if(dojo.lang.isFunction(this.onShow)) {
					this.onShow(node);
				}
				break;
		}

		// FIXME: moz doesn't generate onscroll events for mouse or key scrolling (wtf)
		// we should create a fake event by polling the scrolltop/scrollleft every X ms.
		// this smells like it should be a dojo feature rather than just for this widget.

		if (this.followScroll && !this._scrollConnected){
			this._scrollConnected = 1;
			dojo.event.connect(window, "onscroll", this, "onScroll");
		}
	},

	hide: function(){
		switch((this.effect||"").toLowerCase()) {
			case "fade":
				this.bg.style.display = "none";
				var _this = this;
				dojo.fx.fadeOut(this.domNode, this.effectDuration, function(node) {
					node.style.display = "none";
					if(dojo.lang.isFunction(_this.onHide)) {
						_this.onHide(node);
					}
				});
				break;
			default:
				this.bg.style.display = "none";
				this.domNode.style.display = "none";
				if(dojo.lang.isFunction(this.onHide)) {
					this.onHide(node);
				}
				break;
		}

		if (this._scrollConnected){
			this._scrollConnected = 0;
			dojo.event.disconnect(window, "onscroll", this, "onScroll");
		}
	},

	setCloseControl: function(node) {
		dojo.event.connect(node, "onclick", this, "hide");
	},

	setShowControl: function(node) {
		dojo.event.connect(node, "onclick", this, "show");
	},

	onScroll: function(){
		this.placeDialog();
		this.domNode.style.display = "block";
	}
});

