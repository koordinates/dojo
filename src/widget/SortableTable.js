dojo.provide("dojo.widget.SortableTable");
dojo.require("dojo.widget.DomWidget");

//	set up the general widget
dojo.widget.SortableTable=function(){
	dojo.widget.Widget.call(this);
	this.widgetType="SortableTable";
	this.isContainer=false;

	//	custom properties
	this.enableMultipleSelect=false;
	this.maximumNumberOfSelections=1;
	this.enableAlternateRows=false;
	this.minRows=0;	//	0 means ignore.
	this.defaultDateFormat="#M/#d/#yyyy";
	this.data=[];
	this.selected=null
	this.columns=[];
	this.sortIndex=0;		//	index of the column sorted on, first is the default.
	this.sortDirection=0;	//	0==asc, 1==desc
	this.sortFunctions={};	//	you can add to this if needed.
};
dojo.inherits(dojo.widget.SortableTable, dojo.widget.Widget);
dojo.widget.tags.addParseTreeHandler("dojo:sortableTable");
dojo.requireAfterIf("html", "dojo.widget.html.SortableTable");

dojo.lang.extend(dojo.widget.SortableTable, {
	getTypeFromString:function(s){
		var parts=s.split("."),i=0,obj=dj_global; 
		do{obj=obj[parts[i++]];}while(i<parts.length&&obj); 
		return(obj!=dj_global)?obj:null;
	},
	
	compare:function(o1, o2){
		//	we will compare property values, and only at the top level.
		for(var p in o1){
			if(!o2[p]) return false;
			if(o1[p]!=o2[p]) return false;
		}
		return true;
	},
	getSelection:function(){
		return this.selected;
	},
	parseData:function(data){
		//	this is for receiving raw JSON objects.  We expect an array
		//	of objects that have properties matching either the field of a
		//	column or the label on the column.  If we don't find that
		//	property, we set it to the type's default value.
		//	NB: you MUST render manually.
		this.data=[];
		for(var i=0; i<data.length; i++){
			var o={};	//	new data object.
			for(var j=0; j<this.columns.length; j++){
				var field=this.columns[j].getField();
				var type=this.columns[j].getType();
				var val=data[i][field];
				if (val) o[field]=new type(val);
				else o[field]=new type();	//	let it use the default.
			}
			this.data.push(o);
		}
	}
});
