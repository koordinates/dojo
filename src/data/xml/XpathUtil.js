dojo.provide("dojo.data.xml.XpathUtil");
dojo.require("dojo.event.*");

dojo.data.xml.XpathUtil = new function() {

	/*
	 * A cross-plaform implementation of selectNodes.  selectNodes performs an xpath query on the given Node.
	 * If the xpath query results in a nodeset, then a list of nodes matching the query is returned. 
	 * If the xpath query results in a single value (number, string, or boolean), then that value is returned.
	 *
	 */
	this.selectNodes = function(dom, xpathExp) {
		//dojo.debug("selectNodes:  " + dom + "," + xpathExp);
		var errors = [];
		try {
			try {
				var xpath = new XPathEvaluator();		//This is for mozzila
			} catch (e) {								//An exception occurs on both IE and Opera
				errors.push(e);
				var xpath = dom;	//Opera doesn't have an XPathEvaluator
				
				//Opera requires that the xpath node be the document object and not just the context node
				if (dom.nodeType != 9){
					xpath = dom.ownerDocument;
				}
			}
			var xpathresult = xpath.evaluate(xpathExp, dom, null, XPathResult.ANY_TYPE, null);		//This will fail on IE
			//dojo.debug(xpathresult.resultType);
			switch(xpathresult.resultType) {
				case XPathResult.NUMBER_TYPE:
					return xpathresult.numberValue;
				case XPathResult.STRING_TYPE:
					return xpathresult.stringValue;
				case XPathResult.BOOLEAN_TYPE:
					return xpathresult.booleanValue;
			}
			
			var nodeset = [];
			if (xpathresult != null) {
				var element = xpathresult.iterateNext();
				while(element) {
					nodeset.push(element);
					element = xpathresult.iterateNext();
				}
			}
		//	dojo.debug(xpathExp + " returns " + nodeset.length);
			return nodeset;
			
		} catch (e) {	//failover to IE
			errors.push(e);

			try {
				var toReturn =  dom.selectNodes(xpathExp);
				
				//convert node list into an array
				if (toReturn.length) {
					var list = [];
					for (var i = 0; i < toReturn.length; i++) {
						list.push(toReturn[i]);
					}
					return list;
				}

					return toReturn;
			} catch (e2) {
			
				//Might be something wrong with the XPath query.  Display all the accumulated errors so the user will have an idea of what went wrong.
				errors.push(e2);
				for (var i in errors) {
					dojo.debug(i + ":  " + errors[i]);
				}
				return null;
			}
		}
	};
	
	/*
	 * Set the value of the text or attribute node at the given path with the given value.
	 * If the parent of the text or attribute doesn't exist, it will be created.
	 */
	this.setValue = function(dom, context, path, value) {
		//The path can be in the form of <xpath>|<index>, such as /nodes/value|2, which means the second node in that path
		path = path.split("|");
		var xpath = path[0];
		var index = 0;
		if (path.length > 1){
			index = path[1];
		}
		var rootNode = null;
		if (context != null) {
			rootNode = this.selectNodes(dom, context)[0];
		} else {
			rootNode = dom;
		}
		
		var paths = this.parseXpath(xpath);
		var pathToCreate = paths.pop();
		var root = this.makePaths(dom, context, this.pathsToString(paths));	//make sure all the parents have been created
		
		if (dojo.lang.isArray(root)){
			root = root[index];
		}
		if (pathToCreate.type == "Text") {
			if (root.childNodes.length > 0){
				root.childNodes[0].text = value;
			}else{
				root.appendChild(dom.createTextNode(value));
			}
		} else if (pathToCreate.type == "Attribute") {
			var oldValue = root.getAttribute(pathToCreate.path.substring(1));
			root.setAttribute(pathToCreate.path.substring(1), value);	//remember to take off the @
			//If the value already existed and has changed
			if (oldValue != null && oldValue != value) {
				dojo.event.topic.publish("xml/valueChanged", {id: root.getAttributeNode(pathToCreate.path.substring(1))} );
			}
		} else {
			return false;
		}
		return true;
	};
	
	/*
	 * This will create elements at the given xpath
	 */
	this.makePaths = function(dom, context, xpath) {
		var rootNode = null;
		
		if (context != null) {
			rootNode = this.selectNodes(dom, context)[0];
		} else {
			rootNode = dom;
		}
		
		//this prevents an infinite loop that was occuring when xpath was ""
		if (xpath == "" || xpath == null){
			return rootNode;
		}
		var result = this.selectNodes(rootNode, xpath);

		if (!result || result.length < 1) {
			var paths = this.parseXpath(xpath);
			var path = paths.pop();
			var parent = this.makePaths(dom, context, this.pathsToString(paths));
			//IE is picky about the node being created by the XML's document object.  FF doesn't care.
			var node = dom.createElement(path.path);
			parent.appendChild(node);
			return node;
		} else {
			return result;
		}
	};
	
	/*
	 * This is a very primitive tokenizer for an xpath expression.  It creates a list out of the different sections of the path.
	 * Each path is a tuple of path, type, where the type can be Element, Attribute, or Text.
	 *
	 * TODO:  it'd be nice to have a full-fledged xpath parser
	 * 
	 * Example:
	 * this/is/a/@test results in
	 * [{path: "this", type: "Element"},{path: "is", type: "Element"},{path: "a", type: "Element"},{path: "test", type: "Attribute"}]
	 */
	this.parseXpath = function(path) {
		var paths = path.split("/");
		var result = [];
		for (var i in paths) {
			if (paths[i].charAt(0) == '@') {
				result.push( {  
					type: "Attribute",
					path: paths[i]
				});
			} else if (paths[i] == "text()") {
				result.push( {  
					type: "Text",
					path: paths[i]
				});
			} else if (paths[i] != "") {
				result.push( {  
					type: "Element",
					path: paths[i]
				});
			}
		}
		return result;
	};
	
	/*
	 * Turns a parsed xpath expression back into the original xpath string
	 */
	this.pathsToString = function(paths) {
		result = "";
		for (var i in paths) {
			result += "/" + paths[i].path;
		}
		return result;
	};
};