dojo.hostenv.loadModule("dojo.event.*");
dojo.hostenv.loadModule("dojo.webui.Widget");

dojo.webui.widgetManager = function(){
	this.widgets = [];

	this.add = function(widget){
		
	}

	// FIXME: we should never allow removal of the root widget until all others
	// are removed!
	this.remove = function(){
	}
}
