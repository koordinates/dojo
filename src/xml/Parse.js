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

dojo.xml.parseElement = function(node,parentJSObject) {
	// TODO: better name for parentJSObject, test for existence
	// something like if(typeof parentJSObject != "Object") parentJSObject = {};
	parentJSObject[node.tagName] = {}
	dojo.xml.parseAttributes(node,parentJSObject); // TODO: resolve call stack
}

/* parses a set of attributes on a node into an object tree */
dojo.xml.parseAttributes = function(node,parentJSObject) {
	for(var attr in node.attributes) {
			parentJSObject[node.attributes[attr].nodeName] = {}
			parentJSObject[node.attributes[attr].nodeName].value = node.attributes[attr].nodeValue; // TODO: is this a good way to store this into a "dumb" tree?
	}
}


