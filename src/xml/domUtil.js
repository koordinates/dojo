if(!dojo){ dojo = {}; }
if(!dojo.xml){ 
	dojo.xml = {};
}

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
		if(tagName.substr(0,5).toLowerCase()!="dojo:") {
			
			if(tagName.substr(0,4).toLowerCase()=="dojo") {
				// FIXME: this assuumes tag names are always lower case
				return "dojo:" + tagName.substring(4).toLowerCase();
			}
			
			if(node.getAttribute("dojoType")) {
				return "dojo:" + node.getAttribute("dojoType").toLowerCase();
			}
			
			if(node.getAttributeNS && node.getAttributeNS(this.dojoml,"type")) {
				return "dojo:" + node.getAttributeNS(this.dojoml,"type").toLowerCase();
			}
			
			if(node.getAttribute("dojo:type")) {
				return "dojo:" + node.getAttribute("dojo:type").toLowerCase();
			}
		}
		return tagName.toLowerCase();
	}

}





