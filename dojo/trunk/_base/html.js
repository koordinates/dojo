dojo.require("dojo._base.lang");
dojo.provide("dojo._base.html");

// FIXME: need to add unit tests for all the semi-public methods

try{
	document.execCommand("BackgroundImageCache", false, true);
}catch(e){
	// sane browsers don't have cache "issues"
}

// =============================
// DOM Functions
// =============================

dojo.createElement = function(obj, parent, position){
	// TODO: need to finish this!
}

if(dojo.isIE && (dojo.isIE < 7) ){ //  || dojo.isOpera){
	dojo.byId = function(/*String*/id, /*DocumentElement*/doc){
		// summary:
		// 		similar to other library's "$" function, takes a
		// 		string representing a DOM id or a DomNode and
		// 		returns the corresponding DomNode. If a Node is
		// 		passed, this function is a no-op. Returns a
		// 		single DOM node or null, working around several
		// 		browser-specific bugs to do so.
		// id: DOM id or DOM Node
		// doc:
		//		optional, defaults to the current value of
		//		dojo.doc.  Can be used to retreive
		//		node references from other documents.
		if(dojo.isString(id)){
			var _d = (doc||dojo.doc);
			var te = _d.getElementById(id);
			if((te) && (te.id == id)){
				return te;
			}else{
				var eles = _d.all[id];
				if(!eles){ return; }
				if(!eles.length){ return eles; }
				// if more than 1, choose first with the correct id
				var i=0;
				while(te=eles[i++]){
					if(te.id == id){ return te; }
				}
			}
		}else{
			return id; // DomNode
		}
	}
}else{
	dojo.byId = function(/*String*/id, /*DocumentElement*/doc){
		// summary:
		// 		similar to other library's "$" function, takes a
		// 		string representing a DOM id or a DomNode and
		// 		returns the corresponding DomNode. If a Node is
		// 		passed, this function is a no-op. Returns a
		// 		single DOM node or null, working around several
		// 		browser-specific bugs to do so.
		// id: DOM id or DOM Node
		// doc:
		//		optional, defaults to the current value of
		//		dojo.doc.  Can be used to retreive
		//		node references from other documents.
		if(dojo.isString(id)){
			return (doc||dojo.doc).getElementById(id);
		}else{
			return id; // DomNode
		}
	}
}

(function(){
	var _insertBefore = function(/*Node*/node, /*Node*/ref){
		ref.parentNode.insertBefore(node, ref);
		return true;	//	boolean
	}

	var _insertAfter = function(/*Node*/node, /*Node*/ref){
		//	summary:
		//		Try to insert node after ref
		var pn = ref.parentNode;
		if(ref == pn.lastChild){
			pn.appendChild(node);
		}else{
			return _insertBefore(node, ref.nextSibling);	//	boolean
		}
		return true;	//	boolean
	}

	dojo.place = function(/*DOMNode*/node, /*DOMNode*/refNode, /*String|Number*/position){
		//	summary:
		//		attempt to insert node in relation to ref based on position

		// FIXME: need to write tests for this!!!!
		if((!node)||(!refNode)||(!position)){ 
			return false;	//	boolean 
		}
		if(typeof position == "number"){
			var cn = refNode.childNodes;
			if(((position == 0)&&(cn.length == 0)) ||
				(cn.length == position)){
				refNode.appendChild(node); return true;
			}
			if(position == 0){
				return _insertBefore(node, refNode.firstChild);
			}
			return _insertAfter(node, cn[position-1]);
		}
		switch(position.toLowerCase()){
			case "before":
				return _insertBefore(node, refNode);	//	boolean
			case "after":
				return _insertAfter(node, refNode);		//	boolean
			case "first":
				if(refNode.firstChild){
					return _insertBefore(node, refNode.firstChild);	//	boolean
				}else{
					refNode.appendChild(node);
					return true;	//	boolean
				}
				break;
			default: // aka: last
				refNode.appendChild(node);
				return true;	//	boolean
		}
	}

	// Box functions will assume this model.
	// On IE/Opera, BORDER_BOX will be set if the primary document is in quirks mode.
	// Can be set to change behavior of box setters.
	
	// can be either:
	//	"border-box"
	//	"content-box" (default)
	dojo.boxModel = "content-box";

	// We punt per-node box mode testing completely.
	// If anybody cares, we can provide an additional (optional) unit 
	// that overrides existing code to include per-node box sensitivity.

	// Opera documentation claims that Opera 9 uses border-box in BackCompat mode.
	// but experiments (Opera 9.10.8679 on Windows Vista) indicate that it actually continues to use content-box.
	// IIRC, earlier versions of Opera did in fact use border-box.
	// Opera guys, this is really confusing. Opera being broken in quirks mode is not our fault.

	if(dojo.isIE /*|| dojo.isOpera*/){
		var _dcm = document.compatMode;
		// client code may have to adjust if compatMode varies across iframes
		dojo.boxModel = (_dcm=="BackCompat")||(_dcm=="QuirksMode")||(dojo.isIE<6) ? "border-box" : "content-box";
	}

	// =============================
	// Style Functions
	// =============================
	
	// getComputedStyle drives most of the style code.
	// Wherever possible, reuse the returned object.
	//
	// API functions below that need to access computed styles accept an 
	// optional computedStyle parameter.
	//
	// If this parameter is omitted, the functions will call getComputedStyle themselves.
	//
	// This way, calling code can access computedStyle once, and then pass the reference to 
	// multiple API functions. 
	if(!dojo.isIE){
		// non-IE branch
		var dv = document.defaultView;
		dojo.getComputedStyle = ((dojo.isSafari) ? function(node){
				var s = dv.getComputedStyle(node, null);
				if(!s){ 
					node.style.display = ""; 
					s = dv.getComputedStyle(node, null);
				}
				return s;
			} : function(node){
				return dv.getComputedStyle(node, null);
			}
		);

		dojo._toPixelValue = function(element, value){
			// style values can be floats, client code may want
			// to round for integer pixels.
			return (parseFloat(value) || 0); 
		}
	}else{
		// IE branch
		dojo.getComputedStyle = function(node){
			return node.currentStyle;
		}

		dojo._toPixelValue = function(element, avalue){
			if(!avalue){return 0;}
			// style values can be floats, client code may
			// want to round this value for integer pixels.
			if(avalue.slice&&(avalue.slice(-2)=='px')){ return parseFloat(avalue); }
			with(element){
				var sLeft = style.left;
				var rsLeft = runtimeStyle.left;
				runtimeStyle.left = currentStyle.left;
				try{
					// 'avalue' may be incompatible with style.left, which can cause IE to throw
					// this has been observed for border widths using "thin", "medium", "thick" constants
					// those particular constants could be trapped by a lookup
					// but perhaps there are more
					style.left = avalue;
					avalue = style.pixelLeft;
				}catch(e){
					avalue = 0;
				}
				style.left = sLeft;
				runtimeStyle.left = rsLeft;
			}
			return avalue;
		}
	}

	// FIXME: there opacity quirks on FF that we haven't ported over. Hrm.

	dojo._getOpacity = ((dojo.isIE) ? function(node){
			try{
				return (node.filters.alpha.opacity / 100);
			}catch(e){
				return 1;
			}
		} : function(node){
			// FIXME: should we get using the computedStyle of the node?
			return node.style.opacity;
		}
	);

	dojo._setOpacity = ((dojo.isIE) ? function(node, opacity){
			var o = "Alpha(Opacity="+(opacity*100)+")";
			node.style.filter = o;
			if(node.nodeName.toLowerCase == "tr"){
				dojo.query("> td", node).forEach(function(i){
					i.style.filter = o;
				});
			}
			return opacity;
		} : function(node, opacity){
			node.style.opacity = opacity;
		}
	);

	var _t = true;
	var _f = false;
	var _pixelNamesCache = {
		width: _t, height: _t, left: _t, top: _t
	};
	var _toStyleValue = function(node, type, value){
		if(_pixelNamesCache[type] === true){
			return dojo._toPixelValue(node, value)
		}else if(_pixelNamesCache[type] === false){
			return value;
		}else{
			type = type.toLowerCase();
			if(
				(type.indexOf("margin") >= 0) ||
				// (type.indexOf("border") >= 0) ||
				(type.indexOf("padding") >= 0) ||
				(type.indexOf("width") >= 0) ||
				(type.indexOf("height") >= 0) ||
				(type.indexOf("max") >= 0) ||
				(type.indexOf("min") >= 0) ||
				(type.indexOf("offset") >= 0)
			){
				_pixelNamesCache[type] = true;
				return dojo._toPixelValue(node, value)
			}else{
				_pixelNamesCache[type] = false;
				return value;
			}
		}
	}

	// public API
	
	dojo.style = function(){
		var _a = arguments;
		var _a_l = _a.length;
		if(!_a_l){ return; }
		var node = dojo.byId(_a[0]);
		var io = ((dojo.isIE)&&(_a[1] == "opacity"));
		if(_a_l == 3){
			return (io) ? dojo._setOpacity(node, _a[2]) : node.style[_a[1]] = _a[2];
		}
		var s = dojo.getComputedStyle(node);
		if(_a_l == 1){ return s; }
		if(_a_l == 2){
			return (io) ? dojo._getOpacity(node) : _toStyleValue(node, _a[1], s[_a[1]]);
		}
	}

	// =============================
	// Box Functions
	// =============================

	dojo._getPadBounds = function(n, computedStyle){
		// Returns special values specifically useful 
		// for node fitting.
		// l, t = left and top padding
		// w = the total of the left and right padding 
		// h = the total of the top and bottom padding
		// If 'node' has position, l/t forms the origin for child nodes. 
		// The w/h are used for calculating boxes.
		// Normally application code will not need to invoke this directly,
		// and will use the ...box... functions instead.
		var 
			s=computedStyle||this.getComputedStyle(n), 
			px=dojo._toPixelValue,
			l=px(n, s.paddingLeft), 
			t=px(n, s.paddingTop);
		return { 
			l: l,
			t: t,
			w: l+px(n, s.paddingRight),
			h: t+px(n, s.paddingBottom)
		};
	}
	
	dojo._getPadBorderExtents = function(n, computedStyle){
		// w = the total of the left/right padding and left/right border
		// h = the total of the top/bottom padding and top/bottom border
		// The w/h are used for calculating boxes.
		// Normally application code will not need to invoke this directly,
		// and will use the ...box... functions instead.
		var 
			s=computedStyle||this.getComputedStyle(n), 
			px=dojo._toPixelValue, 
			p=dojo._getPadBounds(n, s),
			bw=(s.borderLeftStyle!='none' ? px(n, s.borderLeftWidth) : 0) + (s.borderRightStyle!='none' ? px(n, s.borderRightWidth) : 0),
			bh=(s.borderTopStyle!='none' ? px(n, s.borderTopWidth) : 0) + (s.borderBottomStyle!='none' ? px(n, s.borderBottomWidth) : 0);
		return { 
			w: p.w + bw,
			h: p.h + bh
		};
	}

	dojo._getMarginExtents = function(n, computedStyle){
		var 
			s=computedStyle||this.getComputedStyle(n), 
			px=dojo._toPixelValue;
		return { 
			w: px(n, s.marginLeft)+px(n, s.marginRight),
			h: px(n, s.marginTop)+px(n, s.marginBottom)
		};
	}

	// Box getters work in any box context because offsetWidth/clientWidth
	// are invariant wrt box context
	//
	// They do *not* work for display: inline objects that have padding styles
	// because the user agent ignores padding (it's bogus styling in any case)
	//
	// Be careful with IMGs because they are inline or block depending on 
	// browser and browser mode.
		
	dojo._getMarginBox = function(node, computedStyle){
		var mb=dojo._getMarginExtents(node, computedStyle);
		return { l:0, t:0, w: node.offsetWidth + mb.w, h: node.offsetHeight + mb.h };
	}
	
	dojo._getContentBox = function(node, computedStyle){
		var pb=dojo._getPadBounds(node, computedStyle);
		return { l: pb.l, t: pb.t, w: node.clientWidth - pb.w, h: node.clientHeight - pb.h };
	}
	
	dojo._setBox = function(node, l, t, w, h, u){
		u = u || "px";
		with(node.style){
			if(!isNaN(l)){ left = l+u; }
			if(!isNaN(t)){ top = t+u; }
			if(w>=0){ width = w+u; }
			if(h>=0){ height = h+u; }
		}
	}

	// Box setters depend on box context because interpretation of width/height styles
	// vary wrt box context.
	//
	// The value of dojo.boxModel is used to determine box context.
	// dojo.boxModel can be set directly to change behavior.
	//
	// Beware of display: inline objects that have padding styles
	// because the user agent ignores padding (it's a bogus setup anyway)
	//
	// Be careful with IMGs because they are inline or block depending on 
	// browser and browser mode.
	
	dojo._setContentBox = function(node, leftPx, topPx, widthPx, heightPx, computedStyle){
		if(dojo.boxModel == "border-box"){
			var pb = dojo._getPadBorderExtents(node, computedStyle);
			if(widthPx>=0){ widthPx += pb.w; }
			if(heightPx>=0){ heightPx += pb.h; }
		}
		dojo._setBox(node, leftPx, topPx, widthPx, heightPx);
	}

	dojo._nilExtents = { w: 0, h: 0 };

	dojo._setMarginBox = function(node, leftPx, topPx, widthPx, heightPx, computedStyle){
		var s = computedStyle || dojo.getComputedStyle(node);
		var pb = ((dojo.boxModel == "border-box") ? dojo._nilExtents : dojo._getPadBorderExtents(node, s));
		var mb = dojo._getMarginExtents(node, s);
		if(widthPx>=0){
			widthPx = Math.max(widthPx - pb.w - mb.w, 0);
		}
		if(heightPx>=0){
			heightPx = Math.max(heightPx - pb.h - mb.h, 0);
		}
		dojo._setBox(node, leftPx, topPx, widthPx, heightPx);
	}

	// public API
	
	dojo.marginBox = function(node, boxObj){
		node = dojo.byId(node);
		var s = dojo.getComputedStyle(node), b=boxObj;
		return !b ? dojo._getMarginBox(node, s) : dojo._setMarginBox(node, b.l, b.t, b.w, b.h, s);
	}

	dojo.contentBox = function(node, boxObj){
		node = dojo.byId(node);
		var s = dojo.getComputedStyle(node), b=boxObj;
		return !b ? dojo._getContentBox(node, s) : dojo._setContentBox(node, b.l, b.t, b.w, b.h, s);
	}
	
	// =============================
	// Positioning 
	// =============================
	
	var _sumAncestorProperties = function(node, prop){
		if(!node){ return 0; } // FIXME: throw an error?
		var _b = dojo.body();
		var retVal = 0;
		while(node){
			try{
				if(dojo.getComputedStyle(node).position == "fixed"){
					return 0;
				}
			}catch(e){}
			var val = node[prop];
			if(val){
				retVal += val - 0;
				// opera and khtml #body & #html has the same values, we only
				// need one value
				if(node == _b){ break; }
			}
			node = node.parentNode;
		}
		return retVal;	//	integer
	}

	dojo._docScroll = function(){
		var _b = dojo.body();
		var _w = dojo.global;
		var de = dojo.doc.documentElement;
		return {
			y: (_w.pageYOffset || de.scrollTop || _b.scrollTop || 0),
			x: (_w.pageXOffset || de.scrollLeft || _b.scrollLeft || 0)
		};
	};

	// IE version and quirks dependent. ugg.
	var _d_off = ((dojo.isIE >= 7)&&(dojo.boxModel != "border-box")) ? 2 : 0; 
	dojo._abs = function(/*HTMLElement*/node, /*boolean?*/includeScroll){
		//	summary
		//		Gets the absolute position of the passed element based on the
		//		document itself.

		// FIXME: need to decide in the brave-new-world if we're going to be
		// margin-box or border-box.
		var ownerDocument = dojo.doc;
		var ret = {
			x: 0,
			y: 0
		};

		// targetBoxType == "border-box"
		var db = dojo.body();

		if(dojo.isIE){
			with(node.getBoundingClientRect()){
				ret.x = left-_d_off;
				ret.y = top-_d_off;
			}
		}else if(ownerDocument["getBoxObjectFor"]){
			// mozilla
			var bo = ownerDocument.getBoxObjectFor(node);
			ret.x = bo.x - _sumAncestorProperties(node, "scrollLeft");
			ret.y = bo.y - _sumAncestorProperties(node, "scrollTop");
		}else{
			if(node["offsetParent"]){
				var endNode;
				// in Safari, if the node is an absolutely positioned child of
				// the body and the body has a margin the offset of the child
				// and the body contain the body's margins, so we need to end
				// at the body
				if(	(dojo.isSafari) &&
					(node.style.getPropertyValue("position") == "absolute") &&
					(node.parentNode == db)){
					endNode = db;
				}else{
					endNode = db.parentNode;
				}

				if(node.parentNode != db){
					var nd = node;
					if(dojo.isOpera){ nd = db; }
					ret.x -= _sumAncestorProperties(nd, "scrollLeft");
					ret.y -= _sumAncestorProperties(nd, "scrollTop");
				}
				var curnode = node;
				do{
					var n = curnode["offsetLeft"];
					//FIXME: ugly hack to workaround the submenu in 
					//popupmenu2 does not shown up correctly in opera. 
					//Someone have a better workaround?
					if(!dojo.isOpera || n>0){
						ret.x += isNaN(n) ? 0 : n;
					}
					var m = curnode["offsetTop"];
					ret.y += isNaN(m) ? 0 : m;
					curnode = curnode.offsetParent;
				}while((curnode != endNode)&&(curnode != null));
			}else if(node["x"]&&node["y"]){
				ret.x += isNaN(node.x) ? 0 : node.x;
				ret.y += isNaN(node.y) ? 0 : node.y;
			}
		}

		// account for document scrolling!
		if(includeScroll){
			var scroll = dojo._docScroll();
			ret.y += scroll.y;
			ret.x += scroll.x;
		}

		/*
		// FIXME
		var _getMarginExtents = function(node, s){
			var px = _getPixelizer(node);
			return { 
				w: px(s.marginLeft) + px(s.marginRight),
				h: px(s.marginTop) + px(s.marginBottom)
			};
		}

		var _getMarginBox = function(node, computedStyle){
			var mb = _getMarginExtents(node, computedStyle);
			return {
				w: node.offsetWidth + mb.w, 
				h: node.offsetHeight + mb.h
			};
		}

		var extentFuncArray=[dojo.html.getPaddingExtent, dojo.html.getBorderExtent, dojo.html.getMarginExtent];
		if(nativeBoxType > targetBoxType){
			for(var i=targetBoxType;i<nativeBoxType;++i){
				ret.y += extentFuncArray[i](node, 'top');
				ret.x += extentFuncArray[i](node, 'left');
			}
		}else if(nativeBoxType < targetBoxType){
			for(var i=targetBoxType;i>nativeBoxType;--i){
				ret.y -= extentFuncArray[i-1](node, 'top');
				ret.x -= extentFuncArray[i-1](node, 'left');
			}
		}
		*/
		// ret.t = ret.y;
		// ret.l = ret.x;
		return ret;	//	object
	}

	// FIXME: need a setter for coords or a moveTo!!
	dojo.coords = function(node, includeScroll){
		node = dojo.byId(node);
		var s = dojo.getComputedStyle(node);
		var mb = dojo._getMarginBox(node, s);
		var abs = dojo._abs(node, includeScroll);
		mb.x = abs.x;
		mb.y = abs.y;
		return mb;
	}
})();

// =============================
// (CSS) Class Functions
// =============================

dojo.hasClass = function(/*HTMLElement*/node, /*String*/classStr){
	//	summary:
	//		Returns whether or not the specified classes are a portion of the
	//		class list currently applied to the node. 
	// return (new RegExp('(^|\\s+)'+classStr+'(\\s+|$)')).test(node.className)	// Boolean
	return ((" "+node.className+" ").indexOf(" "+classStr+" ") >= 0);  // Boolean
}

dojo.addClass = function(/*HTMLElement*/node, /*String*/classStr){
	//	summary:
	//		Adds the specified classes to the end of the class list on the
	//		passed node.
	if(!dojo.hasClass(node, classStr)){
		node.className = node.className + (node.className ? ' ' : '') + classStr;
	}
}

dojo.removeClass = function(/*HTMLElement*/node, /*String*/classStr){
	//	summary: Removes classes from node.
	node.className = node.className.replace(new RegExp('(^|\\s+)'+classStr+'(\\s+|$)'), "$1$2");
}
