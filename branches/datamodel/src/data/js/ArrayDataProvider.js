dojo.provide("dojo.data.js.ArrayDataProvider");
dojo.require("dojo.io.*");
dojo.require("dojo.data.js.DataGridArrayController");
dojo.require("dojo.data.DataProvider");

//TODO:  If a user tries to update a dynamic attribute, we should send an error

dojo.data.js.ArrayDataProvider = function(){

	dojo.data.IDataProvider.call(this);
};

dojo.inherits(dojo.data.js.ArrayDataProvider, dojo.data.IDataProvider);

dojo.lang.extend(dojo.data.js.ArrayDataProvider, {

});

dojo.data.js.ArrayDataProvider.prototype.init = function(keywordParameters, bindings) {

	var url = keywordParameters.location;
	var _tmpJsonData = null;

	//Do a syncronous bind
	//TODO:  It'd be nice to be able to support asyncronous bind, but this would require differernt interaction between the provider and the control
	//Perhaps we should also support lazy initialization--The data won't be loaded until the first request for the data
	var bindArgs = {
		url:        url,
		mimetype:   "text/json",
		sync:		true,
		error:      function(type, errObj){
			//TODO:  handle error here
			dojo.debug('couldn\'t bind to ' + url);
		},
		load:      function(type, data, evt) {
			_tmpJsonData = data;
		}
	};
	
	// dispatch the request
    var requestObj = dojo.io.bind(bindArgs);
	this.jsonData = _tmpJsonData.data
};

dojo.data.js.ArrayDataProvider.prototype.fetchArray = function(query) {
	return this.jsonData;
};

dojo.data.js.ArrayDataProvider.prototype.getTableAdapter = function() {

	return new dojo.data.js.DataGridArrayController();
}
