dojo.require("dojo.widget.html.ComboBox");
dojo.require("dojo.doc");
dojo.require("dojo.widget.DocPane");

var docCount = 0;
var docKeys = [];

//dojo.doc.getMeta(++docCount, _result, "dojo.animation.Animation.play");
//docKeys[docCount] = "meta";
//dojo.doc.getSrc(++docCount, _result, "dojo.animation.Animation");
//docKeys[docCount] = "src";
//dojo.doc.getDoc(++docCount, _result, "dojo.animation.Animation.play");
//docKeys[docCount] = "doc";
//dojo.event.topic.publish("docSelectFunction", {selectKey: ++docCount, name: "dojo.animation.Animation.play"});
//dojo.event.topic.subscribe("docFunctionDetail", _docResult);

function docInit(){
	var search = dojo.widget.byId("search");
	search.downArrowNode.style.visibility = "hidden";
	var provider = search.dataProvider;
	dojo.doc.functionNames(++docCount, docSetData);
	provider.startSearch = function(searchStr){
		var searchLength = searchStr.length;
		var searchType = "SUBSTRING";
		if("dojo.".match(new RegExp("^" + searchStr)) || searchStr.match(new RegExp("^dojo\."))){
			var searchType = "STARTSTRING";
			searchLength -= 4;
		}
		var search = dojo.widget.byId("search");
		search.downArrowNode.style.visibility = "hidden";
		if(searchLength > 2) {
			search.downArrowNode.style.visibility = "visible";
		}
		this._preformSearch(searchStr, searchType);
	}
	dojo.event.connect(dojo.byId("logIn"), "onclick", logIn);
	dojo.event.connect(search, "selectOption", docSearch);
}
dojo.addOnLoad(docInit);

function logIn(){
	dojo.doc.setUserName(dojo.byId("userName").value);
	dojo.doc.setPassword(dojo.byId("password").value);
}

function docSetData(/*String*/ type, /*Array*/ data, /*Object*/ evt){
	var search = dojo.widget.byId("search").dataProvider;
	search.setData.call(search, data);
}

function _result(/*String*/ type, /*mixed*/ data, /*Object*/ evt){
	if(docKeys[evt.selectKey] == "meta"){
		dojo.debug(type + " meta: " + dojo.json.serialize(data));
	}else if(docKeys[evt.selectKey] == "src"){
		dojo.debug(type + " src: " + data);
	}else if(docKeys[evt.selectKey] == "doc"){
		dojo.debug(type + " doc: " + dojo.json.serialize(data));
	}
	delete docKeys[evt.selectKey];
}

function _docResult(){
	dojo.debug(dojo.json.serialize(arguments));
}

function docSearch(evt){
	dojo.widget.byId("search").hideResultList();
	dojo.event.topic.publish("/doc/search", {selectKey: ++docCount, name: dojo.widget.byId("search").textInputNode.value});
}

function docResults(/*Object*/ input){
	dojo.debug(dojo.json.serialize(input));
}

//dojo.event.topic.subscribe("docResults", docResults);
