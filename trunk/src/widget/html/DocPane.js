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
	this.pOpt;
	this.pType;
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
		this.pParent = this.pRow.parentNode;
		this.pSave = dojo.dom.removeNode(this.pRow);
	},

	onDocSelectFunction: function(message){
		var meta = message.meta;
		if(meta){
			var variables = meta.variables;
			var this_variables = meta.variables;
			var child_variables = meta.child_variables;
			var parameters = meta.parameters;
		}
		var doc = message.doc;
		
		var appends = [];
		dojo.dom.removeChildren(this.domNode);
		this.fn.innerHTML = message.name;
		this.description.innerHTML = doc.description;

		this.variables.style.display = "block";
		var all = [];
		if(variables){
			all = variables;
		}
		if(this_variables){
			all = all.concat(this_variables);
		}
		if(child_variables){
			all = all.concat(child_variables);
		}
		if(!all.length){
			this.variables.style.display = "none";
		}else{
			for(var i = 0, one; one = all[i]; i++){
				this.vLink.innerHTML = one;
				this.vDesc.parentNode.style.display = "none";
				appends.push(this.vParent.appendChild(this.vSave.cloneNode(true)));
			}
		}
		
		this.parameters.style.display = "none";
		for(var param in parameters){
			var paramType = parameters[param][0];
			var paramName = parameters[param][1];
			this.parameters.style.display = "block";		
			this.pLink.innerHTML = paramName;
			this.pOpt.style.display = "none";
			if(parameters[param].opt){
				this.pOpt.style.display = "inline";				
			}
			this.pType.parentNode.style.display = "none";
			if(parameters[param][0]){
				this.pType.parentNode.style.display = "inline";
				this.pType.innerHTML = paramType;
			}
			this.pDesc.parentNode.style.display = "none";
			if(doc.parameters[paramName] && doc.parameters[paramName].description){
				this.pDesc.parentNode.style.display = "inline";
				this.pDesc.innerHTML = doc.parameters[paramName].description;
			}
			appends.push(this.pParent.appendChild(this.pSave.cloneNode(true)));
		}

		dojo.dom.removeChildren(this.source);
		this.source.appendChild(document.createTextNode(message.meta.sig + "{\r\n\t" + message.src.replace(/\n/g, "\r\n\t") + "\r\n}"));
		
		this.domNode.appendChild(this.selectSave.cloneNode(true));

		for(var i = 0, append; append = appends[i]; i++){
			dojo.dom.removeNode(append);
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
