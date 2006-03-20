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
	this.vLink;
	this.vDesc;
	this.parameters;
	this.pRow;
	this.pLink;
	this.pDesc;
	this.source;

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
		this.vParent = this.vRow.parentNode;
		this.vSave = dojo.dom.removeNode(this.vRow);
		this.pSave = dojo.dom.removeNode(this.vRow);
	},

	onDocSelectFunction: function(message){
		var appends = [];
		dojo.dom.removeChildren(this.domNode);
		this.fn.innerHTML = message.name;
		this.description.innerHTML = message.doc.description;

		this.variables.style.display = "block";
		var all = [];
		if(message.meta){
			if(message.meta.variables){
				all = message.meta.variables;
			}
			if(message.meta.this_variables){
				all = all.concat(message.meta.this_variables);
			}
			if(message.meta.child_variables){
				all = all.concat(message.meta.child_variables);
			}
		}
		if(!all){
			this.variables.style.display = "none";
		}else{
			for(var i = 0, one; one = all[i]; i++){
				this.vLink.innerHTML = one;
				this.vDesc.parentNode.style.display = "none";
				appends.push(this.vParent.appendChild(this.vSave.cloneNode(true)));
			}
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

		dojo.dom.removeChildren(this.source);
		this.source.appendChild(document.createTextNode(message.meta.sig + "{\r\n\t" + message.src.replace(/\n/g, "\r\n\t") + "\r\n}"));
		
		this.domNode.appendChild(this.selectSave.cloneNode(true));

		for(var i = 0, append; append = appends[i]; i++){
			this.vParent.removeChild(append);
		}
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
