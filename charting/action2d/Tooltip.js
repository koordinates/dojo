dojo.provide("dojox.charting.action2d.Tooltip");

dojo.require("dojox.charting.action2d.Base");
dojo.require("dijit.Tooltip");

dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.functional.scan");
dojo.require("dojox.lang.functional.fold");

(function(){
	// TODO: merge to dijit._base.place eventually
	var old = dijit.placeOnScreenAroundElement,
		placeOnScreenAroundElement = function(
		/* DomNode */			node,
		/* DomNode|Object */	aroundNode,
		/* Object */			aroundCorners,
		/* Function */			layoutNode){
	
		// allows a rect object instead of aroundNode
		if(!aroundNode || typeof aroundNode != "object" || aroundNode.type !== "rect"){
			// old processing
			return old(node, aroundNode, aroundCorners, layoutNode);
		}

		// new processing
		var aroundNodeW = aroundNode.width,
			aroundNodeH = aroundNode.height,
			aroundNodePos = {x: aroundNode.x, y: aroundNode.y};
		
		// the rest is unchanged code of the original dijit.placeOnScreenAroundElement()
	
		// Generate list of possible positions for node
		var choices = [];
		for(var nodeCorner in aroundCorners){
			choices.push( {
				aroundCorner: nodeCorner,
				corner: aroundCorners[nodeCorner],
				pos: {
					x: aroundNodePos.x + (nodeCorner.charAt(1) == 'L' ? 0 : aroundNodeW),
					y: aroundNodePos.y + (nodeCorner.charAt(0) == 'T' ? 0 : aroundNodeH)
				}
			});
		}
	
		return dijit._place(node, choices, layoutNode);
	};
	// replace the original function to support our case
	dijit.placeOnScreenAroundElement = placeOnScreenAroundElement;
	
	var DEFAULT_TEXT = function(o){
		var t = o.run && o.run.data && o.run.data[o.index];
		if(t && typeof t == "object" && t.tooltip){
			return t.tooltip;
		}
		return o.element == "bar" ? o.x : o.y;
	};
	
	var df = dojox.lang.functional, pi4 = Math.PI / 4, pi2 = Math.PI / 2;
	
	dojo.declare("dojox.charting.action2d.Tooltip", dojox.charting.action2d.Base, {
		// the data description block for the widget parser
		defaultParams: {
			duration: 400,	// duration of the action in ms
			easing:   dojox.fx.easing.elasticOut,	// easing for the action
			text:     DEFAULT_TEXT	// the function to produce a tooltip from the object
		},
		optionalParams: {},	// no optional parameters

		constructor: function(chart, plot, kwArgs){
			// process optional named parameters
			this.text = kwArgs && "text" in kwArgs ? kwArgs.text : DEFAULT_TEXT;
			
			this.connect();
		},
		
		process: function(o){
			if(!o.shape || !(o.type in this.overOutEvents)){ return; }
			
			if(o.type == "onmouseout"){
				dijit.hideTooltip(this.aroundRect);
				this.aroundRect = null;
				return;
			}
			
			// calculate relative coordinates and the position
			var aroundRect = {type: "rect"}, position = ["after", "before"];
			switch(o.element){
				case "marker":
					aroundRect.x = o.cx;
					aroundRect.y = o.cy;
					aroundRect.width = aroundRect.height = 1;
					break;
				case "circle":
					aroundRect.x = o.cx - o.cr;
					aroundRect.y = o.cy - o.cr;
					aroundRect.width = aroundRect.height = 2 * o.cr;
					break;
				case "column":
					position = ["above", "below"];
				case "bar":
					aroundRect = dojo.clone(o.shape.getShape());
					break;
				default:
				//case "slice":
					if(!this.angles){
						// calculate the running total of slice angles
						if(typeof o.run.data[0] == "number"){
							this.angles = df.map(df.scanl(o.run.data, "+", 0),
								"* 2 * Math.PI / this", df.foldl(o.run.data, "+", 0));
						}else{
							this.angles = df.map(df.scanl(o.run.data, "a + b.y", 0),
								"* 2 * Math.PI / this", df.foldl(o.run.data, "a + b.y", 0));
						}
					}
					var angle = (this.angles[o.index] + this.angles[o.index + 1]) / 2;
					aroundRect.x = o.cx + o.cr * Math.cos(angle);
					aroundRect.y = o.cy + o.cr * Math.sin(angle);
					aroundRect.width = aroundRect.height = 1;
					// calculate the position
					if(angle < pi4){
						// do nothing: the position is right
					}else if(angle < pi2 + pi4){
						position = ["below", "above"];
					}else if(angle < Math.PI + pi4){
						position = ["before", "after"];
					}else if(angle < 2 * Math.PI - pi4){
						position = ["above", "below"];
					}
					/*
					else{
						// do nothing: the position is right
					}
					 */
					break;
			}
			
			// adjust relative coordinates to absolute, and remove fractions
			var lt = dojo.coords(this.chart.node, true);
			aroundRect.x += lt.x;
			aroundRect.y += lt.y;
			aroundRect.x = Math.round(aroundRect.x);
			aroundRect.y = Math.round(aroundRect.y);
			aroundRect.width = Math.ceil(aroundRect.width);
			aroundRect.height = Math.ceil(aroundRect.height);
			this.aroundRect = aroundRect;
			
			dijit.showTooltip(this.text(o), this.aroundRect, position);
		}
	});
})();