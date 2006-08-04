dojo.require("dojo.docs");
dojo.require("dojo.widget.DocPane");
dojo.require("dojo.event.*");

var docCount = 0;
var docKeys = [];

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

function docSearch(evt){
	dojo.debug("docSearch(" + dojo.widget.byId("search").textInputNode.value + ")");
	dojo.widget.byId("search").hideResultList();
	dojo.event.topic.publish("/docs/search", {selectKey: ++docCount, name: dojo.widget.byId("search").textInputNode.value});
}
