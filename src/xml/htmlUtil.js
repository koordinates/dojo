// FIXME: we are going to assume that we can throw any and every rendering
// engine into the IE 5.x box model. In Mozilla, we do this w/ CSS. Need to investigate for KHTML and Opera
dojo.xml.htmlUtil = new function(){
	
	document.body.style.boxSizing = "border-box";
	document.body.style.MozBoxSizing = "border-box";
	var cm = document["compatMode"];
	// FIXME: if we're on Moz, we need to FORCE -moz-box-sizing: border-box;
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

}
