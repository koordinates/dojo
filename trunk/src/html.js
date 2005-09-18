dojo.provide("dojo.html");
dojo.require("dojo.dom");
dojo.require("dojo.style");
dojo.require("dojo.string");
dojo.require("dojo.event.*");
dojo.require("dojo.uri.Uri");
dojo.require("dojo.graphics.color");

dojo.lang.mixin(dojo.html, dojo.dom);
dojo.lang.mixin(dojo.html, dojo.style);

// FIXME: we are going to assume that we can throw any and every rendering
// engine into the IE 5.x box model. In Mozilla, we do this w/ CSS.
// Need to investigate for KHTML and Opera

	
dojo.html.clearSelection = function (){
	try{
		if(window.getSelection){
			var selObj = window.getSelection();
			selObj.collapseToEnd();
		}else if(document.selection){
			document.selection.clear();
		}
	}catch(e){ /*squelch*/ }
}

dojo.html._selectionDisabled = false;

dojo.html.disableSelection = function (){
	if(!dojo.html._selectionDisabled){
		var db = document.body;
		if(dojo.render.html.moz){
			db.style.MozUserSelect = "none";
		}else{
			dojo.event.connect(db, "onselectstart", dojo.event.browser, "stopEvent");
			dojo.event.connect(db, "ondragstart", dojo.event.browser, "stopEvent");
			dojo.event.connect(db, "onmousemove", dojo.html, "clearSelection");
		}
	}
	dojo.html._selectionDisabled = true;
}

dojo.html.enableSelection = function (){
	if(dojo.html._selectionDisabled){
		var db = document.body;
		if(dojo.render.html.moz){
			db.style.MozUserSelect = "";
		}else{
			dojo.event.disconnect(db, "onselectstart", dojo.event.browser, "stopEvent");
			dojo.event.disconnect(db, "ondragstart", dojo.event.browser, "stopEvent");
			dojo.event.disconnect(db, "onmousemove", dojo.html, "clearSelection");
		}
	}
	dojo.html._selectionDisabled = false;
}

dojo.html.selectElement = function (element) {
	if (document.selection && document.body.createTextRange) { // IE
		var range = document.body.createTextRange();
		range.moveToElementText(element);
		range.select();
	} else if (window.getSelection) {
		var selection = window.getSelection();
		if (selection.selectAllChildren) { // Mozilla
			selection.selectAllChildren(element);
		}
	}
}

dojo.html.selectionCollapsed = function () {
	if (document.selection) { // IE
		return document.selection.createRange().text == "";
	} else if (window.getSelection) {
		var selection = window.getSelection();
		if (dojo.lang.isString(selection)) { // Safari
			return selection == "";
		} else { // Mozilla/W3
			return selection.isCollapsed;
		}
	}
}

dojo.html.getEventTarget = function (evt){
	if((window["event"])&&(window.event["srcElement"])){
		return window.event.srcElement;
	}else if((evt)&&(evt.target)){
		return evt.target;
	}
}

dojo.html.getScrollTop = function () {
	return document.documentElement.scrollTop || document.body.scrollTop || 0;
}

dojo.html.getScrollLeft = function () {
	return document.documentElement.scrollLeft || document.body.scrollLeft || 0;
}

dojo.html.getParentOfType = function (node, type){
	var parent = node;
	type = type.toLowerCase();
	while(parent.nodeName.toLowerCase()!=type){
		if((!parent)||(parent==(document["body"]||document["documentElement"]))){
			return null;
		}
		parent = parent.parentNode;
	}
	return parent;
}

// RAR: this function comes from nwidgets and is more-or-less unmodified.
// We should probably look ant Burst and f(m)'s equivalents
dojo.html.getAttribute = function (node, attr){
	// FIXME: need to add support for attr-specific accessors
	if((!node)||(!node.getAttribute)){
		// if(attr !== 'nwType'){
		//	alert("getAttr of '" + attr + "' with bad node"); 
		// }
		return null;
	}
	var ta = typeof attr == 'string' ? attr : new String(attr);

	// first try the approach most likely to succeed
	var v = node.getAttribute(ta.toUpperCase());
	if((v)&&(typeof v == 'string')&&(v!="")){ return v; }

	// try returning the attributes value, if we couldn't get it as a string
	if(v && typeof v == 'object' && v.value){ return v.value; }

	// this should work on Opera 7, but it's a little on the crashy side
	if((node.getAttributeNode)&&(node.getAttributeNode(ta))){
		return (node.getAttributeNode(ta)).value;
	}else if(node.getAttribute(ta)){
		return node.getAttribute(ta);
	}else if(node.getAttribute(ta.toLowerCase())){
		return node.getAttribute(ta.toLowerCase());
	}
	return null;
}
	
/**
 *	Determines whether or not the specified node carries a value for the
 *	attribute in question.
 */
dojo.html.hasAttribute = function (node, attr){
	var v = this.getAttribute(node, attr);
	return v ? true : false;
}
	
/**
 * Returns the string value of the list of CSS classes currently assigned
 * directly to the node in question. Returns an empty string if no class attribute
 * is found;
 */
dojo.html.getClass = function (node) {
	if(node.className){
		return node.className;
	}else if(dojo.html.hasAttribute(node, "class")){
		return dojo.html.getAttribute(node, "class");
	}
	return "";
}

/**
 * Returns whether or not the specified classname is a portion of the
 * class list currently applied to the node. Does not cover cascaded
 * styles, only classes directly applied to the node.
 */
dojo.html.hasClass = function (node, classname){
	var classes = dojo.html.getClass(node).split(/\s+/g);
	for(var x=0; x<classes.length; x++){
		if(classname == classes[x]){ return true; }
	}
	return false;
}

/**
 * Adds the specified class to the beginning of the class list on the
 * passed node. This gives the specified class the highest precidence
 * when style cascading is calculated for the node. Returns true or
 * false; indicating success or failure of the operation, respectively.
 */
dojo.html.prependClass = function (node, classStr){
	if(!node){ return null; }
	if(dojo.html.hasAttribute(node,"class")||node.className){
		classStr += " " + (node.className||dojo.html.getAttribute(node, "class"));
	}
	return dojo.html.setClass(node, classStr);
}

/**
 * Adds the specified class to the end of the class list on the
 *	passed &node;. Returns &true; or &false; indicating success or failure.
 */
dojo.html.addClass = function (node, classStr){
	if(!node){ return null; }
	if(dojo.html.hasAttribute(node,"class")||node.className){
		classStr = (node.className||dojo.html.getAttribute(node, "class")) + " " + classStr;
	}
	return dojo.html.setClass(node, classStr);
}

/**
 *  Clobbers the existing list of classes for the node, replacing it with
 *	the list given in the 2nd argument. Returns true or false
 *	indicating success or failure.
 */
dojo.html.setClass = function (node, classStr){
	if(!node){ return false; }
	var cs = new String(classStr);
	try{
		if(typeof node.className == "string"){
			node.className = cs;
		}else if(node.setAttribute){
			node.setAttribute("class", classStr);
			node.className = cs;
		}else{
			return false;
		}
	}catch(e){
		dj_debug("__util__.setClass() failed", e);
	}
	return true;
}

/**
 * Removes the className from the node;. Returns
 * true or false indicating success or failure.
 */ 
dojo.html.removeClass = function (node, classStr){
	if(!node){ return false; }
	var classStr = dojo.string.trim(new String(classStr));

	try{
		var cs = String( node.className ).split(" ");
		var nca  = [];
		for(var i = 0; i<cs.length; i++){
			if(cs[i] != classStr){ 
				nca .push(cs[i]);
			}
		}
		node.className = nca .join(" ");
	}catch(e){
		dj_debug("__util__.removeClass() failed", e);
	}

	return true;
}

// Enum type for getElementsByClass classMatchType arg:
dojo.html.classMatchType = {
	ContainsAll : 0, // all of the classes are part of the node's class (default)
	ContainsAny : 1, // any of the classes are part of the node's class
	IsOnly : 2 // only all of the classes are part of the node's class
}


/**
 * Returns an array of nodes for the given classStr, children of a
 * parent, and optionally of a certain nodeType
 */
dojo.html.getElementsByClass = function (classStr, parent, nodeType, classMatchType) {
	if(!parent){ parent = document; }
	var classes = classStr.split(/\s+/g);
	var nodes = [];
	if( classMatchType != 1 && classMatchType != 2 ) classMatchType = 0; // make it enum

	// FIXME: doesn't have correct parent support!
	if(false && document.evaluate) { // supports dom 3 xpath
		var xpath = "//" + (nodeType || "*") + "[contains(";
		if(classMatchType != dojo.html.classMatchType.ContainsAny){
			xpath += "concat(' ',@class,' '), ' " +
				classes.join(" ') and contains(concat(' ',@class,' '), ' ") +
				" ')]";
		}else{
			xpath += "concat(' ',@class,' '), ' " +
				classes.join(" ')) or contains(concat(' ',@class,' '), ' ") +
				" ')]";
		}
		//dj_debug("xpath: " + xpath);

		var xpathResult = document.evaluate(xpath, parent, null,
			XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

		outer:
		for(var node = null, i = 0; node = xpathResult.snapshotItem(i); i++){
			if(classMatchType != dojo.html.classMatchType.IsOnly){
				nodes.push(node);
			}else{
				if(!dojo.html.getClass(node)){ continue outer; }

				var nodeClasses = dojo.html.getClass(node).split(/\s+/g);
				var reClass = new RegExp("(\\s|^)(" + classes.join(")|(") + ")(\\s|$)");
				for(var j = 0; j < nodeClasses.length; j++) {
					if( !nodeClasses[j].match(reClass) ) {
						continue outer;
					}
				}
				nodes.push(node);
			}
		}
	}else{
		if(!nodeType){ nodeType = "*"; }
		var candidateNodes = parent.getElementsByTagName(nodeType);

		outer:
		for(var i = 0; i < candidateNodes.length; i++) {
			var node = candidateNodes[i];
			if( !dojo.html.getClass(node) ) { continue outer; }
			var nodeClasses = dojo.html.getClass(node).split(/\s+/g);
			var reClass = new RegExp("(\\s|^)((" + classes.join(")|(") + "))(\\s|$)");
			var matches = 0;

			for(var j = 0; j < nodeClasses.length; j++) {
				if( reClass.test(nodeClasses[j]) ) {
					if( classMatchType == dojo.html.classMatchType.ContainsAny ) {
						nodes.push(node);
						continue outer;
					} else {
						matches++;
					}
				} else {
					if( classMatchType == dojo.html.classMatchType.IsOnly ) {
						continue outer;
					}
				}
			}

			if( matches == classes.length ) {
				if( classMatchType == dojo.html.classMatchType.IsOnly && matches == nodeClasses.length ) {
					nodes.push(node);
				} else if( classMatchType == dojo.html.classMatchType.ContainsAll ) {
					nodes.push(node);
				}
			}
		}
	}
	return nodes;
}
//this.getElementsByClassName = this.getElementsByClass;

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
 * @param e    The event containing the mouse coordinates
 * @return     The directions, NORTH or SOUTH and EAST or WEST. These
 *             are properties of the function.
 */
dojo.html.gravity = function (node, e){
	var mousex = e.pageX || e.clientX + document.body.scrollLeft;
	var mousey = e.pageY || e.clientY + document.body.scrollTop;
	
	with(dojo.html){
		var nodecenterx = getAbsoluteX(node) + (getInnerWidth(node) / 2);
		var nodecentery = getAbsoluteY(node) + (getInnerHeight(node) / 2);
	}
	
	with(arguments.callee){
		return ((mousex < nodecenterx ? WEST : EAST) |
			(mousey < nodecentery ? NORTH : SOUTH));
	}
}

dojo.html.gravity.NORTH = 1;
dojo.html.gravity.SOUTH = 1 << 1;
dojo.html.gravity.EAST = 1 << 2;
dojo.html.gravity.WEST = 1 << 3;
	
dojo.html.overElement = function (element, e) {
	var mousex = e.pageX || e.clientX + document.body.scrollLeft;
	var mousey = e.pageY || e.clientY + document.body.scrollTop;
	
	with(dojo.html){
		var top = getAbsoluteY(element);
		var bottom = top + getInnerHeight(element);
		var left = getAbsoluteX(element);
		var right = left + getInnerWidth(element);
	}
	
	return (mousex >= left && mousex <= right &&
		mousey >= top && mousey <= bottom);
}

/**
 * Attempts to return the text as it would be rendered, with the line breaks
 * sorted out nicely. Unfinished.
 */
dojo.html.renderedTextContent = function (node) {
	var result = "";
	if (node == null) { return result; }
	for (var i = 0; i < node.childNodes.length; i++) {
		switch (node.childNodes[i].nodeType) {
			case 1: // ELEMENT_NODE
			case 5: // ENTITY_REFERENCE_NODE
				switch (dojo.style.getStyle(node.childNodes[i], "display")) {
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
						result += dojo.html.renderedTextContent(node.childNodes[i]);
						break;
				}
				break;
			case 3: // TEXT_NODE
			case 2: // ATTRIBUTE_NODE
			case 4: // CDATA_SECTION_NODE
				var text = node.childNodes[i].nodeValue;
				switch (dojo.style.getStyle(node, "text-transform")) {
					case "capitalize": text = dojo.string.capitalize(text); break;
					case "uppercase": text = text.toUpperCase(); break;
					case "lowercase": text = text.toLowerCase(); break;
					default: break; // leave as is
				}
				// TODO: implement
				switch (dojo.style.getStyle(node, "text-transform")) {
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

dojo.html.setActiveStyleSheet = function (title) {
	var i, a, main;
	for(i=0; (a = document.getElementsByTagName("link")[i]); i++) {
		if (a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {
			a.disabled = true;
			if (a.getAttribute("title") == title) { a.disabled = false; }
		}
	}
}

dojo.html.getActiveStyleSheet = function () {
	var i, a;
	for (i=0; (a = document.getElementsByTagName("link")[i]); i++) {
		if (a.getAttribute("rel").indexOf("style") != -1 &&
			a.getAttribute("title") && !a.disabled) { return a.getAttribute("title"); }
	}
	return null;
}

dojo.html.getPreferredStyleSheet = function () {
	var i, a;
	for (i=0; (a = document.getElementsByTagName("link")[i]); i++) {
		if(a.getAttribute("rel").indexOf("style") != -1
			&& a.getAttribute("rel").indexOf("alt") == -1
			&& a.getAttribute("title")) { return a.getAttribute("title"); }
	}
	return null;
}
