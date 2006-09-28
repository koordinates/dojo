dojo.provide("dojo.widget.validate.UsStateTextbox");

dojo.require("dojo.widget.validate.ValidationTextbox");
dojo.require("dojo.validate.us");

/*
  ****** UsStateTextbox ******

  A subclass of ValidationTextbox.
  Over-rides isValid to test if input is a US state abbr.

  @attr allowTerritories  Allow Guam, Puerto Rico, etc.  Default is true.
  @attr allowMilitary     Allow military 'states', e.g. Armed Forces Europe (AE). Default is true.
*/
dojo.widget.defineWidget(
	"dojo.widget.validate.UsStateTextbox",
	dojo.widget.validate.ValidationTextbox,
	{
		mixInProperties: function(localProperties, frag) {
			// Initialize properties in super-class.
			dojo.widget.validate.UsStateTextbox.superclass.mixInProperties.apply(this, arguments);

			// Get properties from markup attributes, and assign to flags object.
			if ( localProperties.allowterritories ) { 
				this.flags.allowTerritories = ( localProperties.allowterritories == "true" );
			}
			if ( localProperties.allowmilitary ) { 
				this.flags.allowMilitary = ( localProperties.allowmilitary == "true" );
			}
		},

		isValid: function() { 
			return dojo.validate.us.isState(this.textbox.value, this.flags);
		}
	}
);
