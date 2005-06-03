dojo.hostenv.startPackage("dojo.event.BrowserEvent");
dojo.event.browser = {};

dojo.hostenv.loadModule("dojo.event.Event");

dojo_ie_clobber = new function(){
	this.clobberArr = ['data', 
		'onload', 'onmousedown', 'onmouseup', 
		'onmouseover', 'onmouseout', 'onmousemove', 
		'onclick', 'ondblclick', 'onfocus', 
		'onblur', 'onkeypress', 'onkeydown', 
		'onkeyup', 'onsubmit', 'onreset',
		'onselect', 'onchange', 'onselectstart', 
		'ondragstart', 'oncontextmenu'];

	this.exclusions = [];
	
	this.clobberList = {};

	this.addClobberAttr = function(type){
		if(dojo.render.html.ie){
			if((!this.clobberList[type])||
				(this.clobberList[type]!="set")){
				this.clobberArr.push(type);
				this.clobberList[type] = "set"; 
			}
		}
	}

	this.addExclusionID = function(id){
		this.exclusions.push(id);
	}

	if(dojo.render.html.ie){
		for(var x=0; x<this.clobberArr.length; x++){
			this.clobberList[this.clobberArr[x]] = "set";
		}
	}

	this.clobber = function(){
		// var init = new Date();
		// var stripctr = 0;
		for(var x=0; x< this.exclusions.length; x++){
			try{
				var tn = document.getElementById(this.exclusions[x]);
				tn.parentNode.removeChild(tn);
			}catch(e){
				// this is fired on unload, so squelch
			}
		}

		var na = document.all;
		for(var i = na.length-1; i>=0; i=i-1){
			var el = na[i];
			for(var p = this.clobberArr.length-1; p>=0; p=p-1){
				// stripctr++;
				el[this.clobberArr[p]] = null;
			}
		}
		// alert("clobbering took: "+((new Date())-init)+"ms\nwe removed: "+stripctr+" properties");
	}
}

if(dojo.render.html.ie){
	window.onunload = function(){
		dojo_ie_clobber.clobber();
	}
}

dojo.event.browser = new function(){
	this.addClobberAttr = function(type){
		dojo_ie_clobber.addClobberAttr(type);
	}

	this.addClobberAttrs = function(){
		for(var x=0; x<arguments.length; x++){
			this.addClobberAttr(arguments[x]);
		}
	}

	/*
	this.eventAroundAdvice = function(methodInvocation){
		var evt = this.fixEvent(methodInvocation.args[0]);
		return methodInvocation.proceed();
	}
	*/

	this.addListener = function(node, evtName, fp, capture){
		if(!capture){ var capture = false; }
		evtName = evtName.toLowerCase();
		if(evtName.substr(0,2)=="on"){ evtName = evtName.substr(2); }
		if(!node){ return; } // FIXME: log and/or bail?

		// build yet another closure around fp in order to inject fixEvent
		// around the resulting event
		var newfp = function(evt){
			if(!evt){ evt = window.event; }
			var ret = fp(dojo.event.browser.fixEvent(evt));
			if(capture){
				dojo.event.browser.stopEvent(evt);
			}
			return ret;
		}

		if(node.attachEvent){
			// NW_attachEvent_list.push([node, 'on' + evtName, fp]);
			node.attachEvent("on"+evtName, newfp);
		}else if(node.addEventListener){ // &&(!__is__.konq)){ // Konq 3.1 tries to implement this, but it seems to be broken
			node.addEventListener(evtName, newfp, capture);
			return true;
		}else{
			// NW_expando_list.push([node, 'on' + evtName]);
			// there's probably "better" anti-clobber algs, but this should only ever have
			// to happen once, so it should suffice
			if( typeof node["on"+evtName] == "function" ) {
				var oldEvt = node["on"+evtName];
				node["on"+evtName] = function(e) {
					oldEvt(e);
					newfp(e);
				}
			} else {
				node["on"+evtName]=newfp;
			}
			return true;
		}
	}

	this.fixEvent = function(evt){
		/* From the requirements doc:

		  Given that normalization of event properties is a goal, the
		  properties that should be normalized for all DOM events are:

			+ type
			+ target
			+ currentTarget
			+ relatedTarget

		  Methods that must be globally available on the event object include:

			+ preventDefault()
			+ stopPropagation()
		*/
		if(dojo.render.html.ie){
			return new dojo.event.IEEvent(evt||window["event"]);
		}
		return evt;
	}

	this.stopEvent = function(ev) {
		if(window.event){
			ev.returnValue = false;
			ev.cancelBubble = true;
		}else{
			ev.preventDefault();
			ev.stopPropagation();
		}
	}
}

dojo.event.IEEvent = function(evt){
	for(var prop in evt) {
		if(!this[prop]) {
			this[prop] = evt[prop];
		}
	}
	// this class is mainly taken from Burst's WindowEvent.js
	this.ie_event_ = evt;
	this.target = evt.srcElement;
	this.type = evt.type;
	this.layerX = evt.offsetX;
	this.layerY = evt.offsetY;

	// keyCode is not standardized in any w3 API yet (Level 3 Events is in draft).
	// some browsers store it in 'which'
	if(dojo.alg.has('keyCode', evt)){
		this.keyCode = ev.keyCode;
	}

	// below are all for MouseEvent.
	var this_obj = this;
	// these are the same in both
	dojo.alg.forEach(['shiftKey', 'altKey', 'ctrlKey', 'metaKey'], 
		function(k){
			if(dojo.alg.has(evt, k)){ 
				this_obj[k] = evt[k];
			} 
		}
	);

	if(typeof evt.button != 'undefined'){
		// these are different in interpretation, but we copy them anyway
		dojo.alg.forEach(['button', 'screenX', 'screenY', 'clientX', 'clientY'], 
			function(k){
				if(dojo.alg.has(evt, k)){
					this_obj[k] = evt[k];
				}
			}
		);
	}

	// mouseover
	if(evt.fromElement){ this.relatedTarget = evt.fromElement; }
	// mouseout
	if(evt.toElement){ this.relatedTarget = evt.toElement; }

	this.callListener = function(listener, curTarget){
		if(typeof listener != 'function'){
			dj_throw("listener not a function: " + listener);
		}
		this.currentTarget = curTarget;
		var ret = listener.call(curTarget, this);
		return ret;
	}

	this.stopPropagation = function(){
		this.ie_event_.cancelBubble = true;
	}

	this.preventDefault = function(){
	  this.ie_event_.returnValue = false;
	}

}
