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


// the drag and drop manager is a singleton
dojo.webui.htmlDragAndDropManager = new function(){
	dojo.webui.DragAndDropManager.call(this);

	this.resizeTarget = null;
	this.hoverNode = null;
	this.dragIcon = null;
	this._cheapChecks = true;
	this.isResizing = false;
	this.overResizeHandle = false;
	this.overDragHandle  = false;
	this.init = [];
	this.curr = [];

	this.checkForResize = function(node){
		if(this._cheapChecks){
			return dojo.xml.htmlUtil.getAttribute(node, "resizeHandle");
		}
		var rh = false;
		var ca = null;
		var ancestors = dojo.xml.domUtil.getAncestors(node);
		while((ancestors.length)&&(!rh)){
			var ca = ancestors.shift();
			rh = dojo.xml.htmlUtil.getAttribute(ca, "resizeHandle");
		}
		return rh;
	}

	this.checkForDrag = function(node){
		if(this._cheapChecks){
			return dojo.xml.htmlUtil.getAttribute(node, "dragHandle");
		}
		var rh = false;
		var ca = null;
		var ancestors = dojo.xml.domUtil.getAncestors(node);
		while((ancestors.length)&&(!rh)){
			var ca = ancestors.shift();
			rh = dojo.xml.htmlUtil.getAttribute(ca, "dragHandle");
		}
		return rh;
	}

	this.mouseMove = function(evt){
		this.curr = [evt.clientX, evt.clientY];
		this.curr.x = this.curr[0];
		this.curr.absx = this.curr.x+((dojo.render.html.moz) ? window.pageXOffset : document.body.scrollLeft);
		this.curr.y = this.curr[1];
		this.curr.absy = this.curr.y+((dojo.render.html.moz) ? window.pageYOffset : document.body.scrollTop);
		if((this.isDragging)||(this.isResizing)){
			// FIXME: we should probably implement a distance threshold here!
			this.mouseDrag(evt);
		}else{
			var dh = this.checkForDrag(evt.target);
			var rh = this.checkForResize(evt.target);
			// FIXME: we also need to handle horizontal-only or vertical-only
			// reisizing
			if(rh||dh){
				if(rh){ this.overResizeHandle = true; }
				if(dh){ this.overDragHandle = true; }
				document.body.style.cursor = "move";
			}else{
				this.overResizeHandle = false;
				this.overDragHandle = false;
				document.body.style.cursor = "";
			}
		}
		// update hoverTarget only when necessaray!
		if(evt.target != this.hoverNode){ 
			this.hoverNode = evt.target;
			var tdt = dojo.webui.widgetManager.getWidgetFromEvent(evt);
			this.hoverTarget = tdt;
			while((tdt)&&(!tdt["dragEnter"])&&(tdt != dojo.webui.widgetManager.root)){
				tdt = tdt.parent;
			}
			if(this.isDragging){
				if(tdt != dojo.webui.widgetManager.root){
					if(tdt != this.dropTarget){
						// dj_debug(tdt);
						if(this.dropTarget){
							this.dropTarget.dragLeave(this.dragSource);
						}
						this.dropTarget = tdt;
						if((this.dropTarget)&&(this.dropTarget["dragEnter"])){
							this.dropTarget.dragEnter(this.dragSource);
						}
					}
				}else{
					if(this.dropTarget){
						this.dropTarget.dragLeave(this.dragSource);
					}
					this.dropTarget = null;
				}
			}
		}
	}

	this.mouseDown = function(evt){
		this.init = this.curr;
		if(!this.hoverTarget){ return; }
		if(this.overResizeHandle){
			this.isResizing = true;
			this.resizeTarget = this.hoverTarget;
			if(this.resizeTarget["startResize"]){
				evt.preventDefault();
				evt.stopPropagation();
				this.resizeTarget.startResize(this.curr);
			}
			if(this.dragSource){
				this.dragSource.startDrag();
			}
		}else{
			if((this.hoverTarget["isDragSource"] === true)||(this.overDragHandle)){
				this.isDragging = true;
				this.dragSource = this.hoverTarget;
				
				// create a rudimentary event object to be passed to startDrag()
				var evt = {target: this.hoverNode, type: "startDrag"};
				
				while((this.dragSource)&&(!this.dragSource["isDragSource"])){
					this.dragSource = this.dragSource.parent;
				}
				if(!this.dragSource){
					this.isDragging = false;
				}else{
					document.body.style.cursor = "move";
				}
				this.dragSource.startDrag(evt);
				var di = this.dragSource.getDragIcon();
				if(di){
					if(!this.dragIcon){
						this.dragIcon = document.createElement("span");
						with(this.dragIcon.style){
							position = "absolute";
							border = margin = padding = "0px";
							zIndex = "1000";
							display = "none";
						}
						document.body.appendChild(this.dragIcon);
						dojo.xml.htmlUtil.setOpacity(this.dragIcon, 0.5);
					}
					// FIXME: can't do this without making sure the dragover
					//        events get fired on the DropTargets
					// start dragging the icon from its origin
					//var pos = dojo.xml.htmlUtil.getAttribute(di, "originalPosition")
					//if (pos) {
					//	pos = pos.split(",");
					//	this.dragIcon.offsetX = pos[0] - this.curr.absx;
					//	this.dragIcon.offsetY = pos[1] - this.curr.absy;
					//} else {
						this.dragIcon.offsetX = 15;
						this.dragIcon.offsetY = 15;
					//}
					with(this.dragIcon){
						style.left = this.curr.absx+offsetX+"px";
						style.top = this.curr.absy+offsetY+"px";
					}
					this.dragIcon.appendChild(di);
					this.dragIcon.style.display = "";
				}
			}
		}
	}

	// turns out that these are pretty useless
	this.mouseOver = function(nativeEvt){ return; }
	this.mouseOut = function(nativeEvt){ return; }

	this.mouseUp = function(nativeEvt){ 
		this.drop(nativeEvt);
		if((this.isResizing)||(this.isDragging)){
			if(this.resizeTarget){
				this.resizeTarget.endResize(this.curr);
				this.exitDrag();
			}else if(this.dropTarget){
				this.dropTarget.dragLeave(this.dragSource);
				this.exitDrag();
			}else{
				this.cancelDrag();
			}
		} else {
			this.cancelDrag();
		}
	}

	this.mouseDrag = function(evt){ 
		if(this.isResizing){
			if(this.resizeTarget){
				this.resizeTarget.updateResize(this.curr);
			}
		}else if(this.isDragging){
			evt.preventDefault();
			evt.stopPropagation();
			this.drag(evt);
			if(this.dragIcon){
				with (this.dragIcon) {
					style.left = this.curr.absx+offsetX+"px";
					style.top = this.curr.absy+offsetY+"px";
				}
			}
		}
	}
	
	this.keyDown = function(evt){
		if (evt.keyCode == 27) { // escape key
			// FIXME: don't seem to be able to animate as setTimeout isn't
			// being fired with the mouse button held down?
			//this.cancelDrag();
			this.exitDrag();
		}
	}

	this.cancelDrag = function(){
		// scoots the drag icon off back to it's original position
		// and then exits
		var endcoords = (this.dragIcon) ? dojo.xml.htmlUtil.getAttribute(
			this.dragIcon.firstChild, "originalPosition") : false;
		
		if(endcoords){
			endcoords = endcoords.split(",");
			endcoords[0]++; endcoords[1]++; // offset so the end can be seen
			var begincoords = [dojo.xml.htmlUtil.getAbsoluteX(this.dragIcon),
					dojo.xml.htmlUtil.getAbsoluteY(this.dragIcon)];

			// steal the icon so that other d&ds are free to start
			var dragIcon = this.dragIcon; this.dragIcon = null;
		
			// animate
			var line = new dojo.math.curves.Line(begincoords, endcoords);
			var anim = new dojo.animation.Animation(line, 300, 0, 0);
			dojo.event.connect(anim, "onAnimate", function(e) {
				dragIcon.style.left = e.x + "px";
				dragIcon.style.top = e.y + "px";
			});
			dojo.event.connect(anim, "onEnd", function (e) {
				// pause for a second (not literally) and disappear
				setTimeout(function () {
					dragIcon.parentNode.removeChild(dragIcon);
				}, 100);
			});
			anim.play();
		}
		this.exitDrag();
	}
	
	this.exitDrag = function(){
		// resets drag manager after a drag has finished
		if(this.dragIcon){
			this.dragIcon.style.display = "none";
			with(this.dragIcon){
				while(firstChild){ removeChild(firstChild); }
			}
		}
		if((this.isResizing)||(this.isDragging)){
			if(!this.resizeTarget){
				this.dragSource.endDrag();
				this.dragSource.selection.clear();
			}
			this.dropTarget = null;
			this.resizeTarget = null;
			this.isResizing = false;
			this.overResizeHandle = false;

			this.dragSource = null;
			this.isDragging = false;
			this.overDragHandle = false;

			document.body.style.cursor = "default";
		}
		this.init = [];
	}

}

try{
(function(){
	var tf = function(){
		var rw = new function(){
			dojo.webui.HtmlWidget.call(this);
			this.buildRendering = function(){ return; }
			this.destroyRendering = function(){ return; }
			this.postInitialize = function(){ return; }
			this.cleanUp = function(){ return; }
			this.widgetType = "HTMLRootWidget";
			this.domNode = document.body;
			this.widgetId = "html_builtin";
		}
		// FIXME: need to attach to DOM events and the like here
		
		var htmldm = dojo.webui.htmlDragAndDropManager;
		dojo.event.connect(document, "onkeydown", htmldm, "keyDown");
		dojo.event.connect(document, "onmousemove", htmldm, "mouseMove");
		dojo.event.connect(document, "onmouseover", htmldm, "mouseOver");
		dojo.event.connect(document, "onmouseout", htmldm, "mouseOut");
		dojo.event.connect(document, "onmousedown", htmldm, "mouseDown");
		dojo.event.connect(document, "onmouseup", htmldm, "mouseUp");

		var wm = dojo.webui.widgetManager;
		wm.root = rw;
		wm.add(rw);

		// extend the widgetManager with a getWidgetFromNode method
		wm.getWidgetFromNode = function(node){
			var filter = function(x){
				if(x.domNode == node){
					return true;
				}
			}
			var widgets = [];
			while((node)&&(widgets.length < 1)){
				widgets = this.getWidgetsByFilter(filter);
				node = node.parentNode;
			}

			if(widgets.length > 0){
				return widgets[0];
			}else{
				return null;
			}
		}

		wm.getWidgetFromEvent = function(domEvt){
			return this.getWidgetFromNode(domEvt.target);
		}

		wm.getWidgetFromPrimitive = wm.getWidgetFromNode;
	}

	// make sure we get called when the time is right
	dojo.event.connect(dojo.hostenv, "loaded", tf);
})();
}catch(e){ alert(e); }
