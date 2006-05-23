dojo.provide("dojo.widget.demoEngine.DemoNavigator");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.Button");
dojo.require("dojo.widget.demoEngine.DemoItem");
dojo.require("dojo.io.*");
dojo.require("dojo.lfx.*");
dojo.require("dojo.lang.Common");

dojo.widget.defineWidget("my.widget.demoEngine.DemoNavigator", 
	dojo.widget.HtmlWidget, 
	{
		templatePath: dojo.uri.dojoUri("src/widget/demoEngine/templates/DemoNavigator.html"),
		templateCssPath: dojo.uri.dojoUri("src/widget/demoEngine/templates/DemoNavigator.css"),
		postCreate: function() {
			dojo.html.addClass(this.domNode,this.domNodeClass);
			dojo.html.addClass(this.demoListWrapperNode,this.demoListWrapperClass);
			dojo.html.addClass(this.demoListContainerNode,this.demoListContainerClass);

			dojo.lfx.html.fadeHide(this.demoListWrapperNode, 0).play();	
			this.getRegistry(this.demoRegistryUrl);

			this.demoContainer = dojo.widget.createWidget("DemoContainer",{returnImage: this.returnImage},this.demoNode);
			dojo.event.connect(this.demoContainer,"returnToDemos", this, "returnToDemos");
			this.demoContainer.hide();
		},

		returnToDemos: function() {
			this.demoContainer.hide();
			dojo.lfx.html.fadeShow(this.navigationContainer,250).play();

			dojo.lang.forEach(this.categoriesChildren, dojo.lang.hitch(this, function(child){
				child.onParentResized();
			}));

			dojo.lang.forEach(this.demoListChildren, dojo.lang.hitch(this, function(child){
				child.onParentResized();
			}));

			//this.show();
			//dojo.lfx.html.fadeShow(this.navigationContainer,250,null,null,dojo.lang.hitch(this,function() { 
			//	dojo.debug("this.show");
			//	this.show();
			//	dojo.lfx.html.fadeShow(this.demoListWrapperNode,100).play();
			//})).play();
		},

		show: function() {
			//dojo.widget.demoEngine.DemoNavigator.superclass.show.call(this);
			dojo.html.show(this.domNode);
			dojo.html.setOpacity(this.domNode,1);
			//dojo.html.setOpacity(this.navigationContainer);	
			//dojo.html.show(this.navigationContainer);
			dojo.html.setOpacity(this.navigationContainer,1);

			dojo.lang.forEach(this.categoriesChildren, dojo.lang.hitch(this, function(child){
				child.onParentResized();
			}));

			dojo.lang.forEach(this.demoListChildren, dojo.lang.hitch(this, function(child){
				child.onParentResized();
			}));
		},
		getRegistry: function(url) {
			dojo.io.bind({
				url: url,
				load: dojo.lang.hitch(this,this.processRegistry),
				mimetype: "text/json"
			});
		},

		processRegistry: function(type,registry,e) {
			dojo.debug("Processing Registry");
			this.registry = registry;
			dojo.lang.forEach(this.registry.navigation, dojo.lang.hitch(this,this.addCategory)); 
		},

		addCategory: function(category) {
				var newCat = dojo.widget.createWidget("Button",{caption: category.name});

				if(!dojo.lang.isObject(this.registry.categories)) {
					this.registry.categories=function(){};
				}

				this.registry.categories[category.name] = category;
				this.categoriesChildren.push(newCat);
				this.categoriesButtonsNode.appendChild(newCat.domNode);	
				newCat.domNode.categoryName = category.name;
				dojo.event.connect(newCat,"onClick", this, "onSelectCategory");
		},

		addDemo: function(demoName) {
			dojo.debug("Add Demo");
			var demo = this.registry.definitions[demoName];
			//if (!dojo.style.isShowing(this.demoListWrapperNode) || (dojo.html.getOpacity(this.demoListWrapperNode)<1)) {
				dojo.lfx.html.fadeShow(this.demoListWrapperNode, 250).play();
			//}

			var newDemo = dojo.widget.createWidget("DemoItem",{viewDemoImage: this.viewDemoImage, name: demoName, description: demo.description, thumbnail: demo.thumbnail});
			this.demoListChildren.push(newDemo);
			this.demoListContainerNode.appendChild(newDemo.domNode);	
			dojo.event.connect(newDemo,"onSelectDemo",this,"onSelectDemo");
		},

		onSelectCategory: function(e) {
			catName = e.currentTarget.categoryName;	

			//Remove current list of demos
			dojo.lang.forEach(this.demoListChildren, function(child) {
					child.destroy();
			});
			this.demoListChildren=[];

			//add demos from this cat
			dojo.lang.forEach(this.registry.categories[catName].demos, dojo.lang.hitch(this,function(demoName){
				this.addDemo(demoName);
			}));
		},

		onSelectDemo: function(e) {
			//Attach to this to do something when a demo is selected
			dojo.debug("Demo Selected: " + e.target.name);

			dojo.lfx.html.fadeHide(this.navigationContainer,250,null,dojo.lang.hitch(this, function() {
				dojo.debug("post animation");
				this.demoContainer.show();	
				this.demoContainer.showDemo();
			})).play();

			this.demoContainer.loadDemo(this.registry.definitions[e.target.name].url);
			this.demoContainer.setName(e.target.name);
			this.demoContainer.setSummary(this.registry.definitions[e.target.name].description);
		}
		
	},
	"",
	function() {
		this.demoRegistryUrl="demoRegistry.json";
		this.registry=function(){};

		this.categoriesNode="";
		this.categoriesButtonsNode="";
		this.navigationContainer="";

		this.domNodeClass="demoNavigator";

		this.demoNode="";
		this.demoContainer="";

		this.demoListWrapperNode="";
		this.demoListWrapperClass="demoNavigatorListWrapper";
		this.demoListContainerClass="demoNavigatorListContainer";

		this.returnImage="images/dojoDemos.gif";
		this.viewDemoImage="images/viewDemo.png";
		this.demoListChildren = [];
		this.categoriesChildren = [];
	}
);
