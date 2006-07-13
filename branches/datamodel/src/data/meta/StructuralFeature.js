dojo.provide("dojo.data.meta.StructuralFeature");
dojo.require("dojo.lang.declare");

dojo.data.meta.StructuralFeature.CLASSTYPE_ATTRIBUTE				= 0x1;
dojo.data.meta.StructuralFeature.CLASSTYPE_ATTRIBUTECALCULATE		= 0x2;
dojo.data.meta.StructuralFeature.CLASSTYPE_REFERENCE				= 0x4;

// Represents a structural feature of a class, such as an attribute, reference, or derived attribute
dojo.declare("dojo.data.meta.StructuralFeature",null,{
	CLASSTYPE: "undefined",

	toString: function(){
		//subclasses must implement
	},

	//Adds generic accessors and mutator functions to the specified object.
	declareProperty: function(obj, featureName){
		obj._setter = new Function("value", 'this.set("' + featureName + '", value);');
		obj._getter = new Function('return this.get("' + featureName + '");');
	}
});
