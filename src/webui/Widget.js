// ensure that dojo.webui exists
dojo.hostenv.startPackage("dojo.webui.Widget");
dojo.hostenv.startPackage("dojo.webui.widgets.tags");

dojo.hostenv.loadModule("dojo.lang.*");
dojo.hostenv.loadModule("dojo.webui.WidgetManager");
dojo.hostenv.loadModule("dojo.webui.DragAndDrop");
dojo.hostenv.loadModule("dojo.event.*");
dojo.hostenv.loadModule("dojo.text.*");

dojo.webui.Widget = function(){
	// these properties aren't primitives and need to be created on a per-item
	// basis.
	this.children = [];
	this.selection = new dojo.webui.Selection();
	// FIXME: need to replace this with context menu stuff
	this.rightClickItems = [];
	this.extraArgs = {};
}
// FIXME: need to be able to disambiguate what our rendering context is
//        here!

// needs to be a string with the end classname. Every subclass MUST
// over-ride.
dojo.lang.extend(dojo.webui.Widget, {
	// base widget properties
	widgetType: "Widget",
	parent: null,
	// obviously, top-level and modal widgets should set these appropriately
	isTopLevel:  false,
	isModal: false,

	isEnabled: true,
	isHidden: false,
	isContainer: false, // can we contain other widgets?
	widgetId: "",

	enable: function(){
		// should be over-ridden
		this.isEnabled = true;
	},

	disable: function(){
		// should be over-ridden
		this.isEnabled = false;
	},

	hide: function(){
		// should be over-ridden
		this.isHidden = true;
	},

	show: function(){
		// should be over-ridden
		this.isHidden = false;
	},

	create: function(args, fragment, parentComp){
		//dj_debug(parentComp);
		this.satisfyPropertySets(args, fragment, parentComp);
		this.mixInProperties(args, fragment, parentComp);
		this.buildRendering(args, fragment, parentComp);
		this.initialize(args, fragment, parentComp);
		this.postInitialize(args, fragment, parentComp);
		dojo.webui.widgetManager.add(this);
		return this;
	},

	destroy: function(widgetIndex){
		// FIXME: this is woefully incomplete
		this.uninitialize();
		this.destroyRendering();
		dojo.webui.widgetManager.remove(widgetIndex);
	},

	satisfyPropertySets: function(args){
		// get the default propsets for our component type
		var typePropSets = []; // FIXME: need to pull these from somewhere!
		var localPropSets = []; // pull out propsets from the parser's return structure

		// for(var x=0; x<args.length; x++){
		// }

		for(var x=0; x<typePropSets.length; x++){
		}

		for(var x=0; x<localPropSets.length; x++){
		}
		
		return args;
	},

	mixInProperties: function(args){
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
				if(typeof args[x] != "string"){
					this[x] = args[x];
				}else{
					if(typeof this[x] == "string"){
						this[x] = args[x];
					}else if(typeof this[x] == "number"){
						this[x] = new Number(args[x]); // FIXME: what if NaN is the result?
					}else if(typeof this[x] == "boolean"){
						this[x] = (args[x].toLowerCase()=="false") ? false : true;
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
			}else{
				// collect any extra 'non mixed in' args
				this.extraArgs[x] = args[x];
			}
		}
	},

	initialize: function(args, frag){
		// dj_unimplemented("dojo.webui.Widget.initialize");
		return false;
	},

	postInitialize: function(args, frag){
		return false;
	},

	uninitialize: function(){
		// dj_unimplemented("dojo.webui.Widget.uninitialize");
		return false;
	},

	buildRendering: function(){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.buildRendering");
		return false;
	},

	destroyRendering: function(){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.destroyRendering");
		return false;
	},

	cleanUp: function(){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.cleanUp");
		return false;
	},

	addChild: function(child){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.addChild");
		return false;
	},

	addChildAtIndex: function(child, index){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.addChildAtIndex");
		return false;
	},

	removeChild: function(childRef){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.removeChild");
		return false;
	},

	removeChildAtIndex: function(index){
		// SUBCLASSES MUST IMPLEMENT
		dj_unimplemented("dojo.webui.Widget.removeChildAtIndex");
		return false;
	},

	resize: function(width, height){
		// both width and height may be set as percentages. The setWidth and
		// setHeight  functions attempt to determine if the passed param is
		// specified in percentage or native units. Integers without a
		// measurement are assumed to be in the native unit of measure.
		this.setWidth(width);
		this.setHeight(height);
	},

	setWidth: function(width){
		if((typeof width == "string")&&(width.substr(-1) == "%")){
			this.setPercentageWidth(width);
		}else{
			this.setNativeWidth(width);
		}
	},

	setHeight: function(height){
		if((typeof height == "string")&&(height.substr(-1) == "%")){
			this.setPercentageHeight(height);
		}else{
			this.setNativeHeight(height);
		}
	},

	setPercentageHeight: function(height){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	},

	setNativeHeight: function(height){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	},

	setPercentageWidth: function(width){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	},

	setNativeWidth: function(width){
		// SUBCLASSES MUST IMPLEMENT
		return false;
	}
});

// TODO: should have a more general way to add tags or tag libraries?
// TODO: need a default tags class to inherit from for things like getting propertySets
// TODO: parse properties/propertySets into component attributes
// TODO: parse subcomponents
// TODO: copy/clone raw markup fragments/nodes as appropriate
dojo.webui.widgets.tags = {};
dojo.webui.widgets.tags.addParseTreeHandler = function(type){
	var ltype = type.toLowerCase();
	this[ltype] = function(fragment, widgetParser, parentComp){ 
		return dojo.webui.widgets.buildWidgetFromParseTree(ltype, fragment, widgetParser, parentComp);
	}
}

dojo.webui.widgets.tags["dojo:propertyset"] = function(fragment, widgetParser, parentComp){
	// FIXME: Is this needed?
	// FIXME: Not sure that this parses into the structure that I want it to parse into...
	// FIXME: add support for nested propertySets
	var properties = widgetParser.parseProperties(fragment["dojo:propertyset"]);
}

// FIXME: need to add the <dojo:connect />
dojo.webui.widgets.tags["dojo:connect"] = function(fragment, widgetParser, parentComp){
	var properties = widgetParser.parseProperties(fragment["dojo:connect"]);
}

dojo.webui.widgets.buildWidgetFromParseTree = function(type, frag, parser, parentComp){
	var stype = type.split(":");
	stype = (stype.length == 2) ? stype[1] : type;
	// outputObjectInfo(frag["dojo:"+stype]);
	// FIXME: we don't seem to be doing anything with this!
	var propertySets = parser.getPropertySets(frag);
	var localProperties = parser.parseProperties(frag["dojo:"+stype]);
	for(var x=0; x<propertySets.length; x++){
		
	}
	var twidget = dojo.webui.widgetManager.getImplementation(stype);
	return twidget.create(localProperties, frag, parentComp);
}
