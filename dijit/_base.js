dojo.provide("dijit._base");

dojo.require("dijit._base.manager");
dojo.require("dijit._base.popup");
dojo.require("dijit._base.scroll");
dojo.require("dijit._base.sniff");
dojo.require("dijit._base.typematic");
dojo.require("dijit._base.wai");

dojo.required(["dijit._base.focus", "dijit._base.manager", "dijit._base.place", "dijit._base.popup", "dijit._base.scroll", "dijit._base.sniff", "dijit._base.typematic", "dijit._base.wai", "dijit._base.window"], function() {
	dojo.provided("dijit._base");
});