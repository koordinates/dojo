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
		tvar = sNode.getAttribute("name") + "=" + sNode.value  + "&";
	}else if(ctyp=="input"){
		if(sNode.checked){
			tvar = sNode.getAttribute("name") + "=" + sNode.value  + "&";
		}
	}
	if(sNode.hasChildNodes()){
		for(var temp_count=(sNode.childNodes.length-1); temp_count >= 0; temp_count=temp_count-1){
			tvar += dojo.io.buildFormGetString(sNode.childNodes.item(temp_count));
		}
	}
	return tvar;
}

dojo.io.XMLHTTPTransport = new function(){
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
					var errObj = new dojo.io.Error("sampleTransport Error: "+evt.msg);
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

