dojo.hostenv.startPackage("dojo.webui.widgets.HTMLResizeableTextarea");
dojo.hostenv.loadModule("dojo.webui.DomWidget");

dojo.webui.widgets.tags.addParseTreeHandler("dojo:resizeabletextarea");

dojo.webui.widgets.HTMLResizeableTextarea = function(){
	dojo.webui.Widget.call(this);
	dojo.webui.DomWidget.call(this, true);
	dojo.webui.HTMLWidget.call(this);

	this.templatePath = "src/webui/widgets/templates/HTMLResizeableTextarea.html";
	this.widgetType = "ResizeableTextarea";
	this.tagName = "dojo:resizeabletextarea";
	this.isContainer = false;
	this.textAreaNode = null;
	this.textAreaContainer = null;

	this.fillInTemplate = function(args, frag){
		this.textAreaNode = frag[this.tagName].nodeRef.cloneNode(true);
		this.textAreaContainer.appendChild(this.textAreaNode);
	}

	this.fitToParent = function(){
		var iw = parseInt(this.textAreaNode.offsetWidth);
		var ih = parseInt(dojo.xml.htmlUtil.getInnerHeight(this.textAreaNode));
		var cols = parseInt(dojo.xml.htmlUtil.getAttr(this.textAreaNode, "cols"));
		var rows = parseInt(dojo.xml.htmlUtil.getAttr(this.textAreaNode, "rows"));
		var pxpercol = (iw/cols);
		var pxperrow = (ih/rows);
		// dj_debug(pxpercol + "px/column");
		// dj_debug(pxperrow + "px/row");

		// now fit it to it's container
		var pn = this.textAreaNode.parentNode;
		var pnw = parseInt(dojo.xml.htmlUtil.getInnerWidth(pn));
		var pnh = parseInt(dojo.xml.htmlUtil.getInnerHeight(pn));
		// dj_debug(parseInt(pnw/pxpercol));
		this.textAreaNode.cols = parseInt(pnw/pxpercol);
		this.textAreaNode.rows = parseInt(pnh/pxperrow);
	}

	this.preDrag = function(){
		if(dojo.render.html.ie){
			this.textAreaNode.style.display = "none";
		}
	}

	this.postDrag = function(){
		if(dojo.render.html.ie){
			// this.textAreaNode.style.position = "";
			this.textAreaNode.style.display = "";
			var pn = this.textAreaNode.parentNode;
			pn.style.overflow = "hidden";
			this.fitToParent();
			pn.style.overflow = "";
		}
		this.fitToParent();
	}

	dojo.event.connect(this, "endResize", this, "fitToParent");
	// if(dojo.render.html.ie){
		dojo.event.connect(this, "endResize", this, "fitToParent");
	// }
	dojo.event.connect(this, "startResize", this, "preDrag");
}

dj_inherits(dojo.webui.widgets.HTMLResizeableTextarea, dojo.webui.DomWidget);
