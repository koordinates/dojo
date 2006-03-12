dojo.provide("dojo.widget.html.DocComboBox");
dojo.require("dojo.widget.html.ComboBox");
dojo.require("dojo.doc");

dojo.widget.html.DocComboBox = function(){
	dojo.widget.html.ComboBox.call(this);

	this.widgetType = "DocComboBox";
	this.autoComplete = false;
}

dojo.inherits(dojo.widget.html.DocComboBox, dojo.widget.html.ComboBox);

dojo.lang.extend(dojo.widget.html.DocComboBox, {
	fillInTemplate: function() {
		dojo.widget.html.ComboBox.prototype.fillInTemplate.apply(this, arguments);
		this.dataProvider.startSearch = function(searchStr){
			this.searchType = "SUBSTRING";
			if(searchStr.indexOf("d") == 0 || searchStr.indexOf("do") == 0 || searchStr.indexOf("doj") == 0 || searchStr.indexOf("dojo") == 0 || searchStr.indexOf("dojo.") == 0){
				this.searchType = "STARTSTRING";
			}
			this._preformSearch(searchStr);
		}
		dojo.doc.functionNames(this.dataProvider.setData);
	}
});

dojo.widget.tags.addParseTreeHandler("dojo:doccombobox");