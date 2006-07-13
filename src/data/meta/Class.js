dojo.provide("dojo.data.meta.Class");
dojo.require("dojo.lang.declare");
dojo.require("dojo.collections.Dictionary");
dojo.require("dojo.data.meta.Package");

/**
 * Class is the equivalent JavaScript implementation of an Class,and represents a class which holds
 * all Attributes and References and other fields.
 */
dojo.declare("dojo.data.meta.Class",null,{
	initializer: function(cname, diffgramNeeded){
		this.name = cname;
		this._attributes = new dojo.collections.Dictionary(); //private - Use getAllAttributes() to access
		this._references = new dojo.collections.Dictionary(); //private - Use getAllReferences() to access 
		this.diffgramNeeded = true;
		this._package = null;
		if(diffgramNeeded != undefined){
			this.diffgramNeeded = diffgramNeeded;
		}
	},

	/**
	 *	Get an Attribute of this class. If the Attribute does not exist,
	 *	this method will return null.
	 **/
	getAttribute: function(name){
		return this._attributes.item(name);
	},
	/**
	 *	Adds an Attribute to this class. If the Attribute has been added already,
	 *	this method will just return the Attribute.
	 **/
	addAttribute: function(attribute){
		this._attributes.add(attribute.name, attribute);
		return attribute;
	},

	// Removes an Attribute from this class.
	removeAttribute: function(name){
		this._attributes.remove(name);
	},

	/**
	 *	Method to get an Reference to this class. If the Reference not have,
	 *	this method will return null.
	 */
	getReference: function(name){
		return this._references.item(name);
	},

	/**
	 *	Adds an Reference to this class. If the Reference has been added already,
	 *	this method will just return the Reference.
	 */
	addReference: function(reference){
		this._references.add(reference.name, reference);
		return reference;
	},

	/**
	 *	Removes a Reference from this class.
	 */
	removeReference: function(nameOrIndex){
		return this._references.remove(nameOrIndex);
	},

	// Returns an Attribute or Reference give a name.
	getStructuralFeature: function(name){
		if ( this._attributes.contains(name) ){
			this._attributes.item(name);
		}
		return this._references.item(name);
	},

	// Get the Package that this class is contained within.
	getPackage: function(){
		return this._package;
	},

	// Set the Package that this class is contained within.
	setPackage: function(aPackage){
		this._package = aPackage
	},

	// Return an Array of all Attributes this class has.
	getAllAttributes: function(){
		return this._attributes.getValueList();
	},

	// Return an array of all References this class has.
	getAllReferences: function(){
		return this._references.getValueList();
	},
	
	// Check whether a value for either an Attribute or Reference identified by the name is valid for this Class.
	_validateType: function(name, value){
		var structFeat = this.getStructuralFeature(name);
		if (structFeat == null){
			dojo.debug("Class._validateType: Feature, "+name+", does not exist in class: "+this.name);
		}
		if ( structFeat.CLASSTYPE == StructuralFeature.CLASSTYPE_EATTRIBUTE ){
			var res = structFeat._validateType(value);
			return res;
		}
		return value;
	},
	
	//Check whether either an Attribute or Reference identified by the name has a valid cardinality for this Class.
	_validateCardinality: function(name,length){
		var structFeat = this.getStructuralFeature(name);
		if (null == structFeat){
			dojo.debug("Class._validateCardinality: feature, "+name+", does not exist in class: "+this.name);
		}
		structFeat._validateCardinality(length);
	}
});

//TODO: CCM- Place this utility function in dojo.meta namespace
/**
* Returns the Class's definition in string format for tracing purpose.
* @param Class aClass
*	 The root Class from which printing starts.
*/
dojo.data.meta.Class.printClass = function(aClass){
	this._resetPrintFlags = function(aClass){
		aClass.bAlreadyPrinted = false;
		var refs = aClass.getAllReferences();
		var i=0;
		while (i<refs.length){
			var ref = refs[i++];
			var aClassChild = ref.getReferenceType();
			if (aClassChild != null && aClassChild.bAlreadyPrinted)
				this._resetPrintFlags(aClassChild);
		}
	}
	
	this._printClassInternal = function(aClass,level){
		if (aClass.bAlreadyPrinted)
			return "";
	
		aClass.bAlreadyPrinted = true;
		var ident = "";
		for (var i=0; i < level; ++i)
			ident += "  ";
	
		var str = ident + "Class: " + aClass.name + "\n";
		ident += "	 ";
		var attrs=aClass.getAllAttributes();
		var a=0;
		while(a<attrs.length){
			var attr = attrs[a++];
			str += ident;
			if (attr.declaredClass == "dojo.data.meta.Attribute")
				str += "Attribute: " + attr.name + " Type: " + attr.type + " lowerBound: " + attr.getLowerBound()
							+ " upperBound: " + attr.getUpperBound() + "\n";
			else
				str += "DerivedAttribute: " + attr.name + " expression: " + attr.getExpression() + "\n";
		}
		var refs = aClass.getAllReferences();
		a=0;
		while(a<refs.length){
			var ref = refs[a++];
			str += ident + "Reference: " + ref.name;
			if (ref.getReferenceType() != null)
				str += " type: " + ref.getReferenceType().name;
			str += " lowerBound: "+ref.getLowerBound()+" upperBound: "+ref.getUpperBound()+"\n";
			if (ref.getReferenceType() != null)
				str += this._printClassInternal(ref.getReferenceType(),level+4);
		}
		return str;
	}
	this._resetPrintFlags(aClass);
	return this._printClassInternal(aClass,0);
}