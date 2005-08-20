dojo.provide("dojo.widget.Menu");
dojo.provide("dojo.widget.DomMenu");
dojo.provide("dojo.widget.HtmlMenu");

dojo.require("dojo.widget.Widget");
dojo.require("dojo.widget.DomWidget");
dojo.require("dojo.widget.HtmlWidget");


dojo.widget.tags.addParseTreeHandler("dojo:menu");

/* Menu
 *******/

dojo.widget.Menu = function () {
	dojo.widget.Menu.superclass.constructor.call(this);
}
dj_inherits(dojo.widget.Menu, dojo.widget.Widget);

dojo.lang.extend(dojo.widget.Menu, {
	widgetType: "Menu",
	
	items: [],

	push: function (item) {		
		this.items.push(item);
	}

});


/* DomMenu
 **********/

dojo.widget.DomMenu = function(){
	dojo.widget.DomMenu.superclass.constructor.call(this);
}
dj_inherits(dojo.widget.DomMenu, dojo.widget.DomWidget);

dojo.lang.extend(dojo.widget.DomMenu, dojo.widget.DomWidget.prototype);
dojo.lang.extend(dojo.widget.DomMenu, dojo.widget.Menu.prototype);
dojo.lang.extend(dojo.widget.DomMenu, {
	push: function (item) {
		dojo.widget.Menu.call(this, item);
		this.domNode.appendChild(item.domNode);
	}
});


/* HtmlMenu
 ***********/
 
dojo.widget.HtmlMenu = function(){
	dojo.widget.HtmlMenu.superclass.constructor.call(this);
}
dj_inherits(dojo.widget.HtmlMenu, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.HtmlMenu, dojo.widget.HtmlWidget.prototype);
dojo.lang.extend(dojo.widget.HtmlMenu, dojo.widget.DomMenu.prototype);
dojo.lang.extend(dojo.widget.HtmlMenu, {
	
	buildRendering: function () {
		dojo.widget.HtmlMenu.superclass.buildRendering.apply(this, arguments);

		this.domNode = document.createElement("ul");
		with (this.domNode.style) {
			listStye = "none";
			padding = "0";
			margin = "0";
		}
		// TODO: I don't know what Dojo does with children
	},
	
	fillInTemplate: function () {
		//dojo.widget.HtmlMenu.superclass.fillInTemplate.apply(this, arguments);
	}

});
