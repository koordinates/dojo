// ensure that dojo.webui exists
dojo.hostenv.startPackage("dojo.webui.Widget");
dojo.hostenv.startPackage("dojo.webui.selection");
dojo.hostenv.startPackage("dojo.webui.dragAndDropManager");

dojo.hostenv.loadModule("dojo.event.*");
dojo.hostenv.loadModule("dojo.webui.WidgetManager");

dojo.webui.Widget = function(){
	// FIXME: need to be able to disambiguate what our rendering context is
	//        here!

	// needs to be a string with the end classname. Every subclass MUST
	// over-ride.
	this.widgetType = "Widget";

	this.parent = null;
	this.children = [];

	// obviously, top-level and modal widgets should set these appropriately
	this.isTopLevel = false;
	this.isModal = false;

	this.isEnabled = true;
	this.isHidden = false;
	this.isContainer = true; // can we contain other widgets?

	this.widgetID = -1; // FIXME: should this be null?
	
	this.enable = function(){
		// should be over-ridden
		this.isEnabled = true;
	}

	this.disable = function(){
		// should be over-ridden
		this.isEnabled = false;
	}

	this.hide = function(){
		// should be over-ridden
		this.isHidden = true;
	}

	this.show = function(){
		// should be over-ridden
		this.isHidden = false;
	}

	this.create = function(args){
		this.satisfyPropertySets(args);
		this.mixinProperties(args);
		this.buildRendering(args);
		dojo.webui.widgetManager.add(this);
	}

	this.destroy = function(){
		dojo.webui.widgetManager.remove(this);
		this.destroyRendering();
		this.cleanUp();
	}

	this.satisfyPropertySets = function(args){
		// get the default propsets for our component type
		var typePropSets = []; // FIXME: need to pull these from somewhere!
		var localPropSets = []; // pull out propsets from the parser's return structure

		/*
		for(var x=0; x<args.length; x++){
		}
		*/

		for(var x=0; x<typePropSets.length; x++){
		}

		for(var x=0; x<localPropSets.length; x++){
		}
		
		return args;
	}

	this.mixInProperties = function(args){
		/*
		 * the actual mix-in code attempts to do some type-assignment based on
		 * PRE-EXISTING properties of the "this" object. When a named property
		 * of a propset is located, it is first tested to make sure that the
		 * current object already "has one". Properties which are undefined in
		 * the base widget are NOT settable here. The next step is to try to
		 * determine type of the pre-existing property. If it's a string, the
		 * property value is simply assigned. If a function, the property is
		 * replaced with a "new Function()" declaration. If an Array, the
		 * system attempts to split the string value on ";" chars, and no
		 * further processing is attempted (conversion of array elements to a
		 * integers, for instance). If the property value is an Object
		 * (testObj.constructor === Object), the property is split first on ";"
		 * chars, secondly on ":" chars, and the resulting key/value pairs are
		 * assigned to an object in a map style. The onus is on the property
		 * user to ensure that all property values are converted to the
		 * expected type before usage.
		 */

		var undef;

		for(var x in args){
			if((typeof this[x]) != (typeof undef)){
				if(typeof this[x] == "string"){
					this[x] = args[x];
				}else if(typeof this[x] == "number"){
					this[x] = new Number(args[x]); // FIXME: what if NaN is the result?
				}else if(typeof this[x] == "function"){
					// FIXME: need to determine if always over-writing instead
					// of attaching here is appropriate. I suspect that we
					// might want to only allow attaching w/ action items.
					this[x] = new Function(args[x]);
				}else if(this[x].constructor == Array){ // typeof [] == "object"
					this[x] = args[x].split(";");
				}else if(typeof this[x] == "object"){ 
					// FIXME: should we be allowing extension here to handle
					// other object types intelligently?

					// FIXME: unlike all other types, we do not replace the
					// object with a new one here. Should we change that?
					var pairs = args[x].split(";");
					for(var y=0; y<pairs.length; y++){
						var si = pairs[y].indexOf(":");
						if((si != -1)&&(pairs[y].length>si)){
							this[x][pairs[y].substr(0, si)] = pairs[y].substr(si+1);
						}
					}
				}else{
					// the default is straight-up string assignment. When would
					// we ever hit this?
					this[x] = args[x];
				}
			}
		}
	}

	this.buildRendering = function(){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	}

	this.destroyRendering = function(){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	}

	this.cleanUp = function(){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	}

	this.addChild = function(child){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	}

	this.addChildAtIndex = function(child, index){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	}

	this.removeChild = function(childRef){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	}

	this.removeChildAtIndex = function(index){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	}

	this.resize = function(width, height){
		// both width and height may be set as percentages. The setWidth and
		// setHeight  functions attempt to determine if the passed param is
		// specified in percentage or native units. Integers without a
		// measurement are assumed to be in the native unit of measure.
		this.setWidth(width, height);
	}

	this.setWidth = function(width){
		if((typeof width == "string")&&(width.substr(-1) == "%")){
			this.setPercentageWidth(width);
		}else{
			this.setNativeWidth(width);
		}
	}

	this.setHeight = function(height){
		if((typeof height == "string")&&(height.substr(-1) == "%")){
			this.setPercentageHeight(height);
		}else{
			this.setNativeHeight(height);
		}
	}

	this.setPercentageHeight = function(height){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	}

	this.setNativeHeight = function(height){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	}

	this.setPercentageWidth = function(width){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	}

	this.setNativeWidth = function(width){
		// SUBCLASSES MUST IMPLEMENT
		return false;
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

// FIXME: need to include peering support in the dragAndDropManager
// FIXME: need to support types of drops other than movement, such as copying.
//		  Should this be modifiable keystrokes in order to set what should be
//		  done?
// FIXME: need to select collections of selected objects. Is this a clipboard
// 		  concept? Will we want our own clipboard?

dojo.webui.selection = new function(){

	var selected = [];
	var selectionIndexProp = "_dojo.webui.selection.index";

	this.add = function(obj){
		if(typeof obj["setSelected"] == "function"){
			obj.setSelected(true);
		}
		obj[selectionIndexProp] = selected.length;
		selected.push(obj[selectionIndexProp]);
	}

	this.getTypes = function(){
		var uniqueTypes = [];
		for(var x=0; x<selected.length; x++){
			// FIXME: this needs to include some sort of deliberate typing
			// mechanism. Perhaps Tom's or MDA's introspection code can be used
			// to extract the class name?
			var st = typeof selected;
			if((selected[x])&&(!uniqueTypes[st])){
				uniqueTypes[st] = true;
				uniqueTypes.push(st);
			}
		}
		return uniqueTypes;
	}

	this.addMultiple = function(){
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
			for(var x=0; x<selected.length; x++){
				if(selected[x] === obj){
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
	this.acceptedTypes = {};

	this.addAcceptedType = function(type){
		this.acceptedTypes[type] = true;
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

