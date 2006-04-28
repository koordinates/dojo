dojo.provide("dojo.lfx.extras");

dojo.require("dojo.lfx");
dojo.require("dojo.lfx.Animation");

dojo.lfx.fadeWipeIn = function(node, duration, easing, callback){
	var node = dojo.byId(node);
	var anim = dojo.lfx.combine(
		dojo.lfx.wipeIn(node, duration, easing),
		dojo.lfx.fadeIn(node, duration, easing));
	
	if(callback){
		dojo.event.connect(anim, "onEnd", function(){
			callback(node, anim);
		});
	}
	
	return anim;
}

dojo.lfx.fadeWipeOut = function(node, duration, easing, callback){
	var node = dojo.byId(node);
	var anim = dojo.lfx.combine(dojo.lfx.wipeOut(node, duration, easing), dojo.lfx.fadeOut(node, duration, easing));
	
	if(callback){
		dojo.event.connect(anim, "onEnd", function(){
			callback(node, anim);
		});
	}

	return anim;
}

dojo.lfx.scale = function(node, percentage, scaleContent, fromCenter, duration, easing, callback){
	var node = dojo.byId(node);
	var origWidth = dojo.style.getOuterWidth(node);
	var origHeight = dojo.style.getOuterHeight(node);

	var actualPct = percentage/100.0;
	var props = [
		{	property: "width",
			start: origWidth,
			end: origWidth * actualPct
		},
		{	property: "height",
			start: origHeight,
			end: origHeight * actualPct
		}];
	
	if(scaleContent){
		var fontSize = dojo.style.getStyle(node, 'font-size');
		var fontSizeType = null;
		if(!fontSize){
			fontSize = parseFloat('100%');
			fontSizeType = '%';
		}else{
			dojo.lang.some(['em','px','%'], function(item, index, arr){
				if(fontSize.indexOf(item)>0){
					fontSize = parseFloat(fontSize);
					fontSizeType = item;
					return true;
				}
			});
		}
		props.push({
			property: "font-size",
			start: fontSize,
			end: fontSize * actualPct,
			units: fontSizeType });
	}
	
	if(fromCenter){
		var positioning = dojo.style.getStyle(node, "position");
		var originalTop = node.offsetTop;
		var originalLeft = node.offsetLeft;
		var endTop = ((origHeight * actualPct) - origHeight)/2;
		var endLeft = ((origWidth * actualPct) - origWidth)/2;
		props.push({
			property: "top",
			start: originalTop,
			end: (positioning == "absolute" ? originalTop - endTop : (-1*endTop))
		});
		props.push({
			property: "left",
			start: originalLeft,
			end: (positioning == "absolute" ? originalLeft - endLeft : (-1*endLeft))
		});
	}
	
	var anim = dojo.lfx.propertyAnimation(node, props, duration, easing);
	if(callback){
		dojo.event.connect(anim, "onEnd", function(){
			callback(node, anim);
		});
	}
	
	return anim;
}