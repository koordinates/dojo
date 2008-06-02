dojo.provide("dojox.grid._View");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojox.html.metrics");
dojo.require("dojox.grid.util");

(function(){
	// private
	var rowIndexTag = "gridRowIndex";
	var gridViewTag = "gridView";

	var getTdIndex = function(td){
		return td.cellIndex >=0 ? td.cellIndex : dojo.indexOf(td.parentNode.cells, td);
	};
	
	var getTrIndex = function(tr){
		return tr.rowIndex >=0 ? tr.rowIndex : dojo.indexOf(tr.parentNode.childNodes, tr);
	};
	
	var getTr = function(rowOwner, index){
		return rowOwner && ((rowOwner.rows||0)[index] || rowOwner.childNodes[index]);
	};

	var findTable = function(node){
		for (var n=node; n && n.tagName!='TABLE'; n=n.parentNode);
		return n;
	};
	
	var ascendDom = function(inNode, inWhile){
		for (var n=inNode; n && inWhile(n); n=n.parentNode);
		return n;
	};
	
	var makeNotTagName = function(inTagName){
		var name = inTagName.toUpperCase();
		return function(node){ return node.tagName != name; };
	};

	var getStyleText = function(inNode, inStyleText){
		return (inNode.style.cssText == undefined ? inNode.getAttribute("style") : inNode.style.cssText);
	};


	// column resize functions
	var nop = function(){};

	var dragInfo = {
		dragging: false,
		hysteresis: 2
	};
	var dragEvents = {};

	var captureDrag = function(inElement) {
		//console.debug('dojox.grid._grid.drag.capture');
		if (inElement.setCapture)
			inElement.setCapture();
		else {
			document.addEventListener("mousemove", inElement.onmousemove, true);
			document.addEventListener("mouseup", inElement.onmouseup, true);
			document.addEventListener("click", inElement.onclick, true);
		}
	}

	var releaseDrag = function(inElement) {
		//console.debug('dojox.grid._grid.drag.release');
		if(inElement.releaseCapture){
			inElement.releaseCapture();
		}else{
			document.removeEventListener("click", inElement.onclick, true);
			document.removeEventListener("mouseup", inElement.onmouseup, true);
			document.removeEventListener("mousemove", inElement.onmousemove, true);
		}
	}

	var startDrag = function(inElement, inOnDrag, inOnEnd, inEvent, inOnStart){
		if(/*dragInfo.elt ||*/ !inElement || dragInfo.dragging){
			console.debug('failed to start drag: bad input node or already dragging');
			return;
		}
		dragInfo.dragging = true;
		dragInfo.elt = inElement;
		dragEvents = {
			drag: inOnDrag || nop, 
			end: inOnEnd || nop, 
			start: inOnStart || nop, 
			oldmove: inElement.onmousemove, 
			oldup: inElement.onmouseup, 
			oldclick: inElement.onclick 
		};
		dragInfo.positionX = (inEvent && ('screenX' in inEvent) ? inEvent.screenX : false);
		dragInfo.positionY = (inEvent && ('screenY' in inEvent) ? inEvent.screenY : false);
		dragInfo.started = (dragInfo.position === false);
		inElement.onmousemove = mousemove;
		inElement.onmouseup = mouseup;
		inElement.onclick = click;
		captureDrag(dragInfo.elt);
	}

	var endDrag = function(){
		//console.debug("dojox.grid._grid.drag.end");
		var elt = dragInfo.elt;
		releaseDrag(elt);
		elt.onmousemove = dragEvents.oldmove;
		elt.onmouseup = dragEvents.oldup;
		elt.onclick = dragEvents.oldclick;
		elt = null;
		try{
			if(dragInfo.started){
				dragEvents.end();
			}
		}finally{
			dragInfo.dragging = false;
		}
	}

	var calcDelta = function(inEvent){
		inEvent.deltaX = inEvent.screenX - dragInfo.positionX;
		inEvent.deltaY = inEvent.screenY - dragInfo.positionY;
	}

	var hasMoved = function(inEvent){
		return Math.abs(inEvent.deltaX) + Math.abs(inEvent.deltaY) > dragInfo.hysteresis;
	}

	var mousemove = function(inEvent){
		inEvent = dojo.fixEvent(inEvent);
		dojo.stopEvent(inEvent);
		calcDelta(inEvent);
		if((!dragInfo.started)&&(hasMoved(inEvent))){
			dragEvents.start(inEvent);
			dragInfo.started = true;
		}
		if(dragInfo.started){
			dragEvents.drag(inEvent);
		}
	}

	var mouseup = function(inEvent){
		//console.debug("dojox.grid._grid.drag.mouseup");
		dojo.stopEvent(dojo.fixEvent(inEvent));
		endDrag();
	}

	var click = function(inEvent){
		dojo.stopEvent(dojo.fixEvent(inEvent));
		//dgdrag.end();
	}
	

	// base class for generating markup for the views
	var Builder = function(view){
		if(view){
			this.view = view;
			this.grid = view.grid;
		}
	};
	dojo.extend(Builder, {
		view: null,
		// boilerplate HTML
		_table: '<table class="dojoxGrid-row-table" border="0" cellspacing="0" cellpadding="0" role="wairole:presentation">',

		// generate starting tags for a cell
		generateCellMarkup: function(inCell, inMoreStyles, inMoreClasses, isHeader){
			var result = [], html;
			if (isHeader){
				html = [ '<th tabIndex="-1" role="wairole:columnheader"' ];
			}else{
				html = [ '<td tabIndex="-1" role="wairole:gridcell"' ];
			}
			inCell.colSpan && html.push(' colspan="', inCell.colSpan, '"');
			inCell.rowSpan && html.push(' rowspan="', inCell.rowSpan, '"');
			html.push(' class="dojoxGrid-cell ');
			inCell.classes && html.push(inCell.classes, ' ');
			inMoreClasses && html.push(inMoreClasses, ' ');
			// result[0] => td opener, style
			result.push(html.join(''));
			// SLOT: result[1] => td classes 
			result.push('');
			html = ['" idx="', inCell.index, '" style="'];
			html.push(inCell.styles, inMoreStyles||'');
			inCell.unitWidth && html.push('width:', inCell.unitWidth, ';');
			// result[2] => markup
			result.push(html.join(''));
			// SLOT: result[3] => td style 
			result.push('');
			html = [ '"' ];
			inCell.attrs && html.push(" ", inCell.attrs);
			html.push('>');
			// result[4] => td postfix
			result.push(html.join(''));
			// SLOT: result[5] => content
			result.push('');
			// result[6] => td closes
			result.push('</td>');
			return result; // Array
		},

		// cell finding
		isCellNode: function(inNode){
			return Boolean(inNode && inNode.getAttribute && inNode.getAttribute("idx"));
		},
		
		getCellNodeIndex: function(inCellNode){
			return inCellNode ? Number(inCellNode.getAttribute("idx")) : -1;
		},
		
		getCellNode: function(inRowNode, inCellIndex){
			for(var i=0, row; row=getTr(inRowNode.firstChild, i); i++){
				for(var j=0, cell; cell=row.cells[j]; j++){
					if(this.getCellNodeIndex(cell) == inCellIndex){
						return cell;
					}
				}
			}
		},
		
		findCellTarget: function(inSourceNode, inTopNode){
			var n = inSourceNode;
			while(n && (!this.isCellNode(n) || (gridViewTag in n.offsetParent.parentNode && n.offsetParent.parentNode[gridViewTag] != this.view.id)) && (n!=inTopNode)){
				n = n.parentNode;
			}
			return n!=inTopNode ? n : null 
		},
		
		// event decoration
		baseDecorateEvent: function(e){
			e.dispatch = 'do' + e.type;
			e.grid = this.grid;
			e.sourceView = this.view;
			e.cellNode = this.findCellTarget(e.target, e.rowNode);
			e.cellIndex = this.getCellNodeIndex(e.cellNode);
			e.cell = (e.cellIndex >= 0 ? this.grid.getCell(e.cellIndex) : null);
		},
		
		// event dispatch
		findTarget: function(inSource, inTag){
			var n = inSource;
			while(n && (n!=this.domNode) && (!(inTag in n) || (gridViewTag in n && n[gridViewTag] != this.view.id))){
				n = n.parentNode;
			}
			return (n != this.domNode) ? n : null; 
		},

		findRowTarget: function(inSource){
			return this.findTarget(inSource, rowIndexTag);
		},

		isIntraNodeEvent: function(e){
			try{
				return (e.cellNode && e.relatedTarget && dojo.isDescendant(e.relatedTarget, e.cellNode));
			}catch(x){
				// e.relatedTarget has permission problem in FF if it's an input: https://bugzilla.mozilla.org/show_bug.cgi?id=208427
				return false;
			}
		},

		isIntraRowEvent: function(e){
			try{
				var row = e.relatedTarget && this.findRowTarget(e.relatedTarget);
				return !row && (e.rowIndex==-1) || row && (e.rowIndex==row.gridRowIndex);			
			}catch(x){
				// e.relatedTarget on INPUT has permission problem in FF: https://bugzilla.mozilla.org/show_bug.cgi?id=208427
				return false;
			}
		},

		dispatchEvent: function(e){
			if(e.dispatch in this){
				return this[e.dispatch](e);
			}
		},

		// dispatched event handlers
		domouseover: function(e){
			if(e.cellNode && (e.cellNode!=this.lastOverCellNode)){
				this.lastOverCellNode = e.cellNode;
				this.grid.onMouseOver(e);
			}
			this.grid.onMouseOverRow(e);
		},

		domouseout: function(e){
			if(e.cellNode && (e.cellNode==this.lastOverCellNode) && !this.isIntraNodeEvent(e, this.lastOverCellNode)){
				this.lastOverCellNode = null;
				this.grid.onMouseOut(e);
				if(!this.isIntraRowEvent(e)){
					this.grid.onMouseOutRow(e);
				}
			}
		},
		
		domousedown: function(e){
			if (e.cellNode)
				this.grid.onMouseDown(e);
			this.grid.onMouseDownRow(e)
		}
	});

	// Produces html for grid data content. Owned by grid and used internally 
	// for rendering data. Override to implement custom rendering.
	var ContentBuilder = function(view){
		Builder.call(this, view);
	};
	ContentBuilder.prototype = new Builder();

	dojo.extend(ContentBuilder, {
		update: function(){
			this.prepareHtml();
		},

		// cache html for rendering data rows
		prepareHtml: function(){
			var defaultGet=this.grid.get, rows=this.view.structure.rows;
			for(var j=0, row; (row=rows[j]); j++){
				for(var i=0, cell; (cell=row[i]); i++){
					cell.get = cell.get || (cell.value == undefined) && defaultGet;
					cell.markup = this.generateCellMarkup(cell, cell.cellStyles, cell.cellClasses, false);
				}
			}
		},

		// time critical: generate html using cache and data source
		generateHtml: function(inDataIndex, inRowIndex){
			var
				html = [ this._table ],
				v = this.view,
				obr = v.onBeforeRow,
				rows = v.structure.rows,
				item = this.grid.getItem(inRowIndex);

			obr && obr(inRowIndex, rows);
			for(var j=0, row; (row=rows[j]); j++){
				if(row.hidden || row.header){
					continue;
				}
				html.push(!row.invisible ? '<tr>' : '<tr class="dojoxGrid-invisible">');
				for(var i=0, cell, m, cc, cs; (cell=row[i]); i++){
					m = cell.markup, cc = cell.customClasses = [], cs = cell.customStyles = [];
					// content (format can fill in cc and cs as side-effects)
					m[5] = cell.format(inRowIndex, item);
					// classes
					m[1] = cc.join(' ');
					// styles
					m[3] = cs.join(';');
					// in-place concat
					html.push.apply(html, m);
				}
				html.push('</tr>');
			}
			html.push('</table>');
			return html.join(''); // String
		},

		decorateEvent: function(e){
			e.rowNode = this.findRowTarget(e.target);
			if(!e.rowNode){return false};
			e.rowIndex = e.rowNode[rowIndexTag];
			this.baseDecorateEvent(e);
			e.cell = this.grid.getCell(e.cellIndex);
			return true; // Boolean
		}
	});

	// Produces html for grid header content. Owned by grid and used internally 
	// for rendering data. Override to implement custom rendering.
	var HeaderBuilder = function(view){
		Builder.call(this, view);
	};
	HeaderBuilder.prototype = new Builder();

	dojo.extend(HeaderBuilder, {

		bogusClickTime: 0,
		overResizeWidth: 4,
		minColWidth: 1,
		
		// FIXME: isn't this getting mixed from dojox.grid._grid.Builder, -1 character?
		_table: '<table class="dojoxGrid-row-table" border="0" cellspacing="0" cellpadding="0" role="wairole:presentation"',

		update: function(){
			this.tableMap = new TableMap(this.view.structure.rows);
		},

		generateHtml: function(inGetValue, inValue){
			var html = [this._table], rows = this.view.structure.rows;
			
			// render header with appropriate width, if possible so that views with flex columns are correct height
			if(this.view.viewWidth){
				html.push([' style="width:', this.view.viewWidth, ';"'].join(''));
			}
			html.push('>');
			dojox.grid.util.fire(this.view, "onBeforeRow", [-1, rows]);
			for(var j=0, row; (row=rows[j]); j++){
				if(row.hidden){
					continue;
				}
				html.push(!row.invisible ? '<tr>' : '<tr class="dojoxGrid-invisible">');
				for(var i=0, cell, markup; (cell=row[i]); i++){
					cell.customClasses = [];
					cell.customStyles = [];
					markup = this.generateCellMarkup(cell, cell.headerStyles, cell.headerClasses, true);
					// content
					markup[5] = (inValue != undefined ? inValue : inGetValue(cell));
					// styles
					markup[3] = cell.customStyles.join(';');
					// classes
					markup[1] = cell.customClasses.join(' '); //(cell.customClasses ? ' ' + cell.customClasses : '');
					html.push(markup.join(''));
				}
				html.push('</tr>');
			}
			html.push('</table>');
			return html.join('');
		},

		// event helpers
		getCellX: function(e){
			var x = e.layerX;
			if(dojo.isMoz){
				var n = ascendDom(e.target, makeNotTagName("th"));
				x -= (n && n.offsetLeft) || 0;
				var t = e.sourceView.getScrollbarWidth();
				if(!dojo._isBodyLtr() && e.sourceView.headerNode.scrollLeft < t)
					x -= t;
				//x -= getProp(ascendDom(e.target, mkNotTagName("td")), "offsetLeft") || 0;
			}
			var n = ascendDom(e.target, function(){
				if(!n || n == e.cellNode){
					return false;
				}
				// Mozilla 1.8 (FF 1.5) has a bug that makes offsetLeft = -parent border width
				// when parent has border, overflow: hidden, and is positioned
				// handle this problem here ... not a general solution!
				x += (n.offsetLeft < 0 ? 0 : n.offsetLeft);
				return true;
			});
			return x;
		},

		// event decoration
		decorateEvent: function(e){
			this.baseDecorateEvent(e);
			e.rowIndex = -1;
			e.cellX = this.getCellX(e);
			return true;
		},

		// event handlers
		// resizing
		prepareResize: function(e, mod){
			var i = getTdIndex(e.cellNode);
			e.cellNode = (i ? e.cellNode.parentNode.cells[i+mod] : null);
			e.cellIndex = (e.cellNode ? this.getCellNodeIndex(e.cellNode) : -1);
			return Boolean(e.cellNode);
		},

		canResize: function(e){
			if(!e.cellNode || e.cellNode.colSpan > 1){
				return false;
			}
			var cell = this.grid.getCell(e.cellIndex); 
			return !cell.noresize && !cell.canResize();
		},

		overLeftResizeArea: function(e){
			if(dojo._isBodyLtr()){
				return (e.cellIndex>0) && (e.cellX < this.overResizeWidth) && this.prepareResize(e, -1);
			}
			var t = e.cellNode && (e.cellX < this.overResizeWidth);
			return t;
		},

		overRightResizeArea: function(e){
			if(dojo._isBodyLtr()){
				return e.cellNode && (e.cellX >= e.cellNode.offsetWidth - this.overResizeWidth);
			}
			return (e.cellIndex>0) && (e.cellX >= e.cellNode.offsetWidth - this.overResizeWidth) && this.prepareResize(e, -1);
		},

		domousemove: function(e){
			//console.log(e.cellIndex, e.cellX, e.cellNode.offsetWidth);
			var c = (this.overRightResizeArea(e) ? 'e-resize' : (this.overLeftResizeArea(e) ? 'w-resize' : ''));
			if(c && !this.canResize(e)){
				c = 'not-allowed';
			}
			e.sourceView.headerNode.style.cursor = c || ''; //'default';
			if (c)
				dojo.stopEvent(e);
		},

		domousedown: function(e){
			if(!dragInfo.dragging){
				if((this.overRightResizeArea(e) || this.overLeftResizeArea(e)) && this.canResize(e)){
					this.beginColumnResize(e);
				}else{
					this.grid.onMouseDown(e);
					this.grid.onMouseOverRow(e);
				}
				//else{
				//	this.beginMoveColumn(e);
				//}
			}
		},

		doclick: function(e) {
			if (new Date().getTime() < this.bogusClickTime) {
				dojo.stopEvent(e);
				return true;
			}
		},

		// column resizing
		beginColumnResize: function(e){
			dojo.stopEvent(e);
			var spanners = [], nodes = this.tableMap.findOverlappingNodes(e.cellNode);
			for(var i=0, cell; (cell=nodes[i]); i++){
				spanners.push({ node: cell, index: this.getCellNodeIndex(cell), width: cell.offsetWidth });
				//console.log("spanner: " + this.getCellNodeIndex(cell));
			}
			var view = e.sourceView;
			var adj = dojo._isBodyLtr() ? 1 : -1;
			var views = e.grid.views.views;
			var followers = [];
			for(var i=view.idx+adj, cView; (cView=views[i]); i=i+adj){
				followers.push({ node: cView.headerNode, left: window.parseInt(cView.headerNode.style.left) });
			}
			var drag = {
				scrollLeft: e.sourceView.headerNode.scrollLeft,
				view: view,
				node: e.cellNode,
				index: e.cellIndex,
				w: dojo.contentBox(e.cellNode).w,
				vw: dojo.contentBox(view.headerNode).w,
				spanners: spanners,
				followers: followers
			};
			// Fix any percentage widths to be pixel values
			var hasPct = false;
			var cellNodes = dojo.query("th", view.headerContentNode);
			var fixedWidths = dojo.map(cellNodes, function(c){
				var w = c.style.width;
				if(w && w.slice(-1) == "%"){
					hasPct = true;
					return dojo.contentBox(c).w;
				}else if(w && w.slice(-2) == "px"){
					return window.parseInt(w, 10);
				}
				return -1;
			});
			if(hasPct){
				dojo.forEach(e.grid.layout.cells, function(cell, idx){
					view.setColWidth(idx, fixedWidths[idx]);
					cellNodes[idx].style.width = cell.unitWidth;
				});
			}
			//console.log(drag.index, drag.w);
			startDrag(e.cellNode, dojo.hitch(this, 'doResizeColumn', drag), dojo.hitch(this, 'endResizeColumn', drag), e);
		},

		doResizeColumn: function(inDrag, inEvent){
			var isLtr = dojo._isBodyLtr();
			if(isLtr){
				var w = inDrag.w + inEvent.deltaX;
				var vw = inDrag.vw + inEvent.deltaX;
			}else{
				var w = inDrag.w - inEvent.deltaX;
				var vw = inDrag.vw - inEvent.deltaX;
			}
			if(w >= this.minColWidth){
				for(var i=0, s, sw; (s=inDrag.spanners[i]); i++){
					if(isLtr){
						sw = s.width + inEvent.deltaX;
					}else{
						sw = s.width - inEvent.deltaX;
					}
					s.node.style.width = sw + 'px';
					inDrag.view.setColWidth(s.index, sw);
					//console.log('setColWidth', '#' + s.index, sw + 'px');
				}
				for(var i=0, f, fl; (f=inDrag.followers[i]); i++){
					if(isLtr){
						fl = f.left + inEvent.deltaX;
					}else{
						fl = f.left - inEvent.deltaX;
					}
					f.node.style.left = fl + 'px';
				}
				inDrag.node.style.width = w + 'px';
				inDrag.view.setColWidth(inDrag.index, w);
				inDrag.view.headerNode.style.width = vw + 'px';
				if(!isLtr){
					inDrag.view.headerNode.scrollLeft = (inDrag.scrollLeft - inEvent.deltaX);
				}
			}
			if(inDrag.view.flexCells && !inDrag.view.testFlexCells()){
				var t = findTable(inDrag.node);
				t && (t.style.width = '');
			}
		},

		endResizeColumn: function(inDrag){
			this.bogusClickTime = new Date().getTime() + 30;
			setTimeout(dojo.hitch(inDrag.view, "update"), 50);
		}
	});

	// Maps an html table into a structure parsable for information about cell row and col spanning.
	// Used by HeaderBuilder.
	var TableMap = function(rows){
		this.mapRows(rows);
	};
	dojo.extend(TableMap, {
		map: null,

		mapRows: function(inRows){
			// summary: Map table topography

			//console.log('mapRows');
			// # of rows
			var rowCount = inRows.length;
			if(!rowCount){
				return;
			}
			// map which columns and rows fill which cells
			this.map = [ ];
			for(var j=0, row; (row=inRows[j]); j++){
				this.map[j] = [];
			}
			for(var j=0, row; (row=inRows[j]); j++){
				for(var i=0, x=0, cell, colSpan, rowSpan; (cell=row[i]); i++){
					while (this.map[j][x]){x++};
					this.map[j][x] = { c: i, r: j };
					rowSpan = cell.rowSpan || 1;
					colSpan = cell.colSpan || 1;
					for(var y=0; y<rowSpan; y++){
						for(var s=0; s<colSpan; s++){
							this.map[j+y][x+s] = this.map[j][x];
						}
					}
					x += colSpan;
				}
			}
			//this.dumMap();
		},

		dumpMap: function(){
			for(var j=0, row, h=''; (row=this.map[j]); j++,h=''){
				for(var i=0, cell; (cell=row[i]); i++){
					h += cell.r + ',' + cell.c + '   ';
				}
				console.log(h);
			}
		},

		getMapCoords: function(inRow, inCol){
			// summary: Find node's map coords by it's structure coords
			for(var j=0, row; (row=this.map[j]); j++){
				for(var i=0, cell; (cell=row[i]); i++){
					if(cell.c==inCol && cell.r == inRow){
						return { j: j, i: i };
					}
					//else{console.log(inRow, inCol, ' : ', i, j, " : ", cell.r, cell.c); };
				}
			}
			return { j: -1, i: -1 };
		},
		
		getNode: function(inTable, inRow, inCol){
			// summary: Find a node in inNode's table with the given structure coords
			var row = inTable && inTable.rows[inRow];
			return row && row.cells[inCol];
		},
		
		_findOverlappingNodes: function(inTable, inRow, inCol){
			var nodes = [];
			var m = this.getMapCoords(inRow, inCol);
			//console.log("node j: %d, i: %d", m.j, m.i);
			var row = this.map[m.j];
			for(var j=0, row; (row=this.map[j]); j++){
				if(j == m.j){ continue; }
				var rw = row[m.i];
				//console.log("overlaps: r: %d, c: %d", rw.r, rw.c);
				var n = this.getNode(inTable, rw.r, rw.c);
				if(n){ nodes.push(n); }
			}
			//console.log(nodes);
			return nodes;
		},
		
		findOverlappingNodes: function(inNode){
			return this._findOverlappingNodes(findTable(inNode), getTrIndex(inNode.parentNode), getTdIndex(inNode));
		}
	});


	// public
	dojo.declare('dojox.grid._View', [dijit._Widget, dijit._Templated], {
		// summary:
		//		A collection of grid columns. A grid is comprised of a set of views that stack horizontally.
		//		Grid creates views automatically based on grid's layout structure.
		//		Users should typically not need to access individual views directly.
		//
		// defaultWidth: String
		//		Default widget of the view
		defaultWidth: "18em",

		// viewWidth: String
		// 		Width for the view, in valid css unit
		viewWidth: "",

		templatePath: dojo.moduleUrl("dojox.grid","resources/View.html"),
		
		themeable: false,
		classTag: 'dojoxGrid',
		marginBottom: 0,
		rowPad: 2,

		postMixInProperties: function(){
			this.rowNodes = [];
		},

		postCreate: function(){
			this.connect(this.scrollboxNode,"onscroll","doscroll");
			dojox.grid.util.funnelEvents(this.contentNode, this, "doContentEvent", [ 'mouseover', 'mouseout', 'click', 'dblclick', 'contextmenu', 'mousedown' ]);
			dojox.grid.util.funnelEvents(this.headerNode, this, "doHeaderEvent", [ 'dblclick', 'mouseover', 'mouseout', 'mousemove', 'mousedown', 'click', 'contextmenu' ]);
			this.content = new ContentBuilder(this);
			this.header = new HeaderBuilder(this);
			//BiDi: in RTL case, style width='9000em' causes scrolling problem in head node
			if(!dojo._isBodyLtr()){
				this.headerNodeContainer.style.width = "";
			}
		},

		destroy: function(){
			dojox.grid.util.removeNode(this.headerNode);
			this.inherited("destroy", arguments);
		},

		// focus 
		focus: function(){
			if(dojo.isSafari || dojo.isOpera){
				this.hiddenFocusNode.focus();
			}else{
				this.scrollboxNode.focus();
			}
		},

		setStructure: function(inStructure){
			var vs = this.structure = inStructure;
			// FIXME: similar logic is duplicated in layout
			if(vs.width && !isNaN(vs.width)){
				this.viewWidth = vs.width + 'em';
			}else{
				this.viewWidth = vs.width || this.viewWidth; //|| this.defaultWidth;
			}
			this.onBeforeRow = vs.onBeforeRow;
			this.noscroll = vs.noscroll;
			if(this.noscroll){
				this.scrollboxNode.style.overflow = "hidden";
			}
			// bookkeeping
			this.testFlexCells();
			// accomodate new structure
			this.updateStructure();
		},

		testFlexCells: function(){
			// FIXME: cheater, this function does double duty as initializer and tester
			this.flexCells = false;
			for(var j=0, row; (row=this.structure.rows[j]); j++){
				for(var i=0, cell; (cell=row[i]); i++){
					cell.view = this;
					this.flexCells = this.flexCells || cell.isFlex();
				}
			}
			return this.flexCells;
		},

		updateStructure: function(){
			// header builder needs to update table map
			this.header.update();
			// content builder needs to update markup cache
			this.content.update();
		},

		getScrollbarWidth: function(){
			return (this.noscroll ? 0 : dojox.html.metrics.getScrollbar().w); // Integer
		},

		getColumnsWidth: function(){
			return this.headerContentNode.firstChild.offsetWidth; // Integer
		},

		getWidth: function(){
			return this.viewWidth || (this.getColumnsWidth()+this.getScrollbarWidth()) +'px'; // String
		},

		getContentWidth: function(){
			return Math.max(0, dojo._getContentBox(this.domNode).w - this.getScrollbarWidth()) + 'px'; // String
		},

		render: function(){
			this.scrollboxNode.style.height = '';
			this.renderHeader();
		},

		renderHeader: function(){
			this.headerContentNode.innerHTML = this.header.generateHtml(this._getHeaderContent);
		},

		// note: not called in 'view' context
		_getHeaderContent: function(inCell){
			var n = inCell.name || inCell.grid.getCellName(inCell);
			if(inCell.index != inCell.grid.getSortIndex()){
				return n;
			}
			return [ '<div class="', inCell.grid.sortInfo > 0 ? 'dojoxGrid-sort-down' : 'dojoxGrid-sort-up', '"><div class="gridArrowButtonChar">', inCell.grid.sortInfo > 0 ? '&#9660;' : '&#9650;', '</div>', n, '</div>' ].join('');
		},

		resize: function(){
			this.adaptHeight();
			this.adaptWidth();
		},

		hasScrollbar: function(){
			return (this.scrollboxNode.clientHeight != this.scrollboxNode.offsetHeight); // Boolean
		},

		adaptHeight: function(){
			if(!this.grid.autoHeight){
				var h = this.domNode.clientHeight;
				if(!this.hasScrollbar()){ // no scrollbar is rendered
					h -= dojox.html.metrics.getScrollbar().w;
				}
				dojox.grid.util.setStyleHeightPx(this.scrollboxNode, h);
			}
		},

		adaptWidth: function(){
			if(this.flexCells){
				// the view content width
				this.contentWidth = this.getContentWidth();
				this.headerContentNode.firstChild.style.width = this.contentWidth;
			}
			// FIXME: it should be easier to get w from this.scrollboxNode.clientWidth, 
			// but clientWidth seemingly does not include scrollbar width in some cases
			var w = this.scrollboxNode.offsetWidth - this.getScrollbarWidth();
			w = Math.max(w, this.getColumnsWidth()) + 'px';

			var cn = this.contentNode;
			cn.style.width = '';
			cn.offsetWidth;
			cn.style.width = w;
		},

		setSize: function(w, h){
			var ds = this.domNode.style;
			var hs = this.headerNode.style;

			if(w){
				ds.width = w;
				hs.width = w;
			}
			ds.height = (h >= 0 ? h + 'px' : '');
		},

		renderRow: function(inRowIndex, inHeightPx){
			var rowNode = this.createRowNode(inRowIndex);
			this.buildRow(inRowIndex, rowNode, inHeightPx);
			this.grid.edit.restore(this, inRowIndex);
			return rowNode;
		},

		createRowNode: function(inRowIndex){
			var node = document.createElement("div");
			node.className = this.classTag + '-row';
			node[gridViewTag] = this.id;
			node[rowIndexTag] = inRowIndex;
			this.rowNodes[inRowIndex] = node;
			return node;
		},

		buildRow: function(inRowIndex, inRowNode){
			this.buildRowContent(inRowIndex, inRowNode);
			this.styleRow(inRowIndex, inRowNode);
		},

		buildRowContent: function(inRowIndex, inRowNode){
			inRowNode.innerHTML = this.content.generateHtml(inRowIndex, inRowIndex); 
			if(this.flexCells){
				// FIXME: accessing firstChild here breaks encapsulation
				inRowNode.firstChild.style.width = this.contentWidth;
			}
		},

		rowRemoved:function(inRowIndex){
			this.grid.edit.save(this, inRowIndex);
			delete this.rowNodes[inRowIndex];
		},

		getRowNode: function(inRowIndex){
			return this.rowNodes[inRowIndex];
		},

		getCellNode: function(inRowIndex, inCellIndex){
			var row = this.getRowNode(inRowIndex);
			if(row){
				return this.content.getCellNode(row, inCellIndex);
			}
		},

		// styling
		styleRow: function(inRowIndex, inRowNode){
			inRowNode._style = getStyleText(inRowNode);
			this.styleRowNode(inRowIndex, inRowNode);
		},

		styleRowNode: function(inRowIndex, inRowNode){
			if(inRowNode){
				this.doStyleRowNode(inRowIndex, inRowNode);
			}
		},

		doStyleRowNode: function(inRowIndex, inRowNode){
			this.grid.styleRowNode(inRowIndex, inRowNode);
		},

		// updating
		updateRow: function(inRowIndex, inHeightPx, inPageNode){
			var rowNode = this.getRowNode(inRowIndex);
			if(rowNode){
				rowNode.style.height = '';
				this.buildRow(inRowIndex, rowNode);
			}
			return rowNode;
		},

		updateRowStyles: function(inRowIndex){
			this.styleRowNode(inRowIndex, this.getRowNode(inRowIndex));
		},

		// scrolling
		lastTop: 0,
		firstScroll:0,

		doscroll: function(inEvent){
			//var s = dojo.marginBox(this.headerContentNode.firstChild);
			var isLtr = dojo._isBodyLtr();
			if(this.firstScroll < 2){
				if((!isLtr && this.firstScroll == 1) || (isLtr && this.firstScroll == 0)){
					var s = dojo.marginBox(this.headerNodeContainer);
					if(dojo.isIE){
						this.headerNodeContainer.style.width = s.w + this.getScrollbarWidth() + 'px';
					}else if(dojo.isMoz){
						//TODO currently only for FF, not sure for safari and opera
						this.headerNodeContainer.style.width = s.w - this.getScrollbarWidth() + 'px';
						//this.headerNodeContainer.style.width = s.w + 'px';
						//set scroll to right in FF
						if(!isLtr){
							this.scrollboxNode.scrollLeft = this.scrollboxNode.scrollWidth - this.scrollboxNode.clientWidth;
						}else{
							this.scrollboxNode.scrollLeft = this.scrollboxNode.clientWidth - this.scrollboxNode.scrollWidth;
						}
					}
				}
				this.firstScroll++;
			}
			this.headerNode.scrollLeft = this.scrollboxNode.scrollLeft;
			// 'lastTop' is a semaphore to prevent feedback-loop with setScrollTop below
			var top = this.scrollboxNode.scrollTop;
			if(top != this.lastTop){
				this.grid.scrollTo(top);
			}
		},

		setScrollTop: function(inTop){
			// 'lastTop' is a semaphore to prevent feedback-loop with doScroll above
			this.lastTop = inTop;
			this.scrollboxNode.scrollTop = inTop;
			return this.scrollboxNode.scrollTop;
		},

		// event handlers (direct from DOM)
		doContentEvent: function(e){
			if(this.content.decorateEvent(e)){
				this.grid.onContentEvent(e);
			}
		},

		doHeaderEvent: function(e){
			if(this.header.decorateEvent(e)){
				this.grid.onHeaderEvent(e);
			}
		},

		// event dispatch(from Grid)
		dispatchContentEvent: function(e){
			return this.content.dispatchEvent(e);
		},

		dispatchHeaderEvent: function(e){
			return this.header.dispatchEvent(e);
		},

		// column resizing
		setColWidth: function(inIndex, inWidth){
			this.grid.setCellWidth(inIndex, inWidth + 'px');
		},

		update: function(){
			var left = this.scrollboxNode.scrollLeft;
			this.content.update();
			this.grid.update();
			this.scrollboxNode.scrollLeft = left;
			this.headerNode.scrollLeft = left;
		}
	});
})();
