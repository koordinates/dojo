dojo.hostenv.startPackage("dojo.xml.htmlUtil");

// FIXME: we are going to assume that we can throw any and every rendering
// engine into the IE 5.x box model. In Mozilla, we do this w/ CSS. Need to investigate for KHTML and Opera
dojo.xml.htmlUtil = new function(){
	
	// FIXME: need to make sure these get installed at onLoad!!!
	// FIXME: if we're on Moz, we need to FORCE -moz-box-sizing: border-box;
	/*
	document.body.style.boxSizing = "border-box";
	document.body.style.MozBoxSizing = "border-box";
	*/
	var cm = document["compatMode"];
	var boxSizing = ((cm)&&((cm == "BackCompat")||(cm == "QuirksMode"))) ? true : false;

	this.getInnerWidth = function(node){
		return node.offsetWidth;
	}

	this.getOuterWidth = function(node){

	}

	this.getInnerHeight = function(node){
		return node.offsetHeight; // FIXME: does this work?
	}

	this.getOuterHeight = function(node){
	}

	this.getEventTarget = function(evt){
		if((window["event"])&&(event["srcElement"])){
			return event.srcElement;
		}else if((evt)&&(evt.target)){
			return evt.target;
		}
	}

	this.evtTgt = this.getEventTarget;

	// RAR: this function comes from nwidgets and is more-or-less unmodified.
	// We should probably look ant Burst and f(m)'s equivalents
	this.getAttr  =	function(node, attr){
		// FIXME: need to add support for attr-specific accessors
		if((!node)||(!node.getAttribute)){
			// if(attr !== 'nwType'){
			//	alert("getAttr of '" + attr + "' with bad node"); 
			// }
			return null;
		}
		var ta = typeof attr == 'string' ? attr : new String(attr);

		// first try the approach most likely to succeed
		var v = node.getAttribute(ta.toUpperCase());
		if((v)&&(typeof v == 'string')&&(v!="")){ return v; }

		// try returning the attributes value, if we couldn't get it as a string
		if(v && typeof v == 'object' && v.value){ return v.value; }

		// this should work on Opera 7, but it's a little on the crashy side
		if((node.getAttributeNode)&&(node.getAttributeNode(ta))){
			return (node.getAttributeNode(ta)).value;
		}else if(node.getAttribute(ta)){
			return node.getAttribute(ta);
		}else if(node.getAttribute(ta.toLowerCase())){
			return node.getAttribute(ta.toLowerCase());
		}
		return null;
	}
	
	/*
	 *	Determines whether or not the specified node carries a value for the
	 *	attribute in question.
	*/
	this.hasAttr = function(node, attr){
		var v = this.getAttr(node, attr);
		return v ? true : false;
	}	
	
	
	/*
	 * Returns the string value of the list of CSS classes currently assigned
	 * directly to the node in question. Returns null if no class attribute
	 * is found;
	*/
	this.getClass = function(node){
		if(node.className){
			return node.className;
		}else if(this.hasAttr(node, "class")){
			return this.getAttr(node, "class");
		}
		return null;
	}

	/*
	 * Returns whether or not the specified classname is a portion of the
	 * class list currently applied to the node. Does not cover cascaded
	 * styles, only classes directly applied to the node.
	*/

	this.hasClass = function(node, classname){
		var classes = (this.getClass(node)||"").split(/\s+/);
		for(var x=0; x<classes.length; x++){
			if(classname == classes[x]){ return true; }
		}
		return false;
	}

	/*
	 * Adds the specified class to the beginning of the class list on the
	 * passed node. This gives the specified class the highest precidence
	 * when style cascading is calculated for the node. Returns true or
	 * false; indicating success or failure of the operation, respectively.
	*/

	this.prependClass = function(node, classStr){
		if(!node){ return null; }
		if(this.hasAttr(node,"class")||node.className){
			classStr += " " + (node.className||this.getAttr(node, "class"));
		}
		return this.setClass(node, classStr);
	}

	/*	Adds the specified class to the end of the class list on the
	 *	passed &node;. Returns &true; or &false; indicating success or failure.
	*/

	this.addCSSClass = function(node, classStr){
		if(!node){ return null; }
		if(this.hasAttr(node,"class")||node.className){
			classStr = (node.className||this.getAttr(node, "class")) + " " + classStr;
		}
		return this.setClass(node, classStr);
	}

	/*
	 *  Clobbers the existing list of classes for the node, replacing it with
	 *	the list given in the 2nd argument. Returns true or false
	 *	indicating success or failure.
	*/

	this.setCSSClass = function(node, classStr){
		if(!node){ return false; }
		var cs = new String(classStr);
		try{
			if(typeof node.className == "string"){
				node.className = cs;
			}else if(node.setAttribute){
				node.setAttribute("class", classStr);
				node.className = cs;
			}else{
				return false;
			}
		}catch(e){
			dj_debug("__util__.setClass() failed", e);
		}
		return true;
	}

	/*	Removes the className from the node;. Returns
	 *  true or false indicating success or failure.
	*/

	this.removeClass = function(node, classStr){
		if(!node){ return false; }
		var classStr = new String(classStr).trim();

		try{
			var cs = String( node.className ).split(" ");
			var nca  = [];
			for(var i = 0; i<cs.length; i++){
				if(cs[i] != classStr){ 
					nca .push(cs[i]);
				}
			}
			node.className = nca .join(" ");
		}catch(e){
			dj_debug("__util__.removeClass() failed", e);
		}

		return true;
	}

	/*	Returns an array of nodes for the given classStr, children of a
	 *  parent, and optionally of a certain nodeType
	*/

	// FIXME: need some real error checking code in here
	this.getElementsByClass = function(parent, classStr, nodeType) {
		if(!parent){ 
			parent = document;
		}
		/* FIXME: can't seem to get this to work in firefox for some reason
		if(document.evaluate) { // supports dom 3 xpath
			var xpathResult = document.evaluate('//[@class = "'classStr'"]', document, null, 0, null);
			var nodes = [];
			var item;
			while (item = xpathResult.iterateNext()) {
				nodes.push(item);
			}
			return nodes;
		} else {
		*/
		  if(!nodeType) {
				nodeType = "*";
			}
			var candidateNodes = parent.getElementsByTagName(nodeType);
			var nodes = [];
			for (var i=0; i<candidateNodes.length; i++) {
				// FIXME: needs to support non sequential ordering...
				if (candidateNodes[i]["className"].indexOf(classStr) != -1) {
					nodes.push(candidateNodes[i]);
				}
			}
			return nodes;
		/*}*/
	}
	
}
