var item = null;

if(wh instanceof Array) {
	item = dojo.widget.createWidget("ToolbarButtonGroup", props);
	item.setName(wh[0]);
	for(var i = 1; i < wh.length; i++) {
		item.addChild(wh[i]);
	}
} else if(wh instanceof dojo.widget.ToolbarItem) {
	item = wh;
} else if(wh instanceof dojo.uri.Uri) {
	item = dojo.widget.createWidget("ToolbarButton",
		dojo.lang.mixin(props||{}, {icon: new dojo.widget.Icon(wh.toString())}));
} else if(whIsType) {
	item = dojo.widget.createWidget(wh, props)
} else if(typeof wh == "string" || wh instanceof String) {
	switch(wh.charAt(0)) {
		case "|":
		case "-":
		case "/":
			item = dojo.widget.createWidget("ToolbarSeparator", props);
			break;
		case " ":
			if(wh.length == 1) {
				item = dojo.widget.createWidget("ToolbarSpace", props);
			} else {
				item = dojo.widget.createWidget("ToolbarFlexibleSpace", props);
			}
			break;
		default:
			if(/\.(gif|jpg|jpeg|png)$/i.test(wh)) {
				item = dojo.widget.createWidget("ToolbarButton",
					dojo.lang.mixin(props||{}, {icon: new dojo.widget.Icon(wh.toString())}));
			} else {
				item = dojo.widget.createWidget("ToolbarButton",
					dojo.lang.mixin(props||{}, {label: wh.toString()}));
			}
	}
} else if(wh && wh.tagName && /^img$/i.test(wh.tagName)) {
	item = dojo.widget.createWidget("ToolbarButton",
		dojo.lang.mixin(props||{}, {icon: wh}));
} else {
	item = dojo.widget.createWidget("ToolbarButton",
		dojo.lang.mixin(props||{}, {label: wh.toString()}));
}
return item;