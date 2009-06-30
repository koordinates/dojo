dojo.provide("dojo.dnd.autoscroll");
dojo.required("dojo.dnd.common");

// DOCME: Requirements?

dojo.dnd.getViewport = function(){
	// summary: returns a viewport size (visible part of the window)

	// TODO: Feature test for broken documentElement.clientHeight (as seen in Opera 8)

	// NOTE: Should go in window module

	var fn, d = window.document, dd = d.documentElement;

	if (typeof d.clientWidth == 'number') {

		// Use document.client* when present (rare)

		fn = function() {
			var d = dojo.doc;
			return { w: d.clientWidth, h: d.clientHeight };
		};
	} else if (typeof dd.clientWidth == 'number') {

		// Use container otherwise (most modern browsers should stop here)

		fn = function() {
			var dd = dojo.doc.documentElement;

			// NOTE: Call to body method necessary only for XML parse mode

			var container = dd.clientWidth ? dd : dojo.body();
			return { w: container.clientWidth, h: container.clientHeight };
		};
	} else if (typeof window.innerWidth == 'number') {

		// Bad news here, includes scroll bars

		fn = function() {
			var w = dojo.global.window;
			return { w: w.innerWidth, h: w.innerHeight };
		};
	} else {

		// For backwards compatibility

		fn = function() {
			return null;
		};
	}

	d = dd = null; // Discard unneeded host object references

	dojo.dnd.getViewport = fn; // Lazy pattern

	return fn(); // Object
};

dojo.dnd.V_TRIGGER_AUTOSCROLL = 32;
dojo.dnd.H_TRIGGER_AUTOSCROLL = 32;

dojo.dnd.V_AUTOSCROLL_VALUE = 16;
dojo.dnd.H_AUTOSCROLL_VALUE = 16;

dojo.dnd.autoScroll = function(e){
	// summary:
	//		a handler for onmousemove event, which scrolls the window, if
	//		necesary
	// e: Event:
	//		onmousemove event

	// FIXME: needs more docs!

	var win = dojo.global.window;

	// FIXME: mouse position logic

	var v = dojo.dnd.getViewport(), dx = 0, dy = 0;
	if(e.clientX < dojo.dnd.H_TRIGGER_AUTOSCROLL){
		dx = -dojo.dnd.H_AUTOSCROLL_VALUE;
	}else if(e.clientX > v.w - dojo.dnd.H_TRIGGER_AUTOSCROLL){
		dx = dojo.dnd.H_AUTOSCROLL_VALUE;
	}
	if(e.clientY < dojo.dnd.V_TRIGGER_AUTOSCROLL){
		dy = -dojo.dnd.V_AUTOSCROLL_VALUE;
	}else if(e.clientY > v.h - dojo.dnd.V_TRIGGER_AUTOSCROLL){
		dy = dojo.dnd.V_AUTOSCROLL_VALUE;
	}
	win.scrollBy(dx, dy);
};

dojo.dnd._validNodes = {"div": 1, "p": 1, "td": 1};
dojo.dnd._validOverflow = {"auto": 1, "scroll": 1};

dojo.dnd.autoScrollNodes = function(e){
	// summary:
	//		a handler for onmousemove event, which scrolls the first avaialble
	//		Dom element, it falls back to dojo.dnd.autoScroll()
	// e: Event:
	//		onmousemove event

	// FIXME: needs more docs!
	for(var n = e.target; n;){
		if(n.nodeType == 1 && (n.tagName.toLowerCase() in dojo.dnd._validNodes)){
			var s = dojo.getComputedStyle(n);
			if(s.overflow.toLowerCase() in dojo.dnd._validOverflow){
				var b = dojo._getContentBox(n, s), t = dojo._abs(n, true);

				// FIXME: mouse position logic

				var w = Math.min(dojo.dnd.H_TRIGGER_AUTOSCROLL, b.w / 2), 
					h = Math.min(dojo.dnd.V_TRIGGER_AUTOSCROLL, b.h / 2),
					rx = e.pageX - t.x, ry = e.pageY - t.y, dx = 0, dy = 0;
				if(rx > 0 && rx < b.w){
					if(rx < w){
						dx = -w;
					}else if(rx > b.w - w){
						dx = w;
					}
				}
				if(ry > 0 && ry < b.h){
					if(ry < h){
						dy = -h;
					}else if(ry > b.h - h){
						dy = h;
					}
				}
				var oldLeft = n.scrollLeft, oldTop = n.scrollTop;
				n.scrollLeft = n.scrollLeft + dx;
				n.scrollTop  = n.scrollTop  + dy;
				if(oldLeft != n.scrollLeft || oldTop != n.scrollTop){ return; }
			}
		}
		try{
			n = n.parentNode;
		}catch(x){
			n = null;
		}
	}
	dojo.dnd.autoScroll(e);
};
