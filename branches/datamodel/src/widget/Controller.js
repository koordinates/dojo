dojo.provide("dojo.widget.Controller");
dojo.require("dojo.event.*");


// Basic Controller interface 
dojo.widget.tags.addParseTreeHandler("dojo:TreeBasicController");
dojo.widget.Controller = function() {
	dojo.widget.HtmlWidget.call(this);
}
dojo.inherits(dojo.widget.TreeBasicController, dojo.widget.HtmlWidget);
dojo.lang.extend(dojo.widget.TreeBasicController, {
	widgetType: "Controller",

	dndController: "",
	selector: "",
	destroyWithWidget: false, // Specifies whether this controller's lifetime is tied to the widget's

	initialize: function(args, frag){}, //Initialize the widget, using data from model 
	bind: function(tree) {}, // Binds controller from it's widget to begin listening for events 
	unbind: function(tree) {}, // Unbinds controller from it's widget to stop listening for events 
	onCreateDOMNode: function(message) {}, // Called when dom node of widget has been created
	onWidgetCreate: function(message) {}, // perform actions-initializers for control 
	
	//Subclasses implement widget-specific event handlers (eg. onXXX()) in addition to the standard methods above
});

//Data-bound Controller 
dojo.widget.tags.addParseTreeHandler("dojo:LoadingController");
dojo.widget.LoadingController = function() {
	dojo.widget.Controller.call(this);
}
dojo.inherits(dojo.widget.LoadingController, dojo.widget.Controller);
dojo.lang.extend(dojo.widget.LoadingController, {
	widgetType: "LoadingController",

	rpcUrl: "",
	rpcActionParam: "action", // used for GET for RPCUrl

	//Common RPC error handler (dies)
	doHandleRPCError: function(type, obj, evt) {},
	runRPC: function(kw) {},
	getServiceUrl: function(action) {}, //Returns the url used to obtain data or new state.
	loadProcessResponse: function(node, result, callObj, callFunc) {}, // Update state of widget with from model
	getInfo: function(obj) {},
	load: function(node, sync, callObj, callFunc){} //Load data 

	// Methods to affect state of controlled widget go here...
	// use doXXXX(); method names, like doCreateChild
});

