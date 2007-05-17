dojo.provide("tests.data.bindings.HtmlTextarea");
dojo.require("dojo.data.core.Read");

dojo.declare("tests.data.bindings.HtmlTextarea", null,
	function(result, outerDiv) {
		var textarea = document.createElement('textarea');
		textarea.rows = "10";
		textarea.cols = "100";
		outerDiv.appendChild(textarea);
		this._textarea = textarea;
		this.displayItems(result);
	}, {
	
	printline: function(string) {
		string = string || ''; // make the 'string' parameter optional, to allow for this.printline()
		var textarea = this._textarea;
		textarea.value += string + '\n';
	},
	
	displayItems: function(result) {
		if (!result) {
			this.printline();
			return;
		}
		var items = result.items;
		this.printline("number of items: " + items.length);
		this.printline();
		for (var i = 0; i < items.length; ++i) {
			var item = items[i];
			this.displayItem(item, result);
		}
	},
	
	displayItem: function(item, result) {
		var datastore = result.store;
		var string = '{';
		var attributes = datastore.getAttributes(item);
		for (var i = 0; i < attributes.length; ++i) {
			var attribute = attributes[i];
			var value = datastore.getValue(item, attribute);
			if (i > 0) {
				string += ',\n ';
			}
			var valueAsString = "";
			if (datastore.isItem(value)) {
				valueAsString += "<<item reference>>"
			} else {
				valueAsString += value;
			}
			string += attribute + ": " + valueAsString;
		}
		string += '}';
		this.printline(string);
		// return true;
	}
	// var result = datastore.find({query:query, sync:true, onnext:displayItem}); //sync
});

