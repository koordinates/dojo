dojo.provide("dojo.data.meta.DerivedAttribute");
dojo.require("dojo.lang.declare");
dojo.require("dojo.data.meta.StructuralFeature");
dojo.require("dojo.data.meta.Attribute");

// DerivedAttribute represents an attribute whose value is obtained via a calculated expression dynamically.
// TODO: Inherit from Attribute
dojo.declare("dojo.data.meta.DerivedAttribute",dojo.data.meta.StructuralFeature,{
	initializer: function(name, type, expression){
		this.name = name;
		this.type = type;
		this.expression = expression;
		//Create generic property functions (get/set) on this attribute
		this.inherited("declareProperty"[this.name]);
		this.CLASSTYPE = dojo.data.meta.StructuralFeature.CLASSTYPE_DERIVEDATTRIBUTE;
	},

	// DerivedAttribute are always readonly.
	// Overrides inherited isReadOnly
	isReadOnly: function(){
		return 1;
	},
	
	// Return the expression for this DerivedAttribute.
	getExpression: function(){
		return this.expression;
	},
	
	// Returns the type of this DerivedAttribute.
	getType: function(){ // public 
		return this.type;
	}
});
