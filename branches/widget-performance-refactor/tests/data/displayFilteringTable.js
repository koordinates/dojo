dojo.provide("tests.data.displayFilteringTable");
dojo.require("dojo.data.core.Read");
dojo.require("dojo.widget.FilteringTable");

tests.data.displayFilteringTable = function(datastore, query, tableElement) {
	var dataInSimpleStoreFormat = [];
	var columnsInFilteringTableFormat = null;
	var addRow = function(item, result) {
		var object = {};
		var attributes = datastore.getAttributes(item);
		object["Identity"] = item;
		for (var i = 0; i < attributes.length; ++i) {
			var attribute = attributes[i];
			var value = datastore.getValue(item, attribute);
			object[attribute] = value;
		}
		dataInSimpleStoreFormat.push(object);
		if (!columnsInFilteringTableFormat) {
			columnsInFilteringTableFormat = [];
			for (i = 0; i < attributes.length; ++i) {
				var attribute = attributes[i];
				columnsInFilteringTableFormat.push({field: attribute});
			}
		}
	};

	var result = datastore.find({query:query, sync:true, onnext:addRow});
	
	var filteringTable = dojo.widget.createWidget("dojo:FilteringTable", {valueField:"Identity"}, tableElement);

	for (i = 0; i < columnsInFilteringTableFormat.length; ++i) {
		var column = columnsInFilteringTableFormat[i];
		filteringTable.columns.push(filteringTable.createMetaData(column));
	}

	filteringTable.store.setData(dataInSimpleStoreFormat);
}
