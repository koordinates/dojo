dojo.provide("dijit.ToolbarSeparator");

dojo.require("dijit._Templated");

dojo.required("dijit._Templated", function() {

dojo.declare("dijit.ToolbarSeparator",
	[ dijit._Widget, dijit._Templated ],
	{
	// summary:
	//		A spacer between two `dijit.Toolbar` items
	templateString: '<div class="dijitToolbarSeparator dijitInline"></div>',
	postCreate: function(){ dojo.setSelectable(this.domNode, false); },
	isFocusable: function(){ 
		// summary:
		//		This widget isn't focusable, so pass along that fact.
		// tags:
		//		protected
		return false; 
	}
});

});