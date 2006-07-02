dojo.provide("dojo.data.meta.Reference");
dojo.require("dojo.lang.assert");
dojo.require("dojo.lang.declare");
dojo.require("dojo.data.meta.StructuralFeature");

//TODO: Fix inheritence of Reference to extend StructuralFeature, then remove CLASSTYPE prop
//and replace all references to CLASSTYPE to use dojo isTypeOf

/**
 * A Reference is is a directional relationship between one class and another (like a pointer but with a lot more power).
 * o You can specify its cardinality. The 'lowerBound' property defaults to 0 and 'upperBound' property
 *   defaults to 1 (please note the uppercase 'B' for bound). The value "-1" denotes an unbounded value.
 * o You can specify containment (ownership rules). If 'true', deleting the parent object also deletes the
 *   child object. If 'false', the 2 objects are related, but independent. 
 * When a parent object "owns" all the child objects, containment is true. When an object needs to be shared among
 * multiple parents, containment would be false. This is akin in the relational world to "on delete cascade"
 * (containment is true) or "on delete set null" (containment is false) when specifying foreign key relationships. 
 * It's also akin in C++ to having a member instance (containment is true) and having a member pointer (containment is false).
 * You can also specify bi-directional relationships.  If two classes point to each other, then bi-directional links 
 * can be created with the 'opposite' attribute. For instance, you can have a User own a collection of Portfolios, 
 * and have each Portfolio point back to its owning User.
 */
dojo.declare("dojo.data.meta.Reference",dojo.data.meta.Attribute,{
	initializer: function(name, clazz, readonly){
		dojo.lang.assertType(clazz, [dojo.data.meta.Class, "required"]);
		this.name = name;
		this.readonly = readonly;
		//indicates whether this Reference is part of a primary key of its class
		this.isPrimKeyPart = false;
		//Create generic property functions (get/set) on this feature
		this.inherited("declareProperty",[this,name]);
		this.CLASSTYPE = dojo.data.meta.StructuralFeature.CLASSTYPE_REFERENCE;
		// TODO: assert type of _class is dojo.data.meta.Class--not string
		this._class = clazz;		// private
		this._isContainment = true;	// private
		this._lowerBound = 0;		// private
		this._upperBound = 1;		// private if unbounded, the value is -1
	},

	// Returns whether this reference is a containment relationship to another class.  Containment relationships
	// specify that the lifecycle of the referenced objects is tied to the referring object.  There can be only
	// one object that owns the lifecyle of another. By default, references are containent relationships.  
	isContainment: function(){
		return this._isContainment;
	},
	
	// Specify whether this reference is a containment relationship or a simple reference.
	setContainment: function(value){
		this._isContainment = value;
	},
	
	// Return the the Class of the referenced type.  This will never be a primitive type
	getReferenceType: function(){
		return this._class;
	},
});
