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
	
	this.setIFrameSrc(cframe, dojo.hostenv.base_relative_path_+"/blank.html", true);
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

	this.historyStack = [];
	this.historyIframe = null;

	this.addToHistory = function(url, callback){
		if(!this.historyIframe){
			this.historyIframe = dojo.io.createIFrame("djhistory");
			// FIXME: possible circref!
			var _this = this;
			this.historyIframe.onload = function(evt){ 
				dj_debug("caught onload");
				_this.checkForBackEvent(evt);
			}
		}

		var url = dojo.hostenv.base_relative_path_+"/blank.html?"+(new Date()).getTime();
		dojo.io.setIFrameSrc(this.historyIframe, url, false);
	}

	this.checkForBackEvent = function(evt){
		dj_debug(evt||window.event);
		// dj_debug(this.historyIframe.contentWindow.location.href);
	}

	this.canHandle = function(kwArgs){
		// canHandle just tells dojo.io.bind() if this is a good transport to
		// use for the particular type of request.
		if(	
			(
				(kwArgs["mimetype"] == "text/plain") ||
				(kwArgs["mimetype"] == "text/html") ||
				(kwArgs["mimetype"] == "text/javascript")
			)&&(
				(kwArgs["method"] == "get") ||
				( 
					(kwArgs["method"] == "post") && 
					( (!kwArgs["formNode"])||(this.formHasFile(kwArgs["formNode"])) ) 
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
		var http = null;
		var last_e = null;
		var received = false;
		try{ 
			http = new XMLHttpRequest(); 
		}catch(e){}
		if(!http){
			for(var i=0; i < DJ_XMLHTTP_PROGIDS.length; ++i){
				var progid = DJ_XMLHTTP_PROGIDS[i];
				try{
					http = new ActiveXObject(progid);
				}catch(e){
					last_e = e;
				}

				if(http){
					if(DJ_XMLHTTP_PROGIDS.length != 1){
						DJ_XMLHTTP_PROGIDS = [progid];  // optimize for next time
					}
					break;
				}
			}
		}

		if((last_e)&&(!http)){
			dj_rethrow("Could not create a new ActiveXObject using any of the progids " + DJ_XMLHTTP_PROGIDS.join(', '), last_e);
		}else if(!http){
			return dj_throw("No XMLHTTP implementation available");
		}


		// build a handler function that calls back to the handler obj
		http.onreadystatechange = function(){
			if((4==http.readyState)&&(http["status"])){
				if(received){ return; } // Opera 7.6 is foo-bar'd
				received = true;
				if(http.status==200){
					// FIXME: if our request type was "text/javascript", should
					// we eval() here?
					kwArgs.load("load", http.responseText, http);
				}else{
					var errObj = new dojo.io.Error("sampleTransport Error: "+http.status+" "+http.statusText);
					kwArgs.error("error", errObj);
				}
			}
		}

		var url = kwArgs.url+"?";
		if(kwArgs["formNode"]){
			// FIXME: need to fix this for POST!!
			url += this.buildFormGetString(kwArgs.formNode);
		}

		if(kwArgs["content"]){
			url += "?"+this.argsFromMap(kwArgs.content);
		}

		if(kwArgs["backButton"]){
			this.addToHistory(url, kwArgs.backButton);
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

