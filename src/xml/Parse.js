if(!dojo) dojo = {}
if(!dojo.xml) dojo.xml = {}
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
dojo.???.foo.baz.xyzzy.value = "xyzzy"l

*/

 // TODO: resolve call stack for all of this within namespaced context

dojo.xml.parseElement = function(node,parentNodeSet) {
	parsedNodeSet = {};
	if(!parentNodeSet) {
		parsedNodeSet[node.tagName] = {}
	}
	dojo.xml.parseAttributes(node,parsedNodeSet);
	for(var childNode in node.childNodes) {
		if(nodes.childNodes[childNodes].nodeType == 1) {
			parsedNodeSet[node.tagName] = dojo.xml.parentElement(node,parsedNodeSet);
		}
	}
	return parsedNodeSet;
}

/* parses a set of attributes on a node into an object tree */
dojo.xml.parseAttributes = function(node,parsedNodeSet) {
	for(var attr in node.attributes) {
		parsedNodeSet[node.attributes[attr].nodeName] = {}
		parsedNodeSet[node.attributes[attr].nodeName].value = node.attributes[attr].nodeValue; // TODO: is this a good way to store this into a "dumb" tree?
	}
}
