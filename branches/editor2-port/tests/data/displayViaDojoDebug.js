dojo.provide("tests.data.displayViaDojoDebug");
dojo.require("dojo.data.core.Read");

tests.data.displayViaDojoDebug = function(datastore, query, kwArgs) {
	var displayItem = function(item, result) {
		var string = '{';
		var attributes = datastore.getAttributes(item);
		for (var i = 0; i < attributes.length; ++i) {
			var attribute = attributes[i];
			var value = datastore.getValue(item, attribute);
			if (i > 0) {
				string += ',\n ';
			}
			string += attribute + " : " + dojo.json.serialize(value);
		}
		string += '}';
		dojo.debug(string);
		return true;
	};
	dojo.debug("");
	dojo.debug("store contents...");
	kwArgs = kwArgs || {};
	if (!"sync" in kwArgs) {
		kwArgs.sync = true;
	}
	kwArgs.query = query;
	kwArgs.onnext = displayItem;
	datastore.find(kwArgs); // var result = datastore.find(kwArgs);
}
