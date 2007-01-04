dojo.provide("tests.data.displayFilteringTable");
dojo.require("dojo.data.core.Read");
dojo.require("dojo.widget.FilteringTable");
dojo.require("dojo.collections.Store");

tests.data.displayFilteringTable = function(datastore, query, tableElement, kwArgs) {
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

	var displayTable = function(result) {
		var filteringTable = dojo.widget.createWidget("dojo:FilteringTable", {valueField: "Identity"}, tableElement);
		for (var i in columnsInFilteringTableFormat) {
			var column = columnsInFilteringTableFormat[i];
			filteringTable.columns.push(filteringTable.createMetaData(column));
		}
		filteringTable.store.setData(dataInSimpleStoreFormat);
	};

	kwArgs = kwArgs || {};
	if (!"sync" in kwArgs) {
		kwArgs.sync = true;
	}
	kwArgs.query = query;
	kwArgs.onnext = addRow;
	kwArgs.oncompleted = displayTable;
	datastore.find(kwArgs); // var result = datastore.find(kwArgs);
}
