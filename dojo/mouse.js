define(["./_base/kernel", "./on", "./has", "./dom"], function(dojo, on, has, dom){
	
	/*=====
	dojo.mouse = {
	// summary:
	// 		This module provide mouse event handling utility functions and exports
	// 		mouseenter and mouseleave event emulation.
	// enter: Synthetic Event
	//		This is an extension event for the mouseenter that IE provides, emulating the
	//		behavior on other browsers.
	// leave: Synthetic Event
	//		This is an extension event for the mouseleave that IE provides, emulating the
	//		behavior on other browsers.
	// isLeft: Function
	//		Test an event object (from a mousedown event) to see if the left button was pressed.
	// isMiddle: Function
	//		Test an event object (from a mousedown event) to see if the middle button was pressed.
	// isRight: Function
	//		Test an event object (from a mousedown event) to see if the right button was pressed.
	// example:
	//		To use these events, you register a mouseenter like this:
	//		|	define(["dojo/on", dojo/mouse"], function(on, mouse){
	//		|		on(targetNode, mouse.enter, function(event){
	// 		|			dojo.addClass(targetNode, "highlighted");
	//		|		});
	//		|		on(targetNode, mouse.leave, function(event){
	// 		|			dojo.removeClass(targetNode, "highlighted");
	//		|		});
	};
	======*/
	
	has.add("dom-quirks", document.compatMode == "BackCompat");
	has.add("events-mouseenter", "onmouseenter" in document.createElement("div"));
	var mouseButtons;
	if(has("dom-quirks") || !has("dom-addeventlistener")){
		mouseButtons = {
			LEFT:   1,
			MIDDLE: 4,
			RIGHT:  2,
			// helper functions
			isButton: function(e, button){ return e.button & button; },
			isLeft:   function(e){ return e.button & 1; },
			isMiddle: function(e){ return e.button & 4; },
			isRight:  function(e){ return e.button & 2; }
		};
	}else{
		mouseButtons = {
			LEFT:   0,
			MIDDLE: 1,
			RIGHT:  2,
			// helper functions
			isButton: function(e, button){ return e.button == button; },
			isLeft:   function(e){ return e.button == 0; },
			isMiddle: function(e){ return e.button == 1; },
			isRight:  function(e){ return e.button == 2; }
		};
	}
	dojo.mouseButtons = mouseButtons;

/*=====
	dojo.mouseButtons = {
		// LEFT: Number
		//		Numeric value of the left mouse button for the platform.
		LEFT:   0,
		// MIDDLE: Number
		//		Numeric value of the middle mouse button for the platform.
		MIDDLE: 1,
		// RIGHT: Number
		//		Numeric value of the right mouse button for the platform.
		RIGHT:  2,
	
		isButton: function(e, button){
			// summary:
			//		Checks an event object for a pressed button
			// e: Event
			//		Event object to examine
			// button: Number
			//		The button value (example: dojo.mouseButton.LEFT)
			return e.button == button; // Boolean
		},
		isLeft: function(e){
			// summary:
			//		Checks an event object for the pressed left button
			// e: Event
			//		Event object to examine
			return e.button == 0; // Boolean
		},
		isMiddle: function(e){
			// summary:
			//		Checks an event object for the pressed middle button
			// e: Event
			//		Event object to examine
			return e.button == 1; // Boolean
		},
		isRight: function(e){
			// summary:
			//		Checks an event object for the pressed right button
			// e: Event
			//		Event object to examine
			return e.button == 2; // Boolean
		}
	};
=====*/

	var eventHandler, enter, leave;
	if(has("events-mouseenter")){
		eventHandler = function(type){
			// essentially a pass through, the browser already has mouseenter/leave
			return function(node, listener){
				return on(node, type, listener);
			};
		};
		enter = eventHandler("mouseenter");
		leave = eventHandler("mouseleave");
	}else{
		eventHandler = function(type){
			// emulation of mouseenter/leave with mouseover/out using descendant checking
			return function(node, listener){
				return on(node, type, function(evt){
					if(!dom.isDescendant(evt.relatedTarget, node)){
						return listener.call(this, evt);
					}					
				});
			};
		};
		enter = eventHandler("mouseover");
		leave = eventHandler("mouseout");
	}
	return {
		enter: enter,
		leave: leave,
		isLeft: mouseButtons.isLeft,
		isMiddle: mouseButtons.isMiddle,
		isRight: mouseButtons.isRight
	};
});
