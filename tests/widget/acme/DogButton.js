//
// User defined button widget
// that extends dojo's button widget by setting custom images
//
// In java terminology, this file defines
// a class called acme.DogButton that extends dojo.widget.Button
//

dojo.provide("acme.DogButton");
dojo.require("dojo.widget.Button");

// define DogButton's constructor
acme.DogButton = function(){
	// call superclass's constructor
	dojo.widget.html.Button.call(this);
}

// set DogButton's superclass to Button
dojo.inherits(acme.DogButton, dojo.widget.html.Button);

// define DogButton's functions and variables
dojo.lang.extend(acme.DogButton, {
	widgetType: "DogButton",
	
	// override icons
	inactiveImg: "tests/widget/acme/user-",
	activeImg: "tests/widget/acme/userActive-",
	pressedImg: "tests/widget/acme/userPressed-",
	disabledImg: "tests/widget/acme/userPressed-",
	width2height: 1.3
});

// setup 
dojo.widget.tags.addParseTreeHandler("dojo:dogbutton");