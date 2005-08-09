dojo.require("dojo.webui.DomWidget");
dojo.provide("dojo.webui.HtmlWidget");
dojo.provide("dojo.webui.HTMLWidget");

dojo.webui.HtmlWidget = function(args){
	// mixin inheritance
	dojo.webui.DomWidget.call(this);
}

dj_inherits(dojo.webui.HtmlWidget, dojo.webui.DomWidget);

dojo.lang.extend(dojo.webui.HtmlWidget, {
	templateCssPath: null,
	templatePath: null,
	allowResizeX: true,
	allowResizeY: true,

	resizeGhost: null,
	initialResizeCoords: null,
	// this.templateString = null;

	getContainerHeight: function(){
		// NOTE: container height must be returned as the INNER height
		dj_unimplemented("dojo.webui.HtmlWidget.getContainerHeight");
	},

	getContainerWidth: function(){
		return this.parent.domNode.offsetWidth;
	},

	setNativeHeight: function(height){
		var ch = this.getContainerHeight();
	},

	startResize: function(coords){
		// get the left and top offset of our dom node
		var hu = dojo.xml.htmlUtil;
		
		coords.offsetLeft = hu.totalOffsetLeft(this.domNode);
		coords.offsetTop = hu.totalOffsetTop(this.domNode);
		coords.innerWidth = hu.getInnerWidth(this.domNode);
		coords.innerHeight = hu.getInnerHeight(this.domNode);
		if(!this.resizeGhost){
			this.resizeGhost = document.createElement("div");
			var rg = this.resizeGhost;
			rg.style.position = "absolute";
			rg.style.backgroundColor = "white";
			rg.style.border = "1px solid black";
			dojo.xml.htmlUtil.setOpacity(rg, 0.3);
			document.body.appendChild(rg);
		}
		with(this.resizeGhost.style){
			left = coords.offsetLeft + "px";
			top = coords.offsetTop + "px";
		}
		this.initialResizeCoords = coords;
		this.resizeGhost.style.display = "";
		this.updateResize(coords, true);
	},

	updateResize: function(coords, override){
		var dx = coords.x-this.initialResizeCoords.x;
		var dy = coords.y-this.initialResizeCoords.y;
		with(this.resizeGhost.style){
			if((this.allowResizeX)||(override)){
				width = this.initialResizeCoords.innerWidth + dx + "px";
			}
			if((this.allowResizeY)||(override)){
				height = this.initialResizeCoords.innerHeight + dy + "px";
			}
		}
	},

	endResize: function(coords){
		// FIXME: need to actually change the size of the widget!
		var dx = coords.x-this.initialResizeCoords.x;
		var dy = coords.y-this.initialResizeCoords.y;
		with(this.domNode.style){
			if(this.allowResizeX){
				width = this.initialResizeCoords.innerWidth + dx + "px";
			}
			if(this.allowResizeY){
				height = this.initialResizeCoords.innerHeight + dy + "px";
			}
		}
		this.resizeGhost.style.display = "none";
	},


	createNodesFromText: function(txt, wrap){
		return dojo.xml.domUtil.createNodesFromText(txt, wrap);
	},

	_old_buildFromTemplate: dojo.webui.DomWidget.prototype.buildFromTemplate,

	buildFromTemplate: function(){
		dojo.webui.buildFromTemplate(this);
		this._old_buildFromTemplate();
	}
});
dojo.webui.HTMLWidget = dojo.webui.HtmlWidget;
