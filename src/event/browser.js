dojo.provide("dojo.event.browser");
dojo.require("dojo.event.common");

// FIXME: any particular reason this is in the global scope?
dojo._ie_clobber = new function(){
	this.clobberNodes = [];

	function nukeProp(node, prop){
		// try{ node.removeAttribute(prop); 	}catch(e){ /* squelch */ }
		try{ node[prop] = null; 			}catch(e){ /* squelch */ }
		try{ delete node[prop]; 			}catch(e){ /* squelch */ }
		// FIXME: JotLive needs this, but I'm not sure if it's too slow or not
		try{ node.removeAttribute(prop);	}catch(e){ /* squelch */ }
	}

	this.clobber = function(nodeRef){
		var na;
		var tna;
		if(nodeRef){
			tna = nodeRef.all || nodeRef.getElementsByTagName("*");
			na = [nodeRef];
			for(var x=0; x<tna.length; x++){
				// if we're gonna be clobbering the thing, at least make sure
				// we aren't trying to do it twice
				if(tna[x]["__doClobber__"]){
					na.push(tna[x]);
				}
			}
		}else{
			try{ window.onload = null; }catch(e){}
			na = (this.clobberNodes.length) ? this.clobberNodes : document.all;
		}
		tna = null;
		var basis = {};
		for(var i = na.length-1; i>=0; i=i-1){
			var el = na[i];
			if(el["__clobberAttrs__"]){
				for(var j=0; j<el.__clobberAttrs__.length; j++){
					nukeProp(el, el.__clobberAttrs__[j]);
				}
				nukeProp(el, "__clobberAttrs__");
				nukeProp(el, "__doClobber__");
			}
		}
		na = null;
	}
}

if(dojo.render.html.ie){
	dojo.addOnUnload(function(){
		dojo._ie_clobber.clobber();
		try{
			if((dojo["widget"])&&(dojo.widget["manager"])){
				dojo.widget.manager.destroyAll();
			}
		}catch(e){}
		try{ window.onload = null; }catch(e){}
		try{ window.onunload = null; }catch(e){}
		dojo._ie_clobber.clobberNodes = [];
		// CollectGarbage();
	});
}

dojo.event.browser = new function(){

	var clobberIdx = 0;

	this.clean = function(node){
		if(dojo.render.html.ie){ 
			dojo._ie_clobber.clobber(node);
		}
	}

	this.addClobberNode = function(node){
		if(!dojo.render.html.ie){ return; }
		if(!node["__doClobber__"]){
			node.__doClobber__ = true;
			dojo._ie_clobber.clobberNodes.push(node);
			// this might not be the most efficient thing to do, but it's
			// much less error prone than other approaches which were
			// previously tried and failed
			node.__clobberAttrs__ = [];
		}
	}

	this.addClobberNodeAttrs = function(node, props){
		if(!dojo.render.html.ie){ return; }
		this.addClobberNode(node);
		for(var x=0; x<props.length; x++){
			node.__clobberAttrs__.push(props[x]);
		}
	}

	this.removeListener = function(node, evtName, fp, capture){
		if(!capture){ var capture = false; }
		evtName = evtName.toLowerCase();
		if( (evtName == "onkey") || (evtName == "key") ){
			if(dojo.render.html.ie){
				this.removeListener(node, "onkeydown", fp, capture);
			}
			evtName = "onkeypress";
		}
		if(evtName.substr(0,2)=="on"){ evtName = evtName.substr(2); }
		// FIXME: this is mostly a punt, we aren't actually doing anything on IE
		if(node.removeEventListener){
			node.removeEventListener(evtName, fp, capture);
		}
	}

	this.addListener = function(node, evtName, fp, capture, dontFix){
		if(!node){ return; } // FIXME: log and/or bail?
		if(!capture){ var capture = false; }
		evtName = evtName.toLowerCase();
		if( (evtName == "onkey") || (evtName == "key") ){
			if(dojo.render.html.ie){
				this.addListener(node, "onkeydown", fp, capture, dontFix);
			}
			evtName = "onkeypress";
		}
		if(evtName.substr(0,2)!="on"){ evtName = "on"+evtName; }

		if(!dontFix){
			// build yet another closure around fp in order to inject fixEvent
			// around the resulting event
			var newfp = function(evt){
				if(!evt){ evt = window.event; }
				var ret = fp(dojo.event.browser.fixEvent(evt, this));
				if(capture){
					dojo.event.browser.stopEvent(evt);
				}
				return ret;
			}
		}else{
			newfp = fp;
		}

		if(node.addEventListener){ 
			node.addEventListener(evtName.substr(2), newfp, capture);
			return newfp;
		}else{
			if(typeof node[evtName] == "function" ){
				var oldEvt = node[evtName];
				node[evtName] = function(e){
					oldEvt(e);
					return newfp(e);
				}
			}else{
				node[evtName]=newfp;
			}
			if(dojo.render.html.ie){
				this.addClobberNodeAttrs(node, [evtName]);
			}
			return newfp;
		}
	}

	this.isEvent = function(obj){
		// FIXME: event detection hack ... could test for additional attributes
		// if necessary
		return (typeof obj != "undefined")&&(typeof Event != "undefined")&&(obj.eventPhase);
		// Event does not support instanceof in Opera, otherwise:
		//return (typeof Event != "undefined")&&(obj instanceof Event);
	}

	this.currentEvent = null;
	
	this.callListener = function(listener, curTarget){
		if(typeof listener != 'function'){
			dojo.raise("listener not a function: " + listener);
		}
		dojo.event.browser.currentEvent.currentTarget = curTarget;
		return listener.call(curTarget, dojo.event.browser.currentEvent);
	}

	this.stopPropagation = function(){
		dojo.event.browser.currentEvent.cancelBubble = true;
	}

	this.preventDefault = function(){
	  dojo.event.browser.currentEvent.returnValue = false;
	}

	this.keys = {
		KEY_BACKSPACE: 8,
		KEY_TAB: 9,
		KEY_CLEAR: 12,
		KEY_ENTER: 13,
		KEY_SHIFT: 16,
		KEY_CTRL: 17,
		KEY_ALT: 18,
		KEY_PAUSE: 19,
		KEY_CAPS_LOCK: 20,
		KEY_ESCAPE: 27,
		KEY_SPACE: 32,
		KEY_PAGE_UP: 33,
		KEY_PAGE_DOWN: 34,
		KEY_END: 35,
		KEY_HOME: 36,
		KEY_LEFT_ARROW: 37,
		KEY_UP_ARROW: 38,
		KEY_RIGHT_ARROW: 39,
		KEY_DOWN_ARROW: 40,
		KEY_INSERT: 45,
		KEY_DELETE: 46,
		KEY_HELP: 47,
		KEY_LEFT_WINDOW: 91,
		KEY_RIGHT_WINDOW: 92,
		KEY_SELECT: 93,
		KEY_NUMPAD_0: 96,
		KEY_NUMPAD_1: 97,
		KEY_NUMPAD_2: 98,
		KEY_NUMPAD_3: 99,
		KEY_NUMPAD_4: 100,
		KEY_NUMPAD_5: 101,
		KEY_NUMPAD_6: 102,
		KEY_NUMPAD_7: 103,
		KEY_NUMPAD_8: 104,
		KEY_NUMPAD_9: 105,
		KEY_NUMPAD_MULTIPLY: 106,
		KEY_NUMPAD_PLUS: 107,
		KEY_NUMPAD_ENTER: 108,
		KEY_NUMPAD_MINUS: 109,
		KEY_NUMPAD_PERIOD: 110,
		KEY_NUMPAD_DIVIDE: 111,
		KEY_F1: 112,
		KEY_F2: 113,
		KEY_F3: 114,
		KEY_F4: 115,
		KEY_F5: 116,
		KEY_F6: 117,
		KEY_F7: 118,
		KEY_F8: 119,
		KEY_F9: 120,
		KEY_F10: 121,
		KEY_F11: 122,
		KEY_F12: 123,
		KEY_F13: 124,
		KEY_F14: 125,
		KEY_F15: 126,
		KEY_NUM_LOCK: 144,
		KEY_SCROLL_LOCK: 145
	};

	// reverse lookup
	this.revKeys = [];
	for(var key in this.keys){
		this.revKeys[this.keys[key]] = key;
	}

	this.fixEvent = function(evt, sender){
		if(!evt){
			if(window["event"]){
				evt = window.event;
			}
		}
		
		if((evt["type"])&&(evt["type"].indexOf("key") == 0)){ // key events
			evt.keys = this.revKeys;
			// FIXME: how can we eliminate this iteration?
			for(var key in this.keys){
				evt[key] = this.keys[key];
			}
			if(evt["type"] == "keydown" && dojo.render.html.ie){
				switch(evt.keyCode){
					case evt.KEY_SHIFT:
					case evt.KEY_CTRL:
					case evt.KEY_ALT:
					case evt.KEY_CAPS_LOCK:
					case evt.KEY_LEFT_WINDOW:
					case evt.KEY_RIGHT_WINDOW:
					case evt.KEY_SELECT:
					case evt.KEY_NUM_LOCK:
					case evt.KEY_SCROLL_LOCK:
					// I'll get these in keypress after the OS munges them based on numlock
					case evt.KEY_NUMPAD_0:
					case evt.KEY_NUMPAD_1:
					case evt.KEY_NUMPAD_2:
					case evt.KEY_NUMPAD_3:
					case evt.KEY_NUMPAD_4:
					case evt.KEY_NUMPAD_5:
					case evt.KEY_NUMPAD_6:
					case evt.KEY_NUMPAD_7:
					case evt.KEY_NUMPAD_8:
					case evt.KEY_NUMPAD_9:
					case evt.KEY_NUMPAD_PERIOD:
						break; // just ignore the keys that can morph
					case evt.KEY_NUMPAD_MULTIPLY:
					case evt.KEY_NUMPAD_PLUS:
					case evt.KEY_NUMPAD_ENTER:
					case evt.KEY_NUMPAD_MINUS:
					case evt.KEY_NUMPAD_DIVIDE:
						break; // I could handle these but just pick them up in keypress
					case evt.KEY_PAUSE:
					case evt.KEY_TAB:
					case evt.KEY_BACKSPACE:
					case evt.KEY_ENTER:
					case evt.KEY_ESCAPE:
					case evt.KEY_PAGE_UP:
					case evt.KEY_PAGE_DOWN:
					case evt.KEY_END:
					case evt.KEY_HOME:
					case evt.KEY_LEFT_ARROW:
					case evt.KEY_UP_ARROW:
					case evt.KEY_RIGHT_ARROW:
					case evt.KEY_DOWN_ARROW:
					case evt.KEY_INSERT:
					case evt.KEY_DELETE:
					case evt.KEY_F1:
					case evt.KEY_F2:
					case evt.KEY_F3:
					case evt.KEY_F4:
					case evt.KEY_F5:
					case evt.KEY_F6:
					case evt.KEY_F7:
					case evt.KEY_F8:
					case evt.KEY_F9:
					case evt.KEY_F10:
					case evt.KEY_F11:
					case evt.KEY_F12:
					case evt.KEY_F12:
					case evt.KEY_F13:
					case evt.KEY_F14:
					case evt.KEY_F15:
					case evt.KEY_CLEAR:
					case evt.KEY_HELP:
						evt.key = evt.keyCode;
						break;
					default:
						if(evt.ctrlKey || evt.altKey){
							var unifiedCharCode = evt.keyCode;
							// if lower case but keycode is uppercase, convert it
							if(unifiedCharCode >= 65 && unifiedCharCode <= 90 && evt.shiftKey == false){
								unifiedCharCode += 32;
							}
							if(unifiedCharCode >= 1 && unifiedCharCode <= 26 && evt.ctrlKey){
								unifiedCharCode += 96; // 001-032 = ctrl+[a-z]
							}
							evt.key = String.fromCharCode(unifiedCharCode);
						}
				}
			} else if(evt["type"] == "keypress"){
				if(dojo.render.html.opera){
					if(evt.which == 0){
						evt.key = evt.keyCode;
					}else if(evt.which > 0){
						switch(evt.which){
							case evt.KEY_SHIFT:
							case evt.KEY_CTRL:
							case evt.KEY_ALT:
							case evt.KEY_CAPS_LOCK:
							case evt.KEY_NUM_LOCK:
							case evt.KEY_SCROLL_LOCK:
								break;
							case evt.KEY_PAUSE:
							case evt.KEY_TAB:
							case evt.KEY_BACKSPACE:
							case evt.KEY_ENTER:
							case evt.KEY_ESCAPE:
								evt.key = evt.which;
								break;
							default:
								var unifiedCharCode = evt.which;
								if((evt.ctrlKey || evt.altKey || evt.metaKey) && (evt.which >= 65 && evt.which <= 90 && evt.shiftKey == false)){
									unifiedCharCode += 32;
								}
								evt.key = String.fromCharCode(unifiedCharCode);
						}
					}
				}else if(dojo.render.html.ie){ // catch some IE keys that are hard to get in keyDown
					// key combinations were handled in onKeyDown
					if(!evt.ctrlKey && !evt.altKey && evt.keyCode >= evt.KEY_SPACE){
						evt.key = String.fromCharCode(evt.keyCode);
					}
				}else if(dojo.render.html.safari){
					switch(evt.keyCode){
						case 63232: evt.key = evt.KEY_UP_ARROW; break;
						case 63233: evt.key = evt.KEY_DOWN_ARROW; break;
						case 63234: evt.key = evt.KEY_LEFT_ARROW; break;
						case 63235: evt.key = evt.KEY_RIGHT_ARROW; break;
						default: 
							evt.key = evt.charCode > 0 ? String.fromCharCode(evt.charCode) : evt.keyCode;
					}
				}else{
					evt.key = evt.charCode > 0 ? String.fromCharCode(evt.charCode) : evt.keyCode;
				}
			}
		}
		if(dojo.render.html.ie){
			if(!evt.target){ evt.target = evt.srcElement; }
			if(!evt.currentTarget){ evt.currentTarget = (sender ? sender : evt.srcElement); }
			if(!evt.layerX){ evt.layerX = evt.offsetX; }
			if(!evt.layerY){ evt.layerY = evt.offsetY; }
			// FIXME: scroll position query is duped from dojo.html to avoid dependency on that entire module
			// DONOT replace the following to use dojo.body(), in IE, document.documentElement should be used
			// here rather than document.body
			var doc = (evt.srcElement && evt.srcElement.ownerDocument) ? evt.srcElement.ownerDocument : document;
			var docBody = ((dojo.render.html.ie55)||(doc["compatMode"] == "BackCompat")) ? doc.body : doc.documentElement;
			if(!evt.pageX){ evt.pageX = evt.clientX + (docBody.scrollLeft || 0) }
			if(!evt.pageY){ evt.pageY = evt.clientY + (docBody.scrollTop || 0) }
			// mouseover
			if(evt.type == "mouseover"){ evt.relatedTarget = evt.fromElement; }
			// mouseout
			if(evt.type == "mouseout"){ evt.relatedTarget = evt.toElement; }
			this.currentEvent = evt;
			evt.callListener = this.callListener;
			evt.stopPropagation = this.stopPropagation;
			evt.preventDefault = this.preventDefault;
		}
		return evt;
	}

	this.stopEvent = function(ev){
		if(window.event){
			ev.returnValue = false;
			ev.cancelBubble = true;
		}else{
			ev.preventDefault();
			ev.stopPropagation();
		}
	}
}
