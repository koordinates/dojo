dojo.hostenv.startPackage("dojo.xml.htmlUtil");

// FIXME: we are going to assume that we can throw any and every rendering
// engine into the IE 5.x box model. In Mozilla, we do this w/ CSS. Need to investigate for KHTML and Opera
dojo.xml.htmlUtil = new function(){
	var _this = this;
	
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
	 * directly to the node in question. Returns an empty string if no class attribute
	 * is found;
	*/
	this.getClass = function(node){
		if(node.className){
			return node.className;
		}else if(this.hasAttr(node, "class")){
			return this.getAttr(node, "class");
		}
		return "";
	}

	/*
	 * Returns whether or not the specified classname is a portion of the
	 * class list currently applied to the node. Does not cover cascaded
	 * styles, only classes directly applied to the node.
	*/

	this.hasClass = function(node, classname){
		var classes = this.getClass(node).split(/\s+/g);
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

	// Enum type for getElementsByClass classMatchType arg:
	this.classMatchType = {
		ContainsAll : 0, // all of the classes are part of the node's class (default)
		ContainsAny : 1, // any of the classes are part of the node's class
		IsOnly : 2 // only all of the classes are part of the node's class
	}

	/*	Returns an array of nodes for the given classStr, children of a
	 *  parent, and optionally of a certain nodeType
	*/

	this.getElementsByClass = function(classStr, parent, nodeType, classMatchType) {
		if(!parent){ parent = document; }
		var classes = classStr.split(/\s+/g);
		var nodes = [];
		if( classMatchType != 1 && classMatchType != 2 ) classMatchType = 0; // make it enum

		if(document.evaluate) { // supports dom 3 xpath
			var xpath = "//" + (nodeType || "*") + "[contains(";
			if( classMatchType != _this.classMatchType.ContainsAny ) {
				xpath += "concat(' ',@class,' '), ' " +
					classes.join(" ') and contains(concat(' ',@class,' '), ' ") +
					" ')]";
			} else {
				xpath += "concat(' ',@class,' '), ' " +
					classes.join(" ')) or contains(concat(' ',@class,' '), ' ") +
					" ')]";
			}
			//dj_debug("xpath: " + xpath);

			var xpathResult = document.evaluate(xpath, document, null,
				XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

			outer:
			for(var node = null, i = 0; node = xpathResult.snapshotItem(i); i++) {
				if( classMatchType != _this.classMatchType.IsOnly ) {
					nodes.push(node);
				} else {
					if( !_this.getClass(node) ) { continue outer; }

					var nodeClasses = _this.getClass(node).split(/\s+/g);
					var reClass = new RegExp("(\\s|^)(" + classes.join(")|(") + ")(\\s|$)");
					for(var j = 0; j < nodeClasses.length; j++) {
						if( !nodeClasses[j].match(reClass) ) {
							continue outer;
						}
					}
					nodes.push(node);
				}
			}
		} else {
			if(!nodeType) { nodeType = "*"; }
			var candidateNodes = parent.getElementsByTagName(nodeType);

			outer:
			for(var i = 0; i < candidateNodes.length; i++) {
				var node = candidateNodes[i];
				if( !_this.getClass(node) ) { continue outer; }
				var nodeClasses = _this.getClass(node).split(/\s+/g);
				var reClass = new RegExp("(\\s|^)((" + classes.join(")|(") + "))(\\s|$)");
				var matches = 0;

				for(var j = 0; j < nodeClasses.length; j++) {
					if( reClass.test(nodeClasses[j]) ) {
						if( classMatchType == _this.classMatchType.ContainsAny ) {
							nodes.push(node);
							continue outer;
						} else {
							matches++;
						}
					} else {
						if( classMatchType == _this.classMatchType.IsOnly ) {
							continue outer;
						}
					}
				}

				if( matches == classes.length ) {
					if( classMatchType == _this.classMatchType.IsOnly && matches == nodeClasses.length ) {
						nodes.push(node);
					} else if( classMatchType == _this.classMatchType.ContainsAll ) {
						nodes.push(node);
					}
				}
			}
		}
		return nodes;
	}
	
}
