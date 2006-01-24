dojo.provide("dojo.undo.Manager");
dojo.require("dojo.lang");

dojo.undo.Manager = function(parent) {
	this.clear();
	this._parent = parent;
};
dojo.lang.extend(dojo.undo.Manager, {
	_parent: null,
	_undoStack: null,
	_redoStack: null,
	_currentManager: null,

	canUndo: false,
	canRedo: false,

	isUndoing: false,
	isRedoing: false,

	// events which you can use to munge the item to be
	// undone/redone, usually you just use it for notification though
	onUndo: function(top) {},
	onRedo: function(top) {},

	_updateStatus: function() {
		this.canUndo = this._undoStack.length > 0;
		this.canRedo = this._redoStack.length > 0;
	},

	clear: function() {
		this._undoStack = [];
		this._redoStack = [];
		this._currentManager = this;
		this.canUndo = false;
		this.canRedo = false;
		this.isUndoing = false;
		this.isRedoing = false;
	},

	undo: function() {
		if(!this.canUndo) { return false; }

		this.isUndoing = true;
		this.onUndo(top);
		var top = this._undoStack.pop();
		if(top instanceof this.constructor) {
			top.undoAll();
		} else {
			top.undo();
		}
		if(top.redo) {
			this._redoStack.push(top);
		}
		this.isUndoing = false;

		this._updateStatus();
		return true;
	},

	redo: function() {
		if(!this.canRedo) { return false; }

		this.isRedoing = true;
		var top = this._redoStack.pop();
		this.onRedo(top);
		if(top instanceof this.constructor) {
			top.redoAll();
		} else {
			top.redo();
		}
		this._undoStack.push(top);
		this.isRedoing = false;

		this._updateStatus();
		return true;
	},

	undoAll: function() {
		while(this._undoStack.length > 0) {
			this.undo();
		}
	},

	redoAll: function() {
		while(this._redoStack.length > 0) {
			this.redo();
		}
	},

	push: function(undo, redo /* optional */) {
		if(this._currentManager == this) {
			this._undoStack.push({
				undo: undo,
				redo: redo
			});
		} else {
			this._currentManager.push.apply(this._currentManager, arguments);
		}
		this._updateStatus();
	},

	beginTransaction: function() {
		if(this._currentManager == this) {
			var mgr = new dojo.undo.Manager(this);
			this._undoStack.push(mgr);
			this._currentManager = mgr;
		} else {
			this._currentManager.beginTransaction.apply(this._currentManager, arguments);
		}
	},

	endTransaction: function() {
		if(this._currentManager == this) {
			if(this._parent) {
				this._parent._currentManager = this._parent;
				this._parent.endTransaction.apply(this._parent, arguments);
			}
		} else {
			this._currentManager.endTransaction.apply(this._currentManager, arguments);
		}
	}
});
