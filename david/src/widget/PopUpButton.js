dojo.provide("dojo.widget.PopUpButton");
dojo.provide("dojo.widget.DomPopUpButton");
dojo.provide("dojo.widget.HtmlPopUpButton");

dojo.require("dojo.widget.Button");
dojo.require("dojo.widget.HtmlButton");

dojo.require("dojo.widget.Menu");
dojo.require("dojo.widget.MenuItem");

dojo.widget.tags.addParseTreeHandler("dojo:PopUpButton");

/* PopUpButton
 **************/
 
dojo.widget.PopUpButton = function () {
	dojo.widget.PopUpButton.superclass.constructor.call(this);
}
dj_inherits(dojo.widget.PopUpButton, dojo.widget.Widget);

dojo.lang.extend(dojo.widget.PopUpButton, {
	widgetType: "PopUpButton",
	
	label: ""
});


/* DomPopUpButton
 *****************/
dojo.widget.DomPopUpButton = function(){
	dojo.widget.DomPopUpButton.superclass.constructor.call(this);
}
dj_inherits(dojo.widget.DomPopUpButton, dojo.widget.DomWidget);

dojo.lang.extend(dojo.widget.DomPopUpButton, {
	widgetType: dojo.widget.PopUpButton.prototype.widgetType
});


/* HtmlPopUpButton
 ******************/

dojo.widget.HtmlPopUpButton = function () {
	dojo.widget.HtmlPopUpButton.superclass.constructor.call(this);
}
dj_inherits(dojo.widget.HtmlPopUpButton, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.HtmlPopUpButton, {
	widgetType: dojo.widget.PopUpButton.prototype.widgetType,
	templateString: null,
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/PopUpButton.css"),
	
	buildRendering: function (args, frag) {
		dojo.xml.htmlUtil.insertCssFile(this.templateCssPath, null, true);
	
		this.domNode = document.createElement("a");
		this.domNode.className = "PopUpButton";
		dojo.event.connect(this.domNode, "onmousedown", this, "onMouseDown");

		this.domNode.innerHTML = "foo";
		
		// draw the arrow
		var arrow = document.createElement("img");
		arrow.src = dojo.uri.dojoUri("src/widget/templates/images/dropdownButtonsArrow.gif");
		dojo.xml.htmlUtil.setClass(arrow, "downArrow");
		this.domNode.appendChild(arrow);

		this.menu = dojo.widget.fromScript("Menu");
		dojo.xml.htmlUtil.addClass(this.menu.domNodem, "PopUpButtonMenu");
		
		if (frag["dojo:" + this.widgetType.toLowerCase()].nodeRef) {
			var node = frag["dojo:" + this.widgetType.toLowerCase()].nodeRef;
			var options = node.getElementsByTagName("option");
			for (var i = 0; i < options.length; i++) {
				var properties = {
					title: dojo.xml.domUtil.textContent(options[i]),
					value: options[i].value
				}
				this.menu.push(dojo.widget.fromScript("MenuItem", properties));
			}
		}		
	},
	
	onMouseDown: function (e) {
		with (dojo.xml.htmlUtil) {
			var y = getAbsoluteY(this.domNode) + getInnerHeight(this.domNode);
			var x = getAbsoluteX(this.domNode);
		}
		this.showMenuAt(x, y);
		
		dojo.lang.setTimeout(dojo.event.connect, 1, document, "onmousedown", this, "hideMenu");
	},
	
	showMenuAt: function (x, y) {
		document.body.appendChild(this.menu.domNode);
		with (this.menu.domNode.style) {
			top = y + "px";
			left = x + "px";
		}
	},
	
	hideMenu: function () {
		this.menu.domNode.parentNode.removeChild(this.menu.domNode);
		dojo.event.disconnect(document, "onmousedown", this, "hideMenu");
	}

});
