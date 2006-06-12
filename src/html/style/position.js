dojo.provide("dojo.html.style.position");

dojo.require("dojo.html.common");
dojo.require("dojo.html.style.util");

dojo.html.getAbsolutePosition = dojo.html.abs = function(node, includeScroll){
	node = dojo.byId(node);
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
		var bo = document.getBoxObjectFor(node);
		ret.x = bo.x - dojo.html.sumAncestorProperties(node, "scrollLeft");
		ret.y = bo.y - dojo.html.sumAncestorProperties(node, "scrollTop");
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
				if(window.opera){ nd = db; }
				ret.x -= dojo.html.sumAncestorProperties(nd, "scrollLeft");
				ret.y -= dojo.html.sumAncestorProperties(nd, "scrollTop");
			}
			do{
				var n = node["offsetLeft"];
				ret.x += isNaN(n) ? 0 : n;
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
	dojo.deprecated("dojo.html.getTotalOffset", "replaced by dojo.html.getAbsolutePosition().(top|left)", "0.4");
	return dojo.html.getAbsolutePosition(node, includeScroll)[type];
}

dojo.html.getAbsoluteX = function(node, includeScroll){
	dojo.deprecated("dojo.html.getAbsoluteX", "replaced by dojo.html.getAbsolutePosition().x", "0.4");
	return dojo.html.getAbsolutePosition(node, includeScroll).x;
}

dojo.html.getAbsoluteY = function(node, includeScroll){
	dojo.deprecated("dojo.html.getAbsoluteY", "replaced by dojo.html.getAbsolutePosition().y", "0.4");
	return dojo.html.getAbsolutePosition(node, includeScroll).y;
}

dojo.html.totalOffsetLeft = function(node, includeScroll){
	dojo.deprecated("dojo.html.totalOffsetLeft", "replaced by dojo.html.getAbsolutePosition().left", "0.4");
	return dojo.html.getAbsoluteX(node, includeScroll);
}

dojo.html.totalOffsetTop = function(node, includeScroll){
	dojo.deprecated("dojo.html.totalOffsetTop", "replaced by dojo.html.getAbsolutePosition().top", "0.4");
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

dojo.html.getContentBox = function(node){
	var node = dojo.byId(node);
	var padborder = dojo.html.getPadBorder(node);
	return {
		width: node.offsetWidth - padborder.width,
		height: node.offsetHeight - padborder.height
	};
}

dojo.html.getBorderBox = function(node){
	var node = dojo.byId(node);
	return { width: node.offsetWidth, height: node.offsetHeight };
}

dojo.html.getMarginBox = function(node){
	var borderbox = dojo.html.getBorderBox(node);
	var margin = dojo.html.getMargin(node);
	return { width: borderbox.width + margin.width, height: borderbox.height + margin.height };
}
