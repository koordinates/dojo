dojo.provide("dojo.data.js.DataGridArrayController");
dojo.require("dojo.widget.DataGridController");
dojo.require("dojo.data.js.ArrayPropertyBinder");

dojo.widget.defineWidget("dojo.widget.DataGridArrayController",dojo.widget.DataGridController,{
/* summary:
	Controls data flow between a DataGrid widget and an Array data provider
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
	
	addColumn: function(column){
		this.columnNames.push(column.name);
		this.columnDefs.push(column);
		this.data.propertyBinders = [];	//needs to go in a constructor
	},
	
	getColumnCount: function(){
		return this.data.length;
	},
	
	getRowCount: function(){
		return this.data[0].length;
	},
	
	getColumnName: function(column){
		return this.columnNames[column];
	},
	
	//Queries the provider for the value of row,column
	getValue: function(row, column){
		return this.data[row][column];
	},
	
	setValue: function(row, column, value){
		this.data[row][column] = value;
		for (var i = 0; i < this.data.propertyBinders.length; i++) {
			this.data.propertyBinders[i].fireValueChanged(row + "_" + column, value);
		}
	},
	
	isEditable: function(column){
		return Boolean(this.columnDefs[column].editable);
	},
	
	isSortable: function(column){
		return Boolean(this.columnDefs[column].sortable);
	},
	
	bind: function(row, column, data, dataProp, event){
		return new dojo.data.js.ArrayPropertyBinder(this.data, (row + "_" + column), data, dataProp, event);
	}
});