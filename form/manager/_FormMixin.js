dojo.provide("dojox.form.manager._FormMixin");

dojo.declare("dojox.form.manager._FormMixin", null, {
	// summary:
	//		Form manager's mixin for form-specific functionality.
	// description:
	//		This mixin adds automated "onreset", and "onsubmit" event processing
	//		if we are based on a form node, defines onReset(), onSubmit(),
	//		reset(), submit(), and isValid() methods like dijit.form.Form.
	//		It should be used together with dojox.form.manager.Mixin.

	// HTML <FORM> attributes (if we are based on the form element)
	name: "",
	action: "",
	method: "",
	encType: "",
	"accept-charset": "",
	accept: "",
	target: "",

	startup: function(){
		this.isForm = this.domNode.tagName.toLowerCase() == "form";
		if(this.isForm){
			this.connect(this.domNode, "onreset", "_onReset");
			this.connect(this.domNode, "onsubmit", "_onSubmit");
		}
		this.inherited(arguments);
	},

	// form-specific functionality

	_onReset: function(e){
		// NOTE: this function is taken from dijit.formForm, it works only
		// for form-based managers.

		// create fake event so we can know if preventDefault() is called
		var faux = {
			returnValue: true, // the IE way
			preventDefault: function(){  // not IE
						this.returnValue = false;
					},
			stopPropagation: function(){}, currentTarget: e.currentTarget, target: e.target
		};
		// if return value is not exactly false, and haven't called preventDefault(), then reset
		if(!(this.onReset(faux) === false) && faux.returnValue){
			this.reset();
		}
		dojo.stopEvent(e);
		return false;
	},

	onReset: function(/*Event?*/e){
		//	summary:
		//		Callback when user resets the form. This method is intended
		//		to be over-ridden. When the `reset` method is called
		//		programmatically, the return value from `onReset` is used
		//		to compute whether or not resetting should proceed
		return true; // Boolean
	},

	reset: function(){
		// summary:
		//		Resets form values. Use reflect() to set any values.
		if(this.isForm){
			this.domNode.reset();
		}
		for(var name in this.formWidgets){
			var widget = this.formWidgets[name].widget;
			if(widget.reset){
				widget.reset();
			}
		}
		return this;
	},

	_onSubmit: function(e){
		// NOTE: this function is taken from dijit.formForm, it works only
		// for form-based managers.

		if(this.onSubmit(e) === false){ // only exactly false stops submit
			dojo.stopEvent(e);
		}
	},

	onSubmit: function(/*Event?*/e){
		//	summary:
		//		Callback when user submits the form. This method is
		//		intended to be over-ridden, but by default it checks and
		//		returns the validity of form elements. When the `submit`
		//		method is called programmatically, the return value from
		//		`onSubmit` is used to compute whether or not submission
		//		should proceed

		return this.isValid(); // Boolean
	},

	submit: function(){
		// summary:
		//		programmatically submit form if and only if the `onSubmit` returns true
		if(this.isForm){
			if(!(this.onSubmit() === false)){
				this.domNode.submit();
			}
		}
	},

 	isValid: function(){
 		// summary:
		//		Make sure that every widget that has a validator function returns true.
		for(var name in this.formWidgets){
			var widget = this.formWidgets[name].widget;
			if(!widget.attr("disabled") && widget.isValid && !widget.isValid()){
				return false;
			}
		}
		return true;
	}
});
