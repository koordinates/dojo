dojo.provide("dojo.dnd.HtmlDragSource");
dojo.provide("dojo.dnd.HtmlDropTarget");
dojo.provide("dojo.dnd.HtmlDragObject");

dojo.dnd.HtmlDragSource = function () {}

dojo.dnd.HtmlDragSource.prototype = {
	/*
	 * Default is for the DragSource == DragObject so we don't
	 * handle any magic here
	 */	
}

dojo.dnd.HtmlDragObject = function () {}

dojo.dnd.HtmlDragObject.prototype = {  
	/**
	 * Creates a clone of this node and replaces this node with the clone in the
	 * DOM tree. This is done to prevent the browser from selecting the textual
	 * content of the node. This node is then set to opaque and drags around as
	 * the intermediate representation.
	 */
	onDragStart: function (e) {
		this.dragStartPosition = {top: dojo.xml.htmlUtil.getAbsoluteY(this),
			left: dojo.xml.htmlUtil.getAbsoluteX(this)};
	
		this.dragOffset = {top: this.dragStartPosition.top - e.clientY,
			left: this.dragStartPosition.left - e.clientX};
	
		this.dragClone = this.cloneNode(true);
		this.parentNode.replaceChild(this.dragClone, this);
		
		// set up for dragging
		with (this.style) {
			position = "absolute";
			top = this.dragOffset.top + e.clientY + "px";
			left = this.dragOffset.left + e.clientY + "px";
		}
		dojo.xml.htmlUtil.setOpacity(this, 0.5);
		document.body.appendChild(this);
		
		if (!e.dragObject) { return this; }
	},
	
	/** Moves the node to follow the mouse */
	onDragMove: function (e) {
		this.style.top = this.dragOffset.top + e.clientY + "px";
		this.style.left = this.dragOffset.left + e.clientY + "px";
	},

	/**
	 * If the drag operation returned a success we reomve the clone of
	 * ourself from the original position. If the drag operation returned
	 * failure we slide back over to where we came from and end the operation
	 * with a little grace.
	 */
	onDragEnd: function (e) {
		swicth (e.dragStatus) {

			case "dropSuccess":
				this.dragClone.parentNode.removeChild(this.dragClone);
				break;
		
			case "dropFailure": // slide back to the start
		
				with (dojo.xml.htmlUtil) {
					var startCoords = [getAbsoluteX(this), getAbsoluteY(this)];
				}
				// offset the end so the effect can be seen
				var endCoords = [this.dragStartPosition.top + 1,
					this.dragStartPosition.top + 1];
	
				// animate
				var line = new dojo.math.curves.Line(startCoords, endCoords);
				var anim = new dojo.animation.Animation(line, 300, 0, 0);
				var dragObject = this;
				dojo.event.connect(anim, "onAnimate", function(e) {
					dragObject.style.left = e.x + "px";
					dragObject.style.top = e.y + "px";
				});
				dojo.event.connect(anim, "onEnd", function (e) {
					// pause for a second (not literally) and disappear
					setTimeout(function () {
						dragObject.dragClone.parentNode.replaceChild(
							dragObject, dragObject.dragClone);
					}, 100);
				});
				anim.play();
				break;
		}
	}
}

dojo.dnd.HtmlDropTarget = function () {}

dojo.dnd.HtmlDropTarget.prototype = {
	onDragOver: function (e) {
		// TODO: draw an outline
	},
	
	onDragMove: function (e) {
		// TODO: indicate position at which the DragObject will get inserted
	},

	onDragOut: function (e) {
		// TODO: remove inidication from previous method
	},
	
	/**
	 * Inserts the DragObject as a child of this node relative to the
	 * position of the mouse.
	 *
	 * @return true if the DragObject was inserted, false otherwise
	 */
	onDrop: function (e) {
		var child = e.target;
		while (child.parentNode && child.parentNode != this) {
			child = child.parentNode;
		}
		
		if (child) {
			with (dojo.xml) {
				if (htmlUtil.gravity(child, e) & htmlUtil.gravity.NORTH) {
					domUtil.before(child, e.dragObject);
				} else {
					domUtil.after(child, e.dragObject);			
				}
			}
			return true;
		} else {
			return false;
		}
	}
}

