dojo.provide("dijit.form.InlineEditBox");

dojo.require("dijit.base.FormElement");
dojo.require("dijit.base.Container");
dojo.require("dijit.base.TemplatedWidget");
dojo.require("dojo.i18n.common");

dojo.requireLocalization("dijit", "common");

dojo.declare(
	"dijit.form.InlineEditBox",
	[dijit.base.FormElement, dijit.base.Container, dijit.base.TemplatedWidget],
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
	//		String getTextValue()
	//		void setTextValue(String)
	//		void focus()
	//		It must also be able to initialize with style="display:none;" set.
{
	templatePath: dojo.uri.moduleUri("dijit.form", "templates/InlineEditBox.html"),

	// editing: Boolean
	//		Is the node currently in edit mode?
	editing: false,

	// saveButton: String
	//              Save button label
	saveButton: "",

	// cancelButton: String
	//              Cancel button label
	cancelButton: "",

	postCreate: function(){
		var _this = this;
		dojo.addOnLoad(function(){
			// look for the input widget as a child of the containerNode
			var node = _this.containerNode.firstChild;
			while (node != null) {
				_this.editWidget = dijit.util.manager.byNode(node);
				if (_this.editWidget){ break; }
				node = node.nextSibling;
			}
			_this._showText();
		});
	},
	
	postMixInProperties: function(){
		dijit.form.InlineEditBox.superclass.postMixInProperties.apply(this, arguments);
		this.messages = dojo.i18n.getLocalization("dijit", "common", this.lang);
		dojo.lang.forEach(["buttonSave", "buttonCancel"], function(prop){
			if(!this[prop]){ this[prop] = this.messages[prop]; }
		}, this);
	},

	onKey: function(e) {
		if (!e.key || e.altKey || e.shiftKey || e.ctrlKey) { return; }
		switch(e.key) {
			case " ":
			case e.KEY_ENTER:
				dojo.event.browser.stopEvent(e);
				this.onClick(e);
				break;
		}
	},

	onMouseOver: function(){
		if(!this.editing){
			dojo.html.addClass(this.editable, this.disabled ? "dojoDisabledClickableRegion" : "dojoClickableRegion");
		}
	},
	
	onMouseOut: function(){
		if(!this.editing){
			dojo.html.removeClass(this.editable, this.disabled ? "dojoDisabledClickableRegion" : "dojoClickableRegion");
		}
	},

	onClick: function(e){
		// summary
		// 		When user clicks the text, then start editing.
		// 		Hide the text and display the form instead.

		if(this.editing || this.disabled){ return; }
		this.onMouseOut();
		this.editing = true;

		// show the edit form and hide the read only version of the text
		this.editWidget.setTextValue(this._isEmpty ? '' : this.editable.innerHTML);
		this._visualize();

		this.editWidget.focus();
		this.saveButton.disabled = true;
	},

	_visualize: function(e){
		this.saveButton.style.display
		= this.cancelButton.style.display
		= this.containerNode.style.display 
		= this.editing ? "" : "none";
		this.editable.style.display = this.editing ? "none" : "";
	},

	_showText: function(){
		var value = this.editWidget.getTextValue();
		dijit.form.InlineEditBox.superclass.setValue.call(this, value);
		// whitespace is really hard to click so show a ?
		if (/^\s*$/.test(value)) { value = "?"; this._isEmpty = true; }
		this.editable.innerHTML = value;
		this._visualize();
	},

	save: function(e){
		// summary: Callback when user presses "Save" button
		dojo.event.browser.stopEvent(e);
		this.editing = false;
		this._showText();
	},

	cancel: function(e){
		// summary: Callback when user presses "Cancel" button
		dojo.event.browser.stopEvent(e);
		this.editing = false;
		this._visualize();
	},

	setValue: function(/*String*/ value){
		// sets the text without informing the server
		this.editWidget.setTextValue(value);
		this.editing = false;
		this._showText();
	},

	checkForValueChange: function(){
		// summary
		//		Callback when user changes input value.
		//		Enable save button if the text value is different than the original value.
		this.saveButton.disabled = (this.editWidget.getTextValue() == this.editable.innerHTML);
	},
	
	disable: function(){
		this.saveButton.disabled = true;
		this.cancelButton.disabled = true;
		this.editable.disabled = true;
		this.editWidget.disable();
		dijit.form.InlineEditBox.superclass.disable.apply(this, arguments);
	},
	
	enable: function(){
		this.checkForValueChange();
		this.cancelButton.disabled = false;
		this.editable.disabled = false;
		this.editWidget.enable();
		dijit.form.InlineEditBox.superclass.enable.apply(this, arguments);
	}
});
