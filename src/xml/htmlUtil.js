dojo.hostenv.startPackage("dojo.xml.htmlUtil");
dojo.hostenv.loadModule("dojo.text.*");
dojo.hostenv.loadModule("dojo.event.*");

// FIXME: we are going to assume that we can throw any and every rendering
// engine into the IE 5.x box model. In Mozilla, we do this w/ CSS. Need to investigate for KHTML and Opera
dojo.xml.htmlUtil = new function(){
	var _this = this;
	var _selectDisabled = false;
	this.styleSheet = null;
	
	// FIXME: need to make sure these get installed at onLoad!!!
	// FIXME: if we're on Moz, we need to FORCE -moz-box-sizing: border-box;
	/*
	document.body.style.boxSizing = "border-box";
	document.body.style.MozBoxSizing = "border-box";
	*/

	this._clobberSelection = function(){
		if(window.getSelection){
			var selObj = window.getSelection();
			selObj.collapseToEnd();
		}else if(document.selection){
			document.selection.clear();
		}
	}

	this.disableSelect = function(){
		if(!_selectDisabled){
			_selectDisabled = true;
			dojo.event.connect(document.body, "onselectstart", dojo.event.browser, "stopEvent");
			dojo.event.connect(document.body, "ondragstart", dojo.event.browser, "stopEvent");
			dojo.event.connect(document.body, "onmousemove", this, "_clobberSelection");
		}
	}

	this.enableSelect = function(){
		if(_selectDisabled){
			_selectDisabled = false;
			dojo.event.disconnect(document.body, "onselectstart", dojo.event.browser, "stopEvent");
			dojo.event.disconnect(document.body, "ondragstart", dojo.event.browser, "stopEvent");
			dojo.event.disconnect(document.body, "onmousemove", this, "_clobberSelection");
		}
	}

	var cm = document["compatMode"];
	var boxSizing = ((cm)&&((cm == "BackCompat")||(cm == "QuirksMode"))) ? true : false;

	this.getInnerWidth = function(node){
		return node.offsetWidth;
	}

	this.getOuterWidth = function(node){
		dj_unimplemented("dojo.xml.htmlUtil.getOuterWidth");
	}

	this.getInnerHeight = function(node){
		return node.offsetHeight; // FIXME: does this work?
	}

	this.getOuterHeight = function(node){
		dj_unimplemented("dojo.xml.htmlUtil.getOuterHeight");
	}

	this.getTotalOffset = function(node, type){
		// cribbed from PPK
		var typeStr = (type=="top") ? "offsetTop" : "offsetLeft";
		var alt = (type=="top") ? "y" : "x";
		var ret = 0;
		if(node["offsetParent"]){
			// FIXME: this is known not to work sometimes on IE 5.x since nodes
			// soemtimes need to be "tickled" before they will display their
			// offset correctly
			while(node.offsetParent){
				ret += node[typeStr];
				node = node.offsetParent;
			}
		}else if(node[alt]){
			ret += node[alt];
		}
		return ret;
	}

	this.totalOffsetLeft = function(node){
		return this.getTotalOffset(node, "left");
	}

	this.getAbsoluteX = this.totalOffsetLeft;

	this.totalOffsetTop = function(node){
		return this.getTotalOffset(node, "top");
	}

	this.getAbsoluteY = this.totalOffsetTop;

	this.getEventTarget = function(evt){
		if((window["event"])&&(event["srcElement"])){
			return event.srcElement;
		}else if((evt)&&(evt.target)){
			return evt.target;
		}
	}

	this.getScrollTop = function() {
		return document.documentElement.scrollTop || document.body.scrollTop || 0;
	}

	this.getScrollLeft = function() {
		return document.documentElement.scrollLeft || document.body.scrollLeft || 0;
	}

	this.evtTgt = this.getEventTarget;

	this.getParentOfType = function(node, type){
		var parent = node;
		type = type.toLowerCase();
		while(parent.nodeName.toLowerCase()!=type){
			if((!parent)||(parent==(document["body"]||document["documentElement"]))){
				return null;
			}
			parent = parent.parentNode;
		}
		return parent;
	}

	// RAR: this function comes from nwidgets and is more-or-less unmodified.
	// We should probably look ant Burst and f(m)'s equivalents
	this.getAttribute = function(node, attr){
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
	this.getAttr = this.getAttribute; // for backwards compat (may disappear!!!)
	
	/*
	 *	Determines whether or not the specified node carries a value for the
	 *	attribute in question.
	*/
	this.hasAttribute = function(node, attr){
		var v = this.getAttribute(node, attr);
		return v ? true : false;
	}
	this.hasAttr = this.hasAttribute; // for backwards compat (may disappear!!!)
	
	
	/*
	 * Returns the string value of the list of CSS classes currently assigned
	 * directly to the node in question. Returns an empty string if no class attribute
	 * is found;
	*/
	this.getClass = function(node){
		if(node.className){
			return node.className;
		}else if(this.hasAttribute(node, "class")){
			return this.getAttribute(node, "class");
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
		if(this.hasAttribute(node,"class")||node.className){
			classStr += " " + (node.className||this.getAttribute(node, "class"));
		}
		return this.setClass(node, classStr);
	}

	/*	Adds the specified class to the end of the class list on the
	 *	passed &node;. Returns &true; or &false; indicating success or failure.
	*/

	this.addClass = function(node, classStr){
		if(!node){ return null; }
		if(this.hasAttribute(node,"class")||node.className){
			classStr = (node.className||this.getAttribute(node, "class")) + " " + classStr;
		}
		return this.setClass(node, classStr);
	}

	/*
	 *  Clobbers the existing list of classes for the node, replacing it with
	 *	the list given in the 2nd argument. Returns true or false
	 *	indicating success or failure.
	*/

	this.setClass = function(node, classStr){
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
		var classStr = dojo.text.trim(new String(classStr));

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
	this.getElementsByClassName = this.getElementsByClass;
	
	/* float between 0.0 (transparent) and 1.0 (opaque) */
	this.setOpacity = function(node, opacity, dontFixOpacity) {
		var h = dojo.render.html;
		if( !dontFixOpacity ) {
			if( opacity >= 1.0 ) {
				if( h.ie ) {
					this.clearOpacity(node);
					return;
				} else {
					opacity = 0.999999;
				}
			}
			else if( opacity < 0.0 ) { opacity = 0; }
		}
		if(h.ie){
			if(node.nodeName.toLowerCase() == "tr"){
				// FIXME: is this too naive? will we get more than we want?
				var tds = node.getElementsByTagName("td");
				for(var x=0; x<tds.length; x++){
					tds[x].style.filter = "Alpha(Opacity="+opacity*100+")";
				}
			}
			node.style.filter = "Alpha(Opacity="+opacity*100+")";
		}else if(h.moz){
			node.style.opacity = opacity; // ffox 1.0 directly supports "opacity"
			node.style.MozOpacity = opacity;
		}else if(h.safari){
			node.style.opacity = opacity; // 1.3 directly supports "opacity"
			node.style.KhtmlOpacity = opacity;
		}else{
			node.style.opacity = opacity;
		}
	}
	
	this.getOpacity = function(node) {
		if( dojo.render.html.ie ) {
			var opac = (node.filters && node.filters.alpha && typeof node.filters.alpha.opacity == "number" ? node.filters.alpha.opacity : 100) / 100;
		} else {
			var opac = node.style.opacity || node.style.MozOpacity ||  node.style.KhtmlOpacity || 1;
		}
		return opac >= 0.999999 ? 1.0 : Number(opac);
	}

	this.clearOpacity = function(node) {
		var h = dojo.render.html;
		if(h.ie) {
			if( node.filters && node.filters.alpha ) {
				node.style.filter = ""; // FIXME: may get rid of other filter effects
			}
		} else if(h.moz) {
			node.style.opacity = 1;
			node.style.MozOpacity = 1;
		} else if(h.safari) {
			node.style.opacity = 1;
			node.style.KhtmlOpacity = 1;
		} else {
			node.style.opacity = 1;
		}
	}
	
	// FIXME: this is a really basic stub for adding and removing cssRules, but
	// it assumes that you know the index of the cssRule that you want to add 
	// or remove, making it less than useful.  So we need something that can 
	// search for the selector that you you want to remove.
	this.insertCSSRule = function(selector, declaration, index) {
		if(dojo.render.html.ie) {
			if(!this.styleSheet) {
				// FIXME: create a new style sheet document
			}
			if(!index) {
				index = this.styleSheet.rules.length;
			}
			return this.styleSheet.addRule(selector, declaration, index);
		} else if(document.styleSheets[0] && document.styleSheets[0].insertRule) {
			if(!this.styleSheet) {
				// FIXME: create a new style sheet document here
			}
			if(!index) {
				index = this.styleSheet.cssRules.length;
			}
			var rule = selector + "{" + declaration + "}"
			return this.styleSheet.insertRule(rule, index);
		}
	}
	
	this.removeCSSRule = function(index){
		if(!this.styleSheet){
			dj_debug("no stylesheet defined for removing rules");
			return false;
		}
		if(dojo.render.html.ie){
			if(!index){
				index = this.styleSheet.rules.length;
				this.styleSheet.removeRule(index);
			}
		}else if(document.styleSheets[0]){
			if(!index){
				index = this.styleSheet.cssRules.length;
			}
			this.styleSheet.deleteRule(index);
		}
		return true;
	}

	this.insertCSSFile = function(URI, doc, checkDuplicates){
		if(!URI) { return; }
		if(!doc){ doc = document; }
		if(checkDuplicates && doc.styleSheets) {
			for(var i = 0; i < doc.styleSheets.length; i++) {
				if(URI == doc.styleSheets[i].href) {
					return;
				}
			}
		}
		var file = doc.createElement("link");
		file.setAttribute("type", "text/css");
		file.setAttribute("rel", "stylesheet");
		file.setAttribute("href", URI);
		var head = doc.getElementsByTagName("head")[0];
		head.appendChild(file);
	}

	this.getBackgroundColor = function(node) {
		var color;
		do {
			color = dojo.xml.domUtil.getStyle(node, "background-color");
			// Safari doesn't say "transparent"
			if(color.toLowerCase() == "rgba(0, 0, 0, 0)") { color = "transparent"; }
			if(node == document.body) { node = null; break; }
			node = node.parentNode;
		} while(node && color == "transparent");

		if( color == "transparent" ) {
			color = [255, 255, 255, 0];
		} else {
			color = dojo.xml.domUtil.extractRGB(color);
		}
		return color;
	}
}
