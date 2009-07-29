dojo.provide("dojox.form.MultiComboBox");
dojo.experimental("dojox.form.MultiComboBox"); 
dojo.required("dijit.form.ComboBox");
dojo.required("dijit.form.ValidationTextBox");

dojo.declare("dojox.form.MultiComboBox",
	[dijit.form.ValidationTextBox, dijit.form.ComboBoxMixin],{
	//
	// summary: A ComboBox that accpets multiple inputs on a single line?
	//
	// delimiter: String
	// 	The character to use to separate items in the ComboBox input
	delimiter: ",",
	_previousMatches: false,

	_setValueAttr: function(value){
		if (this.delimiter && value.length){
			value = this._addPreviousMatches(value+this.delimiter+" ");
		}
		this.inherited.call(this, value);
	},

	_addPreviousMatches: function(/* String */text){
		if(this._previousMatches){
			if(!text.match(new RegExp("^"+this._previousMatches))){
				text = this._previousMatches+text;
			}
			text = this._cleanupDelimiters(text);
		}
		return text; // String
	},

	_cleanupDelimiters: function(/* String */text){
		if(this.delimiter){
			text = text.replace(new RegExp("  +"), " ");
			text = text.replace(new RegExp("^ *"+this.delimiter+"* *"), "");
			text = text.replace(new RegExp(this.delimiter+" *"+this.delimiter), this.delimiter);
		}
		return text;
	},
			
	_autoCompleteText: function(/* String */text){

		// NOTE: Previously passed arguments object to inherited method (?)

		this.inherited.call(this, this._addPreviousMatches(text));
	},

	_startSearch: function(/* String */text){
		text = this._cleanupDelimiters(text);
		var re = new RegExp("^.*"+this.delimiter+" *");
		
		if((this._previousMatches = text.match(re))){
			text = text.replace(re, "");
		}
		this.inherited.call(this, text);
	}		
});
