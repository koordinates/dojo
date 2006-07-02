dojo.provide("dojo.data.js.PropertyBinder");
dojo.require("dojo.lang.declare");

// This class is functioning as a control center. so that a change in the data model will fire
// all the registered events which are bound to the same data model.
dojo.declare("dojo.data.js.PropertyBinder",null,{

	initializer: function(dataObject,propertyname,control,controlproperty,controlChangeEventName,callbackChangeEvent){
		this.dataObject = dataObject; // The bound dataObject
									  // propertyname is the bound attribute of the dataObject
		this.control = control;	// The widget containing field bound to data eg. "input text field".
		this.controlProperty = controlproperty;	// The property of the control, like the value property of "input text field".
		this.controlChangeEventName = controlChangeEventName;	// The event will be invoked when data model change, like "onchange" event.
		this.callbackChangeEvent = callbackChangeEvent;	// The event will be invoked in the case that this control fire the change, and all
														// the bound events are fired.
	    this.converter = null;
	    this.index= null;
	
		// Parse propertyname to extract propertyName and index, such as price[2]
		var pos1 = propertyname.indexOf("[");
		if(pos1 != -1){
			this.propertyName =  propertyname.substring(0, pos1);
			var pos2 = propertyname.indexOf("]");
			this.index = propertyname.substring(pos1+1, pos2);
		} else {
			this.propertyName = propertyname;
		}
	},

	controlGetFunction: null,
	controlSetFunction: null,	
	
	activateDataSet: function(obj){
		this.dataUnbind();
		this.dataObject = obj;
	},
	
	refresh: function(){
		if(this.dataObject)
			this.dataBind();
		else{
			this.setValue("");
		}
	},

	// Set the converter used during the data transfer
	setConverter: function(aConverter){
	   this.converter= aConverter;
	},
	
	onError: function(action, exception){
		alert("Error "+exception+"on property binder action: "+action);
	},

	// Called when the control's data changed
	onPropertyBinderChange: function() {
		try	{
			var value = null;
			var element = null;
			if(isIE()){//FIXME: Convert this to dojo equivalent browser test
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
	},

	// Get the value from the data model and display it on the control and setup all the binding.
	dataBind: function() {
		var valueInModel = this.dataObject.eGet(this.propertyName);
		var value = null;
		//Handle multi-value case
		//Replace the value inside the vaue array before we call eSet()
		if(this.index != null){
			value = valueInModel[this.index];
		} else { //Otherwise, just set it back
			value = valueInModel;
		}
		if(this.converter!=null){
	      value = this.converter.valueToString(modelValueToObject(this.converter, value));
	    }
	   	//DO NOT change this line to if(value). It will fail for boolean values
	    //if(value != null && value != 'undefined'){
			this.setValue(value);
		//}
		this.dataObject.propertyBinders.add(this);
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
	},

	// Unbind the control with the data model. Remove control's all the binder.
	dataUnbind: function(){
		if(this.dataObject!=null){
			this.dataObject.propertyBinders.remove(this);
			//Remove only the event listener that we attached
			if (this.controlChangeEventName != null){
				//this.control[this.controlChangeEventName] = null;
				//this.control.propertyBinder = null;
				if(this.control.detachEvent){
					this.control.detachEvent(this.controlChangeEventName, this.onPropertyBinderChange);
				}else{
					if(this.controlChangeEventName.length>2 && this.controlChangeEventName.substring(0,2) == "on"){
						var tempString = this.controlChangeEventName.substring(2, this.controlChangeEventName.length);
						this.control.removeEventListener(tempString, this.onPropertyBinderChange, false);
					}
				}
			}
			this.control.propertyBinder = null;
		}
	},

	// When the control's value is changed, set the changed value to the data model, 
	// as well as fire all the controls which are bound to the data model.
	fireValueChanged: function(name, valueInModel, index)	{
		//handle multivalue case
		if(index != null){
			value = valueInModel[index];
		} else {
			value = valueInModel;
		}
		if (this.propertyName != name){
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
	},
	
	// Set the new value to the control
	setValue: function(value/*string*/){
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
});