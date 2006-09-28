dojo.provide("dojo.widget.validate.UsPhoneNumberTextbox");

dojo.require("dojo.widget.validate.ValidationTextbox");
dojo.require("dojo.validate.us");

/*
  ****** UsPhoneNumberTextbox ******

  A subclass of ValidationTextbox.
  Over-rides isValid to test if input is a 10-digit US phone number, an extension is optional.
*/
dojo.widget.defineWidget(
	"dojo.widget.validate.UsPhoneNumberTextbox",
	dojo.widget.validate.ValidationTextbox,
	{
		isValid: function() { 
			return dojo.validate.us.isPhoneNumber(this.textbox.value);
		}
	}
);
