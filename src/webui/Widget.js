// ensure that dojo.webui exists
dojo.hostenv.startPackage("dojo.webui.Widget");
dojo.hostenv.startPackage("dojo.webui.selection");
dojo.hostenv.startPackage("dojo.webui.dragAndDropManager");
dojo.hostenv.startPackage("dojo.webui.widgets.tags");

dojo.hostenv.loadModule("dojo.webui.WidgetManager");
dojo.hostenv.loadModule("dojo.event.*");

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
	// FIXME: need to replace this with context menu stuff
	this.rightClickItems = [];

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

	this.create = function(args, fragment){
		this.satisfyPropertySets(args, fragment);
		this.mixInProperties(args, fragment);
		this.buildRendering(args, fragment);
		this.initialize(args, fragment);
		this.postInitialize(args, fragment);
		dojo.webui.widgetManager.add(this);
	}

	this.destroy = function(widgetIndex){
		// FIXME: this is woefully incomplete
		this.uninitialize();
		this.destroyRendering();
		dojo.webui.widgetManager.remove(widgetIndex);
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

		// NOTE: we cannot assume that the passed properties are case-correct
		// (esp due to some browser bugs). Therefore, we attempt to locate
		// properties for assignment regardless of case. This may cause
		// problematic assignments and bugs in the future and will need to be
		// documented with big bright neon lights.

		// FIXME: fails miserably if a mixin property has a default value of null in 
		// a widget
		
		for(var x in args){
			var tx = this[x];
			var xorig = new String(x);
			if(!tx){
				// FIXME: this is O(n) time for each property, and thereby O(mn), which can easily be O(n^2)!!! Ack!!
				for(var y in this){
					if((new String(y)).toLowerCase()==(new String(x)).toLowerCase()){
						x = y; 
						args[y] = args[xorig];
						break;
					}
				}
			}
			
			if((typeof this[x]) != (typeof undef)){
				if(!typeof args[x] == "string"){
					this[x] = args[x];
				}else{
					if(typeof this[x] == "string"){
						this[x] = args[x];
					}else if(typeof this[x] == "number"){

						this[x] = new Number(args[x]); // FIXME: what if NaN is the result?
					}else if(typeof this[x] == "function"){

						// FIXME: need to determine if always over-writing instead
						// of attaching here is appropriate. I suspect that we
						// might want to only allow attaching w/ action items.
						
						// RAR, 1/19/05: I'm going to attach instead of
						// over-write here. Perhaps function objects could have
						// some sort of flag set on them? Or mixed-into objects
						// could have some list of non-mutable properties
						// (although I'm not sure how that would alleviate this
						// particular problem)? 

						// this[x] = new Function(args[x]);

						// after an IRC discussion last week, it was decided
						// that these event handlers should execute in the
						// context of the widget, so that the "this" pointer
						// takes correctly.
						var tn = dojo.event.nameAnonFunc(new Function(args[x]), this);
						dojo.event.connect(this, x, this, tn);
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
	}

	this.initialize = function(args, frag){
		// dj_unimplemented("dojo.webui.Widget.initialize");
		return false;
	}

	this.postInitialize = function(args, frag){
		return false;
	}

	this.uninitialize = function(){
		// dj_unimplemented("dojo.webui.Widget.uninitialize");
		return false;
	}

	this.buildRendering = function(){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.buildRendering");
		return false;
	}

	this.destroyRendering = function(){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.destroyRendering");
		return false;
	}

	this.cleanUp = function(){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.cleanUp");
		return false;
	}

	this.addChild = function(child){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.addChild");
		return false;
	}

	this.addChildAtIndex = function(child, index){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.addChildAtIndex");
		return false;
	}

	this.removeChild = function(childRef){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.removeChild");
		return false;
	}

	this.removeChildAtIndex = function(index){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.removeChildAtIndex");
		return false;
	}

	this.resize = function(width, height){
		// both width and height may be set as percentages. The setWidth and
		// setHeight  functions attempt to determine if the passed param is
		// specified in percentage or native units. Integers without a
		// measurement are assumed to be in the native unit of measure.
		this.setWidth(width);
		this.setHeight(height);
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

// TODO: should have a more general way to add tags or tag libraries?
// TODO: need a default tags class to inherit from for things like getting propertySets
// TODO: parse properties/propertySets into component attributes
// TODO: parse subcomponents
// TODO: copy/clone raw markup fragments/nodes as appropriate
dojo.webui.widgets.tags = {};
dojo.webui.widgets.tags.addParseTreeHandler = function(type){
	var ltype = type.toLowerCase();
	this[ltype] = function(fragment, widgetParser){ 
		dojo.webui.widgets.buildWidgetFromParseTree(ltype, fragment, widgetParser);
	}
}

dojo.webui.widgets.tags["dojo:propertyset"] = function(fragment, widgetParser) {
	// FIXME: Is this needed?
	// FIXME: Not sure that this parses into the structure that I want it to parse into...
	// FIXME: add support for nested propertySets
	var properties = widgetParser.parseProperties(fragment["dojo:propertyset"]);
}

// FIXME: need to add the <dojo:connect />
dojo.webui.widgets.tags["dojo:connect"] = function(fragment, widgetParser) {
	var properties = widgetParser.parseProperties(fragment["dojo:connect"]);
}

dojo.webui.widgets.buildWidgetFromParseTree = function(type, frag, parser){
	var stype = type.split(":");
	stype = (stype.length == 2) ? stype[1] : type;
	// outputObjectInfo(frag["dojo:"+stype]);
	// FIXME: we don't seem to be doing anything with this!
	var propertySets = parser.getPropertySets(frag);
	var localProperties = parser.parseProperties(frag["dojo:"+stype]);
	var twidget = dojo.webui.widgetManager.getImplementation(stype);
	twidget.create(localProperties, frag);
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

