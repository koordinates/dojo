dojo.provide("dojox.grid._RowSelector");
dojo.require("dojox.grid._View");

dojo.declare('dojox.grid._RowSelector', dojox.grid._View, {
	// summary:
	//	Custom grid view. If used in a grid structure, provides a small selectable region for grid rows.
	defaultWidth: "3em",
	noscroll: true,
	padBorderWidth: 2,
	buildRendering: function(){
		this.inherited('buildRendering', arguments);
		this.scrollboxNode.style.overflow = "hidden";
		this.headerNode.style.visibility = "hidden";
	},	
	getWidth: function(){
		return this.viewWidth || this.defaultWidth;
	},
	buildRowContent: function(inRowIndex, inRowNode){
		var w = this.contentNode.offsetWidth - this.padBorderWidth 
		inRowNode.innerHTML = '<table class="dojoxGrid-rowbar-table" style="width:' + w + 'px;" border="0" cellspacing="0" cellpadding="0" role="wairole:presentation"><tr><td class="dojoxGrid-rowbar-inner">&nbsp;</td></tr></table>';
	},
	renderHeader: function(){
	},
	resize: function(){
		this.adaptHeight();
	},
	adaptWidth: function(){
	},
	// styling
	doStyleRowNode: function(inRowIndex, inRowNode){
		var n = [ "dojoxGrid-rowbar" ];
		if(this.grid.rows.isOver(inRowIndex)){
			n.push("dojoxGrid-rowbar-over");
		}
		if(this.grid.selection.isSelected(inRowIndex)){
			n.push("dojoxGrid-rowbar-selected");
		}
		inRowNode.className = n.join(" ");
	},
	// event handlers
	domouseover: function(e){
		this.grid.onMouseOverRow(e);
	},
	domouseout: function(e){
		if(!this.isIntraRowEvent(e)){
			this.grid.onMouseOutRow(e);
		}
	}
});
