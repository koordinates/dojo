dojo.provide("dojox.xml.parser");

//DOM type to int value for reference.
//Ints make for more compact code than full constant names.
//ELEMENT_NODE                  = 1;
//ATTRIBUTE_NODE                = 2;
//TEXT_NODE                     = 3;
//CDATA_SECTION_NODE            = 4;
//ENTITY_REFERENCE_NODE         = 5;
//ENTITY_NODE                   = 6;
//PROCESSING_INSTRUCTION_NODE   = 7;
//COMMENT_NODE                  = 8;
//DOCUMENT_NODE                 = 9;
//DOCUMENT_TYPE_NODE            = 10;
//DOCUMENT_FRAGMENT_NODE        = 11;
//NOTATION_NODE                 = 12;

dojox.xml.parser.parse = function(/*string?*/ str, /*string?*/ mimetype){
	//	summary:
	//		cross-browser implementation of creating an XML document object from null, empty string, and XML text..
	//
	//	str:
	//		Optional text to create the document from.  If not provided, an empty XML document will be created.  
	//		If str is empty string "", then a new empty document will be created.
	//	mimetype:
	//		Optional mimetype of the text.  Typically, this is text/xml.  Will be defaulted to text/xml if not provided.
	var _document = dojo.doc;
	var doc;

	if(!mimetype){ mimetype = "text/xml"; }
	if(str && dojo.trim(str) !== "" && (typeof dojo.global["DOMParser"]) !== "undefined"){
		//Handle parsing the text on Mozilla based browsers etc..
		var parser = new DOMParser();
		doc = parser.parseFromString(str, mimetype);
		var de = doc.documentElement;
		var errorNS = "http://www.mozilla.org/newlayout/xml/parsererror.xml";
		if(de.nodeName == "parsererror" && de.namespaceURI == errorNS){
			var sourceText = de.getElementsByTagNameNS(errorNS, 'sourcetext')[0];
			if(!sourceText){
				sourceText = sourceText.firstChild.data;
			}
        	throw new Error("Error parsing text " + nativeDoc.documentElement.firstChild.data + " \n" + sourceText);
		}
		return doc;

	}else if((typeof dojo.global["ActiveXObject"]) !== "undefined"){
		//Handle IE.
		var ms = function(n){ return "MSXML" + n + ".DOMDocument"; };
		var dp = ["Microsoft.XMLDOM", ms(6), ms(4), ms(3), ms(2)];
		dojo.some(dp, function(p){
			try{
				doc = new ActiveXObject(p);
			}catch(e){ return false; }
			return true;
		});
		if(str){
			if(doc){
				doc.async = false;
				doc.loadXML(str);
				var pe = doc.parseError;
				if(pe.errorCode !== 0){
					throw new Error("Line: " + pe.line + "\n" +
						"Col: " + pe.linepos + "\n" +
						"Reason: " + pe.reason + "\n" + 
						"Error Code: " + pe.errorCode + "\n" +
						"Source: " + pe.srcText);
				}
				return doc;	//	DOMDocument
			}
		}else{
			if(doc){
				return doc; //DOMDocument
			}
		}
	}else if((_document.implementation)&&
		(_document.implementation.createDocument)){
		if(str && dojo.trim(str) !== ""){
			if(_document.createElement){
				//Everyone else that we couldn't get to work.  Fallback case.
				// FIXME: this may change all tags to uppercase!
				var tmp = _document.createElement("xml");
				tmp.innerHTML = str;
				var xmlDoc = _document.implementation.createDocument("foo", "", null);
				for(var i = 0; i < tmp.childNodes.length; i++) {
					xmlDoc.importNode(tmp.childNodes.item(i), true);
				}
				return xmlDoc;	//	DOMDocument
			}
		}else{
			return _document.implementation.createDocument("", "", null); // DOMDocument
		}
	}
	return null;	//	DOMDocument
}

dojox.xml.parser.textContent = function(/*Node*/node, /*string?*/text){
	//	summary:
	//		Implementation of the DOM Level 3 attribute; scan node for text
	//	description:
	//		Implementation of the DOM Level 3 attribute; scan node for text
	//		This function can also update the text of a node by replacing all child 
	//		content of the node.
	//	node:
	//		The node to get the text off of or set the text on.
	//	text:
	//		Optional argument of the text to apply to the node.
	if(arguments.length>1){
		var _document = node.ownerDocument || dojo.doc;  //Preference is to get the node owning doc first or it may fail
		dojox.xml.parser.replaceChildren(node, _document.createTextNode(text));
		return text;	//	string
	} else {
		if(node.textContent !== undefined){ //FF 1.5
			return node.textContent;	//	string
		}
		var _result = "";
		if(node == null){
			return _result; //empty string.
		}
		for(var i = 0; i < node.childNodes.length; i++){
			switch(node.childNodes[i].nodeType){
				case 1: // ELEMENT_NODE
				case 5: // ENTITY_REFERENCE_NODE
					_result += dojox.xml.parser.textContent(node.childNodes[i]);
					break;
				case 3: // TEXT_NODE
				case 2: // ATTRIBUTE_NODE
				case 4: // CDATA_SECTION_NODE
					_result += node.childNodes[i].nodeValue;
					break;
				default:
					break;
			}
		}
		return _result;	//	string
	}
}

dojox.xml.parser.replaceChildren = function(/*Element*/node, /*Node || array*/ newChildren){
	//	summary:
	//		Removes all children of node and appends newChild. All the existing
	//		children will be destroyed.
	//	description:
	//		Removes all children of node and appends newChild. All the existing
	//		children will be destroyed.
	// 	node:
	//		The node to modify the children on
	//	newChildren:
	//		The children to add to the node.  It can either be a single Node or an
	//		array of Nodes.
	var nodes = [];
	var i;
	
	if(dojo.isIE){
		for(i=0;i<node.childNodes.length;i++){
			nodes.push(node.childNodes[i]);
		}
	}

	dojox.xml.parser.removeChildren(node);
	for(i=0;i<nodes.length;i++){
		dojo._destroyElement(nodes[i]);
	}

	if(!dojo.isArray(newChildren)){
		node.appendChild(newChildren);
	}else{
		for(i=0;i<newChildren.length;i++){
			node.appendChild(newChildren[i]);
		}
	}
}

dojox.xml.parser.removeChildren = function(/*Element*/node){
	//	summary:
	//		removes all children from node and returns the count of children removed.
	//		The children nodes are not destroyed. Be sure to call dojo._destroyElement on them
	//		after they are not used anymore.
	//	node:
	//		The node to remove all the children from.
	var count = node.childNodes.length;
	while(node.hasChildNodes()){
		node.removeChild(node.firstChild);
	}
	return count; // int
}


dojox.xml.parser.innerXML = function(/*Node*/node){
	//	summary:
	//		Implementation of MS's innerXML function.
	//	node:
	//		The node from which to generate the XML text representation.
	if(node.innerXML){
		return node.innerXML;	//	string
	}else if (node.xml){
		return node.xml;		//	string
	}else if(typeof XMLSerializer != "undefined"){
		return (new XMLSerializer()).serializeToString(node);	//	string
	}
	return null;
}

