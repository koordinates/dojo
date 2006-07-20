dojo.provide("dojo.data.xml.DataGridXMLController");
dojo.require("dojo.widget.DataGridController");
dojo.require("dojo.data.xml.XMLPropertyBinder");

dojo.widget.defineWidget("dojo.widget.DataGridXMLController",dojo.widget.DataGridController,{
/* summary:
	Controls data flow between a DataGrid widget and an XML data provider
	- Responds to events on the widget and model to act accordingly.
	TODO: should have a reference to the grid widget, and a reference to the data
	TODO: initializer should connect events from widget to onEvent handlers on this class
	TODO: initializer should connect events from data to onEvent handlers on this class
	TODO: logic to delete the controller when the datagrid is deleted (this is more general,
		and should be part of abstract Controller.
*/
	initializer: function() {
		this.columnData = [];
		this.columnNames = [];
		this.columnDefs = [];
	},
	
	addColumn: function(column) {
		var rowArray = [];
		var values = this.data.getValues(column.bindTo);
		for (var i in values) {
			rowArray.push(values[i]);
		}
		this.columnNames.push(column.name);
		this.columnData.push(rowArray);
		this.columnDefs.push(column);
	},
	
	getColumnCount: function() {
		return this.columnData.length;
	},
	
	getRowCount: function() {
		return this.columnData[0].length;
	},
	
	getColumnName: function(column) {
		return this.columnNames[column];
	},
	
	//Queries the provider for the value of row,column
	getValue: function(row, column) {
		//TODO:  We should only need to recalculate the value when it's dirty
		//this.columnData[column][row] = this.data[row].getValue(this.columnDefs[column].bindTo);
		return this.columnData[column][row];
	},
	
	setValue: function(row, column, value) {
		this.columnData[column][row]  = value;
		var bindTo = this.columnDefs[column].bindTo;
		this.data[row].setValue(bindTo, value);
	},
	
	isEditable: function(column) {
		return Boolean(this.columnDefs[column].editable);
	},
	
	isSortable: function(column) {
		return Boolean(this.columnDefs[column].sortable);
	},
	
	bind: function(row, column, data, dataProp, event) {
		if (event){	//This binds the control's event to the data model
			return new dojo.data.xml.XMLPropertyBinder(this.data, this.columnDefs[column].bindTo + "|" + row, data, dataProp, event);
		}
		//This binds the data model to the control
		return new dojo.data.xml.XMLPropertyBinder(this.data, this.columnDefs[column].bindTo + "|" + row, data, dataProp);
	},
	
	sortByColumnIndex: function(columnIndex, direction) { //TODO:  Make UP/DOWN a constant
		this.data.sortData(this.columnDefs[columnIndex].bindTo, direction);
	}
	
});