dojo.provide("dojo.html.style.position");
dojo.require("dojo.html.common");
dojo.require("dojo.html.style.util");

dojo.html.getAbsolutePosition = dojo.html.abs = function(node, includeScroll){
	node = dojo.byId(node);
	var ret = {
		x: 0,
		y: 0
	};
	var scroll = dojo.html.getScroll();

	var h = dojo.render.html;
	var db = document["body"]||document["documentElement"];

	if(h.ie){
		with(node.getBoundingClientRect()){
			ret.x = left-2;
			ret.y = top-2;
		}
	}else if(document.getBoxObjectFor){
		// mozilla
		var bo = document.getBoxObjectFor(node);
		ret.x = bo.x - dojo.html.sumAncestorProperties(node, "scrollLeft");
		ret.y = bo.y - dojo.html.sumAncestorProperties(node, "scrollTop");
	}else{
		if(node["offsetParent"]){
			var endNode;		
			// in Safari, if the node is an absolutely positioned child of
			// the body and the body has a margin the offset of the child
			// and the body contain the body's margins, so we need to end
			// at the body
			if(	(h.safari)&&
				(node.style.getPropertyValue("position") == "absolute")&&
				(node.parentNode == db)){
				endNode = db;
			}else{
				endNode = db.parentNode;
			}

			if(node.parentNode != db){
				var nd = node;
				if(window.opera){ nd = db; }
				ret.x -= dojo.html.sumAncestorProperties(nd, "scrollLeft");
				ret.y -= dojo.html.sumAncestorProperties(nd, "scrollTop");
			}
			do{
				var n = node["offsetLeft"];
				ret.x += isNaN(n) ? 0 : n;
				var m = node["offsetTop"];
				ret.y += isNaN(m) ? 0 : m;
				node = node.offsetParent;
			}while((node != endNode)&&(node != null));
		}else if(node["x"]&&node["y"]){
			ret.x += isNaN(node.x) ? 0 : node.x;
			ret.y += isNaN(node.y) ? 0 : node.y;
		}
	}

	// account for document scrolling!
	if(includeScroll){
		ret.y += scroll.top;
		ret.x += scroll.left;
	}

	ret.top = ret.y;
	ret.left = ret.x;

	return ret;
}

dojo.html.getTotalOffset = function(node, type, includeScroll){
	dojo.deprecated("dojo.html.getTotalOffset", "replaced by dojo.html.getAbsolutePosition().(top|left)", "0.4");
	return dojo.html.getAbsolutePosition(node, includeScroll)[type];
}

dojo.html.getAbsoluteX = function(node, includeScroll){
	dojo.deprecated("dojo.html.getAbsoluteX", "replaced by dojo.html.getAbsolutePosition().x", "0.4");
	return dojo.html.getAbsolutePosition(node, includeScroll).x;
}

dojo.html.getAbsoluteY = function(node, includeScroll){
	dojo.deprecated("dojo.html.getAbsoluteY", "replaced by dojo.html.getAbsolutePosition().y", "0.4");
	return dojo.html.getAbsolutePosition(node, includeScroll).y;
}

dojo.html.totalOffsetLeft = function(node, includeScroll){
	dojo.deprecated("dojo.html.totalOffsetLeft", "replaced by dojo.html.getAbsolutePosition().left", "0.4");
	return dojo.html.getAbsoluteX(node, includeScroll);
}

dojo.html.totalOffsetTop = function(node, includeScroll){
	dojo.deprecated("dojo.html.totalOffsetTop", "replaced by dojo.html.getAbsolutePosition().top", "0.4");
	return dojo.html.getAbsoluteY(node, includeScroll);
}
