dojo.provide("dojo.dnd.HtmlDragMove");
dojo.provide("dojo.dnd.HtmlDragMoveSource");
dojo.provide("dojo.dnd.HtmlDragMoveObject");
dojo.require("dojo.dnd.*");

dojo.dnd.HtmlDragMoveSource = function(node, type){
	dojo.dnd.HtmlDragSource.call(this, node, type);
}

dojo.inherits(dojo.dnd.HtmlDragMoveSource, dojo.dnd.HtmlDragSource);

dojo.lang.extend(dojo.dnd.HtmlDragMoveSource, {
	onDragStart: function(){
		var dragObj =  new dojo.dnd.HtmlDragMoveObject(this.dragObject, this.type);

		if (this.constrainToContainer) {
			dragObj.constrainTo(this.constrainingContainer);
		}
		return dragObj;
	}
});

dojo.dnd.HtmlDragMoveObject = function(node, type){
	dojo.dnd.HtmlDragObject.call(this, node, type);
}

dojo.inherits(dojo.dnd.HtmlDragMoveObject, dojo.dnd.HtmlDragObject);

dojo.lang.extend(dojo.dnd.HtmlDragMoveObject, {
	onDragEnd: function(e){
		// shortly the browser will fire an onClick() event,
		// but since this was really a drag, just squelch it
		dojo.event.connect(this.domNode, "onclick", this, "squelchOnClick");
	},
	
	onDragStart: function(e){

		dojo.html.clearSelection();

		var mouse = dojo.html.getCursorPosition(e);

		this.dragClone = this.domNode;

		this.scrollOffset = dojo.html.getScrollOffset();
		this.dragStartPosition = dojo.style.getAbsolutePosition(this.domNode, true);
		
		this.dragOffset = {y: this.dragStartPosition.y - mouse.y,
			x: this.dragStartPosition.x - mouse.x};

		if (this.domNode.parentNode.nodeName.toLowerCase() == 'body') {
			this.parentPosition = {y: 0, x: 0};
		} else {
			this.parentPosition = dojo.style.getAbsolutePosition(this.domNode.parentNode, true);
		}

		this.dragClone.style.position = "absolute";

		if (this.constrainToContainer) {
			this.constraints = this.getConstraints();
		}
	}

});
