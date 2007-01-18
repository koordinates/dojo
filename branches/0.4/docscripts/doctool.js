dojo.require("dojo.docs");
dojo.require("dojo.widget.DocPane");
dojo.require("dojo.event.*");

var docCount = 0;
var docKeys = [];

dojo.addOnLoad(function(){
	var search = dojo.widget.byId("search");
	search.downArrowNode.style.visibility = "hidden";
	var provider = search.dataProvider;
	dojo.docs.functionNames().addCallback(function(/*Object*/ data){
		var search = dojo.widget.byId("search").dataProvider;
		var rePrivate = /\._[^.]+$/;
		var output = [];
		for(var pkg in data){
			if(!dojo.lang.inArray(data[pkg], pkg)){
				var fPkg = dojo.docs.unFormat(pkg);
				output.push([fPkg, fPkg]);
			}
			for(var i = 0, row; row = data[pkg][i]; i++){
				var fRow = dojo.docs.unFormat(row);
				if(!rePrivate.test(row)){
					output.push([fRow, fRow]);
				}
			}
		}

		output.sort(function(a, b){
			if(a[0] < b[0]){
				return -1;
			}
			if(a[0] > b[0]){
				return 1;
			}
		  return 0;
		});

		search.setData.call(search, output);
	});

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
	dojo.event.connect(search, "selectOption", function(evt){
		dojo.debug("docSearch(" + dojo.widget.byId("search").textInputNode.value + ")");
		dojo.widget.byId("search").hideResultList();
		dojo.event.topic.publish("/docs/search", {selectKey: ++docCount, name: dojo.widget.byId("search").textInputNode.value});
	});
});