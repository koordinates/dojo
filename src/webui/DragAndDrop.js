dojo.hostenv.startPackage("dojo.webui.selection");
dojo.hostenv.startPackage("dojo.webui.dragAndDropManager");
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

dojo.webui.selection = new function(){

	var selected = [];
	var selectionIndexProp = "_dojo.webui.selection.index";
	var selectionTypeProp = "_dojo.webui.selection.type";

	this.add = function(obj, type){
		if(typeof obj["setSelected"] == "function"){
			obj.setSelected(true);
		}
		obj[selectionIndexProp] = selected.length;
		selected.push(obj[selectionIndexProp]);
		obj[selectionTypeProp] = (!type) ? (new String(typeof obj)) : type;
	}

	this.getTypes = function(){
		var uniqueTypes = [];
		for(var x=0; x<selected.length; x++){
			var st = selected[x][selectionTypeProp];
			if((selected[x])&&(!uniqueTypes[st])){
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
		dj_debug("remove widget");
		if(typeof obj["setSelected"] == "function"){
			obj.setSelected(false);
		}
		if(typeof obj[selectionIndexProp] != "undefined"){
		}else{
			for(var x=0; x<selected.length; x++){
				if(selected[x] === obj){
					delete selected[x][selectionIndexProp];
					delete selected[x][selectionTypeProp];
					delete selected[x];
				}
			}
		}
	}

	this.clear = function(){
		for(var x=0; x<selected.length; x++){
			if(selected[x]){
				this.remove(selected[x]);
			}
		}
		selected = [];
	}
}

/*
dojo.webui.dragAndDropManager = new function(){
	
	var currentDropTarget = null;

	this.startDrag = function(){
		// initialize the drag either from the current dojo.webui.selection
		// list or from
	}

	this.drag = function(){
		// FIXME: when dragging over a potential drop target, we must ask it if
		// it can accept our selected items. Need to preform that check here
		// and provide visual feedback.

		// FIXME: need to cache the results so we aren't calling this willie-nilly
	}

	this.drop = function(){
		// FIXME: we need to pass dojo.webui.selection to the drop target here.
		// If rejected, need to provide visual feedback of rejection. Need to
		// determine how to handle copy vs. move drags and if that can/should
		// be set by the dragged items or the receiver of the drop event.
	}
}

dojo.webui.DragParticipant = function(){
	this.acceptedTypes = [];

	this.addAcceptedType = function(type){
		this.acceptedTypes[type] = true;
		this.acceptedTypes.push(type);
	}

	this.canDrop = function(types){
		for(var x=0; x<types.length; x++){
			if(this.acceptedTypes[types[x]]!=true){
				return false;
			}
		}
		return true;
	}

	this.acceptDrop = function(selection){
		// accepts an array of selected items and handles them.
	}
}
*/


