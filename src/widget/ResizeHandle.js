dojo.provide("dojo.widget.ResizeHandle");
dojo.provide("dojo.widget.html.ResizeHandle");

dojo.require("dojo.widget.*");
dojo.require("dojo.html");
dojo.require("dojo.style");
dojo.require("dojo.dom");
dojo.require("dojo.event");

dojo.widget.html.ResizeHandle = function(){
	dojo.widget.HtmlWidget.call(this);
}

dojo.inherits(dojo.widget.html.ResizeHandle, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.ResizeHandle, {
	widgetType: "ResizeHandle",

	isSizing: false,
	startPoint: null,
	startSize: null,

	targetElmId: '',

	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlResizeHandle.css"),
	templateString: '<div class="dojoHtmlResizeHandle"><div></div></div>',

	postCreate: function(){
		dojo.event.connect(this.domNode, "onmousedown", this, "beginSizing");
	},

	beginSizing: function(e){
		if (this.isSizing){ return false; }

		this.targetElm = dojo.widget.byId(this.targetElmId);
		if (!this.targetElm){ return; }

		var screenX = window.event ? window.event.clientX : e.pageX;
		var screenY = window.event ? window.event.clientY : e.pageY;

		this.isSizing = true;
		this.startPoint  = {'x':e.clientX, 'y':e.clientY};
		this.startSize  = {'w':dojo.style.getOuterWidth(this.targetElm.domNode), 'h':dojo.style.getOuterHeight(this.targetElm.domNode)};

		dojo.event.kwConnect({
			srcObj: document.body, 
			srcFunc: "onmousemove",
			targetObj: this,
			targetFunc: "changeSizing",
			rate: 25
		});
		dojo.event.connect(document.body, "onmouseup", this, "endSizing");

		e.preventDefault();
	},

	changeSizing: function(e){
		// On IE, if you move the mouse above/to the left of the object being resized,
		// sometimes clientX/Y aren't set, apparently.  Just ignore the event.
		try{
			if(!e.clientX  || !e.clientY){ return; }
		}catch(e){
			// sometimes you get an exception accessing above fields...
			return;
		}
		var dx = this.startPoint.x - e.clientX;
		var dy = this.startPoint.y - e.clientY;
		this.targetElm.resizeTo(this.startSize.w - dx, this.startSize.h - dy);

		e.preventDefault();
	},

	endSizing: function(e){
		dojo.event.disconnect(document.body, "onmousemove", this, "changeSizing");
		dojo.event.disconnect(document.body, "onmouseup", this, "endSizing");

		this.isSizing = false;
	}


});

dojo.widget.tags.addParseTreeHandler("dojo:ResizeHandle");
