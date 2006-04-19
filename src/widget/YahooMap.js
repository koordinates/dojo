dojo.provide("dojo.widget.YahooMap");
dojo.provide("dojo.widget.YahooMap.Controls");
dojo.require("dojo.widget.*");
dojo.widget.tags.addParseTreeHandler("dojo:yahoomap");

dojo.widget.YahooMap=function(){
	//	summary
	//	base class for the Yahoo Map widget
	dojo.widget.Widget.call(this);
	this.widgetType="YahooMap";
	this.isContainer=false;
}
dojo.inherits(dojo.widget.YahooMap, dojo.widget.Widget);

//FIXME
dojo.widget.YahooMap.Controls={
	LargeMap:"largemap",
	SmallMap:"smallmap",
	SmallZoom:"smallzoom",
	Scale:"scale",
	MapType:"maptype",
	Overview:"overview",
	get:function(s){
		for(var p in this){
			if(typeof(this[p])=="string"
				&& this[p]==s
			){
				return p;
			}
		}
		return null;
	}
};

dojo.requireAfterIf("html", "dojo.widget.html.YahooMap");
