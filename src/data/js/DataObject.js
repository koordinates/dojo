dojo.provide("dojo.data.js.DataObject");
dojo.require("dojo.lang.declare");
dojo.require("dojo.string.extras");
dojo.require("dojo.collections.Dictionary");
dojo.require("dojo.data.common");
dojo.require("dojo.data.meta.Attribute");
dojo.require("dojo.data.meta.StructuralFeature");
dojo.require("dojo.data.meta.Reference");
dojo.require("dojo.data.meta.DerivedAttribute");

// A strongly typed data object.
dojo.declare("dojo.data.js.DataObject",null,{

	initializer: function(aClass){
		this._class = aClass;	
		this.__id__ = dojo.data.newId();		// public
	    //TODO: Consider changing these to associate arrays rather than Dictionaries
		this._members = new dojo.collections.Dictionary();	// private
	    this._containers = new dojo.collections.Dictionary(); // private	
		this._propertyBinders = new dojo.collections.Dictionary(); // public
		this._propertyArrayBinders = new dojo.collections.Dictionary(); // public
	},

	//Action constants
	ACTION_ADD: 0,
	ACTION_REMOVE: 1,

	//Client-side change state
	UPDATED: 1,//The state of this object has changed (on the client)
	NEW: 2,  	 //This object is newly created (on the client)
	DELETED: 4, //This object has been deleted (on the client)
	CHILD_UPDATED: 8,	// A child of this object has been updated or created (on the client).
	CHILD_REMOVED_OR_ADDED: 16,//A child of this object has been deleted (on client side)
	
	//Reference change state
	REF_NEW: 32, //The object is newly created and is added to a ref for the first time,
	REF_DELETED: 64, //An existing object is removed from a ref, and the object itself is deleted
	REF_ADDED: 128, //An existing object is added to a Ref, but the object itself is not changed
	REF_REMOVED: 256, //An existing object is removed from a Ref, but the object itself is not changed
	
	//Data transfer state
	LOADED: 0, //Attributes of this object have not been modified since it has been brought down from server.

	// private
	_isRoot: false,
	
	//This is the status for all objects which are initially brought in from an external location.  This will
	//help us to separate function calls (add(), set(), and remove()) between initial transfer and runtime,
	//so we can begin tracking changes (via a diffgram).  
 	//For those function calls during initial downloading, we do not need to track changes.
	//After loading is done, the status of all objects will be updated as this.LOADED
	//this._status = this.LOADED;
	_status: null,
	
	//This flag is used to indicate whether a change has been processed for diffgram. For exmaple, in same cases,
	//set() is called after remove() or add(), by setting this flag true, we only perform logic for diffgram in add() or
	//remove().
	_processed: false,
	
	//Keep track of the number of attributes which get updated, so we achieve a better
	//efficiency when an attr is updated many times, but eventually revert to the same value.
	//In this case, we can set the state back without causing any work on server.
	_changedPropertyCount: 0,
	
	//The signature of this object, which is a concatenation of all id fields.
	signature: "",
	
	//Get a member item from this data object
	_getMember: function(name){
		return this._members.item(name);
	},
	
	//Add a new member item to this data object
	_addMember: function(name, structuralFeature){
		function Member(name, structuralFeature, value){
			this.name = name;
			this.structuralFeature = structuralFeature;
			this.value = value;
			//Track any changes on a data member for this object
			this.originalValue = null;
	        //A hashmap to keep track of the status of added or removed Reference objects
	        //In this hashmap, we will use the ref object as key and its status as value
	        this.addedAndRemovedObjStatus = null;
		}
		var member = this._getMember(name);
		if ( member == null ){
			member = new Member(name, structuralFeature, null);
			this._members.add(name, member);
			// Add Set/Get function
			this._addProperty(name, structuralFeature);
		}
		return member;
	},
	
	_findMember: function(name){
		var member = this._getMember(name);
		if (member != null)	{
			return member;
		}
		var sf = this.clazz.getStructuralFeature(name);
		if (sf == null)	{
			return undefined;
		}
		if ( this._isAttribute(sf) || sf.Type != "id" ){
			var res = this._addMember(sf.name,sf);
			return res;
		}
		return undefined;
	},
	
	_addContainer: function(dataObject, memberOfDataObject){
	   //only if not inside the map yet, put it in.
	   if(!this._containers.containsKey(dataObject.__id__)){
	      //We put containing dataObject and the member of the containing dataObject, which contains this dataObject, into an array.
	      //then it is put into a map using the containing dataObject's id as index.
	      var data = [];
	      data[0] = dataObject;
	      data[1] = memberOfDataObject;
	      this._containers.add(dataObject.__id__, data);
	   }
	},
	
	_removeContainer: function(dataObject){ // private
	   if(this._containers.containsKey(dataObject.__id__)){
	      this._containers.remove(dataObject.__id__);
	   }
	},
	
	// Returns a new child data object or value compatible with the property specified.	
	createChild: function(propertyName){
		var aClass = null;
		var member = this._getMember(propertyName);
		if ( member != null && this._isReference(member.structuralFeature)){
			 aClass = member.structuralFeature.getReferenceType();
		}
		if (null != aClass){
			var dataObject = dojo.data.js.DataObject.createDataObject(aClass);
			return dataObject;
		}else{
			dojo.debug("Could not create member for property: "+propertyName);
		}
	},
	
	//Returns a new object with member values copied from this object
	clone: function(){
		var dataObject = new dojo.data.js.DataObject(this._class);
		dataOject.__id__ = dojo.data.newId();
		var membersArray = _members.getValueList();
		for (var i = 0; i < membersArray.length; ++i){
			var member = dataObject._addMember(membersArray[i].name, membersArray[i].structuralFeature);
			if (this._isDerivedAttribute(membersArray[i].structuralFeature)){
				dataObject.set(membersArray[i].name,this.get(membersArray[i].name));
			}
		}
		//Set Status flag as NEW
		dataObject._status = this.NEW;
		return dataObject;
	},
	
	// This function is used to create a backup copy after a data object is deleted. 
	// In this case we need to keep its original id and as well as original value.
	// this.originalValue is set when updates are made to this data object.
	cloneForDeletion: function(){
		var dataObject = new dojo.data.js.DataObject(this._class);
		dataObject.__id__ = this.__id__;
		var membersArray = _members.getValueList();
		for (var i = 0; i < membersArray.length; ++i){
			var member = dataObject._addMember(this.membersArray[i].name, this.membersArray[i].structuralFeature);
			if (this._isDerivedAttribute(membersArray[i].structuralFeature)){
				dataObject.set(membersArray[i].name,this.get(membersArray[i].name));
				member.originalValue = membersArray[i].originalValue;
			}
		}
		return dataObject;
	},
	
	// Returns an array of all child data objects.  If deep is specified, array includes children of my children.
	getChildrenDataObjects: function(deep){
		var arr = [];
		this._getChildrenDataObjectsInternal(arr,deep);
		return arr;
	},
	
	_getChildrenDataObjectsInternal: function(arr,deep){
		function _dataObjectAddArray(arr, value) {
			for (var i = 0; i < arr.length; ++i) {
				if (arr[i] == value){
					return false;
				}
			}
			arr[arr.length] = value;
			return true;
		}
		var membersArray = _members.getValueList();
		for (var i = 0; i < membersArray.length; ++i){
			var ef = membersArray[i].structuralFeature;
			if (this._isReference(ef)){
				continue;
			}
			var value = this.get(membersArray[i].name);
			// deal with the case that a Reference only has value of a 'space'
			if (value == null || value == " ") {
				continue;
			}
			if (value.length != null){
				for (var j = 0; j < value.length; ++j){
					if (_dataObjectAddArray(arr,value[j])){
						if (deep != null && deep){
							value[j]._getChildrenDataObjectsInternal(arr,deep);
						}
					}
				}
			} else {
				if (_dataObjectAddArray(arr,value))	{
					if (deep != null && deep){
						value._getChildrenDataObjectsInternal(arr,deep);
					}
				}
			}
		}
	},
	
	_childrenLen: function(memberName){
		var value = this.get(memberName);
		if(value!=null&&typeof(value) == "object"){
			if(value.length!=null)
				return value.length;
			else
				return 1; //return a single object instead of an array.
		}
		return null;
	},
	
	/**
	 *	This function is used to get the original value of an attribute and current value for an reference. For an attribute
	 * 	it will return the original value if it exists, or the current value if the original value
	 * 	is not set. For a reference, it will return its current value for an reference.
	 * 	The result is used to set up the original section of a diffgram.  This section of the diffgram only contains the original state
	 *  of an updated object.  Please note that the current section of the diffgram contains the current states of updated objects, new objects,
	 *  and deletd objects.
	 */
	_getOrigAttrValOrCurrRefObj: function(name){
		var member = this._getMember(name);
		if (member == null)	{
			dojo.debug("DataObject._getOrigAttrValOrCurrRefObj: Invalid property name: "+name);
			//FIXME: Should prob throw exception here.
		}
		//For Attributes, if no originalValue is set up, value is the original value because no changes are done.
		if (this._isAttribute(member)){
			if(member.originalValue != null) {
				return member.originalValue;
			} else {
				return member.value;
			}
		} else if(this._isReference(member.structuralFeature)){
			//The deleted objects are sent back in the current section of the diffgram, and original section of the diffram only contains objects before
			//they are updated. But here we are only interested in objects which are updated and get their original states.
			return member.value;
		}
	},
	
	_getCurAttrValOrCurAndDelRefObj: function(name){
		var member = this._getMember(name);
		if (member == null)	{
			var msg = "invalid property name, "+name;
			dojo.debug("DataObject.GetCurAttrValOrCurAndDelRefObj", msg);
			throw new DataObjectError(msg);
		}
		//For member Attributes, if no originalValue is set up, value is the original value because no changes are done.
		if (this._isAttribute(member.structuralFeature)){
			return member.value;
		} else if(this._isReference(member.structuralFeature)) {
			//We may have to combine value and originalValue because the original record for a deleted ref
			//is in originalValue and the original record for an ref with updated attr is still in value.
			if(	member.originalValue != null && member.value != null ){
				var v = [];
				//Add records from Value with a status of UPDATED
				if ( "object" == typeof(member.value) && member.value.length != null && member.value.length >= 0 ){
					for(i=0;i<member.value.length;i++){
						v[v.length] = member.value[i];
					}
				} else {
					v[v.length] = member.value;
				}
				//Add deleted records from OriginalValue
				for(i=0;i<member.originalValue.length;i++){
					v[v.length] = member.originalValue[i];
				}
				return v;
			} else if( member.originalValue != null	&& member.value == null ){
				return member.originalValue;
			} else {
				return member.value;
			}
		}
	},
	
	// Copy prototyped functions from the feature onto this.
	_addProperty: function(name, structuralFeature){
	    var setter = "set" + dojo.string.capitalize(name);
		if ( this[setter] == undefined ) {
			this[setter] = structuralFeature.Setter;
		}
	    var getter = "get" + dojo.string.capitalize(name);
		if ( this[getter] == undefined ) {
			this[getter] = structuralFeature.Getter;
		}
	},
	
	_addToOriginalArrayForRef: function(member, deletedObj, isDelete){
		var v = null;
		if (null == member.originalValue){
			v = [];
		} else {
			//it is an array
			if ("object" == typeof(member.OriginalValue) && member.originalValue.length != null	&& member.originalValue.length >= 0){
				v = member.originalValue;
			} else {//not an array
				v = [];
				v[v.length] = member.originalValue;
			}
		}
	    //remove the container of this obeject
	    deletedObj._removeContainer(this);
	   	//If the isDelete is true or the containment flag is true, we will delete the object from our model.
	   	if (member.structuralFeature.isContainment == true  || isDelete == true){
			//Make a copy of this object to avoid the problem
			//resulting from RemoveContainer() call after an eobject is deleted.
			c = deletedObj.cloneForDeletion();
			c._status= this.DELETED;
			v[v.length] = c;
			//Mark the parent eobject as below ????
			//have to consider containment
			//this.Status = this.Status | this.CHILD_DELETED;
		  var delList = deletedObj._containers.getValueList();
	      //loop here to notify all containers that this object is deleted
	      for ( var i = delList.length - 1; i >= 0; --i ){
	         var data = delList[i];
	         var container = data[0];
	         var memberOfContainer = data[1];
	         container._remove( memberOfContainer.name, deletedObj);
	      }
		} else {
	   		//If the isDelete is either false or undefined, and the containment flag is false, we will
			//just remove the reference from this object and leave the value intact.
			v[v.length] = deletedObj;
			//Mark the parent eobject as below ????
			//have to consider containment
			//this.Status = this.Status | this.UPDATED;
		}
	    //Logic to check for the status of added or removed ref objects
	    //For any given ref object, we could have the following 4 scenarios:
	    //1. added
	    //2. removed
	    //3. added, then removed
	    //4. removed, then added
	    //Case 3 and 4 basically put the object back
		if(member.changedStatus == null){
			member.changedStatus = new dojo.collections.Dictionary();
		}
	    var refStatus = member.changedStatus.get(deletedObj.__id__);
	    //If this object is inside the status map, put it in
	    if(refStatus == null || refStatus == undefined){
	      //If it is a true delete
	      if(member.structuralFeature.isContainment == true  || isDelete == true){
	         member.changedStatus.add(deletedObj.__id__, this.REF_DELETED);
	      } else {
	         member.changedStatus.add(deletedObj.__id__, this.REF_REMOVED);
	      }
	    } else {
	      //If it is already there, we need to check its status
	      //If it is previously added, we need to remove it from the map.  So the net
	      //effect is that nothing has happened
	      if(refStatus == this.REF_ADDED || refStatus == this.REF_NEW){
	         member.changedStatus.remove(deletedObj.__id__);
	      }
	    }
		// till here
		member.originalValue = v;
	},
	
	_addToOriginalArrayAttr: function(member, currentValue){
		//this.ACTION_ADD
		//Only if member.originalValue has not been yet backed up, we save it.
		if(member.originalValue == null){
			member.originalValue = member.value;
			//this object is updated.
			this._changedPropertyCount++;
			this._status = this._status | this.UPDATED;
		} else {
			//We have already backed it up, check if the new value is the same as the original value.
			//the two arrays are the same
			if(this._compareAttrArray(member.originalValue, currentValue) == true){
				member.originalValue = null;
				this._changedPropertyCount--;
				if(this._changedPropertyCount == 0){
					this._status = this.LOADED;
				}
			} else {
				// no status changes are needed.
			}
		}
	},
	
	_compareAttrArray: function(originalValArray, currentValueArray){
		if(currentValueArray == null){
			return false;
		}
		if(originalValArray.length!= currentValueArray.length){
			return false;
		}
		for(var i=0; i <originalValArray.length; i++){
			if(originalValArray[i] != currentValueArray[i])	{
				return false;
			}
		}
		return true;
	},
	
	// Add a value to a list either for the feature by name.
	// name is the name of the member to update to the specified value.
	// refreshRequired is optional(default=true) and indicates whether refresh should be carried out after attribute/reference is added.
	// FIXME: This method needs to be refactored in a big way...consider having diffgram logic separated and based on genereted events.
	add: function(name, value, refreshRequired){
		//if refreshRequired is undefined set it to its default value of true
		if(refreshRequired==undefined){
		 	refreshRequired=true;
		}
		var member = this._findMember(name);
		if (member == null){
			dojo.debug("Attempted to set value for unknown member, "+name);
			// TODO: Make this forgiving (eg. consider new'ing up an attribute on the fly!
		}
		if ( this.status != null  )	{
			if ( member.structuralFeature.isReadOnly() == 1 ){
				dojo.debug("Attempted to set readOnly value for member, "+name);
			}
		}
		var v = null;
		if (null == member.value){
			v = [];
		} else {
			if ("object" == typeof(member.value) && member.value.length != null	&& member.value.length >= 0){
				v = member.value;
			} else {
				v = [];
				v[v.length] = member.value;
			}
		}
		if (this._class != null){
			this._class._validateCardinality(name,v.length + 1);
		}
		v[v.length] = value;
		//Diffgram logic...
		//1. Add a new value to a containment Ref - no need to call AddToOriginalArray because data object itself has a status of NEW.
		//2. Add a new value to a non-containment Ref - need to add to id tracker to track what is added to it.
		if (this._status == null || (this._status & this.NEW) || this._class.diffgramNeeded == false ){
			//do nothing for diffgram-related work
		} else if(this._isReference(member.structuralFeature)){
			//need a method here to handle id array
			if(member.changeStatus == null)	{
				member.changeStatus = new dojo.collections.Dictionary();
			}
			var refStatus = member.changeStatus.get(value.__id__);
			var firstTimeAdded = false;
			//If there is no containers for this object or containers is empty, this object has never been
			//added to any object as a ref before.
	    	if(value._containers == null || value._containers.count < 1){
				firstTimeAdded = true;
	    	}
			//If this object is not in the status map, put it in
			if(refStatus == null || refStatus == undefined){
				if(firstTimeAdded == true && value._status== this.NEW){
					member.changeStatus.add(value.__id__, this.REF_NEW);
				} else {
	      			member.changeStatus.add(value.__id__, this.REF_ADDED);
				}
			} else {
				//If it is already there, we need to check its status
				//If it is previously removed or deleted, we need to remove it from the map.  
				//So the net effect is that nothing has happened
				if(refStatus == this.REF_REMOVED || refStatus == this.REF_DELETED) {
					member.changeStatus.remove(value.__id__);
				}
			}
		} else {
			//3. add a new value to a multivalue attribute
			//need to call AddToOriginalArray
			if(this._isAttribute(member.structuralFeature)){
				this._addToOriginalArrayAttr(member, v);
			}
			//Diffgram logic ends here
			member.value = v;
		    //This method really only allows a single value as an input, not an array
			//only if this is a single object, not an array, we look for container
			//means that we first time set up its value
			if (value != null && typeof(value) == "object" && value.length == null){
				var containerMember = this._containers.item(this.__id__);
				//If not set up, set it up
				if (containerMember == null){
					value._addContainer(this, member);
					//Loop thru all members of this value, if this object is a member of this value
					//and this member is a containment, set up this object as the value of the passed-in
					//object. (eOpposite???)
				}
			}
			//Call refresh method to fire bindings and update fields
			//FIXME: Split this out into a separate method
		    if (refreshRequired) {
		      	var propertyBinders = this._propertyBinders;
				var propertyNamedBinders = propertyBinders.item(name);
				if ( propertyNamedBinders != null )	{
					var pnBindList = propertyNamedBinders.getValueList();
					for (var i = pnBindList.length - 1; i >= 0; --i){
						var propertyBinder = pnBindList[i];
						propertyBinder.fireValueChanged(name, value, propertyBinder.index);
					}
				}
				var paBindList = this._propertyArrayBinders.getValueList();
				for (var i = 0; i < paBindList.length; ++i){
					paBindList[i].fireRowAdded(name,value);
				}
		    }
			// get dataObject's class's containing package and fire onCreate event
			// If new DataObject is flagged as "NEW", this means it is being created
			// subsequent to the initial page load (model set-up)
			// The onCreate handler should not be fired when objects 
			// are created on page load
			//FIXME: Split this out into a separate method
			if (value._status == this.NEW ){
				// fire Package onCreate event
				// "value" is new object (param)
				// "this" is parent object
				var pkg = value._class.getPackage();
		   		pkg.activateEvent("ONCREATE",value);
		   		// fire update in parent object ("this")
		   		pkg = this._class.getPackage();
		   		pkg.activateEvent("ONUPDATE",this);
		   		// This attribute is used for dataObjects that are created on the client.
				// It helps distinguish between calls to set during the creation of the new 
				// object (shouldn't fire OnUpdate event) and subsequent calls to set
				// (should fire onUpdate).
				// It is set true here to flag that the DataObject has been fully initialised. 
				// Any calls to set after this should fire an update event.
				// This enables us to handle onUpdate events on newly created DataObjects.
				value.isNewAndInitialized = true;
			}
	   	}
	},
	
	// Gets value of a member by name
	get: function(name){
		var member = this._findMember(name);
		if (null == member)	{
			dojo.debug("DataObject.get: invalid member, "+name);
			return null;
		}
		var structuralFeature = member.structuralFeature;
		if (!this._isDerivedAttribute(structuralFeature)){
			return member.value;
		}
		try	{
			//FIXME: Support that there is short name("hoge" same as this.get("hoge")) in expression string.
			var str = structuralFeature.getExpression();
			//str = this.NormalizeEvelContext(str);
			// Cache the calculate result.
			member.value = eval(str);
			return member.value;
		} catch (e) {
			dojo.debug("dataobject.get: derived attribute evaluation failure: "+member.structuralFeature.getExpression());
			//Fail gracefully
		}
	},
	
	//TODO: BindableObject
	//Refresh any observers by refiring all associated binders and refreshing all fields for the object when the member
	// of the specified name and value has changed.
	refresh: function(name,value){
	    var propertyBinders = this._propertyBinders;
		var propertyNamedBinders = propertyBinders.item(name)
		if ( propertyNamedBinders != null )	{
			for (var i = propertyNamedBinders.length - 1; i >= 0; --i){
				var propertyBinder = propertyNamedBinders[i];
				propertyBinder.fireValueChanged(name, value, propertyBinder.index);
			}
		}
	    var membersArray = _members.getValueList();
		// fire change to any calculate property
		var length = membersArray.length;
		for (var i = 0; i < length; ++i) {
			var member = membersArray[i];
			if (this._isDerivedAttribute(member.structuralFeature)){
				continue;
			}
			// Clear AttributeCalculate's calculated result Value.
			member.value = undefined;
			var name = member.name;
			var propertyNamedBinders = propertyBinders.item(name);
			if ( propertyNamedBinders == null )	{
				continue;
			}
			for (var j = propertyNamedBinders.length - 1; j >= 0; --j){
				// Recalculate derived attribute?
				propertyNamedBinders[j].fireValueChanged(name, this.get(name));
			}
		}
	},
	
	// This function is used to set the value of a member specified by name.
	// refreshRequired is optional (default: true) and indicates whether refresh should be carried out after attribute is set.
	set: function(name,value,refreshRequired){ 
		if(refreshRequired==undefined){	
			refreshRequired=true; 
		}
		var member = this._findMember(name);
		if (null == member){
			dojo.debug("dataObj.set: invalid property name, "+name);
			return false;
		}
		var structuralFeature = member.structuralFeature;
		// While setting up the model from creator, skip checking for read only
		// to allow the initial setting of the values.
		if ( this._status != null ){
			dojo.debug("dataObj.set: Attempt to set readonly property, "+name);
			return false;
		}
	    //We do not want to do any validation when we are setting up model inside creator.js
		if (this._status != null && this._class != null){
			value = this._class._validateType(name, value);
		}
		var bChanged = false;
		if (member.value != value){
			if (this._status != null ){
				if (value == null){
					structuralFeature._validateCardinality(1);
				} else if (	typeof(value) == "object" && value.length != null )	{
					structuralFeature._validateCardinality(value.length);
				}
			}
	        // TODO: If (this.isBindable)...
			// No diffgram-related flags need to be set if
			// 1) this is the first time to set this value during initial loading
			// 2) this object is created on client side.  In this case, any subsequent changes after creation
			//    is treated as part of creation, so we only care about the final version of the object.
			// 3) Ignore any diffgram-related work if diffgramNeeded flag is false for the class of this object
			// 4) The diffgram logic has been performed in remove()
			//    This case is due to the fact that set() is called in remove().  All flags have been updated
			//    there already.
			if( this._status == null || (this._status & this.NEW) || this._class.diffgramNeeded == false){
				//do nothing for diffgram-related work
			} else if (this.processed == true) {
				// reset the flag and do nothing else
				this.processed = false;
			} else { // We are making changes to the original value
				// first time to change this value
				if ( member.originalValue == null )	{
					// update the flag
					this._status = this._status | this.UPDATED;
					// increament the counter
					this.changedPropertyCount++;
					member.originalValue = member.value;
				} else if( member.originalValue != null	&& member.originalValue == value ){
					//If the original value is set during 1st update, and the new value
					//during this update is the same as the original value, we will try to
					//restore the original state of the eobject.
					// decrement the counter
					this.changedPropertyCount--;
					member.originalValue = null;
					// if no other changes occurred to this object, we can treat this object as unchanged
					if(this.changedPropertyCount == 0){
						this._status = this.LOADED;
					}
				} else if( member.originalValue != null && member.originalValue != value ){
					// If the original value is set during 1st update,and the new value is different,
				    // we do nothing for flags.
				}
				//write out to the journal
			}
			member.value = value;
			bChanged = true;
		}
		//If this is a Reference, we need to set up containers
		if (this._isReference(structuralFeature)){
			//If it is a single object
			if( value != null && typeof(value) == "object" &&  value.length == null){
				value._addContainer(this, member);
			} else if (value != null && typeof(value) == "object" &&  value.length != null){
				//if this is a list, we need to add a container for every object
				for(var i=0; i<value.length; i++){
					if(value[i]){
						value[i]._addContainer(this, member);
					}
				}
			}
		}
		//TODO: if (bindable)...
		//We do not want to fire events when we are setting up model inside ecreator.js
		//The refreshRequired parameter allows us to only refresh the page once in a situation where 
		//a list of attributes are being added. Only set the parameter to true for the last eSet call in 
		//a list of eset calls. All preceding calls should have the parameter set to false.
		if (this._status != null && bChanged && refreshRequired){
	    	this.refresh(name,value);
	    	// get containing EPackage and fire update event
	    	// does not fire if attributes are being set up for first time
	    	if( ( this._status == this.NEW ) && ( !this.isNewAndInitialized ) ){
		   		//do nothing - this "new" object is not finished initialization	
	    	} else {
	    		//get Class's containing Package and fire OnUpdate event
	   			var pkg = this._class.getPackage();
	   			if(pkg.activateEvent("ONUPDATE",this) == false){
	   				//call to event handler has failed
	   			}
	    	}	
		}
		return true;
	},
	
	 // Removes a value from a child list (either an Attribute or Reference).
	 //	name is name of the member that contains the list to remove a value from.
	 // value is the value within the list to be removed.
	 // isDelete is optional and false by default.  
	 // When isDelete is false, deletes the value object if the containment flag is true.
	 // When isDelete is true, delete the value from our model regardless of containment.
	 // refreshRequired is optional (default: true) and specifies whether refresh should be carried out after the value is removed.
	remove: function(name, value, isDelete, refreshRequired){
		//if refreshRequired is undefined set it to its default value of true
		if(refreshRequired==undefined){
		 	refreshRequired=true;
		}
		var member = this._getMember(name);
		var v = this.get(name);
		if (null == v){
			if (null == this._class){
				return;
			}
			dojo.debug("dataObj.remove: invalid member, "+name);
			return;
		}
		if ( member.structuralFeature.isReadOnly()){
			dojo.debug("dataObj.remove: Attempt to remove read only member, "+name);
			return;
		}
		// 1. Remove a value from a containment Ref, need to delete  the eobject and call _addToOriginalArray().
		// 2. Remove a value from a non-containment Ref, no need to delete the eobject, but calls _addToOriginalArray().
		// 3. Remove a value from a multivalue attribute, calling _addToOriginalArray() to back up the original value
		this._processed=true;
		// The only remove that does anything is when a value is removed from an array. 
		// Therefore client data onDelete event is only fired for that scenario.
		if ( "object" == typeof(v) && v.length >= 0 ){
			var arr = [];
			for (var i = 0; i < v.length; ++i){
				//If two objects are not the same, keep it
				if (v[i] != value){
					arr[arr.length] = v[i];
				} else if (this._isReference(member.structuralFeature) && v[i] == value	 && value.Status != value.NEW ){
					//if two objects are the same and the deleted oject is not created on client,
					//remove it and keep it to the array for original references
					//if (v[i] == value && value.Status != value.NEW )
					var dataObject = v[i];
					//Only do diffgram-related work if diffgramNeeded flag is true for the eclass of this eobject
					if(this._class.diffgramNeeded == true){
						this._addToOriginalArrayForRef(member, dataObject, isDelete);
					}
					//write out to the journal
					//code for journal
				} else {
	 				//if the deleted object is created on client,
					//just discard it and it will not be sent back to server
					//still need to write out to the journal
					//code for journal
				}
			}
			v = arr;
			// onDelete Event Handling code for removing object from array
/* TODO - FIX EVENTS
			var pkg = value._class.getPackage();
			if( pkg.activateEvent("ONDELETE",value) == false )	{
				//Call to Handler has failed.
			}
*/
			// No need to call parent update handler here as it is called from set later
		} else {
			v = null;
			//Only do diffgram-related work if diffgramNeeded flag is true in the class of this object
			if(this._isReference(member.structuralFeature) && this._class.diffgramNeeded == true ){
				//FIXME: Why is this block commented out?
				//this.AddToOriginalArray(name, value);
			}
		} if (this._isAttribute(member.structuralFeature)) {
		    //Only do diffgram-related work if diffgramNeeded flag is true for the eclass of this eobject
			if(this._class.diffgramNeeded == true )	{
				//FIXME: this method does not exist this path in the program should be reviewed
				this._addToOriginalArrayForAttr(member, v);
			}
			//write out to the journal
			//code for journal
		}
		this.set(name,v);
		if(refreshRequired){
		// TODO: Use dojo topics for events
			for (var i = 0; i < this._propertyArrayBinders.count; ++i){
				this._propertyArrayBinders[i].fireRowDeleted(name,value);
			}
		}
	},

	// Sorts the values of the specified property	
	sort: function(propertyname,sortOrder){	// public
		var rows = this.get(propertyname);
		if ( null == rows || typeof(rows) != "object" || rows.length == null || rows.length <= 0 ){
			return;
		}
		sortOrder = dojo.string.trim(sortOrder,0);
		if ( null == sortOrder || sortOrder.length == 0 ){
			return;
		}
		var columns = sortOrder.split(",");
		if (0 == columns.length){
			return;
		}
		//FIXME: Where did SortRows come from? is there a dojo equivalent?
		var sortArray = SortRows(columns[0],rows);
		//FIXME: Where did SortAllColumns come from? is there a dojo equivalent?
		sortArray = SortAllColumns(sortArray,columns,1);
		rows = [];
		for (var i = 0; i < sortArray.length; ++i){
			rows[rows.length] = sortArray[i].m_row;
		}
		this.set(propertyname,rows);
	},
	
	toStr: function(level){
	    level = (level==null) ? '' : level+'  ';
		var refStr = " ";
		var childStr = "";
		var lineBreak = "\n";
		var str = level+"<" +this._class.name + " id=" + this.__id__ + " ";
		var membersArray = this._members.getValueList();
		for (var i = 0; i < membersArray.length; ++i) {
			if(this._isDerivedAttribute(membersArray[i].structuralFeature)){
				continue;
			}
			if (this._isReference(membersArray[i].structuralFeature)){
				str += membersArray[i].name + "= \"" + this.get(membersArray[i].name) + "\" ";
			}else{
				var child = this.get(membersArray[i].name);
				if (membersArray[i].structuralFeature.isContainment == true){
		            if(child != null && child.length != null){
					   for(var j = 0; j < child.length; j++){
						   childStr += child[j].toStr(level);
					   }
		            }else if(child != null){
		               childStr += child.toStr(level);
		            }
				}else{
					if(child != null && child.length != null){
						for(var j = 0; j < child.length; j++){
							str += membersArray[i].name + "= \"";
							str += (child[j] == null ? "null" : child[j].__id__) + "\" ";
						}
					}else if(child != null){
						str += membersArray[i].name + "= \"";
						str += child.__id__ + "\" ";
					}
				}
			}
		}
		return childStr=="" ? 
			str + refStr + "/>"+lineBreak:
			str + refStr + ">"+lineBreak + childStr + level+"</" + this._class.name + ">"+lineBreak;
	},
	
	toJson: function (level){
	    level = (level==null) ? '' : '';
		var refStr = " ";
		var childStr = "";
		var lineBreak = "\n";
		var str = level+"{ id:\""+this.__id__+"\", ";
		var membersArray = this._members.getValueList();
		for (var i = 0; i < membersArray.length; ++i){
			if(this._isDerivedAttribute(membersArray[i].structuralFeature)){
				continue;
			}
			if (this._isReference(membersArray[i].structuralFeature)){
		        if (i>0){ 
		        	str += ','; 
		        }
				str += membersArray[i].name + ":\""+this.get(membersArray[i].name)+"\"";
			}else{
				var child = this.get(membersArray[i].name);
				if (membersArray[i].structuralFeature.isContainment == true){
		            if(child != null && child.length != null){
						for(var j = 0; j < child.length; j++){
							childStr += child[j].toJson(level);
						}
		            } else if(child != null) {
						//If it is a single obj
						childStr += child.toJson(level);
		            }
				} else {
					if(child != null && child.length != null){
						for(var j = 0; j < child.length; j++){
							str += membersArray[i].name+":\"";
							str += (child[j] == null ? "null" : child[j].__id__) + "\"";
							if (j!=child.length){str+=","}
						}
						str += "]"
					} else if(child != null){
						str += membersArray[i].name + ":\"";
						str += child.__id__ + "\""; 
					}
				}
			}
		}
		return childStr=="" ? 
			str + refStr + "}"+lineBreak :
			str + refStr + "}"+lineBreak + childStr + "}"+lineBreak;
	},
	
	
	/**
	 * This method is used to get unique signature to identify this eobject across diffrent HTTP requests. With the signature
	 * of an eobject, we can restore the UI state for a data object on a particular control, such as a tree node (closed or open).
	 * The signature of an object is represented by cancatenating all attributes and referneces which are part of key fields
	 * of the eobject.  In the case of a reference as a part of a key, the getSignamture() of the reference object will be called.
	 */
	getSignature: function(parent){
		//prefix signature with eClass name at the begining for any object
		//If there is no key field, the eClass name will be used as the signature for
		//eobject.  We will treat this type of object as singleton.
		var signature = this._class.name;
		var name = null;
		var value = null;
		var membersArray = _members.getValueList();
		//loop thru all members
		for (var i = 0; i < membersArray.length; ++i){
			var feature = membersArray[i].structuralFeature;
			//If it is an Attribute, just simply concatenate it to the signature.
			if(feature.isPrimKeyPart == true) {
				name = membersArray[i].name;
				value = this._getCurAttrValOrCurAndDelRefObj(name);
				//If this is an Attribute and in CURRENT_MODE
				if (this._isAttribute(feature)){
					//This must be a single value to be part of primary key.
					if ((feature.getUpperBound() == -1 || feature.getUpperBound() > 1 ||
						(feature.getLowerBound() < feature.getUpperBound() && feature.getUpperBound() > 1)) &&
						value.length != null && "number" == typeof(value.length)){
						//TODO: Fix this
						dojo.error("multivalue attr as key error"+name+dataObject._class.name);
					} else {
						signature = signature + value;
					}
				} else if (this._isReference(feature)) { 
					//If this is an Attribute
					if(value!=null){
						//This must be a single obejct to be part of primary key.
						//We will call getSignature() of the Reference.  This call could be recursive.
						if ("object" == typeof(value) && value.length == null && (!parent || value != parent)){
							signature = signature + value.getSignature(this);
						} else if(value != parent) {
							//If this is not a dataobject and this is not a single object, throw an exception
							//TODO: Fix this
							dojo.error("reference list as key error"+name+dataObject._class.name);
						}
					}
				}
			}
		}
		this.signature = signature;
		return this.signature;
	},
	
	_isReference: function(feature){
		return feature.declaredClass == "dojo.data.meta.Reference";
	},
	
	_isAttribute: function(feature){
		return feature.declaredClass == "dojo.data.meta.Attribute";
	},
	
	_isDerivedAttribute: function(feature){
		return feature.declaredClass == "dojo.data.meta.DerivedAttribute";
	}
});

//Static factory method to create a data object and fluff up its members
//TODO: merge two arrays into one array of member data.
dojo.data.js.DataObject.fromArray = function(attrValueArray,referenceArray,aClass){
	var dataObject = new dojo.data.js.DataObject.createDataObject(aClass);
	dojo.data.js.DataObject.initFromArray(dataObject,attrValueArray,referenceArray);
};
	
// Static factory method to create a data object and initialie it with feature-compatible values for its members
dojo.data.js.DataObject.createDataObject = function(aClass){
	if (null == aClass) return null;  //Currently cant create a data object without a class.
	var dataObject = new dojo.data.js.DataObject(aClass);
	dataObject.__id__ = dojo.data.newId();
	var attrs = dataObject._class.getAllAttributes();
	for (var i = attrs.length-1;i>=0;--i){
		var attr = attrs[i];
		if (attr.Type != "id"){
			dataObject._addMember(attr.name, attr);
		}
	}
	var refs = dataObject._class.getAllReferences();
	for (var i=refs.length-1;i>=0;--i){
		var ref = refs[i];
		dataObject._addMember(ref.name,ref);
	}
	dataObject._status = this.NEW;
	return dataObject;
};
	
//	Adds all attribute values and all reference objects (specified as arrays) to a data object.
// 	Assumes that the order of attributes and references coming in is the same as what is specified in this object's Class
// TODO: This should take a single array as input, with attrs and refs mixed, based on the order defined in the schema.
//dojo.data.js.DataObject.initFromArray(Pos56, ["390","MACR","14.75","284"], [U1,Port2, S51]);
dojo.data.js.DataObject.initFromArray = function(dataObject,attrValueArray,referenceArray){
	if (null == dataObject){
		dojo.debug("Error: added reference to null class.");
	}
	//set in attribute values
	//Loop thru attrValueArray we need to set.
	var attrs = dataObject._class.getAllAttributes();
	var counter = 0; //Counter to track the number of attributes, excluding derived attributes
	var name = null;
	for(i=0; i<attrs.length; i++){
		var attr = attrs[i];
		name = attr.name;
		//If it is an derived attribute, skip it because it is not supposed to be passed in.
		if ((attr.declareClass == "dojo.data.meta.DerivedAttribute")){
			continue;
		}
		if (attrValueArray == null || counter >= attrValueArray.length){
			dojo.debug("Class '"+dataObject._class.name+"' defines at least "+(counter+1)+" non-calculated attributes, but only "+counter+" were passed");
			return;
		}
		if (attr.type == "id"){
			dataObject.__id__=attrValueArray[counter++];
		}else if( dataObject.get(name) != null || attr.getUpperBound() == -1 || attr.getUpperBound() > 1 ||
			(attr.getLowerBound() < attr.getUpperBound() && attr.getUpperBound() > 1)){
			//If it is a multi-value attribute, we need to loop thru the array of values
			//Handle the situation that cardinality 0 to n.  In this case, we could have an empty
			//array or null passed in. Such as I(Dir6,["Dir6","wdo4jsmediators"],[[],Dir5])
			if(attrValueArray[counter] == null || attrValueArray[counter].length == 0){
				//set value as null, so getXXXX() is always set up.
				dataObject.set(name, null);
				++counter;
				continue;
			}
		    dataObject.set(name, attrValueArray[counter++]);
		} else {//single value attribute
			dataObject.set(name, attrValueArray[counter++]);
		}
	}
	//Init reference values, passed in an array as [U1,[Port2,Port2], S51];
	//Loop thru all the References we need to set value for
	//Here we expect the order of References coming in is the same as what the schema is set up as
	var refs = dataObject._class.getAllReferences();
	if (refs.length != (referenceArray == null ? 0 : referenceArray.length)){
		dojo.debug("Creator: Error: Mismatched reference length. class="+dataObject._class.name+" refsLen="+refs.length+" refArrLen="+referenceArray.length);
		return;
	}
	//Init references, passed in an array as [U1,[Port2,Port2], S51];
	//Loop thru all the References we need to set value for
	for(j=0; j<refs.length; j++){
		var ref = refs[j];
		name = ref.name;
		if ( dataObject.get(name) != null || ref.getUpperBound() == -1 || ref.getUpperBound() > 1 || 
			(ref.getLowerBound() < ref.getUpperBound() && ref.getUpperBound() > 1)){
			//Handle the situation that cardinality 0 to n (ie. this is a child collection). In this case, we could have an empty
			//array or null passed in. Such as I(Dir6,["Dir6","wdo4jsmediators"],[[],Dir5])
			if(referenceArray[j] == null || referenceArray[j].length == 0){
				//set value as null, so getXXXX() is always set up.
				dataObject.set(name, null);
				continue;
			}
			//eliminate the loop for a better performance
			dataObject.set(name,referenceArray[j]);
		} else {
			dataObject.set(name,referenceArray[j]);
		}
	}
    dataObject.status = 0;
};
