 
// Deprecated class, please use DropdownButton instead
// Set of drop down buttons, in a row

dojo.provide("dojo.widget.DropdownButtons");
dojo.provide("dojo.widget.HtmlDropdownButtons");

dojo.require("dojo.widget.*");
dojo.require("dojo.uri.Uri");
dojo.require("dojo.dom");
dojo.require("dojo.style");

dojo.require("dojo.widget.DropdownButton");
dojo.require("dojo.widget.Menu");
dojo.require("dojo.widget.MenuItem");
dojo.require("dojo.widget.Button");
dojo.require("dojo.widget.html.Button");

dojo.widget.HtmlDropdownButtons = function() {
	dojo.widget.HtmlWidget.call(this);

	this.templateString = '<div class="dojoButtonCollection"></div>';
	this.templateCssPath = dojo.uri.dojoUri("src/widget/templates/HtmlButtonTemplate.css");
	this.widgetType = "DropdownButtons";
	this.isContainer = false;

	this.postCreate = function(args, frag) {
		// For each child node, add dojoType attributes and attach it as my child
		//   <li dojoType="dropdownButton">
		//       <a>button label</a>
		//       <ul dojoType="menu">
		//          <li dojoType="menuItem">menuitem #1</li>
		//       </ul>
		//   </li>

		var parser = new dojo.xml.Parse();
		var buttons = frag["dojo:"+this.widgetType.toLowerCase()]["nodeRef"];
		var nextButton;
		for(var button = dojo.dom.getFirstChildElement(buttons); button; button = nextButton ){
			var a = button.getElementsByTagName("a").item(0);
			var menu = button.getElementsByTagName("ul").item(0);
			
			if ( menu ) {
				button.setAttribute("dojoType", "dropdownButton");
				menu.setAttribute("dojoType", "menu");

				for(var item = dojo.dom.getFirstChildElement(menu); item; item = dojo.dom.getNextSiblingElement(item) ){
					item.setAttribute("dojoType", "menuItem");
				}				
			} else {
				button.setAttribute("dojoType", "button");
			}
			nextButton = dojo.dom.getNextSiblingElement(button);
			this.domNode.appendChild(button);
		}

		// Run parser on my children, to expand the widgets
		var frag = parser.parseElement(this.domNode, null, true);
		var ary = dojo.widget.getParser().createComponents(frag);
	}
}

dojo.widget.tags.addParseTreeHandler("dojo:dropdownbuttons");
dojo.inherits(dojo.widget.HtmlDropdownButtons, dojo.widget.HtmlWidget);
