dojo.provide("dijit.Declaration");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare(
	"dijit.Declaration",
	dijit._Widget,
	{
		// summary:
		//		The Declaration widget allows a user to declare new widget
		//		classes directly from a snippet of markup.

		_noScript: true,
		widgetClass: "",
		replaceVars: true,
		defaults: null,
		mixins: [],
		buildRendering: function(){
			var src = this.srcNodeRef.parentNode.removeChild(this.srcNodeRef);
			var preambles = dojo.query("> script[type='dojo/method'][event='preamble']", src).orphan();
			var scripts = dojo.query("> script[type^='dojo/']", src).orphan();
			var srcType = src.nodeName;

			var propList = this.defaults||{};

			// map array of strings like [ "dijit.form.Button" ] to array of mixin objects
			// (note that dojo.map(this.mixins, dojo.getObject) doesn't work because it passes
			// a bogus third argument to getObject(), confusing it)
			this.mixins = this.mixins.length ? 
				dojo.map(this.mixins, function(name){ return dojo.getObject(name); } ) : 
				[ dijit._Widget, dijit._Templated ];

			if(preambles.length){
				// we only support one preamble. So be it.
				propList.preamble = dojo.parser._functionFromScript(preambles[0]);
			}
			propList.widgetsInTemplate = true;
			propList.templateString = "<"+srcType+" class='"+src.className+"'>"+src.innerHTML.replace(/\%7B/g,"{").replace(/\%7D/g,"}")+"</"+srcType+">";

			// strip things so we don't create stuff under us in the initial setup phase
			dojo.query("[dojoType]", src).forEach(function(node){
				node.removeAttribute("dojoType");
			});
			scripts.forEach(function(s){
				if(!s.getAttribute("event")){
					this.mixins.push(dojo.parser._functionFromScript(s));
				}
			}, this);

			// create the new widget class
			dojo.declare(
				this.widgetClass,
				this.mixins,
				propList
			);

			// do the connects for each <script type="dojo/connect" event="foo"> block
			var wcp = dojo.getObject(this.widgetClass).prototype;
			scripts.forEach(function(s){
				var event = s.getAttribute("event");
				if(event){
					dojo.connect(wcp, event, null, dojo.parser._functionFromScript(s));
				}
			});
		}
	}
);
