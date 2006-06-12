//
// User defined button widget
// that extends dojo's button widget by setting custom images
//
// In java terminology, this file defines
// a class called acme.UserButton that extends dojo.widget.Button
//

dojo.provide("acme.UserButton");
dojo.require("dojo.widget.Button");

// define UserButton's constructor
dojo.widget.defineWidget(
	// name
	"acme.UserButton",

	// superclass	
	dojo.widget.html.Button,
	
	// member variables/functions
	{
		widgetType: "UserButton",
	
		// override background images
		inactiveImg: "tests/widget/acme/user-",
		activeImg: "tests/widget/acme/userActive-",
		pressedImg: "tests/widget/acme/userPressed-",
		disabledImg: "tests/widget/acme/userPressed-",
		width2height: 1.3
	}
);