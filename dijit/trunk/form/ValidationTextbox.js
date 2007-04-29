dojo.provide("dijit.form.ValidationTextbox");

dojo.require("dojo.i18n");
dojo.require("dijit.util.wai");

dojo.require("dijit.form.Textbox");
dojo.require("dijit.Tooltip");

dojo.requireLocalization("dijit.form", "validate");

dojo.declare(
	"dijit.form.ValidationTextbox",
	dijit.form.Textbox,
	{
		// summary:
		//		A subclass of Textbox.
		//		Over-ride isValid in subclasses to perform specific kinds of validation.

		// default values for new subclass properties
		// required: Boolean
		//		Can be true or false, default is false.
		required: false,
		// promptMessage: String
		//		Hint string
		promptMessage: "",
		// invalidMessage: String
		// 		The message to display if value is invalid.
		invalidMessage: "",
		// listenOnKeyPress: Boolean
		//		Updates messages on each key press.  Default is true.
		listenOnKeyPress: true,
		// constraints: Object
		//		user-defined object needed to pass parameters to the validator functions
		constraints: {},
		// regExp: String
		//		regular expression string used to validate the input
		//		Do not specify both regExp and regExpGen
		regExp: ".*",
		// regExpGen: Function
		//		user replaceable function used to generate regExp when dependent on constraints
		//		Do not specify both regExp and regExpGen
		regExpGen: function(constraints){ return this.regExp; },
	
		setValue: function(value){
			dijit.form.ValidationTextbox.superclass.setValue.call(this, value);
			this.validate(false);
		},
	
		validator: function(value,constraints){
			// summary: user replaceable function used to validate the text input against the regular expression.
			return (new RegExp("^(" + this.regExpGen(constraints) + ")$")).test(value);
		},

		isValid: function(/* Boolean*/ isFocused){
			// summary: Need to over-ride with your own validation code in subclasses
			return this.validator(this.textbox.value, this.constraints);
		},
	
		isEmpty: function() {
			// summary: Checks for whitespace
			return /^\s*$/.test(this.textbox.value); // Boolean
		},

		isMissing: function(/* Boolean*/ isFocused){
			// summary: Checks to see if value is required and is whitespace
			return this.required && this.isEmpty(); // Boolean
		},
	
		getErrorMessage: function(/* Boolean*/ isFocused){
			// summary: return an error message to show if appropriate
			return this.invalidMessage;
		},

		getPromptMessage: function(/* Boolean*/ isFocused){
			// summary: return a hint to show if appropriate
			return this.promptMessage;
		},

		validate: function(/* Boolean*/ isFocused){
			// summary:
			//		Called by oninit, onblur, and onkeypress.
			// description:
			//		Show missing or invalid messages if appropriate, and highlight textbox field.
			
			var message;
			if (!this.isValid()){
				this.updateClass("Error");
				message = this.getErrorMessage(isFocused);
			}else{
				this.updateClass(this.isMissing() ? "Warning" : "Normal");
				message = this.getPromptMessage(isFocused);
			}
			this._displayMessage(isFocused ? message : "");
		},
		
		// currently displayed message
		_message: "",		

		_displayMessage: function(/*String*/ message){
			if(this._message == message){ return; }
			this._message = message;
			if(message){
				dijit.MasterTooltip.show(message, this.domNode);
			}else{
				dijit.MasterTooltip.hide();
			}
		},

		updateClass: function(className){
			// summary: used to ensure that only 1 validation class is set at a time
			var _this = this;
			dojo.forEach(["Normal", "Warning", "Error"], function(label){
				_this._removeClass(_this.nodeWithBorder, "dojoInputFieldValidation"+label); });
			this._addClass(this.nodeWithBorder, "dojoInputFieldValidation"+className);
		},
		
		onfocus: function(evt){
			dijit.form.ValidationTextbox.superclass.onfocus.apply(this, arguments);
			if (this.listenOnKeyPress){
				this.validate(true);
			}else{
				this.updateClass("Warning");
			}
		},
	
		onkeyup: function(evt){
			this.onfocus(evt);
		},

		postMixInProperties: function(){
			if(this.constraints == dijit.form.ValidationTextbox.prototype.constraints){
				this.constraints = {};
			}
			dijit.form.ValidationTextbox.superclass.postMixInProperties.apply(this, arguments);
			this.messages = dojo.i18n.getLocalization("dijit.form", "validate", this.lang);
			dojo.forEach(["invalidMessage", "missingMessage"], function(prop){
				if(!this[prop]){ this[prop] = this.messages[prop]; }
			}, this);
			var p = this.regExpGen(this.constraints);
			this.regExp = p;
			// make value a string for all types so that form reset works well
			this.value = (this.value == null || this.value == "") ? "" : this.format(this.value, this.constraints);
		},
	
		postCreate: function(){
			dijit.form.ValidationTextbox.superclass.postCreate.apply(this);

			// Attach isMissing and isValid methods to the textbox.
			// We may use them later in connection with a submit button widget.
			// TODO: this is unorthodox; it seems better to do it another way -- Bill
			this.textbox.isValid = function(){ this.isValid.call(this); };
			this.textbox.isMissing = function(){ this.isMissing.call(this); };
			// setting the value here is needed since value="" in the template causes "undefined" on form reset
			this.textbox.setAttribute("value", this.value);
			this.validate(false); 
		}
	}
);

dojo.declare(
	"dijit.form.SerializableTextbox",
	dijit.form.ValidationTextbox,
	{
		// summary:
		//		A subclass of ValidationTextbox.
		//		Provides a hidden input field and a serialize method to override

		serialize: function(val){
			// summary: user replaceable function used to convert the getValue() result to a String
			return val.toString();
		},

		toString: function(){
			// summary: display the widget as a printable string using the widget's value
			var val = this.getValue();
			return val ? ((typeof val == "string") ? val : this.serialize(val)) : "";
		},

		validate: function(){
			this.valueNode.value = this.toString();
			dijit.form.SerializableTextbox.superclass.validate.apply(this, arguments);
		},

		postCreate: function(){
			var textbox = this.textbox;
			var valueNode = (this.valueNode = document.createElement("input"));
			valueNode.setAttribute("type", textbox.type);
			valueNode.setAttribute("value", this.toString());
			dojo.style(valueNode, "display", "none");
			valueNode.name = this.textbox.name;
			textbox.name = "";

			dojo.place(valueNode, textbox, "after"); 

			dijit.form.SerializableTextbox.superclass.postCreate.apply(this, arguments);
		}
	}
);

dojo.declare(
	"dijit.form.RangeBoundTextbox",
	dijit.form.SerializableTextbox,
	{
		// summary:
		//		A subclass of SerializableTextbox.
		//		Tests for a value out-of-range
		/*===== contraints object:
		// min: Number
		//		Minimum signed value.  Default is -Infinity
		min: undefined,
		// max: Number
		//		Maximum signed value.  Default is +Infinity
		max: undefined,
		=====*/

		// rangeMessage: String
		//              The message to display if value is out-of-range
		rangeMessage: "",

		compare: function(val1, val2){
			// summary: compare 2 values
			return val1 - val2;
		},

		rangeCheck: function(/* Number */ primitive, /* Object */ constraints){
			// summary: user replaceable function used to validate the range of the numeric input value
			var isMin = (typeof constraints.min != "undefined");
			var isMax = (typeof constraints.max != "undefined");
			if (isMin || isMax){
				return (!isMin || this.compare(primitive,constraints.min) >= 0) &&
					(!isMax || this.compare(primitive,constraints.max) <= 0);
			}else{ return true; }
		},

		isInRange: function(/* Boolean*/ isFocused){
			// summary: Need to over-ride with your own validation code in subclasses
			return this.rangeCheck(this.getValue(), this.constraints);
		},
	
		getErrorMessage: function(/* Boolean*/ isFocused){
			var msg = dijit.form.RangeBoundTextbox.superclass.getErrorMessage.apply(this, arguments);
			if(typeof msg != "string"){
				if(this.isValid(false) && !this.isInRange(isFocused)){ return this.rangeMessage; }
			}else{ return msg; }
		},

		postMixInProperties: function(){
			dijit.form.RangeBoundTextbox.superclass.postMixInProperties.apply(this, arguments);
			if(!this.rangeMessage){ 
				this.messages = dojo.i18n.getLocalization("dijit.form", "validate", this.lang);
				this.rangeMessage = this.messages.rangeMessage;
			}
		},

		postCreate: function(){
			dijit.form.RangeBoundTextbox.superclass.postCreate.apply(this, arguments);
			if(typeof this.constraints.min != "undefined"){
				dijit.util.wai.setAttr(this.domNode, "waiState", "valuemin", this.constraints.min);
			}
			if(typeof this.constraints.max != "undefined"){
				dijit.util.wai.setAttr(this.domNode, "waiState", "valuemax", this.constraints.max);
			}
		}
	}
);
