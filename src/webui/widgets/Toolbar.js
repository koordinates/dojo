//dojo.provide("dojo.webui.widgets.Toolbar");
dojo.provide("dojo.webui.widgets.ToolbarContainer");
//dojo.provide("dojo.webui.widgets.HTMLToolbar");
dojo.provide("dojo.webui.widgets.HTMLToolbarContainer");

dojo.require("dojo.webui.*");

/* ToolbarContainer
 *******************/
dojo.webui.widgets.HTMLToolbarContainer = function() {
	dojo.webui.HtmlWidget.call(this);

	this.widgetType = "ToolbarContainer";
	this.isContainer = true;

	this.templatePath = dojo.uri.dojoUri("src/webui/widgets/templates/HtmlToolbarContainer.html");
	this.templateCssPath = dojo.uri.dojoUri("src/webui/widgets/templates/HtmlToolbar.css");

	this.fillInTemplate = function(args, frag) {
	}

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
				//for(var j = 0; j < arguments.length; j++) {
					//child.disable(arguments[j]);
				//}
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
}
dj_inherits(dojo.webui.widgets.HTMLToolbarContainer, dojo.webui.HtmlWidget);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarContainer");

/* Toolbar
 **********/
dojo.webui.widgets.HTMLToolbar = function() {
	dojo.webui.HtmlWidget.call(this);

	this.widgetType = "Toolbar";
	this.isContainer = true;

	this.templatePath = dojo.uri.dojoUri("src/webui/widgets/templates/HtmlToolbar.html");
	this.templateCssPath = dojo.uri.dojoUri("src/webui/widgets/templates/HtmlToolbar.css");

	this.fillInTemplate = function(args, frag) {
		this.containerNode = this.domNode;
	}

	var oldAddChild = this.addChild;
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
			if((child instanceof dojo.webui.widgets.ToolbarItem
				|| child instanceof dojo.webui.widgets.HTMLToolbarButtonGroup)
				&& child._name == name) { return child; }
		}
		return null;
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
				if(item instanceof dojo.webui.widgets.HTMLToolbarButtonGroup) {
					item.select(value);
				} else if(item instanceof dojo.webui.widgets.ToolbarItem) {
					item.setLabel(value);
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

	this._selected = false;
	this.isSelected = function() { return this._selected; }
	this.setSelected = function(is, force) {
		is = Boolean(is);
		if(force || this._selected != is) {
			this._selected = is;
			if(!is) {
				this._isToggled = false;
			}
			if(this._icon) {
				this._icon.setState(is ? "enabled" : "disabled");
				this._updateIcon();
			}
			this._fire(this._selected ? "onSelect" : "onDeselect");
		}
	}
	this.select = function(force) {
		if(!force) {
			if(!this._enabled) { return; }
			if(this._selected) { return; }
		}
		dojo.xml.htmlUtil.addClass(this.domNode, "selected");
		return this.setSelected(true, force);
	}
	this.deselect = function(force) {
		if(!force) {
			if(!this._enabled) { return; }
			if(!this._selected) { return; }
		}
		dojo.xml.htmlUtil.removeClass(this.domNode, "selected");
		return this.setSelected(false, force);
	}

	this._enabled = true;
	this.isEnabled = function() { return this._enabled; }
	this.setEnabled = function(is) {
		is = Boolean(is);
		if(this._enabled != is) {
			this._enabled = is;
			if(this._icon) {
				this._icon.setState(is ? "selected" : "enabled");
				this._updateIcon();
			}
			this._fire(this._enabled ? "onEnable" : "onDisable");
		}
	}
	this.enable = function() {
		dojo.xml.htmlUtil.removeClass(this.domNode, "disabled");
		return this.setEnabled(true);
	}
	this.disable = function() {
		dojo.xml.htmlUtil.addClass(this.domNode, "disabled");
		this.deselect();
		return this.setEnabled(false);
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
		return this._icon;
	}
	this._updateIcon = function() {
		if(this._icon) { this._icon.update(); }
	}

	this._label = "";
	this.getLabel = function() { return this._label; }
	this.setLabel = function(value) { this._label = value; }

	this._toggleItem = false;
	this.getToggleItem = function() { return this._toggleItem; }
	this.setToggleItem = function(value) { this._toggleItem = Boolean(value); }

	this._isToggled = false;
	this.toggle = function() {
		return this._isToggled = !this._isToggled;
	}

	this._fire = function(evt) {
		if(typeof this[evt] == "function") {
			var args = [this];
			for(var i = 1; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			this[evt].apply(this, args);
		}
	}

	this._onmouseover = function(e) {
		dojo.xml.htmlUtil.addClass(this.domNode, "hover");
	}

	this._onmouseout = function(e) {
		dojo.xml.htmlUtil.removeClass(this.domNode, "hover");
		if(!this._isToggled) {
			dojo.xml.htmlUtil.removeClass(this.domNode, "selected");
		}
	}

	this._onclick = function(e) {
		if(this._toggleItem) {
		}
	}

	this._onmousedown = function(e) {
		if(this._toggleItem) {
			if(!this._isToggled) { this.select(); }
			this.toggle();
		} else {
			this.select();
		}
	}

	this._onmouseup = function(e) {
		if(!this._toggleItem
			|| this._toggleItem && !this._isToggled) {
			this.deselect();
		}
	}

	this.fillInTemplate = function(args, frag) {
		if(args.selected) { this.select(); }
		if(args.enabled) { this.enable(); }
		if(args.label) { this.setLabel(args.label); }
		if(args.icon) { this.setIcon(args.icon); }
		if(args.toggleitem) { this.setToggleItem(true); }
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

	this.templateString = '<span class="toolbarButtonGroup"></span>';

	var oldFillInTemplate = this.fillInTemplate;
	this.fillInTemplate = function(args, frag) {
		oldFillInTemplate.call(this, args, frag);
		this.containerNode = this.domNode;
	}

	var oldAddChild = this.addChild;
	this.addChild = function(item, pos, props) {
		var widget = dojo.webui.widgets.ToolbarItem.make(item, null, dojo.lang.mixin(props||{}, {toggleItem:true}));
		dojo.event.connect(widget, "onSelect", this, "onChildSelected");
		var ret = oldAddChild.call(this, widget, null, pos, null);
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

	this.value = "";
	this.select = function(name) {
		for(var i = 0; i < this.children.length; i++) {
			var child = this.children[i];
			if(child instanceof dojo.webui.widgets.ToolbarItem) {
				if(child._name == name) {
					child.select();
					this.value = name;
				} else {
					child.deselect(true);
				}
			}
		}
		this._fire("onSelect", this.value);
	}
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
			var icon = this._icon.getNode();
			this.domNode.appendChild( this._icon.getNode() );
		} else {
			this.domNode.innerHTML = this._label;
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

/* ToolbarToggleButton
 ***********************/
dojo.webui.widgets.HTMLToolbarToggleButton = function() {
	dojo.webui.widgets.HTMLToolbarButton.call(this);

	this.widgetType = "ToolbarToggleButton";

	var oldFillInTemplate = this.fillInTemplate;
	this.fillInTemplate = function(args, frag) {
		oldFillInTemplate.call(this, args, frag);
	}
}
dj_inherits(dojo.webui.widgets.HTMLToolbarToggleButton, dojo.webui.widgets.HTMLToolbarButton);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarToggleButton");

/* ToolbarDialog
 **********************/
dojo.webui.widgets.ToolbarDialog = function() {
	dojo.webui.widgets.ToolbarItem.call(this);

	this.widgetType = "ToolbarDialog";
}
dj_inherits(dojo.webui.widgets.ToolbarDialog, dojo.webui.widgets.ToolbarItem);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarDialog");

/* ToolbarMenu
 **********************/
dojo.webui.widgets.ToolbarMenu = function() {
	dojo.webui.widgets.ToolbarMenu.call(this);

	this.widgetType = "ToolbarMenu";
}
dj_inherits(dojo.webui.widgets.ToolbarMenu, dojo.webui.widgets.ToolbarDialog);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarMenu");

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

/* ToolbarFlexibleSpace
 **********************/
dojo.webui.widgets.HTMLToolbarFlexibleSpace = function() {
	dojo.webui.widgets.HTMLToolbarSpace.call(this);

	this.widgetType = "ToolbarFlexibleSpace";

	var oldFillInTemplate = this.fillInTemplate;
	this.fillInTemplate = function(args, frag) {
		oldFillInTemplate.call(this, args, frag);
		dojo.xml.htmlUtil.addClass(this.domNode, "toolbarFlexibleSpace");
	}
}
dj_inherits(dojo.webui.widgets.HTMLToolbarFlexibleSpace, dojo.webui.widgets.HTMLToolbarSeparator);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:toolbarFlexibleSpace");

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
	this.selected = function() { this.setState("selected"); }

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
