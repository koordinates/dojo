dojo.require("dojo.data.*");

function data_binding_init() {
	var chartDiv = dojo.byId('putChartHere');
	var tableDiv = dojo.byId('putSortableTableHere');

	var dataProvider = new dojo.data.provider.FlatFile({url: "data_set_four.json"});	
	queryResultSet = dataProvider.fetchResultSet();
	
	var attributeMapping = {x: "X", 
	                        plots: [{plotType: "bar", y:"Y1"}, 
	                                {y: "Y2"}, 
	                                {plotType: "bubble", size:"Bubble Size", y:"Bubble Y"}]};
	var chartBinding = new ChartBindingHack(chartDiv, queryResultSet, attributeMapping);
	var tableBinding = new TableBindingHack(tableDiv, queryResultSet, ["X", "Y1", "Y2", "Bubble Size", "Bubble Y"]);
	
}

function subtractFromItemFive() {
	var item = queryResultSet.getItemAt(4);
	var oldValue = item.get("Y1");
	var newValue = oldValue - 15;
	item.set("Y1", newValue);
}