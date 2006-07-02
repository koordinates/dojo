dojo.provide("dojo.data.xml.XMLPropertyBinder");
dojo.require("dojo.event.*");
dojo.require("dojo.lang.declare");

dojo.declare("dojo.data.xml.XMLPropertyBinder",null,{
/* summary:
	A property binder needs several modes:
	1) Given a dataset, and an indentifier into that dataset, modify a control property when a value in that dataset changes.
	2) Given a dataset, and an indentifier into that dataset, update dataset when some event occurs
 */
	initializer: function(dataObject, path, control, controlproperty, controlEvent){
		path = path.split("|");	//split into an xpath/dataset index (row)
		this.dataObject = dataObject; 
		this.propertyName = path[0];
		this.control = control;	
		this.controlProperty = controlproperty;	
		this.controlEvent = controlEvent;
		this.row = -1;	
		if (path.length > 1) {
			this.row= path[1];
		}
		//set the initial value
		this.pushValue();
		this.setupBindings();	
	},

	setupBindings: function() {
		dojo.event.topic.subscribe("xml/valueChanged", this, "processValueChanged");
		if (this.controlEvent) {
			dojo.event.connect(this.control, this.controlEvent, this, "pullValue");
		}
	},
	
	removeBindings: function() {
		if (this.controlEvent) {
			dojo.event.disconnect(this.control, this.controlEvent, this, "pullValue");
		}
	},
	
	processValueChanged: function(message) {
		if (this.row > -1) {
			if (this.dataObject.getId(this.row) == message.id) {
				this.pushValue();
			}
		} else {
			var length = this.dataObject.getSize();
			for (var i = 0; i < length; i++) {
				if (this.dataObject.getId(i) == message.id) {
					this.pushValue();
					break;
				}
			}
		}
	},
	
	pushValue: function() {
		if (this.controlEvent) {
		}else{
			var value = this.dataObject.getValues(this.propertyName);
			if (dojo.lang.isArray(value) && this.row > -1){
				value = value[this.row];
			}
			this.control[this.controlProperty] = value;
		}
	},
	
	pullValue: function() {
		var value = this.control[this.controlProperty];
		var index = this.row;
		if (index > -1){
			this.dataObject.setValue(this.propertyName, index, value);
		}else{
			var length = this.dataObject.getSize();
			for (var i = 0; i < length; i++){
				this.dataObject.setValue(this.propertyName, i, value);
			}
		}
	}

});

