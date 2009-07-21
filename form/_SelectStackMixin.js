dojo.provide("dojox.form._SelectStackMixin");

dojo.declare("dojox.form._SelectStackMixin", null, {
	// summary:
	//		Mix this class in to a dijit.form._FormSelectWidget in order to 
	//		provide support for "selectable" multiforms.  The widget is pointed
	//		to a dijit.layout.StackContainer and will handle displaying and 
	//		submitting the values of only the appropriate pane.
	//
	//		The options for this widget will be automatically set - based on 
	//		the panes that are in the stack container.  The "title" attribute of
	//		the pane will be used for the display of the option.  The "id" attribute
	//		of the pane will be used as the value of the option.  In order to 
	//		avoid running into unique ID constraint issues, a stackPrefix mechanism
	//		is provided.

	// stackId: string
	//		The id of the stack that this widget is supposed to control
	stackId: "",
	
	// stackPrefix: string
	//		A prefix to remove from our stack pane ids when setting our options.
	//		This exists so that we won't run into unique ID constraints.  For 
	//		example, if stackPrefix is set to "foo_", and there are three panes
	//		in our stack with ids of "foo_a", "foo_b", and "foo_c", then the values
	//		of the options created for the stack controller widget will be "a",
	//		"b", and "c".  This allows you to have multiple select stack widgets
	//		with the same values - without having to have the panes require the
	//		same ids.
	stackPrefix: "",
	
	_paneIdFromOption: function(/*String*/ oVal){
		// summary: Gets the pane ID given an option value
		return (this.stackPrefix || "") + oVal; // String
	},
	
	_optionValFromPane: function(/*String*/ id){
		// summary: Gets the option value given a pane ID
		var sp = this.stackPrefix;
		if(sp && id.indexOf(sp) === 0){
			return id.substring(sp.length); // String
		}
		return id; // String
	},
	
	_togglePane: function(/*Widget*/ pane, /*Boolean*/ shown){
		// summary: called when a pane is either shown or hidden (so that
		//  we can toggle the widgets on it)
		
		if(pane._shown != undefined && pane._shown == shown){ return; }
		var widgets = dojo.filter(pane.getDescendants(), "return item.name;");
		if(!shown){
			// We are hiding - save the current state and then disable them
			savedStates = {};
			dojo.forEach(widgets, function(w){
				savedStates[w.id] = w.disabled;
				w.attr("disabled", true);
			});
			pane._savedStates = savedStates;
		}else{
			// We are showing - restore our saved states
			var savedStates = pane._savedStates||{};
			dojo.forEach(widgets, function(w){
				var state = savedStates[w.id];
				if(state == undefined){
					state = false;
				}
				w.attr("disabled", state);
			});
			delete pane._savedStates;
		}
		pane._shown = shown;
	},

	onAddChild: function(/*Widget*/ pane, /*Integer?*/ insertIndex){
		// summary: Called when the stack container adds a new pane
		if(!this._panes[pane.id]){
			this._panes[pane.id] = pane;
			this.addOption({value: this._optionValFromPane(pane.id), label: pane.title});
		}
		if(!pane.onShow || !pane.onHide || pane._shown == undefined){
			pane.onShow = dojo.hitch(this, "_togglePane", pane, true);
			pane.onHide = dojo.hitch(this, "_togglePane", pane, false);
			pane.onHide();
		}
	},
	
	_setValueAttr: function(v){
		if("_savedValue" in this){
			return;
		}
		this.inherited(arguments);
	},
	attr: function(/*String|Object*/name, /*Object?*/value){
		if(name == "value" && arguments.length == 2 && "_savedValue" in this){
			this._savedValue = value;
		}
		return this.inherited(arguments);
	},

	onRemoveChild: function(/*Widget*/ pane){
		// summary: Called when the stack container removes a pane
		if(this._panes[pane.id]){
			delete this._panes[pane.id];
			this.removeOption(this._optionValFromPane(pane.id));
		}
	},
	
	onSelectChild: function(/*Widget*/ pane){
		// summary: Called when the stack container selects a new pane
		this._setValueAttr(this._optionValFromPane(pane.id));
	},
	
	onStartup: function(/*Object*/ info){
		// summary: Called when the stack container is started up
		var selPane = info.selected;
		this.addOption(dojo.filter(dojo.map(info.children, function(c){
			var v = this._optionValFromPane(c.id);
			var toAdd = null;
			if(!this._panes[c.id]){
				this._panes[c.id] = c;
				toAdd = {value: v, label: c.title};
			}
			if(!c.onShow || !c.onHide || c._shown == undefined){
				c.onShow = dojo.hitch(this, "_togglePane", c, true);
				c.onHide = dojo.hitch(this, "_togglePane", c, false);
				c.onHide();
			}
			if("_savedValue" in this && v === this._savedValue){
				selPane = c;
			}
			return toAdd;
		}, this), function(i){ return i;}));
		var _this = this;
		var fx = function(){
			// This stuff needs to be run after we show our child, if
			// the stack is going to show a different child than is 
			// selected - see trac #9396
			delete _this._savedValue;
			_this.onSelectChild(selPane);
			if(!selPane._shown){
				_this._togglePane(selPane, true);
			}			
		};
		if(selPane !== info.selected){
			var stack = dijit.byId(this.stackId);
			var c = this.connect(stack, "_showChild", function(sel){
				this.disconnect(c);
				fx();
			});
		}else{
			fx();
		}
	},
	
	postMixInProperties: function(){
		this._savedValue = this.value;
		this.inherited(arguments);
		this.connect(this, "onChange", "_handleSelfOnChange");
	},
	
	postCreate: function(){
		this.inherited(arguments);
		this._panes = {};
		this._subscriptions = [
			dojo.subscribe(this.stackId + "-startup", this, "onStartup"),
			dojo.subscribe(this.stackId + "-addChild", this, "onAddChild"),
			dojo.subscribe(this.stackId + "-removeChild", this, "onRemoveChild"),
			dojo.subscribe(this.stackId + "-selectChild", this, "onSelectChild")
		];
		var stack = dijit.byId(this.stackId);
		if(stack && stack._started){
			// If we have a stack, and it's already started, call our onStartup now
			this.onStartup({children: stack.getChildren(), selected: stack.selectedChildWidget});
		}
	},
	
	destroy: function(){
		dojo.forEach(this._subscriptions, dojo.unsubscribe);
		delete this._panes; // Fixes memory leak in IE
		this.inherited("destroy", arguments);
	},
	
	_handleSelfOnChange: function(/*String*/ val){
		// summary: Called when form select widget's value has changed
		var pane = this._panes[this._paneIdFromOption(val)];
		if (pane){
			dijit.byId(this.stackId).selectChild(pane);
		}
	}
});
