dojo.hostenv.startPackage("dojo.event.BrowserEvent");
dojo.hostenv.startPackage("dojo.event.browser");

dojo.hostenv.loadModule("dojo.event.Event");

dojo.event.browser = new function(){

	this.eventAroundAdvice = function(methodInvocation){
		var evt = this.fixEvent(methodInvocation.args[0]);
		return methodInvocation.proceed();
	}

	this.addListener = function(node, evtName, fp, capture){
		if(!capture){ var capture = false; }
		if(evtName.substr(0,2)=="on"){ evtName = evtName.substr(2); }
		if(!node){ return; } // FIXME: log and/or bail?
		if(node.attachEvent){
			// NW_attachEvent_list.push([node, 'on' + evtName, fp]);
			node.attachEvent("on"+evtName, fp);
		}else if(node.addEventListener){ // &&(!__is__.konq)){ // Konq 3.1 tries to implement this, but it seems to be broken
			node.addEventListener(evtName, fp, capture);
			return true;
		}else{
			// NW_expando_list.push([node, 'on' + evtName]);
			// FIXME: this clobbers the event handler that's already set, is
			// there a way around it?
			node["on"+evtName]=fp;
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

		return evt;
	}
}
