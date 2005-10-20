 
// Changes by Bill Keese:
// 1. Support arbitrarily sized button (ex: different font sizes, or buttons containing images).
//   - This entailed making the arrow as tall as the button label.
//   - And on Gecko, there was a problem where an image inside the button
// would extend beyond the button's border
// 2. Support clicking anywhere on the button/menu item, even outside the link
// 3. Simplified code for positioning of submenu

// Layout of generated buttons:
//
// The buttons are layed out using horizontal and vertical layout containers,
// similar to Swing's BoxLayout layout manager.  
//  1-------------------------------------------1
//  | 2-----BUTTONMENU------2                   |
//  | | 3---BUTTON--------3 |                   |
//  | | | LABEL   ARROW   | |   (other buttons) |
//  | | 3-----------------3 |                   |
//  | | DDD                 |                   |
//  | 2---------------------2                   |
//  1-------------------------------------------1
//
//
//  1 - horizontal: arranges a group of buttons horizontally
//  2 - BUTTONMENU - vertical: holds the button, plus a div to attach the drop down menu
//  3 - BUTTON - hrizontal: the button itself.  (The style sheet specifies pretty borders.)
//  LABEL - table cell: the left part of the button, containing an icon and some label text.
//  ARROW - table cell holding down arrow to trigger menu
//  DDD - div to hang menu off of.


dojo.provide("dojo.widget.DropdownButtons");
dojo.provide("dojo.widget.HtmlDropdownButtons");

dojo.require("dojo.event.*");
dojo.require("dojo.widget.*");
dojo.require("dojo.graphics.*");
dojo.require("dojo.uri.Uri");
dojo.require("dojo.dom");
dojo.require("dojo.style");
dojo.require("dojo.html");


dojo.widget.HtmlDropdownButtons = function() {
	dojo.widget.HtmlWidget.call(this);

	this.templateCssPath = dojo.uri.dojoUri("src/widget/templates/HtmlDropdownButtons.css");
	this.widgetType = "DropdownButtons";

	// Layout manager
	// Base class for horizontal and vertical layout manager
	var LayoutManager = function() {
		this.init = function(typ, className) {
			this.type = typ;
			this.domNode = document.createElement("table");
			this.body = document.createElement("tbody");
			this.domNode.appendChild(this.body);
			dojo.html.addClass(this.domNode, this.type + "Collection");
			if(className){
				dojo.html.addClass(this.domNode, className);
			}
		}

		// Add a class to the domNode
		this.addClass = function(className) {
			dojo.html.addClass(this.domNode, className);
		}
		
		// Make a cell from contents and add it to the collection
		this.addCell = function(contents, className) {
			var tr = this.getRow();
			var td = document.createElement("td");
			tr.appendChild(td);
			dojo.html.addClass(td, this.type + "Cell");
			
			// Moving DOM nodes from the input array into the TD will affect the
			// input array itself (maybe), so first make an intermediate storage area
			var cellItems = [];
			if(contents && contents.length){		// if it's a NodeList/Array
				for(var i=0; i < contents.length; i++){
					cellItems.push(contents.item ? contents.item(i) : contents[i]);
				}
			}else if(contents){	// if it's a single object
				cellItems.push(contents);
			}
			for(var i=0; i<cellItems.length; i++){
				td.appendChild(cellItems[i]);
			}
			if(className){
				dojo.html.addClass(td, className);
			}
			return td;
		}
		
		this.getDomNode = function(){
			return this.domNode;
		}
	}
	
	// Horizontal layout manager
	var Horizontal = function(className) {
		this.init("horizontal", className);
		// create the single row that all the horizontal elements will go in
		this.tr = document.createElement("tr");
		this.body.appendChild(this.tr);
		this.getRow = function() {
			return this.tr;
		}
	}
	dojo.inherits(Horizontal, LayoutManager);

	// Vertical layout manager
	var Vertical = function(className) {
		this.init("vertical", className);
		this.getRow = function() {
			// create a new row for every new data element
			var tr = document.createElement("tr");
			this.body.appendChild(tr);
			return tr;
		}
	}
	dojo.inherits(Vertical, LayoutManager);

	// Setup handlers for hovering and clicking on a rectangular region.
	// If you click the region, it will click the first link within the region
	// TODO: what if user defines a onclick handler rather than an href?
	this.setupHandlers = function(region, anchor) {
		dojo.event.connect(region, "onclick", (function() {
					var a = anchor;
					return function(e) {
						if(a&&a.href){
							if(a.click){
								a.click();
							}else{
								location.href = a.href;
							}
						}
					}
				})());
		dojo.event.connect(region, "onmouseover", (function() {
					var sa = region;
					return function(e) {
						dojo.html.addClass(sa, "hover");
						dojo.html.removeClass(sa, "noHover");
					}
				})());
		dojo.event.connect(region, "onmouseout", (function() {
					var sa = region;
					return function(e) {
						dojo.html.removeClass(sa, "hover");
						dojo.html.addClass(sa, "noHover");
					}
				})());
		dojo.html.addClass(region, "noHover");
	}				

	// overwrite buildRendering so we don't clobber our list
	this.buildRendering = function(args, frag) {
		if(this.templateCssPath) {
			dojo.style.insertCssFile(this.templateCssPath, null, true);
		}
		var menu = frag["dojo:"+this.widgetType.toLowerCase()]["nodeRef"];

		var menuIDs = [];
		var arrowIDs = [];

		// Make a row of buttons
		var collection = new Horizontal("dropdownButtonCollection");
		for(var li = dojo.dom.getFirstChildElement(menu); li; li = dojo.dom.getNextSiblingElement(li) ){

			var a = li.getElementsByTagName("a").item(0);
			var submenu = li.getElementsByTagName("ul").item(0);
			
			// Vertical container with button and submenu
			var buttonMenu = new Vertical("buttonAndMenu");
			collection.addCell(buttonMenu.getDomNode());

			// Button is horizontal layout of label and down-arrow
			var button = new Horizontal("dropdownButton");
			if( dojo.html.hasClass(a, "disabled") ) {
				dojo.html.addClass(button.domNode, "disabled");
			}
			buttonMenu.addCell(button.getDomNode());

			// Put label text into the button
			// To avoid complicated style sheet issues, pull the text out the anchor
			// and put it in directly
			var anchor = button.addCell(a, "anchor");
			anchor.style.display="none";
			var label = button.addCell(a.childNodes, "label");
			label.valign="middle";
			if( !dojo.html.hasClass(a, "disabled") ){
				this.setupHandlers(label, a);
			}

			// If there is a submenu...
			if(submenu) {
				// Add arrow to right of button label
				var arrow = button.addCell(null, "downArrow");
				arrow.innerHTML="<span style='width: 10px;'>&nbsp;</span>";
				this.setupHandlers(arrow, null);			// for highlighting
				arrow.id = dojo.dom.getUniqueId();
				arrowIDs.push(arrow.id);

				// Add a relative DIV right below the button.  (anchor point
				// for menu)
				var relDiv = document.createElement("div");
				// so I can hang the menu off of the div with absolute positioning
				relDiv.style.position="relative";
				// in case the menu is wider than the button
				relDiv.style.overflow="visible";
				buttonMenu.addCell(relDiv);

				if(!submenu.id) {
					submenu.id = dojo.dom.getUniqueId();
				}
				menuIDs.push(submenu.id);
				dojo.html.addClass(submenu, "dropdownButtonsMenu");
				relDiv.appendChild(submenu);
			
				if(!dojo.html.hasClass(a, "disabled")){
					dojo.event.connect(arrow, "onmousedown", (function() {
						var ar = arrow;
						return function(e) {
							dojo.html.addClass(ar, "pressed");
						}
					})());
					dojo.event.connect(arrow, "onclick", (function() {
						var aa = button.domNode;
						var ar = arrow;
						var sm = submenu;
						var setWidth = false;

						return function(e) {
							hideAll(sm, ar);
							if ( !sm.style.display || sm.style.display == "none" ) {
								try{
									sm.style.display = "table";		// For firefox (limits width to minimum possible)
								}catch(er){
									sm.style.display = "block";		// For IE (table is illegal setting for IE6)
								}
								
								// Make menu at least as wide as the button
								if ( sm.offsetWidth < aa.offsetWidth ) {
									sm.style.width = aa.offsetWidth + "px";

									// adjust for borders
									var current = sm.style.width.replace("px","");
									var change = aa.offsetWidth - sm.offsetWidth;
									var newWidth = (current-0) + (change-0);
									sm.style.width = newWidth + "px";
								}
							} else {
								sm.style.display = "none";
								dojo.html.removeClass(ar, "pressed");
								e.target.blur()
							}
							if(!setWidth && sm.style.display == "block"
								&& sm.offsetWidth < aa.offsetWidth + ar.offsetWidth) {
								sm.style.width = aa.offsetWidth + ar.offsetWidth + "px";
								setWidth = true;
							}
							e.preventDefault();
						}
					})());
				}

				dojo.event.connect(a, "onclick", function(e) {
					if(e && e.target && e.target.blur) {
						e.target.blur();
					}
				});
				
				// Also, avoid complicated style sheet issues by pulling the
				// text out of the anchor and sticking it directly in the li.
				// Also, support clicking anywhere on the li.
				for(var sli = dojo.dom.getFirstChildElement(submenu);
					sli;
					sli = dojo.dom.getNextSiblingElement(sli)){

					var a = dojo.dom.getFirstChildElement(sli);
					while(a.childNodes && a.childNodes.length > 0){
						sli.appendChild(a.childNodes.item(0));
					}
					a.style.display="none";	
					this.setupHandlers(sli, a);
				}

			}
			li = dojo.dom.getNextSiblingElement(li);
		}

		this.domNode = collection.getDomNode();


		function hideAll(excludeMenu, excludeArrow) {
			// hide menus
			for(var i = 0; i < menuIDs.length; i++) {
				var m = document.getElementById(menuIDs[i]);
				if(!excludeMenu || m != excludeMenu) {
					document.getElementById(menuIDs[i]).style.display = "none";
				}
			}
			// restore arrows to non-pressed state
			for(var i = 0; i < arrowIDs.length; i++) {
				var m = document.getElementById(arrowIDs[i]);
				if(!excludeArrow || m != excludeArrow) {
					dojo.html.removeClass(m, "pressed");
				}
			}
		}

		dojo.event.connect(document.documentElement, "onmousedown", function(e) {
			if( dojo.html.hasClass(e.target, "downArrow") ) { return };
			for(var i = 0; i < menuIDs.length; i++) {
				if( dojo.dom.isDescendantOf(e.target, document.getElementById(menuIDs[i])) ) {
					return;
				}
			}
			hideAll();
		});
	}
}

dojo.widget.tags.addParseTreeHandler("dojo:dropdownbuttons");

dojo.inherits(dojo.widget.HtmlDropdownButtons, dojo.widget.HtmlWidget);
