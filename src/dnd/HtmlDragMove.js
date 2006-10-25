dojo.provide("dojo.dnd.HtmlDragMove");
dojo.require("dojo.dnd.*");

dojo.declare("dojo.dnd.HtmlDragMoveSource", dojo.dnd.HtmlDragSource, {
	onDragStart: function(){
		var dragObj =  new dojo.dnd.HtmlDragMoveObject(this.dragObject, this.type);
		if (this.constrainToContainer) {
			dragObj.constrainTo(this.constrainingContainer);
		}
		return dragObj;
	},
	/*
	 * see dojo.dnd.HtmlDragSource.onSelected
	 */
	onSelected: function() {
		for (var i=0; i<this.dragObjects.length; i++) {
			dojo.dnd.dragManager.selectedSources.push(new dojo.dnd.HtmlDragMoveSource(this.dragObjects[i]));
		}
	}
});

dojo.declare("dojo.dnd.HtmlDragMoveObject", dojo.dnd.HtmlDragObject, {
	onDragEnd: function(e){
	},
	onDragStart: function(e){
		dojo.html.clearSelection();

		this.dragClone = this.domNode;

		if(dojo.html.getComputedStyle(this.domNode, 'position') == 'absolute'){
			this.dragStartPosition = dojo.html.abs(this.domNode, true);
		}else{
			this.domNode.style.position = "relative";
			var left = parseInt(dojo.html.getComputedStyle(this.domNode, 'left'));
			var top = parseInt(dojo.html.getComputedStyle(this.domNode, 'top'));
			this.dragStartPosition = {
				x: isNaN(left) ? 0 : left,
				y: isNaN(top) ? 0 : top
			};
		}	

		this.scrollOffset = dojo.html.getScroll().offset;
		
		this.dragOffset = {y: this.dragStartPosition.y - e.pageY,
			x: this.dragStartPosition.x - e.pageX};

		this.containingBlockPosition = this.domNode.offsetParent ? 
			dojo.html.abs(this.domNode.offsetParent, true) : {x:0, y:0};

		if (this.constrainToContainer) {
			this.constraints = this.getConstraints();
		}

		// shortly the browser will fire an onClick() event,
		// but since this was really a drag, just squelch it
		dojo.event.connect(this.domNode, "onclick", this, "_squelchOnClick");
	},
	/**
	 * Set the position of the drag node.  (x,y) is relative to <body>.
	 */
	setAbsolutePosition: function(x, y){
		// The drag clone is attached to it's constraining container so offset for that
		if(!this.disableY) { this.domNode.style.top = (y-this.containingBlockPosition.y) + "px"; }
		if(!this.disableX) { this.domNode.style.left = (x-this.containingBlockPosition.x) + "px"; }
	},
	_squelchOnClick: function(e){
		// summary
		//	this function is called to squelch this onClick() event because
		//	it's the result of a drag (ie, it's not a real click)

		dojo.event.browser.stopEvent(e);
		dojo.event.disconnect(this.domNode, "onclick", this, "_squelchOnClick");
	}
});
