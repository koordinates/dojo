dojo.provide("dojo.widget.html.DocPane");

dojo.require("dojo.widget.*");
dojo.require("dojo.io.*");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.HtmlWidget");

dojo.widget.html.DocPane= function(){
	dojo.widget.HtmlWidget.call(this);
	dojo.debug("init docpane");
	dojo.event.topic.subscribe("docResults", this, "onDocResults");
	dojo.event.topic.subscribe("docSelectFunction", this, "onDocSelectFunction");
}

dojo.inherits(dojo.widget.html.DocPane, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.DocPane, {
	widgetType: "DocPane",

	
	onDocSelectFunction: function(message) {
		dojo.dom.removeChildren(this.domNode);

		//header for search results
	//	var header = document.createElement("h1");
	//	header.appendChild(document.createTextNode("Detail: ");
	//	this.domNode.appendChild(header);
	},

	_createSelectOnClick: function(message) {
		msg = message;
		return function(e) {
			dojo.debug("name: " + msg.name);
		};
	},	

	onDocResults: function(message) {
		dojo.dom.removeChildren(this.domNode);

		//header for search results
		var header = document.createElement("h1");
		header.appendChild(document.createTextNode("Search Results: " + message.docResults.length + " matches"));
		this.domNode.appendChild(header);

		for (var i=0; i < message.docResults.length; i++) {
			var newDiv = document.createElement("div");

			//dojo.debug(message.docResults[i].name);
			//dojo.debug(message.docResults[i].summary);
			var packageSpan = document.createElement("span");
			var packageA = document.createElement("a");

			packageA.href = "#" + message.docResults[i].name;
			if (message.docResults[i].id) {
				packageA.href = packageA.href + "," + message.docResults[i].id;	
			}

			packageA.appendChild(document.createTextNode(message.docResults[i].name));
			packageA.data = message.docResults[i];
			var select = function() {
				
			}

			function makeSelect(x) {
				return function(e) {
					for (i in x) {dojo.debug(i + ": " + x[i]);}
					//dojo.debug("Select: " + x.name);
					dojo.event.topic.publish("docSelectFunction",x);
				}
			}

			dojo.event.connect(packageA,"onclick", makeSelect(message.docResults[i]));

			packageSpan.appendChild(packageA);
			newDiv.appendChild(packageSpan);

			if (message.docResults[i].summary) {
				var summarySpan = document.createElement("span");
				summarySpan.appendChild(document.createTextNode(" - " + message.docResults[i].summary));
				newDiv.appendChild(summarySpan);
			}

			this.domNode.appendChild(newDiv);
			
		}


	}
});

dojo.widget.tags.addParseTreeHandler("dojo:DocPane");
