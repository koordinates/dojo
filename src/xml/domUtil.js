dojo.hostenv.startPackage("dojo.xml.domUtil");

// for loading script:
dojo.xml.domUtil = new function(){

	this.nodeTypes = {
		ELEMENT_NODE                  : 1,
		ATTRIBUTE_NODE                : 2,
		TEXT_NODE                     : 3,
		CDATA_SECTION_NODE            : 4,
		ENTITY_REFERENCE_NODE         : 5,
		ENTITY_NODE                   : 6,
		PROCESSING_INSTRUCTION_NODE   : 7,
		COMMENT_NODE                  : 8,
		DOCUMENT_NODE                 : 9,
		DOCUMENT_TYPE_NODE            : 10,
		DOCUMENT_FRAGMENT_NODE        : 11,
		NOTATION_NODE                 : 12
	}
	
	this.dojoml = "http://www.dojotoolkit.org/2004/dojoml";
	
	this.getTagName = function(node) {
		var tagName = node.tagName;
		if(tagName.substr(0,5).toLowerCase()!="dojo:"){
			
			if(tagName.substr(0,4).toLowerCase()=="dojo"){
				// FIXME: this assuumes tag names are always lower case
				return "dojo:" + tagName.substring(4).toLowerCase();
			}

			var djt = node.getAttribute("dojoType");
			if(djt){
				return "dojo:"+djt.toLowerCase();
			}
			
			if((node.getAttributeNS)&&(node.getAttributeNS(this.dojoml,"type"))){
				return "dojo:" + node.getAttributeNS(this.dojoml,"type").toLowerCase();
			}

			djt = node.getAttribute("dojo:type");
			if(djt){
				return "dojo:"+djt.toLowerCase();
			}
		}
		return tagName.toLowerCase();
	}

}





