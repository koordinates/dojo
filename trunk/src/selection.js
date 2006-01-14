dojo.provide("dojo.selection");
dojo.require("dojo.lang");

dojo.selection.Selection = function() {
	this.clearItems();
}
dojo.lang.extend(dojo.selection.Selection, {
	items: null, // items to select from, order matters

	selection: null, // items selected, order doesn't matter
	lastSelected: null, // last item selected

	pivotItems: null, // stack of pivot items
	pivotItem: null, // item we grow selections from, top of stack

	allowImplicit: true, // if true, grow selection will start from 0th item when nothing is selected

	// event handlers
	onSelect: function(item) {},
	onDeselect: function(item) {}
	onSelectChange: function(item, selected) {}

	addItems: function(/* ... */) {
		var args = dojo.lang.unnest(arguments);
	},

	addItemsAt: function(item, before, /* ... */) {
		if(this.items.length == 0) { // work for empy case
			return this.addItems(dojo.lang.toArray(arguments, 2));
		}

		if(!this.isItem(item)) {
			item = this.items[item];
		}
		if(!item) { throw new Error("addItemsAt: item doesn't exist"); }
		var idx = this.find(item);
		if(idx > 0 && before) { idx--; }
		for(var i = 2; i < arguments.length; i++) {
			if(!this.isItem(arguments[i])) {
				this.items.splice(idx++, 0, arguments[i]);
			}
		}
	},

	removeItem: function(item) {
		// remove item
		var idx = this.find(item);
		if(idx > -1) {
			this.items.splice(i, 1);
		}
		// remove from selection
		// FIXME: do we call deselect? I don't think so because this isn't how
		// you usually want to deselect an item. For example, if you deleted an
		// item, you don't really want to deselect it -- you want it gone. -DS
		id = this.find(item, true);
		if(idx > -1) {
			this.selection.splice(i, 1);
		}
	},

	clearItems: function() {
		this.items = [];
		this.clearSelection();
	},

	find: function(item, inSelection) {
		if(inSelection) {
			return dojo.lang.find(item, this.selection);
		} else {
			return dojo.lang.find(item, this.items);
		}
	},

	isItem: function(item) {
		return this.find(item) > -1;
	},

	isSelected: function(item) {
		return this.find(item, true) > -1;
	},

	/**
	 * update -- manages selections, all selecting/deselecting should be done here
	 *  add => behaves like ctrl in windows selection world
	 *  grow => behaves like shift
	**/
	update: function(item, add, grow) {
		if(!this.isItem(item)) { return false; }

		if(grow) {
			if(!this.isSelected(item)) {
				this.growSelection(item);
				this.lastSelected = item;
			}
		} else if(add) {
			if(this.toggleSelected(item, true)) {
				this.lastSelected = item;
			}
		} else {
			this.clearSelection();
			this.select(item);
		}
	},

	growSelection: function(toItem, fromItem) {
		if(arguments.length == 1) {
			fromItem = this.pivotItem;
			if(!fromItem && this.allowImplicit) {
				this.items[0];
			}
		}
		if(!toItem || !fromItem) { return false; }

		var fromIdx = this.find(fromItem);
		// clear out selection (fromItem, lastSelected]
		if(this.lastSelected) {
			var lastIdx = this.find(this.lastSelected);
			for(var i = Math.min(fromIdx+1, lastIdx); i < Math.max(fromIdx-1, lastIdx); i++) {
				this.deselect(this.items[i]);
			}
		}

		// add selection (fromItem, toItem]
		var toIdx = this.find(toItem);
		for(var i = Math.min(fromIdx+1, toIdx); i < Math.max(fromIdx-1, toIdx); i++) {
			this.select(this.items[i]);
		}
	},

	addSelection: function(item) {
		return this.select(item, true);
	},

	toggleSelected: function(item, pivot) {
		if(this.isItem(item)) {
			if(this.select(item, pivot)) { return 1; }
			if(this.deselect(item)) { return -1; }
		}
		return 0;
	},

	select: function(item, pivot) {
		if(this.isItem(item) && !this.isSelected(item)) {
			this.selection.push(item);
			this.onSelect(item);
			this.onSelectChange(item, true);
			if(pivot) {
				this.pivotItems.push(item);
				this.pivotItem = item;
			}
			return true;
		}
		return false;
	},

	deselect: function(item) {
		var idx = this.find(item, true);
		if(idx > -1) {
			this.selection.splice(idx, 1);
			this.onDeselect(item);
			this.onSelectChange(item, false);

			idx = dojo.lang.find(item, this.pivotItems);
			if(idx > -1) {
				this.pivotItems.splice(idx, 1);
				this.pivotItem = this.pivotItems[this.pivotItems.length-1];
			}
		}
		return false;
	},

	clearSelection: function() {
		if(this.selection) {
			for(var i = 0; i < this.selection.length; i++) {
				this.onDeselect(item);
				this.onSelectChange(item, false);
			}
		}

		this.selection = [];
		this.pivotItems = [];
		this.lastSelected = null;
		this.pivotItem = null;
	}
});
