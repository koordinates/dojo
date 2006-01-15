dojo.provide("dojo.selection");
dojo.require("dojo.lang");
dojo.require("dojo.math");

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

	length: 0,

	// event handlers
	onSelect: function(item) {},
	onDeselect: function(item) {},
	onSelectChange: function(item, selected) {},

	find: function(item, inSelection) {
		if(inSelection) {
			return dojo.lang.find(item, this.selection);
		} else {
			return dojo.lang.find(item, this.items);
		}
	},

	isSelectable: function(item) {
		// user-customizable, will filter items through this
		return true;
	},

	setItems: function(/* ... */) {
		this.clearItems();
		this.addItems.call(this, arguments);
	},

	// this is in case you have an active collection array-like object
	// (i.e. getElementsByTagName collection) that manages its own order
	// and item list
	setItemsCollection: function(collection) {
		this.items = collection;
	},

	addItems: function(/* ... */) {
		var args = dojo.lang.unnest(arguments);
		for(var i = 0; i < args.length; i++) {
			this.items.push(args[i]);
		}
	},

	addItemsAt: function(item, before /* ... */) {
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
		this.clear();
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
				this.grow(item);
				this.lastSelected = item;
			}
		} else if(add) {
			if(this.toggleSelected(item)) {
				this.lastSelected = item;
			}
		} else {
			this.clear();
			this.select(item);
		}

		this.length = this.selection.length;
	},

	grow: function(toItem, fromItem) {
		if(arguments.length == 1) {
			fromItem = this.pivotItem;
			if(!fromItem && this.allowImplicit) {
				fromItem = this.items[0];
			}
		}
		if(!toItem || !fromItem) { return false; }

		var fromIdx = this.find(fromItem);

		// get items to deselect (fromItem, lastSelected]
		var toDeselect = [];
		var lastIdx = -1;
		if(this.lastSelected) {
			lastIdx = this.find(this.lastSelected);
			var step = fromIdx < lastIdx ? -1 : 1;
			var range = dojo.math.range(lastIdx, fromIdx, step);
			for(var i = 0; i < range.length; i++) {
				toDeselect[range[i]] = true;
			}
		}

		// add selection (fromItem, toItem]
		var toIdx = this.find(toItem);
		var step = fromIdx < toIdx ? -1 : 1;
		var shrink = lastIdx >= 0 && step == 1 ? lastIdx < toIdx : lastIdx > toIdx;
		var range = dojo.math.range(toIdx, fromIdx, step);
		if(range.length) {
			for(var i = range.length-1; i >= 0; i--) {
				var item = this.items[range[i]];
				if(this.growFilter(item, this.selection)) {
					if(this.select(item, true) || shrink) {
						this.lastSelected = item;
					}
					if(range[i] in toDeselect) {
						delete toDeselect[range[i]];
					}
				}
			}
		} else {
			this.lastSelected = fromItem;
		}

		// now deselect...
		for(var i in toDeselect) {
			if(this.items[i] == this.lastSelected) {
				dbg("oops!");
			}
			this.deselect(this.items[i]);
		}
	},

	// this will be called when trying to figure out if you can
	// grow the selection to growItem
	growFilter: function(growItem, selection) {
		return true;
	},

	growUp: function() {
		var idx = this.find(this.lastSelected) - 1;
		while(idx >= 0) {
			if(this.growFilter(this.items[idx], this.selection)) {
				this.grow(this.items[idx]);
				return;
			}
			idx--;
		}
		//this.grow(this.items[this.find(this.lastSelected)-1]);
	},

	growDown: function() {
		var idx = this.find(this.lastSelected);
		// FIXME: do we need to select(this.items[0]) in this case?
		if(idx < 0 && this.allowImplicit) {
			idx = 0;
		}
		idx++;
		while(idx > 0 && idx < this.items.length) {
			if(this.growFilter(this.items[idx], this.selection)) {
				this.grow(this.items[idx]);
				return;
			}
			idx++;
		}
		//this.grow(this.items[this.find(last)+1]);
	},

	add: function(item) {
		return this.select(item);
	},

	toggleSelected: function(item, noPivot) {
		if(this.isItem(item)) {
			if(this.select(item, noPivot)) { return 1; }
			if(this.deselect(item)) { return -1; }
		}
		return 0;
	},

	select: function(item, noPivot) {
		if(this.isItem(item) && !this.isSelected(item)
			&& this.isSelectable(item)) {
			this.selection.push(item);
			this.lastSelected = item;
			this.onSelect(item);
			this.onSelectChange(item, true);
			if(!noPivot) {
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

			return true;
		}
		return false;
	},

	selectAll: function() {
		for(var i = 0; i < this.items.length; i++) {
			this.select(this.items[i]);
		}
	},

	deselectAll: function() {
		while(this.selection.length) {
			this.deselect(this.selection[0]);
		}
	},

	selectNext: function() {
		var idx = this.find(this.lastSelected);
		while(idx > -1 && ++idx < this.items.length) {
			if(this.isSelectable(this.items[idx])) {
				this.deselectAll();
				this.select(this.items[idx]);
				return true;
			}
		}
		return false;
	},

	selectPrevious: function() {
		//debugger;
		var idx = this.find(this.lastSelected);
		while(idx-- > 0) {
			if(this.isSelectable(this.items[idx])) {
				this.deselectAll();
				this.select(this.items[idx]);
				return true;
			}
		}
		return false;
	},

	selectFirst: function() {
		return this.select(this.items[0]);
	},

	selectLast: function() {
		return this.select(this.items[this.items.length-1]);
	},

	sorted: function() {
		return dojo.lang.toArray(this.selection).sort(
			dojo.lang.hitch(this, function(a, b) {
				var A = this.find(a), B = this.find(b);
				if(A > B) {
					return 1;
				} else if(A < B) {
					return -1;
				} else {
					return 0;
				}
			})
		);
	},

	// remove any items from the selection that are no longer in this.items
	updateSelected: function() {
		for(var i = 0; i < this.selection.length; i++) {
			if(this.find(this.selection[i]) < 0) {
				var removed = this.selection.splice(i, 1);

				var idx = dojo.lang.find(removed[0], this.pivotItems);
				if(idx > -1) {
					this.pivotItems.splice(idx, 1);
					this.pivotItem = this.pivotItems[this.pivotItems.length-1];
				}
			}
		}
	},

	clear: function() {
		if(this.selection) {
			for(var i = 0; i < this.selection.length; i++) {
				this.onDeselect(this.selection[i]);
				this.onSelectChange(this.selection[i], false);
			}
		}

		this.selection = [];
		this.pivotItems = [];
		this.lastSelected = null;
		this.pivotItem = null;
	}
});
