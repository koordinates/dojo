dojo.provide("dojo.html.style.size");
dojo.require("dojo.html.style.common");

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
