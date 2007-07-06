dojo.provide("dijit.form.InlineEditBox");

dojo.require("dojo.i18n");

dojo.require("dijit.form._FormWidget");
dojo.require("dijit._Container");
dojo.require("dijit.form.Button");

dojo.requireLocalization("dijit", "common");

dojo.declare(
	"dijit.form.InlineEditBox",
	[dijit.form._FormWidget, dijit._Container],
	// summary
	//		Wrapper widget to a text edit widget.
	//		The text is displayed on the page using normal user-styling.
	//		When clicked, the text is hidden, and the edit widget is
	//		visible, allowing the text to be updated.  Additionally,
	//		Save and Cancel button are displayed below the edit widget.
	//		When Save is clicked, the text is pulled from the edit
	//		widget and redisplayed and the edit widget is again hidden.
	//		Currently all textboxes that inherit from dijit.form.Textbox
	//		are supported edit widgets.
	//		An edit widget must support the following API to be used:
	//		String getTextValue() OR String getValue()
	//		void setTextValue(String) OR void setValue(String)
	//		void focus()
	//		It must also be able to initialize with style="display:none;" set.
{
	templatePath: dojo.moduleUrl("dijit.form", "templates/InlineEditBox.html"),

	// editing: Boolean
	//		Is the node currently in edit mode?
	editing: false,

	// autoSave: Boolean
	//				Changing the value automatically saves it, don't have to push save button
	autoSave: true,

	// buttonSave: String
	//              Save button label
	buttonSave: "",

	// buttonCancel: String
	//              Cancel button label
	buttonCancel: "",

	// renderHTML: Boolean
	//              should text render as HTML(true) or plain text(false)
	renderHTML: false,

	widgetsInTemplate: true,

	postCreate: function(){
		// look for the input widget as a child of the containerNode
		var _this = this;
		dojo.addOnLoad(function(){
			if(_this.editWidget){
				_this.containerNode.appendChild(_this.editWidget.domNode);
			}else{
				_this.editWidget = _this.getChildren()[0];
			}
			_this._setEditValue = dojo.hitch(_this.editWidget,_this.editWidget.setDisplayedValue||_this.editWidget.setValue);
			_this._getEditValue = dojo.hitch(_this.editWidget,_this.editWidget.getDisplayedValue||_this.editWidget.getValue);
			_this._setEditFocus = dojo.hitch(_this.editWidget,_this.editWidget.focus);
			_this.editWidget.onChange = dojo.hitch(_this,"_onChange");
			_this.checkForValueChange();
			_this._showText();
		});
		if(this.autoSave){
			this.buttonSpan.style.display="none";
		}
	},

	postMixInProperties: function(){
		dijit.form.InlineEditBox.superclass.postMixInProperties.apply(this, arguments);
		this.messages = dojo.i18n.getLocalization("dijit", "common", this.lang);
		dojo.forEach(["buttonSave", "buttonCancel"], function(prop){
			if(!this[prop]){ this[prop] = this.messages[prop]; }
		}, this);
	},

	_onKeyPress: function(e){
		if(this.disabled || e.altKey || e.ctrlKey){ return; }
		if(e.charCode == dojo.keys.SPACE || e.keyCode == dojo.keys.ENTER){
			dojo.stopEvent(e);
			this._onClick(e);
		}
	},

	_onMouseOver: function(){
		if(!this.editing){
			var classname = this.disabled ? "dijitDisabledClickableRegion" : "dijitClickableRegion";
			dojo.addClass(this.editable, classname);
		}
	},

	_onMouseOut: function(){
		if(!this.editing){
			var classStr = this.disabled ? "dijitDisabledClickableRegion" : "dijitClickableRegion";
			dojo.removeClass(this.editable, classStr);
		}
	},

	onClick: function(/*Event*/ e){
		// summary: callback for when button is clicked; user can override this function
	},

	_onClick: function(e){
		// summary
		// 		When user clicks the text, then start editing.
		// 		Hide the text and display the form instead.

		if(this.editing || this.disabled){ return; }
		this._onMouseOut();
		this.editing = true;

		// show the edit form and hide the read only version of the text
		this._setEditValue(this._isEmpty ? '' : (this.renderHTML ? this.editable.innerHTML : this.editable.firstChild.nodeValue));
		this._initialText = this._getEditValue();
		this._visualize();

		this._setEditFocus();
		this.saveButton.setDisabled(true);
		// moved to postCreate to always listen
		//this.editWidget.onChange = dojo.hitch(this,"_onChange");
		this.onClick();
	},

	_visualize: function(e){
		dojo.style(this.editNode, "display", this.editing ? "" : "none");
		dojo.style(this.editable, "display", this.editing ? "none" : "");
	},

	_showText: function(){
		var value = this._getEditValue();
		dijit.form.InlineEditBox.superclass.setValue.call(this, value);
		// whitespace is really hard to click so show a ?
		// TODO: show user defined message in gray
		if(/^\s*$/.test(value)){ value = "?"; this._isEmpty = true; }
		else { this._isEmpty = false; }
		if(this.renderHTML){
			this.editable.innerHTML = value;
		}else{
			this.editable.innerHTML = "";
			this.editable.appendChild(document.createTextNode(value));
		}
		this._visualize();
	},

	save: function(e){
		// summary: Callback when user presses "Save" button
		if(e){ dojo.stopEvent(e); }
		this.editing = false;
		this._showText();
	},

	cancel: function(e){
		// summary: Callback when user presses "Cancel" button
		if(e){ dojo.stopEvent(e); }
		this.editing = false;
		this._visualize();
	},

	setValue: function(/*String*/ value){
		// sets the text without informing the server
		this._setEditValue(value);
		this.editing = false;
		this._showText();
	},

	checkForValueChange: function(){
		// summary
		//		Callback when user changes input value.
		//		Enable save button if the text value is different than the original value.
		if(this.editing){
			this.saveButton.setDisabled(this._getEditValue() == this._initialText);
		}else{
			this._showText();
		}

	},

	_onChange: function(){
		// summary:
		//	This is called when the underlying widget fires an onChange event,
		//	which means that the user has presumably finished entering the value
		if(this.autoSave){
			this.save();
		}
	},

	setDisabled: function(/*Boolean*/ disabled){
		this.saveButton.setDisabled(disabled);
		this.cancelButton.setDisabled(disabled);
		this.editable.disabled = disabled;
		this.editWidget.setDisabled(disabled);
		dijit.form.InlineEditBox.superclass.setDisabled.apply(this, arguments);
	}
});
