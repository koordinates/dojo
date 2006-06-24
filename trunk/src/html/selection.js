dojo.require("dojo.html");
dojo.provide("dojo.html.selection");

/**
 * additional selection manipulation functions
 */
 
 /**
  * type of selection
 **/
dojo.html.selectionType = { 
	NONE : 0, 
	TEXT : 1, 
	CONTROL : 2 
};

dojo.lang.mixin(dojo.html.selection, {
	getType : function() {
		// summary: Get the selection type (like document.select.type in IE).
		if(dojo.doc().selection){ //IE
		
			return dojo.html.selectionType[dojo.doc().selection.type.toUpperCase()];
		}else{
			var stype = dojo.html.selectionType.TEXT;
	
			// Check if the actual selection is a CONTROL (IMG, TABLE, HR, etc...).
			var oSel;
			try {oSel = dojo.global().getSelection();}
			catch (e) {}
			
			if(oSel && oSel.rangeCount==1){
				var oRange = oSel.getRangeAt(0);
				if (oRange.startContainer == oRange.endContainer && (oRange.endOffset - oRange.startOffset) == 1
					&& oRange.startContainer.nodeType != dojo.dom.TEXT_NODE) {
					stype = dojo.html.selectionType.CONTROL;
				}
			}
			return stype;
		}
	},
	getSelectedElement : function() {
		// summary: 
		//		Retrieves the selected element (if any), just in the case that a single
		//		element (object like and image or a table) is selected.
		if ( dojo.html.selection.getType() == dojo.html.selectionType.CONTROL ){
			if(dojo.doc().selection){ //IE
				var oRange = dojo.doc().selection.createRange();
		
				if ( oRange && oRange.item ){
					return dojo.doc().selection.createRange().item(0);
				}
			}else{
				var oSel = dojo.global().getSelection();
				return oSel.anchorNode.childNodes[ oSel.anchorOffset ];
			}
		}
	},
	getParentElement : function() {
		// summary: 
		//		Get the parent element of the current selection
		if ( dojo.html.selection.getType() == dojo.html.selectionType.CONTROL ){
			var p = dojo.html.selection.getSelectedElement();
			if(p){ return p.parentNode; }
		}else{
			if(dojo.doc().selection){ //IE
				return dojo.doc().selection.createRange().parentElement();
			}else{
				var oSel = dojo.global().getSelection();
				if ( oSel ){
					var oNode = oSel.anchorNode;
		
					while ( oNode && oNode.nodeType != 1 ){
						oNode = oNode.parentNode;
					}
		
					return oNode;
				}
			}
		}
	},
	selectNode : function(node) {
		// summary: clear previous selection and select node
		dojo.html.selectElement(node);
	},
	collapse : function() {
		// summary: clear selection
		dojo.html.clearSelection();
	},
	remove : function() {
		// summary: delete selection
		if(dojo.doc().selection) { //IE
			var oSel = dojo.doc().selection;

			if ( oSel.type.toUpperCase() != "NONE" ){
				oSel.clear();
			}
		
			return oSel;
		}else{
			var oSel = dojo.global().getSelection();

			for ( var i = 0; i < oSel.rangeCount; i++ ){
				oSel.getRangeAt(i).deleteContents();
			}
		
			return oSel;
		}
	}
});
