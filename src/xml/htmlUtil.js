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

}
