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
	//the argument is a DOM Node corresponding to a form element.
	var tvar = "";
	var ctyp = sNode.nodeName ? sNode.nodeName.toLowerCase() : "";
	var etyp = sNode.type ? sNode.type.toLowerCase() : "";
	if(( (ctyp=="input") && (etyp!="radio") && (etyp!="checkbox")) || (ctyp=="select") || (ctyp=="textarea")){
		tvar = encodeURIComponent(sNode.getAttribute("name")) + "=" + encodeURIComponent(sNode.value)  + "&";
	}else if(ctyp=="input"){
		if(sNode.checked){
			tvar = encodeURIComponent(sNode.getAttribute("name")) + "=" + encodeURIComponent(sNode.value)  + "&";
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

dojo.io.XMLHTTPTransport = new function(){

	this.moveForward = false;

	this.historyStack = [];
	this.forwardStack = [];
	this.historyIframe = null;

	this.addToHistory = function(callback, args){
		if(!this.historyIframe){
			this.historyIframe = window.frames["djhistory"];
		}
		var url = dojo.hostenv.base_relative_path_+"blank.html?"+(new Date()).getTime();
		this.moveForward = true;
		dojo.io.setIFrameSrc(this.historyIframe, url, false);
		this.historyStack.push({url: url, callback: callback, kwArgs: args});
	}

	this.checkForBackEvent = function(evt, ifrLoc){
		if(this.moveForward){
			this.moveForward = false;
			return;
		}
		var last = this.historyStack.pop();
		// we hadn't added anything to the history, so this is an error by
		// definition
		if(!last){ return; }

		/*
		for(var x in this.historyIframe.location){
			dj_debug(x+": "+this.historyIframe.location[x]);
		}
		dj_debug(this.historyIframe.location);
		*/
		last.callback();

		// FIXME: need to handle subsequent forward button requests too
		//	perhaps by re-issuing the bind() call?
		// this.forwardStack.push(last);
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
			// FIXME: need to fix this for POST!!
			url += dojo.io.buildFormGetString(kwArgs.formNode);
		}

		if(kwArgs["content"]){
			url += "?"+dojo.io.argsFromMap(kwArgs.content);
		}

		if(kwArgs["backButton"]){
			this.addToHistory(kwArgs.backButton, kwArgs);
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

