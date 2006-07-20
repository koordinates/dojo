dojo.provide("dojo.widget.DebugConsole");
dojo.require("dojo.widget.Widget");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.FloatingPane");

dojo.widget.DebugConsole= function(){
	dojo.widget.Widget.call(this);

	this.widgetType = "DebugConsole";
	this.isContainer = true;
}
dojo.inherits(dojo.widget.DebugConsole, dojo.widget.Widget);
dojo.widget.tags.addParseTreeHandler("dojo:debugconsole");

dojo.widget.html.DebugConsole= function(){

	dojo.widget.html.FloatingPane.call(this);
	dojo.widget.DebugConsole.call(this);
}

dojo.inherits(dojo.widget.html.DebugConsole, dojo.widget.html.FloatingPane);

dojo.lang.extend(dojo.widget.html.DebugConsole, {
	fillInTemplate: function() {
		dojo.widget.html.DebugConsole.superclass.fillInTemplate.apply(this, arguments);
		this.containerNode.id = "debugConsoleClientPane";
		djConfig.isDebug = true;
		djConfig.debugContainerId = this.containerNode.id;
	}
});
