dojo.provide("dojo.widget.ResizeHandle");
dojo.provide("dojo.widget.HtmlResizeHandle");

dojo.require("dojo.widget.*");
dojo.require("dojo.html");
dojo.require("dojo.style");
dojo.require("dojo.dom");

dojo.widget.HtmlResizeHandle = function(){

	dojo.widget.HtmlWidget.call(this);
}

dojo.inherits(dojo.widget.HtmlResizeHandle, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.HtmlResizeHandle, {
	widgetType: "ResizeHandle",

	isSizing: 0,
	startPoint: null,
	startSize: null,

	grabImg: null,

	targetElmId: '',
	imgSrc: dojo.uri.dojoUri("src/widget/templates/grabCorner.gif"),

	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlResizeHandle.css"),
	templateString: '<div dojoAttachPoint="domNode"><img dojoAttachPoint="grabImg" /></div>',

	fillInTemplate: function(){

		dojo.style.insertCssFile(this.templateCssPath);

		dojo.html.addClass(this.domNode, 'dojoHtmlResizeHandle');
		dojo.html.addClass(this.grabImg, 'dojoHtmlResizeHandleImage');

		this.grabImg.src = this.imgSrc;
	},

	postCreate: function(){

		var self = this;
		var h1 = (function(){ return function(e){ if (self.isSizing){ self.changeSizing(e); } } })();
		var h2 = (function(){ return function(e){ if (self.isSizing){ self.endSizing(e); } } })();
		var h3 = (function(){ return function(e){ self.beginSizing(e); } })();

		dojo.event.connect(document.documentElement, "onmousemove", h1);
		dojo.event.connect(document.documentElement, "onmouseup", h2);
		dojo.event.connect(this.domNode, "onmousedown", h3);
	},

	beginSizing: function(e){

		this.targetElm = dojo.widget.getWidgetById(this.targetElmId);
		if (!this.targetElm){ return; }

		var screenX = window.event ? window.event.clientX : e.pageX;
		var screenY = window.event ? window.event.clientY : e.pageY;

		this.isSizing = 1;
		this.startPoint  = {'x':screenX, 'y':screenY};
		this.startSize  = {'w':dojo.style.getOuterWidth(this.targetElm.domNode), 'h':dojo.style.getOuterHeight(this.targetElm.domNode)};
	},

	changeSizing: function(e){

		var screenX = window.event ? window.event.clientX : e.pageX;
		var screenY = window.event ? window.event.clientY : e.pageY;

		var dx = this.startPoint.x - screenX;
		var dy = this.startPoint.y - screenY;

		this.targetElm.resizeTo(this.startSize.w - dx, this.startSize.h - dy);
	},

	endSizing: function(e){

		this.isSizing = 0;
	}


});

dojo.widget.tags.addParseTreeHandler("dojo:ResizeHandle");
