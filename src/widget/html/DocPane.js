dojo.provide("dojo.widget.html.DocPane");

dojo.require("dojo.widget.*");
dojo.require("dojo.io.*");
dojo.require("dojo.event.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.DocPane");
dojo.require("dojo.widget.Editor");

dojo.widget.html.DocPane = function(){
	dojo.event.topic.subscribe("/doc/function/results", this, "onDocResults");
	dojo.event.topic.subscribe("/doc/package/results", this, "onPkgResults");
	dojo.event.topic.subscribe("/doc/function/detail", this, "onDocSelectFunction");
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
		templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlDocPane.html"),
		templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlDocPane.css"),
		isContainer: true,
		fillInTemplate: function(){
			this.homeSave = this.containerNode.cloneNode(true);
			this.detailSave = dojo.dom.removeNode(this.detail);
			this.resultSave = dojo.dom.removeNode(this.result);
			this.packageSave = dojo.dom.removeNode(this.packag);
			this.requiresSave = dojo.dom.removeNode(this.requires);
			this.methodsSave = dojo.dom.removeNode(this.methods);
			this.rowParent = this.row.parentNode;
			this.rowSave = dojo.dom.removeNode(this.row);
			this.mParent = this.mRow.parentNode;
			this.mSave = dojo.dom.removeNode(this.mRow);
			this.vParent = this.vRow.parentNode;
			this.vSave = dojo.dom.removeNode(this.vRow);
			this.rParent = this.rRow.parentNode;
			this.rSave = dojo.dom.removeNode(this.rRow);
			this.r2Parent = this.rRow2.parentNode;
			this.r2Save = dojo.dom.removeNode(this.rRow2);
			this.pParent = this.pRow.parentNode;
			this.pSave = dojo.dom.removeNode(this.pRow);
			this.sPTypeSave = dojo.dom.removeNode(this.sPType);
			this.sPNameSave = dojo.dom.removeNode(this.sPName);
			this.navSave = dojo.dom.removeNode(this.nav);
		},
		postCreate: function(){
			this.pkgDescription = dojo.widget.createWidget("editor", {
				items: ["textGroup", "blockGroup", "justifyGroup", "colorGroup", "listGroup", "indentGroup", "linkGroup"]
			}, this.pkgDescription);
		},
		onDocSelectFunction: function(message){
			var meta = message.meta;
			if(meta){
				var variables = meta.variables;
				var this_variables = meta.this_variables;
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
			dojo.debug("onPkgResults()");
			var fns = results.fns;
			var requires = results.requires;
			var requireLinks = [];

			dojo.dom.removeChildren(this.domNode);
			
			this.pkg.innerHTML = results.pkg;
			
			var appends = [];
			for(var env in requires){
				this.rH3.style.display = "";
				this.rH3.innerHTML = env;
				if(env == "common"){
					this.rH3.style.display = "none";
				}
				var rAppends = [];
				for(var i = 0, require; require = requires[env][i]; i++){
					requireLinks.push({
						name: require
					});
					this.rLink.innerHTML = require;
					this.rLink.href = "#" + require;
					rAppends.push([this.r2Parent, this.r2Parent.appendChild(this.r2Save.cloneNode(true))]);
				}
				appends.push([this.rParent, this.rParent.appendChild(this.rSave.cloneNode(true))]);
				while(rAppends.length){
					var append = rAppends.shift();
					append[0].removeChild(append[1]);
				}
			}
			appends.push([this.packageSave, this.packageSave.appendChild(this.requiresSave.cloneNode(true))]);
			if(results.size){
				for(var i = 0, fn; fn = fns[i]; i++){
					this.mLink.innerHTML = fn.name;
					this.mLink.href = "#" + fn.name;
					this.mDesc.parentNode.style.display = "none";
					if(fn.summary){
						this.mDesc.parentNode.style.display = "inline";				
						this.mDesc.innerHTML = fn.summary;
					}
					appends.push([this.mParent, this.mParent.appendChild(this.mSave.cloneNode(true))]);
				}
				appends.push([this.packageSave, this.packageSave.appendChild(this.methodsSave.cloneNode(true))]);
			}

			//this.pkgDescription.replaceEditorContent(results.description);
			this.domNode.appendChild(this.packageSave.cloneNode(true));
			
			function makeSelect(x){
				return function(e) {
					dojo.event.topic.publish("/doc/function/select", x);
				}
			}

			var as = this.domNode.getElementsByTagName("a");
			for(var i = 0, a; a = as[i]; i++){
				if(a.className == "docMLink"){
					dojo.event.connect(a, "onclick", makeSelect(fns[i]));
				}else if(a.className == "docRLink"){
					dojo.event.connect(a, "onclick", makeSelect(requireLinks[i]));
				}
			}

			while(appends.length){
				var append = appends.shift();
				append[0].removeChild(append[1]);
			}
		},
		onDocResults: function(message){
			var results = message.docResults;

			if(results.length == 1){
				dojo.event.topic.publish("/doc/function/select", results[0]);
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
					dojo.event.topic.publish("/doc/function/select", x);
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