dojo.provide("dojo.dnd.HtmlDragMove");
dojo.provide("dojo.dnd.HtmlDragMoveSource");
dojo.provide("dojo.dnd.HtmlDragMoveObject");
dojo.require("dojo.dnd.*");

dojo.dnd.HtmlDragMoveSource = function(node, type){
	dojo.dnd.HtmlDragSource.call(this, node, type);
}

dj_inherits(dojo.dnd.HtmlDragMoveSource, dojo.dnd.HtmlDragSource);

dojo.lang.extend(dojo.dnd.HtmlDragMoveSource, {
	onDragStart: function(){
		dj_debug("onDragStart");
		return new dojo.dnd.HtmlDragMoveObject(this.domNode, this.type);
	}
});

dojo.dnd.HtmlDragMoveObject = function(node, type){
	dojo.dnd.HtmlDragObject.call(this, node, type);
}

dj_inherits(dojo.dnd.HtmlDragMoveObject, dojo.dnd.HtmlDragObject);

dojo.lang.extend(dojo.dnd.HtmlDragMoveObject, {
	onDragEnd: function(e){
		this.dragClone = null;
		// don't do anything
	},
	onDragStart: function(e){
		if (document.selection) { document.selection.clear(); }
		else if (window.getSelection && window.getSelection().removeAllRanges) {
			window.getSelection().removeAllRanges();
		}

		this.dragClone = this.domNode;
	
		this.dragStartPosition = {top: dojo.style.getAbsoluteY(this.domNode),
			left: dojo.style.getAbsoluteX(this.domNode)};
		
		this.dragOffset = {top: this.dragStartPosition.top - e.clientY,
			left: this.dragStartPosition.left - e.clientX};
	
		this.domNode.style.position = "absolute";
	}

});
