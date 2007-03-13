dojo.provide("dijit.form.Textbox");

dojo.require("dojo.lang.common");
dojo.require("dojo.string.extras");
dojo.require("dojo.i18n.common");

dojo.require("dijit.base.FormElement");
dojo.require("dijit.base.TemplatedWidget");

dojo.declare(
	"dijit.form.Textbox",
	[dijit.base.FormElement, dijit.base.TemplatedWidget],
	{
		// summary:
		//		A generic textbox field.
		//		Serves as a base class to derive more specialized functionality in subclasses.

		//	trim: Boolean
		//		Removes leading and trailing whitespace if true.  Default is false.
		trim: false,

		//	uppercase: Boolean
		//		Converts all characters to uppercase if true.  Default is false.
		uppercase: false,

		//	lowercase: Boolean
		//		Converts all characters to lowercase if true.  Default is false.
		lowercase: false,

		//	ucFirst: Boolean
		//		Converts the first character of each word to uppercase if true.
		ucFirst: false,

		// size: String
		//              Basic input tag size declaration.
		size: "",

		// maxlength: String
		//              Basic input tag maxlength declaration.
		maxlength: "",

		//	digit: Boolean
		//		Removes all characters that are not digits if true.  Default is false.
		digit: false,
		
		templatePath: dojo.uri.moduleUri("dijit.form", "templates/Textbox.html"),
	
		getTextValue: function(){
		        return this.filter(this.textbox.value);
		},

		getValue: function(){
			return this.parse(this.getTextValue(), this.constraints);
		},

		setTextValue: function(value){
			this.textbox.value = this.filter(value);
		},

		setValue: function(value){
			this.setTextValue(this.format(value, this.constraints));
			dijit.form.Textbox.superclass.setValue.call(this,value);
		},

		format: function(/* String */ value, /* Object */ constraints){
			// summary: Replacable function to convert a value to a properly formatted string
			return value;
		},

		parse: function(/* String */ value, /* Object */ constraints){
			// summary: Replacable function to convert a formatted string to a value
			return value;
		},

		postCreate: function() {
			dijit.form.Textbox.superclass.postCreate.apply(this);
			// get the node for which the background color will be updated
			if (typeof this.nodeWithBorder != "object"){
				this.nodeWithBorder = this.textbox;
			}
			// assign value programatically in case it has a quote in it
			this.setTextValue(this.value);
		},

		filter: function(val) {
			// summary: Apply various filters to textbox value
			if (this.trim) {
				val = val.replace(/(^\s*|\s*$)/g, "");
			} 
			if (this.uppercase) {
				val = val.toUpperCase();
			} 
			if (this.lowercase) {
				val = val.toLowerCase();
			} 
			if (this.ucFirst) {
				val = dojo.string.capitalize(val);
			} 
			if (this.digit) {
				val = val.replace(/\D/g, "");
			} 
			return val;
		},
	
		focus: function(){
			// summary: if the widget wants focus, then focus the textbox
			this.textbox.focus();
		},

		// event handlers, you can over-ride these in your own subclasses
		onfocus: function(){ 
			dojo.html.addClass(this.nodeWithBorder,"dojoInputFieldFocused"); 
		},
		onblur: function(){ 
			dojo.html.removeClass(this.nodeWithBorder,"dojoInputFieldFocused"); 
			this.setValue(this.getValue()); 
		}
	}
);
