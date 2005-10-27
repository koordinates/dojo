/* Copyright (c) 2004-2005 The Dojo Foundation, Licensed under the Academic Free License version 2.1 or above */
/* TODO:
 * - make the dropdown "smart" so it can't get cutoff on bottom of page, sides of page, etc.
 */

dojo.provide("dojo.widget.DropdownButton");

dojo.require("dojo.event.*");
dojo.require("dojo.widget.*");
dojo.require("dojo.uri.Uri");
dojo.require("dojo.dom");
dojo.require("dojo.style");
dojo.require("dojo.html");

dojo.widget.tags.addParseTreeHandler("dojo:dropdownbutton");


// Draws a button with a down arrow;
// when you press the down arrow something appears (usually a menu)
dojo.widget.HtmlDropdownButton = function() {
	dojo.widget.HtmlDropdownButton.superclass.constructor.call(this);

	this.widgetType = "DropdownButton";
	this.isContainer = false;	// will process children manually
		
	// Layout of generated button:
	//
	//    2---BUTTONCONTAINER---2
	//    | 3---BUTTON--------3 |
	//    | | LABEL   ARROW   | |
	//    | 3-----------------3 |
	//    | DDD                 |
	//    2---------------------2
	//
	//  2 - BUTTONMENU - vertical: holds the button, plus a div to attach the drop down menu
	//  3 - BUTTON - hrizontal: the button itself.  (The style sheet specifies pretty borders.)
	//  LABEL - table cell: the left part of the button, containing an icon and some label text.
	//  ARROW - table cell holding down arrow to trigger menu
	//  DDD - div to hang menu off of.

	this.templateString =
		  '<table class="dojoButtonWrapper" dojoAttachPoint="dropdownButtonContainer">'
		+ '<tr><td>'
		+   '<table dojoAttachPoint="dropdownButton" class="dojoButton dojoButtonNoHover" dojoAttachEvent="onMouseOver: onMouseOver; onMouseOut: onMouseOut;"><tr>'
		+     '<td class="label" dojoAttachPoint="labelCell" dojoAttachEvent="onClick: onClickButton;"></td>'
		+     '<td class="downArrow" dojoAttachPoint="arrowCell" dojoAttachEvent="onClick: onClickArrow;">'
		+         '<img dojoAttachPoint="arrow">'
		+     '</td>'
		+   '</tr></table>'
		+ '</td></tr>'
		+ '<tr height=0><td height=0>'
		+   '<div dojoAttachPoint="menuAttach" style="overflow: visible; position: relative; display: none;"></div>'
		+ '</tr></td>'
		+ '</table>';

	// attach points
	this.dropdownButtonContainer = null;
	this.dropdownButton = null;
	this.labelCell = null;
	this.arrowCell = null;
	this.arrow = null;
	this.menuAttach = null;

	this.fillInTemplate = function(args, frag) {
		// input data (containing the anchor for the button itself, plus the
		// thing to display when you push the down arrow)
		var input = frag["dojo:"+this.widgetType.toLowerCase()]["nodeRef"];

		// Recursively expand widgets inside of the <dojo:dropdownButton>
		var parser = new dojo.xml.Parse();
		var frag = parser.parseElement(input, null, true);
		var ary = dojo.widget.getParser().createComponents(frag);

		this.a = dojo.dom.getFirstChildElement(input);	// the button contents
		this.menu = dojo.dom.getNextSiblingElement(this.a);	// the menu under the button
		
		this.disabled = dojo.html.hasClass(this.a, "disabled");
		if( this.disabled )
			dojo.html.addClass(this.dropdownButton, "disabled");
		
		dojo.html.disableSelection(this.a);
		this.a.style["text-decoration"]="none";
		this.labelCell.appendChild(this.a);

		this.arrow.src =
			dojo.uri.dojoUri("src/widget/templates/images/dropdownButtonsArrow" +
			(this.disabled ? "-disabled" : "") + ".gif");

		this.menu.style.position="absolute";
		try {
			this.menu.style.display="table";
		} catch(e) {
			this.menu.style.display="block";
		}
		this.menu.style.top="-5px";
		this.menu.style.left="0px";
		this.menu.style["z-index"] = 99;
		this.menuAttach.appendChild(this.menu);
		
	};

	// If someone clicks anywhere else on the screen (including another menu),
	// then close this menu.
	this.onCanvasMouseDown = function(e) {
		if( !dojo.dom.isDescendantOf(e.target, this.dropdownButtonContainer) ) {
			this.hideMenu();
		}
	};

	this.onMouseOver = function(e) {
		dojo.html.addClass(this.dropdownButton, "dojoButtonHover");
		dojo.html.removeClass(this.dropdownButton, "dojoButtonNoHover");
	};
	
	this.onMouseOut = function(e) {
		dojo.html.removeClass(this.dropdownButton, "dojoButtonHover");
		dojo.html.addClass(this.dropdownButton, "dojoButtonNoHover");
	}

	// Action when the user presses the button
	this.onClickButton = function(e) {
		if ( this.a ) {
			if ( this.a.click ) {
				this.a.click();
			} else if ( this.a.href ) {
				location.href = this.a.href;
			}
		}
	}

	// Action when user presses the arrow
	this.onClickArrow = function() {
		if ( this.menuAttach.style.display == "none" )
			this.showMenu();
		else
			this.hideMenu();
	};
	
	this.showMenu = function() {
		if ( this.disabled )
			return;
		this.menuAttach.style.display="block";
		
		// If someone clicks somewhere else on the screen then close the menu
		dojo.event.connect(document.documentElement, "onmousedown", this, "onCanvasMouseDown");
		
		// When someone clicks the menu, after the menu handles the event,
		// close the menu
		dojo.event.connect(this.menu, "onclick", this, "hideMenu");

		// Make menu at least as wide as the button
		if ( this.menu.offsetWidth < this.dropdownButton.offsetWidth ) {
			this.menu.style.width = this.dropdownButton.offsetWidth + "px";

			// adjust for borders
			var current = this.menu.style.width.replace("px","");
			var change = this.dropdownButton.offsetWidth - this.menu.offsetWidth;
			var newWidth = (current-0) + (change-0);
			this.menu.style.width = newWidth + "px";
		}
	}

	this.hideMenu = function() {
		this.menuAttach.style.display = "none";
		dojo.event.disconnect(document.documentElement, "onmousedown", this, "onCanvasMouseDown");
		dojo.event.disconnect(this.menu, "onclick", this, "hideMenu");
	}
}

dojo.inherits(dojo.widget.HtmlDropdownButton, dojo.widget.HtmlWidget);


