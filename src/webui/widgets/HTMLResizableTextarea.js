dojo.hostenv.startPackage("dojo.webui.widgets.HTMLResizableTextarea");
dojo.hostenv.loadModule("dojo.webui.DomWidget");

dojo.webui.widgets.tags.addParseTreeHandler("dojo:resizabletextarea");

dojo.webui.widgets.HTMLResizableTextarea = function(){
	dojo.webui.Widget.call(this);
	dojo.webui.DomWidget.call(this, true);
	dojo.webui.HTMLWidget.call(this);

	this.templatePath = "src/webui/widgets/templates/HTMLResizableTextarea.html";
	this.widgetType = "ResizableTextarea";
	this.tagName = "dojo:resizabletextarea";
	this.isContainer = false;
	this.textAreaNode = null;
	this.textAreaContainer = null;

	this.fillInTemplate = function(args, frag){
		this.textAreaNode = frag[this.tagName].nodeRef.cloneNode(true);
		this.textAreaContainer.appendChild(this.textAreaNode);
	}

	this.fitToParent = function(){
		with(this.textAreaNode.style){
			width = "100%";
			height = "100%";
		}
		var hu = dojo.xml.htmlUtil;
		var iw = parseInt(this.textAreaNode.offsetWidth);
		var ih = parseInt(dojo.xml.htmlUtil.getInnerHeight(this.textAreaNode));
		var cols = parseInt(hu.getAttr(this.textAreaNode, "cols"));
		var rows = parseInt(hu.getAttr(this.textAreaNode, "rows"));
		var pxpercol = (iw/cols);
		var pxperrow = (ih/rows);
		// dj_debug(pxpercol + "px/column");
		// dj_debug(pxperrow + "px/row");

		// now fit it to it's container
		var pn = this.textAreaNode.parentNode;
		var pnw = parseInt(hu.getInnerWidth(pn));
		var pnh = parseInt(hu.getInnerHeight(pn));
		// dj_debug(parseInt(pnw/pxpercol));
		this.textAreaNode.cols = parseInt(pnw/pxpercol);
		this.textAreaNode.rows = parseInt(pnh/pxperrow);
	}

	this.postDrag = function(){
		this.textAreaNode.parentNode.style.overflow = "hidden";
		this.textAreaNode.style.display = "";
		this.fitToParent();
	}

	dojo.event.connect(this, "endResize", this, "fitToParent");
}

dj_inherits(dojo.webui.widgets.HTMLResizableTextarea, dojo.webui.DomWidget);
