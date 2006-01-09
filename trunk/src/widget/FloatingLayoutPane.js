dojo.provide("dojo.widget.FloatingLayoutPane");
dojo.provide("dojo.widget.html.FloatingLayoutPane");

//
// this widget provides a window-like floating layout pane
//

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.FloatingPane");

// Inner pane is layout pane
dojo.widget.html.FloatingLayoutPane = function(){
	dojo.widget.html.FloatingPane.call(this);
}

dojo.inherits(dojo.widget.html.FloatingLayoutPane, dojo.widget.html.FloatingPane);

dojo.lang.extend(dojo.widget.html.FloatingLayoutPane, {
	widgetType: "FloatingLayoutPane",

	_makeClientPane: function(node){
		return this.createPane("LayoutPane", node, {layoutAlign: "client", id:this.widgetId+"_client"});
	}
});

dojo.widget.tags.addParseTreeHandler("dojo:FloatingLayoutPane");
