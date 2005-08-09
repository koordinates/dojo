dojo.provide("dojo.dnd.DragSource");
dojo.provide("dojo.dnd.DropTarget");
dojo.provide("dojo.dnd.DragObject");

/**
 * Drag and Drop events:
 * 
 * - ondrag fired when a drag operation begins
 * - ondrop fired when a drag operation ends
 * 
 * - ondragover
 * - ondragenter
 * 
 * - ondragout
 * - ondragleave
 *
 * - ondragmove
 * - ondrag
 */

dojo.dnd.DragSource = function(){
}

dojo.lang.extend(dojo.dnd.DragSource, {
	onDragEnd: function(){
	},
	
	onDragStart: function(){
	}
	
});

dojo.dnd.DragObject = function(){
}

dojo.lang.extend(dojo.dnd.DragObject, {
	onDragStart: function(){
		// gets called directly after being created by the DragSource
		// default action is to clone self as icon
	},
	
	onDragMove: function(){
		// this changes the UI for the drag icon
		//	"it moves itself"
	},

	onDragOver: function(){
	},
	
	onDragOut: function(){
	},
	
	onDragEnd: function(){
	},

	// normal aliases
	onDragLeave: onDragOut,
	onDragEnter: onDragOver,

	// non-camel aliases
	ondragout: onDragOut,
	ondragover: onDragOver
});

dojo.dnd.DropTarget = function(){
}

dojo.lang.extend(dojo.dnd.DropTarget, {
	onDragOver: function(){
	},
	
	onDragOut: function(){
	},
	
	onDragMove: function(){
	},
	
	onDrop: function(dragSource){
		
	}
});

dojo.dnd.DragEvent = function(){
	this.dragSource = null;
	this.dragObject = null;
	this.target = null;
	this.eventSatus = "success"; 
	//
	// can be one of:
	//	[	"dropSuccess", "dropFailure", "dragMove", 
	//		"dragStart", "dragEnter", "dragLeave"]
	//
}

dojo.dnd.ISortable = function (){}

dojo.lang.extend(dojo.dnd.ISortable, {
	ondragstart: function (e) {
		
		return this;
	},
});


