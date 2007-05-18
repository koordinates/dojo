dojo.provide("dojox.wireml.Data");
dojo.provide("dojox.wireml.DataProperty");

dojo.require("dijit.base.Widget");
dojo.require("dijit.base.Container");
dojo.require("dojox.wireml.util");

dojo.declare("dojox.wireml.Data",
	[dijit.base.Widget, dijit.base.Container], {
	//	summary:
	//		A widget for a data object
	//	description:
	//		This widget represents an object with '_properties' property.
	//		If child 'DataProperty' widgets exist, they are used to initialize
	//		propertiy values of '_properties' object.

	startup: function(){
		//	summary:
		//		Call _initializeProperties()
		//	description:
		//		See _initializeProperties().
		this._initializeProperties();
	},

	_initializeProperties: function(/*Boolean*/reset){
		//	summary:
		//		Initialize a data object
		//	description:
		//		If this widget has child DataProperty widgets, their getValue()
		//		methods are called and set the return value to a property
		//		specified by 'name' attribute of the child widgets.
		//	reset:
		//		A boolean to reset current properties
		if(!this._properties || reset){
			this._properties = {};
		}
		var children = this.getChildren();
		for(var i in children){
			var child = children[i];
			if((child instanceof dojox.wireml.DataProperty) && child.name){
				this.setPropertyValue(child.name, child.getValue());
			}
		}
	},

	getPropertyValue: function(/*String*/property){
		//	summary:
		//		Return a property value
		//	description:
		//		This method returns the value of a property, specified with
		//		'property' argument, in '_properties' object.
		//	property:
		//		A property name
		//	returns:
		//		A property value
		return this._properties[property]; //anything
	},

	setPropertyValue: function(/*String*/property, /*anything*/value){
		//	summary:
		//		Store a property value
		//	description:
		//		This method stores 'value' as a property, specified with
		//		'property' argument, in '_properties' object.
		//	property:
		//		A property name
		//	value:
		//		A property value
		this._properties[property] = value;
	}
});

dojo.declare("dojox.wireml.DataProperty",
	[dijit.base.Widget, dijit.base.Container], {
	//	summary:
	//		A widget to define a data property
	//	description:
	//		Attributes of this widget are used to add a property to the parent
	//		Data widget.
	//		'type' attribute specifies one of "string", "number", "boolean",
	//		"array", "object" and "element" (DOM Element)
	//		(default to "string").
	//		If 'type' is "array" or "object", child DataProperty widgets are
	//		used to initialize the array elements or the object properties.
	//	name:
	//		A property name
	//	type:
	//		A property type name
	//	value:
	//		A property value
	name: "",
	type: "",
	value: "",

	getValue: function(){
		//	summary:
		//		Returns a property value
		//	description:
		//		If 'type' is specified, 'value' attribute is converted to
		//		the specified type and returned.
		//		Otherwise, 'value' attribute is returned as is.
		//	returns:
		//		A property value
		var value = this.value;
		if(this.type){
			if(this.type == "number"){
				value = parseInt(value);
			}else if(this.type == "boolean"){
				value = (value == "true");
			}else if(this.type == "array"){
				value = [];
				var children = this.getChildren();
				for(var i in children){
					var child = children[i];
					if(child instanceof dojox.wireml.DataProperty){
						value.push(child.getValue());
					}
				}
			}else if(this.type == "object"){
				value = {};
				var children = this.getChildren();
				for(var i in children){
					var child = children[i];
					if((child instanceof dojox.wireml.DataProperty) && child.name){
						value[child.name] = child.getValue();
					}
				}
			}else if(this.type == "element"){
				value = new dojox.wireml.XmlElement(value);
				var children = this.getChildren();
				for(var i in children){
					var child = children[i];
					if((child instanceof dojox.wireml.DataProperty) && child.name){
						value.setPropertyValue(child.name, child.getValue());
					}
				}
			}
		}
		return value; //anything
	}
});
