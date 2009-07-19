dojo.provide("dijit.dijit");

// NOTE: dijit.common would be more descriptive

/*=====
dijit.dijit = {
	// summary: A roll-up for common dijit methods
	// description:
	//	A rollup file for the build system including the core and common
	//	dijit files.
	//	
	// example:
	// | <script type="text/javascript" src="js/dojo/dijit/dijit.js"></script>
	//
};
=====*/

// All the stuff in _base (these are the function that are guaranteed available without an explicit dojo.require)

dojo.provide("dijit._base");

dojo.require("dijit._base.focus");
dojo.require("dijit._base.manager");
dojo.require("dijit._base.place");
dojo.require("dijit._base.popup");
dojo.require("dijit._base.scroll");
dojo.require("dijit._base.sniff");
dojo.require("dijit._base.typematic");
dojo.require("dijit._base.wai");
dojo.require("dijit._base.window");

// Other stuff

dojo.require("dojo.parser");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit.layout._LayoutWidget");
dojo.require("dijit.form._FormWidget");