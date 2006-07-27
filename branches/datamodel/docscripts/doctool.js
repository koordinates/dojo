dojo.require("dojo.docs");
dojo.require("dojo.widget.DocPane");
dojo.require("dojo.event.*");

var docCount = 0;
var docKeys = [];

//dojo.docs.getMeta(++docCount, _result, "dojo.animation.Animation.play");
//docKeys[docCount] = "meta";
//dojo.docs.getSrc(++docCount, _result, "dojo.animation.Animation");
//docKeys[docCount] = "src";
//dojo.docs.getDoc(++docCount, _result, "dojo.animation.Animation.play");
//docKeys[docCount] = "doc";
//dojo.event.topic.publish("docSelectFunction", {selectKey: ++docCount, name: "dojo.animation.Animation.play"});
//dojo.event.topic.subscribe("docFunctionDetail", _docResult);

function docInit(){
	var search = dojo.widget.byId("search");
	search.downArrowNode.style.visibility = "hidden";
	var provider = search.dataProvider;
	dojo.docs.functionNames(++docCount, docSetData);
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
	dojo.event.connect(search, "selectOption", docSearch);
}
dojo.addOnLoad(docInit);

function docSetData(/*String*/ type, /*Array*/ data, /*Object*/ evt){
	var search = dojo.widget.byId("search").dataProvider;
	var rePrivate = /\._[^.]+$/;
	var output = [];
	for(var i = 0, row; row = data[i]; i++){
		if(!rePrivate.test(row[0])){
			output.push(row);
		}
	}
	search.setData.call(search, output);
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
	dojo.debug("docSearch(" + dojo.widget.byId("search").getValue() + ")");
	dojo.widget.byId("search").hideResultList();
	dojo.event.topic.publish("/docs/search", {selectKey: ++docCount, name: dojo.widget.byId("search").getValue()});
}

function docResults(/*Object*/ input){
	dojo.debug(dojo.json.serialize(input));
}

//dojo.event.topic.subscribe("docResults", docResults);
