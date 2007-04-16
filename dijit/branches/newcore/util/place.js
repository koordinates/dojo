dojo.provide("dijit.util.place");

// ported from dojo.html.util

dijit.util.placeOnScreen = function(
	/* HTMLElement */node,
	/* integer */desiredX,
	/* integer */desiredY,
	/* integer */padding,
	/* boolean? */hasScroll,
	/* string? */corners,
	/* boolean? */tryOnly){
	//	summary
	//	Keeps 'node' in the visible area of the screen while trying to
	//	place closest to desiredX, desiredY. The input coordinates are
	//	expected to be the desired screen position, not accounting for
	//	scrolling. If you already accounted for scrolling, set 'hasScroll'
	//	to true. Set padding to either a number or array for [paddingX, paddingY]
	//	to put some buffer around the element you want to position.
	//	Set which corner(s) you want to bind to, such as
	//
	//	placeOnScreen(node, desiredX, desiredY, padding, hasScroll, "TR")
	//	placeOnScreen(node, [desiredX, desiredY], padding, hasScroll, ["TR", "BL"])
	//
	//	The desiredX/desiredY will be treated as the topleft(TL)/topright(TR) or
	//	BottomLeft(BL)/BottomRight(BR) corner of the node. Each corner is tested
	//	and if a perfect match is found, it will be used. Otherwise, it goes through
	//	all of the specified corners, and choose the most appropriate one.
	//	By default, corner = ['TL'].
	//	If tryOnly is set to true, the node will not be moved to the place.
	//
	//	NOTE: node is assumed to be absolutely or relatively positioned.
	//
	//	Alternate call sig:
	//	 placeOnScreen(node, [x, y], padding, hasScroll)
	//
	//	Examples:
	//	 placeOnScreen(node, 100, 200)
	//	 placeOnScreen("myId", [800, 623], 5)
	//	 placeOnScreen(node, 234, 3284, [2, 5], true)

	// TODO: make this function have variable call sigs
	//	kes(node, ptArray, cornerArray, padding, hasScroll)
	//	kes(node, ptX, ptY, cornerA, cornerB, cornerC, paddingArray, hasScroll)
	if(desiredX instanceof Array || typeof desiredX == "array") {
		tryOnly = corners;
		corners = hasScroll;
		hasScroll = padding;
		padding = desiredY;
		desiredY = desiredX[1];
		desiredX = desiredX[0];
	}

	if(corners instanceof String || typeof corners == "string"){
		corners = corners.split(",");
	}

	if(!isNaN(padding)) {
		padding = [Number(padding), Number(padding)];
	} else if(!(padding instanceof Array || typeof padding == "array")) {
		padding = [0, 0];
	}

	var scroll = dojo.html.getScroll().offset;
	var view = dojo.html.getViewport();

	node = dojo.byId(node);
	var oldDisplay = node.style.display;
	node.style.display="";
	var bb = dojo.html.getBorderBox(node);
	var w = bb.width;
	var h = bb.height;
	node.style.display=oldDisplay;

	if(!(corners instanceof Array || typeof corners == "array")){
		corners = ['TL'];
	}

	var bestx, besty, bestDistance = Infinity, bestCorner;

	for(var cidex=0; cidex<corners.length; ++cidex){
		var corner = corners[cidex];
		var match = true;
		var tryX = desiredX - (corner.charAt(1)=='L' ? 0 : w) + padding[0]*(corner.charAt(1)=='L' ? 1 : -1);
		var tryY = desiredY - (corner.charAt(0)=='T' ? 0 : h) + padding[1]*(corner.charAt(0)=='T' ? 1 : -1);
		if(hasScroll) {
			tryX -= scroll.x;
			tryY -= scroll.y;
		}

		if(tryX < 0){
			tryX = 0;
			match = false;
		}

		if(tryY < 0){
			tryY = 0;
			match = false;
		}

		var x = tryX + w;
		if(x > view.width) {
			x = view.width - w;
			match = false;
		} else {
			x = tryX;
		}
		x = Math.max(padding[0], x) + scroll.x;

		var y = tryY + h;
		if(y > view.height) {
			y = view.height - h;
			match = false;
		} else {
			y = tryY;
		}
		y = Math.max(padding[1], y) + scroll.y;

		if(match){ //perfect match, return now
			bestx = x;
			besty = y;
			bestDistance = 0;
			bestCorner = corner;
			break;
		}else{
			//not perfect, find out whether it is better than the saved one
			var dist = Math.pow(x-tryX-scroll.x,2)+Math.pow(y-tryY-scroll.y,2);
			if(bestDistance > dist){
				bestDistance = dist;
				bestx = x;
				besty = y;
				bestCorner = corner;
			}
		}
	}

	if(!tryOnly){
		node.style.left = bestx + "px";
		node.style.top = besty + "px";
	}

	return {left: bestx, top: besty, x: bestx, y: besty, dist: bestDistance, corner:  bestCorner};	//	object
}

dijit.util.placeOnScreenAroundElement = function(
	/* HTMLElement */node,
	/* HTMLElement */aroundNode,
	/* integer */padding,
	/* string? */aroundType,
	/* string? */aroundCorners,
	/* boolean? */tryOnly){
	//	summary
	//	Like placeOnScreen, except it accepts aroundNode instead of x,y
	//	and attempts to place node around it. aroundType (see
	//	dojo.html.boxSizing in html/layout.js) determines which box of the
	//	aroundNode should be used to calculate the outer box.
	//	aroundCorners specify Which corner of aroundNode should be
	//	used to place the node => which corner(s) of node to use (see the
	//	corners parameter in dojo.html.placeOnScreen)
	//	aroundCorners: {'TL': 'BL', 'BL': 'TL'}

	var best, bestDistance=Infinity;
	aroundNode = dojo.byId(aroundNode);
	var oldDisplay = aroundNode.style.display;
	aroundNode.style.display="";
	var mb = dojo.html.getElementBox(aroundNode, aroundType);
	var aroundNodeW = mb.width;
	var aroundNodeH = mb.height;
	var aroundNodePos = dojo.html.getAbsolutePosition(aroundNode, true, aroundType);
	aroundNode.style.display=oldDisplay;

	for(var nodeCorner in aroundCorners){
		var pos, desiredX, desiredY;
		var corners = aroundCorners[nodeCorner];

		desiredX = aroundNodePos.x + (nodeCorner.charAt(1)=='L' ? 0 : aroundNodeW);
		desiredY = aroundNodePos.y + (nodeCorner.charAt(0)=='T' ? 0 : aroundNodeH);

		pos = dijit.util.placeOnScreen(node, desiredX, desiredY, padding, true, corners, true);
		if(pos.dist == 0){
			best = pos;
			break;
		}else{
			//not perfect, find out whether it is better than the saved one
			if(bestDistance > pos.dist){
				bestDistance = pos.dist;
				best = pos;
			}
		}
	}

	if(!tryOnly){
		node.style.left = best.left + "px";
		node.style.top = best.top + "px";
	}
	return best;	//	object
}
