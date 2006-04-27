dojo.provide("dojo.dnd.HtmlDragAndDrop");
dojo.provide("dojo.dnd.HtmlDragSource");
dojo.provide("dojo.dnd.HtmlDropTarget");
dojo.provide("dojo.dnd.HtmlDragObject");

dojo.require("dojo.dnd.HtmlDragManager");
dojo.require("dojo.dnd.DragAndDrop");

dojo.require("dojo.animation.*");
dojo.require("dojo.dom");
dojo.require("dojo.style");
dojo.require("dojo.html");
dojo.require("dojo.lang.extras");

dojo.dnd.HtmlDragSource = function(node, type){
	node = dojo.byId(node);
	this.constrainToContainer = false;
	if(node){
		this.domNode = node;
		this.dragObject = node;

		// register us
		dojo.dnd.DragSource.call(this);

		// set properties that might have been clobbered by the mixin
		this.type = type||this.domNode.nodeName.toLowerCase();
	}

}

dojo.inherits(dojo.dnd.HtmlDragSource, dojo.dnd.DragSource);

dojo.lang.extend(dojo.dnd.HtmlDragSource, {
	dragClass: "", // CSS classname(s) applied to node when it is being dragged

	onDragStart: function(){
		var dragObj = new dojo.dnd.HtmlDragObject(this.dragObject, this.type);
		if(this.dragClass) { dragObj.dragClass = this.dragClass; }

		if (this.constrainToContainer) {
			dragObj.constrainTo(this.constrainingContainer || this.domNode.parentNode);
		}

		return dragObj;
	},

	setDragHandle: function(node){
		node = dojo.byId(node);
		dojo.dnd.dragManager.unregisterDragSource(this);
		this.domNode = node;
		dojo.dnd.dragManager.registerDragSource(this);
	},

	setDragTarget: function(node){
		this.dragObject = node;
	},

	constrainTo: function(container) {
		this.constrainToContainer = true;
		if (container) {
			this.constrainingContainer = container;
		}
	}
});

dojo.dnd.HtmlDragObject = function(node, type){
	this.domNode = dojo.byId(node);
	this.type = type;
	this.constrainToContainer = false;
	this.dragSource = null;
}

dojo.inherits(dojo.dnd.HtmlDragObject, dojo.dnd.DragObject);

dojo.lang.extend(dojo.dnd.HtmlDragObject, {
	dragClass: "",
	opacity: 0.5,
	createIframe: true,		// workaround IE6 bug

	// if true, node will not move in X and/or Y direction
	disableX: false,
	disableY: false,

	createDragNode: function() {
		var node = this.domNode.cloneNode(true);
		if(this.dragClass) { dojo.html.addClass(node, this.dragClass); }
		if(this.opacity < 1) { dojo.style.setOpacity(node, this.opacity); }
		if(dojo.render.html.ie && this.createIframe){
			with(node.style) {
				top="0px";
				left="0px";
			}
			var outer = document.createElement("div");
			outer.appendChild(node);
			this.bgIframe = new dojo.html.BackgroundIframe(outer);
			outer.appendChild(this.bgIframe.iframe);
			node = outer;
		}
		node.style.zIndex = 500;
		return node;
	},

	onDragStart: function(e){
		dojo.html.clearSelection();

		var mouse = dojo.html.getCursorPosition(e);

		this.scrollOffset = {
			top: dojo.html.getScrollTop(),
			left: dojo.html.getScrollLeft()
		};

		this.dragStartPosition = {top: dojo.style.getAbsoluteY(this.domNode, true),
			left: dojo.style.getAbsoluteX(this.domNode, true)};


		this.dragOffset = {top: this.dragStartPosition.top - mouse.y,
			left: this.dragStartPosition.left - mouse.x};

		this.dragClone = this.createDragNode();


 		if ((this.domNode.parentNode.nodeName.toLowerCase() == 'body') || (dojo.style.getComputedStyle(this.domNode.parentNode,"position") == "static")) {
			this.parentPosition = {top: 0, left: 0};
		} else {
			this.parentPosition = {top: dojo.style.getAbsoluteY(this.domNode.parentNode, true),
				left: dojo.style.getAbsoluteX(this.domNode.parentNode, true)};
		}

		if (this.constrainToContainer) {
			this.constraints = this.getConstraints();
		}

		// set up for dragging
		with(this.dragClone.style){
			position = "absolute";
			top = this.dragOffset.top + mouse.y + "px";
			left = this.dragOffset.left + mouse.x + "px";
		}

		document.body.appendChild(this.dragClone);
	},

	getConstraints: function() {

		if (this.constrainingContainer.nodeName.toLowerCase() == 'body') {
			width = dojo.html.getViewportWidth();
			height = dojo.html.getViewportHeight();
			padLeft = 0;
			padTop = 0;
		} else {
			width = dojo.style.getContentWidth(this.constrainingContainer);
			height = dojo.style.getContentHeight(this.constrainingContainer);
			padLeft = dojo.style.getPixelValue(this.constrainingContainer, "padding-left", true);
			padTop = dojo.style.getPixelValue(this.constrainingContainer, "padding-top", true);
		}

		return {
			minX: padLeft,
			minY: padTop,
			maxX: padLeft+width - dojo.style.getOuterWidth(this.domNode),
			maxY: padTop+height - dojo.style.getOuterHeight(this.domNode)
		}
	},

	updateDragOffset: function() {
		var sTop = dojo.html.getScrollTop();
		var sLeft = dojo.html.getScrollLeft();
		if(sTop != this.scrollOffset.top) {
			var diff = sTop - this.scrollOffset.top;
			this.dragOffset.top += diff;
			this.scrollOffset.top = sTop;
		}
	},

	/** Moves the node to follow the mouse */
	onDragMove: function(e){
		var mouse = dojo.html.getCursorPosition(e);
		this.updateDragOffset();
		var x = this.dragOffset.left + mouse.x;
		var y = this.dragOffset.top + mouse.y;

		if (this.constrainToContainer) {
			if (x < this.constraints.minX) { x = this.constraints.minX; }
			if (y < this.constraints.minY) { y = this.constraints.minY; }
			if (x > this.constraints.maxX) { x = this.constraints.maxX; }
			if (y > this.constraints.maxY) { y = this.constraints.maxY; }
		}

		if(!this.disableY) { this.dragClone.style.top = y + "px"; }
		if(!this.disableX) { this.dragClone.style.left = x + "px"; }
	},

	/**
	 * If the drag operation returned a success we reomve the clone of
	 * ourself from the original position. If the drag operation returned
	 * failure we slide back over to where we came from and end the operation
	 * with a little grace.
	 */
	onDragEnd: function(e){
		switch(e.dragStatus){

			case "dropSuccess":
				dojo.dom.removeNode(this.dragClone);
				this.dragClone = null;
				break;

			case "dropFailure": // slide back to the start
				var startCoords = [dojo.style.getAbsoluteX(this.dragClone, true),
							dojo.style.getAbsoluteY(this.dragClone, true)];
				// offset the end so the effect can be seen
				var endCoords = [this.dragStartPosition.left + 1,
					this.dragStartPosition.top + 1];

				// animate
				var line = new dojo.math.curves.Line(startCoords, endCoords);
				var anim = new dojo.animation.Animation(line, 300, 0, 0);
				var dragObject = this;
				dojo.event.connect(anim, "onAnimate", function(e) {
					dragObject.dragClone.style.left = e.x + "px";
					dragObject.dragClone.style.top = e.y + "px";
				});
				dojo.event.connect(anim, "onEnd", function (e) {
					// pause for a second (not literally) and disappear
					dojo.lang.setTimeout(dojo.dom.removeNode, 200,
						dragObject.dragClone);
				});
				anim.play();
				break;
		}

		// shortly the browser will fire an onClick() event,
		// but since this was really a drag, just squelch it
		dojo.event.connect(this.domNode, "onclick", this, "squelchOnClick");
	},

	squelchOnClick: function(e){
		// squelch this onClick() event because it's the result of a drag (it's not a real click)
		e.preventDefault();

		// but if a real click comes along, allow it
		dojo.event.disconnect(this.domNode, "onclick", this, "squelchOnClick");
	},

	constrainTo: function(container) {
		this.constrainToContainer=true;
		if (container) {
			this.constrainingContainer = container;
		} else {
			this.constrainingContainer = this.domNode.parentNode;
		}
	}
});

dojo.dnd.HtmlDropTarget = function(node, types){
	if (arguments.length == 0) { return; }
	this.domNode = dojo.byId(node);
	dojo.dnd.DropTarget.call(this);
	if(types && dojo.lang.isString(types)) {
		types = [types];
	}
	this.acceptedTypes = types || [];
}
dojo.inherits(dojo.dnd.HtmlDropTarget, dojo.dnd.DropTarget);

dojo.lang.extend(dojo.dnd.HtmlDropTarget, {
	onDragOver: function(e){
		if(!this.accepts(e.dragObjects)){ return false; }

		// cache the positions of the child nodes
		this.childBoxes = [];
		for (var i = 0, child; i < this.domNode.childNodes.length; i++) {
			child = this.domNode.childNodes[i];
			if (child.nodeType != dojo.dom.ELEMENT_NODE) { continue; }
			var top = dojo.style.getAbsoluteY(child, true);
			var bottom = top + dojo.style.getInnerHeight(child);
			var left = dojo.style.getAbsoluteX(child, true);
			var right = left + dojo.style.getInnerWidth(child);
			this.childBoxes.push({top: top, bottom: bottom,
				left: left, right: right, node: child});
		}

		// TODO: use dummy node

		return true;
	},

	_getNodeUnderMouse: function(e){
		var mouse = dojo.html.getCursorPosition(e);

		// find the child
		for (var i = 0, child; i < this.childBoxes.length; i++) {
			with (this.childBoxes[i]) {
				if (mouse.x >= left && mouse.x <= right &&
					mouse.y >= top && mouse.y <= bottom) { return i; }
			}
		}

		return -1;
	},

	createDropIndicator: function() {
		this.dropIndicator = document.createElement("div");
		with (this.dropIndicator.style) {
			position = "absolute";
			zIndex = 1;
			borderTopWidth = "1px";
			borderTopColor = "black";
			borderTopStyle = "solid";
			width = dojo.style.getInnerWidth(this.domNode) + "px";
			left = dojo.style.getAbsoluteX(this.domNode, true) + "px";
		}
	},

	onDragMove: function(e, dragObjects){
		var i = this._getNodeUnderMouse(e);

		if(!this.dropIndicator){
			this.createDropIndicator();
		}

		if(i < 0) {
			if(this.childBoxes.length) {
				var before = (dojo.html.gravity(this.childBoxes[0].node, e) & dojo.html.gravity.NORTH);
			} else {
				var before = true;
			}
		} else {
			var child = this.childBoxes[i];
			var before = (dojo.html.gravity(child.node, e) & dojo.html.gravity.NORTH);
		}
		this.placeIndicator(e, dragObjects, i, before);

		if(!dojo.html.hasParent(this.dropIndicator)) {
			document.body.appendChild(this.dropIndicator);
		}
	},

	placeIndicator: function(e, dragObjects, boxIndex, before) {
		with(this.dropIndicator.style){
			if (boxIndex < 0) {
				if (this.childBoxes.length) {
					top = (before ? this.childBoxes[0].top
						: this.childBoxes[this.childBoxes.length - 1].bottom) + "px";
				} else {
					top = dojo.style.getAbsoluteY(this.domNode, true) + "px";
				}
			} else {
				var child = this.childBoxes[boxIndex];
				top = (before ? child.top : child.bottom) + "px";
			}
		}
	},

	onDragOut: function(e) {
		if(this.dropIndicator) {
			dojo.dom.removeNode(this.dropIndicator);
			delete this.dropIndicator;
		}
	},

	/**
	 * Inserts the DragObject as a child of this node relative to the
	 * position of the mouse.
	 *
	 * @return true if the DragObject was inserted, false otherwise
	 */
	onDrop: function(e){
		this.onDragOut(e);

		var i = this._getNodeUnderMouse(e);

		if (i < 0) {
			if (this.childBoxes.length) {
				if (dojo.html.gravity(this.childBoxes[0].node, e) & dojo.html.gravity.NORTH) {
					return this.insert(e, this.childBoxes[0].node, "before");
				} else {
					return this.insert(e, this.childBoxes[this.childBoxes.length-1].node, "after");
				}
			}
			return this.insert(e, this.domNode, "append");
		}

		var child = this.childBoxes[i];
		if (dojo.html.gravity(child.node, e) & dojo.html.gravity.NORTH) {
			return this.insert(e, child.node, "before");
		} else {
			return this.insert(e, child.node, "after");
		}
	},

	insert: function(e, refNode, position) {
		var node = e.dragObject.domNode;

		if(position == "before") {
			return dojo.html.insertBefore(node, refNode);
		} else if(position == "after") {
			return dojo.html.insertAfter(node, refNode);
		} else if(position == "append") {
			refNode.appendChild(node);
			return true;
		}

		return false;
	}
});
