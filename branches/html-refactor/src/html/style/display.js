dojo.provide("dojo.html.style.display");

dojo.require("dojo.html.style.common");
dojo.require("dojo.graphics.color");
dojo.require("dojo.lang.common");

dojo.html.getBackgroundColor = function(node){
	node = dojo.byId(node);
	var color;
	do{
		color = dojo.html.getStyle(node, "background-color");
		// Safari doesn't say "transparent"
		if(color.toLowerCase() == "rgba(0, 0, 0, 0)") { color = "transparent"; }
		if(node == document.getElementsByTagName("body")[0]) { node = null; break; }
		node = node.parentNode;
	}while(node && dojo.lang.inArray(color, ["transparent", ""]));
	if(color == "transparent"){
		color = [255, 255, 255, 0];
	}else{
		color = dojo.graphics.color.extractRGB(color);
	}
	return color;
}

dojo.html._toggle = function(node, tester, setter){
	node = dojo.byId(node);
	setter(node, !tester(node));
	return tester(node);
}

// show/hide are library constructs

// show() 
// if the node.style.display == 'none' then 
// set style.display to '' or the value cached by hide()
dojo.html.show = function(node){
	node = dojo.byId(node);
	if(dojo.html.getStyleProperty(node, 'display')=='none'){
		dojo.html.setStyle(node, 'display', (node.dojoDisplayCache||''));
		node.dojoDisplayCache = undefined;	// cannot use delete on a node in IE6
	}
}

// if the node.style.display == 'none' then 
// set style.display to '' or the value cached by hide()
dojo.html.hide = function(node){
	node = dojo.byId(node);
	if(typeof node["dojoDisplayCache"] == "undefined"){ // it could == '', so we cannot say !node.dojoDisplayCount
		var d = dojo.html.getStyleProperty(node, 'display')
		if(d!='none'){
			node.dojoDisplayCache = d;
		}
	}
	dojo.html.setStyle(node, 'display', 'none');
}

// setShowing() calls show() if showing is true, hide() otherwise
dojo.html.setShowing = function(node, showing){
	dojo.html[(showing ? 'show' : 'hide')](node);
}

// isShowing() is true if the node.style.display is not 'none'
// FIXME: returns true if node is bad, isHidden would be easier to make correct
dojo.html.isShowing = function(node){
	return (dojo.html.getStyleProperty(node, 'display') != 'none');
}

// Call setShowing() on node with the complement of isShowing(), then return the new value of isShowing()
dojo.html.toggleShowing = function(node){
	return dojo.html._toggle(node, dojo.html.isShowing, dojo.html.setShowing);
}

// display is a CSS concept

// Simple mapping of tag names to display values
// FIXME: simplistic 
dojo.html.displayMap = { tr: '', td: '', th: '', img: 'inline', span: 'inline', input: 'inline', button: 'inline' };

// Suggest a value for the display property that will show 'node' based on it's tag
dojo.html.suggestDisplayByTagName = function(node)
{
	node = dojo.byId(node);
	if(node && node.tagName){
		var tag = node.tagName.toLowerCase();
		return (tag in dojo.html.displayMap ? dojo.html.displayMap[tag] : 'block');
	}
}

// setDisplay() sets the value of style.display to value of 'display' parameter if it is a string.
// Otherwise, if 'display' is false, set style.display to 'none'.
// Finally, set 'display' to a suggested display value based on the node's tag
dojo.html.setDisplay = function(node, display){
	dojo.html.setStyle(node, 'display', (dojo.lang.isString(display) ? display : (display ? dojo.html.suggestDisplayByTagName(node) : 'none')));
}

// isDisplayed() is true if the the computed display style for node is not 'none'
// FIXME: returns true if node is bad, isNotDisplayed would be easier to make correct
dojo.html.isDisplayed = function(node){
	return (dojo.html.getComputedStyle(node, 'display') != 'none');
}

// Call setDisplay() on node with the complement of isDisplayed(), then
// return the new value of isDisplayed()
dojo.html.toggleDisplay = function(node){
	return dojo.html._toggle(node, dojo.html.isDisplayed, dojo.html.setDisplay);
}

// visibility is a CSS concept

// setVisibility() sets the value of style.visibility to value of
// 'visibility' parameter if it is a string.
// Otherwise, if 'visibility' is false, set style.visibility to 'hidden'.
// Finally, set style.visibility to 'visible'.
dojo.html.setVisibility = function(node, visibility){
	dojo.html.setStyle(node, 'visibility', (dojo.lang.isString(visibility) ? visibility : (visibility ? 'visible' : 'hidden')));
}

// isVisible() is true if the the computed visibility style for node is not 'hidden'
// FIXME: returns true if node is bad, isInvisible would be easier to make correct
dojo.html.isVisible = function(node){
	return (dojo.html.getComputedStyle(node, 'visibility') != 'hidden');
}

// Call setVisibility() on node with the complement of isVisible(), then
// return the new value of isVisible()
dojo.html.toggleVisibility = function(node){
	return dojo.html._toggle(node, dojo.html.isVisible, dojo.html.setVisibility);
}
