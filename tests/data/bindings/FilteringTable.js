dojo.provide("tests.data.bindings.FilteringTable");
dojo.require("dojo.data.core.Read");

dojo.declare("tests.data.bindings.FilteringTable", null,
	function(result, outerDiv) {
 		var table = document.createElement('table');
		var filteringTable = dojo.widget.createWidget("dojo:FilteringTable", {valueField: "Identity"}, table);
		outerDiv.appendChild(table);
		this._table = filteringTable;
		this._dataInSimpleStoreFormat = [];
		this._columnsInFilteringTableFormat = null;
		this.displayItems(result);
	}, {
	
	displayItems: function(result) {
		if (!result) {
			return;
		}
		var items = result.items;
		for (var i = 0; i < items.length; ++i) {
			this.addRow(result.store, items[i]);
		}
		for (var i in this._columnsInFilteringTableFormat) {
			var column = this._columnsInFilteringTableFormat[i];
			this._table.columns.push(this._table.createMetaData(column));
		}
		this._table.store.setData(this._dataInSimpleStoreFormat);
	},

	addRow: function(store, item) {
		var object = {};
		var attributes = store.getAttributes(item);
		object["Identity"] = item;
		for (var i = 0; i < attributes.length; ++i) {
			var attribute = attributes[i];
			var value = store.getValue(item, attribute);
			object[attribute] = value;
		}
		this._dataInSimpleStoreFormat.push(object);
		if (!this._columnsInFilteringTableFormat) {
			this._columnsInFilteringTableFormat = [];
			for (i = 0; i < attributes.length; ++i) {
				var attribute = attributes[i];
				this._columnsInFilteringTableFormat.push({field: attribute});
			}
		}
	},
});

