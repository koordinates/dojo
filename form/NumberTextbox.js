dojo.provide("dijit.form.NumberTextbox");

dojo.require("dijit.form.ValidationTextbox");
dojo.require("dojo.number");

dojo.declare(
	"dijit.form.NumberTextbox",
	dijit.form.RangeBoundTextbox,
	{
		// summary:
		//		A validating, serializable, range-bound text box.
		// constraints object: min, max, places

		regExpGen: dojo.number.regexp,
	
		parse: dojo.number.parse
	}
);
