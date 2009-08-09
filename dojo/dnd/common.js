dojo.provide("dojo.dnd.common");

dojo.dnd.getCopyKeyState = function(e) {
	// summary: abstracts away the difference between selection on Mac and PC,
	//	and returns the state of the "copy" key to be pressed.
	// e: Event: mouse event
	return typeof e.ctrlKey == 'boolean' ? e.ctrlKey : e.metaKey;	// Boolean
};

dojo.dnd._uniqueId = 0;
dojo.dnd.getUniqueId = function(){
	// summary: returns a unique string for use with any DOM element
	var id;
	do{
		id = dojo._scopeName + "Unique" + (++dojo.dnd._uniqueId);
	}while(dojo.byId(id));
	return id;
};

dojo.dnd._empty = {};

dojo.dnd.isFormElement = function(/*Event*/ e){
	// summary: returns true, if user clicked on a form element
	var t = e.target;
	if(t.nodeType == 3 /*TEXT_NODE*/){
		t = t.parentNode;
	}
	return (/^(button|textarea|input|select|option)$/i).test(t.tagName);	// Boolean
};

// doesn't take into account when multiple buttons are pressed

// FIXME: This logic should be in event module
// DOCME: What calls this and why is it marked private?

dojo.dnd._isLmbPressed = function(e){
      if (typeof e.which != 'undefined') {
        return (e.which == 1);
      }
      return e.button & 1; // Intentional bitwise - and - operation
};
