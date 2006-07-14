dojo.provide("dojo.widget.html.Tooltip");
dojo.require("dojo.widget.html.ContentPane");
dojo.require("dojo.widget.Menu2"); //for dojo.widget.PopupContainer
dojo.require("dojo.widget.Tooltip");
dojo.require("dojo.uri");
dojo.require("dojo.widget.*");
dojo.require("dojo.event");
dojo.require("dojo.style");
dojo.require("dojo.html");

dojo.widget.defineWidget(
	"dojo.widget.html.Tooltip",
	dojo.widget.html.ContentPane,
	{
		isContainer: true,

		// Constructor arguments
		caption: "",
		showDelay: 500,
		hideDelay: 100,
		connectId: "",

		templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlTooltipTemplate.css"),

		connectNode: null,
		popupWidget: null,
	
		fillInTemplate: function(args, frag){
			//the line below is required to prevent opera 9 from crashing
			this.domNode.style.display="none";

			if(this.caption != ""){
				this.domNode.appendChild(document.createTextNode(this.caption));
			}
			this.connectNode = dojo.byId(this.connectId);		
			dojo.widget.html.Tooltip.superclass.fillInTemplate.call(this, args, frag);

			//wrap this.domNode in a PopupContainer
			//and pass animation setting to it
			this.popupWidget = dojo.widget.createWidget("PopupContainer", {toggle: this.toggle, toggleDuration: this.toggleDuration});
			this.popupWidget.addChild(this);
			dojo.html.addClass(this.popupWidget.domNode, "dojoTooltip");

			//copy style from input node to output node
			var source = this.getFragNodeRef(frag);
			dojo.html.copyStyle(this.popupWidget.domNode, source);

			//reset animation on this widget
			this.toggle="plain";
			this.toggleDuration=150;
			//re-create animation object
			this.postMixInProperties();

			this.popupWidget.domNode.style.display="none";

			dojo.body().appendChild(this.popupWidget.domNode);
		},
		
		postCreate: function(args, frag){
			dojo.event.connect(this.connectNode, "onmouseover", this, "onMouseOver");
			dojo.widget.html.Tooltip.superclass.postCreate.call(this, args, frag);
		},
		
		onMouseOver: function(e) {
			this.mouse = {x: e.pageX, y: e.pageY};
	
			if(!this.showTimer){
				this.showTimer = setTimeout(dojo.lang.hitch(this, "show"), this.showDelay);
				dojo.event.connect(document.documentElement, "onmousemove", this, "onMouseMove");
			}
		},
	
		onMouseMove: function(e) {
			this.mouse = {x: e.pageX, y: e.pageY};

			if(dojo.html.overElement(this.connectNode, e) || dojo.html.overElement(this.popupWidget.domNode, e)){
				// If the tooltip has been scheduled to be erased, cancel that timer
				// since we are hovering over element/tooltip again
				if(this.hideTimer) {
					clearTimeout(this.hideTimer);
					delete this.hideTimer;
				}
			} else {
				// mouse has been moved off the element/tooltip
				// note: can't use onMouseOut to detect this because the "explode" effect causes
				// spurious onMouseOut/onMouseOver events (due to interference from outline)
				if(this.showTimer){
					clearTimeout(this.showTimer);
					delete this.showTimer;
				}
				if(this.popupWidget.isShowingNow && !this.hideTimer){
					this.hideTimer = setTimeout(dojo.lang.hitch(this, "hide"), this.hideDelay);
				}
			}
		},
	
		show: function() {
			if (this.popupWidget.isShowingNow) { return; }
	
			dojo.widget.html.Tooltip.superclass.show.call(this);
			
			this.popupWidget.open(this.mouse.x, this.mouse.y, this, [this.mouse.x, this.mouse.y], "TL,TR,BL,BR", [10,15]);
		},
	
		hide: function() {
			if (this.popupWidget.isShowingNow) {
				if ( this.showTimer ) {
					clearTimeout(this.showTimer);
					delete this.showTimer;
				}
				if ( this.hideTimer ) {
					clearTimeout(this.hideTimer);
					delete this.hideTimer;
				}
				dojo.event.disconnect(document.documentElement, "onmousemove", this, "onMouseMove");
				this.popupWidget.close();
			}
		},
	
		onHide: function(){
			dojo.widget.html.Tooltip.superclass.hide.call(this);
		},

		position: function(){
			this.popupWidget.move(this.mouse.x, this.mouse.y, [10,15], "TL,TR,BL,BR");
		},

		onLoad: function(){
			if(this.popupWidget.isShowingNow){
				// the tooltip has changed size due to downloaded contents, so reposition it
				this.position();
				dojo.widget.html.Tooltip.superclass.onLoad.apply(this, arguments);
			}
		},
	
		checkSize: function() {
			// checkSize() is called when the user has resized the browser window,
			// but that doesn't affect this widget (or this widget's children)
			// so it can be safely ignored
		}
	}
);
