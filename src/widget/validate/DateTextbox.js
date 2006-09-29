dojo.provide("dojo.widget.validate.DateTextbox");

dojo.require("dojo.widget.validate.ValidationTextbox");
dojo.require("dojo.validate.datetime");

dojo.widget.defineWidget(
	"dojo.widget.validate.DateTextbox",
	dojo.widget.validate.ValidationTextbox,
	{
	// summary: A TextBox which tests for a valid date
	// format: Style as described in v0.3 in dojo.validate.  Default is  "MM/DD/YYYY".

		mixInProperties: function(/*Object*/localProperties){
			// summary: see dojo.widget.Widget

			// First initialize properties in super-class.
			dojo.widget.validate.DateTextbox.superclass.mixInProperties.apply(this, arguments);
	
			// Get properties from markup attributes, and assign to flags object.
			if(localProperties.format){ 
				this.flags.format = localProperties.format;
			}
		},

		isValid: function(){ 
			// summary: see dojo.widget.validate.ValidationTextbox
			return dojo.validate.isValidDate(this.textbox.value, this.flags.format);
		}
	}
);

dojo.widget.defineWidget(
	"dojo.widget.validate.TimeTextbox",
	dojo.widget.validate.ValidationTextbox,
	{
	// summary: A TextBox which tests for a valid time
	// format: Described in v0.3 in dojo.validate.  Default is  "h:mm:ss t".
	// amSymbol: The symbol used for AM.  Default is "AM" or "am".
	// pmSymbol: The symbol used for PM.  Default is "PM" or "pm".

		mixInProperties: function(/*Object*/localProperties){
			// summary: see dojo.widget.Widget

			// First initialize properties in super-class.
			dojo.widget.validate.TimeTextbox.superclass.mixInProperties.apply(this, arguments);
	
			// Get properties from markup attributes, and assign to flags object.
			if(localProperties.format){ 
				this.flags.format = localProperties.format;
			}
			if(localProperties.amsymbol){ 
				this.flags.amSymbol = localProperties.amsymbol;
			}
			if(localProperties.pmsymbol){ 
				this.flags.pmSymbol = localProperties.pmsymbol;
			}
		},

		isValid: function(){ 
			// summary: see dojo.widget.validate.ValidationTextbox
			return dojo.validate.isValidTime(this.textbox.value, this.flags);
		}
	}
);
