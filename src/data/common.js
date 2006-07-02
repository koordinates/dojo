dojo.provide("dojo.data.common");
//dojo.//require("dojo.data.js.DataObject");
dojo.require("dojo.lang");

/**
  * @method public getDataObjectFromFeatureName
  *    The function is used to get the right dataObject in some special cases in selectandactivehandler and selectandsethandler,
  *	like the source feature is "["Usr.Portfolios[0].Positions[0].Stock.Symbol", "_26", "Symbol"]".
  * @parameter dojo.data.js.DataObject dataObj
  *    The parent data object with the feature.
  * @parameter String featureName
  *	   The feature name which is used to get the data object.
 **/
dojo.data.getDataObjectFromFeatureName = function(dataObj,featureName){
		if(featureName.indexOf(".")!=-1){
			var	srcFeatureArray = featureName.split(".");
			if(srcFeatureArray!=null){
				for(var j=0;j<srcFeatureArray.length-1;j++){
					dataObj = _getDataObjectInternal(dataObj,srcFeatureArray[j]);
				}
			}
		} else {
			dataObj = _getDataObjectInternal(dataObj,featureName);
		}
	return dataObj;
 }

dojo.data._getDataObjectInternal = function(dataObj, featureName){
		var tempIndex = featureName.indexOf("[");
		if(tempIndex!=-1){
			var tempFeatureName = featureName.substring(0,tempIndex);
			var index = featureName.substring(tempIndex+1, featureName.length-1);
			var returnObjArr = dataObj.get(tempFeatureName);
			if(returnObjArr)
				dataObj= returnObjArr[Number(index)];
			else
				dataObj = null;
		}else{
			dataObj = dataObj.get(featureName);
		}
		return dataObj;
 }

dojo.data.globalId = 0;

/**
 * @method public newId
 * 	This method is used to generate a unique id for a data object.
 * @return String
 *	Returns new generated data object id.
 **/
dojo.data.newId = function(){
	return "gid_" + ++dojo.data.globalId;
}

/**
* @method public findObjectBySignature
* 	This function is used for finding an data object by a given signature.
* @param DataObject dataObject
*	a root object containing many children
* @param String aSignature
*	The signature of an data object
* @return DataObject
*	Returns targetObj an data object whose signature matches with the input signature
**/
dojo.data.findObjectBySignature = function(dataObject, aSignature){
	var objects = new Array();
	//TODO: Define CompareSignature
	var targetObj = traverseGraph(dataObject, aSignature, objects, CompareSignature);
	return targetObj;
}

/**
* @method public findDataObjectByVBL
* 	This function is used for finding a data object by a given vblExpression and an optional model name.
* @param String vblExpression
*	a VBL expression of Client model, such as root.users[0].portfolios[0].positions[0]
* @param String modelName
*	an model name, optional. If this is supplied, it will be used to get the model object from the client-side registry.
* @return DataObject
*	Returns DataObject an object which is retrieved using an VBL expression
* TODO: This method scans all object graphs for a match.  Needs to changed so that path
* is relative to a data object passed in.
**/
function findDataObjectByVBL(vblExpression, modelName){
   var targetObj = null;
   //Get model object first
   var xmlHandler = null;
   //add code to strip out {# } from vblExpression
   var index = vblExpression.indexOf("#{");
   if(index != -1){
      vblExpression = vblExpression.substring(2);
   }
   var rightBraceIndex = vblExpression.indexOf("}");
   if(rightBraceIndex != -1) {
      vblExpression = vblExpression.substring(0, rightBraceIndex)
   }
   //TODO: provide access to modelRegistry
   //now the vbl expression has been stripped of the #{..remove the sc_
   //no stripping the sc_ now
   //vblExpression = vblExpression.replace(/^sc_[^\.]*\./,"");
   var modelNames = modelRegistry.getModelNames();
   //if modelName is suppied, use it to retrieve the model obj
   if(modelName != null && modelName != "") {
      xmlHandler = modelRegistry.Models[modelName];
      for(var key in modelNames){
      	var modName = modelNames[key];
      	if(modName == modelName){
      		vblExpression  = vblExpression.substring(key.length, vblExpression.length);
      	}
      	break;
      }
   } else {
      //get the model name  from VBL
      // This logic needs to be changed to match the java logic
      //var modelNameFromVBL = refArray[0]
      //var tempIndex = refArray[0].indexOf("[");
      //if(tempIndex!=-1)
      //{
       //  modelNameFromVBL = modelNameFromVBL.substring(0,tempIndex);
      //}
	  var index = -1;
	  var matchedKey = null;
	  for(var key in modelNames){
		var tempIndex  = -1;
		if(vblExpression.indexOf(key) == 0){
			tempIndex = key.length-1;
		}
		if(tempIndex > index){
			index = tempIndex;
			matchedKey = key;
		}
	  }
	  var modelNameFromVBL = modelNames[matchedKey];
	  //remove the matched key from the VBL
	  vblExpression = vblExpression.substring(index+1, vblExpression.length);
      xmlHandler = modelRegistry.models[modelNameFromVBL];
   }
   var root = xmlHandler.root;
   var rootRefName = xmlHandler.RootMemberName;
   vblExpression = rootRefName + vblExpression;
   var dataObj = root;
   var refArray = vblExpression.split(".");
   //need checking to make sure that it is a ref
   if(refArray!=null) {
       //Loop thru the whole expression
      for(var j=0; j<refArray.length; j++){
         var refName = refArray[j];
         var tempIndex = refName.indexOf("[");
         if(tempIndex!=-1){
            refName = refName.substring(0,tempIndex);
            //Root ref name is not set following  convention, and it is set using Class name, such as Root, instead of root
            //So we have to replace it with the one from xmiHandler
            var index = refArray[j].substring(tempIndex+1, refArray[j].length-1);
            var returnObjArr = dataObj.get(refName);
            dataObj = returnObjArr[Number(index)];
         } else {
            //Root ref name is not set following  convention, and it is set using Class name, such as Root, instead of root
            //So we have to replace it with the one from XMIHandler
            var tempObj = dataObj.get(refName);
            //Root object is stored as an array, not as a single object because of add() is called at model output time
            //This may have to change
            if(j==0){
               dataObj= tempObj[0];
            } else {
               dataObj = tempObj;
            }
         }
      }
   }
   targetObj = dataObj;
   return targetObj;
}


/**
* @method public traverseGraph
* 	This generic function is used to recursively search for an dataObject by a given visitor and search criteria.
* @param DataObject dataObject
*	a root eobject containing many children
* @param String criteria
*	The criteria for our search
* @param Array objects
* 	an array to keep track of objects which have been traversed
* @param visitor
* 	a JavaScript function defined provided by an application.  This function will be executed on every node (every data object) with two parameters
*  (data object and criteria) passed in.
*  its execution.
* @return DataObject
*	Returns targetObj an eobject whose __id__ matches with the input xmiID
**/

dojo.data.traverseGraph = function(dataObject, criteria, objects, visitor, atrname){
	var targetObj = null;
	if (null == dataObject || "object" != typeof(dataObject)){
		return null;
	}
	//we have a match
	//if (dataObject.__id__ == __id__)
	if(visitor(dataObject,criteria,atrname)){
		targetObj = dataObject;
		return  targetObj;
	}
	for (var i = 0; i < objects.length; ++i){
		// object already searched
		if (dataObject == objects[i]){
			return targetObj;
		}
	}
	objects[objects.length] = dataObject;
	for (var i = 0; i < dataObject.members.length; ++i){
		//Attributes do not need to be processed here
		//So we only need to look into references.
		if ( dataObject.Members[i].StructuralFeature.CLASSTYPE & (StructuralFeature.CLASSTYPE_ATTRIBUTE | StructuralFeature.CLASSTYPE_DERIVEDATTRIBUTE) != 0){
			continue;
		}
		var name = dataObject.members[i].name;
		var value = dataObject.get(name);
		if (null == value){
			continue;
		}

		//if it is a Reference
		if ("object" == typeof(value)){
			//if it is an array
			if (value.length != null && "number" == typeof(value.length)){
				//loop thru all references
				for (var j = 0; j < value.length; ++j){
					//if it is an object and we have a match
					//if ("object" == typeof(value[j]) && value[j].__id__ == __id__)
					if ("object" == typeof(value[j]) && visitor(value[j],criteria,atrname)){
						targetObj =  value[j];
						return targetObj;
					} else {
						var targetObj = traverseGraph(value[j],criteria,objects,visitor,atrname);
						//We have a match and return
						if (targetObj != null){
							return targetObj;
						}
					}
				}
			} else {
				//if it is an object and we have a match
				//if ("object" == typeof(value) && value.__id__ == __id__)
				if (visitor(value,criteria,atrname)){
					targetObj = value;
					return  targetObj;
				} else {
					var targetObj = traverseGraph(value, criteria, objects, visitor,atrname);
					//We have a match and return
					if (targetObj != null){
						return targetObj;
					}
				}
			}
		}
	}
	return targetObj;
}

/**
* @method Public mergeData
*    Method to merge a data object or an array of data objects of the same type to an existing data graph.
*    This method is used as a public method to start this process and this method will call a private
*    method: mergeInternal() to recursively traverse through the graph.
* @param dataObject newData
*    A data object or an array of data objects of the same type.
* @param dataObject parentObj
*    A data object into which new data will be merged.
* @param String refName
*    The Reference name for parentObj and newData will be merged into.
* @exception ObjectError
*    An exception will be thrown if refName provided is not a Reference for parentObj.
**/
dojo.data.mergeData = function(newData, parentObj, refName){
   var member = parentObj.getMember(refName);
   if( member.StructuralFeature.CLASSTYPE != StructuralFeature.CLASSTYPE_REFERENCE){
		//TODO: Handle gracefully
		dojo.debug("mergeData: Reference named "+refName+" was not found on the parent object")
//throw an exception
//      throw new EObjectError(Msg);
    }
   //Reset this array to keep track which data object has been merged
   var status = parentObj.status;
   parentObj.status = null;
   var objects = new Array();
   _mergeInternal(newData, parentObj, member, objects);
   parentObj.status = status;
   parentObj.refresh(refName, parentObj.get(refName));
}

/**
* @method private _mergeInternal
*    Method to recusively walk thru all data objects to merge them into an exsiting data graph.
*    This method will keep tracking of data objects which have been merged.  If it has been merged, it will simply skip
*    and will  continue to process other data objects.  This method will call a private
*    method: mergeSingleObjectToModel().
* @param dataObject newData
*    A data object or an array of data objects of the same type.
* @param dataObject parentObj
*    A data object into which new data will be merged.
* @param Member member
*    An Member object into which the new data object belongs to inside the parentObj.
* @param Array objects
*    The array to keep tacking of what objects have been processed.
* @exception ObjectError
*    An exception will be thrown if root data object is null.
**/
dojo.data._mergeInternal=function(newData, parentObj, member, objects){
   if (newData != null){
      // if  newData is a list
      if (newData.length != null && "number" == typeof(newData.length)){
         for (var j = 0; j < newData.length; ++j){
             _mergeSingleObjectToModel(newData[j], parentObj, member, objects);
         }
      } else {
      //newData is a single object
         _mergeSingleObjectToModel(newData, parentObj, member, objects);
      }
   }
}

/**
* @method private _mergeSingleObjectToModel
*    Method to merge one single data object into an exsiting data graph.
*    This method will keep tracking of data objects which have been merged.  If it has been merged, it will simply skip.
*    This method will call two private methods: mergeObject() and insertObject(). mergeObject() method will in turn
*    recursively call mergerInternal() method.
* @param DataObject newObj
*    A new data object to be merged.
* @param DataObject parentObj
*    A data object into which new data will be merged.
* @param Member member
*    An Member object into which the new data object belongs to inside the parentObj.
* @param Array objects
*    The array to keep tacking of what objects have been processed.
* @exception ObjectError
*    An exception will be thrown if root data object is null.
**/
dojo.data._mergeSingleObjectToModel=function(newObj, parentObj, member, objects){
   for (var i = 0; i < objects.length; ++i){
      // object already merged
      if (newObj == objects[i]){
         return;
      }
   }
   objects[objects.length] = newObj;
   //loop thru every old object
   oldObjList = parentObj.get(member.name);
   //if oldObjList is a list
   if(oldObjList.length != null && "number" == typeof(oldObjList.length)){
      var match = false;
      for(var i=0; i<oldObjList.length; ++i){
         var oldObj =  oldObjList[i];
         if(oldObj && oldObj.getSignature() == newObj.getSignature()){
            _mergeNewObjectWithOldObject(newObj, oldObj, objects);
            match = true;
            break;
         }
      }
      if(match== false){
         _insertObject(newObj, parentObj, member);
      }
   } else { //oldObjList is not a list
      if(oldObjList.getSignature() == newObj.getSignature()) {
         _mergeNewObjectWithOldObject(newObj, oldObjList, objects);
      } else {
         _insertObject(newObj, parentObj, member);
      }
   }
}
// TODO: Make sure to handle "id" fields correctly...
/**
* @method private _mergeNewObjectWithOldObject
*    Method to merge two data objects attibute by attribute, reference by reference.  For attibutes,
*    we simply copy the vale to replace the old one except xmiid field.  For reference, we have to
*    recursively go thru all its children by calling mergeInternal() method.
* @param eObject newObj
*    The new eObject to contain all new values.
* @param eObject oldObj
*    The old eObject to be updated.
* @param Array objects
*    The array to keep tacking of what objects have been processed.
**/
dojo.data._mergeNewObjectWithOldObject=function(newObj, oldObj, objects){
   //loop thru all members, copy attributes, call mergeInternal() for each reference
   for (var i = 0; i < oldObj.members.length; ++i){
      var feature = oldObj.members[i].structuralFeature;
	  var member = oldObj.members[i];
	  var name = oldObj.members[i].name;
      var value = newObj.get(name);
 	  if (null == value)
		continue;

      //If it is a ref
      //here key fields may not need to copy either.
      if ("object" == typeof(value) && feature.CLASSTYPE == StructuralFeature.CLASSTYPE_REFERENCE){
		    //recursive call
        _mergeInternal(value, oldObj, member, objects);
	  } else if (feature.CLASSTYPE == StructuralFeature.CLASSTYPE_DERIVEDATTRIBUTE){
		continue;
      } else {
        //if it is an attr
        //if is is an id field or it is part of key, we do not need to copy.
        if(feature.type == "id" || feature.id == true){
            continue;
        }
        oldObj.set(name, value);
      }
	}
}

/**
* @method private _insertObject
*    Method to help add a new data object into its parentObject according to its cardinality.  If its cardinality is greater than 1,
*    add() is used.  Otherwise, set() is used.
* @param DataObject newObj
*    An object to be added to the parentObj as a child.
* @param DataObject parentObj
*    An object into which the new object will be added.
* @param Member member
*    An Member object into which the new object belongs to inside the parentObj.
**/
dojo.data._insertObject=function(newObj, parentObj, member){
   //#Satish: Observed "Illegal Output Parameter Mapping" JS Error if  the WebService returns
   //output of type Complex and there is no parameter mapping.
   //If the signature of two objects  is different then it used to call "add()" method on that object always,
   //Which was illegal. There should be proper check for Cardinality.  There was the bug in the following condition
   //which is fixed now.
   //Fixed :
   //1)Replaced the very first (if we move left to right in the following if condition)
   //OR (||) condition by AND (&&) condition.
   //2)Put rest of the remaining expression within parenthesis
   var ref = member.structuralFeature;
  	if (parentObj.get(member.name) != null && 
  	    (ref.getUpperBound() == -1 || ref.getUpperBound() > 1 || (ref.getLowerBound() < ref.getUpperBound() && ref.getUpperBound() > 1))){
	   parentObj.add(member.name, newObj);
   } else {
	   parentObj.set(member.name, newObj);
   }
}

