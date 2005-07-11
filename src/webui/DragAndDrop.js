dojo.hostenv.startPackage("dojo.webui.DragAndDrop");
dojo.hostenv.startPackage("dojo.webui.selection");
dojo.hostenv.startPackage("dojo.webui.dragAndDrop");
dojo.hostenv.startPackage("dojo.webui.DragSource");
dojo.hostenv.startPackage("dojo.webui.DropTarget");
dojo.hostenv.startPackage("dojo.webui.DragAndDropManager");

dojo.webui.DragSource = function(){
	// The interface that all drag data sources MUST implement
	this.isDragSource = true;

	this.startDrag = function(){
	}

	this.endDrag = function(){
	}

	this.getDragIcon = function(){
	}

	this.getTypes = function(){
		// DragSource objects MUST include a selection property or overload
		// this method
		if(this.selection){
			return this.selection.getTypes();
		}
		return [];
	}
}

dojo.webui.DropTarget = function(){
	// The interface that all components that accept drops MUST implement
	this.acceptedTypes = []; // strings

	this.handleDrag = function(dragSourceObj){ 
	}

	this.dragEnter = function(dragSourceObj){ 
	}

	this.dragLeave = function(dragSourceObj){
	}

	this.acceptDrag = function(dragSourceObj){
		if(!dragSourceObj){ return false; }
		if(!dragSourceObj["getTypes"]){ 
			// dj_debug("won't accept");
			return false; 
		}
		var dtypes = dragSourceObj.getTypes();
		if(dtypes.length == 0){
			// dj_debug("won't accept");
			return false; 
		}
		for(var x=0; x<dtypes.length; x++){
			if(!dojo.alg.inArray(this.acceptedTypes, dtypes[x])){
				return false;
			}
		}
		// dj_debug(this.widgeType+" will accept!");
		return true;
	}

	this.handleDrop = function(dragSourceObj){
		// this is the default action. it's not very smart and so this method
		// should be over-ridden by widgets wanting to handle drops
		var sel = dragSourceObj.selection.selected;
		for(var x=0;x<sel.length; x++){
			var tmp = dragSourceObj.removeChild(sel[x]);
			// dj_debug(tmp);
			this.addChild(tmp);
		}
		return false;
	}
}

dojo.webui.DragAndDropManager = function(){
	
	this.hoverTarget = null;
	this.dragSource = null;
	this.dropTarget = null;
	this.isDragging = false;
	this.targetAccepts = false;

	// FIXME: should these be replaced by some DOM/HTML variant? is there some
	// other method they should call?
	this.keyDown = function(nativeEvt){ return; }
	this.mouseOver = function(widget){ return; }
	this.mouseOut = function(widget){ return; }
	this.mouseMove = function(widget){ return; }
	this.mouseDown = function(){ return; }
	this.mouseUp = function(nativeEvt){ this.drop(nativeEvt); }
	this.mouseDrag = function(nativeEvt){ return; }
	this.startDrag = function(nativeEvt){ return; }
	this.checkForResize = function(nativeEvt){ return; }
	this.checkForDrag = function(nativeEvt){ return; }

	this.checkTargetAccepts = function(){
		if((this.dropTarget)&&(this.dropTarget["acceptDrag"])&&(this.dropTarget.acceptDrag(this.dragSource))){
			this.targetAccepts = true;
		}else{
			this.targetAccepts = false;
			// FIXME: visually signal that the drop won't work!
		}
		return this.targetAccepts;
	}

	this.drag = function(nativeEvt){
		// FIXME: when dragging over a potential drop target, we must ask it if
		// it can accept our selected items. Need to preform that check here
		// and provide visual feedback.
		this.checkTargetAccepts();
		if((this.dropTarget)&&(this.dragSource)){
			this.dropTarget.handleDrag(this.dragSource, nativeEvt);
		}
	}

	this.drop = function(nativeEvt){
		// FIXME: we need to pass dojo.webui.selection to the drop target here.
		// If rejected, need to provide visual feedback of rejection. Need to
		// determine how to handle copy vs. move drags and if that can/should
		// be set by the dragged items or the receiver of the drop event.
		if((this.dropTarget)&&(this.dragSource)&&(this.targetAccepts)){
			this.dropTarget.handleDrop(this.dragSource, nativeEvt);
		}
	}
}

/* FIXME:
 *	The base widget classes should support drag-and-drop completely, but
 *	perhaps through a mixin.  Firstly, any widget should implement a "drop"
 *	handler that implements multiple states. The first state is an accepted
 *	drop, in which case the widget is passed to the There needs to be support
 *	for an acception rubric based on type and/or some other set of handler
 *	functions that can act as gatekeepers. These acceptance functions should be
 *	settable through property sets on a type or instance basis.  Likewise, a
 *	"provisional" state which eventually results in the accepted or denied
 *	states must be supported (at least visually). A drop-rejection must also be
 *	made available, in which the widget "move" is never completed, but the
 *	provisional drop is rolled back visually.
 */

// FIXME: need to support types of drops other than movement, such as copying.
//		  Should this be modifiable keystrokes in order to set what should be
//		  done?
// FIXME: need to select collections of selected objects. Is this a clipboard
// 		  concept? Will we want our own clipboard?

dojo.webui.Selection = function(){

	this.selected = [];
	var selectionIndexProp = "_dojo.webui.selection.index";
	// var selectionTypeProp = "_dojo.webui.selection.type";

	this.add = function(obj, type){
		if(typeof obj["setSelected"] == "function"){
			obj.setSelected(true);
		}
		// obj[selectionIndexProp] = this.selected.length;
		this.selected.push([obj, ((!type) ? (new String(typeof obj)) : type)]);
		// obj[selectionTypeProp] = (!type) ? (new String(typeof obj)) : type;
		// dj_debug(obj[selectionTypeProp]);
	}

	this.getSelected = function(){
		var ret = [];
		for(var x=0; x<this.selected.length; x++){
			if(this.selected[x]){
				ret.push({
					value: this.selected[x][0],
					type: this.selected[x][1]
				});
			}
		}
		return ret;
	}

	this.getTypes = function(){
		var uniqueTypes = [];
		for(var x=0; x<this.selected.length; x++){
			// var st = this.selected[x][selectionTypeProp];
			var st = this.selected[x][1];
			if((this.selected[x])&&(!uniqueTypes[st])){
				uniqueTypes[st] = true;
				uniqueTypes.push(st);
			}
		}
		return uniqueTypes;
	}

	this.addMultiple = function(){
		// FIXME: how do we pass type info!?
		for(var x=0; x<arguments.length; x++){
			this.add(arguments[x]);
		}
	}

	this.remove = function(obj){
		if(typeof obj["setSelected"] == "function"){
			obj.setSelected(false);
		}
		if(typeof obj[selectionIndexProp] != "undefined"){
		}else{
			for(var x=0; x<this.selected.length; x++){
				if(this.selected[x] === obj){
					// delete this.selected[x][selectionIndexProp];
					// delete this.selected[x][selectionTypeProp];
					delete this.selected[x];
				}
			}
		}
	}

	this.clear = function(){
		for(var x=0; x<this.selected.length; x++){
			if(this.selected[x]){
				this.remove(this.selected[x]);
			}
		}
		this.selected = [];
	}
}

