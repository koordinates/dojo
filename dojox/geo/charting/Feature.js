
define(["dojo/_base/lang", "dojo/_base/declare","dojo/_base/html","dojo/_base/event", "dojox/gfx/fx", "dojox/color"], 
			function(dojo, declare, dhtml, event, fx,color) {


return dojo.declare("dojox.geo.charting.Feature", null, {
	// summary: 
	//   class to encapsulate a map element.
	// tags:
	//   private

	_isZoomIn: false,
	isSelected: false,
	markerText:null,


	constructor: function(parent, name, shapeData){
		this.id = name;
		this.shape = parent.mapObj.createGroup();
		this.parent = parent;
		this.mapObj = parent.mapObj;
		this._bbox = shapeData.bbox;
		this._center = shapeData.center;
		//TODO: fill color would be defined by charting data and legend
//		this._highlightFill = ["#FFCE52", "#CE6342", "#63A584"][Math.floor(Math.random() * 3)];
		this._defaultFill = parent.defaultColor;
		this._highlightFill = parent.highlightColor;
		this._defaultStroke = {
			width: this._normalizeStrokeWeight(.5),
			color: "white"
		};
		
		var shapes = (dojo.isArray(shapeData.shape[0])) ? shapeData.shape : [shapeData.shape];
		dojo.forEach(shapes, function(points){
			this.shape.createPolyline(points).setStroke(this._defaultStroke);
		}, this);
		this.unsetValue();
	},
	unsetValue:function(){
		this.value = null;
		this._defaultFill = this.parent.defaultColor;
//		var color = new dojox.color.Color(this.parent.defaultColor);
//		color.a = 0.7;
//		this._highlightFill = color;
		var col = new color.Color(this.parent.defaultColor).toHsl();
		col.l = 1.2 * col.l;
		this._highlightFill = color.fromHsl(col);
		this._setFillWith(this._defaultFill);
	},
	setValue:function(value){
		this.value = value;
		if(this.parent.series.length != 0){
			for(var i = 0;i < this.parent.series.length;i++){
				var range = this.parent.series[i];
				if((value>=range.min)&&(value<range.max)){
					this._setFillWith(range.color);
					this._defaultFill = range.color;
					var col = new color.Color(range.color).toHsv();
					col.v = (col.v + 20);
					this._highlightFill = color.fromHsv(col);
				}
			}
		}
	},
	_setFillWith: function(color){
		var borders = (dojo.isArray(this.shape.children)) ? this.shape.children : [this.shape.children];
		dojo.forEach(borders, dojo.hitch(this,function(item){
			if(this.parent.colorAnimationDuration > 0){
				var anim1 = fx.animateFill({
					shape: item,
					color: {
						start: item.getFill(),
						end: color
					},
					duration: this.parent.colorAnimationDuration
				});
				anim1.play();
			}else{
				item.setFill(color);
			}
		}));
	},
	_setStrokeWith: function(stroke){
		var borders = (dojo.isArray(this.shape.children)) ? this.shape.children : [this.shape.children];
		dojo.forEach(borders, function(item){
			item.setStroke({
				color: stroke.color,
				width: stroke.width,
				join: "round"
			});
		});
	},
	_normalizeStrokeWeight: function(weight){
		var matrix = this.shape._getRealMatrix();
		return (dojox.gfx.renderer != "vml")?weight/(this.shape._getRealMatrix()||{xx:1}).xx:weight;
	},
	_onmouseoverHandler: function(evt){
		this.parent.onFeatureOver(this);
		this._setFillWith(this._highlightFill);
		this.mapObj.marker.show(this.id);
	},
	_onmouseoutHandler: function(){
		this._setFillWith(this._defaultFill);
		this.mapObj.marker.hide();
		dojo.style("mapZoomCursor", "display", "none");
	},
	_onmousemoveHandler: function(evt){
		if(this.mapObj.marker._needTooltipRefresh){
			this.mapObj.marker.show(this.id);
		}
		if(this.isSelected){
			if (parent.enableFeatureZoom) {
				evt = dojo.fixEvent(evt || window.event);
				dojo.style("mapZoomCursor", "left", evt.pageX + 12 + "px");
				dojo.style("mapZoomCursor", "top", evt.pageY + "px");
				dojo.byId("mapZoomCursor").className = this._isZoomIn ? "mapZoomOut":"mapZoomIn";
				dojo.style("mapZoomCursor", "display", "block");
			}else{
				dojo.style("mapZoomCursor", "display", "none");
			}
		}
	},
	_onclickHandler: function(evt){
		this.parent.onFeatureClick(this);
		if(!this.isSelected){
			this.parent.deselectAll();
			this.select(true);
			this._onmousemoveHandler(evt);
		}else if(parent.enableFeatureZoom){
			if(this._isZoomIn){
				this._zoomOut();
			}else{
				this._zoomIn();
			}
		}
	},
	
	select: function(selected) {
		if(selected){
			this.shape.moveToFront();
			this._setStrokeWith({color:"black",width:this._normalizeStrokeWeight(2)});
			this._setFillWith(this._highlightFill);
			this.isSelected = true;
			this.parent.selectedFeature = this;
		}else{
			this._setStrokeWith(this._defaultStroke);
			this._setFillWith(this._defaultFill);
			this.isSelected = false;
			this._isZoomIn = false;
		}
	},
	
	_zoomIn: function(){
		var marker = this.mapObj.marker;
		marker.hide();
		this.parent.fitToMapArea(this._bbox, 15,true,dojo.hitch(this,function(){
			this._setStrokeWith({color:"black",width:this._normalizeStrokeWeight(2)});
			marker._needTooltipRefresh = true;
			this.parent.onZoomEnd(this);
		}));
		this._isZoomIn = true;
		dojo.byId("mapZoomCursor").className = "";
	},
	_zoomOut: function(){
		var marker = this.mapObj.marker;
		marker.hide();
		this.parent.fitToMapContents(3,true,dojo.hitch(this,function(){
			this._setStrokeWith({color:"black",width:this._normalizeStrokeWeight(2)});
			marker._needTooltipRefresh = true;
			this.parent.onZoomEnd(this);
		}));
		this._isZoomIn = false;
		dojo.byId("mapZoomCursor").className = "";
	},
	
	init: function(){
		this.shape.id = this.id;
		this.tooltip = null;
	}
});
});