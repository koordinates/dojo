dojo.provide("dojo.widget.TitlePane");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.ContentPane");
dojo.require("dojo.html.style");
dojo.require("dojo.lfx.*");

dojo.widget.defineWidget(
	"dojo.widget.TitlePane",
	dojo.widget.ContentPane,
{
	labelNode: "",
	labelNodeClass: "",
	containerNodeClass: "",
	label: "",
	
	open: true,
	templatePath: dojo.uri.dojoUri("src/widget/templates/TitlePane.html"),

	postCreate: function() {
		if (this.label) {
			this.labelNode.appendChild(document.createTextNode(this.label));
		}

		if (this.labelNodeClass) {
			dojo.html.addClass(this.labelNode, this.labelNodeClass);
		}	

		if (this.containerNodeClass) {
			dojo.html.addClass(this.containerNode, this.containerNodeClass);
		}	

		if (!this.open) {
			with(this.containerNode.style) {
				visibility = "hidden";
				position = "absolute";
			}
		}
		dojo.widget.TitlePane.superclass.postCreate.apply(this, arguments);
	},

	onLabelClick: function() {
		if (this.open) {
			var callback = function(node, anim) {
				dojo.html.setStyle(node, "position", "absolute");
			};
			dojo.lfx.wipeOut(this.containerNode, 250, 5, callback).play();
			this.open=false;
		} else {
			dojo.html.setStyle(this.containerNode, "position", "relative");
			dojo.lfx.wipeIn(this.containerNode, 250).play();
			this.open=true;
		}
	},

	setLabel: function(label) {
		this.labelNode.innerHTML=label;
	}
});
