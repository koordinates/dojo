dojo.provide("dojo.widget.DataGrid");
dojo.provide("dojo.widget.DataGridColumn");
dojo.require("dojo.widget.DomWidget");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.tags");
dojo.require("dojo.data.DataProvider");

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.InlineEditBox");
dojo.require("dojo.html.*" );
dojo.require("dojo.dom.*" );


//TODO:  Make nav bar buttons keyboard accessible, and provide all around accessability
//TODO:  Need to add some style capabilities back in - and remove some of the hardcoded style information
//TODO:  Create widget by using defineWidget()
//TODO:  Hook to sorting logic
//TODO:  Grouping support

dojo.widget.DataGrid.Constants = {
		SkipToMainContent: "skip to main content",
		NavigationJump: " Jump to page:  ",
		Selection: "Selection",
		Indexhead: "Row #",
		SkipToMainContent: "skip to main content",
		ImgPrevious: "click to go to previous page",
		ImgFirst: "click to go to first page",
		ImgNext: "click to widgetgo to next page",
		ImgLast: "click to go to last page",
		ImgGo: "click to go to the page you specify",
		ImgSelectAll: "Select All",
		ImgUnSelectAll: "UnSelect All",
		ImgAddRow: "Add a new row",
		ImgDelRow: "Delete a row",
		ImgAcceptRow: "Accept",
		ImgCancelRow: "Cancel"
};

dojo.widget.defineWidget("dojo.widget.DataGrid",
	dojo.widget.HtmlWidget,
	{
		isContainer: true, // DataGrid contains DataGridColumn child widgets
		templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlDataGrid.css"),
		templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlDataGrid.html"),
	
		//FIXME: These events aren't implemented at the moment
		eventNamesDefault: {
			requestInitialData: "requestInitialData",
			requestData: "requestData",
			widgetCreate: "widgetCreate",
			widgetDestroy: "widgetDestroy",
			columnClick: "columnClick",
			rowClick: "rowClick",
			moveColumnFrom: "moveColumnFrom",
			moveColumnTo: "moveColumnTo",
			addRow: "addRow",
			removeRow: "removeRow"
		},
	
		//Table Template Elements
		tableElt: null,
		headerRowElt: null,
		tableBodyElt: null,
		tableFootElt: null,
		tableFootCellElt: null,
		
		//Page Control Template Elements
		toolbarElt: null,
		goToStartElt: null,
		goToEndElt: null,
		goToNextElt: null,
		goToPreviousElt: null,
		currentPagesElt: null,
		totalPagesElt: null,
		
		//info from attributes
		readonly: false,
		allowpaging: true,
		showrowindex: true,
		showemptyrows: true,
		styleclass: true,
		navpos: 1, //Initial page position (only read at init)
		
		//data binding
		bindData: "", // This is the widgetId or id which locates the data for this grid (where the data is stored)
		bindTo: "", // Path into bindData which selects the rows to view - nodeset.  
					// Note that data columns will bind *relative* to the data selected for a row.
	
		// TODO: these should be moved into the grid's controller.
		controller: null, // NO DIRECT CALLS TO CONTROLLER SHOULD EXIST. INSTEAD, CONTROLLER WILL LISTEN TO EVENTS FROM WIDGET
						  // This reference only exists in the case that a default datagrid controller is used.
		model: null,
		instance: null,
	
		currentPage: 1, // 1-indexed
		numOfPages: 1,
		pagesize: -1,
		
		selectedNodes: null,
		columns: null,
		readOnlyTable: false,
		showTableRowIndex: false,
		
		selAll: false,
		selectCol: null,
		editableCells: [],
	
		// Overrides to do databinding and initial render...domNode already set to be the xml node
		fillInTemplate: function(args, frag) {
			this.dataBind();
			this.children = [];		//I'm not exactly sure why we have to zero-out the children array, 
									//but if we don't, during the postCreate, the children will contain 
									//every datacolumn and not just the ones for the current grid
	//		this.binders = [];
		},
		
		//At this point, all the child datagridcolumns have been initialized, so we can now add those to the table
		postCreate: function(args, frag) {
			for (var i = 0; i < this.children.length; i++) {
				this.tableData.addColumn(this.children[i]);
			}
			//calculate total pages
			if( this.pagesize > 0 ){ //protect div by 0
				this.numOfPages = Math.ceil(this.tableData.getRowCount() / this.pagesize);
			}else{
				this.numOfPages = 1;
			}
			
			this._drawTable();
			
			//jump to the navpos
			if( this.navpos > this.currentPage && this.navpos <= this.numOfPages )
				this.gotoPage( this.navpos );
		},
		
		/*
		 * Public API used to tell the widget that it needs to update itself.
		 *
	     * Thougts are to determine what to refresh based on the parameters
	     *		- no param : refresh all
	     *		- 1 param : assume row index, only update that row
	     *		- 2 params : assume row, col index, only update the specified row	 
		 */
		refresh: function( /*TBD*/ ){
			dojo.unimplemented("dojo.widget.DataGrid.refresh");
		},
		
		
		//This does all the work of drawing the table with the current TableData
		_drawTable: function(){
			
			this._drawHeader();
			
			this._drawBody();
			
			//Draws the toolbar, even if paging is disabled.  The drawFooter function will make sure that the buttons don't appear when paging is disabled
			this._drawFooter();
	
		},
		
		//This creates the headers for the table
		_drawHeader: function() {
			var colsToRender = this.tableData.getColumnCount();
			//add the index column
			if( this.showrowindex ){
				var headCell = document.createElement("th");
				dojo.html.addClass(headCell, "index");
				headCell.innerHTML = "&nbsp;";
				this.headerRowElt.appendChild(headCell);
			}
			for(var i = 0; i < colsToRender; i++){
				var headCell = document.createElement("th");
				if( this.tableData.isSortable(i) ){
					//wrap text as link
					var link = document.createElement("a");
					link.setAttribute("href", "javascript:void(0);");
					link.appendChild(document.createTextNode(this.tableData.getColumnName(i)));
					//connect handler
					dojo.event.connect( link, "onclick", this, "_handleSort" );
					dojo.html.addClass( headCell, "sortable" );
					headCell.appendChild(link);
				}else{
					headCell.appendChild(document.createTextNode(this.tableData.getColumnName(i)));
				}
				//check if last column (used to remove extra borders
				if( i == colsToRender-1 )
					dojo.html.addClass( headCell, "last" );
				this.headerRowElt.appendChild(headCell);
			}
		},
		
		/*
		 * Draw the table body
		 * The content of the table will be rendered based on the settings of allowpaging.
		 */
		_drawBody: function(){
			var colsToRender = this.tableData.getColumnCount();
			var rowsToRender;
			if(this.allowpaging){
				rowsToRender = this.pagesize;	
			}else{
				rowsToRender = this.tableData.getRowCount();
			}
			//loop for creating each row
			for(var i = 0; i < rowsToRender; i++){
				var tr = document.createElement("tr");
				//styling even rows
				if( i%2 == 1 ){
					dojo.html.addClass( tr, "even" );
				}
				//add the index column
				if( this.showrowindex ){
					var indexCell = document.createElement("td");
					dojo.html.addClass(indexCell, "index");
					//only add index to rows with data
					if(i < this.tableData.getRowCount()){
						indexCell.innerHTML = i+1+"";
					}else{
						//leave empty
						indexCell.innerHTML = "&nbsp;";				
					}
					tr.appendChild(indexCell);
				}
				//loop for creating each data cell
				for(var j = 0; j < colsToRender; j++){
					var cell = document.createElement("td");
					//check if this row is within the range of the total data rows
					if(i < this.tableData.getRowCount()){
						if (this.tableData.isEditable(j)) {
							dojo.html.addClass( cell, "editable" );
						}else{
							dojo.html.removeClass( cell, "editable" );
						}
						this.drawTableCell(i, j, cell);	
					}else{
						//leave empty
						dojo.html.removeClass( cell, "editable" );
						cell.innerHTML = "&nbsp;";				
					}
					//check if last column (used to remove extra borders
					if( j == colsToRender-1 )
						dojo.html.addClass( cell, "last" );
					
					//GINO: find a better way to address the cells (should not use ids)
					//cell.setAttribute("id", this.widgetId + "_" + i + "_" + j);
					
					this._dataCellElts.push(cell); //store reference (handy for updates and paging)			
					tr.appendChild(cell);
				}
				//hides rows that have no data in the case that paging is on and
				//there is not enough data to fill the first page
				if((i >= this.tableData.getRowCount()) && !this.showemptyrows ){
					dojo.html.addClass( tr, "hidden" );
				}
				this.tableBodyElt.appendChild(tr);
			}
		},
		
		_drawFooter: function(){
			//The footer should span all columns so that we can fully justify it to either left or right
			//In IE the name "colSpan" needs to be camelCased as below or it will not affect the element
			//match the total number of cells (based off the number of header cells
			var totalCols = this.headerRowElt.getElementsByTagName("th");
			this.tableFootCellElt.setAttribute("colSpan", totalCols.length);
			
			//I like the look of having an empty toolbar at the bottom when paging is disabled, so if paging is disabled, return after the toolbar div has been created but before we add the buttons.
			if(!this.allowpaging){
				dojo.html.addClass( this.toolbarElt, "disabled" );
				return;
			}
	
			//check if on first page
			if(this.currentPage == 1){
				dojo.html.addClass( this.goToPreviousElt, "disabled" );
				dojo.html.addClass( this.goToStartElt, "disabled" );
				
			}else{
				dojo.html.removeClass( this.goToPreviousElt, "disabled" );
				dojo.html.removeClass( this.goToStartElt, "disabled" );
			}
			
			//check if in last page
			if(this.currentPage == this.numOfPages){
				dojo.html.addClass( this.goToNextElt, "disabled" );
				dojo.html.addClass( this.goToEndElt, "disabled" );
			}else{
				dojo.html.removeClass( this.goToNextElt, "disabled" );
				dojo.html.removeClass( this.goToEndElt, "disabled" );
			}
			
			for(var i = 1; i <= this.numOfPages; i++){
				var option = document.createElement("option");
				option.setAttribute("value" , i);
				option.appendChild(document.createTextNode(i));
				if(i == this.currentPage){
					option.setAttribute("selected", "true");
				}
				this.currentPagesElt.appendChild(option);
			}
			
			//TODO:  If you use a keyboard to change the select box value, FF crashes.  I need to come up with a workaround - https://bugzilla.mozilla.org/show_bug.cgi?id=231830
			function _handlePageSelectionChanged(){
				this.gotoPage(this.currentPagesElt.options[this.currentPagesElt.selectedIndex].value);
			}
			dojo.event.connect(this.currentPagesElt, "onchange", dojo.lang.hitch(this, _handlePageSelectionChanged));
			
			this.totalPagesElt.innerHTML = this.numOfPages;
		},
		
		/*
		 * This method is called when paging to update the data being rendered
		 * by the table. Individual cells need to be rebind to new data.
		 *
		 * Also, make sure that rows with no data are hidden if showemptyrows is false
		 */
		_updateBody: function(){
			var colsToRender = this.tableData.getColumnCount();
			var rowsToRender;
			if(this.allowpaging){
				rowsToRender = this.pagesize;	
			}else{
				rowsToRender = this.tableData.getRowCount();
			}
			
			var rows = this.tableBodyElt.getElementsByTagName("tr");
			
			//loop through all the cells and set the values and re-bind
			for(var i=0; i<rowsToRender; i++){
				var dataRowIndex = (rowsToRender*(this.currentPage - 1))+i; //index to the row in the data model
				
				//set the index column
				if( this.showrowindex ){
					var indexCell = rows[i].getElementsByTagName("td")[0];
					
					//only set index to rows with data
					if(dataRowIndex < this.tableData.getRowCount()){
						indexCell.innerHTML = dataRowIndex+1+"";
					}else{
						//leave empty
						indexCell.innerHTML = "&nbsp;";				
					}
				}
				
				for(var j=0; j<colsToRender; j++){
					var cell = this._dataCellElts[ j + (i*colsToRender) ];
					
					//GINO: Need to unbind the cell before re-rendering
					
					//check if this row is within the range of the total data rows
					if(dataRowIndex < this.tableData.getRowCount()){
						cell.innerHTML = "";	
						if (this.tableData.isEditable(j)) {
							dojo.html.addClass( cell, "editable" );
						}
						else{
							dojo.html.removeClass( cell, "editable" );
						}
						this.drawTableCell(dataRowIndex, j, cell);	
					}else{
						//leave empty
						dojo.html.removeClass( cell, "editable" );
						cell.innerHTML = "&nbsp;";				
					}
					
					//GINO: find a better way to address the cells (should not use ids)
					//cell.setAttribute("id", this.widgetId + "_" + dataRowIndex + "_" + j);
				}
				
				//hides rows that have no data in the case that paging is on and
				//there is not enough data to fill the first page
				if((dataRowIndex >= this.tableData.getRowCount()) && !this.showemptyrows ){
					dojo.html.addClass( rows[i], "hidden" );
				}else{
					dojo.html.removeClass( rows[i], "hidden" );
				}
			}	
		},
		
		_updateFooter: function(){
			//no need to update toolbar if paging is disabled
			if (!this.allowpaging) {
				return;
			}
			//handle when first page
			if(this.currentPage == 1){
				dojo.html.addClass( this.goToPreviousElt, "disabled" );
				dojo.html.addClass( this.goToStartElt, "disabled" );
			}else{
				dojo.html.removeClass( this.goToPreviousElt, "disabled" );
				dojo.html.removeClass( this.goToStartElt, "disabled" );
			}
			//handle when last page
			if(this.currentPage == this.numOfPages){
				dojo.html.addClass( this.goToNextElt, "disabled" );
				dojo.html.addClass( this.goToEndElt, "disabled" );
			}else{
				dojo.html.removeClass( this.goToNextElt, "disabled" );
				dojo.html.removeClass( this.goToEndElt, "disabled" );
			}
			//update the combo
			this.currentPagesElt.selectedIndex = (this.currentPage-1);
		},
			
		gotoPage: function(/*Number*/ pageNum) {
			if( pageNum == this.currentPage ){
				return;
			}
			if(this.allowpaging){
				if (pageNum <= this.numOfPages && pageNum > 0) {
					this.currentPage = Number(pageNum);
					this._updateBody();
					this._updateFooter();
				} else {
					//max pages reached
				}
			}
		},
		
		nextPage: function(){
			this.gotoPage(this.currentPage + 1);
		},
		
		prevPage: function(){
			this.gotoPage(this.currentPage - 1);
		},
	
		firstPage: function(){
			this.gotoPage(1);
		},
			
		lastPage: function(){
			this.gotoPage( this.numOfPages );
		},
		
		_handleSort: function(/* DomEvent */ e){
			var targetLink = e.target;
			var targetHeaderCell = targetLink.parentNode;
			var headers = this.headerRowElt.getElementsByTagName( "th" ); //TODO: might need to got through td also
			for(var i=0; i<headers.length; i++){
				//TODO: logic based on classes that are set (could do by checking TableData
				if( dojo.html.hasClass(headers[i], "sortable") ){
					if( targetHeaderCell == headers[i] ){
					
						//Patrick:  This is the column index we're sorting.
						//This might not be ideal though once we allow rearranging of columns
						var columnIndex = i;
						if (this.showrowindex)
							columnIndex--;		//subtract 1 to account for the 'fake' row index column
					
						//TODO: Publish sort event
						if( dojo.html.hasClass(headers[i], "sorted_up") ){
							dojo.html.replaceClass(headers[i], "sorted_down", "sorted_up");
							
							//TODO: do the sort - Patrick:  Added some sort code
							this.tableData.sortByColumnIndex(columnIndex, "UP"); //TODO:  Make UP/DOWN a constant
						}else if( dojo.html.hasClass(headers[i], "sortable") ){
							dojo.html.replaceClass(headers[i], "sorted_up", "sorted_down");
							//TODO: do the sort - Patrick:  Added some sort code
							this.tableData.sortByColumnIndex(columnIndex, "DOWN"); //TODO:  Make UP/DOWN a constant
						}else{
							dojo.html.addClass(headers[i], "sorted_up");
							//TODO: do the sort - Patrick:  Added some sort code
							this.tableData.sortByColumnIndex(columnIndex, "UP"); //TODO:  Make UP/DOWN a constant
						}
					}else{
						//remove the sorted classes
						dojo.html.removeClass( headers[i], "sorted_", true );
					}
				}		
			}
			
			//TODO:  Patrick:  This is another thing we have to work on.  Should the table automatically refresh or wait for a signal?
			this.refresh();	
		},
	
		drawTableCell: function(row, column, node) {
			if (this.tableData.isEditable(column)) {
				var div = document.createElement("div");
				//TODO: NEED TO CALL SOME SORT OF UNBIND
				//Patrick - this binder is responsible for setting the cell values.  Is this the best way to handle it?
				var binder = this.tableData.bind(row, column, div,"innerHTML");
				//div.appendChild(text);
				//div.setAttribute("class", "editableCell");
				node.appendChild(div);
				var inline = dojo.widget.createWidget('inlineEditBox', {}, div);
				
				//Patrick - this binder binds an editable property to the model.  I think we should figure out the best way to handle this as well
		
				var binder2 = this.tableData.bind(row, column, inline, "textValue", "saveEdit");	//when saveEdit is called, update the table model with the value
				this.editableCells.push(inline);
				
				//This is called when a cell value changes
				function createCallback(datagrid, r, c, inline, tableData) {
					return function(evt) {
						//tableData.setValue(r, c, inline.textValue);
					};
				}
				
				//hack that sets the "editing" property of all the inline editors to true, which  makes them not editable
				function createDisableInlines(inlines) {
					return function(evt) {
						for (var i = 0; i < inlines.length; i++) {
							inlines[i].editing = true;
						}
					};
				}
				
				//hack that sets the "editing" property of all the inline editors to false, which  makes them editable
				function createEnableInlines(inlines) {
					return function(evt) {
						for (var i = 0; i < inlines.length; i++) {
							inlines[i].editing = false;
						}
					};
				}
				
				dojo.event.connect(inline, "saveEdit", createCallback(this, row, column, inline, this.tableData));
				dojo.event.connect(inline, "saveEdit", createEnableInlines(this.editableCells));	//enable editing for other inlines when complete
				dojo.event.connect(inline, "cancelEdit", createEnableInlines(this.editableCells));	//enable editing for other inlines when complete
				dojo.event.connect(inline, "beginEdit", createDisableInlines(this.editableCells));	//disable editing for other inlines while we're editing this cell
				//node.appendChild(inline.domNode);
			} else {
				//node.appendChild(document.createTextNode(this.tableData.getValue(row,column)));
				var binder = this.tableData.bind(row, column, node,"innerHTML");
	
			}
		},
	
		dataBind: function () {
	//TODO: Replace with unique id util			
			if (this.id == "" || this.id == null){
				this.id = this.widgetId;
			}
			var model = this.getDataProvider();
			if (model == null){
				return;
			}
			//TODO:  This is specific to an XML table model.  Perhaps we should use a more generic fetchArray like we have in the Dojo provider class
			// THIS SHOULD BE MOVED INTO THE CONTROLLER.  Widget events, such as requestData or requestInitialData should be 
			// caught and handled in the controller, to perform the binding in a provider-implementation specific way.
			this.instance = model.fetchData(this.bindTo);
			if (this.instance == null){
				return;	
			}
			this.tableData = model.getDataGridController(); 	
			this.tableData.load(this.instance);
			return;			
		},
	
		getDataProvider: function (){
			if ((this.model == null) && (this.bindData != "")) {
			//TODO: Replaced with widget lookup--check about scoped lookup, rather than using widgetId
			//	var prefix = (this.scopeName) ? this.scopeName : this.domNode.tagName.substring(0,this.domNode.tagName.indexOf(":")); 
			//  Look for a model element at document level, depth first search of each document child element
			//	this.model = this.getElement(prefix,document.documentElement);
				this.model = dojo.widget.manager.getWidgetById(this.bindData); 
			}
			return this.model;
		}
	},
	"",
	function() {
		dojo.debug("DataGrid Init");
		
		this._dataCellElts = []; //holds reference of the cells that contain data
	});

dojo.widget.defineWidget("dojo.widget.DataGridColumn",dojo.widget.DomWidget,{
	name: "",
	bindTo: "", // Path expression used to bind this column to data in a row
				// Note that data columns will bind *relative* to the data 
				// selected for a row (eg. the data selected in the parent datagrid's bindTo).
	editable: false,
	sortable: false,
	alignment: "LEFT",
	width: 100,
	underline: true,
	convertor: null
});
