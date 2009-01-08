dojo.provide("dijit.CheckedMenuItem");

dojo.require("dijit.MenuItem");

dojo.declare("dijit.CheckedMenuItem",
		dijit.MenuItem,
		{
		// summary: a checkbox-like menu item for toggling on and off
		
		templatePath: dojo.moduleUrl("dijit", "templates/CheckedMenuItem.html"),

		// checked: Boolean
		//		Our checked state
		checked: false,
		_setCheckedAttr: function(/*Boolean*/ checked){
			// summary:
			//		Hook so attr('checked', bool) works.
			//		Sets the class and state for the check box.
			dojo.toggleClass(this.iconNode, "dijitCheckedMenuItemIconChecked", checked);
			dijit.setWaiState(this.domNode, "checked", checked);
			this.checked = checked;
		},

		onChange: function(/*Boolean*/ checked){
			// summary: User defined function to handle change events
		},

		_onClick: function(/*Event*/ e){
			// summary: Clicking this item just toggles its state
			if(!this.disabled){
				this.attr("checked", !this.checked);
				this.onChange(this.checked);
			}
			this.inherited(arguments);
		}
	});
