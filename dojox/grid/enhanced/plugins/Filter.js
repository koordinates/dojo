define([
	"dojo",
	"dojox",
	"../_Plugin",
	"./Dialog",
	"./filter/FilterLayer",
	"./filter/FilterBar",
	"./filter/FilterDefDialog",
	"./filter/FilterStatusTip",
	"./filter/ClearFilterConfirm",
	"dojo/i18n!../nls/Filter"], function(dojo, dojox){

	var ns = dojo.getObject("grid.enhanced.plugins", true, dojox),
		fns = dojo.getObject("grid.enhanced.plugins.filter", true, dojox);
		
	dojo.declare("dojox.grid.enhanced.plugins.Filter", dojox.grid.enhanced._Plugin, {
		// summary:
		//		Provide filter functionality for grid.
		//
		//		Acceptable plugin parameters:
		//		1. itemsName: string
		//			the name shown on the filter bar.
		//		2. statusTipTimeout: number
		//			when does the status tip show.
		//		3. ruleCount: number
		//			default to 3, should not change to more. The Claro theme limits it.
		//		4. disabledConditions: object
		//			If you don't need all of the conditions provided for a data type,
		//			you can explicitly declare them here:
		//			e.g.: disabledConditions: {string: ["contains", "is"], number: ["equalto"], ...}
		//		5. isServerSide: boolean
		//			Whether to use server side filtering. Default to false.
		//		6. isStateful: boolean
		//			If isServerSide is true, set the server side filter to be stateful or not. default to false.
		//		7. url: string
		//			If using stateful, this is the url to send commands. default to store.url.
		//
		//		Acceptable cell parameters defined in layout:
		//		1. filterable: boolean
		//			The column is not filterable only when this is set to false explicitly.
		//		2. datatype: string
		//			The data type of this column. Can be "string", "number", "date", "time", "boolean".
		//			Default to "string".
		//		3. autoComplete: boolean
		//			If need auto-complete in the ComboBox for String type, set this to true.
		//		4. dataTypeArgs: object
		//			Some arguments helping convert store data to something the filter UI understands.
		//			Different data type arguments can be provided to different data types.
		//			For date/time, this is a dojo.date.locale.__FormatOptions, so the DataTimeBox can understand the store data.
		//			For boolean, this object contains:
		//				trueLabel: string
		//					A label to display in the filter definition dialog for true value. Default to "True".
		//				falseLable: string
		//					A label to display in the filter definition dialog for false value. Default to "False".
		//		5. disabledConditions: object
		//			If you don't need all of the conditions provided by the filter UI on this column, you can explicitly say it out here.
		//			e.g.: disabledConditions: ["contains", "is"]
		//			This will disable the "contains" condition for this column, if this column is of string type.
		//			For full set of conditions, please refer to dojox.grid.enhanced.plugins.filter.FilterDefDialog._setupData.
		// example:
		//	|	<div dojoType="dojox.grid.EnhancedGrid" plugins="{GridFilter: true}" ...></div>
		//	|	or provide some parameters:
		//	|	<div dojoType="dojox.grid.EnhancedGrid" plugins="{GridFilter: {itemsName: 'songs'}}" ...></div>
		//	|	Customize columns for filter:
		//	|	var layout = [
		//	|		...
		//	|		//define a column to be un-filterable in layout/structure
		//	|		{field: "Genre", filterable: false, ...}
		//	|		//define a column of type string and supports autoComplete when you type in filter conditions.
		//	|		{field: "Writer", datatype: "string", autoCommplete: true, ...}
		//	|		//define a column of type date and the data in store has format: "yyyy/M/d"
		//	|		{field: "Publish Date", datatype: "date", dataTypeArgs: {datePattern: "yyyy/M/d"}, ...}
		//	|		//disable some conditions for a column
		//	|		{field: "Track", disabledConditions: ["equalto","notequalto"], ...}
		//	|		...
		//	|	];
		
		// name: String
		//		plugin name
		name: "filter",
		
		constructor: function(grid, args){
			// summary:
			//		See constructor of dojox.grid.enhanced._Plugin.
			this.grid = grid;
			this.nls = dojo.i18n.getLocalization("dojox.grid.enhanced", "Filter");
			
			args = this.args = dojo.isObject(args) ? args : {};
			if(typeof args.ruleCount != 'number' || args.ruleCount < 0){
				args.ruleCount = 3;
			}
			
			//Install filter layer
			this._wrapStore();
			
			//Install UI components
			var obj = { "plugin": this };
			this.clearFilterDialog = new dojox.grid.enhanced.plugins.Dialog({
				refNode: this.grid.domNode,
				title: this.nls["clearFilterDialogTitle"],
				content: new fns.ClearFilterConfirm(obj)
			});
			this.filterDefDialog = new fns.FilterDefDialog(obj);
			this.filterBar = new fns.FilterBar(obj);
			this.filterStatusTip = new fns.FilterStatusTip(obj);
			
			//Expose the layer event to grid.
			grid.onFilterDefined = function(){};
			this.connect(grid.layer("filter"), "onFilterDefined", function(filter){
				grid.onFilterDefined(grid.getFilter(), grid.getFilterRelation());
			});
		},
		destroy: function(){
			this.inherited(arguments);
			try{
				this.grid.unwrap("filter");
				this.filterBar.destroyRecursive();
				this.filterBar = null;
				this.clearFilterDialog.destroyRecursive();
				this.clearFilterDialog = null;
				this.filterStatusTip.destroy();
				this.filterStatusTip = null;
				this.filterDefDialog.destroy();
				this.filterDefDialog = null;
				this.grid = null;
				this.nls = null;
				this.args = null;
			}catch(e){
				console.warn("Filter.destroy() error:",e);
			}
		},
		_wrapStore: function(){
			var g = this.grid;
			var args = this.args;
			var filterLayer = args.isServerSide ? new fns.ServerSideFilterLayer(args) :
				new fns.ClientSideFilterLayer({
					cacheSize: args.filterCacheSize,
					fetchAll: args.fetchAllOnFirstFilter,
					getter: this._clientFilterGetter
				});
			ns.wrap(g, "_storeLayerFetch", filterLayer);
			
			this.connect(g, "_onDelete", dojo.hitch(filterLayer, "invalidate"));
		},
		onSetStore: function(store){
			this.filterDefDialog.clearFilter(true);
		},
		_clientFilterGetter: function(/* data item */ datarow,/* cell */cell, /* int */rowIndex){
			// summary:
			//		Define the grid-specific way to get data from a row.
			//		Argument "cell" is provided by FilterDefDialog when defining filter expressions.
			//		Argument "rowIndex" is provided by FilterLayer when checking a row.
			//		FilterLayer also provides a forth argument: "store", which is grid.store,
			//		but we don't need it here.
			return cell.get(rowIndex, datarow);
		}
	});

	dojox.grid.EnhancedGrid.registerPlugin(dojox.grid.enhanced.plugins.Filter/*name:'filter'*/);

	return dojox.grid.enhanced.plugins.Filter;

});