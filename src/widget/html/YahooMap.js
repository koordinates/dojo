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
	this.locations=[];
	this.controls=["zoomlong","maptype","pan"];
};
dojo.inherits(dojo.widget.html.YahooMap, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.YahooMap, {
	templatePath:null,
	templateCssPath:null,

	findCenter:function(aPts){
		var start=new YGeoPoint(37,-90);
		if(aPts.length==0) return start;
		var minLat,maxLat, minLon, maxLon, cLat, cLon;
		minLat=maxLat=aPts[0].Lat;
		minLon=maxLon=aPts[0].Lon;
		for(var i=0; i<aPts.length; i++){
			minLat=Math.min(minLat,aPts[i].Lat);
			maxLat=Math.max(maxLat,aPts[i].Lat);
			minLon=Math.min(minLon,aPts[i].Lon);
			maxLon=Math.max(maxLon,aPts[i].Lon);
		}
		cLat=dojo.math.round((minLat+maxLat)/2,6);
		cLon=dojo.math.round((minLon+maxLon)/2,6);
		return new YGeoPoint(cLat,cLon);
	},
	setControls:function(){
		var c=this.controls;
		var t=dojo.widget.YahooMap.Controls;
		for(var i=0; i<c.length; i++){
			switch(c[i]){
				case t.MapType:{
					this.map.addTypeControl();
					break;
				}
				case t.Pan:{
					this.map.addPanControl();
					break;
				}
				case t.ZoomLong:{
					this.map.addZoomLong();
					break;
				}
				case t.ZoomShort:{
					this.map.addZoomShort();
					break;
				}
			}
		}
	},
	
	initialize:function(args, frag){
		if(frag && frag.location){
			this.locations=frag.location;
		}
	},
	postCreate:function(){
		if(!YMap){
			dojo.raise("dojo.widget.YahooMap: The Yahoo Map script must be included in order to use this widget.");
		}

		//	clean the domNode before creating the map.
		while(this.domNode.childNodes.length>0){
			this.domNode.removeChild(this.domNode.childNodes[0]);
		}
		this.map=new YMap(this.domNode);

		var pts=[];
		if(this.locations){
			var l=this.locations;
			for(var i=0; i<l.length; i++){
				var p=l[i].point[0];
				if(!p) continue;	//	no point to attach to.
				var t=p.value.split(",");
				var pt=new YGeoPoint(parseFloat(t[0]),parseFloat(t[1]));
				pts.push(pt);
				var m=new YMarker(pt);
				if(l[i].overlay[0]){
					m.addLabel("<div>"+l[i].overlay[0].value+"</div>");
				}
				this.map.addOverlay(m);
			}
		}
		var c=this.findCenter(pts);
		var z=this.map.getZoomLevel(pts);
		this.map.drawZoomAndCenter(c,z);

		this.setControls();
	}
});
