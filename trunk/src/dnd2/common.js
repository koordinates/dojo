dojo.provide("dojo.dnd2.common");

dojo.dnd2.multiSelectKey = function(e) {
	// summary: abstracts away the difference between selection on Mac and PC
	// e: Event: mouse event
	return dojo.render.os.mac ? e.metaKey : e.ctrlKey;	// Boolean
};