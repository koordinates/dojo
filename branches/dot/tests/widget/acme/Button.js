//
// User defined button widget
// that extends dojo's button widget by setting custom images
//
// In java terminology, this file defines
// a class called acme.widget.Button that extends dojo.widget.Button
//
dojo.provide("acme.Button");
dojo.require("dojo.widget.Button");

// <namespace>, <namespace>.widget is now considered 'conventional'
// therefore the registerNamespace call below is no longer necessary here

// Tell dojo that widgets prefixed with "acme:" namespace are found in the "acme.widget" module
//dojo.registerNamespace("acme", "acme.widget");

// define UserButton's constructor
dojo.widget.defineWidget(
	// class
	"acme.widget.Button",

	// superclass	
	dojo.widget.Button,
	
	// member variables/functions
	{
		// override background images
		inactiveImg: "user-",
		activeImg: "userActive-",
		pressedImg: "userPressed-",
		disabledImg: "userPressed-",
		width2height: 1.3,
		_setImage: function(/*String*/ prefix){
			this.leftImage.src=dojo.uri.moduleUri("acme", prefix + "l.gif");
			this.centerImage.src=dojo.uri.moduleUri("acme", prefix + "c.gif");
			this.rightImage.src=dojo.uri.moduleUri("acme", prefix + "r.gif");
		}
	}
);
