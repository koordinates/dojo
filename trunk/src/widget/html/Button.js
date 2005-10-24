dojo.provide("dojo.widget.html.Button");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.Button");
dojo.provide("dojo.string");

dojo.widget.html.Button = function(){
	// mix in the button properties
	dojo.widget.Button.call(this);
	dojo.widget.HtmlWidget.call(this);
}
dojo.inherits(dojo.widget.html.Button, dojo.widget.HtmlWidget);
dojo.lang.extend(dojo.widget.html.Button, {

	templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlButtonTemplate.html"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlButtonTemplate.css"),

	label: "undefined",
	labelNode: null,

	postCreate: function(args, frag){
		if(this.label != "undefined"){
			this.domNode.appendChild(document.createTextNode(this.label));
		} else {
			// TODO: this is a workaround.  The non-widget contents should
			// be copied over automatically (I think), but they aren't
			var input = frag["dojo:"+this.widgetType.toLowerCase()]["nodeRef"];
			while ( input.firstChild ) {
				this.domNode.appendChild(input.firstChild);
			}
		}
	},
	
	onMouseOver: function(e){
		dojo.html.addClass(this.domNode, "dojoButtonHover");
		dojo.html.removeClass(this.domNode, "dojoButtonNoHover");
	},
	
	onMouseOut: function(e){
		dojo.html.removeClass(this.domNode, "dojoButtonHover");
		dojo.html.addClass(this.domNode, "dojoButtonNoHover");
	},

	// By default, when I am clicked, click the item (link) inside of me.
	// By default, a button is a disguised link.
	// Todo: support actual submit and reset buttons.
	onClick: function (e) {
		var child = dojo.dom.getFirstChildElement(this.domNode);
		if(child){
			if(child.click){
				child.click();
			}else if(child.href){
				location.href = child.href;
			}
		}
	}
});
