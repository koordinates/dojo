dojo.provide("dojo.widget.html.DemoEngine");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.lfx.*");
dojo.require("dojo.style");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.Button");
dojo.require("dojo.widget.TabContainer");
dojo.require("dojo.widget.ContentPane");

dojo.widget.html.DemoEngine = function(){
	dojo.widget.HtmlWidget.call(this);
	this.widgetType = "DemoEngine";

	this.templatePath = dojo.uri.dojoUri("src/widget/templates/DemoEngine.html");

	this.navigationNode="";
	this.navigationClass="demoEngineNavigation";

	this.collapseToNode="";
	this.collapseToClass="collapseTo";

	this.menuNavigationNode="";
	this.menuNavigationClass="demoEngineMenuNavigation";

	this.demoNavigationNode="";
	this.demoNavigationClass="demoEngineDemoNavigation";

	this.demoListingsNode="";
	this.demoListingsClass="demoEngineDemoListings";

	this.demoListingsTbody="";

	this.demoContainerNode="";
	this.demoContainerClass="demoEngineDemoContainer";

	this.demoHeaderNode="";
	this.demoHeaderClass="demoEngineDemoHeader";

	this.collapsedMenuNode="";
	this.collapsedMenuClass="demoEngineCollapsedMenu";

	this.aboutNode="";
	this.aboutClass="demoEngineAbout";

	this.demoPaneNode="";	
	this.demoTabContainer="";
	this.registry = function() {};	
}

dojo.inherits(dojo.widget.html.DemoEngine, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.DemoEngine, {
	postCreate: function() {
		dojo.html.addClass(this.navigationNode, this.navigationClass);
		dojo.html.addClass(this.collapseToNode, this.collapseToClass);
		dojo.html.addClass(this.menuNavigationNode, this.menuNavigationClass);
		dojo.html.addClass(this.demoNavigationNode, this.demoNavigationClass);
		dojo.html.addClass(this.demoListingsNode, this.demoListingsClass);
		dojo.html.addClass(this.collapsedMenuNode, this.collapsedMenuClass);
		dojo.html.addClass(this.demoHeaderNode, this.demoHeaderClass);
		dojo.html.addClass(this.demoContainerNode, this.demoContainerClass);

		// Make sure navigation node is hidden and opaque
		dojo.style.hide(this.navigationNode);
		dojo.style.setOpacity(this.navigationNode, 0);

		//Make sure demoNavigationNode is hidden and opaque;
		dojo.style.hide(this.demoNavigationNode);
		dojo.style.setOpacity(this.demoNavigationNode,0);

		//Make sure demoContainerNode is hidden and opaque
		dojo.style.hide(this.demoContainerNode);
		dojo.style.setOpacity(this.demoContainerNode,0);

		//Populate the menu
		this.buildMenu();

		//show navigationNode
		dojo.lfx.html.fadeShow(this.navigationNode, 500).play();

		//turn demoPaneNode into a tabset
		this.demoTabContainer = dojo.widget.createWidget("TabContainer",{},this.demoPaneNode);	
	},

	buildMenu: function() {
		dojo.html.removeChildren(this.menuNavigationNode);

		dojo.io.bind({
			url: "demoRegistry.json",
			load: dojo.lang.hitch(this, "_buildMenu"),
			mimetype: "text/json"
		});
	},

	_buildMenu: function(type, data) {
		this.registry = data;
		dojo.debug("_buildMenu");
		dojo.debugShallow(this.registry.navigation[0]);

		dojo.lang.forEach(this.registry.navigation, dojo.lang.hitch(this,function(category) {
			this._addMenuItem(category);
		}));
	},

	_addMenuItem: function(category) {
		dojo.debug("Adding button for " + category.name);
		var newCat = dojo.widget.createWidget("Button");
		newCat.containerNode.innerHTML=category.name;
		this.menuNavigationNode.appendChild(newCat.domNode);
		dojo.event.connect(newCat,"onClick", this, "selectCategory");
	},

	selectCategory: function(e) {
		dojo.debug("Selecting: " + e.target.innerHTML);
		var showDemoNav = dojo.lfx.html.fadeShow(this.demoNavigationNode, 600);
		var moveMenuNav = dojo.lfx.html.slideTo(this.menuNavigationNode,[0,0], 250);

		dojo.html.removeChildren(this.demoListingsTbody);
	
		dojo.lfx.combine(showDemoNav, moveMenuNav).play()	

		for (var x = 0 ; x< this.registry.navigation.length; x++) {
			if (this.registry.navigation[x].name == e.target.innerHTML) {
				for (var y=0; y< this.registry.navigation[x].demos.length; y++) {
					dojo.debug("demo: " + this.registry.navigation[x].demos[y]);
					var d = this.registry.definitions[this.registry.navigation[x].demos[y]];

					var newRow = document.createElement("tr");
					var thumbTd = document.createElement("td");
					var thumb = document.createElement("img");
					var detailTd = document.createElement("td");

					thumb.src = d.thumbnail;
					thumbTd.appendChild(thumb);	

					var title=document.createElement("h2");
					var desc = document.createElement("p");
					title.appendChild(document.createTextNode(this.registry.navigation[x].demos[y]));
					desc.appendChild(document.createTextNode(d.description));
					detailTd.appendChild(title);
					detailTd.appendChild(desc);
						

					newRow.appendChild(thumbTd);
					newRow.appendChild(detailTd);
					this.demoListingsTbody.appendChild(newRow);
					dojo.event.connect(newRow, "onclick", this, "launchDemo");
				}
			}
		}
	},

	showIframe: function(e) {
		dojo.lfx.html.fadeShow(e.currentTarget,250).play();
	},

	launchDemo: function(e) {
		dojo.debug("Launching Demo: " + e.currentTarget.lastChild.firstChild.innerHTML);
		//implode = dojo.lfx.html.implode(this.navigationNode, this.collapsedMenuNode,1500);
		//show = dojo.lfx.html.fadeShow(this.demoContainerNode,1500);
		dojo.style.setOpacity(this.demoContainerNode, 0);
		hide = dojo.lfx.html.fadeHide(this.navigationNode, 500);
		show = dojo.lfx.html.fadeShow(this.demoContainerNode,500);
		//dojo.style.setOpacity(this.demoContainerNode, 0);
		//dojo.style.show(this.demoContainerNode);
		dojo.lfx.combine(hide,show).play();

		this.demoTabContainer.destroyChildren();

		demoIframe = document.createElement("iframe");
		demoIframe.src=this.registry.definitions[e.currentTarget.lastChild.firstChild.innerHTML].url;

		dojo.html.removeChildren(this.aboutNode);
		var name = document.createElement("h1");
		var about= document.createElement("h2");
		name.appendChild(document.createTextNode(e.currentTarget.lastChild.firstChild.innerHTML));
		about.appendChild(document.createTextNode(this.registry.definitions[e.currentTarget.lastChild.firstChild.innerHTML].description));
		this.aboutNode.appendChild(name);
		this.aboutNode.appendChild(about);

		liveDemo = dojo.widget.createWidget("ContentPane",{label: "Live Demo"});
		liveDemo.domNode.appendChild(demoIframe);

		this.demoTabContainer.addChild(liveDemo);
		demoIframe.parentNode.style.display="inline";
		demoIframe.parentNode.parentNode.style.overflow="hidden";
		dojo.io.bind({
			url: this.registry.definitions[e.currentTarget.lastChild.firstChild.innerHTML].url,
			mimetype: "text/plain",
			load: dojo.lang.hitch(this, function(type,data,e) {
				source = document.createElement("textarea");
				source.appendChild(document.createTextNode(data));
				var sourcePane = dojo.widget.createWidget("ContentPane",{label: "Source"});
				sourcePane.domNode.appendChild(source);
				this.demoTabContainer.addChild(sourcePane);
				dojo.style.show(sourcePane.domNode);

				//let the text area take care of the scrolling 
				sourcePane.domNode.style.overflow="hidden";
				
			})
		});

		this.demoTabContainer.selectTab(liveDemo);
	},

	expandDemoNavigation: function(e) {
		dojo.debug("re expanding navigation");
		//dojo.style.hide(this.demoContainerNode);
		//explode = dojo.lfx.html.explode(this.navigationNode,this.collapseToNode,1000);
		//dojo.style.show(this.navigationNode);
		//hide = dojo.lfx.html.fadeHide(this.demoContainerNode,250);

		show = dojo.lfx.html.fadeShow(this.navigationNode, 1000);
		hide = dojo.lfx.html.fadeHide(this.demoContainerNode, 1000);
		dojo.lfx.combine(show,hide).play();
	}
});

dojo.widget.tags.addParseTreeHandler("dojo:DemoEngine");
