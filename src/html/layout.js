dojo.provide("dojo.html.layout");

dojo.require("dojo.html.common");
dojo.require("dojo.html.style");

dojo.html.sumAncestorProperties = function(node, prop){
	node = dojo.byId(node);
	if(!node){ return 0; } // FIXME: throw an error?
	
	var retVal = 0;
	while(node){
		var val = node[prop];
		if(val){
			retVal += val - 0;
			if(node==dojo.body()){ break; }// opera and khtml #body & #html has the same values, we only need one value
		}
		node = node.parentNode;
	}
	return retVal;
}

dojo.html.getAbsolutePosition = dojo.html.abs = function(node, includeScroll){
	node = dojo.byId(node, node.ownerDocument);
	var ret = {
		x: 0,
		y: 0
	};
	var scroll = dojo.html.getScroll();

	var h = dojo.render.html;
	var db = document["body"]||document["documentElement"];

	if(h.ie){
		with(node.getBoundingClientRect()){
			ret.x = left-2;
			ret.y = top-2;
		}
	}else if(document.getBoxObjectFor){
		// mozilla
		try{
			var bo = document.getBoxObjectFor(node);
			ret.x = bo.x - dojo.html.sumAncestorProperties(node, "scrollLeft");
			ret.y = bo.y - dojo.html.sumAncestorProperties(node, "scrollTop");
		}catch(e){
			// squelch
		}
	}else{
		if(node["offsetParent"]){
			var endNode;		
			// in Safari, if the node is an absolutely positioned child of
			// the body and the body has a margin the offset of the child
			// and the body contain the body's margins, so we need to end
			// at the body
			if(	(h.safari)&&
				(node.style.getPropertyValue("position") == "absolute")&&
				(node.parentNode == db)){
				endNode = db;
			}else{
				endNode = db.parentNode;
			}

			if(node.parentNode != db){
				var nd = node;
				if(dojo.render.html.opera){ nd = db; }
				ret.x -= dojo.html.sumAncestorProperties(nd, "scrollLeft");
				ret.y -= dojo.html.sumAncestorProperties(nd, "scrollTop");
			}
			do{
				var n = node["offsetLeft"];
				//FIXME: ugly hack to workaround the submenu in 
				//popupmenu2 does not shown up correctly in opera. 
				//Someone have a better workaround?
				if(!dojo.render.html.opera || n>0){
					ret.x += isNaN(n) ? 0 : n;
				}
				var m = node["offsetTop"];
				ret.y += isNaN(m) ? 0 : m;
				node = node.offsetParent;
			}while((node != endNode)&&(node != null));
		}else if(node["x"]&&node["y"]){
			ret.x += isNaN(node.x) ? 0 : node.x;
			ret.y += isNaN(node.y) ? 0 : node.y;
		}
	}

	// account for document scrolling!
	if(includeScroll){
		ret.y += scroll.top;
		ret.x += scroll.left;
	}

	ret.top = ret.y;
	ret.left = ret.x;

	return ret;
}

dojo.html.isPositionAbsolute = function(node){
	return (dojo.html.getComputedStyle(node, 'position') == 'absolute')
}

dojo.html.getTotalOffset = function(node, type, includeScroll){
	dojo.deprecated("dojo.html.getTotalOffset", "replaced by dojo.html.getAbsolutePosition().(top|left)", "0.5");
	return dojo.html.getAbsolutePosition(node, includeScroll)[type];
}

dojo.html.getAbsoluteX = function(node, includeScroll){
	dojo.deprecated("dojo.html.getAbsoluteX", "replaced by dojo.html.getAbsolutePosition().x", "0.5");
	return dojo.html.getAbsolutePosition(node, includeScroll).x;
}

dojo.html.getAbsoluteY = function(node, includeScroll){
	dojo.deprecated("dojo.html.getAbsoluteY", "replaced by dojo.html.getAbsolutePosition().y", "0.5");
	return dojo.html.getAbsolutePosition(node, includeScroll).y;
}

dojo.html.totalOffsetLeft = function(node, includeScroll){
	dojo.deprecated("dojo.html.totalOffsetLeft", "replaced by dojo.html.getAbsolutePosition().left", "0.5");
	return dojo.html.getAbsoluteX(node, includeScroll);
}

dojo.html.totalOffsetTop = function(node, includeScroll){
	dojo.deprecated("dojo.html.totalOffsetTop", "replaced by dojo.html.getAbsolutePosition().top", "0.5");
	return dojo.html.getAbsoluteY(node, includeScroll);
}

dojo.html._sumPixelValues = function(node, selectors, autoIsZero){
	var total = 0;
	for(var x=0; x<selectors.length; x++){
		total += dojo.html.getPixelValue(node, selectors[x], autoIsZero);
	}
	return total;
}

dojo.html.getMargin = function(node){
	return {
		width: dojo.html._sumPixelValues(node, ["margin-left", "margin-right"], (dojo.html.getComputedStyle(node, 'position') == 'absolute')),
		height: dojo.html._sumPixelValues(node, ["margin-top", "margin-bottom"], (dojo.html.getComputedStyle(node, 'position') == 'absolute'))
	};
}

dojo.html.getBorder = function(node){
	function borderExtent(innerNode, side){
		return (dojo.html.getStyle(innerNode, 'border-' + side + '-style') == 'none' ? 0 : dojo.html.getPixelValue(innerNode, 'border-' + side + '-width'));
	}
	return {
		width: borderExtent(node, 'left') + borderExtent(node, 'right'),
		height: borderExtent(node, 'top') + borderExtent(node, 'bottom')
	};
}

dojo.html.getMarginExtent = function(node, side){
	return dojo.html._sumPixelValues(node, ["margin-" + side], dojo.html.isPositionAbsolute(node));
}

dojo.html.getPaddingExtent = function(node, side){
	return dojo.html._sumPixelValues(node, ["padding-" + side], true);
}

dojo.html.getPadding = function(node){
	return {
		width: dojo.html._sumPixelValues(node, ["padding-left", "padding-right"], true),
		height: dojo.html._sumPixelValues(node, ["padding-top", "padding-bottom"], true)
	};
}

dojo.html.getPadBorder = function(node){
	var pad = dojo.html.getPadding(node);
	var border = dojo.html.getBorder(node);
	return { width: pad.width + border.width, height: pad.height + border.height };
}

dojo.html.boxSizing = {
	MARGIN_BOX: "margin-box",
	BORDER_BOX: "border-box",
	PADDING_BOX: "padding-box",
	CONTENT_BOX: "content-box"
};

dojo.html.getBoxSizing = function(node){
	var h = dojo.render.html;
	var bs = dojo.html.boxSizing;
	if((h.ie)||(h.opera)){ 
		var cm = document["compatMode"];
		if((cm == "BackCompat")||(cm == "QuirksMode")){ 
			return bs.BORDER_BOX; 
		}else{
			return bs.CONTENT_BOX; 
		}
	}else{
		if(arguments.length == 0){ node = document.documentElement; }
		var sizing = dojo.html.getStyle(node, "-moz-box-sizing");
		if(!sizing){ sizing = dojo.html.getStyle(node, "box-sizing"); }
		return (sizing ? sizing : bs.CONTENT_BOX);
	}
}

dojo.html.isBorderBox = function(node){
	return (dojo.html.getBoxSizing(node) == dojo.html.boxSizing.BORDER_BOX);
}

dojo.html.getBorderBox = function(node){
	node = dojo.byId(node);
	return { width: node.offsetWidth, height: node.offsetHeight };
}
dojo.html.getInnerSize = dojo.html.getBorderBox;

dojo.html.getContentBox = function(node){
	node = dojo.byId(node);
	var padborder = dojo.html.getPadBorder(node);
	return {
		width: node.offsetWidth - padborder.width,
		height: node.offsetHeight - padborder.height
	};
}
dojo.html.getContentSize = dojo.html.getContentBox;

dojo.html.setContentBox = function(node, args){
	node = dojo.byId(node);
	var width = 0; var height = 0;
	var isbb = dojo.html.isBorderBox(node);
	var padborder = (isbb ? dojo.html.getPadBorder(node) : { width: 0, height: 0});
	var ret = {};
	if(typeof args.width != undefined){
		if(isbb){
			width = args.width + padborder.width;
		}
		ret.width = dojo.html.setPositivePixelValue(node, "width", width);
	}
	if(typeof args.height != undefined){
		if(isbb){
			height = args.height + padborder.height;
		}
		ret.height = dojo.html.setPositivePixelValue(node, "height", height);
	}
	return ret;
}
dojo.html.setContentSize = dojo.html.setContentBox;

dojo.html.getMarginBox = function(node){
	var borderbox = dojo.html.getBorderBox(node);
	var margin = dojo.html.getMargin(node);
	return { width: borderbox.width + margin.width, height: borderbox.height + margin.height };
}
dojo.html.getOuterSize = dojo.html.getMarginBox;

dojo.html.setMarginBox = function(node, args){
	node = dojo.byId(node);
	var width = 0; var height = 0;
	var isbb = dojo.html.isBorderBox(node);
	var padborder = (isbb ? dojo.html.getPadBorder(node) : { width: 0, height: 0 });
	var margin = dojo.html.getMargin(node);
	var ret = {};
	if(typeof args.width != undefined){
		if(isbb){
			width = args.width - padborder.width;
		}
		width -= margin.width;
		ret.width = dojo.html.setPositivePixelValue(node, "width", width);
	}
	if(typeof args.height != undefined){
		if(isbb){
			height = args.height - padborder.height;
		}
		height -= margin.height;
		ret.height = dojo.html.setPositivePixelValue(node, "height", height);
	}
	return ret;
}
dojo.html.setOuterSize = dojo.html.setMarginBox;

// in: coordinate array [x,y,w,h] or dom node
// return: coordinate object
dojo.html.toCoordinateObject = dojo.html.toCoordinateArray = function(coords, includeScroll) {
	if(coords instanceof Array || typeof coords == "array"){
		// coords is already an array (of format [x,y,w,h]), just return it
		while ( coords.length < 4 ) { coords.push(0); }
		while ( coords.length > 4 ) { coords.pop(); }
		var ret = {
			x: coords[0],
			y: coords[1],
			w: coords[2],
			h: coords[3]
		};
	} else {
		// coords is an dom object (or dom object id); return it's coordinates
		var node = dojo.byId(coords);
		var pos = dojo.html.getAbsolutePosition(node, includeScroll);
		var borderbox = dojo.html.getBorderBox(node);
		var ret = {
			x: pos.x,
			y: pos.y,
			w: borderbox.width,
			h: borderbox.height
		};
	}
	return ret;
}
