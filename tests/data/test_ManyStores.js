dojo.require("dojo.data.OpmlStore");
dojo.require("dojo.data.CsvStore");
dojo.require("dojo.data.YahooStore");
dojo.require("dojo.data.DeliciousStore");
dojo.require("dojo.data.JsonItemStore");
dojo.require("dojo.lang.common");
dojo.require("dojo.lang.type");
dojo.require("dojo.io.*");
dojo.require("tests.data.bindings.FilteringTable");
dojo.require("tests.data.bindings.TreeV3");
dojo.require("tests.data.bindings.HtmlTextarea");

gui = {
	_availableBindings: [
		{name: "FilteringTable", bindingClass: tests.data.bindings.FilteringTable},
		{name: "TreeV3",         bindingClass: tests.data.bindings.TreeV3},
		{name: "HTML textarea",  bindingClass: tests.data.bindings.HtmlTextarea},
		{name: "HTML table",     bindingClass: tests.data.bindings.HtmlTable}
	],
	
	_availableDatastores: {
		'none': {
			description: '-- none --',
			constructor: null
		},
		'books.csv': {
			description: 'CSV store -- books.csv',
			constructor: dojo.data.CsvStore,
			constructorArg: {queryUrl:"books.csv"},
			findKeywordArgs: null,
			nameAttribute: 'Title'
		},
		'movies.csv': {
			description: 'CSV store -- movies.csv',
			constructor: dojo.data.CsvStore,
			constructorArg: {queryUrl:"movies.csv"},
			findKeywordArgs: null,
			nameAttribute: 'Title'
		},
		'Yahoo creative commons': {
			description: 'Yahoo store -- "creative commons"',
			constructor: dojo.data.YahooStore,
			constructorArg: null,
			findKeywordArgs: {query: "creative commons", count: 4},
			nameAttribute: 'Title'
		},
		'Yahoo hobbit spock': {
			description: 'Yahoo store -- "hobbit spock"',
			constructor: dojo.data.YahooStore,
			constructorArg: null,
			findKeywordArgs: {query: "hobbit spock", count: 8},
			nameAttribute: 'Title'
		},
		'del.icio.us gumption': {
			description: 'del.icio.us store -- "gumption"',
			constructor: dojo.data.DeliciousStore,
			constructorArg: null,
			findKeywordArgs: {query: "gumption", count: 5},
			nameAttribute: 'Description'
		},
		'geography.opml': {
			description: 'OPML store -- geography.opml',
			constructor: dojo.data.OpmlStore,
			constructorArg: {url:"geography.opml"},
			findKeywordArgs: null,
			nameAttribute: 'text'
		},
		'rss_feeds.opml': {
			description: 'OPML store -- rss_feeds.opml',
			constructor: dojo.data.OpmlStore,
			constructorArg: {url:"rss_feeds.opml"},
			findKeywordArgs: null,
			nameAttribute: 'text'
		},
		'muppets.json': {
			description: 'Item store -- muppets.json',
			constructor: dojo.data.JsonItemStore,
			constructorArg: {url:"muppets.json"},
			findKeywordArgs: null,
			nameAttribute: 'name'
		},
		'countries.json': {
			description: 'Item store -- countries.json',
			constructor: dojo.data.JsonItemStore,
			constructorArg: {url:"countries.json"},
			findKeywordArgs: null,
			nameAttribute: 'name'
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
		var datastoreInfo = gui._availableDatastores[optionValue];
		if (!datastoreInfo.datastoreInstance) {
			var constructor = datastoreInfo.constructor;
			if (constructor) {
				var constructorArg = datastoreInfo.constructorArg;
				datastoreInfo.datastoreInstance = new constructor(constructorArg);
			} else {
				datastoreInfo.datastoreInstance = null;
			}
		}
		gui._datastoreInfo = datastoreInfo;
		if (datastoreInfo.datastoreInstance) {
			var findArgs = datastoreInfo.findKeywordArgs || {};
			findArgs.saveResult = true;
			findArgs.sync = false;
			findArgs.oncompleted = gui._displayViews;
			gui._result = datastoreInfo.datastoreInstance.find(findArgs);
		} else {
			gui._result = null;
			gui._displayViews();
		}
	},
	
	_displayViews: function(result) {
		// var result = gui._result;
		gui._result = result;
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
			var bindingInstance = new bindingClass(result, outputDiv, gui._datastoreInfo);
		}
	}
};

