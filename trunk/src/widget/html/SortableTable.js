dojo.provide("dojo.widget.html.SortableTable");

dojo.require("dojo.lang");
dojo.require("dojo.date");
dojo.require("dojo.html");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.SortableTable");

//	set up the general widget
dojo.widget.html.SortableTable=function(){
	dojo.widget.SortableTable.call(this);
	dojo.widget.HtmlWidget.call(this);

	this.headerClass="";
	this.headerSortUpClass="selected";
	this.headerSortDownClass="selected";
	this.rowClass="";
	this.rowAlternateClass="alt";
	this.rowSelectedClass="selected";
};
dojo.inherits(dojo.widget.html.SortableTable, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.SortableTable, {
	templatePath:null,
	templateCssPath:null,

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
	}, 

	//	widget-specific methods
	getObjectFromRow:function(row){
		var cells=row.getElementsByTagName("td");
		var o={};
		for(var i=0; i<this.columns.length;i++){
			var text=dojo.html.renderedTextContent(cells[i]);
			var val=new (this.columns[i].getType())(text);	//	cast it.
			o[this.columns[i].getField()]=val;
		}
		return o;
	},
	setSelectionByRow:function(row){
		this.selected=this.getObjectFromRow(row);
		var body=dojo.html.getParentByType(row,"tbody");
		if(body){
			var rows=body.getElementsByTagName("tr");
			for(var i=0; i<rows.length; i++){
				if(rows[i].className==this.rowSelectedClass){
					if(this.enableAlternateRows&&i%2==1){
						rows[i].className=this.rowAlternateClass;
					}else rows[i].className="";
				}
			}
			row.className=this.rowSelectedClass;
		}
	},

	parseColumns:function(node){
		//	we expect a thead element here.
		this.columns=[];	//	reset it.
		var row=node.getElementsByTagName("tr")[0];
		var cells=row.getElementsByTagName("td");
		if (cells.length==0) cells=row.getElementsByTagName("th");
		for(var i=0; i<cells.length; i++){
			var o={
				field:null,
				format:null,
				sortType:"String",
				dataType:String,
				label:null,
				getField:function(){ return this.field||this.label; },
				getType:function(){ return this.dataType; }
			};
			if(dojo.html.hasAttribute(cells[i], "field")){
				o.field=dojo.html.getAttribute(cells[i],"field");
			}
			if(dojo.html.hasAttribute(cells[i], "format")){
				o.format=dojo.html.getAttribute(cells[i],"format");
			}
			if(dojo.html.hasAttribute(cells[i], "dataType")){
				var sortType=dojo.html.getAttribute(cells[i],"dataType");
				var type=this.getTypeFromString(sortType);
				if(type){
					o.sortType=sortType;
					o.dataType=type;
				}
			}
			o.label=dojo.html.renderedTextContent(cells[i]);
			this.columns.push(o);
		}
	},

	parseDataFromTable:function(tbody){
		this.data=[];
		var rows=tbody.getElementsByTagName("tr");
		for(var i=0; i<rows.length; i++){
			var o={};	//	new data object.
			var cells=rows[i].getElementsByTagName("td");
			for(var j=0; j<this.columns.length; j++){
				var field=this.columns[j].getField();
				var type=this.columns[j].getType();
				var val=dojo.html.renderedTextContent(cells[j]); //	should be the same index as the column.
				if (val) o[field]=new type(val);
				else o[field]=new type();	//	let it use the default.
			}
			this.data.push(o);
		}
	},
	
	render:function(){
		var data=[];
		var body=this.domNode.getElementsByTagName("tbody")[0];
		for(var i=0; i<this.data.length; i++){
			data.push(this.data[i]);
		}
		var col=this.columns[this.sortIndex];
		var field=col.getField();
		if (this.sortFunctions[col.sortType]) 
			var sort=this.sortFunctions[col.sortType];
		else{
			var sort=function(a,b){
				if (a[field]>b[field]) return 1;
				if (a[field]<b[field]) return -1;
				return 0;
			}
		}
		data.sort(sort);
		if(this.sortDirection!=0) data.reverse();

		//	build the table and pop it in.
		//	IE doesn't like using innerHTML, so we're stuck with the DOM.
		//	a little slower, but works just the same :)
		while(body.childNodes.length>0) body.removeChild(body.childNodes[0]);
		for(var i=0; i<data.length;i++){
			var row=document.createElement("tr");
			if(this.selected&&this.compare(this.selected,data[i])){
				row.className=this.rowSelectedClass;
			} else {
				if(this.enableAlternateRows&&i%2==1){
					row.className=this.rowAlternateClass;
				}
			}
			for(var j=0;j<this.columns.length;j++){
				var cell=document.createElement("td");
				if(this.columns[j].getType()==Date){
					var format=this.defaultDateFormat;
					if(this.columns[j].format) format=this.columns[j].format;
					cell.appendChild(document.createTextNode(dojo.date.toString(data[i][this.columns[j].getField()], format)));
				}else{
					cell.appendChild(document.createTextNode(data[i][this.columns[j].getField()]));
				}
				row.appendChild(cell);
			}
			body.appendChild(row);
			dojo.event.connect(row, "onclick", this, "onUISelect");
		}
		
		//	if minRows exist.
		var minRows=parseInt(this.minRows);
		if (!isNaN(minRows) && minRows>0 && data.length<minRows){
			var mod=0;
			if(data.length%2==0) mod=1;
			var nRows=minRows-data.length;
			for(var i=0; i<nRows; i++){
				var row=document.createElement("tr");
				if(this.enableAlternateRows&&i%2==mod){
					row.className=this.rowAlternateClass;
				}
				for(var j=0;j<this.columns.length;j++){
					var cell=document.createElement("td");
					cell.appendChild(document.createTextNode("\u00A0"));
					row.appendChild(cell);
				}
				body.appendChild(row);
			}
		}
	},

	//	the following the user can override.
	onSelect:function(e){ },
	onUISelect:function(e){
		var row=dojo.html.getParentByType(e.target,"tr");
		this.setSelectionByRow(row);
		this.onSelect(e);
	},
	onHeaderClick:function(e){
		var oldIndex=this.sortIndex;
		var oldDirection=this.sortDirection;
		var source=e.target;
		var row=dojo.html.getParentByType(source,"tr");
		var cellTag="td";
		if(row.getElementsByTagName(cellTag).length==0) cellTag="th";

		var headers=row.getElementsByTagName(cellTag);
		var header=dojo.html.getParentByType(source,cellTag);
		
		for(var i=0; i<headers.length; i++){
			if(headers[i]==header){
				if(i!=oldIndex){
					//	new col.
					this.sortIndex=i;
					this.sortDirection=0;
					headers[i].className=this.headerSortDownClass
				}else{
					this.sortDirection=(oldDirection==0)?1:0;
					if(this.sortDirection==0){
						headers[i].className=this.headerSortDownClass;
					}else{
						headers[i].className=this.headerSortUpClass;
					}
				}
			}else{
				//	reset the header class.
				headers[i].className=this.headerClass;
			}
		}
		this.render();
	},

	//	overridden from HtmlWidget.
	postCreate:function(){ 
		// connect event handlers to the object first.
		var thead=this.domNode.getElementsByTagName("thead")[0];

		//	parse the columns.
		this.parseColumns(thead);

		//	attach header handlers.
		var header="td";
		if(thead.getElementsByTagName(header).length==0) header="th";
		var headers=thead.getElementsByTagName(header);
		for(var i=0; i<headers.length; i++){
			dojo.event.connect(headers[i], "onclick", this, "onHeaderClick");
		}

		//	parse the tbody element and re-render it.
		var tbody=this.domNode.getElementsByTagName("tbody")[0];
		this.parseDataFromTable(tbody);
		this.render();
	}
});
