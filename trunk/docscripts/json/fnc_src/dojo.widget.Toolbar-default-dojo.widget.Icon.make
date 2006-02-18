for(var i = 0; i < arguments.length; i++) {
	if(arguments[i] instanceof dojo.widget.Icon) {
		return arguments[i];
	} else if(!arguments[i]) {
		nullArgs++;
	}
}

return new dojo.widget.Icon(a,b,c,d);