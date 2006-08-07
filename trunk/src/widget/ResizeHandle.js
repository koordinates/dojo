dojo.provide("dojo.widget.ResizeHandle");

dojo.require("dojo.widget.*");
dojo.require("dojo.html.layout");
dojo.require("dojo.event");

dojo.widget.defineWidget(
	"dojo.widget.ResizeHandle",
	dojo.widget.HtmlWidget,
{
	isSizing: false,
	startPoint: null,
	startSize: null,
	minSize: null,

	targetElmId: '',

	templateCssPath: dojo.uri.dojoUri("src/widget/templates/ResizeHandle.css"),
	templateString: '<div class="dojoHtmlResizeHandle"><div></div></div>',

	postCreate: function(){
		dojo.event.connect(this.domNode, "onmousedown", this, "beginSizing");
	},

	beginSizing: function(e){
		if (this.isSizing){ return false; }

		// get the target dom node to adjust.  targetElmId can refer to either a widget or a simple node
		this.targetWidget = dojo.widget.byId(this.targetElmId);
		this.targetDomNode = this.targetWidget ? this.targetWidget.domNode : dojo.byId(this.targetElmId);
		if (!this.targetDomNode){ return; }

		this.isSizing = true;
		this.startPoint  = {'x':e.clientX, 'y':e.clientY};
		var mb = dojo.html.getMarginBox(this.targetDomNode);
		this.startSize  = {'w':mb.width, 'h':mb.height};

		dojo.event.kwConnect({
			srcObj: dojo.body(), 
			srcFunc: "onmousemove",
			targetObj: this,
			targetFunc: "changeSizing",
			rate: 25
		});
		dojo.event.connect(dojo.body(), "onmouseup", this, "endSizing");

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
		
		var newW = this.startSize.w - dx;
		var newH = this.startSize.h - dy;

		// minimum size check
		if (this.minSize) {
			var mb = dojo.html.getMarginBox(this.targetDomNode);
			if (newW < this.minSize.w) {
				newW = mb.width;
			}
			if (newH < this.minSize.h) {
				newH = mb.height;
			}
		}
		
		if(this.targetWidget){
			this.targetWidget.resizeTo(newW, newH);
		}else{
			dojo.html.setMarginBox(this.targetDomNode, { width: newW, height: newH});
		}
		
		e.preventDefault();
	},

	endSizing: function(e){
		dojo.event.disconnect(dojo.body(), "onmousemove", this, "changeSizing");
		dojo.event.disconnect(dojo.body(), "onmouseup", this, "endSizing");

		this.isSizing = false;
	}


});
