dojo.provide("dojo.widget.FilteringTable");

dojo.require("dojo.date");
dojo.require("dojo.json");
dojo.require("dojo.data.SimpleStore");
dojo.require("dojo.html.*");
dojo.require("dojo.html.util");
dojo.require("dojo.html.style");
dojo.require("dojo.html.selection");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");

dojo.widget.defineWidget(
	"dojo.widget.FilteringTable", 
	dojo.widget.HtmlWidget, 
{
	initializer:function(){
		this.store=new dojo.data.SimpleStore();

		//declare per instance changeable widget properties
		this.valueField="Id";
		this.multiple=false;
		this.maxSelect=0;
		this.maxSortable=2;  // 2 columns at a time at most
		this.minRows=0;
		this.defaultDateFormat = "%D";
		this.isInitialized=false;

		this.columns=[];
		this.sortInformation=[{
			index:0,
			direction:0
		}];

		// CSS definitions
		this.headClass="";
		this.tbodyClass="";
		this.headerClass="";
		this.headerUpClass="selectedUp";
		this.headerDownClass="selectedDown";
		this.rowClass="";
		this.rowAlternateClass="alt";
		this.rowSelectedClass="selected";
		this.columnSelected="sorted-column";
	},

	//	dojo widget properties
	isContainer: false,
	templatePath: null,
	templateCssPath: null,

	//	methods.
	getTypeFromString: function(s){
		var parts = s.split("."), i = 0, obj = dj_global; 
		do{ 
			obj = obj[parts[i++]]; 
		} while (i < parts.length && obj); 
		return (obj != dj_global) ? obj : null;
	},

	//	custom data access.
	getByRow: function(/*HTMLTableRow*/row){
		return this.store.getByKey(dojo.html.getAttribute(row, "value")); 
	},
	getDataByRow: function(/*HTMLTableRow*/row){
		return this.store.getDataByKey(dojo.html.getAttribute(row, "value"));
	},

	getSelectedData: function(){
		//	summary
		//	returns all objects that are selected.
		var data=this.store.get();
		var a=[];
		for(var i=0; i<data.length; i++){
			if(data[i].isSelected){
				a.push(data[i].src);
			}
		}
		if(this.multiple){
			return a;		//	array
		} else {
			return a[0];	//	object
		}
	},
	
	isSelected: function(/* object */obj){
		var data = this.store.get();
		for(var i=0; i<data.length; i++){
			if(data[i].src == obj){
				return true;	//	boolean
			}
		}
		return false;	//	boolean
	},
	isValueSelected: function(/* string */val){
		var v = this.store.getByKey(val);
		if(v){
			return v.isSelected;
		}
		return false;
	},
	isIndexSelected: function(/* number */idx){
		var v = this.store.getByIndex(idx);
		if(v){
			return v.isSelected;
		}
		return false;
	},
	isRowSelected: function(/* HTMLTableRow */row){
		var v = this.getByRow(row);
		if(v){
			return v.isSelected;
		}
		return false;
	},

	reset: function(){
		this.store.clearData();
		this.columns = [];
		this.sortInformation = [ {index:0, direction:0} ];
		this.resetSelections();
		this.isInitialized = false;
		this.onReset();
	},
	resetSelections: function(){
		this.store.forEach(function(element){
			element.isSelected = false;
		});
	},
	onReset:function(){ },

	//	selection and toggle functions
	select: function(/*object*/ obj){
		var data = this.store.get();
		for(var i=0; i<data.length; i++){
			if(data[i].src == obj){
				data[i].isSelected = true;
				break;
			}
		}
		this.onDataSelect(obj);
	},
	selectByValue: function(/*string*/ val){
		this.select(this.getDataByKey(val));
	},
	selectByIndex: function(/*number*/ idx){
		this.select(this.getDataByIndex(idx));
	},
	selectByRow: function(/*HTMLTableRow*/ row){
		this.select(this.getDataByRow(row));
	},
	onDataSelect: function(/* object */obj){ },

	toggleSelection: function(/*object*/obj){
		var data = this.store.get();
		for(var i=0; i<data.length; i++){
			if(data[i].src == obj){
				data[i].isSelected = !data[i].isSelected;
				break;
			}
		}
		this.onDataToggle(obj);
	},
	toggleSelectionByValue: function(/*string*/val){
		this.toggleSelection(this.getDataByKey(val));
	},
	toggleSelectionByIndex: function(/*number*/idx){
		this.toggleSelection(this.getDataByIndex(idx));
	},
	toggleSelectionByRow: function(/*HTMLTableRow*/row){
		this.toggleSelection(this.getDataByRow(row));
	},
	onDataToggle: function(/* object */obj){ },

	//	parsing functions, from HTML to metadata/SimpleStore
	_meta:{
		field:null,
		format:null,
		filterer:null,
		noSort:false,
		sortType:"String",
		dataType:String,
		sortFunction:null,
		label:null,
		align:"left",
		valign:"middle",
		getField:function(){ 
			return this.field || this.label; 
		},
		getType:function(){ 
			return this.dataType; 
		}
	},
	createMetaData: function(/* object */obj){
		//	summary
		//	Take a JSON-type structure and make it into a ducktyped metadata object.
		for(var p in this._meta){
			//	rudimentary mixin
			if(!obj[p]){
				obj[p] = this._meta[p];
			}
		}
		if(!obj.label) obj.label=obj.field;
		return obj;	//	object
	},
	parseMetadata: function(/* HTMLTableHead */head){
		this.columns=[];
		this.sortInformation=[];
		var row = head.getElementsByTagName("tr")[0];
		var cells = row.getElementsByTagName("td");
		if (cells.length == 0){
			cells = row.getElementsByTagName("th");
		}
		for(var i=0; i<cells.length; i++){
			var o = this.createMetaData({ });
			
			//	presentation attributes
			if(dojo.html.hasAttribute(cells[i], "align")){
				o.align = dojo.html.getAttribute(cells[i],"align");
			}
			if(dojo.html.hasAttribute(cells[i], "valign")){
				o.valign = dojo.html.getAttribute(cells[i],"valign");
			}
			if(dojo.html.hasAttribute(cells[i], "nosort")){
				o.noSort = (dojo.html.getAttribute(cells[i],"nosort")=="true");
			}
			if(dojo.html.hasAttribute(cells[i], "sortusing")){
				var trans = dojo.html.getAttribute(cells[i],"sortusing");
				var f = this.getTypeFromString(trans);
				if (f != null && f != window && typeof(f)=="function"){
					o.sortFunction=f;
				}
			}
			if(dojo.html.hasAttribute(cells[i], "field")){
				o.field=dojo.html.getAttribute(cells[i],"field");
			} else {
				o.field="field"+i;
			}
			if(dojo.html.hasAttribute(cells[i], "format")){
				o.format=dojo.html.getAttribute(cells[i],"format");
			}
			if(dojo.html.hasAttribute(cells[i], "dataType")){
				var sortType = dojo.html.getAttribute(cells[i],"dataType");
				//	FIXME: switch this to let sorting happen based on dojo.html.renderedTextContent
				if(sortType.toLowerCase()=="html" || sortType.toLowerCase()=="markup"){
					o.sortType = "__markup__";	//	always convert to "__markup__"
					o.noSort = true;
				}else{
					var type = this.getTypeFromString(sortType);
					if(type){
						o.sortType = sortType;
						o.dataType = type;
					}
				}
			}
			o.label = dojo.html.renderedTextContent(cells[i]);

			//	TODO: set up filtering mechanisms here.
			
			this.columns.push(o);

			//	check to see if there's a default sort, and set the properties necessary
			if(dojo.html.hasAttribute(cells[i], "sort")){
				var info = {
					index:i,
					direction:0
				};
				var dir = dojo.html.getAttribute(cells[i], "sort");
				if(!isNaN(parseInt(dir))){
					dir = parseInt(dir);
					info.direction = (dir != 0) ? 1 : 0;
				}else{
					info.direction = (dir.toLowerCase() == "desc") ? 1 : 0;
				}
				this.sortInformation.push(info);
			}
		}
		if(this.sortInformation.length == 0){
			this.sortInformation.push({
				index:0,
				direction:0
			});
		} else if (this.sortInformation.length > this.maxSortable){
			this.sortInformation.length = this.maxSortable;
		}
	},
	parseData: function(/* HTMLTableBody */body){
		//	summary
		//	Parse HTML data into native JSON structure for the store.
		var rows = body.rows;
		if(rows.length == 0 && this.columns.length == 0) return;	//	there's no data, ignore me.

		//	create a data constructor based on what we've got for the fields.
		var self=this;
		var ctor=function(row){
			var obj = {};
			for(var i=0; i<self.columns.length; i++){
				var o = obj;
				var data = row.cells[i].innerHTML;
				var p = self.columns[i].getField();
				if(p.indexOf(".") > -1){
					p = p.split(".");
					while(p.length>1){
						var pr = p.shift();
						o[pr] = {};
						o = o[pr];
					}
					p = p[0];
				}

				if(self.columns[i].sortType=="__markup__") o[p] = String(data);
				else{
					var type = self.columns[i].getType();
					if(data){
						o[p] = new type(data);
					} else {
						o[p] = new type();
					}
				}
			}
			return obj;
		};

		//	we have initialization data, let's parse it.
		var arr=[];
		var selected=[];
		for(var i=0; i<rows.length; i++){
			var row = rows[i];
			var o = ctor(row);	// yay.  magic.  love.  sigh.
			o[this.valueField] = dojo.html.getAttribute(row,"value");
			if(dojo.html.getAttribute(row,"selected")=="true"){
				selected.push(o);
			}
			arr.push(o);
		}
		this.store.setData(arr);
		
		for(var i=0; i<selected.length; i++){
			this.select(selected[i]);
		}
		this.renderSelections();

		//	say that we are already initialized so that we don't kill anything
		this.isInitialized=true;
	},

	//	standard events
	onSelect: function(/* HTMLEvent */e){
		//	summary
		//	Handles the onclick event of any element.
		var row = dojo.html.getParentByType(e.target,"tr");
		var body = dojo.html.getParentByType(row,"tbody");
		if(this.multiple){
			if(e.shiftKey){
				var startRow;
				var rows=body.rows;
				for(var i=0;i<rows.length;i++){
					if(rows[i]==row){
						break;
					}
					if(this.isRowSelected(rows[i])){
						startRow=rows[i];
					}
				}
				if(!startRow){
					startRow = row;
					for(; i<rows.length; i++){
						if(this.isRowSelected(rows[i])){
							row = rows[i];
							break;
						}
					}
				}
				this.resetSelections();
				if(startRow == row){
					this.toggleSelectionByRow(row);
				} else {
					var doSelect = false;
					for(var i=0; i<rows.length; i++){
						if(rows[i] == startRow){
							doSelect=true;
						}
						if(doSelect){
							this.selectByRow(rows[i]);
						}
						if(rows[i] == row){
							doSelect = false;
						}
					}
				}
			} else {
				this.toggleSelectionByRow(row);
			}
		} else {
			this.resetSelections();
			this.toggleSelectionByRow(row);
		}
		this.renderSelections();
		e.stopPropagation();
		e.preventDefault();
	},
	onSort: function(/* HTMLEvent */e){
		var oldIndex=this.sortIndex;
		var oldDirection=this.sortDirection;
		
		var source=e.target;
		var row=dojo.html.getParentByType(source,"tr");
		var cellTag="td";
		if(row.getElementsByTagName(cellTag).length==0){
			cellTag="th";
		}

		var headers=row.getElementsByTagName(cellTag);
		var header=dojo.html.getParentByType(source,cellTag);
		
		for(var i=0; i<headers.length; i++){
			dojo.html.setClass(headers[i], this.headerClass);
			if(headers[i]==header){
				if(this.sortInformation[0].index != i){
					this.sortInformation=[
						{index:i,direction:0}, 
						this.sortInformation[0]
					];
				} else {
					this.sortInformation[0] = {
						index:i,
						direction:(~this.sortInformation[0].direction)&1
					};
				}
			}
		}
		for(var i=0; i<this.sortInformation.length; i++){
			var idx=this.sortInformation[i].index;
			var dir=(~this.sortInformation[i].direction)&1;
			dojo.html.setClass(headers[idx], dir==0?this.headerDownClass:this.headerUpClass);
		}
		this.render();
	},
	onFilter: function(/* HTMLEvent */e){
	},

	//	sorting functionality
	createSorter: function(/* array */info){
		//	summary
		//	creates a custom function to be used for sorting.
		//	FIXME: set this up so that it is NOT limited to two columns for sorting.
		var self=this;
		var pIndex=info[0].index;
		var pDirection=(info[0].direction==0)?1:-1;
		var sIndex=null, sDirection=0;
		if(info[1]){
			sIndex=info[1].index;
			sDirection=(info[1].direction==0)?1:-1;
		}

		/*	The resultant function should take 2 rows for comparison.
		 *	But we can't count on that with a custom sorter; so
		 *	what we'll have to do is create a master function that
		 *	takes in both rows, gets the corresponding objects from
		 *	that row, and then passes the sub-functions the correct
		 *	fields for comparison.
		 ************************************************************/
		var pField=this.columns[pIndex].getField();
		var sField=null;
		if(this.columns[pIndex].sortFunction){
			var psort=this.columns[pIndex].sortFunction;
		} else {
			var psort=function(a,b){
				if(a>b) return 1;
				if(a<b) return -1;
				return 0;
			};
		}

		var ssort=function(a,b){ return 0; };
		if(sIndex){
			if(this.columns[sIndex].sortFunction){
				ssort=this.columns[sIndex].sortFunction;
			} else {
				ssort=function(a,b){
					if(a>b) return 1;
					if(a<b) return -1;
					return 0;
				}
			}
		}
		
		return function(rowA, rowB){
			var a=self.getDataByRow(rowA);
			var b=self.getDataByRow(rowB);
			var pa=self.store.getField(a, pField);
			var pb=self.store.getField(b, pField);
			var ret=pDirection*psort(pa,pb);
			if(ret==0 && sField){
				var sa=self.store.getField(a, sField);
				var sb=self.store.getField(b, sField);
				ret=sDirection*ssort(sa, sb);
			}
			return ret;
		};	//	function
	},

	//	rendering
	createRow: function(/* object */obj){
		var row=document.createElement("tr");
		dojo.html.disableSelection(row);
		if(obj.key != null){
			row.setAttribute("value", obj.key);
		}
		for(var j=0; j<this.columns.length; j++){
			var cell=document.createElement("td");
			cell.setAttribute("align", this.columns[j].align);
			cell.setAttribute("valign", this.columns[j].valign);
			dojo.html.disableSelection(cell);
			var val = this.store.getField(obj.src, this.columns[j].getField());
			if(typeof(val)=="undefined"){
				val="";
			}
			if (this.columns[j].sortType=="__markup__"){
				cell.innerHTML=val;
			} else {
				if(this.columns[j].getType()==Date) {
					val=new Date(val);
					if(!isNaN(val)){
						var format = this.defaultDateFormat;
						if(this.columns[j].format){
							format = this.columns[j].format;
						}
						cell.appendChild(document.createTextNode(dojo.date.format(val, format)));
					} else {
						cell.appendChild(document.createTextNode(val));
					}
				} else if ("Number number int Integer float Float".indexOf(this.columns[j].getType())>-1){
					//	TODO: number formatting
					if(val.length == 0){
						val="0";
					}
					var n = parseFloat(val, 10) + "";
					//	TODO: numeric formatting + rounding :)
					if(n.indexOf(".")>-1){
						n = dojo.math.round(parseFloat(val,10),2);
					}
					cell.appendChild(document.createTextNode(n));
				}else{
					cell.appendChild(document.createTextNode(val));
				}
			}
			row.appendChild(cell);
		}
		return row;
	},
	prefill: function(){
		//	summary
		//	if there's no data in the table, then prefill it with this.minRows.
		this.isInitialized = false;
		var body = this.domNode.tBodies[0];
		while (body.childNodes.length > 0){
			body.removeChild(body.childNodes[0]);
		}
		
		if(this.minRows>0){
			for(var i=0; i < this.minRows; i++){
				var row = document.createElement("tr");
				if(this.alternateRows){
					dojo.html[((i % 2 == 1)?"addClass":"removeClass")](row, this.rowAlternateClass);
				}
				row.setAttribute("emptyRow","true");
				for(var j=0; j<this.columns.length; j++){
					var cell = document.createElement("td");
					cell.innerHTML = "&nbsp;";
					row.appendChild(cell);
				}
				body.appendChild(row);
			}
		}
	},
	init: function(){
		//	summary
		//	initializes the table of data
		this.isInitialized=false;

		//	if there is no thead, create it now.
		var head=this.domNode.getElementsByTagName("thead")[0];
		if(head.getElementsByTagName("tr").length == 0){
			//	render the column code.
			var row=document.createElement("tr");
			for(var i=0; i<this.columns.length; i++){
				var cell=document.createElement("td");
				cell.setAttribute("align", this.columns[i].align);
				cell.setAttribute("valign", this.columns[i].valign);
				dojo.html.disableSelection(cell);
				cell.innerHTML=this.columns[i].label;
				row.appendChild(cell);

				//	attach the events.
				if(!this.columns[i].noSort){
					dojo.event.connect(cell, "onclick", this, "onSort");
				}
			}
			dojo.html.prependChild(row, head);
		}
		
		if(this.store.get().length == 0){
			return false;
		}

		var idx=this.domNode.tBodies[0].rows.length;
		if(idx==0 || this.domNode.tBodies[0].rows[0].getAttribute("emptyrow")=="true"){
			idx = 0;
			var body = this.domNode.tBodies[0];
			while(body.childNodes.length>0){
				body.removeChild(body.childNodes[0]);
			}

			var data = this.store.get();
			for(var i=0; i<data.length; i++){
				var row = this.createRow(data[i]);
				body.appendChild(row);
				dojo.event.connect(row, "onclick", this, "onSelect");
				idx++;
			}
		}

		//	add empty rows
		if(this.minRows > 0 && idx < this.minRows){
			idx = this.minRows - idx;
			for(var i=0; i<idx; i++){
				row=document.createElement("tr");
				row.setAttribute("emptyRow","true");
				for(var j=0; j<this.columns.length; j++){
					cell=document.createElement("td");
					cell.innerHTML="&nbsp;";
					row.appendChild(cell);
				}
				body.appendChild(row);
			}
		}

		//	last but not least, show any columns that have sorting already on them.
		var row=this.domNode.getElementsByTagName("thead")[0].rows[0];
		var cellTag="td";
		if(row.getElementsByTagName(cellTag).length==0) cellTag="th";
		var headers=row.getElementsByTagName(cellTag);
		for(var i=0; i<headers.length; i++){
			dojo.html.setClass(headers[i], this.headerClass);
		}
		for(var i=0; i<this.sortInformation.length; i++){
			var idx=this.sortInformation[i].index;
			var dir=(~this.sortInformation[i].direction)&1;
			dojo.html.setClass(headers[idx], dir==0?this.headerDownClass:this.headerUpClass);
		}

		this.isInitialized=true;
		return this.isInitialized;
	},
	render: function(){
	/*	The method that should be called once underlying changes
	 *	are made, including sorting, filtering, data changes.
	 *	Rendering the selections themselves are a different method,
	 *	which render() will call as the last step.
	 ****************************************************************/
		if(!this.isInitialized){
			var b = this.init();
			if(!b){
				this.prefill();
				return;
			}
		}
		
		//	do the sort
		var rows=[];
		var body=this.domNode.tBodies[0];
		var emptyRowIdx=-1;
		for(var i=0; i<body.rows.length; i++){
			if(body.rows[i].getAttribute("emptyRow")){
				emptyRowIdx=i;
				break;
			}
			rows.push(body.rows[i]);
		}

		//	build the sorting function, and do the sorting.
		var sortFunction = this.createSorter(this.sortInformation);
		if(sortFunction){
			rows.sort(sortFunction);
		}
		if(emptyRowIdx>-1){
			for(var i=emptyRowIdx; i<body.rows.length; i++){
				rows.push(body.rows[i]);
			}
		}

		//	append the rows without killing them, this should help with the HTML problems.
		for(var i=0; i<rows.length; i++){
			if(this.alternateRows){
				dojo.html[((i%2==1)?"addClass":"removeClass")](rows[i], this.rowAlternateClass);
			}
			body.appendChild(rows[i]);
		}

		//	now re-render any selections.
		this.renderSelections();
	},
	renderSelections: function(){
		var body=this.domNode.tBodies[0];
		for(var i=0; i<body.rows.length; i++){
			dojo.html[(this.isRowSelected(body.rows[i])?"addClass":"removeClass")](body.rows[i], this.rowSelectedClass);
		}
	},
	renderFilter: function(){
	},

	//	widget lifetime handlers
	initialize: function(){ 
		var self=this;
		//	connect up binding listeners here.
		dojo.event.connect(this.store, "onSetData", function(){
			self.store.forEach(function(element){
				element.isSelected = false;
			});
			self.isInitialized=false;
			self.render();
		});
		dojo.event.connect(this.store, "onClearData", function(){
			self.render();
		});
		dojo.event.connect(this.store, "onAddData", function(addedObject){
			var row=self.createRow(addedObject);
			self.domNode.tBodies[0].appendChild(row);
			self.render();
		});
		dojo.event.connect(this.store, "onRemoveData", function(removedObject){
			var rows = self.domNode.tBodies[0].rows;
			for(var i=0; i<rows.length; i++){
				if(self.getDataByRow(rows[i]) == removedObject.src){
					rows[i].parentNode.removeChild(rows[i]);
					break;
				}
			}
			self.render();
		});
	},
//	fillInTemplate: function(args, frag){ },
	postCreate: function(){
		//	summary
		//	finish widget initialization.

		this.store.keyField = this.valueField;

		if(this.domNode){
			//	start by making sure domNode is a table element;
			if(this.domNode.nodeName.toLowerCase() != "table"){
			}

			//	see if there is columns set up already
			if(this.domNode.getElementsByTagName("thead")[0]){
				var head=this.domNode.getElementsByTagName("thead")[0];
				if(this.headClass.length > 0){
					head.className = this.headClass;
				}
				dojo.html.disableSelection(this.domNode);
				this.parseMetadata(head);

				var header="td";
				if(head.getElementsByTagName(header).length==0){
					header="th";
				}
				var headers = head.getElementsByTagName(header);
				for(var i=0; i<headers.length; i++){
					if(!this.columns[i].noSort){
						dojo.event.connect(headers[i], "onclick", this, "onSort");
					}
				}
			} else {
				this.domNode.appendChild(document.createElement("thead"));
			}

			// if the table doesn't have a tbody already, add one and grab a reference to it
			if (this.domNode.tBodies.length < 1) {
				var body = document.createElement("tbody");
				this.domNode.appendChild(body);
			} else {
				var body = this.domNode.tBodies[0];
			}

			if (this.tbodyClass.length > 0){
				body.className = this.tbodyClass;
			}
			this.parseData(body);
		}
	}
});
