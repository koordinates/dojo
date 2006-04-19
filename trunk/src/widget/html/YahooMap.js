dojo.provide("dojo.widget.html.YahooMap");
dojo.require("dojo.event.*");
dojo.require("dojo.html");
dojo.require("dojo.math");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.YahooMap");

dojo.widget.html.YahooMap=function(){
	dojo.widget.HtmlWidget.call(this);
	dojo.widget.YahooMap.call(this);

	this.map=null;
};
dojo.inherits(dojo.widget.html.YahooMap, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.YahooMap, {
	templatePath:null,
	templateCssPath:null,

	getMapNode:function(){
		return this.mapFrame.document.getElementById("ymapnode");
	},
	postCreate:function(){
		if(!YMap){
			dojo.raise("dojo.widget.YahooMap: The Yahoo Map script must be included in order to use this widget.");
		}

		//	try something else
		var p=new YGeoPoint(37.404196,-122.008194);

		this.map=new YMap(this.domNode);
		this.map.drawZoomAndCenter(p,3);

		this.map.addTypeControl();
		this.map.addPanControl();
		this.map.addZoomLong();
	}
});
