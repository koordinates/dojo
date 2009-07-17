dojo.provide("dojo._base.html");

// FIXME: need to add unit tests for all the semi-public methods

if (dojo.isHostMethod(dojo._getWin().document, 'execCommand')) {
	try {
		dojo._getWin().document.execCommand("BackgroundImageCache", false, true);
	} catch(e) {
	}
}

// =============================
// DOM Functions
// =============================

/*=====
dojo.byId = function(id, doc){
	//	summary:
	//		Returns DOM node with matching `id` attribute or `null` 
	//		if not found, similar to "$" function in another library.
	//		If `id` is a DomNode, this function is a no-op.
	//
	//	id: String|DOMNode
	//	 	A string to match an HTML id attribute or a reference to a DOM Node
	//
	//	doc: Document?
	//		Document to work in. Defaults to the current value of
	//		dojo.doc.  Can be used to retrieve
	//		node references from other documents.
	// 
	//	example:
	//	Look up a node by ID:
	//	| var n = dojo.byId("foo");
	//
	//	example:
	//	Check if a node exists.
	//	|	if(dojo.byId("bar")){ ... }
	//
	//	example:
	//	Allow string or DomNode references to be passed to a custom function:
	//	| var foo = function(nodeOrId){ 
	//	|	nodeOrId = dojo.byId(nodeOrId); 
	//	|	// ... more stuff
	//	| }
=====*/

	dojo.byId = function(id, doc){
		if(typeof id == 'string'){
			var _d = doc || dojo.doc;
			var te = _d.getElementById(id);

			return (te && te.id == id) ? te : null;                
		}
		return id; // DomNode
	};

(function(){
	var byId = dojo.byId;

	dojo.isDescendant = function(/*DomNode|String*/node, /*DomNode|String*/ancestor){
		//	summary:
		//		Returns true if node is a descendant of ancestor
		//	node: string id or node reference to test
		//	ancestor: string id or node reference of potential parent to test against

		node = byId(node);
		ancestor = byId(ancestor);
		while(node){
			if(node === ancestor){
				return true; // Boolean
			}
			node = node.parentNode;
		}

		return false; // Boolean
	};

	var html = dojo._getWin().document.documentElement;

	dojo.setSelectable = (function() {
		var i, style, selectStyles = ['MozUserSelect', 'KhtmlUserSelect', 'OUserSelect', 'userSelect'];

		var fn = function(node, selectable) {
			node = byId(node);
			node.style[style] = selectable ? "auto" : "none";
		};

		for (i = selectStyles.length; i--;) {
			style = selectStyles[i];
			if(typeof html.style[style] == 'string'){
				return fn;
			}
		}

		return function(node, selectable) {
			var v = (selectable ? "" : "on");

			node = byId(node);
			node.unselectable = v;
			dojo.query("*", node).forEach(function(item) { item.unselectable = v; });
		};
	})();

	var _insertBefore = function(/*DomNode*/node, /*DomNode*/ref){
		var parent = ref.parentNode;
		if(parent){
			parent.insertBefore(node, ref);
		}
	};

	var _insertAfter = function(/*DomNode*/node, /*DomNode*/ref){
		//	summary:
		//		Try to insert node after ref
		var parent = ref.parentNode;
		if(parent){
			if(parent.lastChild == ref){
				parent.appendChild(node);
			}else{
				parent.insertBefore(node, ref.nextSibling);
			}
		}
	};

	dojo.place = function(node, refNode, position){
		//	summary:
		//		Attempt to insert node into the DOM, choosing from various positioning options.
		//		Returns true if successful, false otherwise.
		//
		//	node: String|DomNode
		//		id or node reference, or HTML fragment starting with "<" to place relative to refNode
		//
		//	refNode: String|DomNode
		//		id or node reference to use as basis for placement
		//
		//	position: String|Number?
		//		string noting the position of node relative to refNode or a
		//		number indicating the location in the childNodes collection of refNode. 
		//		Accepted string values are:
		//	|	* before
		//	|	* after
		//	|	* replace
		//	|	* only
		//	|	* first
		//	|	* last
		//		"first" and "last" indicate positions as children of refNode, "replace" replaces refNode,
		//		"only" replaces all children.  position defaults to "last" if not specified
		//
		//	returns: DomNode
		//		Returned values is the first argument resolved to a DOM node.
		//
		//		.place() is also a method of `dojo.NodeList`, allowing `dojo.query` node lookups.
		// 
		// example:
		// Place a node by string id as the last child of another node by string id:
		// | 	dojo.place("someNode", "anotherNode");
		//
		// example:
		// Place a node by string id before another node by string id
		// | 	dojo.place("someNode", "anotherNode", "before");
		//
		// example:
		// Create a Node, and place it in the body element (last child):
		// | 	dojo.place(dojo.create('div'), dojo.body());
		//
		// example:
		// Put a new LI as the first child of a list by id:
		// | 	dojo.place(dojo.create('li'), "someUl", "first");

		refNode = byId(refNode);
		if(typeof node == 'string'){
			node = node.charAt(0) == "<" ? dojo._toDom(node, refNode.ownerDocument) : byId(node);
		}
		if(typeof position == "number"){
			var cn = refNode.childNodes;
			if(!cn.length || cn.length <= position){
				refNode.appendChild(node);
			}else{
				_insertBefore(node, cn[position < 0 ? 0 : position]);
			}
		}else{
			switch(position){
			case "before":
				_insertBefore(node, refNode);
				break;
			case "after":
				_insertAfter(node, refNode);
				break;
			case "replace":
				refNode.parentNode.replaceChild(node, refNode);
				break; 
			case "only":
				dojo.empty(refNode);
				refNode.appendChild(node);
				break;
			case "first":
				if(refNode.firstChild){
					_insertBefore(node, refNode.firstChild);
					break;
				}
				refNode.appendChild(node);
				break;
			default: // aka: last
				refNode.appendChild(node);
			}
		}
		return node; // DomNode
	};

	// Box functions will assume this model.
	// BORDER_BOX will be set if the primary document is in IE quirks mode.
	
	// can be either:
	//	"border-box"
	//	"content-box" (default)

	// TODO: boxModel property is no longer used internally;
	//       should be deprecated

	dojo.boxModel = "content-box";
	if (dojo._getWin().document.documentElement.clientWidth === 0) {
		// client code may have to adjust if compatMode varies across iframes
		dojo.boxModel =  "border-box";
	}

	// =============================
	// Style Functions
	// =============================
	
	// getComputedStyle drives most of the style code.
	// Wherever possible, reuse the returned object.
	//
	// API functions below that need to access computed styles accept an 
	// optional computedStyle parameter.
	// If this parameter is omitted, the functions will call getComputedStyle themselves.
	// This way, calling code can access computedStyle once, and then pass the reference to 
	// multiple API functions. 

/*=====
	dojo.getComputedStyle = function(node){
		//	summary:
		//		Returns a "computed style" object.
		//
		//	description:
		//		Gets a "computed style" object which can be used to gather
		//		information about the current state of the rendered node. 
		//
		//		Note that this may behave differently on different browsers.
		//		Values may have different formats and value encodings across
		//		browsers.
		//
		//		Note also that this method is expensive.  Wherever possible,
		//		reuse the returned object.
		//
		//		Use the dojo.style() method for more consistent (pixelized)
		//		return values.
		//
		//	node: DOMNode
		//		A reference to a DOM node. Does NOT support taking an
		//		ID string for speed reasons.
		//	example:
		//	|	dojo.getComputedStyle(byId('foo')).borderWidth;
		//
		//	example:
		//	Reusing the returned object, avoiding multiple lookups:
		//	|	var cs = dojo.getComputedStyle(byId("someNode"));
		//	|	var w = cs.width, h = cs.height;
		return; // CSS2Properties
	}
=====*/

	// Although we normally eschew argument validation at this
	// level, here we test argument 'node' for (duck)type.
	// Argument node must also implement Element.  (Note: we check
	// against HTMLElement rather than Element for interop with prototype.js)
	// Because 'document' is the 'parentNode' of 'body'
	// it is frequently sent to this function even 
	// though it is not Element.
	var gcs;
		
	if (typeof html.ownerDocument != 'undefined' && typeof html.ownerDocument.DefaultView != 'undefined'){
		gcs = function(/*DomNode*/node){
			var cs;
			if(node.nodeType == 1){
				var dv = node.ownerDocument.defaultView;
				cs = dv.getComputedStyle(node, null);
				
				if(!cs && node.style.display == 'none'){ 
					node.style.display = ""; // Works if inline display style is 'none'
					cs = dv.getComputedStyle(node, null);
				}
			}
			return cs || {};
		};		
	}
	else if (typeof html.currentStyle != 'undefined'){ // Only know agents to go this route are IE

		// IMPORTANT: this returns a cascaded rather than a computed style.

		gcs = function(node){
			return node.nodeType == 1 /* ELEMENT_NODE*/ ? node.currentStyle : {};
		};
	} else { // In future, this branch should be removed (obscures important information about the environment.)
		gcs = function(node) {
			return {};
		};
	}

	dojo.getComputedStyle = gcs;

	var px;

	if (typeof html.runtimeStyle == 'undefined') {
		px = function(element, value){
			return parseFloat(value); 
		};
	} else {
		px = function(element, avalue, nohack) {
			if (avalue) {
				if(/px$/i.test(avalue)){
					return parseFloat(avalue);
				}
				if(/^0/.test(avalue)){
					return 0;
				}
				if (!nohack && /^(-)?[\d\.]+(em|pt)$/i.test(avalue)) { // TODO: other units appropriate for this?
					var sLeft = element.style.left;
					var rsLeft = element.runtimeStyle.left;
					element.runtimeStyle.left = element.currentStyle.left;
					element.style.left = avalue;
					avalue = element.style.pixelLeft;
					element.style.left = sLeft;
					element.runtimeStyle.left = rsLeft;
					return avalue;
				}
			}
			return NaN;
		};
	}

	// Preserved temporarily (in case others call this internal method)

	dojo._toPixelValue = function(node, value) {
		return px(node, value) || 0;
	};

	dojo.getStylePixels = function(node, style, computedStyle) {
		return px(node, (computedStyle || gcs(node))[style], true); // No hack
	};

	var opacityStyles = ['KhtmlOpacity', 'MozOpacity', 'opacity'];

	/*=====
	dojo._getOpacity = function(node){
			//	summary:
			//		Returns the current opacity of the passed node as a
			//		floating-point value between 0 and 1.
			//	node: DomNode
			//		a reference to a DOM node. Does NOT support taking an
			//		ID string for speed reasons.
			//	returns: Number between 0 and 1
			return; // Number
	}
	=====*/

	dojo._getOpacity = (function(el) {
	        var i, s, reOpacity = new RegExp('opacity=([^\\)]*)', 'i');

		var fn = function(el) {
        	      var o = el.style[s] || gcs(el)[s];
	              if (o) { return parseFloat(o); }
        	      return 1;
		};

	        if (typeof html.style.filter == 'string') {
        	  return (function() {
	            var m;
        	    if (html.filters) {
	              return function(el) {
        	        return (typeof el.filters.alpha != 'undefined' && el.filters.alpha.enabled)?el.filters.alpha.opacity / 100:1;
	              };
        	    }				
	            return function(el) {
        	      m = el.style.filter.match(reOpacity);
	              return (m)?parseFloat(m[1]) / 100:1;
        	    };				
	          })();
	        }

	        i = opacityStyles.length;
	        while (i--) {
        	  if (typeof el.style[opacityStyles[i]] == 'string') {
	            s = opacityStyles[i];
        	    return fn;
	          }
        	}
	})(html);

	/*=====
	dojo._setOpacity = function(node, opacity){
			//	summary:
			//		set the opacity of the passed node portably. Returns the
			//		new opacity of the node.
			//	node: DOMNode
			//		a reference to a DOM node. Does NOT support taking an
			//		ID string for performance reasons.
			//	opacity: Number
			//		A Number between 0 and 1. 0 specifies transparent.
			//	returns: Number between 0 and 1
			return; // Number
	}
	=====*/

	dojo._setOpacity = (function(el) { 
	        var i, s, so;
	        var reOpacity = new RegExp('alpha\\(opacity=[^\\)]+\\)', 'i');
		var fn = function(el, o) {
			el.style[s] = String(o ? Math.max(o, 0.0001) : 0);
		};

	        i = opacityStyles.length;
        	while (i--) {
	          if (typeof el.style[opacityStyles[i]] == 'string') {
        	    s = opacityStyles[i];
	            return fn;
        	  }
	        }

	        if (typeof el.style.filter == 'string') {
        	  return function(el, o) {
	            so = el.style;
        	    if (so.filter.indexOf('alpha(opacity=') == -1) {
	              so.filter += ' alpha(opacity=' + (o * 100) + ')';
        	    }
	            else {
        	      so.filter = so.filter.replace(reOpacity, (o >= 0.9999)?'':'alpha(opacity=' + (o * 100) + ')');
	            }
        	  };
	        }
	})(html);

	var _pixelNamesCache = {
		left: true, top: true
	};
	var _pixelRegExp = /^(margin|padding|width|height|max|min|offset)$/;  // |border
	var _toStyleValue = function(node, type, value){
		type = type.toLowerCase(); // TODO: Document that lowercase is required

		if(value == "auto" && typeof node.offsetHeight == 'number'){
			// FIXME: Inconsistent across box models

			if(type == "height"){ return node.offsetHeight; }
			if(type == "width"){ return node.offsetWidth; }
		}
		if(type == "fontweight" && typeof value == 'number'){
			return value >= 700 ? "bold" : "normal";
		}

		if(!_pixelNamesCache[type]){
			_pixelNamesCache[type] = _pixelRegExp.test(type);
		}
		return _pixelNamesCache[type] ? px(node, value) || 0 : value;
	};

	// TODO: Aliases should be deprecated, apps should pass 'float'

	var _floatStyle = typeof html.style.styleFloat == 'string' ? "styleFloat" : "cssFloat",
		_floatAliases = { "cssFloat": _floatStyle, "styleFloat": _floatStyle, "float": _floatStyle };

	html = null;
	
	// public API
	
	dojo.style = function(	/*DomNode|String*/ node, 
				/*String?|Object?*/ style, 
				/*String?*/ value){
		//	summary:
		//		Accesses styles on a node. If 2 arguments are
		//		passed, acts as a getter. If 3 arguments are passed, acts
		//		as a setter.
		//	description:
		//		Getting the style value uses the computed style for the node, so the value
		//		will be a calculated value, not just the immediate node.style value.
		//		Also when getting values, use specific style names,
		//		like "borderBottomWidth" instead of "border" since compound values like
		//		"border" are not necessarily reflected as expected.
		//		If you want to get node dimensions, use dojo.marginBox() or
		//		dojo.contentBox(). 
		//	node:
		//		id or reference to node to get/set style for
		//	style:
		//		the style property to set in DOM-accessor format
		//		("borderWidth", not "border-width") or an object with key/value
		//		pairs suitable for setting each property.
		//	value:
		//		If passed, sets value on the node for style, handling
		//		cross-browser concerns.  When setting a pixel value,
		//		be sure to include "px" in the value. For instance, top: "200px".
		//		Otherwise, in some cases, some browsers will not apply the style.
		//	example:
		//		Passing only an ID or node returns the computed style object of
		//		the node:
		//	|	dojo.style("thinger");
		//	example:
		//		Passing a node and a style property returns the current
		//		normalized, computed value for that property:
		//	|	44:58 PM 6/8/2009("thinger", "opacity"); // 1 by default
		//
		//	example:
		//		Passing a node, a style property, and a value changes the
		//		current display of the node and returns the new computed value
		//	|	dojo.style("thinger", "opacity", 0.5); // == 0.5
		//
		//	example:
		//		Passing a node, an object-style style property sets each of the values in turn and returns the computed style object of the node:
		//	|	dojo.style("thinger", {
		//	|		"opacity": 0.5,
		//	|		"border": "3px solid black",
		//	|		"height": "300px"
		//	|	});
		//
		// 	example:
		//		When the CSS style property is hyphenated, the JavaScript property is camelCased.
		//		font-size becomes fontSize, and so on.
		//	|	dojo.style("thinger",{
		//	|		fontSize:"14pt",
		//	|		letterSpacing:"1.2em"
		//	|	});
		//
		//	example:
		//		dojo.NodeList implements .style() using the same syntax, omitting the "node" parameter, calling
		//		dojo.style() on every element of the list. See: dojo.query and dojo.NodeList
		//	|	dojo.query(".someClassName").style("visibility","hidden");
		//	|	// or
		//	|	dojo.query("#baz > div").style({
		//	|		opacity:0.75,
		//	|		fontSize:"13pt"
		//	|	});

		var n = byId(node), args = arguments.length, op = (style == "opacity"), prop, s;
		
		style = _floatAliases[style] || style;

		// Opacity

		if (op) {
			if(args == 3){
				return dojo._setOpacity(n, value);
			}
			return dojo._getOpacity(n);
		}

		if (args == 3) {

			// Set

			n.style[style] = value; /*Number*/
			return value;
		} else if(args == 2 && typeof style != 'string'){

			// Multiple sets

			for(var x in style){

				// For-in filter duplicated from dojo.isOwnProperty for performance (avoids document re-flows)
				// NOTE: JSLint wrongly flags this pattern as unfiltered

				prop = style.constructor.prototype[x];
				if (typeof prop == 'undefined' || prop !== style[x]) {
					if (x == 'opacity') {
						dojo._setOpacity(n, style[x]);
					} else {
						n.style[x] = style[x];
					}
				}
			}
			return style;
		}

		// Get

		s = gcs(n);
		return (args == 1) ? s : _toStyleValue(n, style, s[style] || n.style[style]); /* CSS2Properties||String||Number */
	};

	// Feature testing for box and positioning functions

	var offsetIncludesBorder, scrollerOffsetSubtractsBorder;

	dojo.addOnLoad(function() {
		var doc = dojo._getWin().document;
		var body = doc.body;
		var divInner = doc.createElement('div');
		var divOuter = doc.createElement('div');
		var style = dojo.style;

		// Opera oddity

		offsetIncludesBorder = (function() {
			var b;

			style(divOuter, {position:'absolute', visibility:'hidden', left:'0', top:'0', padding:'0', border:'solid 1px'});
			style(divInner, {position:'absolute', left:'0', top:'0', margin:'0'});
			divOuter.appendChild(divInner);
			body.appendChild(divOuter);
			b = (divInner.offsetLeft == 1);
			body.removeChild(divOuter);
			divOuter.removeChild(divInner);
			return b;
		})();

		// As seen in FF

		scrollerOffsetSubtractsBorder = (function() {
			var b;
			style(divOuter, {position:'absolute', visibility:'hidden', left:'0', top:'0', padding:'0', border:'solid 1px black', 'overflow':'auto'});
			style(divInner, {position:'static', left:'0', top:'0'});
			divOuter.appendChild(divInner);
			body.appendChild(divOuter);
			b = (divInner.offsetLeft == -1);
			body.removeChild(divOuter);
			divOuter.removeChild(divInner);
			return b;
		})();

		doc = divInner = divOuter = body = null;
	});

	// =============================
	// Box Functions
	// =============================

	dojo._getPadExtents = function(/*DomNode*/n, /*Object*/computedStyle){
		//	summary:
		// 		Returns object with special values specifically useful for node
		// 		fitting.
		//
		// 		* l/t = left/top padding (respectively)
		// 		* w = the total of the left and right padding 
		// 		* h = the total of the top and bottom padding
		//
		//		If 'node' has position, l/t forms the origin for child nodes. 
		//		The w/h are used for calculating boxes.
		//		Normally application code will not need to invoke this
		//		directly, and will use the ...box... functions instead.
		var s = computedStyle||gcs(n),
			l = px(n, s.paddingLeft) || 0,
			t = px(n, s.paddingTop) || 0;

		return { 
			l: l,
			t: t,
			w: l + (px(n, s.paddingRight) || 0),
			h: t + (px(n, s.paddingBottom) || 0)
		};
	};

	dojo._getBorderExtents = function(/*DomNode*/n, /*Object*/computedStyle){
		//	summary:
		//		returns an object with properties useful for noting the border
		//		dimensions.
		//
		// 		* l/t = the sum of left/top border (respectively)
		//		* w = the sum of the left and right border
		//		* h = the sum of the top and bottom border
		//
		//		The w/h are used for calculating boxes.
		//		Normally application code will not need to invoke this
		//		directly, and will use the ...box... functions instead.
		var s = computedStyle||gcs(n),
			clientLeft = n.clientLeft || 0,
			clientTop = n.clientTop || 0,
			bl = px(n, s.borderLeftWidth) || clientLeft || 0,
			bt = px(n, s.borderTopWidth) || clientTop || 0;

		// FIXME: Assumes border symmetry when right and/or bottom cannot be computed

		return { 
			l: bl,
			t: bt,
			w: bl + (px(n, s.borderRightWidth) || clientLeft),
			h: bt + (px(n, s.borderBottomWidth) || clientTop)
		};
	};

	dojo._getPadBorderExtents = function(/*DomNode*/n, /*Object*/computedStyle){
		//	summary:
		//		Returns object with properties useful for box fitting with
		//		regards to padding.
		//
		//		* l/t = the sum of left/top padding and left/top border (respectively)
		//		* w = the sum of the left and right padding and border
		//		* h = the sum of the top and bottom padding and border
		//
		//		The w/h are used for calculating boxes.
		//		Normally application code will not need to invoke this
		//		directly, and will use the ...box... functions instead.
		var 
			s = computedStyle||gcs(n), 
			p = dojo._getPadExtents(n, s),
			b = dojo._getBorderExtents(n, s);
		return { 
			l: p.l + b.l,
			t: p.t + b.t,
			w: p.w + b.w,
			h: p.h + b.h
		};
	};

	dojo._getMarginExtents = function(n, computedStyle){
		//	summary:
		//		returns object with properties useful for box fitting with
		//		regards to box margins (i.e., the outer-box).
		//
		//		* l/t = marginLeft, marginTop, respectively
		//		* w = total width, margin inclusive
		//		* h = total height, margin inclusive
		//
		//		The w/h are used for calculating boxes.
		//		Normally application code will not need to invoke this
		//		directly, and will use the ...box... functions instead.
		var 
			s = computedStyle||gcs(n),
			l = px(n, s.marginLeft) || 0,
			t = px(n, s.marginTop) || 0;

			// FIXME: Safari's version of the computed right margin
			// is the space between our right edge and the right edge 
			// of our offsetParent. 
			// What we are looking for is the actual margin value as 
			// determined by CSS.

			// FIXED: Likely not valid at this time
			//        Need feature test in any event
		return { 
			l: l,
			t: t,
			w: l + (px(n, s.marginRight) || 0),
			h: t + (px(n, s.marginBottom) || 0)
		};
	};

	// Box getters work in any box context because offsetWidth/clientWidth
	// are invariant wrt box context
	//
	// They do *not* work for display: inline objects that have padding styles
	// because the user agent ignores padding (it's bogus styling in any case)
	//
	// Be careful with IMGs because they are inline or block depending on 
	// browser and browser mode.
	
	dojo._getMarginBox = function(/*DomNode*/node, /*Object*/computedStyle){
		// summary:
		//		returns an object that encodes the width, height, left and top
		//		positions of the node's margin box.
		var me = dojo._getMarginExtents(node, computedStyle);
		var l = node.offsetLeft - me.l, t = node.offsetTop - me.t, p = node.parentNode;

		if(scrollerOffsetSubtractsBorder){
			// If offsetParent has a computed overflow != visible, the offsetLeft is decreased
			// by the parent's border.

			if(p && p.nodeType == 1){
				var pcs = gcs(p);
				if(pcs.overflow != "visible"){
					var be = dojo._getBorderExtents(p, pcs);
					l += be.l;
					t += be.t;
				}
			}
		} else if(offsetIncludesBorder){
			if(p){
				be = dojo._getBorderExtents(p);
				l -= be.l;
				t -= be.t;
			}
		}
		return { 
			l: l, 
			t: t, 
			w: node.offsetWidth + me.w, 
			h: node.offsetHeight + me.h 
		};
	};
	
	dojo._getContentBox = function(node, computedStyle, ignorePadding){
		// summary:
		//		Returns an object that encodes the width, height, left and top
		//		positions of the node's content box, irrespective of the
		//		current box model.

		var ow = node.offsetWidth, oh = node.offsetHeight;
		var cw = node.clientWidth, ch = node.clientHeight;
		var left, top, paddingHeight, paddingWidth, style;

		left = top = paddingHeight = paddingWidth = 0;

		if (!ignorePadding) {
			 style = node.style;

			// Preserve inline styles

			var paddingStyle = style.padding;
			var paddingLeftStyle = style.paddingLeft;
			var paddingTopStyle = style.paddingTop;

			// Measure left and top padding

			style.paddingLeft = style.paddingTop = '0';
			left = ow - node.offsetWidth;
			top = oh - node.offsetHeight;

			// Measure padding width and height

			style.padding = '0';
			paddingWidth = ow - node.offsetWidth;
			paddingHeight = oh - node.offsetHeight;

			// Restore inline styles

			style.paddingLeft = paddingLeftStyle;
			style.paddingTop = paddingTopStyle;
			style.paddingStyle = paddingStyle;
		}

		return { 
			l: left, 
			t: top, 
			w: cw - paddingWidth, 
			h: ch - paddingHeight
		};
	};

	dojo._getBorderBox = function(node, computedStyle){
		// TODO: should just return client* properties
		//       need to look into history of these methods

		return dojo._getContentBox(node, computedStyle, true);
	};

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
	// 
	// Elements other than DIV may have special quirks, like built-in
	// margins or padding, or values not detectable via computedStyle.
	// In particular, margins on TABLE do not seems to appear 
	// at all in computedStyle on Mozilla.
	
	dojo._setBox = function(/*DomNode*/node, /*Number?*/l, /*Number?*/t, /*Number?*/w, /*Number?*/h, /*String?*/u){
		//	summary:
		//		sets width/height/left/top in the current (native) box-model
		//		dimentions. Uses the unit passed in u.
		//	node: DOM Node reference. Id string not supported for performance reasons.
		//	l: optional. left offset from parent.
		//	t: optional. top offset from parent.
		//	w: optional. width in current box model.
		//	h: optional. width in current box model.
		//	u: optional. unit measure to use for other measures. Defaults to "px".
		u = u || "px";
		var s = node.style;
		if(!isNaN(l)){ s.left = l + u; }
		if(!isNaN(t)){ s.top = t + u; }
		if(w >= 0){ s.width = w + u; }
		if(h >= 0){ s.height = h + u; }
	};

	var htmlOffsetsOrigin;

	if (typeof dojo._getWin().document.documentElementgetBoundingClientRect != 'undefined') {
	        (function(html) {
			var m = dojo._getMarginExtents(html);
			var rect = html.getBoundingClientRect();

			if ((m[0] || m[1]) && (rect.top == m.t && rect.left == m.l)) { // FF3
				htmlOffsetsOrigin = function(docNode) {
					var html = docNode.documentElement;
					var margins = dojo._getMarginExtents(html);
					var borders = dojo._getBorderExtents(html);

					return { t: margins.t + borders.t, l: margins.l + borders.l };
				};
			}
		})(dojo._getWin().document.documentElement);
	}

	var pxUnit = 'px';
	
	dojo._setContentSize = function(/*DomNode*/node, /*Number*/widthPx, /*Number*/heightPx, /*Object*/computedStyle){
		//	summary:
		//		Sets the size of the node's contents, irrespective of
		//		padding, or borders.

		var borderBoxCheck, style = node.style, offsetWidth = node.offsetWidth, offsetHeight = node.offsetHeight;
		var borderStyle = style.border, paddingStyle = style.padding;
		var deltaHeight, deltaWidth;



		// TODO: configuration setting to disable box model check

		// Preserve inline styles

		style.border = style.padding = '0';

		// Check if borders or padding exists
		// If not, box model doesn't matter

		if (offsetWidth != node.offsetWidth || offsetHeight != node.offsetHeight) {
			borderBoxCheck = true;
			deltaWidth = offsetWidth - node.offsetWidth;
			deltaHeight = offsetHeight - node.offsetHeight;
		}

		// Restore inline styles

		style.border = borderStyle;
		style.padding = paddingStyle;

		// Set style dimensions

		style.width = widthPx + pxUnit;
		style.height = heightPx + pxUnit;

		// If box model matters and border-box is in use

		if (borderBoxCheck && node.offsetWidth == widthPx) {

			// Adjust dimensions for border-box

			style.width = (widthPx + deltaWidth) + pxUnit;
			style.height = (heightPx + deltaHeight) + pxUnit;
		}
		
	};

	dojo._setMarginBox = function(/*DomNode*/node, 	/*Number?*/leftPx, /*Number?*/topPx, /*Number?*/widthPx, /*Number?*/heightPx, /*Object*/computedStyle){
		//	summary:
		//		sets the size of the node's margin box and placement
		//		(left/top), irrespective of box model. Think of it as a
		//		passthrough to dojo._setBox that handles box-model vagaries for
		//		you.

		var cs = computedStyle || gcs(node);
		var oldHeightPx, oldWidthPx;
		var marginWidth = (px(node, cs.marginLeft) || 0) + (px(node, cs.marginRight) || 0);
		var marginHeight = (px(node, cs.marginTop) || 0) + (px(node, cs.marginBottom) || 0);
		var borderBoxCheck, style = node.style, offsetWidth = node.offsetWidth, offsetHeight = node.offsetHeight;
		var borderStyle = style.border, paddingStyle = style.padding;
		var deltaHeight = 0, deltaWidth = 0;

		widthPx = widthPx - marginWidth;
		heightPx = heightPx - marginHeight;

		// TODO: configuration setting to disable box model check

		// Preserve inline styles

		style.border = style.padding = '0';

		// Check if borders or padding exists
		// If not, box model doesn't matter

		if (offsetWidth != node.offsetWidth || offsetHeight != node.offsetHeight) {
			borderBoxCheck = true;
			deltaWidth = offsetWidth - node.offsetWidth;
			deltaHeight = offsetHeight - node.offsetHeight;
		}

		// Restore inline styles

		style.border = borderStyle;
		style.padding = paddingStyle;

		oldWidthPx = widthPx;
		oldHeightPx = heightPx;

		widthPx = Math.max(widthPx - deltaWidth, 0);
		heightPx = Math.max(heightPx - deltaHeight, 0);

		style.left = leftPx + pxUnit;
		style.top = topPx + pxUnit;
		style.width = widthPx + pxUnit;
		style.height = heightPx + pxUnit;

		// If box model matters and border-box is in use

		if (borderBoxCheck && node.offsetWidth == widthPx) {

			// Adjust dimensions for border-box

			style.width = Math.max(oldWidthPx + deltaWidth, 0) + pxUnit;
			style.height = Math.max(oldHeightPx + deltaHeight, 0) + pxUnit;
		}
	};

	// public API
	
	dojo.marginBox = function(/*DomNode|String*/node, /*Object?*/box){
		//	summary:
		//		Getter/setter for the margin-box of node.
		//	description: 
		//		Returns an object in the expected format of box (regardless
		//		if box is passed). The object might look like:
		//			`{ l: 50, t: 200, w: 300: h: 150 }`
		//		for a node offset from its parent 50px to the left, 200px from
		//		the top with a margin width of 300px and a margin-height of
		//		150px.
		//	node:
		//		id or reference to DOM Node to get/set box for
		//	box:
		//		If passed, denotes that dojo.marginBox() should
		//		update/set the margin box for node. Box is an object in the
		//		above format. All properties are optional if passed.
		var n = byId(node), s = gcs(n), b = box;
		return !b ? dojo._getMarginBox(n, s) : dojo._setMarginBox(n, b.l, b.t, b.w, b.h, s); // Object
	};

	dojo.contentBox = function(/*DomNode|String*/node, /*Object?*/box){
		//	summary:
		//		Getter/setter for the content-box of node.
		//	description:
		//		Returns an object in the expected format of box (regardless if box is passed).
		//		The object might look like:
		//			`{ l: 50, t: 200, w: 300: h: 150 }`
		//		for a node offset from its parent 50px to the left, 200px from
		//		the top with a content width of 300px and a content-height of
		//		150px. Note that the content box may have a much larger border
		//		or margin box, depending on the box model currently in use and
		//		CSS values set/inherited for node.
		//	node:
		//		id or reference to DOM Node to get/set box for
		//	box:
		//		If passed, denotes that dojo.contentBox() should
		//		update/set the content box for node. Box is an object in the
		//		above format. All properties are optional if passed.
		var n = byId(node), s = gcs(n), b = box;
		return !b ? dojo._getContentBox(n, s) : dojo._setContentSize(n, b.w, b.h, s); // Object
	};
	
	// =============================
	// Positioning 
	// =============================
	
	var _sumAncestorProperties = function(node, prop){
		if(!(node = (node||0).parentNode)){return 0;}
		var val, retVal = 0, _b = dojo.body();
		while(node && node.style){
			if(gcs(node).position == "fixed"){
				return 0;
			}
			val = node[prop];
			if(val){
				retVal += val - 0;
				// opera and khtml #body & #html has the same values, we only
				// need one value
				if(node == _b){ break; }
			}
			node = node.parentNode;
		}
		return retVal;	//	integer
	};

	dojo._docScroll = function(){
		var 
			_b = dojo.body(),
			_w = dojo.global,
			de = dojo.doc.documentElement;
		return {
			y: (_w.pageYOffset || de.scrollTop || _b.scrollTop || 0),
			x: (_w.pageXOffset || dojo._fixBiDiScrollLeft(de.scrollLeft) || _b.scrollLeft || 0)
		};
	};
	
	dojo._isBodyLtr = function(){
		//FIXME: could check body attributes instead (or?) of computed style?  need to ignore case, accept empty values
		if (typeof dojo._bodyLtr == 'undefined') {
			var dir = gcs(dojo.body()).direction;
			if (dir) {
				dojo._bodyLtr = /ltr/.test(dir); // Boolean
			} else {
				dojo._bodyLtr = false;
			}
		}
		return dojo._bodyLtr;
	};
	
	dojo._fixBiDiScrollLeft = function(/*Integer*/ scrollLeft){
		// In RTL direction, scrollLeft should be a negative value, but IE 
		// returns a positive one. All codes using documentElement.scrollLeft
		// must call this function to fix this error, otherwise the position
		// will offset to right when there is a horizontal scrollbar.

		var dd = dojo.doc;
		var de = typeof dd.documentElement.clientWidth ? dd.documentElement : dd.body;
		if(!dojo._isBodyLtr()){
			return scrollLeft + de.clientWidth - de.scrollWidth; // Integer
		}
		return scrollLeft; // Integer
	};

	dojo._abs = function(/*DomNode*/node, /*Boolean?*/includeScroll){
		//	summary:
		//		Gets the position of the passed element relative to
		//		the viewport (if includeScroll==false), or relative to the
		//		document root (if includeScroll==true).
		//
		//		Returns an object of the form:
		//			{ x: 100, y: 300 }
		//		if includeScroll is passed, the x and y values will include any
		//		document offsets that may affect the position relative to the
		//		viewport.

		var client, cs, db = dojo.doc.body, dh = dojo.doc.documentElement, ret, scroll;
		if(typeof node.getBoundingClientRect != 'undefined'){

			// IE6+, FF3+, super-modern WebKit, and Opera 9.6+ all take this branch

			client = node.getBoundingClientRect();
			ret = { x: client.left, y: client.top };
			cs = gcs(dh);

			var root = dh.clientWidth === 0 ? db : dh;

			if(htmlOffsetsOrigin){

				// Subtract the document element margins

				var offsets = htmlOffsetsOrigin(node.ownerDocument || dojo.doc);

				ret.x -= offsets.l;
				ret.y -= offsets.t;
			} else {
				ret.x -= root.clientLeft;
				ret.y -= root.clientTop;
			}
			if (includeScroll) {
				scroll = dojo._docScroll();
				ret.x += scroll.x;
				ret.y += scroll.y;
			}
		}else{

			// FF2 and Safari and others that do not feature getBoundingClientRect.

			ret = {
				x: 0,
				y: 0
			};
			if(node.offsetParent){
				ret.x -= _sumAncestorProperties(node, "scrollLeft");
				ret.y -= _sumAncestorProperties(node, "scrollTop");
				
				var be, curnode = node;
				do{
					var n = curnode.offsetLeft,
						t = curnode.offsetTop;
					ret.x += n || 0;
					ret.y += t || 0;

					cs = gcs(curnode);
					if(curnode != node){
						be = dojo._getBorderExtents(curnode, cs);					
						ret.x += be.l || 0;
						ret.y += be.t || 0;						
					}
					// static children in a static div in FF2 are affected by the div's border as well
					// but offsetParent will skip this div!
					if(false && cs.position=="static"){ // Disabled temporarily for testing
						var parent=curnode.parentNode;
						while(parent!=curnode.offsetParent){
							var pcs=gcs(parent);
							if(pcs.position=="static"){
								be = dojo._getBorderExtents(parent, pcs);
								ret.x += be.l || 0;
								ret.y += be.t || 0;
							}
							parent=parent.parentNode;
						}
					}
					curnode = curnode.offsetParent;
				}while((curnode != dh) && curnode);
			}else {
				ret.x += node.x || 0;
				ret.y += node.y || 0;
			}
		}
		// account for document scrolling
		// if offsetParent is used, ret value already includes scroll position
		// so we may have to actually remove that value if !includeScroll
		if(includeScroll){
			scroll = dojo._docScroll();
			ret.x += scroll.x;
			ret.y += scroll.y;
		}

		return ret; // Object
	};

	dojo.coords = function(/*DomNode|String*/node, /*Boolean?*/includeScroll){
		//	summary:
		//		Returns an object that measures margin box width/height and
		//		absolute positioning data from dojo._abs().
		//
		//	description:
		//		Returns an object that measures margin box width/height and
		//		absolute positioning data from dojo._abs().
		//		Return value will be in the form:
		//			`{ l: 50, t: 200, w: 300: h: 150, x: 100, y: 300 }`
		//		Does not act as a setter. If includeScroll is passed, the x and
		//		y params are affected as one would expect in dojo._abs().
		var n = byId(node), s = gcs(n), mb = dojo._getMarginBox(n, s);
		var abs = dojo._abs(n, includeScroll);
		mb.x = abs.x;
		mb.y = abs.y;
		return mb;
	};

	// =============================
	// Element attribute Functions
	// =============================

	var _evtHdlrMap = {}, _ctr = 0,
		_attrId = dojo._scopeName + "attrid";
	html = dojo._getWin().document.documentElement;
	var attributesBad = !!(typeof html.getAttribute != 'undefined' && html.getAttribute('style') && typeof html.getAttribute('style') != 'string');
	var attributeAliases = {'for':'htmlFor', accesskey:'accessKey', codebase:'codeBase', frameborder:'frameBorder', framespacing:'frameSpacing', nowrap:'noWrap', maxlength:'maxLength', 'class':'className', readonly:'readOnly', longdesc:'longDesc', tabindex:'tabIndex', rowspan:'rowSpan', colspan:'colSpan', ismap:'isMap', usemap:'useMap', cellpadding:'cellPadding', cellspacing:'cellSpacing', innerhtml:'innerHTML'}; // Last for backwards compatibility

	// Used by realAttr to fix broken attributes

	if (attributesBad) {
            var reEvent = new RegExp('^on');
            var reNewLine = new RegExp('[\\n\\r]', 'g');
            var reFunction = new RegExp('^function anonymous\\(\\) *{(.*)}$');
            var reURI = new RegExp('^(href|src|data)$');
	}

	var reCamel = new RegExp('([^-]*)-(.)(.*)');
	var camelize = function(name) {
		var m = name.match(reCamel);
		return (m)?([m[1], m[2].toUpperCase(), m[3]].join('')):name;
	};

	var setElementHTML = function(node, html) {
		try { // Throws exceptions in IE, XHTML DOM's, etc.
			node.innerHTML = html;
		} catch(e) {
			dojo.empty(node);
			node.appendChild(dojo._toDom(html, node.ownerDocument));
		}
	};

	var connectEvent = function(node, name, value) {
		// Get ID

		var h, attrId = dojo.attr(node, _attrId);

		// Create ID and set if none exists

		if(!attrId){
			attrId = _ctr++;
			dojo.attr(node, _attrId, attrId);
		}

		// Create map object for event handlers if none exists

		if(!_evtHdlrMap[attrId]){
			_evtHdlrMap[attrId] = {};
		}

		// Get connected handler

		h = _evtHdlrMap[attrId][name];

		if(h){
			// If previously connected, disconnect

			dojo.disconnect(h);
		}else if (typeof node[name] == 'function') {

			// Clear existing property

			node[name] = null;
		}

		// Connect in normal fashion

		_evtHdlrMap[attrId][name] = dojo.connect(node, name, value);
	};

	// For use with HTML or XML DOM elements

	dojo.hasAttr = (function() {
		var alias, attributeSpecified, nameLower, re, value;

		if (typeof html.hasAttribute != 'undefined') {
			return function(el, name) {
				return el.hasAttribute(name);
			};
		}
		if (dojo.isHostObjectProperty(html, 'attributes')) {
			attributeSpecified = function(el, name) {
				value = el.attributes[name];

				return !!((value && value.specified));
			};
			if (attributesBad) {
				return function(el, name) {

					// MSXML document

					if (el.ownerDocument && typeof el.ownerDocument.selectNodes != 'undefined') {
						return attributeSpecified(el, name);
					}

					nameLower = name.toLowerCase();

					// NOTE: encType is a non-standard alias found only in broken MSHTML DOM's

					alias = nameLower == 'enctype' ? 'encType' : attributeAliases[nameLower];
					
					if (alias && alias.toLowerCase() == nameLower) {
						name = alias;
					}

					// NOTE: Broken MSHTML DOM is case-sensitive here with custom attributes

					value = el.attributes[name] || el.attributes[nameLower];

					if (value) {

						// NOTE: enctype and value attributes never specified

						if (value.specified) {
							return true;
						}
						if (typeof el.outerHTML == 'string') {
							switch(nameLower) {
							case 'enctype':
							case 'value':
								re = new RegExp('^[^>]*\\s+' + name + '=([\'"])?\\w+\\1?', 'i');
								return re.test(el.outerHTML);
							default:
								return false;
							}
						}
					}
					return false;
	          		};
			}
			return attributeSpecified;
		}
	})();

	html = null;

	// Handles setter add-ons (should be deprecated)

	var specialNames = /^(on.+|style|innerHTML)$/;

	var specialSet = function(node, name, value) {
		switch(name) {

		// Special case for "style", value must be a dictionary (Object object)

		case 'style':
			dojo.style(node, value);
			break;
		case 'innerHTML':
			setElementHTML(node, value);
			break;
		default: // Event properties
			connectEvent(node, name, value);
		}
	};

	// For use with HTML DOM elements only

	dojo.attr = function(/*DomNode*/node, /*String|Object*/name, /*String|Boolean|Function|Number?*/value) {
		//	summary:
		//		Gets or sets an attribute on an HTML element.
		//	description:
		//		Handles normalized getting and setting of attributes on DOM
		//		Nodes. If 2 arguments are passed, and a the second argumnt is a
		//		string, acts as a getter.
		//	
		//		If a third argument is passed, or if the second argumnt is a
		//		map of attributes, acts as a setter.
		//
		//		When passing functions as values, note that they will not be
		//		directly assigned to slots on the node, but rather the default
		//		behavior will be removed and the new behavior will be added
		//		using `dojo.connect()`, meaning that event handler properties
		//		will be normalized and that some caveats with regards to
		//		non-standard behaviors for onsubmit apply. Namely that you
		//		should cancel form submission using `dojo.stopEvent()` on the
		//		passed event object instead of returning a boolean value from
		//		the handler itself.
		//	node:
		//		id or reference to the element to get or set the attribute on
		//	name:
		//		the name of the attribute to get or set.
		//	value:
		//		The value to set for the attribute
		//	returns:
		//		when used as a getter, the value of the requested attribute
		//		or null if that attribute does not have a specified or
		//		default value;
		//
		//		when used as a setter, undefined
		//
		//	example:
		//	|	// get the current value of the "foo" attribute on a node
		//	|	dojo.attr(byId("nodeId"), "foo");
		//	|	// or we can just pass the id:
		//	|	dojo.attr("nodeId", "foo");
		//
		//	example:
		//	|	// use attr() to set the tab index
		//	|	dojo.attr("nodeId", "tabindex", 3);
		//	|
		//
		//	example:
		//	Set multiple values at once, including event handlers:
		//	|	dojo.attr("formId", {
		//	|		"foo": "bar",
		//	|		"tabindex": -1,
		//	|		"method": "POST",
		//	|		"onsubmit": function(e){
		//	|			// stop submitting the form. Note that the IE behavior
		//	|			// of returning true or false will have no effect here
		//	|			// since our handler is connect()ed to the built-in
		//	|			// onsubmit behavior and so we need to use
		//	|			// dojo.stopEvent() to ensure that the submission
		//	|			// doesn't proceed.
		//	|			dojo.stopEvent(e);
		//	|
		//	|			// submit the form with Ajax
		//	|			dojo.xhrPost({ form: "formId" });
		//	|		}
		//	|	});
		//
		//	example:
		//	Style is s special case: Only set with an object hash of styles
		//	|	dojo.attr("someNode",{
		//	|		id:"bar",
		//	|		style:{
		//	|			width:"200px", height:"100px", color:"#000"
		//	|		}
		//	|	});
		//
		//	example:
		//	Again, only set style as an object hash of styles:
		//	|	var obj = { color:"#fff", backgroundColor:"#000" };
		//	|	dojo.attr("someNode", "style", obj);
		//	|
		//	|	// though shorter to use `dojo.style` in this case:
		//	|	dojo.style("someNode", obj);

		var x, prop;

		if (typeof node == 'string') {
			node = byId(node);
		}

		if (typeof name != 'string') {

			// Multiple setter: the 2nd argument is a dictionary (Object object)

			for (x in name) {

				// For-in filter duplicated from dojo.isOwnProperty for performance (avoids document re-flows)

				prop = name.constructor.prototype[x];
				if (typeof prop == 'undefined' || prop !== name[x]) {
					value = name[x];

					// Code duplicated for performance (avoids unnecessary document reflows)

					// Convert attribute name to property name

					x = x.toLowerCase();
					x = attributeAliases[x] || x;

					// Convert hyphenated attribute names to camel-case (e.g. http-equiv => httpEquiv)

					if (name.indexOf('-') != -1) {
						name = camelize(name);
					}

					// Only detours (exits execution context) for special cases

					if (specialNames.test(x)) {
						specialSet(node, x, value);
					} else {
						node[x] = value;
					}
				}
			}
			return;
		}

		// Convert attribute name to property name

		name = name.toLowerCase();
		name = attributeAliases[name] || name;

		// Convert hyphenated attribute names to camel-case (e.g. http-equiv => httpEquiv)

		if (name.indexOf('-') != -1) {
			name = camelize(name);
		}

		if (arguments.length == 2) { // Getter
			return node[name];
		}

		// Single setter

		// Only detours (exits execution context) for special cases

		if (specialNames.test(name)) {
			specialSet(node, name, value);
		} else {
			node[name] = value;
		}
	};

	// For use with HTML DOM elements only

	dojo.removeAttr = function(/*DomNode|String*/node, /*String*/name){

		// summary: Removes an attribute from an HTML element.
		//
		// node: id or reference to the element to remove the attribute from
		//
		// name: the name of the attribute to remove

		var alias, nameLower;

		if (typeof node == 'string') {
			node = byId(node);
		}
		if (attributesBad) {
			nameLower = name.toLowerCase();

			// NOTE: encType alias does not apply here

			alias = attributeAliases[nameLower];

			if (alias && alias.toLowerCase() == nameLower) {
				name = alias;
			}
		}
		node.removeAttribute(name);		
	};

	// Used to get/set HTML attributes
	// Can also be used for XML attributes (but better to use host implemented get/setAttribute)
	// Better to use host implemented get/setAttribute to get and set custom attributes

	// Returns a string or null

	// NOTE: Does not support multiple sets (name must be a string)

	dojo.realAttr = (function() {
		var alias, doc, hasAttribute, key, nameLower, nn, val;

		if (attributesBad) {
			hasAttribute = dojo.hasAttr;
			return function(node, name, value) {
				if (typeof node == 'string') {
					node = byId(node);
				}

				// Find owner document

				doc = node.ownerDocument;

				// Convert name to lower

				nameLower = name.toLowerCase();

				// Find alias

				// NOTE: encType is a non-standard alias found only in broken MSHTML DOM's

				alias = nameLower == 'enctype' ? 'encType' : attributeAliases[nameLower];

				// Camelize if necessary
				// Aliases are never hyphenated

				key = alias || (nameLower.indexOf('-') == -1 && nameLower) || camelize(nameLower);

				// Get node name for special cases

				nn = node.tagName.toLowerCase();

				if (arguments.length == 2) {

					// Getter

					// MSXML document

	        	      		if (doc && typeof doc.selectNodes != 'undefined') {
						return node.getAttribute(name);
					}

					if (hasAttribute(node, name)) {
						if (name == 'style') {
							return node.style.cssText;
						}

						// NOTE: In case of form elements named with standard property names (e.g. action.)

						if (nn == 'form' && typeof node.getAttributeNode != 'undefined') {
							val = node.getAttributeNode(name) || node.getAttributeNode(nameLower);
							return val ? val.nodeValue : null;
						}
						val = node[key];
						switch(typeof val) {
						case 'boolean':
							return val ? '' : null;						
						case 'undefined':

							// Custom attribute (case sensitive)

							val = node.getAttribute(name);
							return typeof val == 'string' ? val : null;
						case 'string':
							if (reURI.test(nameLower)) {
								return node.getAttribute(nameLower, 2);
							}						
							return val;
						case 'function':
							if (reEvent.test(nameLower)) {
								val = node[nameLower].toString();
								if (val) {
									val = val.replace(reNewLine, '');
									if (reFunction.test(val)) {
										return val.replace(reFunction, '$1');
									}
								}
							}
							return null;
						default:
							return val === null ? null : String(val);
						}
					}
					return null;
				}

				// Setter

				if (doc && typeof(doc.selectNodes) != 'undefined') {

					// MSXML document

					node.setAttribute(name, value);
				} else {

					// Broken by design MSHTML DOM (IE < 8 and compatibility modes)

				        nn = node.tagName.toLowerCase();
					switch(nameLower) {
					case 'style':
						node.style.cssText = value;
						break;
					case 'checked':
					case 'selected':
					case 'disabled':
					case 'multiple':
					case 'readonly':
					case 'ismap':

						// HTML attributes are case insensitive

						node[key] = value ? value.toLowerCase() == nameLower : false;
						break;
					case 'type':
						if (nn != 'select') {

							// No such attribute, but there is a property

							node.type = value;
						}
						break;
					default:
						if (reEvent.test(nameLower)) {
							node[nameLower] = new Function(value);
						} else if (typeof node[key] == 'undefined') {

							// No defined property
							// Custom attribute (case sensitive)

							node.setAttribute(name, value);
						} else {

							// Set property

							node[key] = value;
						}
					}
				}
			};
		} else {
			return function(node, name, value) {
				if (typeof node == 'string') {
					node = byId(node);
				}
				if (arguments.length == 2) { // Getter
					return node.getAttribute(name); // String
				}
				node.setAttribute(name, value);
			};
		}		
	})();
	
	dojo.create = function(tag, attrs, refNode, pos){
		// summary: Create an element, allowing for optional attribute decoration
		//		and placement. 
		//
		// description:
		//		A DOM Element creation function. A shorthand method for creating a node or
		//		a fragment, and allowing for a convenient optional attribute setting step, 
		//		as well as an optional DOM placement reference.
		//|
		//		Attributes are set by passing the optional object through `dojo.attr`.
		//		See `dojo.attr` for noted caveats and nuances, and API if applicable. 
		//|
		//		Placement is done via `dojo.place`, assuming the new node to be the action 
		//		node, passing along the optional reference node and position. 
		//
		// tag: String|DomNode
		//		A string of the element to create (eg: "div", "a", "p", "li", "script", "br"),
		//		or an existing DOM node to process.
		//
		// attrs: Object
		//		An object-hash of attributes to set on the newly created node.
		//		Can be null, if you don't want to set any attributes/styles.
		//		See: `dojo.attr` for a description of available attributes.
		//
		// refNode: String?|DomNode?
		//		Optional reference node. Used by `dojo.place` to place the newly created
		//		node somewhere in the dom relative to refNode. Can be a DomNode reference
		//		or String ID of a node.
		//	
		// pos: String?
		//		Optional positional reference. Defaults to "last" by way of `dojo.place`,
		//		though can be set to "first","after","before","last", "replace" or "only"
		//		to further control the placement of the new node relative to the refNode.
		//		'refNode' is required if a 'pos' is specified.
		//
		// returns: DomNode
		//
		// example:
		//	Create a DIV:
		//	| var n = dojo.create("div");
		//
		// example:
		//	Create a DIV with content:
		//	| var n = dojo.create("div", { innerHTML:"<p>hi</p>" });
		//
		// example:
		//	Place a new DIV in the BODY, with no attributes set
		//	| var n = dojo.create("div", null, dojo.body());
		//
		// example:
		//	Create an UL, and populate it with LI's. Place the list as the first-child of a 
		//	node with id="someId":
		//	| var ul = dojo.create("ul", null, "someId", "first"); 
		//	| var items = ["one", "two", "three", "four"];
		//	| dojo.forEach(items, function(data){
		//	|	dojo.create("li", { innerHTML: data }, ul);
		//	| });
		//
		// example:
		//	Create an anchor, with an href. Place in BODY:
		//	| dojo.create("a", { href:"foo.html", title:"Goto FOO!" }, dojo.body());
		//
		// example:
		//	Create a `dojo.NodeList` from a new element (for syntatic sugar):
		//	|	dojo.query(dojo.create('div'))
		//	|		.addClass("newDiv")
		//	|		.onclick(function(e){ console.log('clicked', e.target) })
		//	|		.place("#someNode"); // redundant, but cleaner.

		var doc = dojo.doc;
		if(refNode){		
			refNode = byId(refNode);
			doc = refNode.ownerDocument;
		}
		if(typeof tag == 'string'){
			tag = doc.createElement(tag);
		}
		if(attrs){ dojo.attr(tag, attrs); }
		if(refNode){ dojo.place(tag, refNode, pos); }
		return tag; // DomNode
	};
	
	/*=====
	dojo.empty = function(node){
			//	summary:
			//		safely removes all children of the node.
			//	node: DOMNode|String
			//		a reference to a DOM node or an id.
			//	example:
			//	Destroy node's children byId:
			//	| dojo.empty("someId");
			//
			//	example:
			//	Destroy all nodes' children in a list by reference:
			//	| dojo.query(".someNode").forEach(dojo.empty);
	}
	=====*/

	dojo.empty = function(node){		
		node = byId(node);
		for(var c; c = node.lastChild;){ // intentional assignment
			node.removeChild(c);
		}		
	};

	/*=====
	dojo._toDom = function(frag, doc){
			//	summary:
			//		instantiates an HTML fragment returning the corresponding DOM.
			//	frag: String
			//		the HTML fragment
			//	doc: DocumentNode?
			//		optional document to use when creating DOM nodes, defaults to
			//		dojo.doc if not specified.
			//	returns: DocumentFragment
			//
			//	example:
			//	Create a table row:
			//	| var tr = dojo._toDom("<tr><td>First!</td></tr>");
	}
	=====*/

	// support stuff for dojo._toDom
	var tagWrap = {
			area: ["map"],
			caption: ["table"],
			col: ["table", "colgroup"],
			colgroup: ["table"],
			dd: ["dl"],
			dt: ["dl"],
			frame: ["frameset"],
			legend: ["fieldset"],
			li: ["ul"],
			option: ["select"],
			optgroup: ["select"],
			tbody: ["table"],
			td: ["table", "tbody", "tr"],
			tfoot: ["table"],
			th: ["table", "thead", "tr"],
			thead: ["table"],
			tr: ["table", "tbody"]
		},
		reTag = /<\s*([\w\:]+)/,
		masterNode = {}, masterNum = 0,
		masterName = "__" + dojo._scopeName + "ToDomId";

	// generate start/end tag strings to use
	// for the injection for each special tag wrap case.
	for(var param in tagWrap){
		if (dojo.isOwnProperty(tagWrap, param)) {
			var tw = tagWrap[param];
			tw.pre  = param == "option" ? '<select multiple="multiple">' : "<" + tw.join("><") + ">";
			tw.post = "</" + tw.reverse().join("></") + ">";
			// the last line is destructive: it reverses the array,
			// but we don't care at this point
		}
	}

	dojo._toDom = function(frag, doc){
		// summary converts HTML string into DOM nodes.

		doc = doc || dojo.doc;
		var masterId = doc[masterName];
		if(!masterId){
			doc[masterName] = masterId = ++masterNum + "";
			masterNode[masterId] = doc.createElement("div");
		}

		// make sure the frag is a string.
		// (Should fail immediately if not)
		//frag += ""

		// find the starting tag, and get node wrapper
		var match = frag.match(reTag);

		if (match) {
			var tag = match[1].toLowerCase(),
			master = masterNode[masterId],
			wrap, i, fc, df;
			if(tagWrap[tag]){
				wrap = tagWrap[tag];
				master.innerHTML = wrap.pre + frag + wrap.post;
				for(i = wrap.length; i; --i){
					master = master.firstChild;
				}
			}		
		}else{
			master.innerHTML = frag;
		}

		// one node shortcut => return the node itself
		if(master.childNodes.length == 1){
			return master.removeChild(master.firstChild); // DOMNode
		}
		
		// return multiple nodes as a document fragment
		df = doc.createDocumentFragment();
		while(fc = master.firstChild){ // intentional assignment
			df.appendChild(fc);
		}
		return df; // DOMNode
	};

	// =============================
	// (CSS) Class Functions
	// =============================

	dojo.hasClass = function(/*DomNode|String*/node, /*String*/classStr){
		//	summary:
		//		Returns whether or not the specified classes are a portion of the
		//		class list currently applied to the node. 
		//
		//	node: 
		//		String ID or DomNode reference to check the class for.
		//
		//	classStr:
		//		A string class name to look for.
		// 
		//	example:
		//	| if(dojo.hasClass("someNode","aSillyClassName")){ ... }
		
		return ((" "+ byId(node).className +" ").indexOf(" "+ classStr +" ") >= 0);  // Boolean
	};

	dojo.addClass = function(/*DomNode|String*/node, /*String*/className){
		//	summary:
		//		Adds the specified classes to the end of the class list on the
		//		passed node. Will not re-apply duplicate classes, except in edge
		//		cases when adding multiple classes at once.
		//
		//	node: String ID or DomNode reference to add a class string too
		//	classStr: A String class name to add
		//
		// example:
		//	Add A class to some node:
		//	|	dojo.addClass("someNode", "anewClass");
		//
		// example:
		//	Add two classes at once (could potentially add duplicate):
		//	| 	dojo.addClass("someNode", "firstClass secondClass");
		//
		// example:
		//	Available in `dojo.NodeList` for multiple additions
		//	| dojo.query("ul > li").addClass("firstLevel");
		
		var re;

		if (typeof node == 'string') {
			node = byId(node);
		}
		if (!node.className) {
			node.className = className;
		}
		else {
			re = new RegExp('(^|\\s)' + className + '(\\s|$)');
			if (!re.test(node.className)) {
				node.className += ' ' + className;
			}
		}
	};

	dojo.removeClass = function(/*DomNode|String*/node, /*String*/className){
		// summary: Removes the specified classes from node. No `dojo.hasClass` 
		//		check is required. 
		//
		// node: String ID or DomNode reference to remove the class from.
		//
		// classString: String class name to remove
		//
		// example:
		// 	| dojo.removeClass("someNode", "firstClass");
		//
		// example:
		//	Available in `dojo.NodeList` for multiple removal
		//	| dojo.query(".foo").removeClass("foo");

		var re, m;

		if (typeof node == 'string') {		
			node = byId(node);
		}
		if (node.className) {
			if (node.className == className) {
				node.className = '';
			} else {		
				re = new RegExp('(^|\\s)' + className + '(\\s|$)');
				m = node.className.match(re);
				if (m && m.length == 3) { node.className = node.className.replace(re, (m[1] && m[2])?' ':''); }
          		}
        	}
	};

	dojo.toggleClass = function(/*DomNode|String*/node, /*String*/classStr, /*Boolean?*/condition){
		//	summary:
		//		Adds a class to node if not present, or removes if present.
		//		Pass a boolean condition if you want to explicitly add or remove.
		//	condition:
		//		If passed, true means to add the class, false means to remove.
		//
		// example:
		//	| dojo.toggleClass("someNode", "hovered");
		//
		// example:
		// 	Forcefully add a class
		//	| dojo.toggleClass("someNode", "hovered", true);
		//
		// example:
		//	Available in `dojo.NodeList` for multiple toggles
		//	| dojo.query(".toggleMe").toggleClass("toggleMe");
		
		if(condition === undefined){
			condition = !dojo.hasClass(node, classStr);
		}
		dojo[condition ? "addClass" : "removeClass"](node, classStr);
	};
})();