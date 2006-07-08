dojo.require("dojo.html");
dojo.provide("dojo.html.extras");
dojo.require("dojo.string.extras"); 

/**
 * Calculates the mouse's direction of gravity relative to the centre
 * of the given node.
 * <p>
 * If you wanted to insert a node into a DOM tree based on the mouse
 * position you might use the following code:
 * <pre>
 * if (gravity(node, e) & gravity.NORTH) { [insert before]; }
 * else { [insert after]; }
 * </pre>
 *
 * @param node The node
 * @param e		The event containing the mouse coordinates
 * @return		 The directions, NORTH or SOUTH and EAST or WEST. These
 *						 are properties of the function.
 */
dojo.html.gravity = function(node, e){
	node = dojo.byId(node);
	var mouse = dojo.html.getCursorPosition(e);

	with (dojo.html) {
		var nodecenterx = getAbsoluteX(node, true) + (getInnerWidth(node) / 2);
		var nodecentery = getAbsoluteY(node, true) + (getInnerHeight(node) / 2);
	}
	
	with (dojo.html.gravity) {
		return ((mouse.x < nodecenterx ? WEST : EAST) |
			(mouse.y < nodecentery ? NORTH : SOUTH));
	}
}

dojo.html.gravity.NORTH = 1;
dojo.html.gravity.SOUTH = 1 << 1;
dojo.html.gravity.EAST = 1 << 2;
dojo.html.gravity.WEST = 1 << 3;


/**
 * Attempts to return the text as it would be rendered, with the line breaks
 * sorted out nicely. Unfinished.
 */
dojo.html.renderedTextContent = function(node){
	node = dojo.byId(node);
	var result = "";
	if (node == null) { return result; }
	for (var i = 0; i < node.childNodes.length; i++) {
		switch (node.childNodes[i].nodeType) {
			case 1: // ELEMENT_NODE
			case 5: // ENTITY_REFERENCE_NODE
				var display = "unknown";
				try {
					display = dojo.style.getStyle(node.childNodes[i], "display");
				} catch(E) {}
				switch (display) {
					case "block": case "list-item": case "run-in":
					case "table": case "table-row-group": case "table-header-group":
					case "table-footer-group": case "table-row": case "table-column-group":
					case "table-column": case "table-cell": case "table-caption":
						// TODO: this shouldn't insert double spaces on aligning blocks
						result += "\n";
						result += dojo.html.renderedTextContent(node.childNodes[i]);
						result += "\n";
						break;
					
					case "none": break;
					
					default:
						if(node.childNodes[i].tagName && node.childNodes[i].tagName.toLowerCase() == "br") {
							result += "\n";
						} else {
							result += dojo.html.renderedTextContent(node.childNodes[i]);
						}
						break;
				}
				break;
			case 3: // TEXT_NODE
			case 2: // ATTRIBUTE_NODE
			case 4: // CDATA_SECTION_NODE
				var text = node.childNodes[i].nodeValue;
				var textTransform = "unknown";
				try {
					textTransform = dojo.style.getStyle(node, "text-transform");
				} catch(E) {}
				switch (textTransform){
					case "capitalize": text = dojo.string.capitalize(text); break;
					case "uppercase": text = text.toUpperCase(); break;
					case "lowercase": text = text.toLowerCase(); break;
					default: break; // leave as is
				}
				// TODO: implement
				switch (textTransform){
					case "nowrap": break;
					case "pre-wrap": break;
					case "pre-line": break;
					case "pre": break; // leave as is
					default:
						// remove whitespace and collapse first space
						text = text.replace(/\s+/, " ");
						if (/\s$/.test(result)) { text.replace(/^\s/, ""); }
						break;
				}
				result += text;
				break;
			default:
				break;
		}
	}
	return result;
}

dojo.html.createNodesFromText = function(txt, trim){
	if(trim) { txt = dojo.string.trim(txt); }

	var tn = dojo.doc().createElement("div");
	// tn.style.display = "none";
	tn.style.visibility= "hidden";
	dojo.body().appendChild(tn);
	var tableType = "none";
	if((/^<t[dh][\s\r\n>]/i).test(dojo.string.trimStart(txt))) {
		txt = "<table><tbody><tr>" + txt + "</tr></tbody></table>";
		tableType = "cell";
	} else if((/^<tr[\s\r\n>]/i).test(dojo.string.trimStart(txt))) {
		txt = "<table><tbody>" + txt + "</tbody></table>";
		tableType = "row";
	} else if((/^<(thead|tbody|tfoot)[\s\r\n>]/i).test(dojo.string.trimStart(txt))) {
		txt = "<table>" + txt + "</table>";
		tableType = "section";
	}
	tn.innerHTML = txt;
	if(tn["normalize"]){
		tn.normalize();
	}

	var parent = null;
	switch(tableType) {
		case "cell":
			parent = tn.getElementsByTagName("tr")[0];
			break;
		case "row":
			parent = tn.getElementsByTagName("tbody")[0];
			break;
		case "section":
			parent = tn.getElementsByTagName("table")[0];
			break;
		default:
			parent = tn;
			break;
	}

	/* this doesn't make much sense, I'm assuming it just meant trim() so wrap was replaced with trim
	if(wrap){ 
		var ret = [];
		// start hack
		var fc = tn.firstChild;
		ret[0] = ((fc.nodeValue == " ")||(fc.nodeValue == "\t")) ? fc.nextSibling : fc;
		// end hack
		// tn.style.display = "none";
		dojo.body().removeChild(tn);
		return ret;
	}
	*/
	var nodes = [];
	for(var x=0; x<parent.childNodes.length; x++){
		nodes.push(parent.childNodes[x].cloneNode(true));
	}
	tn.style.display = "none"; // FIXME: why do we do this?
	dojo.body().removeChild(tn);
	return nodes;
}

/*TODO: make this function have variable call sigs
 *
 * kes(node, ptArray, cornerArray, padding, hasScroll)
 * kes(node, ptX, ptY, cornerA, cornerB, cornerC, paddingArray, hasScroll)
 */

/**
 * Keeps 'node' in the visible area of the screen while trying to
 * place closest to desiredX, desiredY. The input coordinates are
 * expected to be the desired screen position, not accounting for
 * scrolling. If you already accounted for scrolling, set 'hasScroll'
 * to true. Set padding to either a number or array for [paddingX, paddingY]
 * to put some buffer around the element you want to position.
 * Set which corner(s) you want to bind to, such as
 *
 * placeOnScreen(node, desiredX, desiredY, padding, hasScroll, "TR")
 * placeOnScreen(node, [desiredX, desiredY], padding, hasScroll, ["TR", "BL"])
 *
 * The desiredX/desiredY will be treated as the topleft(TL)/topright(TR) or 
 * BottomLeft(BL)/BottomRight(BR) corner of the node. Each corner is tested
 * and if a perfect match is found, it will be used. Otherwise, it goes through
 * all of the specified corners, and choose the most appropriate one.
 * By default, corner = ['TL'].
 * If tryOnly is set to true, the node will not be moved to the place.
 *
 * NOTE: node is assumed to be absolutely or relatively positioned.
 *
 * Alternate call sig:
 *  placeOnScreen(node, [x, y], padding, hasScroll)
 *
 * Examples:
 *  placeOnScreen(node, 100, 200)
 *  placeOnScreen("myId", [800, 623], 5)
 *  placeOnScreen(node, 234, 3284, [2, 5], true)
 */
dojo.html.placeOnScreen = function(node, desiredX, desiredY, padding, hasScroll, corners, tryOnly) {
	if(dojo.lang.isArray(desiredX)) {
		tryOnly = corners;
		corners = hasScroll;
		hasScroll = padding;
		padding = desiredY;
		desiredY = desiredX[1];
		desiredX = desiredX[0];
	}

	if(dojo.lang.isString(corners)){
		corners = corners.split(",");
	}

	if(!isNaN(padding)) {
		padding = [Number(padding), Number(padding)];
	} else if(!dojo.lang.isArray(padding)) {
		padding = [0, 0];
	}

	var scroll = dojo.html.getScrollOffset();
	var view = dojo.html.getViewportSize();

	node = dojo.byId(node);
	var oldDisplay = node.style.display;
	node.style.display="";
	var w = dojo.style.getInnerWidth(node);
	var h = dojo.style.getInnerHeight(node);
	node.style.display=oldDisplay;

	if(!dojo.lang.isArray(corners)){
		corners = ['TL'];
	}

	var bestx, besty, bestDistance = Infinity;

	for(var cidex=0; cidex<corners.length; ++cidex){
		var corner = corners[cidex];
		var match = true;
		tryX = desiredX - (corner.charAt(1)=='L' ? 0 : w) + padding[0] * (corner.charAt(1)=='L' ? 1 : -1);
		tryY = desiredY - (corner.charAt(0)=='T' ? 0 : h) + padding[1] * (corner.charAt(0)=='T' ? 1 : -1);
		if(hasScroll) {
			tryX -= scroll.x;
			tryY -= scroll.y;
		}
	
		var x = tryX + w;
		if(x > view.w) {
			x = view.w - w;
			match = false;
		} else {
			x = tryX;
		}
		x = Math.max(padding[0], x) + scroll.x;
	
		var y = tryY + h;
		if(y > view.h) {
			y = view.h - h;
			match = false;
		} else {
			y = tryY;
		}
		y = Math.max(padding[1], y) + scroll.y;

		if(match){ //perfect match, return now
			bestx = x;
			besty = y;
			break;
		}else{
			//not perfect, find out whether it is better than the saved one
			var dist = Math.pow(x-tryX,2)+Math.pow(y-tryY,2);
			if(bestDistance > dist){
				bestDistance = dist;
				bestx = x;
				besty = y;
			}
		}
	}

	if(!tryOnly){
		node.style.left = bestx + "px";
		node.style.top = besty + "px";
	}

	var ret = [bestx, besty];
	ret.x = bestx;
	ret.y = besty;
	return ret;
}

/**
 * Like placeOnScreenPoint except that it attempts to keep one of the node's
 * corners at desiredX, desiredY.  Favors the bottom right position
 *
 * Examples placing node at mouse position (where e = [Mouse event]):
 *  placeOnScreenPoint(node, e.clientX, e.clientY);
 */
dojo.html.placeOnScreenPoint = function(node, desiredX, desiredY, padding, hasScroll) {
	dojo.deprecated("use dojo.html.placeOnScreen() instead of dojo.html.placeOnScreenPoint()", "0.5");
	return dojo.html.placeOnScreen(node, desiredX, desiredY, padding, hasScroll, ['TL', 'TR', 'BL', 'BR']);
}

/**
 * Like placeOnScreen, except it accepts aroundNode instead of x.y 
 * and attempts to place node around it.
 * aroundCorners specify Which corner of aroundNode should be 
 * used to place the node => which corner(s) of node to use (see the
 * corners parameter in dojo.html.placeOnScreen)
 * aroundCorners: {'TL': 'BL', 'BL': 'TL'}
 */
dojo.html.placeOnScreenAroundElement = function(node, aroundNode, padding, hasScroll, aroundCorners, tryOnly){
	var best, bestDistance=Infinity;
	aroundNode = dojo.byId(aroundNode);
	var oldDisplay = aroundNode.style.display;
	aroundNode.style.display="";
	var aroundNodeW = dojo.style.getOuterWidth(aroundNode);
	var aroundNodeH = dojo.style.getOuterHeight(aroundNode);
	var aroundNodePos = dojo.style.getAbsolutePosition(aroundNode, hasScroll);
	aroundNode.style.display=oldDisplay;

	for(var nodeCorner in aroundCorners){
		var pos, desiredX, desiredY;
		var corners = aroundCorners[nodeCorner];

		desiredX = aroundNodePos.x + (nodeCorner.charAt(1)=='L' ? 0 : aroundNodeW);
		desiredY = aroundNodePos.y + (nodeCorner.charAt(0)=='T' ? 0 : aroundNodeH);

		pos = dojo.html.placeOnScreen(node, desiredX, desiredY, padding, hasScroll, corners, true);
		if(pos.x == desiredX && pos.y == desiredY){
			best = pos;
			break;
		}else{
			//not perfect, find out whether it is better than the saved one
			var dist = Math.pow(pos.x-desiredX,2)+Math.pow(pos.y-desiredY,2);
			if(bestDistance > dist){
				best = pos;
			}
		}
	}

	if(!tryOnly){
		node.style.left = best.x + "px";
		node.style.top = best.y + "px";
	}
	return best;
}

//scrollIntoView in some implementation is broken, use our own
dojo.html.scrollIntoView = function(node){
	// don't rely on that node.scrollIntoView works just because the function is there
	// it doesnt work in Konqueror or Opera even though the function is there and probably
	// not safari either
	// dont like browser sniffs implementations but sometimes you have to use it
	if(dojo.render.html.ie){
		//only call scrollIntoView if there is a scrollbar for this menu,
		//otherwise, scrollIntoView will scroll the window scrollbar
		if(dojo.style.getInnerHeight(node.parentNode) < node.parentNode.scrollHeight){
			node.scrollIntoView(false);
		}
	}else if(dojo.render.html.mozilla){
		// IE, mozilla
		node.scrollIntoView(false);
	}else{
		var parent = node.parentNode;
		var parentBottom = parent.scrollTop + dojo.style.getInnerHeight(parent);
		var nodeBottom = node.offsetTop + dojo.style.getOuterHeight(node);
		if(parentBottom < nodeBottom){
			parent.scrollTop += (nodeBottom - parentBottom);
		}else if(parent.scrollTop > node.offsetTop){
			parent.scrollTop -= (parent.scrollTop - node.offsetTop);
		}
	}
}

// Get the window object where the element is placed in.
dojo.html.getElementWindow = function(element){
	return dojo.html.getDocumentWindow( element.ownerDocument );
}

// Get window object associated with document doc
dojo.html.getDocumentWindow = function(doc){
	// With Safari, there is not wa to retrieve the window from the document, so we must fix it.
	if(dojo.render.html.safari && !doc._parentWindow){
		dojo.html._fixSafariDocumentParentWindow( window.top );
	}

	//In some IE versions (at least 6.0), document.parentWindow does not return a 
	//reference to the real window object (maybe a copy), so we must fix it as well
	if(dojo.render.html.ie && window !== document.parentWindow && !doc._parentWindow){
		/*
		In IE 6, only the variable "window" can be used to connect events (others
		may be only copies). We use IE specific execScript to attach the real window
		reference to document._parentWindow for later use
		*/
		doc.parentWindow.execScript("document._parentWindow = window;", "Javascript");
	}

	return doc._parentWindow || doc.parentWindow || doc.defaultView;
}

/*
	This is a Safari specific function that fix the reference to the parent
	window from the document object.
*/
dojo.html._fixSafariDocumentParentWindow = function( targetWindow ){
	targetWindow.document.parentWindow = targetWindow;
	
	for (var i = 0; i < targetWindow.frames.length; i++){
		dojo.html._fixSafariDocumentParentWindow(targetWindow.frames[i]);
	}
}

/**
 * For IE z-index schenanigans
 * Two possible uses:
 *   1. new dojo.html.BackgroundIframe(node)
 *        Makes a background iframe as a child of node, that fills area (and position) of node
 *
 *   2. new dojo.html.BackgroundIframe()
 *        Attaches frame to dojo.body().  User must call size() to set size.
 */
dojo.html.BackgroundIframe = function(node) {
	if(dojo.render.html.ie55 || dojo.render.html.ie60) {
		var html=
				 "<iframe "
				+"style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;"
				+        "z-index: -1; filter:Alpha(Opacity=\"0\");' "
				+">";
		this.iframe = dojo.doc().createElement(html);
		this.iframe.tabIndex = -1; // Magic to prevent iframe from getting focus on tab keypress - as style didnt work.
		if(node){
			node.appendChild(this.iframe);
			this.domNode=node;
		}else{
			dojo.body().appendChild(this.iframe);
			this.iframe.style.display="none";
		}
	}
}
dojo.lang.extend(dojo.html.BackgroundIframe, {
	iframe: null,

	// TODO: this function shouldn't be necessary but setting width=height=100% doesn't work!
	onResized: function(){
		if(this.iframe && this.domNode && this.domNode.parentElement){ // No parentElement if onResized() timeout event occurs on a removed domnode
			var w = dojo.style.getOuterWidth(this.domNode);
			var h = dojo.style.getOuterHeight(this.domNode);
			if (w  == 0 || h == 0 ){
				dojo.lang.setTimeout(this, this.onResized, 50);
				return;
			}
			var s = this.iframe.style;
			s.width = w + "px";
			s.height = h + "px";
		}
	},

	// Call this function if the iframe is connected to dojo.body() rather
	// than the node being shadowed (TODO: erase)
	size: function(node) {
		if(!this.iframe) { return; }

		var coords = dojo.style.toCoordinateArray(node, true);

		var s = this.iframe.style;
		s.width = coords.w + "px";
		s.height = coords.h + "px";
		s.left = coords.x + "px";
		s.top = coords.y + "px";
	},

	setZIndex: function(node /* or number */) {
		if(!this.iframe) { return; }

		if(dojo.dom.isNode(node)) {
			this.iframe.style.zIndex = dojo.html.getStyle(node, "z-index") - 1;
		} else if(!isNaN(node)) {
			this.iframe.style.zIndex = node;
		}
	},

	show: function() {
		if(!this.iframe) { return; }
		this.iframe.style.display = "block";
	},

	hide: function() {
		if(!this.ie) { return; }
		var s = this.iframe.style;
		s.display = "none";
	},

	remove: function() {
		dojo.dom.removeNode(this.iframe);
	}
});
