dojo.hostenv.startPackage("dojo.webui.widgets.HTMLButton");

dojo.webui.widgets.HTMLButton = function(){
	// if DOMButton turns into a mixin, we should subclass Button instead and
	// just mix in the DOMButton properties.
	dojo.webui.widgets.DOMButton.call(this);

	// FIXME: freaking implement this already!

}

dj_inherits(dojo.webui.widgets.HTMLButton, dojo.webui.widgets.DOMButton);

