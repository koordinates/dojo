dojo.provide("dojox.layout.RadioGroup");
dojo.experimental("dojox.layout.RadioGroup");
//
//	dojox.layout.RadioGroup - an experimental (probably poorly named) Layout widget extending StackContainer
//	that accepts ContentPanes as children, and applies aesthetically pleasing responsive transition animations
//	attached to :hover of the Buttons created.
//
//	FIXME: take the Buttons out of the root template, and allow layoutAlign or similar attrib to use a different
//	template, or build the template dynamically? 
//
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Contained");
dojo.require("dijit.layout.StackContainer");
dojo.require("dojo.fx.easing");
dojo.require("dojox.layout.RadioGroup-face");
