dojo.provide("dojox.grid._Layout");
dojo.require("dojox.grid.cells");
dojo.require("dojox.grid._RowSelector");

dojo.declare("dojox.grid._Layout", null, {
	// summary:
	//	Controls grid cell layout. Owned by grid and used internally.
	constructor: function(inGrid){
		this.grid = inGrid;
	},
	// flat array of grid cells
	cells: [],
	// structured array of grid cells
	structure: null,
	// default cell width
	defaultWidth: '6em',

	// methods
	moveColumn: function(sourceViewIndex, destViewIndex, cellIndex, targetIndex, before){
		var source_cells = this.structure[sourceViewIndex].cells[0];
		var dest_cells = this.structure[destViewIndex].cells[0];

		var cell = null;
		var cell_ri = 0;
		var target_ri = 0;

		for(var i=0, c; c=source_cells[i]; i++){
			if(c.index == cellIndex){
				cell_ri = i;
				break;
			}
		}
		cell = source_cells.splice(cell_ri, 1)[0];
		cell.view = this.grid.views.views[destViewIndex];

		for(i=0, c=null; c=dest_cells[i]; i++){
			if(c.index == targetIndex){
				target_ri = i;
				break;
			}
		}
		if(!before){
			target_ri += 1;
		}
		dest_cells.splice(target_ri, 0, cell);

		this.cells = [];
		var cellIndex = 0;
		for(var i=0, v; v=this.structure[i]; i++){
			for(var j=0, cs; cs=v.cells[j]; j++){
				for(var k=0, c; c=cs[k]; k++){
					c.index = cellIndex;
					this.cells.push(c);
					cellIndex++;
				}
			}
		}
		this.grid.setupHeaderMenu();
		//this.grid.renderOnIdle();
	},

	setColumnVisibility: function(columnIndex, visible){
		var cell = this.cells[columnIndex];
		if(cell.hidden == visible){
			cell.hidden = !visible;
			var v = cell.view, w = v.viewWidth;
			v.convertColPctToFixed();
			if(w && w != "auto"){
				v._togglingColumn = dojo.marginBox(cell.getHeaderNode()).w || 0;
			}
			v.update();
			return true;
		}else{
			return false;
		}
	},
	
	setStructure: function(inStructure){
		var self = this;

		var getCellWidth = function(inDef){
			var w = 0;
			if(inDef.colSpan > 1){
				w = 0;
			}else if(!isNaN(inDef.width)){
				w = inDef.width + "em";
			}else{
				w = inDef.width || self.defaultWidth;
			}
			return w;
		};

		var addCellDef = function(inRowIndex, inCellIndex, inDef){
			var props = {
				grid: self.grid,
				subrow: inRowIndex,
				layoutIndex: inCellIndex,
				index: self.cells.length
			};

			if(inDef && inDef instanceof dojox.grid.cells._Base){
				props.unitWidth = getCellWidth(inDef._props);
				inDef = dojo.mixin(inDef, self._defaultCellProps, inDef._props, props);
				return inDef;
			}

			var cell_type = inDef.type || self._defaultCellProps.type || dojox.grid.cells.Cell;

			props.unitWidth = getCellWidth(inDef);
			return new cell_type(dojo.mixin({}, self._defaultCellProps, inDef, props));
		};

		var addRowDef = function(inRowIndex, inDef){
			var result = [];
			var relSum = 0, pctSum = 0, doRel = true;
			for(var i=0, def, cell; (def=inDef[i]); i++){
				cell = addCellDef(inRowIndex, i, def);
				result.push(cell);
				self.cells.push(cell);
				// Check and calculate the sum of all relative widths
				if(doRel && cell.relWidth){
					relSum += cell.relWidth;
				}else if (cell.width){
					var w = cell.width;
					if(typeof w == "string" && w.slice(-1) == "%"){
						pctSum += window.parseInt(w, 10);
					}else if(w == "auto"){
						// relative widths doesn't play nice with auto - since we
						// don't have a way of knowing how much space the auto is 
						// supposed to take up.
						doRel = false;
					}
				}
			}
			if(relSum && doRel){
				// We have some kind of relWidths specified - so change them to %
				dojo.forEach(result, function(cell){
					if(cell.relWidth){
						cell.width = cell.unitWidth = ((cell.relWidth / relSum) * (100 - pctSum)) + "%";
					}
				});
			}
			return result;
		};

		var addRowsDef = function(inDef){
			var result = [];
			if(dojo.isArray(inDef)){
				if(dojo.isArray(inDef[0])){
					for(var i=0, row; inDef && (row=inDef[i]); i++){
						result.push(addRowDef(i, row));
					}
				}else{
					result.push(addRowDef(0, inDef));
				}
			}
			return result;
		};

		var addViewDef = function(inDef){
			self._defaultCellProps = inDef.defaultCell || {};
			return dojo.mixin({}, inDef, {cells: addRowsDef(inDef.rows || inDef.cells)});
		};

		this.fieldIndex = 0;
		this.cells = [];
		var s = this.structure = [];

		if(this.grid.rowSelector){
			var sel = { type: dojox._scopeName + ".grid._RowSelector" };

			if(dojo.isString(this.grid.rowSelector)){
				var width = this.grid.rowSelector;

				if(width == "false"){
					sel = null;
				}else if(width != "true"){
					sel['width'] = width;
				}
			}else{
				if(!this.grid.rowSelector){
					sel = null;
				}
			}

			if(sel){
				s.push(addViewDef(sel));
			}
		}

		var isCell = function(def){
			return ("name" in def || "field" in def || "get" in def);
		};

		var isRowDef = function(def){
			if(dojo.isArray(def)){
				if(dojo.isArray(def[0]) || isCell(def[0])){
					return true;
				}
			}
			return false;
		};

		var isView = function(def){
			return (def != null && dojo.isObject(def) &&
					("cells" in def || "rows" in def || ("type" in def && !isCell(def))));
		};

		if(dojo.isArray(inStructure)){
			var hasViews = false;
			for(var i=0, st; (st=inStructure[i]); i++){
				if(isView(st)){
					hasViews = true;
					break;
				}
			}
			if(!hasViews){
				s.push(addViewDef({ cells: inStructure }));
			}else{
				for(var i=0, st; (st=inStructure[i]); i++){
					if(isRowDef(st)){
						s.push(addViewDef({ cells: st }));
					}else if(isView(st)){
						s.push(addViewDef(st));
					}
				}
			}
		}else if(isView(inStructure)){
			// it's a view object
			s.push(addViewDef(inStructure));
		}

		this.cellCount = this.cells.length;
		this.grid.setupHeaderMenu();
	}
});
