dojo.provide("dojox.grid.compat._grid.drag");

// summary:
//	utility functions for dragging as used in grid.

(function(){

var dgdrag = dojox.grid.drag = { dragging:false, hysteresis: 2 };

dgdrag.capture = function(inElement) {
	if (inElement.setCapture) {
		inElement.setCapture();}
	else {
		dojo.doc.addEventListener("mousemove", inElement.onmousemove, true);
		dojo.doc.addEventListener("mouseup", inElement.onmouseup, true);
		dojo.doc.addEventListener("click", inElement.onclick, true);
	}
};

dgdrag.release = function(inElement) {
	//console.debug('dojox.grid.drag.release');
	if(inElement.releaseCapture){
		inElement.releaseCapture();
	}else{
		dojo.doc.removeEventListener("click", inElement.onclick, true);
		dojo.doc.removeEventListener("mouseup", inElement.onmouseup, true);
		dojo.doc.removeEventListener("mousemove", inElement.onmousemove, true);
	}
};

dgdrag.start = function(inElement, inOnDrag, inOnEnd, inEvent, inOnStart){
	if(/*dgdrag.elt ||*/ !inElement || dojo.grid.drag.dragging){
		console.debug('failed to start drag: bad input node or already dragging');
		return;
	}
	var dgdrag = dojo.grid.drag;

	dgdrag.dragging = true;
	dgdrag.elt = inElement;
	dgdrag.events = {
		drag: inOnDrag || dojox.grid.nop, 
		end: inOnEnd || dojox.grid.nop, 
		start: inOnStart || dojox.grid.nop, 
		oldmove: inElement.onmousemove, 
		oldup: inElement.onmouseup, 
		oldclick: inElement.onclick 
	};
	dgdrag.positionX = (inEvent && ('screenX' in inEvent) ? inEvent.screenX : false);
	dgdrag.positionY = (inEvent && ('screenY' in inEvent) ? inEvent.screenY : false);
	dgdrag.started = (dgdrag.position === false);
	inElement.onmousemove = dgdrag.mousemove;
	inElement.onmouseup = dgdrag.mouseup;
	inElement.onclick = dgdrag.click;
	dgdrag.capture(dgdrag.elt);
};

dgdrag.end = function(){
	var dgdrag = dojo.grid.drag;

	dgdrag.release(dgdrag.elt);
	dgdrag.elt.onmousemove = dgdrag.events.oldmove;
	dgdrag.elt.onmouseup = dgdrag.events.oldup;
	dgdrag.elt.onclick = dgdrag.events.oldclick;
	dgdrag.elt = null;
	try{
		if(dgdrag.started){
			dgdrag.events.end();
		}
	}finally{
		dgdrag.dragging = false;
	}
};

dgdrag.calcDelta = function(inEvent){
	var dgdrag = dojo.grid.drag;

	inEvent.deltaX = inEvent.screenX - dgdrag.positionX;
	inEvent.deltaY = inEvent.screenY - dgdrag.positionY;
};

dgdrag.hasMoved = function(inEvent){
	var dgdrag = dojo.grid.drag;

	return Math.abs(inEvent.deltaX) + Math.abs(inEvent.deltaY) > dgdrag.hysteresis;
};

dgdrag.mousemove = function(inEvent){
	var dgdrag = dojo.grid.drag;

	inEvent = dojo.fixEvent(inEvent);
	dojo.stopEvent(inEvent);
	dgdrag.calcDelta(inEvent);
	if((!dgdrag.started)&&(dgdrag.hasMoved(inEvent))){
		dgdrag.events.start(inEvent);
		dgdrag.started = true;
	}
	if(dgdrag.started){
		dgdrag.events.drag(inEvent);
	}
};

dgdrag.mouseup = function(inEvent){
	dojo.stopEvent(dojo.fixEvent(inEvent));
	dojo.grid.drag.end();
};

dgdrag.click = function(inEvent){
	dojo.stopEvent(dojo.fixEvent(inEvent));
};

dgdrag = null;

})();