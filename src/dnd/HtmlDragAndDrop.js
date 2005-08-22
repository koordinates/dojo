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
		this.dragStartPosition = {top: dojo.xml.htmlUtil.getAbsoluteY(this.domNode),
			left: dojo.xml.htmlUtil.getAbsoluteX(this.domNode)};
	
		this.dragOffset = {top: this.dragStartPosition.top - e.clientY,
			left: this.dragStartPosition.left - e.clientX};
	
		this.dragClone = this.domNode.cloneNode(true);
		this.domNode.parentNode.replaceChild(this.dragClone, this.domNode);
		
		// set up for dragging
		with(this.domNode.style){
			position = "absolute";
			top = this.dragOffset.top + e.clientY + "px";
			left = this.dragOffset.left + e.clientY + "px";
		}
		dojo.xml.htmlUtil.setOpacity(this.domNode, 0.5);
		document.body.appendChild(this.domNode);
		
		if(!e.dragObject){ return this; }
	},
	
	/** Moves the node to follow the mouse */
	onDragMove: function (e) {
		this.domNode.style.top = this.dragOffset.top + e.clientY + "px";
		this.domNode.style.left = this.dragOffset.left + e.clientX + "px";
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
				with(this.domNode.style){
					position = "";
					left = "";
					top = "";
				}
				this.dragClone.parentNode.removeChild(this.dragClone);
				this.dragClone = null;
				dojo.xml.htmlUtil.setOpacity(this.domNode, 1.0);
				break;
		
			case "dropFailure": // slide back to the start
				with (dojo.xml.htmlUtil) {
					var startCoords = [	getAbsoluteX(this.domNode), 
										getAbsoluteY(this.domNode)];
				}
				// offset the end so the effect can be seen
				var endCoords = [this.dragStartPosition.top + 1,
					this.dragStartPosition.top + 1];
	
				// animate
				var line = new dojo.math.curves.Line(startCoords, endCoords);
				var anim = new dojo.animation.Animation(line, 300, 0, 0);
				var dragObject = this;
				dojo.event.connect(anim, "onAnimate", function(e) {
					dragObject.domNode.style.left = e.x + "px";
					dragObject.domNode.style.top = e.y + "px";
				});
				dojo.event.connect(anim, "onEnd", function (e) {
					// pause for a second (not literally) and disappear
					setTimeout(function (){
						dojo.xml.htmlUtil.setOpacity(dragObject.domNode, 1.0);
						dragObject.dragClone.parentNode.replaceChild(
							dragObject.domNode, dragObject.dragClone);
						with(dragObject.domNode.style){
							position = "";
							left = "";
							top = "";
						}
					}, 100);
				});
				anim.play();
				break;
		}
	}
});

dojo.dnd.HtmlDropTarget = function(node, types){
	this.domNode = node;
	dojo.dnd.DropTarget.call(this);
	this.acceptedTypes = types||[];
}

dojo.lang.extend(dojo.dnd.HtmlDropTarget, {  
	onDragOver: function(e){
		var dos = e.dragObjects;
		if(!dos){ return false; }
		var canDrop = false;
		var _this = this;
		dojo.alg.forEach(dos, function(tdo){
			/*
			dojo.alg.forEach(_this.acceptedTypes, function(tmpType){
				dj_debug(tdo.type, tmpType);
			});
			*/
			if((_this.acceptedTypes)&&(dojo.alg.inArray(_this.acceptedTypes, tdo.type))){
				canDrop = true;
				return "break";
			}
		});
		
		// dj_debug("can drop: ", canDrop);
		this.domNode.style.border = "1px solid "+(canDrop ? "black" : "red");
		return canDrop;
	},
	
	onDragMove: function(e){
		// TODO: indicate position at which the DragObject will get inserted
	},

	onDragOut: function(e){
		// TODO: remove inidication from previous method
		this.domNode.style.border = "";
	},
	
	/**
	 * Inserts the DragObject as a child of this node relative to the
	 * position of the mouse.
	 *
	 * @return true if the DragObject was inserted, false otherwise
	 */
	onDrop: function(e){
		this.onDragOut(e);
		var child = e.dropTarget;
		if(child != this.domNode){
			while((child.parentNode)&&(child.parentNode != this.domNode)){
				child = child.parentNode;
			}
		}
		
		if(child){
			with(dojo.xml){
				var edn = e.dragObject.domNode;
				htmlUtil.setOpacity(edn, 1.0);
				if(htmlUtil.gravity(child, e) & htmlUtil.gravity.NORTH){
					// dj_debug("north gravity");
					domUtil.before(edn, child);
				}else{
					// dj_debug("other gravity");
					domUtil.after(edn, child);
				}
			}
			return true;
		}else{
			return false;
		}
	}
});
