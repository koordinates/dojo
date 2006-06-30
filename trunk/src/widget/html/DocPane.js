dojo.provide("dojo.widget.html.DocPane");

dojo.require("dojo.widget.*");
dojo.require("dojo.io.*");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.DocPane");
dojo.require("dojo.widget.Editor2");

dojo.widget.html.DocPane = function(){
	dojo.event.topic.subscribe("/docs/function/results", this, "onDocResults");
	dojo.event.topic.subscribe("/docs/package/results", this, "onPkgResults");
	dojo.event.topic.subscribe("/docs/function/detail", this, "onDocSelectFunction");
}

dojo.widget.defineWidget(
	"dojo.widget.html.DocPane",
	"html",
	[dojo.widget.HtmlWidget, dojo.widget.DocPane],
	{
		// Template parameters
		detail: null,
		result: null,
		packag: null,
		fn: null,
		fnLink: null,
		count: null,
		row: null,
		summary: null,
		description: null,
		variables: null,
		vRow: null,
		vLink: null,
		vDesc: null,
		methods: null,
		mRow: null,
		mLink: null,
		mDesc: null,
		requires: null,
		rRow: null,
		rRow2: null,
		rH3: null,
		rLink: null,
		parameters: null,
		pRow: null,
		pLink: null,
		pDesc: null,
		pOpt: null,
		pType: null,
		sType: null,
		sName: null,
		sParams: null,
		sPType: null,
		sPTypeSave: null,
		sPName: null,
		sPNameSave: null,
		pkgDescription: null,
		// Fields and methods
		_appends: [],
		templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlDocPane.html"),
		templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlDocPane.css"),
		isContainer: true,
		fillInTemplate: function(){
			this.requires = dojo.dom.removeNode(this.requires);
			this.rRow.style.display = "none";
			this.rRow2.style.display = "none";
			
			this.methods = dojo.dom.removeNode(this.methods);
			this.mRow.style.display = "none";

			this.inherited("postCreate", arguments);
			this.pkgDescription = dojo.widget.createWidget("editor2", {
				toolbarAlwaysVisible: true
			}, this.pkgDescription);

			
			this.homeSave = this.containerNode.cloneNode(true);
			this.detailSave = dojo.dom.removeNode(this.detail);
			this.resultSave = dojo.dom.removeNode(this.result);
			this.packageSave = dojo.dom.removeNode(this.packag);
			this.results = dojo.dom.removeNode(this.results);
			this.rowParent = this.row.parentNode;
			this.rowSave = dojo.dom.removeNode(this.row);
			this.vParent = this.vRow.parentNode;
			this.vSave = dojo.dom.removeNode(this.vRow);
			this.pParent = this.pRow.parentNode;
			this.pSave = dojo.dom.removeNode(this.pRow);
			this.sPTypeSave = dojo.dom.removeNode(this.sPType);
			this.sPNameSave = dojo.dom.removeNode(this.sPName);
			this.navSave = dojo.dom.removeNode(this.nav);
		},
		onDocSelectFunction: function(message){
			var meta = message.meta;
			if(meta){
				var variables = meta.variables;
				var this_variables = meta.this_variables;
				var child_variables = meta.child_variables;
				var parameters = meta.parameters;
			}
			var description = message.description;

			var appends = this._appends;
			dojo.dom.removeChildren(this.domNode);
			this.fn.innerHTML = message.name;

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

			this.sParams.innerHTML = "";
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

				if(param > 0) {
					this.sParams.appendChild(document.createTextNode(", "));
				}
				if(paramType){
					dojo.debug(this.sPTypeSave);
					this.sPTypeSave.innerHTML = paramType;
					this.sParams.appendChild(this.sPTypeSave.cloneNode(true));
					this.sParams.appendChild(document.createTextNode(" "));
				}
				dojo.debug(this.sPNameSave);
				this.sPNameSave.innerHTML = paramName;
				this.sParams.appendChild(this.sPNameSave.cloneNode(true))
			}

			if(message.returns){
				this.sType.innerHTML = message.returns;
			}else{
				this.sType.innerHTML = "void";
			}

			this.sName.innerHTML = message.name;

			this.domNode.appendChild(this.navSave);
			this.domNode.appendChild(this.detailSave.cloneNode(true));

			for(var i = 0, append; append = appends[i]; i++){
				dojo.dom.removeNode(append);
			}
		},
		onPkgResults: function(/*Object*/ results){
			var methods = results.methods;
			var requires = results.requires;
			var description = results.description;
			var requireLinks = [];
			var appends = this._appends;
			while(appends.length){
				dojo.dom.removeNode(appends.shift());
			}

			dojo.dom.removeChildren(this.domNode);
			
			this.pkg.innerHTML = results.pkg;
			
			var hasRequires = false;
			for(var env in requires){
				hasRequires = true;

				this.rH3.style.display = "none";
				if(env != "common"){
					this.rH3.style.display = "";
					this.rH3.innerHTML = env;
				}

				for(var i = 0, require; require = requires[env][i]; i++){
					requireLinks.push({
						name: require
					});
					this.rLink.innerHTML = require;
					this.rLink.href = "#" + require;
					var rRow2 = this.rRow2.parentNode.insertBefore(this.rRow2.cloneNode(true), this.rRow2);
					rRow2.style.display = "";
					appends.push(rRow2);
				}
				var rRow = this.rRow.parentNode.insertBefore(this.rRow.cloneNode(true), this.rRow);
				rRow.style.display = "";
				appends.push(rRow);
			}
			
			if(hasRequires){
				appends.push(this.packageSave.appendChild(this.requires.cloneNode(true)));
			}

			if(results.size){
				for(var i = 0, method; method = methods[i]; i++){
					this.mLink.innerHTML = method.name;
					this.mLink.href = "#" + method.name;
					this.mDesc.parentNode.style.display = "none";
					if(method.summary){
						this.mDesc.parentNode.style.display = "inline";				
						this.mDesc.innerHTML = method.summary;
					}
					var mRow = this.mRow.parentNode.insertBefore(this.mRow.cloneNode(true), this.mRow);
					mRow.style.display = "";
					appends.push(mRow);
				}
				appends.push(this.packageSave.appendChild(this.methods.cloneNode(true)));
			}

			this.domNode.appendChild(this.packageSave);
			
			dojo.debug(description);
			this.pkgDescription.replaceEditorContent(description);
			
			function makeSelect(fOrP, x){
				return function(e) {
					dojo.event.topic.publish("/docs/" + fOrP + "/select", x);
				}
			}

			var as = this.domNode.getElementsByTagName("a");
			for(var i = 0, a; a = as[i]; i++){
				if(a.className == "docMLink"){
					dojo.event.connect(a, "onclick", makeSelect("function", methods[i]));
				}else if(a.className == "docRLink"){
					dojo.event.connect(a, "onclick", makeSelect("package", requireLinks[i]));
				}
			}
		},
		onDocResults: function(message){
			var results = message.docResults;

			if(results.length == 1){
				dojo.event.topic.publish("/docs/function/select", results[0]);
				return;
			}

			dojo.dom.removeChildren(this.domNode);

			this.count.innerHTML = results.length;
			var appends = [];
			for(var i = 0, row; row = results[i]; i++){
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
					dojo.event.topic.publish("/docs/function/select", x);
				}
			}

			this.domNode.appendChild(this.resultSave.cloneNode(true));
			var as = this.domNode.getElementsByTagName("a");
			for(var i = 0, a; a = as[i]; i++){
				dojo.event.connect(a, "onclick", makeSelect(results[i]));
			}

			for(var i = 0, append; append = appends[i]; i++){
				this.rowParent.removeChild(append);
			}
		}
	}
);