// *** Fricking Eolas.  This is here to get around the Eolas issue.  Sigh. ***************
dojox.av.flash.place = function(node, kwArgs){
	node=dojo.byId(node);
	var o = dojox.av.flash.__ie_markup__(kwArgs);
	if(o){
		node.innerHTML = o.markup;
		return window[o.id];
	}
	return null;
}
dojox.av.flash.onInitialize();
