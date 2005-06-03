/* TODO:
 * - make the dropdowns "smart" so they can't get cutoff on bottom of page, sides of page, etc.
 */
dojo.hostenv.startPackage("dojo.webui.widgets.DropdownButtons");
dojo.hostenv.startPackage("dojo.webui.widgets.HTMLDropdownButtons");

dojo.hostenv.loadModule("dojo.event.*");
dojo.hostenv.loadModule("dojo.xml.*");
dojo.hostenv.loadModule("dojo.webui.widgets.Parse");
dojo.hostenv.loadModule("dojo.webui.Widget");
dojo.hostenv.loadModule("dojo.webui.DomWidget");
dojo.hostenv.loadModule("dojo.webui.WidgetManager");
dojo.hostenv.loadModule("dojo.graphics.*");
dojo.hostenv.loadModule("dojo.graphics.htmlEffects");


dojo.webui.widgets.HTMLDropdownButtons = function() {
	dojo.webui.Widget.call(this);
	dojo.webui.DomWidget.call(this, true);
	dojo.webui.HTMLWidget.call(this);

	this.templateCSSPath = "src/webui/widgets/templates/HTMLDropdownButtons.css";
	this.widgetType = "DropdownButtons";

	// overwrite buildRendering so we don't clobber our list
	this.buildRendering = function(args, frag) {
		dojo.xml.htmlUtil.insertCSSFile(dojo.hostenv.getBaseScriptUri()+"/"+this.templateCSSPath);
		this.domNode = frag["dojo:dropdownbuttons"]["nodeRef"];

		var menu = this.domNode;
		if( !dojo.xml.htmlUtil.hasClass(menu, "dropdownButtons") ) {
			dojo.xml.htmlUtil.addClass(menu, "dropdownButtons");
		}
		var li = dojo.xml.domUtil.getFirstChildTag(menu);
		var menuIDs = [];

		while(li) {
			if(li.getElementsByTagName("ul").length > 0) {
				var a = dojo.xml.domUtil.getFirstChildTag(li);
				var arrow = document.createElement("span");
				arrow.innerHTML = "&nbsp;";
				dojo.xml.htmlUtil.setClass(arrow, "downArrow");
				var submenu = dojo.xml.domUtil.getNextSiblingTag(a);
				if(!submenu.id) {
					do {
						var id = "x" + (new Date().valueOf() + Math.floor(Math.random()*100))
					} while( document.getElementById(id) );
					submenu.id = id;
				}
				menuIDs.push(submenu.id);

				if( dojo.xml.htmlUtil.hasClass(a, "disabled") ) {
					dojo.xml.htmlUtil.addClass(arrow, "disabled");
				} else {
					dojo.xml.htmlUtil.addClass(submenu, "dropdownButtonsMenu");
					document.body.appendChild(submenu);
					dojo.event.connect(arrow, "onclick", (function() {
						var aa = a;
						var ar = arrow;
						var sm = submenu;
						var setWidth = 0;

						return function(e) {
							hideAll(sm);
							sm.style.left = (dojo.xml.htmlUtil.getScrollLeft() + e.clientX - e.layerX + aa.offsetLeft) + "px";
							sm.style.top = (dojo.xml.htmlUtil.getScrollTop() + e.clientY - e.layerY + aa.offsetTop + aa.offsetHeight) + "px";
							sm.style.display = sm.style.display == "block" ? "none" : "block";
							if(sm.offsetWidth < aa.offsetWidth + ar.offsetWidth) {
								sm.style.width = aa.offsetWidth + ar.offsetWidth + "px";
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

		function hideAll(exclude) {
			for(var i = 0; i < menuIDs.length; i++) {
				var m = document.getElementById(menuIDs[i]);
				if(!exclude || m != exclude) {
					document.getElementById(menuIDs[i]).style.display = "none";
				}
			}
		}

		dojo.event.connect(document.documentElement, "onmousedown", function(e) {
			if(e.target.className == "downArrow") { return };
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
