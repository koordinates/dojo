dojo.provide("dijit.form.NumberSpinner-face");
dojo.required("dijit.form.NumberSpinner");

dojo.declare("dijit.form.NumberSpinner",
	[dijit.form._Spinner, dijit.form.NumberTextBoxMixin],
	{
	// summary:
	//		Extends NumberTextBox to add up/down arrows and pageup/pagedown for incremental change to the value
	//
	// description:
	//		A `dijit.form.NumberTextBox` extension to provide keyboard accessible value selection
	//		as well as icons for spinning direction. When using the keyboard, the typematic rules
	//		apply, meaning holding the key will gradually increarease or decrease the value and
	// 		accelerate.
	//		
	// example:
	//	| new dijit.form.NumberSpinner({ constraints:{ max:300, min:100 }}, "someInput");

	// Override required=false from ValidationTextBox
	required: true,

	adjust: function(/* Object */val, /* Number*/delta){
		// summary:
		//		Change Number val by the given amount
		// tags:
		//		protected

		var tc = this.constraints, 
			v = isNaN(val), 
			gotMax = !isNaN(tc.max), 
			gotMin = !isNaN(tc.min)
		;
		if(v && delta){ // blank or invalid value and they want to spin, so create defaults
			val = (delta > 0) ? 
				gotMin ? tc.min : gotMax ? tc.max : 0 :
				gotMax ? this.constraints.max : gotMin ? tc.min : 0
			;
		}
		var newval = val + delta;
		if(v || isNaN(newval)){ return val; }
		if(gotMax && (newval > tc.max)){
			newval = tc.max;
		}
		if(gotMin && (newval < tc.min)){
			newval = tc.min;
		}
		return newval;
	},
	
	_onKeyPress: function(e){
		if((e.charOrCode == dojo.keys.HOME || e.charOrCode == dojo.keys.END) && !e.ctrlKey && !e.altKey){
			var value = this.constraints[(e.charOrCode == dojo.keys.HOME ? "min" : "max")];
			if(value){
				this._setValueAttr(value,true);
			}
			// eat home or end key whether we change the value or not
			dojo.stopEvent(e);
		}
	}
	
});
