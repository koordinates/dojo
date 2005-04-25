dojo.hostenv.startPackage("dojo.webui.widgets.ComboBox");

dojo.hostenv.loadModule("dojo.webui.DomWidget");

dojo.webui.widgets.ComboBox= function(){
	dojo.webui.Widget.call(this);

	this.widgetType = "ComboBox";
	this.isContainer = false;

	this.forceValidOption = false;
	this.searchType = "stringstart";

	this.startSearch = function(searchString){
	}

	this.openResultList = function(){
	}
}
dj_inherits(dojo.webui.widgets.ComboBox, dojo.webui.Widget);

dojo.webui.widgets.DomComboBox = function(){
	dojo.webui.widgets.ComboBox.call(this);
	dojo.webui.DomWidget.call(this, true);
}
dj_inherits(dojo.webui.widgets.DomComboBox, dojo.webui.widgets.ComboBox);

dojo.webui.widgets.tags["dojo:combobox"] = function(fragment, widgetParser){
	dojo.webui.widgets.buildWidgetFromParseTree("dojo:combobox", fragment, widgetParser);
}
