dojo.provide("dijit._base.scroll");

// NOTE: Duplicates logic in core
// NOTE: Needs review and refactoring (e.g. directional quirks)
// NOTE: Remove host object augmentation (evil)

dijit.scrollIntoView = function(/* DomNode */node){
	// summary:
	//		Scroll the passed node into view, if it is not.

	node = dojo.byId(node);
	var body = dojo.body();
	var html = body.parentNode;

	// NOTE: Reportedly a problem with this method

	if(dojo.isHostMethod(node, 'scrollIntoView')){
		node.scrollIntoView(false); // short-circuit if possible
		return;
	}

	// NOTE: these next two appear mutually exclusive

	var ltr = dojo._isBodyLtr();
	var rtl = !(ltr || (dojo.isReallyIE8 && !dojo.isQuirks)); // IE8 mostly flips everything transparently (except border)
	var scrollRoot = body;

	if(html.clientWidth){
		// body client values already OK
		html._offsetWidth = html._clientWidth = body._offsetWidth = body.clientWidth;
		html._offsetHeight = html._clientHeight = body._offsetHeight = body.clientHeight;
	}else{		
		scrollRoot = html;		
		html._offsetHeight = html.clientHeight;
		html._offsetWidth  = html.clientWidth;
	}

	function addPseudoAttrs(element){
		var parent = element.parentNode;
		var offsetParent = element.offsetParent;
		if(!offsetParent){ // position:fixed has no real offsetParent
			offsetParent = html; // prevents exeptions
			parent = (element == body)? html : null;
		}
		// all the V/H object members below are to reuse code for both directions
		element._offsetParent = offsetParent;
		element._parent = parent;
		var bp = dojo._getBorderExtents(element);
		element._borderStart = { H:bp.l, V:bp.t };
		element._borderSize = { H:bp.w, V:bp.h };
		element._offsetStart = { H:element.offsetLeft, V:element.offsetTop };
		element._scrolledAmount = { H:element.scrollLeft, V:element.scrollTop };
		element._offsetSize = { H: element._offsetWidth||element.offsetWidth, V: element._offsetHeight||element.offsetHeight };
		element._clientSize = { H:element._clientWidth||element.clientWidth, V:element._clientHeight||element.clientHeight };
		if(element != body && element != html && element != node){
			for(var dir in element._offsetSize){ // for both x and y directions
				if (dojo.isOwnProperty(element._offsetSize, dir)) {
					var scrollBarSize = element._offsetSize[dir] - element._clientSize[dir] - element._borderSize[dir];
					var hasScrollBar = element._clientSize[dir] > 0 && scrollBarSize > 0; // can't check for a specific scrollbar size since it changes dramatically as you zoom

					if(hasScrollBar){
						element._offsetSize[dir] -= scrollBarSize;
						if(rtl && dir=="H"){ element._offsetStart[dir] += scrollBarSize; }
					}
				}
			}
		}
	}

	var element = node;
	while(element){

		// NOTE: removed call to scrollIntoView method (unreachable)

		addPseudoAttrs(element);
		element = element._parent;
	}
	if(node._parent){ // if no parent, then offsetParent._borderStart may not tbe set
		var offsetParent = node._offsetParent;
		node._offsetStart.H += offsetParent._borderStart.H;
		node._offsetStart.V += offsetParent._borderStart.V;
	}
	if(scrollRoot == html && rtl && body._offsetStart && !body._offsetStart.H){
		var scroll = html.scrollWidth - html._offsetSize.H;
		if(scroll > 0){
			body._offsetStart.H = -scroll;
		}
	}

	// eliminate offsetLeft/Top oddities by tweaking scroll for ease of computation

	if(rtl && body._offsetStart && scrollRoot == html && html._scrolledAmount){
		var ofs = body._offsetStart.H;
		if(ofs < 0){
			html._scrolledAmount.H += ofs;
			body._offsetStart.H = 0;
		}
	}
	element = node;
	while(element){
		var parent = element._parent;
		if(!parent){ break; }
			if(parent.tagName == "TD"){
				var table = parent._parent._parent._parent; // point to TABLE
				if(parent != element._offsetParent && parent._offsetParent != element._offsetParent){
					parent = table; // child of TD has the same offsetParent as TABLE, so skip TD, TR, and TBODY (ie. verticalslider)
				}
			}
			// check if this node and its parent share the same offsetParent

			var relative = element._offsetParent == parent;

			for(var dir in element._offsetStart){ // for both x and y directions
				if (dojo.isOwnProperty(element._offsetStart, dir)) {
					var scrollFlipped = false;

					if(rtl && dir=="H" && (parent != html) && (parent != body) && parent._clientSize.H > 0 && parent.scrollWidth > parent._clientSize.H){ // scroll starts on the right
						var delta = parent.scrollWidth - parent._clientSize.H;

						if(delta > 0){
							parent._scrolledAmount.H -= delta;
							scrollFlipped = true;
						} // match FF3 which has negative scrollLeft values
					}
					if(parent._offsetParent.tagName == "TABLE"){ // make it consistent
						parent._offsetStart[dir] -= parent._offsetParent._borderStart[dir];
						parent._borderStart[dir] = parent._borderSize[dir] = 0;					
					}

					parent._offsetStart[dir] += parent._offsetParent._borderStart[dir];

					// underflow = visible gap between parent and this node taking scrolling into account
					// if negative, part of the node is obscured by the parent's beginning and should be scrolled to become visible

					var underflow = element._offsetStart[dir] - parent._scrolledAmount[dir] - (relative? 0 : parent._offsetStart[dir]) - parent._borderStart[dir];

					// if overflow is positive, number of pixels obscured by the parent's end

					var overflow = underflow + element._offsetSize[dir] - parent._offsetSize[dir] + parent._borderSize[dir];

					var scrollAttr = (dir=="H")? "scrollLeft" : "scrollTop";

					// see if we should scroll forward or backward

					var reverse = dir=="H" && rtl; // flip everything
					var underflowScroll = reverse? -overflow : underflow;
					var overflowScroll = reverse? -underflow : overflow;

					// don't scroll if the over/underflow signs are opposite since that means that
					// the node extends beyond parent's boundary in both/neither directions

					var scrollAmount = (underflowScroll*overflowScroll <= 0)? 0 : Math[(underflowScroll < 0)? "max" : "min"](underflowScroll, overflowScroll);
					if(scrollAmount){
						parent[scrollAttr] += (reverse)? -scrollAmount : scrollAmount; // actually perform the scroll
					}
					if(relative){
						element._offsetStart[dir] += parent._offsetStart[dir];
					}
					element._offsetStart[dir] -= parent[scrollAttr];
				}
			}
			element._parent = parent._parent;
			element._offsetParent = parent._offsetParent;
	}
	parent = node;
	var next;
	while(parent && parent.removeAttribute){
		next = parent.parentNode;
		parent.removeAttribute('_offsetParent');
		parent.removeAttribute('_parent');
		parent = next;
	}
};

dojo.provided("dijit._base.scroll");