dojo.require("dojo.html.common");
dojo.require("dojo.html.style.position");
dojo.provide("dojo.html.style.util");

dojo.html.sumAncestorProperties = function(node, prop){
	node = dojo.byId(node);
	if(!node){ return 0; } // FIXME: throw an error?
	
	var retVal = 0;
	while(node){
		var val = node[prop];
		if(val){
			retVal += val - 0;
			if(node==dojo.html.body()){ break; }// opera and khtml #body & #html has the same values, we only need one value
		}
		node = node.parentNode;
	}
	return retVal;
}

dojo.html.getMarginExtent = function(node, side){
	return dojo.html._sumPixelValues(node, ["margin-" + side], dojo.html.isPositionAbsolute(node));
}

dojo.html.getPaddingExtent = function(node, side){
	return dojo.html._sumPixelValues(node, ["padding-" + side], true);
}
