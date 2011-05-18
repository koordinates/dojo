define(["dojo", "dojox", "./_ExportWriter"], function(dojo, dojox){

dojox.grid.enhanced.plugins.Exporter.registerWriter("table",
	"dojox.grid.enhanced.plugins.exporter.TableWriter");
	
dojo.declare("dojox.grid.enhanced.plugins.exporter.TableWriter",
	dojox.grid.enhanced.plugins.exporter._ExportWriter, {
	// summary:
	//		Export grid to HTML table format. Primarily used by Printer plugin.
	constructor: function(/* object? */writerArgs){
		// summary:
		//		The generated table only defines the col/rowspan, height and width of
		//		all the cells in the style attribute, no other attributes
		//		(like border, cellspacing, etc.) are used.
		//		Users can define these attributes in the writerArgs object, like:
		//		{table:"border='border'",thead:"cellspacing='3'"}
		this._viewTables = [];
		this._tableAttrs = writerArgs || {};
	},
	_getTableAttrs: function(/* string */tagName){
		// summary:
		//		Get html attribute string for the given kind of tag.
		// tags:
		//		private
		// tagName: string
		//		An html tag name
		// returns:
		//		The well formatted attributes for the given html table.tag
		var attrs = this._tableAttrs[tagName] || '';
		//To ensure the attribute list starts with a space
		if(attrs && attrs[0] != ' '){
			attrs = ' ' + attrs;
		}
		return attrs;	//String
	},
	_getRowClass: function(/* object */arg_obj){
		// summary:
		//		Get CSS class string for a row
		// tags:
		//		private
		return arg_obj.isHeader ? " grid_header"//String
				: [" grid_row grid_row_", arg_obj.rowIdx + 1,
				arg_obj.rowIdx % 2 ? " grid_even_row" : " grid_odd_row"].join('');
	},
	_getColumnClass: function(/* object */arg_obj){
		// summary:
		//		Get CSS class string for a column
		// tags:
		//		private
		var col_idx = arg_obj.cell.index + arg_obj.colOffset + 1;
		return [" grid_column_", col_idx,//String
				col_idx % 2 ? " grid_odd_column" : " grid_even_column"].join('');
	},
	beforeView: function(/* object */arg_obj){
		// summary:
		//		Overrided from _ExportWriter
		var viewIdx = arg_obj.viewIdx,
			table = this._viewTables[viewIdx],
			tagName, height,
			width = dojo.marginBox(arg_obj.view.contentNode).w;
		if(!table){
			var left = 0;
			for(var i = 0; i < viewIdx; ++i){
				left += this._viewTables[i]._width;
			}
			table = this._viewTables[viewIdx] = ['<table class="grid_view" style="position: absolute; top: 0; left:', left,
				'px;"', this._getTableAttrs("table"), '>'];
		}
		table._width = width;
		if(arg_obj.isHeader){
			tagName = 'thead';
			height = dojo.contentBox(arg_obj.view.headerContentNode).h;
		}else{
			tagName = 'tbody';
			var rowNode = arg_obj.grid.getRowNode(arg_obj.rowIdx);
			if(rowNode){
				height = dojo.contentBox(rowNode).h;
			}else{
				//This row has not been loaded from store, so we should estimate it's height.
				height = arg_obj.grid.scroller.averageRowHeight;
			}
		}
		table.push('<',tagName,
					' style="height:', height, 'px; width:', width, 'px;"',
					' class="', this._getRowClass(arg_obj), '"',
					this._getTableAttrs(tagName), '>');
		return true;	//Boolean
	},
	afterView: function(/* object */arg_obj){
		// summary:
		//		Overrided from _ExportWriter
		this._viewTables[arg_obj.viewIdx].push(arg_obj.isHeader ? '</thead>' : '</tbody>');
	},
	beforeSubrow: function(/* object */arg_obj){
		// summary:
		//		Overrided from _ExportWriter
		this._viewTables[arg_obj.viewIdx].push('<tr', this._getTableAttrs('tr'), '>');
		return true;	//Boolean
	},
	afterSubrow: function(/* object */arg_obj){
		// summary:
		//		Overrided from _ExportWriter
		this._viewTables[arg_obj.viewIdx].push('</tr>');
	},
	handleCell: function(/* object */arg_obj){
		// summary:
		//		Overrided from _ExportWriter
		var cell = arg_obj.cell;
		if(cell.hidden || dojo.indexOf(arg_obj.spCols, cell.index) >= 0){
			//We are not interested in indirect selectors and row indexes.
			return;
		}
		var cellTagName = arg_obj.isHeader ? 'th' : 'td',
			attrs = [cell.colSpan ? ' colspan="' + cell.colSpan + '"' : '',
					cell.rowSpan ? ' rowspan="' + cell.rowSpan + '"' : '',
					' style="width: ', dojo.contentBox(cell.getHeaderNode()).w, 'px;"',
					this._getTableAttrs(cellTagName),
					' class="', this._getColumnClass(arg_obj), '"'].join(''),
			table = this._viewTables[arg_obj.viewIdx];
		table.push('<', cellTagName, attrs, '>');
		if(arg_obj.isHeader){
			table.push(cell.name || cell.field);
		} else{
			table.push(this._getExportDataForCell(arg_obj.rowIdx, arg_obj.row, cell, arg_obj.grid));
		}
		table.push('</', cellTagName, '>');
	},
	afterContent: function(){
		// summary:
		//		Overrided from _ExportWriter
		dojo.forEach(this._viewTables, function(table){
			table.push('</table>');
		});
	},
	toString: function(){
		// summary:
		//		Overrided from _ExportWriter
		var viewsHTML = dojo.map(this._viewTables, function(table){	//String
			return table.join('');
		}).join('');
		return ['<div style="position: relative;">', viewsHTML, '</div>'].join('');
	}
});

return dojox.grid.enhanced.plugins.exporter.TableWriter;

});