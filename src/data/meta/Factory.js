dojo.provide("dojo.data.meta.Factory");
dojo.require("dojo.data.meta.Class");
dojo.require("dojo.data.meta.Package");
dojo.require("dojo.data.meta.Attribute");
dojo.require("dojo.data.meta.Reference");
dojo.require("dojo.data.meta.DerivedAttribute");
dojo.require("dojo.collections.Dictionary");

dojo.data.meta.GLOBAL_PACKAGE = new dojo.data.meta.Package("__global__");

/**
 * @class public Factory The Factory class for meta objects.
 * Creating a model programmatically using the meta classes can result in a large amount of model creation code.
 * The Creator class is a utility class to help make the JavaScript stream as compact as possible. 
 * We use additional tricks to make the stream even more compact such as by
 * wrapping the calls to Package, Class, Reference and Attribute CTORs.
 * From a quick reading of the example model JSON fragment, you'll rapidly realize that the model pushed is slightly different from
 * what you might have expected. First, a special attribute called 'id' is automatically added to each Class.
 * This attribute is necessary to make references easier to create and find in the model. This attribute is internal and
 * is not accessible through the meta APIs. The Mediators generate automatically unique ids using the
 * A special model root Class is created, for example "dojo.data.UserPortfolios". This is "dojo.data."+{modelName} as a convention. This
 * represents the root of your defined model as it would be generated in an XML file. Because the data stream is
 * output flat (for performance and compactness purposes), that model root also needs References to all Classes
 * in the model.
 * @constructor Factory
 * This class is used to set up and populate the meta model for a data object more efficiently by directly
 * reading JSON-like format.
 *	The constructor takes no parameters.
 */
dojo.data.meta.Factory = new function(){

	this._classes = null; // Dictionary for checking dups
	this.primTypes = ["id","string","int","double","long","date","time"];

	this.fromArray = function (/* Array */ arrayOfJsonData, pname){
		var i=0;
		this._classes = new dojo.collections.Dictionary();
		var model = (pname == null)?dojo.data.meta.GLOBAL_PACKAGE:new dojo.data.meta.Package(pname);
		do{ // top level is an array of Class arrays
			var classData = arrayOfJsonData[i++];
			var newClass = this.classFromArray(classData);
			model.addClass(newClass);
		} while (i < arrayOfJsonData.length);
		var classes = this._classes.getValueList();
		this._classes = null; // Clear out the classes array
		return model;
	};
	
	this.toArray = function(/* Array */ arrayOfClasses){
		dojo.debug("not implemented");
	};

	this.classFromArray = function(/* Array */ arrayOfJsonData){
		var name = arrayOfJsonData[0];
		dojo.debug("Creating class: "+name);
		var newClass = null;
		if (this._classes.contains(name)){
			newClass = this._classes.item(name);
		} else {
			newClass = new dojo.data.meta.Class(name);
			this._classes.add(name,newClass);
		}
		var i=0;
		var featuresArray = arrayOfJsonData[1];
		do{ // Create either an Attribute or a Ref
			var featureData = featuresArray[i++];
			if (this._isAttrData(featureData)){
				var attr = this.attrFromArray(featureData);
				newClass.addAttribute(attr);
			} else {
				var ref = this.refFromArray(featureData);
				newClass.addReference(ref);
			}
		} while (i < featuresArray.length);
		dojo.debug("Created class: "+name);
		return newClass;
	}
	
	this._isAttrData = function(attrData){
	  var i=0;
	  do {
	  	if(this.primTypes[i++] == attrData[1]) return true;
	  } while (i < this.primTypes.length );
	  return false;
	}

	this.attrFromArray = function(/* Array */ params){
		//Set all parameters for a particular Attribute
		//Here we expect the array of
		//for Attribute: [name,type,0,lowerBound,upperBound,id,readOnly] where the last 4 are optional
		//for DerivedAttribute: [name,type,1,expression]
		//and default to 0, 1, and 1 respectively.
		//for example, ["Symbol","string",1, 1, 1, 1]
		// if there are 5 or more parameters, then the 5th parameter must be the Cacl flag. Otherwise, default to '0'.
		var calc = params.length > 2 ? params[2] : 0;
		if (calc == 0)	{
			var readOnly = (params.length > 5) ? params[6] : 0;
			attr = new dojo.data.meta.Attribute(params[0], params[1], readOnly);
			// if there are 3 or more parameters, then the 3rd parameter must be the lowerbound value. Otherwise, default to '1'.
			attr.setLowerBound(params.length > 3 ? params[3] : 1);
			// if there are 4 or more parameters, then the 4th parameter must be the upperbound value. Otherwise, default to '1'.
			attr.setUpperBound(params.length > 4 ? params[4] : 1);
			attr.setPrimKeyPart(params.length > 5 ? params[5] : 0);
		} else {
			attr = new dojo.data.meta.DerivedAttribute(params[0],params[3],params[1]);
		}
		dojo.debug("Created attribute: "+params[0]);
		return attr;
	}

	this.refFromArray = function(/* Array */ refParams){
		//Set all paramaters for a particular Reference
		//Here we expect the array in such an order: refName, classInstance, lowerBound, upperBound, containment, id and readonly
		//for example, ["Usr","UClass",1,1,false,true]
		var refType = null;
		var name = refParams[0];
		if (this._classes.contains(refParams[1])){
			refType = this._classes.item(refParams[1]);
		} else {
			refType = new dojo.data.meta.Class(name);
			this._classes.add(name,refType);
		}
		var readOnly = (refParams.length == 6) ? false : refParams[6];
		var ref = new dojo.data.meta.Reference(name,refType,readOnly);
		ref.setLowerBound(refParams[2]);
		ref.setUpperBound(refParams[3]);
		ref.setContainment(refParams[4]);
		ref.setPrimKeyPart(refParams[5]);
		dojo.debug("Created reference: "+name);
		return ref;
	}
}
