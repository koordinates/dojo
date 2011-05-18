define([
				"dojo",
				"dijit",
				"dijit/form/ToggleButton",
				"dojo/text!./resources/TriStateCheckBox.html"], function(dojo, dijit) {
				//	module:
				//		dojox/form/TriStateCheckBox
				//	summary:
				//		Checkbox with three states
				//

dojo.declare("dojox.form.TriStateCheckBox",
	dijit.form.ToggleButton,
	{
		// summary:
		//		Checkbox with three states

		templateString: dojo.cache("dojox.form", "resources/TriStateCheckBox.html"),

		baseClass: "dojoxTriStateCheckBox",

		// type: [private] String
		//		type attribute on <input> node.
		//		Overrides `dijit.form.Button.type`.  Users should not change this value.
		type: "checkbox",
		
		/*=====
		// states: Array
		//		States of TriStateCheckBox.
		//		The value of This.checked should be one of these three states.
		states: [false, true, "mixed"],
		=====*/
		
		/*=====
		// _stateLabels: Object
		//		These characters are used to replace the image to show 
		//		current state of TriStateCheckBox in high contrast mode.
		_stateLabels: {
				"False": '&#63219',
				"True": '&#8730;',
				"Mixed": '&#8801'
		},
		=====*/
		
		/*=====
		// stateValues: Object
		//		The values of the TriStateCheckBox in corresponding states. 
		stateValues:	{
				"False": "off",
				"True": "on", 
				"Mixed": "mixed"
		},
		=====*/
		
		// _currentState: Integer
		//		The current state of the TriStateCheckBox
		_currentState: 0,

		// _stateType: String
		//		The current state type of the TriStateCheckBox
		//		Could be "False", "True" or "Mixed"
		_stateType: "False",

		// readOnly: Boolean
		//		Should this widget respond to user input?
		//		In markup, this is specified as "readOnly".
		//		Similar to disabled except readOnly form values are submitted.
		readOnly: false,

		constructor: function(){
			// summary:
			//		Runs on widget initialization to setup arrays etc.
			// tags:
			//		private
			this.states = [false, true, "mixed"];
			this._stateLabels = {
				"False": '&#63219',
				"True": '&#8730;',
				"Mixed": '&#8801'
			};
			this.stateValues = {
				"False": "off",
				"True": "on", 
				"Mixed": "mixed"
			};
		},
		
		_setCheckedAttr: function(/*String|Boolean*/ checked, /*Boolean?*/ priorityChange){
			// summary:
			//		Handler for checked = attribute to constructor, and also calls to
			//		set('checked', val).
			// checked:
			//		true, false or 'mixed'
			// description:
			//		Controls the state of the TriStateCheckBox. Set this.checked, 
			//		this._currentState, value attribute of the <input type=checkbox>
			//		according to the value of 'checked'.
			this._set("checked", checked);
			this._currentState = dojo.indexOf(this.states, checked);
			this._stateType = this._getStateType(checked);
			dojo.attr(this.focusNode || this.domNode, "checked", checked);
			dojo.attr(this.focusNode, "value", this.stateValues[this._stateType]);
			dijit.setWaiState(this.focusNode || this.domNode, "checked", checked);
			this._handleOnChange(checked, priorityChange);
		},

		setChecked: function(/*String|Boolean*/ checked){
			// summary:
			//		Deprecated.  Use set('checked', true/false) instead.
			dojo.deprecated("setChecked("+checked+") is deprecated. Use set('checked',"+checked+") instead.", "", "2.0");
			this.set('checked', checked);
		},
		
		_setReadOnlyAttr: function(/*Boolean*/ value){
			this._set("readOnly", value);
			dojo.attr(this.focusNode, "readOnly", value);
			dijit.setWaiState(this.focusNode, "readonly", value);
		},

		_setValueAttr: function(/*String|Boolean*/ newValue, /*Boolean*/ priorityChange){
			// summary:
			//		Handler for value = attribute to constructor, and also calls to
			//		set('value', val).
			// description:
			//		During initialization, just saves as attribute to the <input type=checkbox>.
			//
			//		After initialization,
			//		when passed a boolean or the string 'mixed', controls the state of the
			//		TriStateCheckBox.
			//		If passed a string except 'mixed', changes the value attribute of the
			//		TriStateCheckBox. Sets the state of the TriStateCheckBox to checked.
			if(typeof newValue == "string" && (dojo.indexOf(this.states, newValue) < 0)){
				if(newValue == ""){
					newValue = "on";
				}
				this.stateValues["True"] = newValue;
				newValue = true;
			}
			if(this._created){
				this._currentState = dojo.indexOf(this.states, newValue);
				this.set('checked', newValue, priorityChange);
				dojo.attr(this.focusNode, "value", this.stateValues[this._stateType]);
			}
		},

		_setValuesAttr: function(/*Array*/ newValues){
			// summary:
			//		Handler for values = attribute to constructor, and also calls to
			//		set('values', val).
			// newValues:
			//		If the length of newValues is 1, it will replace the value of
			//		the TriStateCheckBox in true state. Otherwise, the values of
			//		the TriStateCheckBox in true state and 'mixed' state will be
			//		replaced by the first two values in newValues.
			// description:
			//		Change the value of the TriStateCheckBox in 'mixed' and true states.
			this.stateValues["True"] = newValues[0] ? newValues[0] : this.stateValues["True"];
			this.stateValues["Mixed"] = newValues[1] ? newValues[1] : this.stateValues["False"];
		},

		_getValueAttr: function(){
			// summary:
			//		Hook so get('value') works.
			// description:
			//		Returns value according to current state of the TriStateCheckBox.
			return this.stateValues[this._stateType];
		},

		startup: function(){
			this.set("checked", this.params.checked || this.states[this._currentState]);
			dojo.attr(this.stateLabelNode, 'innerHTML', this._stateLabels[this._stateType]);
			this.inherited(arguments);
		},

		 _fillContent: function(/*DomNode*/ source){
			// Override Button::_fillContent() since it doesn't make sense for CheckBox,
			// since CheckBox doesn't even have a container
		},

		reset: function(){
			this._hasBeenBlurred = false;
			this.stateValues = {
				"False" : "off",
				"True" : "on",
				"Mixed" : "mixed"
			};
			this.set('checked', this.params.checked || this.states[0]);
		},

		_onFocus: function(){
			if(this.id){
				dojo.query("label[for='"+this.id+"']").addClass("dijitFocusedLabel");
			}
			this.inherited(arguments);
		},
		
		_onBlur: function(){
			if(this.id){
				dojo.query("label[for='"+this.id+"']").removeClass("dijitFocusedLabel");
			}
			this.inherited(arguments);
		},

		_onClick: function(/*Event*/ e){
			// summary:
			//		Internal function to handle click actions - need to check
			//		readOnly and disabled
			if(this.readOnly || this.disabled){
				dojo.stopEvent(e);
				return false;
			}
			if(this._currentState >= this.states.length - 1){
				this._currentState = 0;
			}else{
				this._currentState++;
			}
			this.set("checked", this.states[this._currentState]);
			dojo.attr(this.stateLabelNode, 'innerHTML', this._stateLabels[this._stateType]);
			return this.onClick(e); // user click actions
		},
		
		_getStateType: function(/*String|Boolean*/ state){
			//	summary:
			//		Internal function to return the type of a certain state
			//		false: False
			//		true: True
			//		"mixed": Mixed
			return state ? (state == "mixed" ? "Mixed" : "True") : "False";
		}
	}
);

return dojox.form.TriStateCheckBox;
});
