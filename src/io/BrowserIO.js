dojo.hostenv.startPackage("dojo.io.BrowserIO");

dojo.hostenv.loadModule("dojo.io.IO");

dojo.io.formHasFile = function(formNode){
	function checkChildrenForFile(node){
		var hasTrue = false;
		for(var x=0; x<node.childNodes.length; x++){
			if(node.nodeType==1){
				if(node.nodeName.toLowerCase() == "input"){
					if(node.getAttribute("type")=="file"){
						return true;
					}
				}

				if(node.childNodes.length){
					if(checkChildrenForFile(node)){
						return true;
					}
				}
			}
		}
		return false;
	}

	return checkChildrenForFile(formNode);
}

dojo.io.buildFormGetString = function(sNode){
	var ec = encodeURIComponent;
	//the argument is a DOM Node corresponding to a form element.
	var tvar = "";
	var ctyp = sNode.nodeName ? sNode.nodeName.toLowerCase() : "";
	var etyp = sNode.type ? sNode.type.toLowerCase() : "";
	if( ( (ctyp=="input") && (etyp!="radio") && (etyp!="checkbox") ) || (ctyp=="select") || (ctyp=="textarea")){
		if(!((ctyp=="select")&&(sNode.getAttribute("multiple")))){
			tvar = ec(sNode.getAttribute("name")) + "=" + ec(sNode.value) + "&";
		}else{
			// otherwise we have a multi-select element, so gather all of it's values
			var tn = ec(sNode.getAttribute("name")); 
			var copts = sNode.getElementsByTagName("option");
			for(var x=0; x<copts.length; x++){
				if(copts[x].hasAttribute("selected")){
					tvar += tn+"="+ec(copts[x].value)+"&";
				}
			}
		}
	}else if(ctyp=="input"){
		if(sNode.checked){
			tvar = ec(sNode.getAttribute("name")) + "=" + ec(sNode.value)  + "&";
		}
	}
	if(sNode.hasChildNodes()){
		for(var temp_count=(sNode.childNodes.length-1); temp_count >= 0; temp_count=temp_count-1){
			tvar += dojo.io.buildFormGetString(sNode.childNodes.item(temp_count));
		}
	}
	return tvar;
}

dojo.io.createIFrame = function(fname){
	if(window[fname]){ return window[fname]; }
	if(window.frames[fname]){ return window.frames[fname]; }
	var r = dojo.render.html;
	var cframe = null;
	cframe = document.createElement((((r.ie)&&(r.win)) ? "<iframe name="+fname+">" : "iframe"));
	with(cframe){
		name = fname;
		setAttribute("name", fname);
		id = fname;
	}
	window[fname] = cframe;
	document.body.appendChild(cframe);
	with(cframe.style){
		position = "absolute";
		left = top = "0px";
		height = width = "1px";
		visibility = "hidden";
		if(dojo.hostenv.is_debug_){
			position = "relative";
			height = "100px";
			width = "300px";
			visibility = "visible";
		}
	}

	// FIXME: do we need to (optionally) squelch onload?
	
	dojo.io.setIFrameSrc(cframe, dojo.hostenv.base_relative_path_+"/blank.html", true);
	return cframe;
}

dojo.io.setIFrameSrc = function(iframe, src, replace){
	try{
		var r = dojo.render.html;
		// dj_debug(iframe);
		if(!replace){
			if(r.safari){
				iframe.location = src;
			}else{
				frames[iframe.name].location = src;
			}
		}else{
			var idoc = (r.moz) ? iframe.contentWindow : iframe;
			idoc.location.replace(src);
			dj_debug(iframe.contentWindow.location);
		}
	}catch(e){ alert(e); }
}


dojo.io.cancelDOMEvent = function(evt){
	if(!evt){ return false; }
	if(evt.preventDefault){
		evt.stopPropagation();
		evt.preventDefault();
	}else{
		if(window.event){
			window.event.cancelBubble = true;
			window.event.returnValue = false;
		}
	}
	return false;
}

dojo.io.XMLHTTPTransport = new function(){
	
	this.initialHref = window.location.href;
	this.initialHash = window.location.hash;
	// alert(this.initialHash);

	this.moveForward = false;

	this.historyStack = [];
	this.forwardStack = [];
	this.historyIframe = null;
	this.bookmarkAnchor = null;
	this.locationTimer = null;

	/* NOTES:
	 *	Safari 1.2: 
	 *		back button "works" fine, however it's not possible to actually
	 *		DETECT that you've moved backwards by inspecting window.location.
	 *		Unless there is some other means of locating.
	 *		FIXME: perhaps we can poll on history.length?
	 *	IE 5.5 SP2:
	 *		back button behavior is macro. It does not move back to the
	 *		previous hash value, but to the last full page load. This suggests
	 *		that the iframe is the correct way to capture the back button in
	 *		these cases.
	 *	IE 6.0:
	 *		same behavior as IE 5.5 SP2
	 * Firefox 1.0:
	 *		the back button will return us to the previous hash on the same
	 *		page, thereby not requiring an iframe hack, although we do then
	 *		need to run a timer to detect inter-page movement.
	 */
	this.addToHistory = function(args){
		var callback = args["back"]||args["backButton"]||args["handle"];
		var hash = null;
		if(!this.historyIframe){
			this.historyIframe = window.frames["djhistory"];
		}
		if(!this.bookmarkAnchor){
			this.bookmarkAnchor = document.createElement("a");
			document.body.appendChild(this.bookmarkAnchor);
			this.bookmarkAnchor.style.display = "none";
		}
		if((!args["changeURL"])||(dojo.render.html.ie)){
			var url = dojo.hostenv.base_relative_path_+"blank.html?"+(new Date()).getTime();
			this.moveForward = true;
			dojo.io.setIFrameSrc(this.historyIframe, url, false);
		}
		if(args["changeURL"]){
			hash = "#"+ ((args["changeURL"]!==true) ? args["changeURL"] : (new Date()).getTime());
			setTimeout("window.location.href = '"+hash+"';", 1);
			this.bookmarkAnchor.href = hash;
			if(dojo.render.html.ie){
				// IE requires manual setting of the hash since we are catching
				// events from the iframe
				var oldCB = callback;
				var lh = null;
				var hsl = this.historyStack.length-1;
				if(hsl>=0){
					while(!this.historyStack[hsl]["hash"]){
						hsl--;
					}
					lh = this.historyStack[hsl]["hash"];
				}
				if(lh){
					callback = function(){
						if(window.location.hash != ""){
							window.location.href = lh;
						}
						oldCB();
					}
				}
				// when we issue a new bind(), we clobber the forward 
				// FIXME: is this always a good idea?
				this.forwardStack = []; 
				var oldFW = args["forward"]||args["forwardbutton"];;
				var tfw = function(){
					if(window.location.hash != ""){
						window.location.href = hash;
					}
					if(oldFW){ // we might not actually have one
						oldFW();
					}
				}
				if(args["forward"]){
					args.forward = tfw;
				}else if(args["forwardButton"]){
					args.forwardButton = tfw;
				}
			}else if(dojo.render.html.moz){
				// start the timer
				if(!this.locationTimer){
					this.locationTimer = setInterval("dojo.io.XMLHTTPTransport.checkLocation();", 200);
				}
			}
		}

		this.historyStack.push({"url": url, "callback": callback, "kwArgs": args, "urlHash": hash});
	}

	this.checkLocation = function(){
		var hsl = this.historyStack.length;

		if((window.location.hash == this.initialHash)||(window.location.href == this.initialHref)&&(hsl == 1)){
			// FIXME: could this ever be a forward button?
			// we can't clear it because we still need to check for forwards. Ugg.
			// clearInterval(this.locationTimer);
			this.handleBackButton();
			return;
		}
		// first check to see if we could have gone forward. We always halt on
		// a no-hash item.
		if(this.forwardStack.length > 0){
			if(this.forwardStack[this.forwardStack.length-1].urlHash == window.location.hash){
				this.handleForwardButton();
				return;
			}
		}
		// ok, that didn't work, try someplace back in the history stack
		if((hsl >= 2)&&(this.historyStack[hsl-2])){
			if(this.historyStack[hsl-2].urlHash==window.location.hash){
				this.handleBackButton();
				return;
			}
		}
	}

	this.iframeLoaded = function(evt, ifrLoc){
		var isp = ifrLoc.href.split("?");
		if(isp.length < 2){ 
			// alert("iframeLoaded");
			// we hit the end of the history, so we should go back
			if(this.historyStack.length == 1){
				this.handleBackButton();
			}
			return;
		}
		var query = isp[1];
		if(this.moveForward){
			// we were expecting it, so it's not either a forward or backward
			// movement
			this.moveForward = false;
			return;
		}

		var last = this.historyStack.pop();
		// we don't have anything in history, so it could be a forward button
		if(!last){ 
			if(this.forwardStack.length > 0){
				var next = this.forwardStack[this.forwardStack.length-1];
				if(query == next.url.split("?")[1]){
					this.handleForwardButton();
				}
			}
			// regardless, we didnt' have any history, so it can't be a back button
			return;
		}
		// put it back on the stack so we can do something useful with it when
		// we call handleBackButton()
		this.historyStack.push(last);
		if(this.historyStack.length >= 2){
			if(isp == this.historyStack[this.historyStack.length-2].url){
				// looks like it IS a back button press, so handle it
				this.handleBackButton();
			}
		}else{
			this.handleBackButton();
		}
	}

	this.handleBackButton = function(){
		var last = this.historyStack.pop();
		if(!last){ return; }
		if(last["callback"]){
			last.callback();
		}else if(last.kwArgs["backButton"]){
			last.kwArgs["backButton"]();
		}else if(last.kwArgs["back"]){
			last.kwArgs["back"]();
		}else if(last.kwArgs["handle"]){
			last.kwArgs.handle("back");
		}
		this.forwardStack.push(last);
	}

	this.handleForwardButton = function(){
		// FIXME: should we build in support for re-issuing the bind() call here?
		// alert("alert we found a forward button call");
		var last = this.forwardStack.pop();
		if(!last){ return; }
		if(last.kwArgs["forward"]){
			last.kwArgs.back();
		}else if(last.kwArgs["forwardButton"]){
			last.kwArgs.forwardButton();
		}else if(last.kwArgs["handle"]){
			last.kwArgs.handle("forward");
		}
		this.historyStack.push(last);
	}

	this.canHandle = function(kwArgs){
		// canHandle just tells dojo.io.bind() if this is a good transport to
		// use for the particular type of request.
		if(	
			(
				(kwArgs["mimetype"] == "text/plain") ||
				(kwArgs["mimetype"] == "text/html") ||
				(kwArgs["mimetype"] == "text/xml") ||
				(kwArgs["mimetype"] == "text/javascript")
			)&&(
				(kwArgs["method"] == "get") ||
				( 
					(kwArgs["method"] == "post") && 
					( (!kwArgs["formNode"])||(dojo.io.formHasFile(kwArgs["formNode"])) ) 
				) 
			)
		){
			return true;
		}

		return false;
	}

	this.bind = function(kwArgs){

		if(!kwArgs["url"]){
			if(((!kwArgs["formNode"]))&&((kwArgs["backButton"])||(kwArgs["back"])||(kwArgs["changeURL"])||(kwArgs["watchForURL"]))){
				this.addToHistory(kwArgs);
				return true;
			}
		}

		// much of this is from getText, but reproduced here because we need
		// more flexibility
		var http = dojo.hostenv.getXmlhttpObject();
		var received = false;

		// build a handler function that calls back to the handler obj
		http.onreadystatechange = function(){
			if((4==http.readyState)&&(http["status"])){
				if(received){ return; } // Opera 7.6 is foo-bar'd
				received = true;
				if(http.status==200){
					// FIXME: if our request type was "text/javascript", should
					// we eval() here?
					var ret = http.responseText;
					if(kwArgs.mimetype == "text/javascript"){
						ret = dj_eval(http.responseText);
					}else if(kwArgs.mimetype == "text/xml"){
						ret = http.responseXML
					}
					kwArgs.load("load", ret, http);
				}else{
					var errObj = new dojo.io.Error("sampleTransport Error: "+http.status+" "+http.statusText);
					kwArgs.error("error", errObj);
				}
			}
		}

		var url = kwArgs.url+"?";
		if(kwArgs["formNode"]){
			if(kwArgs.formNode.getAttribute("action")){
				url = kwArgs.formNode.getAttribute("action")+"?";
			}
			// FIXME: need to fix this for POST!!
			url += dojo.io.buildFormGetString(kwArgs.formNode);
		}

		if(kwArgs["content"]){
			url += "?"+dojo.io.argsFromMap(kwArgs.content);
		}

		if((kwArgs["backButton"])||(kwArgs["back"])||(kwArgs["changeURL"])){
			this.addToHistory(kwArgs);
		}

		/*
		FIXME: !!!!
		if(kwArgs.method == "post"){
			// http.open("POST", uri, true);
			// http.send(postContent);
		}else{
		}
		*/

		http.open("GET", url, true);
		http.send(null);
		return;
	}
	dojo.io.transports.addTransport("XMLHTTPTransport");
}

