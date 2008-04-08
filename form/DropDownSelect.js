dojo.provide("dojox.form.DropDownSelect");

dojo.require("dojox.form._FormSelectWidget");
dojo.require("dojox.form._HasDropDown");
dojo.require("dijit.Menu");

dojo.requireLocalization("dijit.form", "validate");

dojo.declare("dojox.form.DropDownSelect", [dojox.form._FormSelectWidget, dojox.form._HasDropDown], {
	// summary:
	//		This is a "Styleable" select box - it is basically a DropDownButton which
	//		can take as its input a <select>.

	baseClass: "dojoxDropDownSelect",
	
	templatePath: dojo.moduleUrl("dojox.form", "resources/DropDownSelect.html"),
	
	// required: Boolean
	//		Can be true or false, default is false.
	required: false,

	// state: String
	//		Shows current state (ie, validation result) of input (Normal, Warning, or Error)
	state: "",

	//	tooltipPosition: String[]
	//		See description of dijit.Tooltip.defaultPosition for details on this parameter.
	tooltipPosition: [],

	// emptyLabel: string
	//		What to display in an "empty" dropdown
	emptyLabel: "",
	
	// _isLoaded: boolean
	//		Whether or not we have been loaded
	_isLoaded: false,
	
	// _connections: Object
	//		The connections we need to make for updating states
	_connections: dojo.mixin(dojo.clone(dojox.form._FormSelectWidget.prototype._connections),
		{"_setStateClass": ["openDropDown", "closeDropDown"]}),

	_fillContent: function(){
		// summary:  
		//		Set the value to be the first, or the selected index
		this.inherited(arguments);
		if(this.options.length && !this.value){
			var si = this.srcNodeRef.selectedIndex;
			this.value = this.options[si != -1 ? si : 0].value;
		}
		
		// Create the dropDown widget
		this.dropDown = new dijit.Menu();
	},

	_addOptionItem: function(/* dojox.form.__SelectOption */ option){
		// summary:
		//		For the given option, add a option to our dropdown
		//		If the option doesn't have a value, then a separator is added 
		//		in that place.
		var menu = this.dropDown;
		if(!option.value){
			// We are a separator (no label set for it)
			menu.addChild(new dijit.MenuSeparator());
		}else{
			// Just a regular menu option
			var click = dojo.hitch(this, "setValue", option);
			var mi = new dijit.MenuItem({
				option: option,
				label: option.label,
				onClick: click
			});
			menu.addChild(mi);
		}
	},

	_getChildren: function(){ return this.dropDown.getChildren(); },
	
	_loadChildren: function(){
		// summary: 
		//		Resets the menu and the length attribute of the button - and
		//		ensures that the label is appropriately set.
		this.inherited(arguments);
		var len = this.options.length;
		this._isLoaded = false;
		
		// Set our length attribute and our value
		this.setAttribute("readOnly", (len === 1));
		this.setAttribute("disabled", (len === 0));	
		this.setValue(this.value);
	},
	
	_setDisplay: function(/*String*/ newDisplay){
		// summary: sets the display for the given value (or values)
		this.containerNode.innerHTML = '<div class=" ' + this.baseClass + 'Label">' +
					(newDisplay || this.emptyLabel || "&nbsp;") +
					'</div>';
	},

	validate: function(/*Boolean*/ isFocused){
		// summary:
		//		Called by oninit, onblur, and onkeypress.
		// description:
		//		Show missing or invalid messages if appropriate, and highlight textbox field.
		var isValid = this.isValid(isFocused);
		this.state = isValid ? "" : "Error";
		this._setStateClass();
		dijit.setWaiState(this.focusNode, "invalid", isValid ? "false" : "true");
		var message = isValid ? "" : this._missingMsg;
		if(this._message !== message){
			this._message = message;
			dijit.hideTooltip(this.domNode);
			if(message){
				dijit.showTooltip(message, this.domNode, this.tooltipPosition);
			}
		}
		return isValid;		
	},

	isValid: function(/*Boolean*/ isFocused){
		// summary: Whether or not this is a valid value
		return (!this.required || !/^\s*$/.test(this.value));
	},
	
	reset: function(){
		// summary: Overridden so that the state will be cleared.
		this.inherited(arguments);
		dijit.hideTooltip(this.domNode);
		this.state = "";
		this._setStateClass();
		delete this._message;
	},

	postMixInProperties: function(){
		// summary: set the missing message
		this.inherited(arguments);
		this._missingMsg = dojo.i18n.getLocalization("dijit.form", "validate", 
									this.lang).missingMessage;
	},

	startup: function(){
		if(this._started){ return; }

		// the child widget from srcNodeRef is the dropdown widget.  Insert it in the page DOM,
		// make it invisible, and store a reference to pass to the popup code.
		if(!this.dropDown){
			var dropDownNode = dojo.query("[widgetId]", this.dropDownContainer)[0];
			this.dropDown = dijit.byNode(dropDownNode);
			delete this.dropDownContainer;
		}
		this.inherited(arguments);
	},
	
	_onMenuMouseup: function(e){
		// override this to actually "pretend" to do a click on our menu - it will
		// call onExecute - so it will close our popup for us.  For non-menu
		// popups, it will not execute.
		var dropDown = this.dropDown, t = e.target;
		
		if(dropDown.onItemClick){
			var menuItem;
			while(t && !(menuItem = dijit.byNode(t))){
				t = t.parentNode;
			}
			if(menuItem && menuItem.getParent){
				menuItem.getParent().onItemClick(menuItem, e);
			}
		}
		// TODO: how to handle non-menu popups?
	},

	isLoaded: function(){
		return this._isLoaded;
	},
	
	loadDropDown: function(){
		// summary: populates the menu
		this._loadChildren();
		dojo.addClass(this.dropDown.domNode, this.baseClass + "Menu");
		this._isLoaded = true;
		this.openDropDown();
	},
	
	setAttribute: function(/*string*/ attr, /* anything */ value){
        // summary: sometime we get called to set our value - we need to
        //          make sure and route those requests through _setValue()
        //          instead.
        if(attr === "value"){
            this.setValue(value);
        }else{
            this.inherited(arguments);
        }
    }
});
