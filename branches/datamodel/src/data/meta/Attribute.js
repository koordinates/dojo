dojo.provide("dojo.data.meta.Attribute");
dojo.require("dojo.lang.declare");
dojo.require("dojo.data.meta.StructuralFeature");

// Attribute holds all the information about an attribute of a class.
dojo.declare("dojo.data.meta.Attribute",dojo.data.meta.StructuralFeature,{
	initializer: function(name, type, readonly){
		this.name = name;
		this.type = type;
		this.readonly = readonly;
		//Create generic property functions (get/set) on this attribute
//		this.inherited("declareProperty"[this,name]);
		this.declareProperty(this,name);
		this._lowerBound = 0;	// private
		this._upperBound = 1;	// private if unbounded, the value is -1
		//boolean flag to indicate whether this Attribute is part of Primary Key
		//of the Class to which this Attribute belongs.
		this.isPrimKeyPart = false;
		this.CLASSTYPE = dojo.data.meta.StructuralFeature.CLASSTYPE_ATTRIBUTE;
	},
	
	// Returns whether the this Attribute is readonly.
	isReadOnly: function(){
		return this.readonly;
	},
	
	// Returns the lowerBound of this attribute. Lower bound is the floor of the attributes cardinality.
	getLowerBound: function(){
		return this._lowerBound;
	},
	
	 // Set the LowerBound of this attribute.  Lower bound is the floor of the attributes cardinality.
	setLowerBound: function(/*int*/value){
		this._lowerBound = value;
	},
	
	// Returns the upper bound of this attribute. Upper bound is the ceiling of the attribute's cardinality.
	getUpperBound: function(){
		return this._upperBound;
	},
	
	// Sets the upper bound of this attribute. Upper bound is the ceiling of the attribute's cardinality.
	setUpperBound: function(/*int*/value){
		this._upperBound = value;
	},
	
	// Returns whether this Attribute is part of a primary key that uniquely identifies an object of a class.
	isPrimKeyPart: function(){
		return this.isPrimKeyPart;
	},
	
	// Specify that this Attribute is part of a primary key that uniquely identifies an object of a class.
	setPrimKeyPart: function(/*boolean*/isPrimKeyPart){
		this.isPrimKeyPart = isPrimKeyPart;
	},
	
	// Method to check whether the specified value has a valid type for this Attribute.
	_validateType: function(/*primitive value not object*/value){
	    if (value == null) return null;
	    var type = this.type;
		var ifvalid = true;
		if (null == type){
			return value;
		}
		//if value is an array which conatins multiple values
		if(	(this.getUpperBound() == -1 ||
		   	 this.getUpperBound() > 1 || 
		   	 (this.getLowerBound() < this.getUpperBound() && 
			  this.getUpperBound() > 1 )) &&
			"object" == typeof(value) && 
			value.length != null && 
			value.length >= 0){
			//loop thru the array for checking
			for(var i=0; i < value.length; ++i){
				aValue = value[i];
				this._validateIndividualValueType(type, aValue);
			}
			//return the whole list after checking thru the whole array.
			return value;
		}
		//Just a simple primitive value
		var res = this._validateIndividualValueType(type, value);
		return res;
	},
	
	// Check whether a value has a valid type for this Attribute (value is a primitive type, not a data object)
	_validateIndividualValueType: function(type, value){
		if (value == null) return null;
		var ifvalid = true;
	    if ("string" == type){
			if (value == null){
				value = "";
			} else if(typeof(value)=="number"||value instanceof Date){
				return value.toString();
			}else if(typeof(value) =="string"){
				return value;
			}else{
				ifvalid = false;
			}
		}
		if ("boolean" == type){
			if ("boolean" != typeof(value)){
				if ("true" == value.toLowerCase() || "1" == value){
					value = true;
				} else if ("false" == value.toLowerCase() || "0" == value ){
					value = false;
				} else {
					ifvalid = false;
				}
			} else {
				return value;
			}
		}
		if ("byte" == type
			|| "integer" == type
			|| "int" == type
			|| "long" == type
			|| "short" == type
			|| "decimal" == type
			|| "float" == type
			|| "double" == type ){
			var v = value * 1;
			if (isNaN(v)){
				ifvalid = false;
			} else {
				return v;
			}
		}
		if ("unsignedByte" == type
			|| "positiveInteger" == type
			|| "nonNegativeInteger" == type
			|| "unsignedInt" == type
			|| "unsignedLong" == type
			|| "unsignedShort" == type){
			var v = value * 1;
			if ( isNaN(v) || v<0 ){
				ifvalid = false;
			} else {
				return v;
			}
		}
		if ("nonPositiveInteger" == type
			|| "negativeInteger" == type){
			var v = value * 1;
			if (isNaN(v)|| v > 0){
				ifvalid = false;
			} else {
				return v;
			}
		}
	
		if(!ifvalid){
			dojo.debug("Attribute.ValidateType: Invalid value for type "+type+", value:"+args);
		}
		return value;
	},

	// Check whether the specified length is within the bounds of the cardinality constraints.	
	_validateCardinality: function(length){
		if ( this.getUpperBound() != -1	&& length > this.getUpperBound()){
			dojo.debug("Attribute.ValidateCardinality: maximum cardinality, "+this.getUpperBound()+", exceeded for attribute: "+name);
		}
		if (this.getLowerBound() > 0 && length < this.getLowerBound()){
			dojo.debug("Attribute.ValidateCardinality: minimum cardinality, "+this.getLowerBound()+", exceeded for attribute: "+name);
		}
	}
});
