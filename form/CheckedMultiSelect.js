dojo.provide("dojox.form.CheckedMultiSelect");

dojo.require("dijit.form.CheckBox");
dojo.require("dojox.form._FormSelectWidget");

dojo.declare("dojox.form._CheckedMultiSelectItem", 
	[dijit._Widget, dijit._Templated],
	{
	// summary:
	//		The individual items for a CheckedMultiSelect

	widgetsInTemplate: true,
	templatePath: dojo.moduleUrl("dojox.form", "resources/_CheckedMultiSelectItem.html"),

	baseClass: "dojoxMultiSelectItem",

	// option: dojox.form.__SelectOption
	//		The option that is associated with this item
	option: null,
	parent: null,
	
	// disabled: boolean
	//		Whether or not this widget is disabled
	disabled: false,

	postCreate: function(){
		// summary:
		//		Set innerHTML here - since the template gets messed up sometimes
		//		with rich text
		this.inherited(arguments);
		this.labelNode.innerHTML = this.option.label;
	},

	_changeBox: function(){
		// summary:
		//		Called to force the select to match the state of the check box
		//		(only on click of the checkbox)
		this.option.selected = this.checkBox.getValue() && true;

		// fire the parent's change
		this.parent._onChange();
		
		// refocus the parent
		this.parent.focus();
	},

	_onMouse: function(e){
		// summary:
		//		Sets the hover state depending on mouse state (passes through
		//		to the check box)
		this.checkBox._onMouse(e);
	},
	
	_onClick: function(e){
		// summary:
		//		Sets the click state (passes through to the check box)
		this.checkBox._onClick(e);
	},
	
	_updateBox: function(){
		// summary:
		//		Called to force the box to match the state of the select
		this.checkBox.setValue(this.option.selected);
	},
	
	setAttribute: function(attr, value){
		// summary:
		//		Disables (or enables) all the children as well
		this.inherited(arguments);
		switch(attr){
			case "disabled":
				this.checkBox.setAttribute(attr, value);
				break;
			default:
				break;
		}
	}
});

dojo.declare("dojox.form.CheckedMultiSelect", dojox.form._FormSelectWidget, {
	// summary:
	//		Extends the core dijit MultiSelect to provide a "checkbox" selector

	templateString: "",
	templatePath: dojo.moduleUrl("dojox.form", "resources/CheckedMultiSelect.html"),

	baseClass: "dojoxMultiSelect",

	_multiValue: true, // for Form

	_mouseDown: function(e){
		// summary:
		//		Cancels the mousedown event to prevent others from stealing
		//		focus
		dojo.stopEvent(e);
	},
	
	_addOptionItem: function(/* dojox.form.__SelectOption */ option){
		this.wrapperDiv.appendChild(new dojox.form._CheckedMultiSelectItem({
			option: option,
			parent: this
		}).domNode);
	},
	
	_updateSelection: function(){
		this.inherited(arguments);
		dojo.forEach(this._getChildren(), function(c){ c._updateBox(); });
		this.value = this._getValueFromOpts();
	},
	
	_getChildren: function(){
		return dojo.map(this.wrapperDiv.childNodes, function(n){
			return dijit.byNode(n);
		});
	},

	addSelected: function(select){
		dojo.forEach(select.getSelected(), function(n){
			select.removeOption(n.value);
			this.addOption(n);
		}, this);
		select._onChange();
		this._onChange();
	},
	
	invertSelection: function(onChange){
		// summary: Invert the selection
		// onChange: Boolean
		//		If null, onChange is not fired.
		dojo.forEach(this.options, function(i){
			i.selected = !i.selected;
		});
		this._updateSelection();
		this._handleOnChange(this.value, onChange==true);
	},

	_onChange: function(/*Event*/ e){
		this._updateSelection();
		this._handleOnChange(this.value, true);
	},

	setAttribute: function(attr, value){
		// summary:
		//		Disable (or enable) all the children as well
		this.inherited(arguments);
		switch(attr){
			case "disabled":
				dojo.forEach(this._getChildren(), function(node){
					if(node && node.setAttribute){
						node.setAttribute(attr, value);
					}
				});
				break;
			default:
				break;
		}
	}
});
