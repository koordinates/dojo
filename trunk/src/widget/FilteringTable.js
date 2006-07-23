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
		});
		dojo.event.connect(this.store, "onAddData", this, function(addedObject){
		});
		dojo.event.connect(this.store, "onRemoveData", this, function(removedObject){
		});
	},

	//	widget properties
	multiple: false,
	maxSelected: 0,
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
	},
	isValueSelected: function(/* string */val){
	},
	isIndexSelected: function(/* number */idx){
	},
	isRowSelected: function(/* HTMLTableRow */row){
	},

	reset: function(){
	},
	resetSelections: function(){
	},

	//	selection and toggle functions
	select: function(/*object*/ obj){
	},
	selectByValue: function(/*string*/ val){
	},
	selectByIndex: function(/*number*/ idx){
	},
	selectByRow: function(/*HTMLTableRow*/ row){
	},

	toggleSelection: function(/*object*/obj){
	},
	toggleSelectionByValue: function(/*string*/val){
	},
	toggleSelectionByIndex: function(/*number*/idx){
	},
	toggleSelectionByRow: function(/*HTMLTableRow*/row){
	},

	//	parsing functions, from HTML to metadata/SimpleStore
	parseMetadata: function(/* HTMLTableHead */head){
	},
	parseData: function(/* HTMLTableBody */body){
	},

	//	standard events
	onSelect: function(/* HTMLEvent */e){
	},
	onSort: function(/* HTMLEvent */e){
	},
	onFilter: function(/* HTMLEvent */e){
	},

	//	sorting functionality
	createSorter: function(/* array */info){
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
