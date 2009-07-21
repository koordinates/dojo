dojo.provide("dijit.MenuSeparator");
dojo.required("dijit._Templated");
dojo.required("dijit._Contained");

dojo.declare("dijit.MenuSeparator",
		[dijit._Widget, dijit._Templated, dijit._Contained],
		{
		// summary:
		//		A line between two menu items

		templatePath: dojo.moduleUrl("dijit", "templates/MenuSeparator.html"),

		postCreate: function(){
			dojo.setSelectable(this.domNode, false);
		},
		
		isFocusable: function(){
			// summary:
			//		Override to always return false
			// tags:
			//		protected

			return false; // Boolean
		}
	});

