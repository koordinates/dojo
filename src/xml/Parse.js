if(!dojo){ dojo = {}; }
if(!dojo.xml){ 
	dojo.xml = {};
}

// for loading script:
dojo.xml.Parse = {};

//TODO: determine dependencies
// currently has dependency on dojo.xml.DomUtil constants...

/* generic method for taking a node and parsing it into an object

For example, the following xml fragment

<foo bar="bar">
	<baz xyzzy="xyzzy"/>
</foo>

can be described as:

dojo.???.foo = {}
dojo.???.foo.bar = {}
dojo.???.foo.bar.value = "xyzzy";
dojo.???.foo.baz = {}
dojo.???.foo.baz.xyzzy = {}
dojo.???.foo.baz.xyzzy.value = "xyzzy"

*/

 // TODO: resolve call stack for all of this within namespaced context

 
// using documentFragment nomenclature to generalize in case we don't want to require passing a collection of nodes with a single parent
dojo.xml.ParseDocumentFragmentToJSObject = function() {

}

dojo.xml.ParseDocumentFragmentToJSObject.prototype.parseFragment = function(documentFragment) {
	// handle parent element
	var parsedFragment = {};
	// TODO: What if document fragment is just text... need to check for nodeType perhaps?
	parsedFragment[documentFragment.tagName] = new Array(documentFragment.tagName);
	var attributeSet = this.parseAttributes(documentFragment);
	for(var attr in attributeSet) {
		if(!parsedFragment[attr]) {
			parsedFragment[attr] = new Array();
		}
		parsedFragment[attr][parsedFragment[attr].length] = attributeSet[attr];
	}
	for (var childNode in documentFragment.childNodes) {
		switch(documentFragment.childNodes[childNode].nodeType) {
			case dojo.xml.DomUtil.ELEMENT_NODE: // element nodes, call this function recursively
				parsedFragment[documentFragment.tagName][parsedFragment[ documentFragment.tagName].length] = this.parseElement( documentFragment.childNodes[childNode]);
				break;
			case dojo.xml.DomUtil.TEXT_NODE: // if a single text node is the child, treat it as an attribute
				if(documentFragment.childNodes.length == 1) {
					if(!parsedFragment[documentFragment.tagName]) {
						parsedFragment[documentFragment.tagName] = new Array();
					}
					parsedFragment[documentFragment.tagName][parsedFragment[documentFragment.tagName].length] = { value: documentFragment.childNodes[0].nodeValue };
				}
				break;
		}
	}
	
	return parsedFragment;
}

dojo.xml.ParseDocumentFragmentToJSObject.prototype.parseElement = function(node,parentNodeSet){
	// TODO: make this namespace aware
	var parsedNodeSet = {};
	parsedNodeSet[node.tagName] = new Array();
	var attributeSet = this.parseAttributes(node);
	for(var attr in attributeSet) {
		if(!parsedNodeSet[attr]) {
			parsedNodeSet[attr] = new Array();
		}
		parsedNodeSet[attr][parsedNodeSet[attr].length] = attributeSet[attr];
	}
	for (var i=0; i<node.childNodes.length; i++)
	{
		switch(node.childNodes[i].nodeType){
			case dojo.xml.DomUtil.ELEMENT_NODE: // element nodes, call this function recursively
 				parsedNodeSet[node.tagName][parsedNodeSet[node.tagName].length] = this.parseElement(node.childNodes[i],parsedNodeSet);
				break;
			case dojo.xml.DomUtil.ATTRIBUTE_NODE: // attribute node... not meaningful here
				break;
			case dojo.xml.DomUtil.TEXT_NODE: // if a single text node is the child, treat it as an attribute
				if(node.childNodes.length == 1) {
					parsedNodeSet[node.tagName][parsedNodeSet[node.tagName].length] = { value: node.childNodes[0].nodeValue };
				}
				break;
			case dojo.xml.DomUtil.CDATA_SECTION_NODE: // cdata section... not sure if this would ever be meaningful... might be...
				break;
			case dojo.xml.DomUtil.ENTITY_REFERENCE_NODE: // entity reference node... not meaningful here
				break;
			case dojo.xml.DomUtil.ENTITY_NODE: // entity node... not sure if this would ever be meaningful
				break;
			case dojo.xml.DomUtil.PROCESSING_INSTRUCTION_NODE: // processing instruction node... not meaningful here
				break;
			case dojo.xml.DomUtil.COMMENT_NODE: // comment node... not not sure if this would ever be meaningful 
				break;
			case dojo.xml.DomUtil.DOCUMENT_NODE: // document node... not sure if this would ever be meaningful
				break;
			case dojo.xml.DomUtil.DOCUMENT_TYPE_NODE: // document type node... not meaningful here
				break;
			case dojo.xml.DomUtil.DOCUMENT_FRAGMENT_NODE: // document fragment node... not meaningful here
				break;
			case dojo.xml.DomUtil.NOTATION_NODE:// notation node... not meaningful here
				break;
		}
	}
	return parsedNodeSet;
}

/* parses a set of attributes on a node into an object tree */
dojo.xml.ParseDocumentFragmentToJSObject.prototype.parseAttributes = function(node) {
	// TODO: make this namespace aware
	var parsedAttributeSet = {};
	for(var i=0; i<node.attributes.length; i++) {
		if(!parsedAttributeSet[node.attributes[i].nodeName]) {
			parsedAttributeSet[node.attributes[i].nodeName] = new Array();
		}
		parsedAttributeSet[node.attributes[i].nodeName][parsedAttributeSet[node.attributes[i].nodeName].length] = { value: node.attributes[i].nodeValue };
	}
	return parsedAttributeSet;
}
