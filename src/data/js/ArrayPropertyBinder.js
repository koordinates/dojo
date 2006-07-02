dojo.provide("dojo.data.js.ArrayPropertyBinder");

dojo.data.js.ArrayPropertyBinder = function(dataObject,propertyname,control,controlproperty,controlChangeEventName,callbackChangeEvent){
	this.dataObject = dataObject;	// public
	this.propertyName = propertyname;
	this.control = control;	// public
	this.controlProperty = controlproperty;	// public
	this.controlChangeEventName = controlChangeEventName;	// public
	this.callbackChangeEvent = callbackChangeEvent;	// public
    this.converter = null;
    this.index= null;
};


dojo.data.js.ArrayPropertyBinder.prototype.refresh = function() {
	if(this.dataObject) {
		this.dataBind();
	} else {
		this.setValue("");
	}
};


/**
 * @method public PropertyBinder.prototype.dataBind
 * 	get the value from the data model and display it on the control.
 *	Also setup all the binding.
 **/
dojo.data.js.ArrayPropertyBinder.prototype.dataBind = function()	{//public
	
	var indicies = this.propertyName.split("_");
	var value = this.dataObject[indicies[0]][indicies[1]]; //.getValue(this.propertyName);

	if(this.converter!=null){
      value = this.converter.valueToString(modelValueToObject(this.converter, value));
    }
   	//DO NOT change this line to if(value). It will fail for boolean values
    //if(value != null && value != 'undefined'){
		this.setValue(value);
	//}

	this.dataObject.propertyBinders.push(this);
	//Attach to control event, dont override it...this way all handlers attached to this event will get called
	if (this.controlChangeEventName != null){
		if(this.control.attachEvent){
			this.control.attachEvent(this.controlChangeEventName, this.onPropertyBinderChange);
		} else{
			if(this.controlChangeEventName.length>2 && this.controlChangeEventName.substring(0,2) == "on"){
				var tempString = this.controlChangeEventName.substring(2, this.controlChangeEventName.length);
				this.control.addEventListener(tempString, this.onPropertyBinderChange, false);
			}
		}
		this.control.propertyBinder = this;
	}
}

/**
 * @method public PropertyBinder.prototype.onPropertyBinderChange
 * 	it is called when the control's data changed
 **/
dojo.data.js.ArrayPropertyBinder.prototype.onPropertyBinderChange = function() {// private
	try	{
		var value = null;
		var element = null;
		if(isIE()){//TODO: Convert this to dojo equivalent browser test
			element = this.event.srcElement ? this.event.srcElement : this.event.target;
		} else{
			element = this;
		}
		var propertyBinder = element.propertyBinder;
		if (propertyBinder.controlGetFunction != null){
			value = element[propertyBinder.controlGetFunction]();
		} else {
			value = element[propertyBinder.controlProperty];
		}
		if(propertyBinder.converter!=null) {
        	value = getModelValue(propertyBinder.converter.stringToValue(value));
		}
		var valueInModel = null;
		//Handle multi-value case
		//Replace the value inside the vaue array before we call eSet()
		if(propertyBinder.index != null) {
			var temp = propertyBinder.dataObject.get(propertyBinder.propertyName);
			valueInModel = new Array();
			for(var i=0; i<temp.length ; i++){
				valueInModel[i] = temp[i];
			}
			valueInModel[propertyBinder.index] = value;
		} else { //Otherwise, just set it back
			valueInModel = value;
		}
		if (propertyBinder.DataObject != null){
			var retval = propertyBinder.dataObject.set(propertyBinder.propertyName,valueInModel);
			if (typeof event != 'undefined' &&event != null){
				event.returnValue = retval;
			}
		}

		if (propertyBinder.callbackChangeEvent != null){
			propertyBinder.callbackChangeEvent(propertyBinder.dataObject,propertyBinder.propertyName,valueInModel);
		}
	} catch(e) {
		if (propertyBinder.onError != null){
			 propertyBinder.onError("CHANGEVALUE",e);
		}
		propertyBinder.unbind();
		propertyBinder.bind();
		if (typeof event != 'undefined' &&event != null){
			event.returnValue = false;
		}
	}
}



/**
 * @method public PropertyBinder.prototype.fireValueChanged
 * 	When the controls value is changed, set the changed value to
 *  the data model, as well as fire all the controls which bound
 * 	to the data model.
 **/
dojo.data.js.ArrayPropertyBinder.prototype.fireValueChanged = function(name, valueInModel, index)	{// private

	//handle multivalue case
	if(index != null){
		value = valueInModel[index];
	} else {
		value = valueInModel;
	}
	
	//TODO:  It'd be nice to have a way to normalize an xpath expression.  for example, ./@value might be equal to @value
	if (this.propertyName != name && this.propertyName != "./" + name){
		return;
	}
	if (this.propertyName == name){
      if(this.converter!=null){
         value = this.converter.valueToString(modelValueToObject(this.converter, value));
      }
	}
	//DO NOT change this line to if(value). It will fail for boolean values
    //if(value != null && value != 'undefined'){
		this.setValue(value);
	//}
}

/**
 * @method public PropertyBinder.prototype.setValue
 * 	Set the new value to the control
 * @param String value
 *	The new value
 **/
dojo.data.js.ArrayPropertyBinder.prototype.setValue = function(value){

	if(this.controlSetFunction && (!this.controlGetFunction || (this.control[this.controlGetFunction] != value || (typeof this.control[this.controlGetFunction] != typeof value)))){
		if(value != null && value != 'undefined'){
			this.control[this.controlSetFunction](value, this.dataObject, this.propertyName);
		} else {
			this.control[this.controlSetFunction]("", this.dataObject, this.propertyName);
		}
	} else {
		if(this.control[this.controlProperty] != value || (typeof this.control[this.controlProperty] != typeof value)){
			if(value != null && value != 'undefined'){
				this.control[this.controlProperty] = value;
			} else {
				this.control[this.controlProperty] = "";
			}
			if(this.controlChangeEventName && this.control[this.controlChangeEventName]){
			//TODO: PORT THIS!
				hX_4.imp.fireEvent(this.control, this.controlChangeEventName);
			}
		}
	}
}
