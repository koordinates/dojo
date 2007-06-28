dojo.provide("dojo.dnd.common");

if(navigator.appVersion.indexOf("Macintosh") < 0){
	dojo.dnd.multiSelectKey = function(e) {
		// summary: abstracts away the difference between selection on Mac and PC
		// e: Event: mouse event
		return e.ctrlKey;	// Boolean
	};
}else{
	dojo.dnd.multiSelectKey = function(e) {
		// summary: abstracts away the difference between selection on Mac and PC
		// e: Event: mouse event
		return e.metaKey;	// Boolean
	};
}

dojo.dnd._copyKey = navigator.appVersion.indexOf("Macintosh") < 0 ? "ctrlKey" : "metaKey";

dojo.dnd.getCopyKeyState = function(e) {
	// summary: abstracts away the difference between selection on Mac and PC,
	//	and returns the state of the "copy" key to be pressed.
	// e: Event: mouse event
	return e[dojo.dnd._copyKey];	// Boolean
};

dojo.dnd._uniqueId = 0;
dojo.dnd.getUniqueId = function(){
	// summary: returns a unique string for use with any DOM element
	var id;
	do{
		id = "dojoUnique" + (++dojo.dnd._uniqueId);
	}while(dojo.byId(id));
	return id;
};