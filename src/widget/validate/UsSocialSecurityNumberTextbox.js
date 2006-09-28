dojo.provide("dojo.widget.validate.UsSocialSecurityNumberTextbox");

dojo.require("dojo.widget.validate.ValidationTextbox");
dojo.require("dojo.validate.us");

/*
  ****** UsSocialSecurityNumberTextbox ******

  A subclass of ValidationTextbox.
  Over-rides isValid to test if input is a US Social Security Number.
*/
dojo.widget.defineWidget(
	"dojo.widget.validate.UsSocialSecurityNumberTextbox",
	dojo.widget.validate.ValidationTextbox,
	{
		isValid: function() { 
			return dojo.validate.us.isSocialSecurityNumber(this.textbox.value);
		}
	}
);
