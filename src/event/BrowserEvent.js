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
	this.clobberNodes = [];

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

		var na = (this.clobberNodes.length) ? this.clobberNodes : document.all;
		/*
		for(var p = this.clobberArr.length-1; p>=0; p=p-1){
			alert(this.clobberArr[p]);
		}
		*/
		for(var i = na.length-1; i>=0; i=i-1){
			var el = na[i];
			for(var p = this.clobberArr.length-1; p>=0; p=p-1){
				// stripctr++;
				var ta = this.clobberArr[p];
				try{
					el[ta] = null;
					el.removeAttribute(ta);
					delete el[ta];
				}catch(e){ /* squelch */ }
			}
		}
		// alert("clobbering took: "+((new Date())-init)+"ms\nwe removed: "+stripctr+" properties");
	}
}

if((dojo.render.html.ie)&&((!dojo.hostenv.ie_prevent_clobber_)||(dojo.hostenv.ie_clobber_minimal_))){
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

	this.addClobberNode = function(node){
		if(dojo.hostenv.ie_clobber_minimal_){
			dojo_ie_clobber.clobberNodes.push(node);
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
		if(dojo.render.html.ie){
			if(!evt.target){ evt.target = evt.srcElement; }
			if(!evt.currentTarget){ evt.currentTarget = evt.srcElement; }
			if(!evt.layerX){ evt.layerX = evt.offsetX; }
			if(!evt.layerY){ evt.layerY = evt.offsetY; }
			// mouseover
			if(evt.fromElement){ evt.relatedTarget = evt.fromElement; }
			// mouseout
			if(evt.toElement){ evt.relatedTarget = evt.toElement; }
			evt.callListener = function(listener, curTarget){
				if(typeof listener != 'function'){
					dj_throw("listener not a function: " + listener);
				}
				evt.currentTarget = curTarget;
				var ret = listener.call(curTarget, evt);
				return ret;
			}

			evt.stopPropagation = function(){
				evt.cancelBubble = true;
			}

			evt.preventDefault = function(){
			  evt.returnValue = false;
			}
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
