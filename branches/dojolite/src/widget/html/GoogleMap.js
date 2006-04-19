dojo.provide("dojo.widget.html.GoogleMap");
dojo.require("dojo.event.*");
dojo.require("dojo.html");
dojo.require("dojo.math");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.GoogleMap");

dojo.widget.html.GoogleMap=function(){
	dojo.widget.HtmlWidget.call(this);
	dojo.widget.GoogleMap.call(this);

	var gm=dojo.widget.GoogleMap;

	this.map=null;
	this.bounds=null;
	this.plot=[];
	this.points=[];
	this.controls=[gm.Controls.LargeMap,gm.Controls.Scale,gm.Controls.MapType];
};
dojo.inherits(dojo.widget.html.GoogleMap, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.GoogleMap, {
	templatePath:null,
	templateCssPath:null,

	setControls:function(){
		var c=dojo.widget.GoogleMap.Controls;
		for(var i=0; i<this.controls.length; i++){
			var type=this.controls[i];
			switch(type){
				case c.LargeMap:{
					this.map.addControl(new GLargeMapControl());
					break;
				}
				case c.SmallMap:{
					this.map.addControl(new GSmallMapControl());
					break;
				}
				case c.SmallZoom:{
					this.map.addControl(new GSmallZoomControl());
					break;
				}
				case c.Scale:{
					this.map.addControl(new GScaleControl());
					break;
				}
				case c.MapType:{
					this.map.addControl(new GMapTypeControl());
					break;
				}
				case c.Overview:{
					this.map.addControl(new GOverviewMapControl());
					break;
				}
				default:{
					break;
				}
			}
		}
	},
	setMarkers:function(){
		for(var i=0; i<this.points.length; i++){
			this.map.addOverlay(new GMarker(this.points[i]));
		}
	},
	createPoint:function(lat, long){
		return new GLatLng(parseFloat(lat), parseFloat(long));
	},
	center:function(point, zoom){
		this.map.setCenter(point, zoom);
	},
	panTo:function(point){
		this.map.panTo(point);
	},
	findCenter:function(){
		var clat=(this.bounds.getNorthEast().lat()+this.bounds.getSouthWest().lat())/2;
		var clng=(this.bounds.getNorthEast().lng()+this.bounds.getSouthWest().lng())/2;
		return new GLatLng(clat,clng);
	},
	findZoom:function(){
		return this.map.getBoundsZoomLevel(this.bounds);
	},

	postCreate:function(){
		if(!GMap2){
			dojo.raise("dojo.widget.GoogleMap: The Google Map script must be included (with a proper API key) in order to use this widget.");
		}
		this.bounds=new GLatLngBounds();
		for(var i=0; i<this.plot.length; i++){
			var a=this.plot[i].split(",");
			var p=new GLatLng(parseFloat(a[0]),parseFloat(a[1]));
			this.points.push(p);
			this.bounds.extend(p);
		}
		this.map=new GMap2(this.domNode);
		this.setControls();
		this.map.setCenter(this.findCenter(), this.findZoom());
		this.setMarkers();
	}
});
