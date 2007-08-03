dojo.provide("dojox.fx._base");
dojo.experimental("dojox.fx");

dojo.require("dojo.fx"); 

// FIXME: dojox.fx is not defined yet. is this how we do this? 
dojox.fx = {}; 

// convenience functions/maps
// FIXME: i like the idea of doing this in dojox, but is it sound?
dojox.fx.chain = dojo.fx.chain;
dojox.fx.combine = dojo.fx.combine;
dojox.fx.slideIn = dojo.fx.slideIn;
dojox.fx.slideOut = dojo.fx.slideOut;
dojox.fx.slideTo = dojo.fx.slideTo;

dojox.fx.sizeTo = function(/* Object */args){
	// summary:
	//		Returns an animation that will size "node" 
	//		defined in args Object about it's center to
	//		a width and height defined by (args.width, args.height), 
	//		supporting an optional method: chain||combine mixin
	//		(defaults to chain).	
	//		
	//		- works best on absolutely or relatively positioned
	//		elements? 
	//	
	// example:
	//
	//	dojo.fx.sizeTo({ node:'myNode',
	//		duration: 1000,
	//		width: 400,
	//		height: 200,
	//		method: "chain"
	//	}).play();
	//
	//
	var node = args.node = dojo.byId(args.node);
	var compute = dojo.getComputedStyle;
	var method = args.method || "chain"; 

	if (method=="chain"){ args.duration = args.duration/2; } 
	
	var top, newTop, left, newLeft, width, height = null;

	var init = (function(){
		var innerNode = node;
		return function(){
			var pos = compute(innerNode).position;
			top = (pos == 'absolute' ? node.offsetTop : parseInt(compute(node).top) || 0);
			left = (pos == 'absolute' ? node.offsetLeft : parseInt(compute(node).left) || 0);
			width = parseInt(dojo.style(node,'width'));
			height = parseInt(dojo.style(node,'height'));

			newLeft = left - ((args.width - width)/2); 
			newTop = top - ((args.height - height)/2); 

			if(pos != 'absolute' && pos != 'relative'){
				var ret = dojo.coords(innerNode, true);
				top = ret.y;
				left = ret.x;
				innerNode.style.position="absolute";
				innerNode.style.top=top+"px";
				innerNode.style.left=left+"px";
			}
		}
	})();
	init(); // hmmm, do we need to init() or just the once beforeBegin?

	var anim1 = dojo.animateProperty(dojo.mixin({
		properties: {
			height: { start: height, end: args.height||1, unit:"px" },
			top: { start: top, end: newTop },
		}
	}, args));
	var anim2 = dojo.animateProperty(dojo.mixin({
		properties: {
			width: { start: width, end: args.width||1, unit:"px" },
			left: { start: left, end: newLeft }
		}
	}, args));

	// FIXME: 
	// dojo.fx[args.method]([anim1,anim2]); 	
	if(args.method == "combine"){
		var anim = dojo.fx.combine([anim1,anim2]);
	}else{
		var anim = dojo.fx.chain([anim1,anim2]);
	}
	dojo.connect(anim, "beforeBegin", anim, init);
	return anim; // dojo._Animation
}

dojox.fx.addClass = function(/* Object */args){
	// summary:
	//		returns an animation that will animate
	//		the properieds of a node to the properties
	//		defined in a standard CSS .class definition.
	//		(calculating the differences itself)
	//
	//		standard _Animation object rules apply. 
	//
	// additonal mixins:
	//
	//		args.class: String - class string (to be added onEnd)
	//		
	var node = args.node = dojo.byId(args.node); 

	var pushClass = (function(){
		// summary: onEnd we want to add the class to the node 
		//	(as dojo.addClass naturally would) in case our 
		//	class parsing misses anything the browser would 
		// 	otherwise interpret. this may cause some flicker,
		//	and will only apply the class so children can inherit 
		//	after the animation is done (potentially more flicker)
		var innerNode = node; // FIXME: why do we do this like this?
		return function(){
			dojo.addClass(innerNode, args.class); 
		}
	})();

	// _getCalculatedStleChanges is the core of our style/class animations
	var mixedProperties = dojox.fx._getCalculatedStyleChanges(args,true);
	var _anim = dojo.animateProperty(dojo.mixin({
		properties: mixedProperties
	},args));
	dojo.connect(_anim,"onEnd",_anim,pushClass); 
	return _anim; 

}

dojox.fx.removeClass = function(/* Object */args){
	// summary:
	//	returns an animation that will animate the properieds of a 
	// 	node (args.node) to the properties calculated after removing 
	//	a standard CSS className from a that node.
	//	
	//	calls dojo.removeClass(args.class) onEnd of animation		
	//
	//	standard dojo._Animation object rules apply. 
	//
	// additonal mixins:
	//
	//	args.class: String - class string (to be removed from node)
	//		
	var node = args.node = dojo.byId(args.node); 

	var pullClass = (function(){
		// summary: onEnd we want to remove the class from the node 
		//	(as dojo.removeClass naturally would) in case our class
		//	parsing misses anything the browser would otherwise 
		//	interpret. this may cause some flicker, and will only 
		//	apply the class so children can inherit after the
		//	animation is done (potentially more flicker)
		//
		var innerNode = node;
		return function(){
			dojo.removeClass(innerNode, args.class); 
		}
	})();

	var mixedProperties = dojox.fx._getCalculatedStyleChanges(args,false);
	var _anim = dojo.animateProperty(dojo.mixin({
		properties: mixedProperties
	},args));
	dojo.connect(_anim,"onEnd",_anim,pullClass); 
	return _anim; 
}

dojox.fx._allowedProperties = [
	// summary:
	//	this is our pseudo map of properties we will check for.
	//	it should be much more intuitive. a way to normalize and
	//	"predict" intent, or even something more clever ... 
	//	open to suggestions.

	"width",
	"height",

	// these need to be filtered through dojo.colors?
	"background", // normalize to:
	"backgroundImage", "backgroundColor",
	"color",

	"fontSize",

	/*
	"border", // the normalize on this one will be _hideous_ 
		(color/style/width)
		(left,top,right,bottom for each of _those_)
	*/

	// only if pos = absolute || relative?
	"left", "top", "right", "bottom", 

	"padding", // normalize to: 
	"paddingLeft", "paddingRight", "paddingTop", "paddingBottom",

	"margin", // normalize to:
	"marginLeft", "marginTop", "marginRight", "marginBottom",

	// unit import/delicate?:
	"lineHeight",
	"letterSpacing"
];

dojox.fx._getStyleSnapshot = function(/* Object */cache){
	// summary: 
	//	uses a dojo.getComputedStyle(node) cache reference and
	// 	iterates through the 'documented/supported animate-able'
	// 	properties. 
	//
	// returns:  Array
	//	an array of raw, calculcated values, to be normalized/compared
	//	elsewhere	

	var styleSnap = []; 
	dojo.forEach(dojox.fx._allowedProperties,function(style){
		styleSnap.push(cache[style]); 
	});
	return styleSnap; // Array
};

dojox.fx._getCalculatedStyleChanges = function(/* Object */args, /*Boolean*/addClass){
	// summary:
	//	calculate and normalize(?) the differences between two states
	//	of a node (args.node) by either quickly adding or removing 
	//	a class (and if that causes poor flicker later, we can attempt
	//	to create a cloned node offscreen and do other weird calculations
	//	
	// args:
	// 	we are expecting args.node (DomNode) and 
	//	args.class (class String)
	// 
	// addClass: 
	// 	true to calculate what adding a class would do, 
	// 	false to calculate what removing the class would do

	var node = args.node = dojo.byId(args.node); 
	var compute = dojo.getComputedStyle(node);

	// take our snapShots
	var _before = dojox.fx._getStyleSnapshot(compute);
	if (addClass) { dojo.addClass(node,args.class);
	}else{ dojo.removeClass(node,args.class); }

	var _after = dojox.fx._getStyleSnapshot(compute);
	if (addClass) { dojo.removeClass(node,args.class); 
	}else{ dojo.addClass(node,args.class);}

	// FIXME:  two of these above should work, but don't? anyone?
	// dojo[addClass ? "addClass" : "removeClass"](node,args.class); 

	var calculated = {};
	var i = 0;
	dojo.forEach(dojox.fx._allowedProperties,function(prop){
		if(_before[i] != _after[i]){
			var tmp = { end: parseInt(_after[i]), unit: 'px' }; 
			calculated[prop] = tmp; 
		} // else { console.log('should be the same: ',prop,_before[i],_after[i]); }
		i++;
	});
	return calculated; 
}
