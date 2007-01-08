dojo.require("dojo.data.OpmlStore");
dojo.require("dojo.data.CsvStore");
dojo.require("dojo.data.YahooStore");
dojo.require("dojo.data.DeliciousStore");
dojo.require("dojo.lang.common");
dojo.require("dojo.lang.type");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.TreeV3");
dojo.require("dojo.widget.TreeNodeV3");
dojo.require("dojo.widget.TreeBasicControllerV3");
dojo.require("tests.data.bindings.HtmlTextarea");
dojo.require("tests.data.bindings.TreeV3");


gui = {
	_availableBindings: [
		{name: "HTML textarea",  bindingClass: tests.data.bindings.HtmlTextarea},
		{name: "HTML table",     bindingClass: tests.data.bindings.HtmlTable},
		{name: "FilteringTable", bindingClass: tests.data.bindings.FilteringTable},
		{name: "TreeV3",         bindingClass: tests.data.bindings.TreeV3}
	],
	
	_availableDatastores: {
		'none': {
			description: '-- none --',
			constructor: null
		},
		'geography.opml': {
			description: 'OPML store -- geography.opml',
			constructor: dojo.data.OpmlStore,
			constructorArg: {url:"geography.opml"},
			findKeywordArgs: null
		},
		'rss_feeds.opml': {
			description: 'OPML store -- rss_feeds.opml',
			constructor: dojo.data.OpmlStore,
			constructorArg: {url:"rss_feeds.opml"},
			findKeywordArgs: null
		},
		'books.csv': {
			description: 'CSV store -- books.csv',
			constructor: dojo.data.CsvStore,
			constructorArg: {queryUrl:"books.csv"},
			findKeywordArgs: null
		},
		'movies.csv': {
			description: 'CSV store -- movies.csv',
			constructor: dojo.data.CsvStore,
			constructorArg: {queryUrl:"movies.csv"},
			findKeywordArgs: null
		},
		'Yahoo creative commons': {
			description: 'Yahoo store -- "creative commons"',
			constructor: dojo.data.YahooStore,
			constructorArg: null,
			findKeywordArgs: {query: "creative commons", count: 5}
		},
		'Yahoo hobbit spock': {
			description: 'Yahoo store -- "hobbit spock"',
			constructor: dojo.data.YahooStore,
			constructorArg: null,
			findKeywordArgs: {query: "hobbit spock", count: 10}
		},
		'del.icio.us gumption': {
			description: 'del.icio.us store -- "gumption"',
			constructor: dojo.data.DeliciousStore,
			constructorArg: null,
			findKeywordArgs: {query: "gumption", count: 5}
		}
	},
	
	doInitialSetup: function() {
		gui._populateDatastoreSelectElement();
		gui._populateOutputCheckboxDiv();
	},
	
	_populateDatastoreSelectElement: function() {
		gui._selectElement = dojo.byId("datastore_select_element");
		gui._selectElement.onchange = gui._selectionHasChanged;
		var count = 0;
		for (var key in gui._availableDatastores) {
			var optionElement = document.createElement('option');
			optionElement.value = key;
			var description = gui._availableDatastores[key].description;
			var optionTextNode = document.createTextNode(description);
			optionElement.appendChild(optionTextNode);
			gui._selectElement.appendChild(optionElement);
			count += 1;
		}
		gui._selectElement.size = count;
	},
	
	_populateOutputCheckboxDiv: function() {
		gui._outputViews = [];
		gui._checkboxDiv = dojo.byId("output_checkbox_div");
		for (var i in gui._availableBindings) {
			var binding = gui._availableBindings[i];
			var bindingName = binding.name;
			var bindingClass = binding.bindingClass;
			var littleDiv = document.createElement('div');
			var checkbox = document.createElement('input');
			checkbox.type = "checkbox";
			checkbox.name = bindingName;
			checkbox.id = bindingName;
			checkbox.value = bindingName;
			checkbox.disabled = bindingClass ? false : true;
			if (i == 0) {
				checkbox.checked = true;
				binding.selected = true;
			}
			var setClickHander = function(checkbox, binding) {
				checkbox.onclick = function(e) {
					// alert("clicked on " + binding.name);
					binding.selected = !(binding.selected);
					gui._displayViews();
				};
			};
			setClickHander(checkbox, binding);
			var label = document.createElement('label');
			label['for'] = bindingName;
			var labelTextNode = document.createTextNode(bindingName);
			label.appendChild(labelTextNode);
			littleDiv.appendChild(checkbox);
			littleDiv.appendChild(label);
			gui._checkboxDiv.appendChild(littleDiv);
		}
	},
	
	_selectionHasChanged: function() {
		var optionElements = gui._selectElement.options;
		var selectedIndex = gui._selectElement.selectedIndex;
		var optionElement = optionElements[selectedIndex];
		var optionValue = optionElement.value;
		var datastoreTableEntry = gui._availableDatastores[optionValue];
		if (!datastoreTableEntry.datastoreInstance) {
			var constructor = datastoreTableEntry.constructor;
			if (constructor) {
				var constructorArg = datastoreTableEntry.constructorArg;
				datastoreTableEntry.datastoreInstance = new constructor(constructorArg);
			} else {
				datastoreTableEntry.datastoreInstance = null;
			}
		}
		gui._currentDatastore = datastoreTableEntry.datastoreInstance;
		var findArgs = datastoreTableEntry.findKeywordArgs || {};
		findArgs.saveResult = true;
		findArgs.sync = false;
		findArgs.oncompleted = gui._displayViews;
		gui._result = gui._currentDatastore.find(findArgs);
		// gui._displayViews(result);
	},
	
	_displayViews: function() {
		var result = gui._result;
		var outputDiv = dojo.byId("output_div");
		outputDiv.innerHTML = "";
		var selectedBindings = [];
		for (var i in gui._availableBindings) {
			var binding = gui._availableBindings[i];
			if (binding.selected) {
				selectedBindings.push(binding);
			}
		}
		for (i in selectedBindings) {
			binding = selectedBindings[i];
			var bindingClass = binding.bindingClass;
			var h3 = document.createElement('h3');
			var h3TextNode = document.createTextNode(binding.name);
			h3.appendChild(h3TextNode);			
			outputDiv.appendChild(h3);			
			var bindingInstance = new bindingClass(result, outputDiv);
		}
		
		
	}
	
};

function run_all_tests() {
	var store = new dojo.data.OpmlStore({url:"geography.opml"});
	var result = store.find();
	showResultViaTreeV3(result);
	showResultViaDojoDebug(result);
}

function showResultViaTreeV3(result) {
	// This doesn't quite work yet -- almost
	var controller = dojo.widget.createWidget("TreeBasicControllerV3");		
	var tree = dojo.widget.createWidget("TreeV3", {listeners:[controller.widgetId]});
	var treeDiv = dojo.byId("treeDiv");
	treeDiv.appendChild(tree.domNode);
	
	var rootTreeNode = dojo.widget.createWidget("TreeNodeV3", {title: result.store._opmlFileUrl, tree: tree.widgetId});
	tree.addChild(rootTreeNode);

	for (var i in result.items) {
		showItemAsTreeNode(result.store, result.items[i], tree, rootTreeNode);
	}
	controller.expandToLevel(tree, 1);
	// controller.expandAll(tree);
}

function showItemAsTreeNode(store, item, tree, parentTreeNode) {
	var itemName = store.getValue(item, 'text');
	var attributes = store.getAttributes(item);
	var description = '';
	for (var i in attributes) {
		var attribute = attributes[i];
		if (attribute != 'text' && attribute != 'children') {
			if (description) { 
				description += ', ';
			}
			description += attribute + ': "' + store.getValue(item, attribute) + '"';
		}
	}
	var treeNodeTitle = itemName;
	if (description) {
		treeNodeTitle += ' <font color="bbbbbb">{' + description + '}</font>'; 
	}
	var treeNode = dojo.widget.createWidget("TreeNodeV3", {title: treeNodeTitle, tree: tree.widgetId});
	parentTreeNode.addChild(treeNode);
	var children = store.getValues(item, 'children');
	for (var i in children) {
		var childItem = children[i];
		showItemAsTreeNode(store, childItem, tree, treeNode);
	}
}

function showResultViaDojoDebug(result) {
	dojo.debug(result.items.length + " items returned by store.find()");
	for (var i in result.items) {
		showItemViaDojoDebug(result.store, result.items[i]);
	}
}

function showItemViaDojoDebug(store, item, indentLevel) {
	indentLevel = indentLevel || 1;
	var indentString = "....";
	var totalIndentString = "";
	for (var i = 0; i < indentLevel; ++i) {
		totalIndentString += indentString;
	}
	if (store.hasAttribute(item, 'text')) {
		var attributes = store.getAttributes(item);
		var children = store.getValues(item, 'children');
		dojo.debug(totalIndentString + 'Item: ' + store.getValue(item, 'text') + 
			' (' + children.length + ' children)' +
			' (' + attributes.length + ' attributes)');
		for (i = 0; i < attributes.length; ++i) {
			var attributeName = attributes[i];
			var attributeValues = store.getValues(item, attributeName);
			if (attributeValues.length == 1 && !store.isItem(attributeValues[0])) {
				dojo.debug(totalIndentString + indentString + attributeName + ': "' + attributeValues[0] + '"');
			} else {
				dojo.debug(totalIndentString + indentString + attributeName + ': ');
				var nextIndentLevel = indentLevel + 1;
				for (var j = 0; j < attributeValues.length; ++j) {
					var child = attributeValues[j];
					showItemViaDojoDebug(store, child, nextIndentLevel)
				}
			}
		}
	}
	/*
	if (item.tagName == 'outline' && item.hasAttribute('text')) {
		dojo.debug(totalIndentString + 'Item: ' + item.getAttribute('text') +  ' (' + item.childNodes.length + ' children)');
		var attributes = item.attributes;
		for (var j = 0; j < attributes.length; ++j) {
			var attribute = attributes.item(j);
			var name = attribute.name;
			var nodeName = attribute.nodeName;
			var nodeValue = attribute.nodeValue;
			dojo.debug(totalIndentString + indentString + '{' + name + ' ' + nodeName + ': "' + nodeValue + '"}');
		}
		var children = item.childNodes;
		++indentLevel;
		for (var i = 0; i < children.length; ++i) {
			var node = children[i];
			showNode(node, indentLevel);
		}
	}
	*/
}








