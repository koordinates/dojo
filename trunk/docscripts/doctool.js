djConfig.isDebug = true;

dojo.require("dojo.widget.ComboBox");
dojo.require("dojo.doc");

function docToolInit(){
	dojo.widget.byId("search").dataProvider.startSearch = function(searchStr){
		this.searchType = "SUBSTRING";
		if(searchStr.indexOf("d") == 0 || searchStr.indexOf("do") == 0 || searchStr.indexOf("doj") == 0 || searchStr.indexOf("dojo") == 0 || searchStr.indexOf("dojo.") == 0){
			this.searchType = "STARTSTRING";
		}
		this._preformSearch(searchStr);
	}

	dojo.widget.byId("search").dataProvider.setData(dojo.doc.functionNames());
}

dojo.addOnLoad(docToolInit);