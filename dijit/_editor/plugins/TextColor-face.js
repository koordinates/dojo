dojo.provide("dijit._editor.plugins.TextColor-face");
dojo.required("dijit._editor.plugins.TextColor");

dojo.declare("dijit._editor.plugins.TextColor",
	dijit._editor._Plugin,
	{
		//	summary:
		//		This plugin provides dropdown color pickers for setting text color and background color
		//
		//	description:
		//		The commands provided by this plugin are:
		//		* foreColor - sets the text color
		//		* hiliteColor - sets the background color

		// Override _Plugin.buttonClass to use DropDownButton (with ColorPalette) to control this plugin
		buttonClass: dijit.form.DropDownButton,

//TODO: set initial focus/selection state?

		constructor: function(){
			this.dropDown = new dijit.ColorPalette();
			this.connect(this.dropDown, "onChange", function(color){
				this.editor.execCommand(this.command, color);
			});
		}
	}
);

// Register this plugin.

dojo.subscribe(dijit._scopeName + ".Editor.getPlugin",null,function(o){
	if(!o.plugin && (o.args.name == "foreColor" || o.args.name == "hiliteColor")){
		o.plugin = new dijit._editor.plugins.TextColor({command: o.args.name});		
	}
});
