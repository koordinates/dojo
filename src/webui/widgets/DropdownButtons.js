/* TODO:
 * - make the dropdowns "smart" so they can't get cutoff on bottom of page, sides of page, etc.
 */
dojo.provide("dojo.webui.widgets.DropdownButtons");
dojo.provide("dojo.webui.widgets.HTMLDropdownButtons");

dojo.require("dojo.event.*");
dojo.require("dojo.xml.*");
dojo.require("dojo.webui.widgets.Parse");
dojo.require("dojo.webui.Widget");
dojo.require("dojo.webui.DomWidget");
dojo.require("dojo.webui.WidgetManager");
dojo.require("dojo.graphics.*");
dojo.require("dojo.uri.Uri");


dojo.webui.widgets.HTMLDropdownButtons = function() {
	dojo.webui.Widget.call(this);
	dojo.webui.DomWidget.call(this, true);
	dojo.webui.HTMLWidget.call(this);

	this.templateCssPath = dojo.uri.dojoUri("src/webui/widgets/templates/HTMLDropdownButtons.css");
	this.widgetType = "DropdownButtons";

	// overwrite buildRendering so we don't clobber our list
	this.buildRendering = function(args, frag) {
		if(this.templateCssPath) {
			dojo.xml.htmlUtil.insertCssFile(this.templateCssPath, null, true);
		}
		this.domNode = frag["dojo:"+this.widgetType.toLowerCase()]["nodeRef"];

		var menu = this.domNode;
		if( !dojo.xml.htmlUtil.hasClass(menu, "dropdownButtons") ) {
			dojo.xml.htmlUtil.addClass(menu, "dropdownButtons");
		}
		var li = dojo.xml.domUtil.getFirstChildTag(menu);
		var menuIDs = [];
		var arrowIDs = [];

		while(li) {
			if(li.getElementsByTagName("ul").length > 0) {
				var a = dojo.xml.domUtil.getFirstChildTag(li);
				var arrow = document.createElement("span");
				arrow.innerHTML = "&nbsp;";
				dojo.xml.htmlUtil.setClass(arrow, "downArrow");
				if(!arrow.id) {
					arrow.id = dojo.xml.domUtil.getUniqueId();
				}
				arrowIDs.push(arrow.id);
				var submenu = dojo.xml.domUtil.getNextSiblingTag(a);
				if(!submenu.id) {
					submenu.id = dojo.xml.domUtil.getUniqueId();
				}
				menuIDs.push(submenu.id);

				if( dojo.xml.htmlUtil.hasClass(a, "disabled") ) {
					dojo.xml.htmlUtil.addClass(arrow, "disabled");
				} else {
					dojo.xml.htmlUtil.addClass(submenu, "dropdownButtonsMenu");
					document.body.appendChild(submenu);
					dojo.event.connect(arrow, "onmousedown", (function() {
						var ar = arrow;
						return function(e) {
							dojo.xml.htmlUtil.addClass(ar, "pressed");
						}
					})());
					dojo.event.connect(arrow, "onclick", (function() {
						var aa = a;
						var ar = arrow;
						var sm = submenu;
						var setWidth = false;

						return function(e) {
							hideAll(sm, ar);
							sm.style.left = (dojo.xml.htmlUtil.getScrollLeft()
								+ e.clientX - e.layerX + aa.offsetLeft) + "px";
							sm.style.top = (dojo.xml.htmlUtil.getScrollTop() + e.clientY
								- e.layerY + aa.offsetTop + aa.offsetHeight) + "px";
							sm.style.display = sm.style.display == "block" ? "none" : "block";
							if(sm.style.display == "none") {
								dojo.xml.htmlUtil.removeClass(ar, "pressed");
							}
							if(!setWidth && sm.style.display == "block"
								&& sm.offsetWidth < aa.offsetWidth + ar.offsetWidth) {
								sm.style.width = aa.offsetWidth + ar.offsetWidth + "px";
								setWidth = true;
							}
						}
					})());
				}

				dojo.event.connect(a, "onclick", function(e) {
					if(e && e.target && e.target.blur) {
						e.target.blur();
					}
				});

				if(a.nextSibling) {
					li.insertBefore(arrow, a.nextSibling);
				} else {
					li.appendChild(arrow);
				}

			}
			li = dojo.xml.domUtil.getNextSiblingTag(li);
		}

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
					dojo.xml.htmlUtil.removeClass(m, "pressed");
				}
			}
		}

		dojo.event.connect(document.documentElement, "onmousedown", function(e) {
			if( dojo.xml.htmlUtil.hasClass(e.target, "downArrow") ) { return };
			for(var i = 0; i < menuIDs.length; i++) {
				if( dojo.xml.domUtil.isChildOf(e.target, document.getElementById(menuIDs[i])) ) {
					return;
				}
			}
			hideAll();
		});
	}
}
dj_inherits(dojo.webui.widgets.HTMLDropdownButtons, dojo.webui.DomWidget);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:dropdownbuttons");
