dojo.provide("dojo.widget.FilteringTable");

dojo.require("dojo.date");
dojo.require("dojo.data.SimpleStore");
dojo.require("dojo.html.*");
dojo.require("dojo.html.util");
dojo.require("dojo.html.style");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");

dojo.widget.defineWidget(
	"dojo.widget.FilteringTable", 
	dojo.widget.HtmlWidget, 
{
	initializer:function(){
		this.store=new dojo.data.SimpleStore();
		this.store.keyField = this.valueField;
		this.columns=[];
		this.sortInformation=[{
			index:0,
			direction:0
		}];

		//	connect up binding listeners here.
		dojo.event.connect(this.store, "onSetData", this, function(){
			this.store.forEach(function(element){
				element.isSelected = false;
			});
			this.render();
		});
		dojo.event.connect(this.store, "onClearData", this, function(){
			this.render();
		});
		dojo.event.connect(this.store, "onAddData", this, function(addedObject){
		});
		dojo.event.connect(this.store, "onRemoveData", this, function(removedObject){
		});
	},

	//	widget properties
	multiple: false,
	maxSelected: 0,
	maxSortable: 2,	//	2 columns at a time at most.
	alternateRows: false,
	minRows: 0,
	defaultDateFormat: "%D",
	isInitialized: false,
	valueField: "Id",

	// CSS definitions
	headClass: "",
	tbodyClass: "",
	headerClass: "",
	headerUpClass: "selectedUp",
	headerDownClass: "selectedDown",
	rowClass: "",
	rowAlternateClass: "alt",
	rowSelectedClass: "selected",
	columnSelected: "sorted-column",

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
		return this.store.getByValue(dojo.html.getAttribute(row, "value")); 
	},
	getDataByRow: function(/*HTMLTableRow*/row){
		return this.store.getDataByValue(dojo.html.getAttribute(row, "value"));
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
	},
	resetSelections: function(){
	},

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
		this.select(this.getDataByValue(val));
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
		this.toggleSelection(this.getDataByValue(val));
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
		var rows=body.rows;
		if(rows.length==0) return;	//	there's no data, ignore me.

		//	create a data constructor based on what we've got for the fields.
		var ctor=function(row){
			var obj = {};
			for(var i=0; i<this.columns.length; i++){
				var o = obj;
				var data = row.cells[i].innerHTML;
				var p = this.columns[i].getField();
				if(p.indexOf(".") > -1){
					p = p.split(".");
					while(p.length>1){
						var pr = p.shift();
						o[pr] = {};
						o = o[pr];
					}
					p = p[0];
				}

				if(this.columns[j].sortType=="__markup__") o[p] = String(data);
				else{
					var type = this.columns[j].getType();
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
		for(var i=0; i<rows.length; i++){
			var row = rows[i];
			var o = ctor(row);	// yay.  magic.  love.  sigh.
			o[this.valueField] = dojo.html.getAttribute(row,"value");
			this.store.addData(o);
			if(dojo.html.getAttribute(row,"selected")=="true"){
				this.select(o);
			}
		}
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
			var pa=self.getProperty(a, pField);
			var pb=self.getProperty(b, pField);
			var ret=pDirection*psort(pa,pb);
			if(ret==0 && sField){
				var sa=self.getProperty(a, sField);
				var sb=self.getProperty(b, sField);
				ret=sDirection*ssort(sa, sb);
			}
			return ret;
		};	//	function
	},

	//	rendering
	prefill: function(){
	},
	init: function(){
	},
	render: function(){
	},
	renderSelections: function(){
	},
	renderFilter: function(){
	},

	//	widget lifetime handlers
//	initialize: function(){ },
//	fillInTemplate: function(args, frag){ },
	postCreate: function(){
	}
});
