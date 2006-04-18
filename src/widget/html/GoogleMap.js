dojo.provide("dojo.widget.html.GoogleMap");
dojo.require("dojo.event.*");
dojo.require("dojo.html");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.GoogleMap");

dojo.widget.html.GoogleMap=function(){
	dojo.widget.HtmlWidget.call(this);
	dojo.widget.GoogleMap.call(this);
};
dojo.inherits(dojo.widget.html.GoogleMap, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.GoogleMap, {
	templatePath:null,
	templateCssPath:null,
	map:null,

	postCreate:function(){
		if(!GMap2){
			dojo.raise("dojo.widget.GoogleMap: The Google Map script must be included (with a proper API key) in order to use this widget.");
		}
		this.map=new GMap2(this.domNode);
		this.map.setCenter(new GLatLng(37.4419, -122.1419), 13);

	}
});
