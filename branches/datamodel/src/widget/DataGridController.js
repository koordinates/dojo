dojo.provide("dojo.widget.DataGridController");

dojo.widget.defineWidget("dojo.widget.DataGridController",dojo.widget.HtmlWidget,{
/*summary:
	Controls the connection between a DataGrid widget and its data.
	- Responds to events from the grid in order to provide the grid with its data.
	- Controllers will be created declaratively and programmatically.  It is necessary
      for an application to find it's controllers by unique id (the widget id assigned 
      to it when declarative)
*/
	initializer: function(){},
	load: function(provider){
		this.data = provider;
	},
	addColumn: function(){dojo.unimplemented("dojo.widget.DataGridController.addColumn");},
	getColumnCount: function(){dojo.unimplemented("dojo.widget.DataGridController.getColumnCount");},
	getColumnType: function(column) {dojo.unimplemented("dojo.widget.DataGridController.getColumnType");},
	getRowCount: function(){dojo.unimplemented("dojo.widget.DataGridController.getRowCount");},
	getValue: function(row, column){dojo.unimplemented("dojo.widget.DataGridController.getValue");},
	setValue: function(row, column, value){dojo.unimplemented("dojo.widget.DataGridController.setValue");},
	isColumnEditable: function(column){
		dojo.unimplemented("dojo.widget.DataGridController.isColumnEditable");
		return false;
	},
	bind: function(object, objectProp, data, dataProp, event) {dojo.unimplemented("dojo.widget.DataGridController.bind");}
});
