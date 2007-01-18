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
		inactiveImg: "tests/widget/acme/user-",
		activeImg: "tests/widget/acme/userActive-",
		pressedImg: "tests/widget/acme/userPressed-",
		disabledImg: "tests/widget/acme/userPressed-",
		width2height: 1.3
	}
);