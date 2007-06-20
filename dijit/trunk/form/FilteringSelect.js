dojo.provide("dijit.form.FilteringSelect");

dojo.require("dijit.form.ComboBox");

dojo.declare(
	"dijit.form.FilteringSelect",
	[dijit.form.MappedTextbox, dijit.form.ComboBoxMixin],
	{
		/*
		 * summary
		 *	Enhanced version of HTML's <select> tag.
		 *
		 *	Similar features:
		 *	  - There is a drop down list of possible values.
		 *    - You can only enter a value from the drop down list.  (You can't enter an arbitrary value.)
		 *    - The value submitted with the form is the hidden value (ex: CA),
		 *      not the displayed value a.k.a. label (ex: California)
		 *
		 *	Enhancements over plain HTML version:
		 *    - If you type in some text then it will filter down the list of possible values in the drop down list.
		 *    - List can be specified either as a static list or via a javascript function (that can get the list from a server)
		 */

		// searchAttr: String
		//		Searches pattern match against this field

		// labelAttr: String
		//		Optional.  The text that actually appears in the drop down.
		//		If not specified, the searchAttr text is used instead.
		labelAttr: "",

		// labelType: String
		//		"html" or "text"
		labelType: "text",

		_isvalid:true,

		isValid:function(){
			return this._isvalid;
		},

		_callbackSetLabel: function(/*Array*/ result){
			// summary
			//	Callback function that dynamically sets the label of the ComboBox

			if(!result.length){
				//#3268: do nothing on bad input
				//this._setValue("", "");
				//#3285: change CSS to indicate error
				this._isvalid=false;
				this.validate(this._hasFocus);
			}else{
				this._setValueFromItem(result[0]);
			}
		},

		_openResultList: function(/*Object*/ results){
			// #3285: tap into search callback to see if user's query resembles a match
			this._isvalid=results.length!=0;
			this.validate(true);
			dijit.form.ComboBoxMixin.prototype._openResultList.apply(this, arguments);
		},

		getValue:function(){
			// don't get the textbox value but rather the previously set hidden value
			return this.valueNode.value;
		},

		_getValueField:function(){
			// used for option tag selects
			return "value";
		},

		_setValue:function(/*String*/ value, /*String*/ displayedValue){
			this.valueNode.value = value;
			dijit.form.FilteringSelect.superclass.setValue.apply(this, arguments);
		},

		setValue: function(/*String*/ value){
			// summary
			//	Sets the value of the select.
			//	Also sets the label to the corresponding value by reverse lookup.

			//#3347: getItemByIdentity if no keyAttr specified
			var item=this.store.getItemByIdentity(value);
			if(item){
				if(this.store.isItemLoaded(item)){
					this._callbackSetLabel([item]);
				}else{
					this.store.loadItem({item:item, onItem: this._callbackSetLabel});
				}
			}else{
				this._isvalid=false;
				// prevent errors from Tooltip not being created yet
				this.validate(false);
			}
		},

		_setValueFromItem: function(/*item*/ item){
			// summary
			//	Set the displayed valued in the input box, based on a selected item.
			//	Users shouldn't call this function; they should be calling setDisplayedValue() instead
			this._isvalid=true;
			this._setValue(this.store.getIdentity(item), this.labelFunc(item, this.store));
		},

		labelFunc: function(/*item*/ item, /*dojo.data.store*/ store){
			// summary: Event handler called when the label changes
			// returns the label that the ComboBox should display
			return store.getValue(item, this.searchAttr);
		},

		_createOption:function(/*Object*/ tr){
			// summary: creates an option to appear on the popup menu

			var td=dijit.form.ComboBoxMixin.prototype._createOption.apply(this, arguments);
			// #3129
			if(this.labelAttr){
				if(this.labelType=="html"){
					td.innerHTML=this.store.getValue(tr, this.labelAttr);
				}else{
					// prevent parsing of HTML
					var textnode=document.createTextNode(this.store.getValue(tr, this.labelAttr));
					td.innerHTML="";
					td.appendChild(textnode);
				}
			}
			return td;
		},

		onkeyup: function(/*Event*/ evt){
			// summary: internal function
			// FilteringSelect needs to wait for the complete label before committing to a reverse lookup
			//this.setDisplayedValue(this.textbox.value);
		},

		_assignHiddenValue:function(/*Object*/ keyValArr, /*DomNode*/ option){
			// summary:
			// 	Overrides ComboBox._assignHiddenValue for creating a data store from an options list.
			// 	Takes the <option value="CA"> and makes the CA the hidden value of the item.
			keyValArr["value"]=option.value;
		},

		_doSelect: function(/*Event*/ tgt){
			// summary:
			//	ComboBox's menu callback function
			//	FilteringSelect overrides this to set both the visible and hidden value from the information stored in the menu

			this._setValueFromItem(tgt.item);
		},

		setDisplayedValue:function(/*String*/ label){
			// summary:
			//	Set textbox to display label
			//	Also performs reverse lookup to set the hidden value
			//	Used in InlineEditBox
			var query=[];
			query[this.searchAttr]=label;
			// if the label is not valid, the callback will never set it,
			// so the last valid value will get the warning textbox
			// set the textbox value now so that the impending warning will make sense to the user
			this.textbox.value=label;
			if(this.store){
				this.store.fetch({query:query, queryOptions:{ignoreCase:this.ignoreCase}, onComplete: dojo.hitch(this, this._callbackSetLabel)});
			}
		}
	}
);
