dojo.require("dojo.data.*");
dojo.require("dojo.lang.type");
dojo.require("dojo.data.provider.Delicious");

function data_binding_init() {
	loadFirstTable();
	// loadSecondTable();
}

function loadFirstTable() {
	var tableDiv = dojo.byId('putFirstQueryTableHere');
	var dataProvider = new dojo.data.provider.Delicious();	
	queryResultSet = dataProvider.fetchResultSet("gumption");
	var tableBinding = new TableBindingHack(tableDiv, queryResultSet, ["u", "d", "t"]);	
}

function loadSecondTable() {
	var tableDiv = dojo.byId('putSecondQueryTableHere');
	var dataProvider = new dojo.data.provider.Delicious();	
	queryResultSet = dataProvider.fetchResultSet("ben");
	var tableBinding = new TableBindingHack(tableDiv, queryResultSet, ["u", "d", "t"]);	
}