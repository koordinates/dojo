if(!dojo){ dojo = {}; }
if(!dojo.xml){ 
	dojo.xml = {};
}

// for loading script:
dojo.xml.Parse = {};

//TODO: determine dependencies

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
dojo.xml.ParseDocumentFragmentToJSObject = function(documentFragment) {
	var parsedFragment = {};
	for (var childNode in documentFragment.childNodes) {
		switch(documentFragment.childNodes[childNode].nodeType) {
			case 1: // element nodes, call this function recursively
 				parsedFragment[documentFragment.tagName] = this.parseElement(documentFragment.childNodes[childNode],parsedNodeSet);
				break;
			case 3: // if a single text node is the child, treat it as an attribute
				if(node.childNodes.length == 1) {
					parsedFragment[documentFragment.tagName] = {};
					parsedFragment[documentFragment.tagName].value = documentFragment.childNodes[0].nodeValue;
				}
				break;
		}
	}
	
	return parsedFragment;
}

dojo.xml.ParseDocumentFragmentToJSObject.prototype.parseElement = function(node,parentNodeSet){
	// TODO: make this namespace aware
	var parsedNodeSet = {};
	if(!parentNodeSet){
		parsedNodeSet[node.tagName] = {};
	}
	this.parseAttributes(node,parsedNodeSet);
	for(var childNode in node.childNodes){
		switch(node.childNodes[childNode].nodeType){
			case 1: // element nodes, call this function recursively
 				parsedNodeSet[node.tagName] = dojo.xml.parseElement(node,parsedNodeSet);
				break;
			case 2: // attribute node... not meaningful here
				break;
			case 3: // if a single text node is the child, treat it as an attribute
				if(node.childNodes.length == 1) {
					parsedNodeSet[node.tagName] = {};
					parsedNodeSet[node.tagName].value = node.childNodes[0].nodeValue;
				}
				break;
			case 4: // cdata section... not sure if this would ever be meaningful... might be...
				break;
			case 5: // entity reference node... not meaningful here
				break;
			case 6: // entity node... not sure if this would ever be meaningful
				break;
			case 7: // processing instruction node... not meaningful here
				break;
			case 8: // comment node... not not sure if this would ever be meaningful 
				break;
			case 9: // document node... not sure if this would ever be meaningful
				break;
			case 10: // document type node... not meaningful here
				break;
			case 11: // document fragment node... not meaningful here
				break;
			case 12:// notation node... not meaningful here
				break;
		}
	}
	return parsedNodeSet;
}

/* parses a set of attributes on a node into an object tree */
dojo.xml.ParseDocumentFragmentToJSObject.prototype.parseAttributes = function(node, parsedNodeSet){
	// TODO: make this namespace aware
	for(var attr in node.attributes){
		parsedNodeSet[node.attributes[attr].nodeName] = {};
		// TODO: is this a good way to store this into a "dumb" tree?  any
		// scope issues with this... this should probably be better scoped.
		parsedNodeSet[node.attributes[attr].nodeName].value = node.attributes[attr].nodeValue; 
	}
}
