dojo.provide("dojo.webui.widgets.ToolbarContainer");
dojo.provide("dojo.webui.widgets.HTMLToolbarContainer");
dojo.provide("dojo.webui.widgets.Toolbar");
dojo.provide("dojo.webui.widgets.HTMLToolbar");
dojo.provide("dojo.webui.widgets.ToolbarItem");
dojo.provide("dojo.webui.widgets.HTMLToolbarButtonGroup");
dojo.provide("dojo.webui.widgets.HTMLToolbarButton");
dojo.provide("dojo.webui.widgets.HTMLToolbarDialog");
dojo.provide("dojo.webui.widgets.HTMLToolbarMenu");
dojo.provide("dojo.webui.widgets.HTMLToolbarSeparator");
dojo.provide("dojo.webui.widgets.HTMLToolbarSpace");
dojo.provide("dojo.webui.Icon");

dojo.require("dojo.webui.*");

/* ToolbarContainer
 *******************/
dojo.webui.widgets.HTMLToolbarContainer = function() {
	dojo.webui.HtmlWidget.call(this);

	this.widgetType = "ToolbarContainer";
	this.isContainer = true;

	this.templateString = '<div class="toolbarContainer" dojoAttachPoint="containerNode"></div>';
	this.templateCssPath = dojo.uri.dojoUri("src/webui/widgets/templates/HtmlToolbar.css");

	this.getItem = function(name) {
		if(name instanceof dojo.webui.widgets.ToolbarItem) { return name; }
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.HTMLToolbar) {
				var item = child.getItem(name);
				if(item) { return item; }
			}
		}
		return null;
	}

	this.getItems = function() {
		var items = [];
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.HTMLToolbar) {
				items = items.concat(child.getItems());
			}
		}
		return items;
	}

	this.enable = function() {
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.HTMLToolbar) {
				child.enable.apply(child, arguments);
			}
		}
	}

	this.disable = function() {
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.HTMLToolbar) {
				child.disable.apply(child, arguments);
			}
		}
	}

	this.select = function(name) {
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.HTMLToolbar) {
				child.select(arguments);
			}
		}
	}

	this.deselect = function(name) {
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.HTMLToolbar) {
				child.deselect(arguments);
			}
		}
	}

	this.getItemsState = function() {
		var values = {};
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.HTMLToolbar) {
				dojo.lang.mixin(values, child.getItemsState());
			}
		}
		return values;
	}

	this.getItemsActiveState = function() {
		var values = {};
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.HTMLToolbar) {
				dojo.lang.mixin(values, child.getItemsActiveState());
			}
		}
		return values;
	}

	this.getItemsSelectedState = function() {
		var values = {};
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.HTMLToolbar) {
				dojo.lang.mixin(values, child.getItemsSelectedState());
			}
		}
		return values;
	}
}
dj_inherits(dojo.webui.widgets.HTMLToolbarContainer, dojo.webui.HtmlWidget);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarContainer");

/* Toolbar
 **********/
dojo.webui.widgets.HTMLToolbar = function() {
	dojo.webui.HtmlWidget.call(this);

	this.widgetType = "Toolbar";
	this.isContainer = true;

	this.templateString = '<div class="toolbar" dojoAttachPoint="containerNode"></div>';

	var oldAddChild = this.addChild;
	var ddd=0;
	this.addChild = function(item, pos, props) {
		var widget = dojo.webui.widgets.ToolbarItem.make(item, null, props);
		var ret = oldAddChild.call(this, widget, null, pos, null);
		return ret;
	}

	this.push = function() {
		for(var i = 0; i < arguments.length; i++) {
			this.addChild(arguments[i]);
		}
	}

	this.getItem = function(name) {
		if(name instanceof dojo.webui.widgets.ToolbarItem) { return name; }
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.ToolbarItem
				&& child._name == name) { return child; }
		}
		return null;
	}

	this.getItems = function() {
		var items = [];
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.ToolbarItem) {
				items.push(child);
			}
		}
		return items;
	}

	this.getItemsState = function() {
		var values = {};
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.ToolbarItem) {
				values[child._name] = {
					selected: child._selected,
					enabled: child._enabled
				};
			}
		}
		return values;
	}

	this.getItemsActiveState = function() {
		var values = this.getItemsState();
		for(var item in values) {
			values[item] = values[item].enabled;
		}
		return values;
	}

	this.getItemsSelectedState = function() {
		var values = this.getItemsState();
		for(var item in values) {
			values[item] = values[item].selected;
		}
		return values;
	}

	this.enable = function() {
		var items = arguments.length ? arguments : this.children;
		for(var i = 0; i < items.length; i++) {
			var child = this.getItem(items[i]);
			if(child instanceof dojo.webui.widgets.ToolbarItem) {
				child.enable();
			}
		}
	}

	this.disable = function() {
		var items = arguments.length ? arguments : this.children;
		for(var i = 0; i < items.length; i++) {
			var child = this.getItem(items[i]);
			if(child instanceof dojo.webui.widgets.ToolbarItem) {
				child.disable();
			}
		}
	}

	this.select = function() {
		for(var i = 0; i < arguments.length; i++) {
			var name = arguments[i];
			var item = this.getItem(name);
			if(item) { item.select(); }
		}
	}

	this.deselect = function() {
		for(var i = 0; i < arguments.length; i++) {
			var name = arguments[i];
			var item = this.getItem(name);
			if(item) { item.disable(); }
		}
	}

	this.setValue = function() {
		for(var i = 0; i < arguments.length; i += 2) {
			var name = arguments[i], value = arguments[i+1];
			var item = this.getItem(name);
			if(item) {
				if(item instanceof dojo.webui.widgets.ToolbarItem) {
					item.setValue(value);
				}
			}
		}
	}
}
dj_inherits(dojo.webui.widgets.HTMLToolbar, dojo.webui.HtmlWidget);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbar");

/* ToolbarItem hierarchy:
	- ToolbarItem
		- ToolbarButton
		- ToolbarDialog
			- ToolbarMenu
		- ToolbarSeparator
			- ToolbarSpace
				- ToolbarFlexibleSpace
*/


/* ToolbarItem
 **************/
dojo.webui.widgets.ToolbarItem = function() {
	dojo.webui.HtmlWidget.call(this);

	this.templateString = '<span class="toolbarItem" dojoOnMouseover="_onmouseover" dojoOnMouseout="_onmouseout" dojoOnClick="_onclick" dojoOnMousedown="_onmousedown" dojoOnMouseup="_onmouseup"></span>';

	this._name;
	this.getName = function() { return this._name; }
	this.setName = function(value) { return this._name = value; }
	this.getValue = this.getName;
	this.setValue = this.setName;

	this._selected = false;
	this.isSelected = function() { return this._selected; }
	this.setSelected = function(is, force, preventEvent) {
		if(!this._toggleItem && !force) { return; }
		is = Boolean(is);
		if(force || this._enabled && this._selected != is) {
			this._selected = is;
			this.update();
			if(!preventEvent) {
				this._fireEvent(is ? "onSelect" : "onDeselect");
				this._fireEvent("onChangeSelect");
			}
		}
	}
	this.select = function(force, preventEvent) {
		return this.setSelected(true, force, preventEvent);
	}
	this.deselect = function(force, preventEvent) {
		return this.setSelected(false, force, preventEvent);
	}

	this._toggleItem = false;
	this.isToggleItem = function() { return this._toggleItem; }
	this.setToggleItem = function(value) { this._toggleItem = Boolean(value); }

	this.toggleSelected = function(force) {
		return this.setSelected(!this._selected, force);
	}

	this._enabled = true;
	this.isEnabled = function() { return this._enabled; }
	this.setEnabled = function(is, force, preventEvent) {
		is = Boolean(is);
		if(force || this._enabled != is) {
			this._enabled = is;
			this.update();
			if(!preventEvent) {
				this._fireEvent(this._enabled ? "onEnable" : "onDisable");
				this._fireEvent("onChangeEnabled");
			}
		}
	}
	this.enable = function(force) {
		return this.setEnabled(true, force);
	}
	this.disable = function(force) {
		return this.setEnabled(false, force);
	}
	this.toggleEnabled = function(force) {
		return this.setEnabled(!this._enabled, force);
	}

	this._icon = null;
	this.getIcon = function() { return this._icon; }
	this.setIcon = function(value) {
		var icon = dojo.webui.Icon.make(value);
		if(this._icon) {
			this._icon.setIcon(icon);
		} else {
			this._icon = icon;
		}
		var iconNode = this._icon.getNode();
		if(iconNode.parentNode != this.domNode) {
			if(this.domNode.hasChildNodes()) {
				this.domNode.insertBefore(iconNode, this.domNode.firstChild);
			} else {
				this.domNode.appendChild(iconNode);
			}
		}
		return this._icon;
	}

	// TODO: update the label node (this.labelNode?)
	this._label = "";
	this.getLabel = function() { return this._label; }
	this.setLabel = function(value) {
		var ret = this._label = value;
		if(!this.labelNode) {
			this.labelNode = document.createElement("span");
			this.domNode.appendChild(this.labelNode);
		}
		this.labelNode.innerHTML = "";
		this.labelNode.appendChild(document.createTextNode(this._label));
		this.update();
		return ret;
	}

	// fired from: setSelected, setEnabled, setLabel
	this.update = function() {
		if(this._enabled) {
			dojo.xml.htmlUtil.removeClass(this.domNode, "disabled");
			if(this._selected) {
				dojo.xml.htmlUtil.addClass(this.domNode, "selected");
			} else {
				dojo.xml.htmlUtil.removeClass(this.domNode, "selected");
			}
		} else {
			this._selected = false;
			dojo.xml.htmlUtil.addClass(this.domNode, "disabled");
			dojo.xml.htmlUtil.removeClass(this.domNode, "selected");
			dojo.xml.htmlUtil.removeClass(this.domNode, "down");
			dojo.xml.htmlUtil.removeClass(this.domNode, "hover");
		}
		this._updateIcon();
	}

	this._updateIcon = function() {
		if(this._icon) {
			if(this._enabled) {
				if(this._cssHover) {
					this._icon.hover();
				} else if(this._selected) {
					this._icon.select();
				} else {
					this._icon.enable();
				}
			} else {
				this._icon.disable();
			}
		}
	}

	this._fireEvent = function(evt) {
		if(typeof this[evt] == "function") {
			var args = [this];
			for(var i = 1; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			this[evt].apply(this, args);
		}
	}

	this._onmouseover = function(e) {
		if(!this._enabled) { return };
		dojo.xml.htmlUtil.addClass(this.domNode, "hover");
	}

	this._onmouseout = function(e) {
		dojo.xml.htmlUtil.removeClass(this.domNode, "hover");
		dojo.xml.htmlUtil.removeClass(this.domNode, "down");
		if(!this._selected) {
			dojo.xml.htmlUtil.removeClass(this.domNode, "selected");
		}
	}

	this._onclick = function(e) {
		if(this._enabled && !this._toggleItem) {
			this._fireEvent("onClick");
		}
	}

	this._onmousedown = function(e) {
		if(e.preventDefault) { e.preventDefault(); }
		if(!this._enabled) { return };
		dojo.xml.htmlUtil.addClass(this.domNode, "down");
		if(this._toggleItem) {
			if(this.parent.preventDeselect && this._selected) {
				return;
			}
			this.toggleSelected();
		}
	}

	this._onmouseup = function(e) {
		dojo.xml.htmlUtil.removeClass(this.domNode, "down");
	}

	this.fillInTemplate = function(args, frag) {
		if(args.name) { this._name = args.name; }
		if(args.selected) { this.select(); }
		if(args.disabled) { this.disable(); }
		if(args.label) { this.setLabel(args.label); }
		if(args.icon) { this.setIcon(args.icon); }
		if(args.toggleitem||args.toggleItem) { this.setToggleItem(true); }
	}
}
dj_inherits(dojo.webui.widgets.ToolbarItem, dojo.webui.HtmlWidget);

dojo.webui.widgets.ToolbarItem.make = function(wh, whIsType, props) {
	var item = null;

	if(wh instanceof Array) {
		item = dojo.webui.fromScript("ToolbarButtonGroup", props);
		item.setName(wh[0]);
		for(var i = 1; i < wh.length; i++) {
			item.addChild(wh[i]);
		}
	} else if(wh instanceof dojo.webui.widgets.ToolbarItem) {
		item = wh;
	} else if(wh instanceof dojo.uri.Uri) {
		item = dojo.webui.fromScript("ToolbarButton",
			dojo.lang.mixin(props||{}, {icon: new dojo.webui.Icon(wh.toString())}));
	} else if(whIsType) {
		item = dojo.webui.fromScript(wh, props)
	} else if(typeof wh == "string" || wh instanceof String) {
		switch(wh.charAt(0)) {
			case "|":
			case "-":
			case "/":
				item = dojo.webui.fromScript("ToolbarSeparator", props);
				break;
			case " ":
				if(wh.length == 1) {
					item = dojo.webui.fromScript("ToolbarSpace", props);
				} else {
					item = dojo.webui.fromScript("ToolbarFlexibleSpace", props);
				}
				break;
			default:
				if(/\.(gif|jpg|jpeg|png)$/i.test(wh)) {
					item = dojo.webui.fromScript("ToolbarButton",
						dojo.lang.mixin(props||{}, {icon: new dojo.webui.Icon(wh.toString())}));
				} else {
					item = dojo.webui.fromScript("ToolbarButton",
						dojo.lang.mixin(props||{}, {label: wh.toString()}));
				}
		}
	} else if(wh && wh.tagName && /^img$/i.test(wh.tagName)) {
		item = dojo.webui.fromScript("ToolbarButton",
			dojo.lang.mixin(props||{}, {icon: wh}));
	} else {
		item = dojo.webui.fromScript("ToolbarButton",
			dojo.lang.mixin(props||{}, {label: wh.toString()}));
	}
	return item;
}

/* ToolbarButtonGroup
 *********************/
dojo.webui.widgets.HTMLToolbarButtonGroup = function() {
	dojo.webui.widgets.ToolbarItem.call(this);

	this.widgetType = "ToolbarButtonGroup";
	this.isContainer = true;

	this.templateString = '<span class="toolbarButtonGroup" dojoAttachPoint="containerNode"></span>';

	// if a button has the same name, it will be selected
	// if this is set to a number, the button at that index will be selected
	this.defaultButton = "";

	var oldAddChild = this.addChild;
	this.addChild = function(item, pos, props) {
		var widget = dojo.webui.widgets.ToolbarItem.make(item, null, dojo.lang.mixin(props||{}, {toggleItem:true}));
		dojo.event.connect(widget, "onSelect", this, "onChildSelected");
		var ret = oldAddChild.call(this, widget, null, pos, null);
		if(widget._name == this.defaultButton
			|| (typeof this.defaultButton == "number"
			&& this.children.length-1 == this.defaultButton)) {
			widget.select(false, true);
		}
		return ret;
	}

	this.getItem = function(name) {
		if(name instanceof dojo.webui.widgets.ToolbarItem) { return name; }
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.ToolbarItem
				&& child._name == name) { return child; }
		}
		return null;
	}

	this.onChildSelected = function(e) {
		this.select(e._name);
	}

	this.enable = function() {
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.ToolbarItem) {
				child.enable();
				if(child._name == this._value) {
					child.select();
				}
			}
		}
	}

	this.disable = function() {
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.ToolbarItem) {
				child.disable();
			}
		}
	}

	this._value = "";
	this.getValue = function() { return this._value; }
	this.setValue = this.select;

	this.select = function(name, preventEvent) {
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.ToolbarItem) {
				if(child._name == name) {
					child.select();
					this._value = name;
				} else {
					child.deselect(true);
				}
			}
		}
		if(!preventEvent) {
			this._fireEvent("onSelect", this._value);
			this._fireEvent("onChangeSelect", this._value);
		}
	}

	this.preventDeselect = false; // if true, once you select one, you can't have none selected
}
dj_inherits(dojo.webui.widgets.HTMLToolbarButtonGroup, dojo.webui.widgets.ToolbarItem);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarButtonGroup");

/* ToolbarButton
 ***********************/
dojo.webui.widgets.HTMLToolbarButton = function() {
	dojo.webui.widgets.ToolbarItem.call(this);

	this.widgetType = "ToolbarButton";

	var oldFillInTemplate = this.fillInTemplate;
	this.fillInTemplate = function(args, frag) {
		oldFillInTemplate.call(this, args, frag);
		dojo.xml.htmlUtil.addClass(this.domNode, "toolbarButton");
		if(this._icon) {
			this.setIcon(this._icon);
		}
		if(this._label) {
			this.setLabel(this._label);
		}

		if(!this._name) {
			if(this._label) {
				this.setName(this._label);
			} else if(this._icon) {
				var src = this._icon.getSrc("enabled").match(/[\/^]([^\.\/]+)\.(gif|jpg|jpeg|png)$/i);
				if(src) { this.setName(src[1]); }
			} else {
				this._name = this._widgetId;
			}
		}
	}
}
dj_inherits(dojo.webui.widgets.HTMLToolbarButton, dojo.webui.widgets.ToolbarItem);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarButton");

/* ToolbarDialog
 **********************/
dojo.webui.widgets.HTMLToolbarDialog = function() {
	dojo.webui.widgets.ToolbarItem.call(this);

	this.widgetType = "ToolbarDialog";
}
dj_inherits(dojo.webui.widgets.HTMLToolbarDialog, dojo.webui.widgets.ToolbarItem);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarDialog");

/* ToolbarMenu
 **********************/
dojo.webui.widgets.HTMLToolbarMenu = function() {
	dojo.webui.widgets.HTMLToolbarDialog.call(this);

	this.widgetType = "ToolbarMenu";
}
dj_inherits(dojo.webui.widgets.HTMLToolbarMenu, dojo.webui.widgets.HTMLToolbarDialog);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarMenu");

/* ToolbarMenuItem
 ******************/
dojo.webui.widgets.ToolbarMenuItem = function() {
}

/* ToolbarSeparator
 **********************/
dojo.webui.widgets.HTMLToolbarSeparator = function() {
	dojo.webui.widgets.ToolbarItem.call(this);

	this.widgetType = "ToolbarSeparator";
	this.templateString = '<span class="toolbarItem toolbarSeparator"></span>';

	this.defaultIconPath = new dojo.uri.dojoUri("src/webui/widgets/templates/buttons/-.gif");

	var oldFillInTemplate = this.fillInTemplate;
	this.fillInTemplate = function(args, frag, skip) {
		oldFillInTemplate.call(this, args, frag);
		this._name = this.widgetId;
		if(!skip) {
			if(!this._icon) {
				this.setIcon(this.defaultIconPath);
			}
			this.domNode.appendChild(this._icon.getNode());
		}
	}
}
dj_inherits(dojo.webui.widgets.HTMLToolbarSeparator, dojo.webui.widgets.ToolbarItem);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarSeparator");

/* ToolbarSpace
 **********************/
dojo.webui.widgets.HTMLToolbarSpace = function() {
	dojo.webui.widgets.HTMLToolbarSeparator.call(this);

	this.widgetType = "ToolbarSpace";

	var oldFillInTemplate = this.fillInTemplate;
	this.fillInTemplate = function(args, frag, skip) {
		oldFillInTemplate.call(this, args, frag, true);
		if(!skip) {
			dojo.xml.htmlUtil.addClass(this.domNode, "toolbarSpace");
		}
	}
}
dj_inherits(dojo.webui.widgets.HTMLToolbarSpace, dojo.webui.widgets.HTMLToolbarSeparator);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarSpace");

/* Icon
 *********/
// arguments can be IMG nodes, Image() instances or URLs -- enabled is the only one required
dojo.webui.Icon = function(enabled, disabled, hover, selected) {
	if(arguments.length == 0) {
		throw new Error("Icon must have at least an enabled state");
	}
	var states = ["enabled", "disabled", "hover", "selected"];
	var currentState = "enabled";
	var domNode = document.createElement("img");

	this.getState = function() { return currentState; }
	this.setState = function(value) {
		if(dojo.alg.inArray(value, states)) {
			if(this[value]) {
				currentState = value;
				domNode.setAttribute("src", this[currentState].src);
			}
		} else {
			throw new Error("Invalid state set on Icon (state: " + value + ")");
		}
	}

	this.setSrc = function(state, value) {
		if(/^img$/i.test(value.tagName)) {
			this[state] = value;
		} else if(typeof value == "string" || value instanceof String
			|| value instanceof dojo.uri.Uri) {
			this[state] = new Image();
			this[state].src = value.toString();
		}
		return this[state];
	}

	this.setIcon = function(icon) {
		for(var i = 0; i < states.length; i++) {
			if(icon[states[i]]) {
				this.setSrc(states[i], icon[states[i]]);
			}
		}
		this.update();
	}

	this.enable = function() { this.setState("enabled"); }
	this.disable = function() { this.setState("disabled"); }
	this.hover = function() { this.setState("hover"); }
	this.select = function() { this.setState("selected"); }

	this.getSize = function() {
		return {
			width: domNode.width||domNode.offsetWidth,
			height: domNode.height||domNode.offsetHeight
		};
	}

	this.setSize = function(w, h) {
		domNode.width = w;
		domNode.height = h;
		return { width: w, height: h };
	}

	this.getNode = function() {
		return domNode;
	}

	this.getSrc = function(state) {
		if(state) { return this[state].src; }
		return domNode.src||"";
	}

	this.update = function() {
		this.setState(currentState);
	}

	for(var i = 0; i < states.length; i++) {
		var arg = arguments[i];
		var state = states[i];
		this[state] = null;
		if(!arg) { continue; }
		this.setSrc(state, arg);
	}

	this.enable();
}

dojo.webui.Icon.make = function(a,b,c,d) {
	for(var i = 0; i < arguments.length; i++) {
		if(arguments[i] instanceof dojo.webui.Icon) {
			return arguments[i];
		} else if(!arguments[i]) {
			nullArgs++;
		}
	}

	return new dojo.webui.Icon(a,b,c,d);
}
