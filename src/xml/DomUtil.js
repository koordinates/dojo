if(!dojo){ dojo = {}; }
if(!dojo.xml){ 
	dojo.xml = {};
}

// for loading script:
dojo.xml.DomUtil = {};

dojo.xml.DomUtil.ELEMENT_NODE 									= 1;
dojo.xml.DomUtil.ATTRIBUTE_NODE                 = 2;
dojo.xml.DomUtil.TEXT_NODE                      = 3;
dojo.xml.DomUtil.CDATA_SECTION_NODE             = 4;
dojo.xml.DomUtil.ENTITY_REFERENCE_NODE          = 5;
dojo.xml.DomUtil.ENTITY_NODE                    = 6;
dojo.xml.DomUtil.PROCESSING_INSTRUCTION_NODE    = 7;
dojo.xml.DomUtil.COMMENT_NODE                   = 8;
dojo.xml.DomUtil.DOCUMENT_NODE                  = 9;
dojo.xml.DomUtil.DOCUMENT_TYPE_NODE             = 10;
dojo.xml.DomUtil.DOCUMENT_FRAGMENT_NODE         = 11;
dojo.xml.DomUtil.NOTATION_NODE                  = 12;
