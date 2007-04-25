dojo.provide("dijit.form.NumberTextbox");

dojo.require("dijit.form.ValidationTextbox");
dojo.require("dojo.number");

dojo.declare(
	"dijit.form.NumberTextboxMixin",
	null,
	{
		// summary:
		//		A mixin for all number textboxes
		regExpGen: dojo.number.regexp,
		format: function(val, constraints){
			if (isNaN(val)){ return ""; }
			else { return dojo.number.format(val, constraints); }
		},
		parse: dojo.number.parse,
		value: 0
	}
);

dojo.declare(
	"dijit.form.NumberTextbox",
	[dijit.form.RangeBoundTextbox,dijit.form.NumberTextboxMixin],
	{
		// summary:
		//		A validating, serializable, range-bound text box.
		// constraints object: min, max, places
	}
);
