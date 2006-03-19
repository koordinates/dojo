dojo.provide("dojo.widget.html.DocPane");

dojo.require("dojo.widget.*");
dojo.require("dojo.io.*");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.HtmlWidget");

dojo.widget.html.DocPane = function(){
	dojo.widget.HtmlWidget.call(this);

	this.templatePath = dojo.uri.dojoUri("src/widget/templates/HtmlDocPane.html");
	this.templateCSSPath = dojo.uri.dojoUri("src/widget/templates/HtmlDocPane.css");
	this.widgetType = "DocPane";
	this.isContainer = true;

	this.select;
	this.result;
	this.fn;
	this.fnLink;
	this.count;
	this.row;
	this.summary;
	this.description;
	this.variables;
	this.vRow;
	this.parameters;
	this.pRow;
	this.pLink;
	this.pDesc;

	dojo.event.topic.subscribe("docResults", this, "onDocResults");
	dojo.event.topic.subscribe("docFunctionDetail", this, "onDocSelectFunction");
}

dojo.inherits(dojo.widget.html.DocPane, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.DocPane, {
	fillInTemplate: function(){
		this.homeSave = this.containerNode.cloneNode(true);
		this.selectSave = dojo.dom.removeNode(this.select);
		this.resultSave = dojo.dom.removeNode(this.result);
		this.rowParent = this.row.parentNode;
		this.rowSave = dojo.dom.removeNode(this.row);
		this.vRowSave = dojo.dom.removeNode(this.vRow);
		this.pRowSave = dojo.dom.removeNode(this.vRow);
	},

	onDocSelectFunction: function(message){
		dojo.dom.removeChildren(this.domNode);
		this.fn.innerHTML = message.name;
		this.description.innerHTML = message.doc.description;

		this.variables.style.display = "block";		
		if(!message.doc.variables.length){
			this.variables.style.display = "none";
		}

		this.parameters.style.display = "block";		
		if(!message.doc.parameters.length){
			this.parameters.style.display = "none";
		}else{
			for(var i = 0, param; param = message.doc.parameters[i]; i++){
				this.pLink.innerHTML = param.name;
				this.pDesc.parentNode.style.display = "none";
				if(param.description){
					this.pDesc.parentNode.style.display = "inline";
					this.pDesc.innerHTML = param.description;
				}
			}
		}
		
		this.domNode.appendChild(this.selectSave.cloneNode(true));
	},

	onDocResults: function(message){
		dojo.dom.removeChildren(this.domNode);

		this.count.innerHTML = message.docResults.length;
		var appends = [];
		for(var i = 0, row; row = message.docResults[i]; i++){
			this.fnLink.innerHTML = row.name;
			this.fnLink.href = "#" + row.name;
			if(row.id){
				this.fnLink.href = this.fnLink.href + "," + row.id;	
			}
			this.summary.parentNode.style.display = "none";
			if(row.summary){
				this.summary.parentNode.style.display = "inline";				
				this.summary.innerHTML = row.summary;
			}
			appends.push(this.rowParent.appendChild(this.rowSave.cloneNode(true)));
		}
		
		function makeSelect(x){
			return function(e) {
				dojo.event.topic.publish("docSelectFunction", x);
			}
		}

		this.domNode.appendChild(this.resultSave.cloneNode(true));
		var as = this.domNode.getElementsByTagName("a");
		for(var i = 0, a; a = as[i]; i++){
			dojo.event.connect(a, "onclick", makeSelect(message.docResults[i]));
		}
		
		for(var i = 0, append; append = appends[i]; i++){
			this.rowParent.removeChild(append);
		}
	}
});

dojo.widget.tags.addParseTreeHandler("dojo:DocPane");
