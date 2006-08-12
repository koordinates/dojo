/*
ApplicationState is an object that represents the application state.
It will be given to dojo.undo.browser to represent the current application state.
*/
ApplicationState = function(stateData, outputDivId, backForwardOutputDivId, bookmarkValue){
	this.stateData = stateData;
	this.outputDivId = outputDivId;
	this.backForwardOutputDivId = backForwardOutputDivId;
	this.changeUrl = bookmarkValue;
}

ApplicationState.prototype.back = function(){
	this.showBackForwardMessage("BACK for State Data: " + this.stateData);
	this.showStateData();
}

ApplicationState.prototype.forward = function(){
	this.showBackForwardMessage("FORWARD for State Data: " + this.stateData);
	this.showStateData();
}

ApplicationState.prototype.showStateData = function(){
	dojo.byId(this.outputDivId).innerHTML += this.stateData + '<br />';
}

ApplicationState.prototype.showBackForwardMessage = function(message){
	dojo.byId(this.backForwardOutputDivId).innerHTML += message + '<br />';
}


/*
This method illustrates using dojo.io.bind() that also saves an application
state via dojo.undo.browser (dojo.io.bind() will automatically use dojo.undo.browser
if the dojo.io.bind() request object contains a back for forward function).
*/
function doApplicationStateBind(url, outputDivId, backForwardOutputDivId, bookmarkValue){
	dojo.io.bind({
		//Standard dojo.io.bind parameter
		url: url,

		//Standard dojo.io.bind parameter.
		//For this test, all of the bind requests are for text/xml documents.
		mimetype: "text/xml",
		
		//Standard dojo.io.bind parameter: if this is a value that evaluates
		//to true, then the page URL will change (by adding a fragment identifier
		//to the URL)
		changeUrl: bookmarkValue,

		//Data for use once we have data for an ApplicationState object
		outputDivId: outputDivId,
		backForwardOutputDivId: backForwardOutputDivId,
		
		//A holder for the application state object.
		//It will be created once we have a response from the bind request.
		appState: null,
		
		//Standard dojo.io.bind parameter. The ioRequest object is returned
		//to the load function as the fourth parameter. The ioRequest object
		//is the object we are creating and passing to this dojo.io.bind() call.
		load: function(type, evaldObj, xhrObject, ioRequest){
			var stateData = "dojo.io.bind() data: " + evaldObj.getElementsByTagName("data")[0].childNodes[0].nodeValue;
			ioRequest.appState = new ApplicationState(stateData, ioRequest.outputDivId, ioRequest.backForwardOutputDivId);
			ioRequest.appState.showStateData();
		},

		back: function(){
			ioRequest.appState.back();
		},
		
		forward: function(){
			ioRequest.appState.forward();
		}
	});
}
