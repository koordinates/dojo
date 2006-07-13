dojo.provide("dojo.data.meta.Package");
dojo.require("dojo.lang.declare");
dojo.require("dojo.collections.Dictionary");

dojo.data.meta._unnamedCount = 0;

dojo.declare("dojo.data.meta.Package",null,{
	initializer: function(pname){
		if(pname!=null){
			this.name = pname
		}else{
			this.name = "unnamed"+dojo.data.meta._unnamedCount++;
		};
		this._classes = new dojo.collections.Dictionary();  // private list of member Classes
		this._eventMap = [];	// private associative array of event handlers
	},

	name: "",
	
	//Get a Class at a given index
	getClass: function(name){
		if (!this._classes.contains(name)){
			dojo.debug("Class: "+name+" not found in package:"+pname);
		}
		return this._classes.item(name);
	},
	 
	//	Add a Class to this Package
	addClass: function(aClass){
		this._classes.add(aClass.name, aClass);
 		aClass.setPackage(this);
		return aClass;
	},

	// Remove a Class from this package		 
	removeClass: function(aClass){
		aClass.setPackage(null);
		this._classes.remove(nameOrIndex);
	},
	
	// Returns array of all classes in this package
	getAllClasses: function(){
		return this._classes.getValueList();
	},
	 
	// TODO: Replace with dojo.connect		
	// Associate a Handler method with an event
	_addHandler: function(action, handler){
		var action1 = action.toLowerCase();
		// using switch here as might need to add further, event-specific code to
		// cases. For the moment grouping events should be fine.
		switch (action1) {
			case "oncreate":
			case "onupdate":
			case "ondelete":
				this._eventMap[action1]=handler;
				return true; //break; added successfully
			default:
				return false; //break; handling for this event not supported
		}
	},

	_hasHandler: function(action){
	 	if ((this._eventMap[action] == 'undefined') || (this._eventMap[action] == null)){
	 		return false;	// no handler defined for this event or event not supported 
	 	} else {
	 		return true;	// handler for this event is present in EventMap
	 	}
	 },

	 _activateEvent: function(action, thisObj){
		var action1 = action.toLowerCase();
		if (this.hasHandler(action1)){
			// TODO: Remove ODC Event dependency...
			var e = new ODCEvent(action1);
			//may want to do event-specific code here like in 
			//treecontrol.js to attach extra info to ODCEvent
			//so using switch
			switch (action1){
				case "oncreate":
					// OnCreate specific code here
					break;
				case "onupdate":
					// OnUpdate specific code here
					break;
				case "ondelete":
					// OnDelete specific code here
					break;
				default:
					return false; //break; handling for this event not supported
			}
		}
	},
	
	toString: function(){
		var str = this.name+":";
		var classArray = this.getAllClasses();
		for (var i=0;i<classArray.length;i++){
			str = str + classArray[i].name +"\n";
		}		
		return str;
	}
});
