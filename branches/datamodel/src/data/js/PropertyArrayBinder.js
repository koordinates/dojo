dojo.provide("dojo.data.js.PropertyBinder");
dojo.require("dojo.lang.declare");

// FIXME: This is broken...should prob inherit from PropertyBinder
dojo.declare("dojo.data.js.PropertyArrayBinder",null,{

	initializer: function(control, dataObject, propertyname, onRowAdded, onRowDeleted){
		this.control = control;	
		this.dataObject = dataObject;
		this.propertyName = propertyname;
		this.onRowAdded	= onRowAdded;	
		this.onRowDeleted = onRowDeleted;
	},

	bind: function(){	
		this.dataObject.propertyArrayBinders.add(this);
	},
	
	_fireRowAdded: function(name,value){
		if ( this.propertyName == name
			&& this.onRowAdded != null){
			this.onRowAdded(this.control,this.dataObject,value);
		}
	},
	
	_fireRowDeleted: function(name,value){// private
		if (this.propertyName == name
			&& this.onRowDeleted != null){
			this.onRowDeleted(this.control,this.dataObject,value);
		}
	}
});