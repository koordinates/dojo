dojo.provide("dojo.dnd.HtmlDragAndDrop");
dojo.provide("dojo.dnd.HtmlDragSource");
dojo.provide("dojo.dnd.HtmlDropTarget");
dojo.provide("dojo.dnd.HtmlDragObject");
dojo.require("dojo.dnd.HtmlDragManager");
dojo.require("dojo.animation.*");

dojo.dnd.HtmlDragSource = function(node, type){
	this.domNode = node;
	// register us
	dojo.dnd.DragSource.call(this);

	// set properties that might have been clobbered by the mixin
	this.type = type||this.domNode.nodeName.toLowerCase();
}

dojo.lang.extend(dojo.dnd.HtmlDragSource, {
	onDragStart: function(){
		return new dojo.dnd.HtmlDragObject(this.domNode, this.type);
	}
});

dojo.dnd.HtmlDragObject = function(node, type){
	this.type = type;
	this.domNode = node;
}

dojo.lang.extend(dojo.dnd.HtmlDragObject, {  
	/**
	 * Creates a clone of this node and replaces this node with the clone in the
	 * DOM tree. This is done to prevent the browser from selecting the textual
	 * content of the node. This node is then set to opaque and drags around as
	 * the intermediate representation.
	 */
	onDragStart: function (e){
		if (document.selection) { document.selection.clear(); }
		else if (window.getSelection && window.getSelection().removeAllRanges) {
			window.getSelection().removeAllRanges();
		}
	
		this.dragStartPosition = {top: dojo.xml.htmlUtil.getAbsoluteY(this.domNode),
			left: dojo.xml.htmlUtil.getAbsoluteX(this.domNode)};
		
		this.dragOffset = {top: this.dragStartPosition.top - e.clientY,
			left: this.dragStartPosition.left - e.clientX};
	
		this.dragClone = this.domNode.cloneNode(true);
		//this.domNode.parentNode.replaceChild(this.dragClone, this.domNode);
		
		// set up for dragging
		with(this.dragClone.style){
			position = "absolute";
			top = this.dragOffset.top + e.clientY + "px";
			left = this.dragOffset.left + e.clientX + "px";
		}
		dojo.xml.htmlUtil.setOpacity(this.dragClone, 0.5);
		document.body.appendChild(this.dragClone);
	},
	
	/** Moves the node to follow the mouse */
	onDragMove: function (e) {
		this.dragClone.style.top = this.dragOffset.top + e.clientY + "px";
		this.dragClone.style.left = this.dragOffset.left + e.clientX + "px";
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
				dojo.xml.domUtil.remove(this.dragClone);
				this.dragClone = null;
				break;
		
			case "dropFailure": // slide back to the start
				with (dojo.xml.htmlUtil) {
					var startCoords = [	getAbsoluteX(this.dragClone), 
										getAbsoluteY(this.dragClone)];
				}
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
					dojo.lang.setTimeout(dojo.xml.domUtil.remove, 200,
						dragObject.dragClone);
				});
				anim.play();
				break;
		}
	}
});

dojo.dnd.HtmlDropTarget = function(node, types){
	if (arguments.length == 0) { return; }
	this.domNode = node;
	dojo.dnd.DropTarget.call(this);
	this.acceptedTypes = types || [];
}
dj_inherits(dojo.dnd.HtmlDropTarget, dojo.dnd.DropTarget);

dojo.lang.extend(dojo.dnd.HtmlDropTarget, {  
	onDragOver: function(e){
		if (!dojo.alg.inArray(this.acceptedTypes, "*")) { // wildcard
			for (var i = 0; i < e.dragObjects.length; i++) {
				if (!dojo.alg.inArray(this.acceptedTypes,
					e.dragObjects[i].type)) { return false; }
			}
		}
		
		// cache the positions of the child nodes
		this.childBoxes = [];
		for (var i = 0, child; i < this.domNode.childNodes.length; i++) {
			child = this.domNode.childNodes[i];
			if (child.nodeType != dojo.xml.domUtil.nodeTypes.ELEMENT_NODE) { continue; }
			with(dojo.xml.htmlUtil){
				var top = getAbsoluteY(child);
				var bottom = top + getInnerHeight(child);
				var left = getAbsoluteX(child);
				var right = left + getInnerWidth(child);
			}
			this.childBoxes.push({top: top, bottom: bottom,
				left: left, right: right, node: child});
		}
		
		return true;
	},
	
	_getNodeUnderMouse: function (e) {
		var mousex = e.pageX || e.clientX + document.body.scrollLeft;
		var mousey = e.pageY || e.clientY + document.body.scrollTop;

		// find the child
		for (var i = 0, child; i < this.childBoxes.length; i++) {
			with (this.childBoxes[i]) {
				if (mousex >= left && mousex <= right &&
					mousey >= top && mousey <= bottom) { return i; }
			}
		}
	},
	
	onDragMove: function(e) {
		var i = this._getNodeUnderMouse(e);
		if (!dojo.lang.isNumber(i)) { return; }
		
		if (!this.dropIndicator) {
			this.dropIndicator = document.createElement("div");
			with (this.dropIndicator.style) {
				position = "absolute";
				background = "black";
				height = "1px";
				width = dojo.xml.htmlUtil.getInnerWidth(this.domNode) + "px";
				left = dojo.xml.htmlUtil.getAbsoluteX(this.domNode) + "px";
			}
		}		
		with (this.dropIndicator.style) {
			var nudge = 0, gravity = dojo.xml.htmlUtil.gravity;
			if (gravity(this.childBoxes[i].node, e) & gravity.SOUTH) {
				if (this.childBoxes[i + 1]) { i += 1; }
				else { nudge = this.childBoxes[i].bottom - this.childBoxes[i].top; }
			}
			top = this.childBoxes[i].top + nudge + "px";
		}
		if (!this.dropIndicator.parentNode) {
			document.body.appendChild(this.dropIndicator);
		}
	},

	onDragOut: function(e) {
		dojo.xml.domUtil.remove(this.dropIndicator);
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
		if (!dojo.lang.isNumber(i)) { return false; }

		var gravity = dojo.xml.htmlUtil.gravity, child = this.childBoxes[i].node;
		if (gravity(child, e) & gravity.SOUTH) {
			dojo.xml.domUtil.after(e.dragObject.domNode, child);
		} else {
			dojo.xml.domUtil.before(e.dragObject.domNode, child);
		}
		
		return true;
	}
});
