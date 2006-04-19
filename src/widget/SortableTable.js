dojo.provide("dojo.widget.SortableTable");
dojo.require("dojo.widget.*");
dojo.requireIf("html", "dojo.widget.html.SortableTable");
dojo.widget.tags.addParseTreeHandler("dojo:sortableTable");

//	set up the general widget
dojo.widget.SortableTable=function(){
	//	summary
	//	base class for the SortableTable
	dojo.widget.Widget.call(this);
	this.widgetType="SortableTable";
	this.isContainer=false;

	//	custom properties
	this.enableMultipleSelect=false;
	this.maximumNumberOfSelections=0;	//	0 for unlimited, is the default.
	this.enableAlternateRows=false;
	this.minRows=0;	//	0 means ignore.
	this.defaultDateFormat="%D";
	this.data=[];
	this.selected=[];		//	always an array to handle multiple selections.
	this.columns=[];
	this.sortIndex=0;		//	index of the column sorted on, first is the default.
	this.sortDirection=0;	//	0==asc, 1==desc
	this.valueField="Id";	//	if a JSON structure is parsed and there is a field of this name,
							//	a value attribute will be added to the row (tr value="{Id}")
};
dojo.inherits(dojo.widget.SortableTable, dojo.widget.Widget);
