dojo.provide("dojo.widget.FloatingRemotePane");
dojo.provide("dojo.widget.html.FloatingRemotePane");

//
// this widget provides a window-like floating pane loading from a url
//

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.FloatingPane");
dojo.require("dojo.widget.RemotePane");

// Inner pane is filled from URL
dojo.widget.html.FloatingRemotePane = function(){
	dojo.widget.html.FloatingPane.call(this);
}

dojo.inherits(dojo.widget.html.FloatingRemotePane, dojo.widget.html.FloatingPane);

dojo.lang.extend(dojo.widget.html.FloatingRemotePane, {
	widgetType: "FloatingRemotePane",

	href: "about:blank",
	extractContent: true,
	parseContent: true,
	cacheContent: true,

	fillInTemplate: function(args, frag){
		// If user has specified node contents, they become the title
		// (markup in the link is not handled correctly, so don't use it)
		var source = this.getFragNodeRef(frag);
		this.title += source.innerHTML;
		source.innerHTML="";	// clear it so it doesn't get copied to content pane

		dojo.widget.html.FloatingRemotePane.superclass.fillInTemplate.call(this, args, frag);
	},

	// Reset the (external defined) content of this pane
	setUrl: function(url) {
		this.clientPane.setUrl(url);
	},

	_makeClientPane: function(){
		var args = {layoutAlign: "client", id:this.widgetId+"_client",
			href: this.href, cacheContent: this.cacheContent, extractContent: this.extractContent,
			parseContent: this.parseContent};
		var pane = this.createPane("RemotePane", null, args);
		delete this.url;
		return pane;
	}
});

dojo.widget.tags.addParseTreeHandler("dojo:FloatingRemotePane");
