/**
* @file WindowEvent.js
*
* Defines burst.web.WindowEvent which holds static functions related to window events, and burst.web.IEEvent
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst.web;

/** 
Class to synthesize a compliant W3 Event object from IE's window.event.
This is used in burst.web.WindowEvent.addEventListener to allow callers to assume a W3-compliant event handler
even on IE.

IE does not pass in a Event, but rather has global window.event
with similar but differently named properties.
Note that in Mozilla, for String definitions of handlers, there is a formal parameter called "event"
implicitly available in event handler expressions.

Note that this can cause issues however if the callback function is in a
different frame from where the event arises, because the function will not see window.event
(it having a different window global). This is also dealt with in burst.web.WindowEvent.addEventListener
because the closure it creates passes in an appropriate synthesized compliant event object.

In this wrapper object, we ensure that these standard member variables and methods work:

  - stopPropagation()
  - preventDefault()
  - currentTarget
  - relatedTarget
  - target

These are in common between IE and W3:

  - type
  - keyCode
  - shiftKey, altKey, ctrlKey

We do not currently do anything about these:

  - button
  - clientX, clientY
  - screenX, screenY

That is because those are an inconsistent mess among current browsers, not just IE (certainly in concert
with scroll* attributes). So instead we need convenience methods specifically for those.
See http://evolt.org/article/Mission_Impossible_mouse_position/17/23335/index.html

@todo methods for mouse position, relative to display screen, scrolled page content, or browser window.
*/
//:CLBEGIN IEEvent
/**
The constructor.
@param ev An IE-style event object. If not specified, uses window.event
*/
//:CLCONSTRUCT IEEvent(Event ev)
burst.web.IEEvent = function(ev) {
  if (!ev) ev = window.event;
  this.ie_event_ = ev;
  this.target = ev.srcElement;
  this.type = ev.type;

  // keyCode is not standardized in any w3 API yet (Level 3 Events is in draft).
  // some browsers store it in 'which'
  if (bu_in('keyCode',ev)) this.keyCode = ev.keyCode;

  // below are all for MouseEvent.

  var this_obj = this;
  if (true) {
    // these are the same in both
    burst.Alg.for_each(['shiftKey', 'altKey', 'ctrlKey', 'metaKey'], function(k) {
      if (bu_in(k, ev)) this_obj[k] = ev[k];
    });
  }

  if (typeof ev.button != 'undefined') {
    // these are different in interpretation, but we copy them anyway
    burst.Alg.for_each(['button', 'screenX', 'screenY', 'clientX', 'clientY'], function(k) {
      if (bu_in(k, ev)) this_obj[k] = ev[k];
    });
  }

  // mouseover
  if (ev.fromElement) this.relatedTarget = ev.fromElement;
  // mouseout
  if (ev.toElement) this.relatedTarget = ev.toElement;
}

burst.web.IEEvent.prototype.callListener = function(listener, curTarget) {
  if (typeof listener != 'function') bu_throw("listener not a function: " + listener);
  this.currentTarget = curTarget;
  var ret = listener.call(curTarget, this);
  return ret;
}

// if the programmer does the standard thing, then do the IE-specific thing
burst.web.IEEvent.prototype.stopPropagation = function() {
  this.ie_event_.cancelBubble = true;
}
burst.web.IEEvent.prototype.preventDefault = function() {
  this.ie_event_.returnValue = false;
}
//:CLEND IEEvent


/**
Scoping class to hold static functions related to window events.
*/
//:NSBEGIN WindowEvent

burst.web.WindowEvent = {};
var BU_WindowEvent = burst.web.WindowEvent;

/**
* Calls native DOM addEventListener in W3-compliant environments.
* If on IE5/IE6, uses <code>attachEvent()</code>.
*
* Note that in general, window is not a Node (and Opera for example does not
* support window.addEventListener but does for real nodes).
* A window should not be passed to this function. See burst.web.WindowEvent.addWindowListener.
*
* For IE, attachEvent handlers will be called after any handler registered via inline attribute (or dynamic expando).
* IE documentation says that if there are multiple handlers for the same node and event registered via attachEvent,
* they will be called in "random order".
* 
* Mozilla supports window.addEventListener.
*
* ICE has window.addEventListener but not attachEvent.
*/
//:NSFUNCTION Boolean addEventListener(Node node, String eventType, Function listener, Boolean useCapture, Boolean unsupported_ok)
BU_WindowEvent.addEventListener = function(node, eventType, listener, useCapture, unsupported_ok) {
  // Sigh, if you try to do toString on window in Safari you get "TypeError - no default value", so better not use it in bu_debug.
  //bu_debug("burst.web.WindowEvent.addEventListener(",node,',',eventType,',',listener,',',useCapture,")");
  //alert("node.addEventListener=" + node.addEventListener + " node.attachEvent=" + node.attachEvent);
  // problems in Konq 3.1?
  if (node.addEventListener) {
    //bu_alert('(WindowEvent.js) node.addEventListener exists');
    // just ignores duplicate adds.
    // returns void (as per spec).
    // in the listener, "this" is the node registered.
    // an event object is passed in.
    // listener can be object or function
    node.addEventListener(eventType, listener, useCapture);
    return true;
  }

  else if (node.attachEvent) {
    //bu_alert('(WindowEvent.js) node.attachEvent exists');
    // IE only does bubble.
    // In IE, "this" in listener body is global window.
    if (useCapture) {
       // todo: if a mouse event, use setCapture and releaseCapture
       bu_throw("no emulation for useCapture=true with attachEvent");
    }
    // todo: check that we are not attempting to attach to a text node.
    // IE returns true if successfully added, but we don't care.
    var ok = node.attachEvent('on' + eventType, function() {return (new burst.web.IEEvent()).callListener(listener, node)});
    // sigh.... in Opera window.attachEvent exists as a function, returns false, and then works anyway.
    if (!ok && !bu_UA.isOpera) {
       //bu_alert("(WindowEvent.js) attachEvent returned false");
       bu_throw("(WindowEvent.js) attachEvent returned false");
    }
    return true;
  }
  else {
    //bu_alert('(WindowEvent.js) neither node.addEventListener nor node.attachEvent exists');
    if (typeof unsupported_ok != 'undefined' && unsupported_ok) return false;
    bu_unsupported("burst.web.WindowEvent.addEventListener");
    return false;
  }
}

/**
* Calls native DOM removeEventListener in W3-compliant environments.
* If on IE5/IE6, uses <code>detachEvent()</code>.
*/
//:NSFUNCTION void removeEventListener(Node node, String eventType, Function listener, Boolean useCapture)
BU_WindowEvent.removeEventListener = function(node, eventType, listener, useCapture) {
  if (node.removeEventListener) {
    node.removeEventListener(node, eventType, listener, useCapture); 
  }
  else if (node.detachEvent) {
    node.detachEvent('on' + eventType, listener);
  }
  else {
    bu_unsupported('burst.web.WindowEvent.removeEventListener');
    //eval('node.on' + eventType + '=null');
  }
}

/**
* There are "DOM 0" events on the window object such as "load" and "resize".
* However, the W3 addEventListener function as specified only on a Node, not a window.
* 
* The potential events include: load unload resize abort error move
* Note that the body element might have any of these handlers.
* However, for a script executing in the "head" section of a page, typically
* document.body is null (document.documentElement exists though).
*
* It will use window.addEventListner or window.attachEvent if they are available,
* but no standard mandates them.
* Otherwise it will set the window member (window.onload or window.onresize, etc.),
* combining with any existing binding (running after whatever exists).
*
* @todo Will a dynamic window.onload always override a static or dynamic body.onload? See http://www.xs4all.nl/~ppk/js/events_events.html (no except Opera) 
* @todo Can you attach handlers to document.documentElement?
* @todo removeWindowListener
* @todo Make has_window_event_listener return true for opera 7.5?
*
* @param eventtype The name of the event ("load", "resize", etc.).
* @param func The handler. 
* @param win Optional. defaults to window.
*/
//:NSFUNCTION void addWindowListener(String eventtype, Function func, Window win)
BU_WindowEvent.addWindowListener = function(eventtype, func, win) {
  if (typeof win == 'undefined') win = window;

  if (bu_UA.has_window_event_listener() &&
      BU_WindowEvent.addEventListener(win, eventtype, func, false, true)) {
    //bu_alert('(WindowEvent.js) burst.web.WindowEvent.addEventListener worked for window ' + eventtype);
    return;
  }

  // alert("family=" + bu_UA.family_);
  //bu_alert('(WindowEvent.js) about to set window ' + eventtype);
  //bu_alert('currently=' + win['on' + eventtype]);
  var onev = 'on' + eventtype;
  win[onev] = bu_in(onev, win) ? burst.MOP.combineMethods(win[onev], func) : func;
}


/**
* Generates a 'click' event and dispatches it to the node.
* In W3-compliant environments, uses <code>Document.createEvent</code>,
* <code>Event.initEvent</code>, and <code>Node.dispatchEvent</code>
*
* In IE it uses <code>Document.createEventObject</code> and <code>Node.fireEvent</code>
*
* Otherwise it tries to call the <code>Node.click</code> method if any.
*
* @todo How do dispatchEvent() and click() relate to addEventListener() and setting onclick()?
*/
//:NSFUNCTION void dispatchClick(Node node)
BU_WindowEvent.dispatchClick = function(node) {
  // level 2 events: http://www.w3.org/TR/DOM-Level-2-Events/events.html
  if (typeof document.createEvent !== 'undefined' && typeof node.dispatchEvent !== 'undefined') {
    var ev = document.createEvent('MouseEvents');
    // this won't work in BUFakeDom for example
    var node_win = node.ownerDocument.defaultView || bu_warn('no node.ownerDocument.defaultView for dispatchEvent');
    //ev.initEvent('click', true, true);
    ev.initMouseEvent(
     'click',
     true,
     true,
     node_win,
     1,
     0,
     0,
     0,
     0,
     false,
     false,
     false,
     false,
     0,
     null
    );
    node.dispatchEvent(ev);
  }

  // IE-specific
  else if (typeof document.createEventObject !== 'undefined' && typeof node.fireEvent !== 'undefined') {
    var ieev = document.createEventObject();
    ieev.type = 'click';
    node.fireEvent('on' + ieev.type, ieev);
  }

  // W3 defines click() only for HTMLInputElement: 
  //    http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
  else if (typeof node.click != 'undefined') {
    node.click();
  }

  else bu_unsupported('dispatchClick');
}

BU_WindowEvent.stopEvent = function(ev) {
    if (window.event) {
    ev.returnValue = false;
    ev.cancelBubble = true;
    }
    else {
    ev.preventDefault();
    ev.stopPropagation();
    }
}

/*
Mouse events.

http://www.w3.org/TR/DOM-Level-3-Events/
http://www.w3.org/TR/DOM-Level-3-Events/keyset.html
http://www.w3.org/TR/DOM-Level-3-Events/ecma-script-binding.html
http://www.w3.org/TR/DOM-Level-2-Events/
http://www.w3.org/TR/DOM-Level-2-Events/events.html
http://www.w3.org/TR/DOM-Level-2-Events/ecma-script-binding.html
http://www.w3.org/TR/1999/WD-DOM-Level-2-19990923/events.html
  (full table, later removed after draft)

http://www.xs4all.nl/~ppk/js/events_events.html
http://www.xs4all.nl/~ppk/js/events_mouse.html
http://www.xs4all.nl/~ppk/js/events/window.html
http://www.xs4all.nl/~ppk/js/eventexample.html

click          event firing order is 'mousedown', 'mouseup', 'click'. 'click' may not have button info.
dblclick       hopelessly incompatible
mouseup        mouseup may be on different element than mousedown. if same, then a click event follows. konqueror instead of click?
mousedown

mousemove      even one pixel of motion. heavyweight. 
mouseover      enters an element (or a descendant element, if bubbling). IE sets fromElement. W3 has relatedTarget. Mozilla prior to 1.3 also did for text elements.
mouseout       leaves an element (or a descendant element, if bubbling). IE sets toElement. W3 has relatedTarget. Mozilla prior to 1.3 also did for text elements.
mouseenter     IE-specific. like mouseover, but does not bubble.
mouseleave     IE-specific. like mouseout, but does not bubble.

'blur' is when an element loses focus; 'focus' when it gains it. No W3 standard.

document['contextmenu'] is for click-right or equivalent (not on mac) 

Note that browsers also have text selection support, which may have to be disabled during drag and drop:
  onselect (W3 standard)
  onselectstart (IE-specific)
These are used for selecting text and elements.
This could for example be disabled in IE via (document.onselectstart = function() {return false}) while dragging.
But we can also disable it by preventDefault()/stopPropagation().

TODO: event.shiftKey may be true on a mousedown, to detect "shift click" ?
*/

/*
Convenience for determining click location.
See
   http://groups.google.com/groups?hl=en&lr=&ie=UTF-8&oe=UTF-8&safe=off&threadm=b8ples%24k63%241%40news.eusc.inter.net&rnum=1
   http://www.xs4all.nl/~ppk/js/index.html?w3c_events.html#mousepos
   http://www.xs4all.nl/~ppk/js/index.html?events_compinfo.html
   http://evolt.org/article/Mission_Impossible_mouse_position/17/23335/index.html
   http://www.mozilla.org/docs/dom/domref/dom_event_ref.html

Choices for name are:
  'screenX', 'screenY'
  screen-relative (actual full monitor screen, including outside of browser window)
     Mozilla, IE, Opera7      screenX, screenY
     Safari                   ?
                              window.clientTop + clientX doesn't work because doesn't count window frame.

  'pageX', 'pageY'
  document-relative (from beginning of document, aka "canvas").
     Mozilla, Opera7, Safari  pageX, pageY
                              // On Safari, clientX/clientY = pageX/pageY, both are document-relative.
     IE 	              complex.
                              In BackCompat, clicking uppermost left/top in the apparently drawable region
			      is on BODY and gives offsetX/Y=(0,-2) and clientX/Y=(2,0).
			      It is also possible to get to offsetX/Y=(-2,-2) and clientX/Y=(0,0), though
			      that puts the pointer slightly onto the left beveled edge.
			      It appears that it is possible to obtain an offsetX,offsetY pair anywhere
			      from (-2,-2) to (body.scrollWidth-1,body.scrollHeight-1), inclusive. 
			      BODY element's clientLeft=clientTop=2, while for HTML they are 0.

			      In CSS1Compat, you first must register an onclick handler on document.documentElement,
			      in order to to get onclick handlers called in the margin (window.onload and body.onload
			      won't work). You then get onclick events on HTML, with the same values as BackCompat.
			      HTML element (documentElement)'s clientLeft=clientTop=2, while for BODY they are 0.
			      The clickable horizontal canvas region is BODY offsetWidth + 20 (2x10 margin) = de.scrollWidth.
			      The clickable vertical canvas region is BODY offsetHeight + 30 (2x15 margin) = de.scrollHeight.

			      Thus it seems that the additional 2px left and top strip of negative coordinates is
			      in addition to space available according to layout. 

			      Thus we have:
			      var rel = document.compatMode == 'CSS1Compat' ? document.documentElement : document.body;
                              clientX + rel.scrollLeft - rel.clientLeft
                              clientY + rel.scrollTop - rel.clientTop

  'clientX', 'clientY'
  window-relative (relative to top of physical scroll area, aka "viewport").
     Mozilla, IE, Opera7      clientX, clientY
     Safari                   clientX, clientY
                              Note that screenY is actually the distance from the bottom including any bottom scroll bar,
			      so would have to take (window.innerHeight + 32 - ev.screenY).

  'offsetX', 'offsetY'
  element-relative (relative to the border edge of the element clicked on)
     Safari, Opera7           offsetX, offsetY = distance from the top-left of the border box
     IE                       offsetX, offsetY = distance from the top-left of the padding box (negative if click in border)
                              so have to add el.clientLeft or el.clientTop
     Mozilla                  layerX, layerY for position 'absolute' or position 'relative'
     			      For position 'static', layerX=pageX and layerY=pageY so need:
			         pageX - getBorderBoxLeft(el)
			         pageY - getBorderBoxTop(el)

page* and offset* are not W3 standard. client* and screen* are.

*/

BU_WindowEvent.getEventDocument = function(ev) {
    // don't ask; in IE, variable aliases of window.event don't compare as equal, but Node instances do.
    if (window.event && (window.event === ev || window.event.srcElement === ev.srcElement)) return document; // IE, Opera, Safari
    if (ev.view) return ev.view.document; // Mozilla, Opera, Safari. Safari has ev.view!=window but ev.view.document==document.
    return burst.xml.DomUtil.ownerDocument(BU_WindowEvent.getEventTarget(ev));
}

BU_WindowEvent.getEventWindow = function(ev) {
    if (window.event && (window.event === ev || window.event.srcElement === ev.srcElement)) return window;
    if (ev.view) return ev.view;
    var doc = burst.xml.DomUtil.ownerDocument(BU_WindowEvent.getEventTarget(ev));
    // TODO: what to do if no defaultView?
    // defaultView exists in Opera and Mozilla. Safari has it but it appears not to be real (not equal window).
    // IE6 and below does not have it.
    return doc.defaultView ? doc.defaultView : (bu_UA.isIE ? doc.parentWindow : window);
}

BU_WindowEvent.getEventTarget = function(ev) {
    return ev.target ? ev.target : ev.srcElement;
}

BU_WindowEvent.getMousePos = function(ev, name) {
    if (!name) throw Error("no name argument");
    switch(name) {
    case 'screenX': return bu_UA.isKHTML ? 0 : ev.screenX;
    case 'screenY': return bu_UA.isKHTML ? 0 : ev.screenY;
    case 'pageX':   {
	if (!bu_UA.isIE) return ev.pageX;
	var relx = burst.xml.HtmlUtil.getDocumentElementIE(BU_WindowEvent.getEventDocument(ev));
	return ev.clientX + relx.scrollLeft - relx.clientLeft;
    }
    case 'pageY': {
	if (!bu_UA.isIE) return ev.pageX;
	var rely = burst.xml.HtmlUtil.getDocumentElementIE(BU_WindowEvent.getEventDocument(ev));
	return ev.clientY + rely.scrollTop - rely.clientTop;
    }
    case 'clientX': return ev.clientX;
    case 'clientY': return ev.clientY;
    case 'offsetX': {
	if (bu_UA.isIE) return ev.offsetX + ev.srcElement.clientLeft;
	if (!bu_UA.isGecko) return ev.offsetX;
	var pos = burst.xml.HtmlUtil.getComputedStyle(el, 'position');
	if (pos && pos != 'static') return ev.layerX;
	return ev.pageX - burst.xml.HtmlBox.getBorderBoxleft(ev.target);
    }
    case 'offsetY': {
	if (bu_UA.isIE) return ev.offsetY + ev.srcElement.clientTop;
	if (!bu_UA.isGecko) return ev.offsetY;
	var posy = burst.xml.HtmlUtil.getComputedStyle(el, 'position');
	if (posy && posy != 'static') return ev.layerY;
	return ev.pageY - burst.xml.HtmlBox.getBorderBoxTop(ev.target);
    }
    default: throw Error("bad getMousePos name '" + name + "'");
    }
}






/*

Keyboard event related.

See:
  http://www.xs4all.nl/~ppk/js/events/keys.html
  http://cross-browser.com/examples/event_properties.html
  http://www.w3.org/TR/DOM-Level-3-Events/keyset.html
     (draft)
  http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-keyevents
     no spec for keyboard events in final Level-2
  http://www.w3.org/TR/1999/WD-DOM-Level-2-19990923/events.html#Events-eventgroupings-keyevents
     there was a spec in earlier drafts

Meaning of different events:

  keydown    when key transitions to down. happens for special keys (like control) in addition to non-special keys.
  	     cancelling keydown prevents following keypress/textinput, but not keyup.
  keyup      when key transitions to up
  keypress   shift-q would have 2 keydown, 1 keypress, 2 keyup. 
	     may be after key is handled and character inserted.
  textinput  new W3 DOM Level 3 event, deprecating keypress.
  	     control-v would have 2 keydown, 0 textinput, 2 keyup (because no unicode control-v character).

In DOM Level-3 Events, KeyboardEvent.keyIdentifier is a string name such as "Enter", "F2", "U+000009" (tab), "U+000031" (1), "U+000041" (A)
In the early drafts of DOM Level-2 Events KeyEvent.keyCode is a long "virtual key code value" (one of the DOM_VK_* constants)
and KeyEvent.charCode is a unicode character or zero.
This only make sense by examining the Java inspiration: http://java.sun.com/j2se/1.4.1/docs/api/java/awt/event/KeyEvent.html#getKeyCode()

In principle, there is a distinction to be had between text and keystrokes: a single keystroke can result in 0, 1, or more viewable characters,
and a single character might be produced by 1 or more keystrokes.
But in practice, 

ECMAScript String.fromCharCode treats each of its arguments (if more than 1) as a 16-bit unicode code point, and makes a string.

IE PC:
  key attribute:    Sets keyCode for all keyboard events, and never charCode or which. 
  modifiers:        metaKey is undefined. 
  Shift:            keydown(keyCode=16,shiftKey=true,repeat=false), keydown(keyCode=16,shiftKey=true,repeat=true), ...
  Windows:          keydown(keyCode=91) [same keyCode as "[", but no keypress]
  LeftArrow:        keydown(keyCode=37)
  Alt-x:            keydown(keyCode=18,altKey=true), keydown(keyCode=88,altKey=true)
  Control-a:        keydown(keyCode=17,ctrlKey=true), keydown(keyCode=65,ctrlKey=true)
  Tab:              keydown(keyCode=9)
  Shift-Tab:        keydown(keyCode=16,shiftKey=true), keydown(keyCode=9,shiftKey=true)
  Percent:          keydown(keyCode=53,shiftKey=true), keypress(keyCode=37,shiftKey=true)
  Delete            keydown(keyCode=46)
  ".":              keydown(keyCode=190), keypress(keyCode=46)
  "[":              keydown(keyCode=219), keypress(keyCode=91)
  "<":              keydown(keyCode=188,shiftKey=true), keypress(keyCode=60,shiftKey=true)
  "a":              keydown(keyCode=65,shiftKey=false), keypress(keyCode=97,shiftKey=false)
  "A":              keydown(keyCode=16,shiftKey=true), keypress(keyCode=65,shiftKey=true)
  repeat:           Will generate repeated keydown events for modifier keys being held down (such as shift). Sets event.repeat=true after the first.
  writable:         keyCode and charCode may be modified.
  Summary:          keydown keyCode is virtual key code. 
                    keypress keyCode is ascii.
                    keypress only happens when there is a displayable char (shiftKey ok, but not control or alt).

Mozilla:
  Summary:          keydown keyCode is virtual key code.
                    keypress charCode is ascii when possible, otherwise keyCode (isChar distinguishes on some versions).
                    keypress usually generated (though see Camino Control-a)

Mozilla1.4 PC:
  key attribute:    Sets keyCode, charCode, which on all events. charCode=0 on keydown/keyup; keyCode=0 on keypress.
  modifiers:        has all 4.
  Shift:            keydown(keyCode=16,shiftKey=true,isChar=true), keydown(keyCode=16,shiftKey=true,isChar=true), ...
  Windows:          keydown(keyCode=91,isChar=true),keypress(charCode=91,isChar=true)
 "[":               keydown(keyCode=219,isChar=true), keypress(charCode=91,isChar=true)
  Tab:              keydown(keyCode=9,isChar=true), keypress(charCode=9,isChar=true)
  Shift-Tab:        keydown(keyCode=16,shiftKey=true), keydown(keyCode=9,shiftKey=true), keypress(keyCode=9,shiftKey=true)
  LeftArrow:        keydown(keyCode=37,isChar=false), keypress(charCode=37,isChar=false)
  Percent:          keydown(keyCode=53,shiftKey=true), keypress(charCode=37,shiftKey=false,isChar=true).
  Alt-x:            keydown(keyCode=18,altKey=true,isChar=false), keydown(keyCode=88,altKey=true,isChar=true), keypress(charCode=120,altKey=true,isChar=true)
  Control-a:        keydown(keyCode=17,ctrlKey=true,isChar=false), keydown(keyCode=65,ctrlKey=true,isChar=true), keypress(charCode=97,ctrlKey=true,isChar=true)
  Delete:           keydown(keyCode=46,isChar=true), keypress(charCode=46,isChar=true)
  ".":              keydown(keyCode=190,isChar=true), keypress(charCode=46,isChar=true)
  "a":              keydown(keyCode=65,shiftKey=false), keypress(charCode=97,shiftKey=false)
  "A":              keydown(keyCode=16,shiftKey=true), keypress(charCode=65,shiftKey=true)
  repeat:           yes, for keydown and keypress.
  bugs:             Does not fire keypress events until after they have been processed, unless there is an onkeypress html attribute.
    http://groups.google.com/groups?hl=en&lr=&ie=UTF-8&oe=UTF-8&safe=off&selm=3E1AF8C3.8C19CC83%40agricoreunited.com&rnum=7
    http://groups.google.com/groups?hl=en&lr=&ie=UTF-8&oe=UTF-8&safe=off&threadm=20020520091724.27381.00000571%40mb-fr.news.cs.com&rnum=8
    http://bugzilla.mozilla.org/show_bug.cgi?id=54035
    solve by putting onkeypress="" in html attribute

Mozilla1.1 PC:
  Control-a:        keydown(keyCode=17,ctrlKey=true,isChar=true), keydown(keyCode=65,ctrlKey=true,isChar=true), keypress(charCode=97,ctrlKey=true,isChar=false)
  Delete:           keydown(keyCode=46,isChar=true), keypress(charCode=46,isChar=true)
  ".":              keydown(keyCode=190,isChar=true), keypress(charCode=46,isChar=false)

Mozilla1.4 OS X:
  Shift:            (no keydown for modifier keys being pressed like shift and control).
  Apple-a:          keypress(charCode=97,metaKey=true,isChar=true), keyup(keyCode=65)
  Option-a:         keypress(charCode=229,altKey=false,isChar=true), keyup(keyCode=0)
  Option-x:         keypress(charCode=8776,isChar=true)
  LeftArrow:        keydown(keyCode=37,isChar=true), keypress(charCode=37,isChar=true)
  Control-a:        keypress(charCode=1,ctrlKey=true,isChar=true)
  Delete:           keypress(charCode=8,isChar=true), keyup(keyCode=8,isChar=true) [really, backspace]
  ".":              keypress(charCode=46,isChar=true), keyup(keyCode=190,isChar=true)
  other keys        same as PC but no keydown, and isChar always =true
  repeat:           yes, for keydown and keypress. delays repeated keydown events for held down shift or alt if/when another key is pressed.
  writable:         keyCode and charCode are readonly.
  extras:           Sets isChar=true if the keyboard event is for something that can be echoed (though opposite in Mozilla 1.1).
  bugs:             On Mozilla OS X, no keydown?

Camino 0.7 OS X:
  LeftArrow:        keydown(keyCode=37,isChar=false), keypress(charCode=37,isChar=false)
  Percent:          keydown(keyCode=0,shiftKey=true,isChar=false), keypress(charCode=37,shiftKey=false,isChar=true).
  Control-a:        keydown(keyCode=65,ctrlKey=true,isChar=false)
  Option-a:         keydown(keyCode=0,altKey=true,isChar=false),keypress(charCode=229,altKey=false,isChar=true),keyup(keyCode=0,altKey=true,isChar=true)
  Delete:           keydown(keyCode=8,isChar=false), keypress(charCode=8,isChar=false) [really, backspace]

Opera7 PC:
  key attribute:    Sets keyCode and which, and never charCode.
  modifiers:        has all 4.
  Shift:            keydown(keyCode=57401,shiftKey=true) 0xE039 = 14x4096 + 57
  Control:          keydown(keyCode=57402,ctrlKey=true)
  Windows:          keydown(keyCode=91)
  Alt-x:            (nothing)
  Control-a:        keydown(keyCode=57402,ctrlKey=true), keypress(keyCode=57402,ctrlKey=true), keypress(keyCode=65,ctrlKey=true)
  Tab:              keydown(keyCode=9), keypress(keyCode=9)
  Shift-Tab:        keydown(keyCode=57401,shiftKey=true), keypress(keyCode=57501,shiftKey=true), keydown(keyCode=9,shiftKey=true), keypress(keyCode=9,shiftKey=true)
  LeftArrow:        keydown(keyCode=57387) = 14x4096(=57344) + 43
  Delete:           keydown(keyCode=57395), keypress(keyCode=57395) = 57344 + 52
  Percent:          keydown(keyCode=57401,shiftKey=true), keypress(keyCode=57401,shiftKey=true), keydown(keyCode=53,shiftKey=true), keypress(keyCode=37,shiftKey=true)
  "a":              keydown(keyCode=65,shiftKey=false), keypress(keyCode=97,shiftKey=false)
  "A":              keydown(keyCode=57401,shiftKey=true), keypress(keyCode=57401,shiftKey=true), keydown(keyCode=65,shiftKey=true), keypress(keyCode=65,shiftKey=true)
  "<":              keydown(keyCode=57401,shiftKey=true), keypress(keyCode=57401,shiftKey=true), keydown(keyCode=188,shiftKey=true), keypress(keyCode=60,shiftKey=true)
  ".":              keydown(keyCode=190), keypress(keyCode=46)
  writable:         keyCode is readonly.
  repeat:           no repeat on keydown. does repeat on keypress.
  Summary:          keydown keyCode is something weird.
                    keypress keyCode is ascii when possible, otherwise same weird value as keydown.
		    no keypress for arrow keys
		    separate keypress just for shift key.

Opera6 OS X:
  Control-a:        keydown(keyCode=65,ctrlKey=true), keypress(keyCode=65,ctrlKey=true)
  LeftArrow:        keydown(keyCode=92), keypress(keyCode=92)
  "[":              keydown(keyCode=91), keypress(keyCode=91)
  ".":              keydown(keyCode=46), keypress(keyCode=46)
  "a":              keydown(keyCode=65,shiftKey=false), keypress(keyCode=65,shiftKey=false)
  "A":              keydown(keyCode=65,shiftKey=true), keypress(keyCode=65,shiftKey=true)
  Percent:          keydown(keyCode=37,shiftKey=true), keypress(keyCode=37,shiftKey=true)

Safari1:
  key attribute:    Sets keyCode and which, and never charCode (like Opera).
  modifiers:        implements none of shiftKey, etc. (see bugs)
  Shift:            Does not generate keydown for just shift key.
  Control:          Does not generate keydown for just shift key.
  Tab:              keydown(keyCode=9), keypress(keyCode=9)
  Shift-Tab:        keydown(keyCode=25,shiftKey=undefined), keypress(keyCode=25,shiftKey=undefined)
  Control-a:        keydown(keyCode=1,ctrlKey=undefined), keypress(keyCode=1, ctrlKey=undefined)
  Control-x:        keydown(keyCode=24,ctrlKey=undefined), keypress(keyCode=24, ctrlKey=undefined)
  Option-a:         keydown(keyCode=-27,altKey=undefined), keypress(keyCode=-27, altKey=undefined)
  Option-s:         keydown(keyCode=-33,altKey=undefined), keypress(keyCode=-33, altKey=undefined)
  Option-z:         keydown(keyCode=0,altKey=undefined), keypress(keyCode=0, altKey=undefined)
  Alt-a:            (nothing)
  LeftArrow:        keydown(keyCode=0) (see bugs)
  Delete:           keydown(keyCode=127), keypress(keyCode=127)
  Percent:          keydown(keyCode=37,shiftKey=undefined), keypress(keyCode=37,shiftKey=undefined)
  "<":              keydown(keyCode=60,shiftKey=undefined), keypress(keyCode=60,shiftKey=undefined)
  ".":              keydown(keyCode=46), keypress(keyCode=46)
  "a":              keydown(keyCode=97,shiftKey=undefined), keypress(keyCode=97,shiftKey=undefined)
  "A":              keydown(keyCode=65,shiftKey=undefined), keypress(keyCode=65,shiftKey=undefined)
  repeat:           no repeat on keydown. does repeat on keypress.
  bugs:             The event.type is "khtml_keydown", not "keydown".
                    Does not implement shiftKey, altKey etc. booleans.
                    Generates keydown/keyup events with keyCode=0 (and no keypress) for non-ascii keys (e.g. arrow keys and function keys).
		    Generates keyCode=25 for shift-tab.

ASCII Table

  Name            ASCII
  BackSpace       0x08   8
  Tab             0x09   9
  NewLine         0x0A  10
  Return          0x0D  13
  Escape          0x1B  27
  Space           0x20  32
  !               0x21  33
  "               0x22  34
  0               0x30  48
  9               0x39  57
  A               0x41  65
  Z               0x5A  90
  a               0x61  97
  z               0x7A 122
  ~               0x7E 126
  Del             0x7F 127

Windows Virtual Key Code Table

  Name                 Value    Constant
  LeftButton           0x01   1 VK_LBUTTON
  RightButton          0x02   2 VK_RBUTTON
  MiddleButton         0x04   4 VK_MBUTTON
  BackSpace            0x08   8 VK_BACK
  Tab                  0x09   9 VK_TAB
  Shift                0x10  16 VK_SHIFT
  Control              0x11  17 VK_CONTROL
  Alt                  0x12  18 VK_MENU
  Return               0x0D  13 VK_RETURN
  Escape               0x1B  27 VK_ESCAPE
  Space                0x20  32 VK_SPACE
  PageUp               0x21  33 VK_PRIOR
  PageDown             0x22  34 VK_DOWN
  End                  0x23  35 VK_END
  Home                 0x24  36 VK_HOME
  Left                 0x25  37 VK_LEFT
  Up                   0x26  38 VK_UP
  Right                0x27  39 VK_RIGHT
  Down                 0x28  40 VK_DOWN
  Insert               0x2D  45 VK_INSERT
  Delete               0x2E  46 VK_DELETE
  0                    0x30  48 VK_0
  9                    0x39  57 VK_9
  A                    0x41  65 VK_A
  Z                    0x5A  90 VK_Z
  LeftWindows          0x5B  91 VK_LWIN
  RightWindows         0x5C  92 VK_RWIN
  Numeric0             0x60  96 VK_NUMPAD0
  Numeric9             0x69 105 VK_NUMPAD9
  Numeric*             0x6A 106 VK_MULTIPLY
  Numeric+             0x6B 107 VK_ADD
  F1                   0x70 112 VK_F1
  F24                  0x87 135 VK_F24
  LeftShift            0xA0 160 VK_LSHIFT
  RightShift           0xA1 161 VK_RSHIFT
  ;:                   0xBA 186 VK_OEM_1
  +=                   0xBB 187 VK_OEM_PLUS
  ,<                   0xBC 188 VK_OEM_COMMA
  -_                   0xBD 189 VK_OEM_MINUS
  .>                   0xBE 190 VK_OEM_PERIOD
  ?/                   0xBF 191 VK_OEM_2
  `~                   0xC0 192 VK_OEM_3
  [{                   0xDB 219 VK_OEM_4
  \|                   0xDC 220 VK_OEM_5
  ]}                   0xDD 221 VK_OEM_6
  '"                   0xDE 222 VK_OEM_7
                       0xDF 223 VK_OEM_8
  KeypadLeft           0xE1 225
  KeypadUp             0xE2 226 VK_OEM_102
  KeypadRigh           0xE3 227
  KeypadDown           0xE4 228
                       0xFE 254 VK_OEM_CLEAR

OEM key map:

One level up from hardware "scan code". The mapping requires knowledge of the keyboard layout, at least for ones outside a core set.
virtual key codes do not change according to modifier key states (shift, control, etc.).
they do distinguish numeric keypad from main keyboard.
Includes mouse button:
0-9 and A-Z equal their ascii codes.

Next is character set. Windows 1252. lower 127 is ascii.

"Form Submission and i18n" http://ppewww.ph.gla.ac.uk/%7eflavell/charset/form-i18n.html
According to FORM acceptcharset, defaulting to that of the document (say, from a META content). If user enters keys from outside anyway, uses UTF-8.
"Using Unicode on E2" http://www.everything2.com/index.pl?node=Using%20Unicode%20on%20E2

"Virtual-Key Code Definitions" 
   http://msdn.microsoft.com/library/default.asp?url=/library/en-us/winui/winui/windowsuserinterface/userinput/keyboardinput/aboutkeyboardinput.asp
   http://msdn.microsoft.com/library/en-us/winui/WinUI/WindowsUserInterface/UserInput/VirtualKeyCodes.asp
   http://msdn.microsoft.com/library/default.asp?url=/library/en-us/w98ddk/hh/w98ddk/keycnt_4fqw.asp

  
TODO:
  how to capture Enter key prior to it submitting a form
  how to capture browser accelerators like Ctrl-N or Ctrl-P
  in general, when is it possible to capture ALT, CTRL, META, and function keys.
*/ 





//:NSEND burst.web.WindowEvent

bu_loaded('burst.web.WindowEvent', ['burst.MOP']);
