/* Example markup:

<ul dojoType="tabs">
	<li><a href="/tab1">Tab 1</a></li>
	<li><a href="/tab2">Tab 2</a></li>
	<li><a href="/tab3">Tab 3</a></li>
	<li><a href="/tab4">Tab 4</a></li>
	<li><a href="#info">More Info</a></li>
</ul>
*/

dojo.hostenv.startPackage("dojo.webui.widgets.Tabs");
dojo.hostenv.startPackage("dojo.webui.widgets.HTMLTabs");

dojo.hostenv.loadModule("dojo.xml.*"); // FIXME: Shouldn't need to include
dojo.hostenv.loadModule("dojo.io.*");
dojo.hostenv.loadModule("dojo.webui.DomWidget");
dojo.hostenv.loadModule("dojo.webui.widgets.Parse");
dojo.hostenv.loadModule("dojo.webui.WidgetManager");
dojo.hostenv.loadModule("dojo.graphics.*");

dojo.webui.widgets.HTMLTabs = function() {
	dojo.webui.Widget.call(this);
	dojo.webui.DomWidget.call(this, true);
	dojo.webui.HTMLWidget.call(this);

	this.widgetType = "Tabs";
	this.templatePath = null; // prolly not
	this.templateCSSPath = null; // maybe

	this.domNode = null;
	this.panelContainer = null;

	this.tabs = [];
	this.panels = [];
	this.selected = -1;

	this.buildRendering = function(args, frag) {
		this.domNode = frag["dojo:"+this.widgetType.toLowerCase()]["nodeRef"];
		if(!this.domNode) { dj_error("HTMLTabs: No node reference"); }

		this.panelContainer = document.createElement("div");
		this.panelContainer.className = "dojoTabPanelContainer";
		var next = this.domNode.nextSibling;
		if(next) {
			this.domNode.parentNode.insertBefore(this.panelContainer, next);
		} else {
			this.domNode.parentNode.appendChild(this.panelContainer);
		}

		var li = dojo.xml.domUtil.getFirstChildTag(this.domNode);
		while(li) {
			var a = li.getElementsByTagName("a").item(0);
			this.addTab(a);
			li = dojo.xml.domUtil.getNextSiblingTag(li);
		}

		if(this.selected == -1) { this.selected = 0; }
		this.selectTab(null, this.tabs[this.selected]);
	}

	this.addTab = function(title, url) {
		if(title && title.tagName && title.tagName.toLowerCase() == "a") {
			// init case
			var a = title;
			var li = a.parentNode;
			title = a.innerHTML;
			url = a.getAttribute("href");
		} else {
			// programmatically adding
			var li = document.createElement("li");
			var a = document.createElement("a");
			a.innerHTML = title;
			a.href = url;
			li.appendChild(a);
			this.domNode.appendChild(li);
		}

		dojo.event.connect(a, "onclick", this, "selectTab");

		this.tabs.push(li);
		var panel = {url: url, loaded: false, id: url.charAt(0) == "#" ? url.substring(1) : null};
		this.panels.push(panel);
		if(panel.id) { this.getPanel(panel); }

		if(this.selected == -1 && dojo.xml.htmlUtil.hasClass(li, "current")) {
			this.selected = this.tabs.length-1;
		}
	}

	this.selectTab = function(e, target) {
		if(e) {
			if(e.target) {
				target = e.target;
				while(target && (target.tagName||"").toLowerCase() != "li") {
					target = target.parentNode;
				}
			}
			if(e.preventDefault) { e.preventDefault(); }
		}

		dojo.xml.htmlUtil.removeClass(this.tabs[this.selected], "current");

		for(var i = 0; i < this.tabs.length; i++) {
			if(this.tabs[i] == target) {
				dojo.xml.htmlUtil.addClass(this.tabs[i], "current");
				this.selected = i;
				break;
			}
		}

		var panel = this.panels[this.selected];
		if(panel) {
			this.getPanel(panel);
			this.hidePanels(panel);
			document.getElementById(panel.id).style.display = "";
		}
	}

	this.getPanel = function(panel) {
		if(!panel || panel.loaded) { return; }

		if(panel.id) {
			var id = panel.id;
			var node = document.getElementById(id);
		} else {
			var id = dojo.xml.domUtil.getUniqueId();
			var node = document.createElement("div");
			node.innerHTML = "Loading...";
			node.id = id;

			dojo.io.bind({
				url: panel.url,
				mimetype: "text/html",
				handler: function(type, data, e) {
					document.getElementById(id).innerHTML = data;
				}
			});
		}

		this.panelContainer.appendChild(node);
		panel.id = node.id;
		panel.loaded = true;
	}

	this.hidePanels = function(except) {
		for(var i = 0; i < this.panels.length; i++) {
			if(this.panels[i] != except && this.panels[i].id) {
				var p = document.getElementById(this.panels[i].id);
				if(p) {
					p.style.display = "none";
				}
			}
		}
	}
}
dj_inherits(dojo.webui.widgets.HTMLTabs, dojo.webui.DomWidget);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:tabs");
