dojo.provide("dojo.html");

dojo.require("dojo.lang.func");
dojo.require("dojo.dom");
dojo.require("dojo.style");

dojo.lang.mixin(dojo.html, dojo.dom);
dojo.lang.mixin(dojo.html, dojo.style);

// FIXME: we are going to assume that we can throw any and every rendering
// engine into the IE 5.x box model. In Mozilla, we do this w/ CSS.
// Need to investigate for KHTML and Opera

dojo.html.clearSelection = function(){
	var _window = dojo.global();
	var _document = dojo.doc();
	try{
		if(_window["getSelection"]){ 
			if(dojo.render.html.safari){
				// pulled from WebCore/ecma/kjs_window.cpp, line 2536
				_window.getSelection().collapse();
			}else{
				_window.getSelection().removeAllRanges();
			}
		}else if(_document.selection){
			if(_document.selection.empty){
				_document.selection.empty();
			}else if(_document.selection.clear){
				_document.selection.clear();
			}
		}
		return true;
	}catch(e){
		dojo.debug(e);
		return false;
	}
}

dojo.html.disableSelection = function(element){
	element = dojo.byId(element)||dojo.body();
	var h = dojo.render.html;
	
	if(h.mozilla){
		element.style.MozUserSelect = "none";
	}else if(h.safari){
		element.style.KhtmlUserSelect = "none"; 
	}else if(h.ie){
		element.unselectable = "on";
	}else{
		return false;
	}
	return true;
}

dojo.html.enableSelection = function(element){
	element = dojo.byId(element)||dojo.body();
	
	var h = dojo.render.html;
	if(h.mozilla){ 
		element.style.MozUserSelect = ""; 
	}else if(h.safari){
		element.style.KhtmlUserSelect = "";
	}else if(h.ie){
		element.unselectable = "off";
	}else{
		return false;
	}
	return true;
}

dojo.html.selectElement = function(element){
	var _window = dojo.global();
	var _document = dojo.doc();
	element = dojo.byId(element);
	if(_document.selection && dojo.body().createTextRange){ // IE
		var range = dojo.body().createTextRange();
		range.moveToElementText(element);
		range.select();
	}else if(_window["getSelection"]){
		var selection = _window.getSelection();
		// FIXME: does this work on Safari?
		if(selection["selectAllChildren"]){ // Mozilla
			selection.selectAllChildren(element);
		}
	}
}

dojo.html.selectInputText = function(element){
	var _window = dojo.global();
	var _document = dojo.doc();
	element = dojo.byId(element);
	if(_document.selection && dojo.body().createTextRange){ // IE
		var range = element.createTextRange();
		range.moveStart("character", 0);
		range.moveEnd("character", element.value.length);
		range.select();
	}else if(_window["getSelection"]){
		var selection = _window.getSelection();
		// FIXME: does this work on Safari?
		element.setSelectionRange(0, element.value.length);
	}
	element.focus();
}


dojo.html.isSelectionCollapsed = function(){
	var _window = dojo.global();
	var _document = dojo.doc();
	if(_document["selection"]){ // IE
		return _document.selection.createRange().text == "";
	}else if(_window["getSelection"]){
		var selection = _window.getSelection();
		if(dojo.lang.isString(selection)){ // Safari
			return selection == "";
		}else{ // Mozilla/W3
			return selection.isCollapsed;
		}
	}
}

dojo.html.getEventTarget = function(evt){
	if(!evt) { evt = dojo.global().event || {} };
	var t = (evt.srcElement ? evt.srcElement : (evt.target ? evt.target : null));
	while((t)&&(t.nodeType!=1)){ t = t.parentNode; }
	return t;
}

dojo.html.getDocumentWidth = function(){
	dojo.deprecated("dojo.html.getDocument*", "replaced by dojo.html.getViewport*", "0.4");
	return dojo.html.getViewportWidth();
}

dojo.html.getDocumentHeight = function(){
	dojo.deprecated("dojo.html.getDocument*", "replaced by dojo.html.getViewport*", "0.4");
	return dojo.html.getViewportHeight();
}

dojo.html.getDocumentSize = function(){
	dojo.deprecated("dojo.html.getDocument*", "replaced of dojo.html.getViewport*", "0.4");
	return dojo.html.getViewportSize();
}

dojo.html.getViewportWidth = function(){
	var _window = dojo.global();
	var _document = dojo.doc();
	var w = 0;

	//in opera9, dojo.body().clientWidth should be used, instead
	//of window.innerWidth/document.documentElement.clientWidth
	//so we have to check whether it is opera
	if(!dojo.render.html.opera && _window.innerWidth){
		w = _window.innerWidth;
	}

	if(!dojo.render.html.opera && dojo.exists(_document, "documentElement.clientWidth")){
		// IE6 Strict
		var w2 = _document.documentElement.clientWidth;
		// this lets us account for scrollbars
		if(!w || w2 && w2 < w) {
			w = w2;
		}
		return w;
	}

	if(dojo.body()){
		// IE
		return dojo.body().clientWidth;
	}

	return 0;
}

dojo.html.getViewportHeight = function(){
	var _window = dojo.global();
	var _document = dojo.doc();

	//see comment in dojo.html.getViewportWidth
	if (!dojo.render.html.opera && _window.innerHeight){
		return _window.innerHeight;
	}

	if (!dojo.render.html.opera && dojo.exists(_document, "documentElement.clientHeight")){
		// IE6 Strict
		return _document.documentElement.clientHeight;
	}

	if (dojo.body().clientHeight){
		// IE, Opera
		return dojo.body().clientHeight;
	}

	return 0;
}

dojo.html.getViewportSize = function(){
	var ret = [dojo.html.getViewportWidth(), dojo.html.getViewportHeight()];
	ret.w = ret[0];
	ret.h = ret[1];
	return ret;
}

dojo.html.getScrollTop = function(){
	var _document = dojo.doc();
	return dojo.global().pageYOffset || _document.documentElement.scrollTop || dojo.body().scrollTop || 0;
}

dojo.html.getScrollLeft = function(){
	var _document = dojo.doc();
	return dojo.global().pageXOffset || _document.documentElement.scrollLeft || dojo.body().scrollLeft || 0;
}

dojo.html.getScrollOffset = function(){
	var off = [dojo.html.getScrollLeft(), dojo.html.getScrollTop()];
	off.x = off[0];
	off.y = off[1];
	return off;
}

dojo.html.getParentOfType = function(node, type){
	dojo.deprecated("dojo.html.getParentOfType", "replaced by dojo.html.getParentByType*", "0.4");
	return dojo.html.getParentByType(node, type);
}

dojo.html.getParentByType = function(node, type) {
	var _document = dojo.doc();
	var parent = dojo.byId(node);
	type = type.toLowerCase();
	while((parent)&&(parent.nodeName.toLowerCase()!=type)){
		if(parent==(_document["body"]||_document["documentElement"])){
			return null;
		}
		parent = parent.parentNode;
	}
	return parent;
}

// RAR: this function comes from nwidgets and is more-or-less unmodified.
// We should probably look ant Burst and f(m)'s equivalents
dojo.html.getAttribute = function(node, attr){
	node = dojo.byId(node);
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
	if(v && v.value){ return v.value; }

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
dojo.html.hasAttribute = function(node, attr){
	node = dojo.byId(node);
	return dojo.html.getAttribute(node, attr) ? true : false;
}
	
/**
 * Returns the string value of the list of CSS classes currently assigned
 * directly to the node in question. Returns an empty string if no class attribute
 * is found;
 */
dojo.html.getClass = function(node){
	node = dojo.byId(node);
	if(!node){ return ""; }
	var cs = "";
	if(node.className){
		cs = node.className;
	}else if(dojo.html.hasAttribute(node, "class")){
		cs = dojo.html.getAttribute(node, "class");
	}
	return cs.replace(/^\s+|\s+$/g, "");
}

/**
 * Returns an array of CSS classes currently assigned
 * directly to the node in question. Returns an empty array if no classes
 * are found;
 */
dojo.html.getClasses = function(node) {
	var c = dojo.html.getClass(node);
	return (c == "") ? [] : c.split(/\s+/g);
}

/**
 * Returns whether or not the specified classname is a portion of the
 * class list currently applied to the node. Does not cover cascaded
 * styles, only classes directly applied to the node.
 */
dojo.html.hasClass = function(node, classname){
	return (new RegExp('(^|\\s+)'+classname+'(\\s+|$)')).test(dojo.html.getClass(node))
}

/**
 * Adds the specified class to the beginning of the class list on the
 * passed node. This gives the specified class the highest precidence
 * when style cascading is calculated for the node. Returns true or
 * false; indicating success or failure of the operation, respectively.
 */
dojo.html.prependClass = function(node, classStr){
	classStr += " " + dojo.html.getClass(node);
	return dojo.html.setClass(node, classStr);
}

/**
 * Adds the specified class to the end of the class list on the
 *	passed &node;. Returns &true; or &false; indicating success or failure.
 */
dojo.html.addClass = function(node, classStr){
	if (dojo.html.hasClass(node, classStr)) {
	  return false;
	}
	classStr = (dojo.html.getClass(node) + " " + classStr).replace(/^\s+|\s+$/g,"");
	return dojo.html.setClass(node, classStr);
}

/**
 *	Clobbers the existing list of classes for the node, replacing it with
 *	the list given in the 2nd argument. Returns true or false
 *	indicating success or failure.
 */
dojo.html.setClass = function(node, classStr){
	node = dojo.byId(node);
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
		dojo.debug("dojo.html.setClass() failed", e);
	}
	return true;
}

/**
 * Removes the className from the node;. Returns
 * true or false indicating success or failure.
 */ 
dojo.html.removeClass = function(node, classStr, allowPartialMatches){

	//dojo.debug("was class "+dojo.html.getClass(node));
	try{
		if (!allowPartialMatches) {
			var newcs = dojo.html.getClass(node).replace(new RegExp('(^|\\s+)'+classStr+'(\\s+|$)'), "$1$2");
		} else {
			var newcs = dojo.html.getClass(node).replace(classStr,'');
		}
		dojo.html.setClass(node, newcs);
		//dojo.debug("now class "+newcs)
	}catch(e){
		dojo.debug("dojo.html.removeClass() failed", e);
	}

	return true;
}

/**
 * Replaces 'oldClass' and adds 'newClass' to node
 */
dojo.html.replaceClass = function(node, newClass, oldClass) {
	dojo.html.removeClass(node, oldClass);
	dojo.html.addClass(node, newClass);
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
dojo.html.getElementsByClass = function(classStr, parent, nodeType, classMatchType, useNonXpath){
	var _document = dojo.doc();
	parent = dojo.byId(parent) || _document;
	var classes = classStr.split(/\s+/g);
	var nodes = [];
	if( classMatchType != 1 && classMatchType != 2 ) classMatchType = 0; // make it enum
	var reClass = new RegExp("(\\s|^)((" + classes.join(")|(") + "))(\\s|$)");
	var srtLength = classes.join(" ").length;
	var candidateNodes = [];
	
	if(!useNonXpath && _document.evaluate) { // supports dom 3 xpath
		var xpath = "//" + (nodeType || "*") + "[contains(";
		if(classMatchType != dojo.html.classMatchType.ContainsAny){
			xpath += "concat(' ',@class,' '), ' " +
			classes.join(" ') and contains(concat(' ',@class,' '), ' ") +
			" ')";
			if (classMatchType == 2) {
				xpath += " and string-length(@class)="+srtLength+"]";
			}else{
				xpath += "]";
			}
		}else{
			xpath += "concat(' ',@class,' '), ' " +
			classes.join(" ')) or contains(concat(' ',@class,' '), ' ") +
			" ')]";
		}
		var xpathResult = _document.evaluate(xpath, parent, null, XPathResult.ANY_TYPE, null);
		var result = xpathResult.iterateNext();
		while(result){
			try{
				candidateNodes.push(result);
				result = xpathResult.iterateNext();
			}catch(e){ break; }
		}
		return candidateNodes;
	}else{
		if(!nodeType){
			nodeType = "*";
		}
		candidateNodes = parent.getElementsByTagName(nodeType);

		var node, i = 0;
		outer:
		while(node = candidateNodes[i++]){
			var nodeClasses = dojo.html.getClasses(node);
			if(nodeClasses.length == 0){ continue outer; }
			var matches = 0;
	
			for(var j = 0; j < nodeClasses.length; j++){
				if(reClass.test(nodeClasses[j])){
					if(classMatchType == dojo.html.classMatchType.ContainsAny){
						nodes.push(node);
						continue outer;
					}else{
						matches++;
					}
				}else{
					if(classMatchType == dojo.html.classMatchType.IsOnly){
						continue outer;
					}
				}
			}
	
			if(matches == classes.length){
				if(	(classMatchType == dojo.html.classMatchType.IsOnly)&&
					(matches == nodeClasses.length)){
					nodes.push(node);
				}else if(classMatchType == dojo.html.classMatchType.ContainsAll){
					nodes.push(node);
				}
			}
		}
		return nodes;
	}
}

dojo.html.getElementsByClassName = dojo.html.getElementsByClass;

/**
 * Returns the mouse position relative to the document (not the viewport).
 * For example, if you have a document that is 10000px tall,
 * but your browser window is only 100px tall,
 * if you scroll to the bottom of the document and call this function it
 * will return {x: 0, y: 10000}
 */
dojo.html.getCursorPosition = function(e){
	e = e || dojo.global().event;
	var cursor = {x:0, y:0};
	if(e.pageX || e.pageY){
		cursor.x = e.pageX;
		cursor.y = e.pageY;
	}else{
		var de = dojo.doc().documentElement;
		var db = dojo.body();
		cursor.x = e.clientX + ((de||db)["scrollLeft"]) - ((de||db)["clientLeft"]);
		cursor.y = e.clientY + ((de||db)["scrollTop"]) - ((de||db)["clientTop"]);
	}
	return cursor;
}

dojo.html.overElement = function(element, e){
	element = dojo.byId(element);
	var mouse = dojo.html.getCursorPosition(e);

	with(dojo.html){
		var top = getAbsoluteY(element, true);
		var bottom = top + getInnerHeight(element);
		var left = getAbsoluteX(element, true);
		var right = left + getInnerWidth(element);
	}
	
	return (mouse.x >= left && mouse.x <= right &&
		mouse.y >= top && mouse.y <= bottom);
}

dojo.html.setActiveStyleSheet = function(title){
	var i = 0, a, els = dojo.doc().getElementsByTagName("link");
	while (a = els[i++]) {
		if(a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")){
			a.disabled = true;
			if (a.getAttribute("title") == title) { a.disabled = false; }
		}
	}
}

dojo.html.getActiveStyleSheet = function(){
	var i = 0, a, els = dojo.doc().getElementsByTagName("link");
	while (a = els[i++]) {
		if (a.getAttribute("rel").indexOf("style") != -1 &&
			a.getAttribute("title") && !a.disabled) { return a.getAttribute("title"); }
	}
	return null;
}

dojo.html.getPreferredStyleSheet = function(){
	var i = 0, a, els = dojo.doc().getElementsByTagName("link");
	while (a = els[i++]) {
		if(a.getAttribute("rel").indexOf("style") != -1
			&& a.getAttribute("rel").indexOf("alt") == -1
			&& a.getAttribute("title")) { return a.getAttribute("title"); }
	}
	return null;
}

dojo.html.body = function(){
	dojo.deprecated("dojo.html.body() moved to dojo.body()", "0.5");
	return dojo.body();
}

/**
 * Like dojo.dom.isTag, except case-insensitive
**/
dojo.html.isTag = function(node /* ... */) {
	node = dojo.byId(node);
	if(node && node.tagName) {
		var arr = dojo.lang.map(dojo.lang.toArray(arguments, 1),
			function(a) { return String(a).toLowerCase(); });
		return arr[ dojo.lang.find(node.tagName.toLowerCase(), arr) ] || "";
	}
	return "";
}

dojo.html.copyStyle = function(target, source){
	// work around for opera which doesn't have cssText, and for IE which fails on setAttribute 
	if(dojo.lang.isUndefined(source.style.cssText)){ 
		target.setAttribute("style", source.getAttribute("style")); 
	}else{
		target.style.cssText = source.style.cssText; 
	}
	dojo.html.addClass(target, dojo.html.getClass(source));
}

dojo.html._callExtrasDeprecated = function(inFunc, args) {
	var module = "dojo.html.extras";
	dojo.deprecated("dojo.html." + inFunc, "moved to " + module, "0.4");
	dojo["require"](module); // weird syntax to fool list-profile-deps (build)
	return dojo.html[inFunc].apply(dojo.html, args);
}

dojo.html.createNodesFromText = function() {
	return dojo.html._callExtrasDeprecated('createNodesFromText', arguments);
}

dojo.html.gravity = function() {
	return dojo.html._callExtrasDeprecated('gravity', arguments);
}

dojo.html.placeOnScreen = function() {
	return dojo.html._callExtrasDeprecated('placeOnScreen', arguments);
}

dojo.html.placeOnScreenPoint = function() {
	return dojo.html._callExtrasDeprecated('placeOnScreenPoint', arguments);
}

dojo.html.renderedTextContent = function() {
	return dojo.html._callExtrasDeprecated('renderedTextContent', arguments);
}

dojo.html.BackgroundIframe = function() {
	return dojo.html._callExtrasDeprecated('BackgroundIframe', arguments);
}
