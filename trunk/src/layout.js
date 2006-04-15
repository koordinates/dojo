/**
 * Layout a bunch of child dom nodes within a parent dom node
 * Input is an array of objects like:
 * @ container - parent node
 * @ layoutPriority - "top-bottom" or "left-right"
 * @ children an array like [ {domNode: foo, layoutAlign: "bottom" }, {domNode: bar, layoutAlign: "client"} ]
 */
 
dojo.provide("dojo.layout");

dojo.require("dojo.lang");
dojo.require("dojo.style");

dojo.layout = function(container, children, layoutPriority) {
	// container must be either relative or absolute position so that we
	// can position nodes inside of it
	var position=dojo.style.getStyle(container, "position");
	if(position != "absolute" && position != "relative"){
		dojo.style.setStyle(container, "position", "relative");
	}

	// copy children array and remove elements w/out layout
	children = dojo.lang.filter(children, function(child){
		return dojo.lang.inArray(["top","bottom","left","right","client","flood"], child.layoutAlign)
	});

	// order the children according to layoutPriority
	if(layoutPriority && layoutPriority!="none"){
		var rank = function(child){
			switch(child.layoutAlign){
				case "flood":
					return 1;
				case "left":
				case "right":
					return (layoutPriority=="left-right") ? 2 : 3;
				case "top":
				case "bottom":
					return (layoutPriority=="left-right") ? 3 : 2;
				default:
					return 4;
			}
		};
		children.sort(function(a,b){ return rank(a)-rank(b); });
	}

	// record the width/height of all the floating elements added so far (plus padding)
	var usedSpace={
		'left': dojo.style.getPixelValue(container, "padding-left", true),
		'right': dojo.style.getPixelValue(container, "padding-right", true),
		'top': dojo.style.getPixelValue(container, "padding-top", true),
		'bottom': dojo.style.getPixelValue(container, "padding-bottom", true)
	};

	// track how much space is remaining
	var remainingWidth  = dojo.style.getContentWidth(container);
	var remainingHeight =  dojo.style.getContentHeight(container);

	// set positions/sizes
	dojo.lang.forEach(children, function(child){
		var elm=child.domNode;
		var position=child.layoutAlign;

		// set two of left/right/top/bottom properties
		elm.style.position="absolute";
		var lr = (position=="right")?"right":"left";
		elm.style[lr]=usedSpace[lr] + "px";
		var tb = (position=="bottom")?"bottom":"top";
		elm.style[tb]=usedSpace[tb] + "px";

		// set size && adjust record of remaining space.
		// note that setting the width of a <div> may affect it's height.
		// TODO: same is true for widgets but need to implement API to support that
		if ( (position=="top")||(position=="bottom") ) {
			dojo.style.setOuterWidth(elm, remainingWidth);
			var h = dojo.style.getOuterHeight(elm);
			usedSpace[position] += h;
			remainingHeight -= h;
		}else if(position=="left" || position=="right"){
			dojo.style.setOuterHeight(elm, remainingHeight);
			var w = dojo.style.getOuterWidth(elm);
			usedSpace[position] += w;
			remainingWidth -= w;
		} else if(position=="flood" || position=="client"){
			dojo.style.setOuterWidth(elm, remainingWidth);
			dojo.style.setOuterHeight(elm, remainingHeight);
		}
		if(child.onResized){
			child.onResized();
		}
	});
};