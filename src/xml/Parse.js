if(!dojo){ dojo = {}; }
if(!dojo.xml){ 
	dojo.xml = {};
}

// for loading script:
dojo.xml.Parse = {};

//TODO: determine dependencies
// currently has dependency on dojo.xml.DomUtil nodeTypes constants...

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
dojo.xml.Parse.ParseDocumentFragment = function(){}
//	this.domUtil = new dojo.xml.DomUtil();

dojo.xml.Parse.ParseDocumentFragment.prototype.parseFragment = function(documentFragment) {
	// handle parent element
	var parsedFragment = {};
	// TODO: What if document fragment is just text... need to check for nodeType perhaps?
	parsedFragment[documentFragment.tagName] = new Array(documentFragment.tagName);
	var attributeSet = this.parseAttributes(documentFragment);
	for(var attr in attributeSet){
		if(!parsedFragment[attr]){
			parsedFragment[attr] = [];
		}
		parsedFragment[attr][parsedFragment[attr].length] = attributeSet[attr];
	}

	for (var childNode in documentFragment.childNodes){
		switch(documentFragment.childNodes[childNode].nodeType){
			case  dojo.xml.domUtil.nodeTypes.ELEMENT_NODE: // element nodes, call this function recursively
				parsedFragment[documentFragment.tagName].push(this.parseElement(documentFragment.childNodes[childNode]));
				break;
			case  dojo.xml.domUtil.nodeTypes.TEXT_NODE: // if a single text node is the child, treat it as an attribute
				if(documentFragment.childNodes.length == 1){
					if(!parsedFragment[documentFragment.tagName]){
						parsedFragment[documentFragment.tagName] = [];
					}
					parsedFragment[documentFragment.tagName].push({ value: documentFragment.childNodes[0].nodeValue });
				}
				break;
		}
	}
	
	return parsedFragment;
}

dojo.xml.Parse.ParseDocumentFragment.prototype.parseElement = function(node,hasParentNodeSet){
	// TODO: make this namespace aware
	var parsedNodeSet = {};
	parsedNodeSet[node.tagName] = [];
	var attributeSet = this.parseAttributes(node);
	for(var attr in attributeSet){
		if(!parsedNodeSet[node.tagName][attr]){
			parsedNodeSet[node.tagName][attr] = [];
		}
		parsedNodeSet[node.tagName][attr].push(attributeSet[attr]);
	}

	// FIXME: we might want to make this optional or provide cloning instead of
	// referencing, but for now, we include a node reference to allow
	// instantiated components to figure out their "roots"
	parsedNodeSet[node.tagName].nodeRef = node;
	parsedNodeSet.tagName = dojo.hostenv.getTagName(node);

	var domUtil = new dojo.xml.DomUtil();
	var ntypes = domUtil.nodeTypes;

	for(var i=0; i<node.childNodes.length; i++){
		switch(node.childNodes[i].nodeType){
			case  ntypes.ELEMENT_NODE: // element nodes, call this function recursively
 				parsedNodeSet[node.tagName].push(this.parseElement(node.childNodes[i],true));
				break;
			case  ntypes.ATTRIBUTE_NODE: // attribute node... not meaningful here
				break;
			case  ntypes.TEXT_NODE: // if a single text node is the child, treat it as an attribute
				if(node.childNodes.length == 1) {
					parsedNodeSet[node.tagName].push({ value: node.childNodes[0].nodeValue });
				}
				break;
			case  ntypes.CDATA_SECTION_NODE: // cdata section... not sure if this would ever be meaningful... might be...
				break;
			case  ntypes.ENTITY_REFERENCE_NODE: // entity reference node... not meaningful here
				break;
			case  ntypes.ENTITY_NODE: // entity node... not sure if this would ever be meaningful
				break;
			case  ntypes.PROCESSING_INSTRUCTION_NODE: // processing instruction node... not meaningful here
				break;
			case  ntypes.COMMENT_NODE: // comment node... not not sure if this would ever be meaningful 
				break;
			case  ntypes.DOCUMENT_NODE: // document node... not sure if this would ever be meaningful
				break;
			case  ntypes.DOCUMENT_TYPE_NODE: // document type node... not meaningful here
				break;
			case  ntypes.DOCUMENT_FRAGMENT_NODE: // document fragment node... not meaningful here
				break;
			case  ntypes.NOTATION_NODE:// notation node... not meaningful here
				break;
		}
	}
	//return (hasParentNodeSet) ? parsedNodeSet[node.tagName] : parsedNodeSet;
	return parsedNodeSet;
}

/* parses a set of attributes on a node into an object tree */
dojo.xml.Parse.ParseDocumentFragment.prototype.parseAttributes = function(node) {
	// TODO: make this namespace aware
	var parsedAttributeSet = {};
	// TODO: should we allow for duplicate attributes at this point... would any of the relevant dom implementations even allow this?
	/*for(var i=0; i<node.attributes.length; i++) {
		if(!parsedAttributeSet[node.attributes[i].nodeName]) {
			parsedAttributeSet[node.attributes[i].nodeName] = new Array();
		}
		parsedAttributeSet[node.attributes[i].nodeName][parsedAttributeSet[node.attributes[i].nodeName].length] = { value: node.attributes[i].nodeValue };
	}*/
	
	for(var i=0; i<node.attributes.length; i++) {
		parsedAttributeSet[node.attributes[i].nodeName] = { value: node.attributes[i].nodeValue };
	}
	return parsedAttributeSet;
}
