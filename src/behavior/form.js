dojo.provide("dojo.behavior.form");
dojo.require("dojo.html.style");
dojo.require("dojo.event.*");

dojo.require("dojo.experimental");
dojo.experimental("dojo.behavior.form");

//
// TODO: Need to handle escape key
dojo.behavior.form=new function(){
	
	this.titleClass="title";
	
	this.decorateInputTitles = function(node){
		var elms=node.getElementsByTagName("input");
		if(!elms){return;}
		
		var forms={};
		
		for(var i=0;i<elms.length;i++){
			var title=elms[i].getAttribute("title");
			if (!title || title.length <= 0 || dj_undef("form", elms[i])) { continue; }
			
			var formId = elms[i].form.getAttribute("id");
			if(!formId){formId = elms[i].form.getAttribute("name");}
			if(!formId) { continue; }
			
			if(!forms[formId]){ forms[formId] = elms[i].form; }
			
			this.decorateInput(elms[i], title);
		}
		
		for (var f in forms){
			dojo.event.connect("before", forms[f], "onsubmit", dojo.lang.hitch(this, this.clearDecorations));
		}
	}
	
	this.decorateInput = function(node, title){
		var currVal=node.getAttribute("value");
		if(currVal && currVal.length > 0){return;}
		
		dojo.html.prependClass(node, this.titleClass);
		node.value=title+"..";
		dojo.event.browser.addListener(node, "onfocus", dojo.lang.hitch(this, this.nodeFocused));
		dojo.event.browser.addListener(node, "onblur", dojo.lang.hitch(this, this.nodeBlurred));
		dojo.event.browser.addListener(node, "onkeyup", dojo.lang.hitch(this, this.nodeBlurred));
	}
	
	this.nodeFocused = function(evt){
		if(!evt){return;}
		var node;
		if(evt["currentTarget"]){node=evt.currentTarget;}
		else if(evt["target"]){node=evt.target;}
		
		if(!node){return;}
		
		dojo.html.removeClass(node, this.titleClass);
		node.value="";
	}
	
	this.nodeBlurred = function(evt){
		if(!evt){return;}
		var node;
		if(evt["currentTarget"]){node=evt.currentTarget;}
		else if(evt["target"]){node=evt.target;}
		
		if(!node || dj_undef("value", node)){return;}
		if (!dj_undef("keyCode", evt) && evt.keyCode == evt.KEY_ESCAPE){
			node.blur();
		}
		
		var title=node.getAttribute("title");
		var value=node.value;
		if(value && value.length > 0) {
			value=value.substr(0, value.indexOf(".."));
		}
		if (value && value.length > 0 && value.toLowerCase() != title.toLowerCase()){
			return;
		}
		
		dojo.html.prependClass(node, this.titleClass);
		node.value=title+"..";
	}
	
	this.clearDecorations = function(evt){
		if(!evt){return;}
		var form;
		if(evt["currentTarget"]){form=evt.currentTarget;}
		else if(evt["target"]){form=evt.target;}
		
		if(!form) { return; }
		
		var elms=form.getElementsByTagName("input");
		for(var i=0;i<elms.length;i++){
			if (dj_undef("value", elms[i])) {continue;}
			
			var title=elms[i].getAttribute("title");
			if (!title || title.length <= 0) { continue; }
			
			var value=elms[i].value;
			// clear out ".." first
			if(value && value.length > 0) {
				value=value.substr(0, value.indexOf(".."));
			}
			
			if (value && value.length > 0 && value.toLowerCase() == title.toLowerCase()){
				elms[i].value="";
			}
			
			dojo.event.browser.removeListener(elms[i], "onfocus", dojo.lang.hitch(this, this.nodeFocused));
			dojo.event.browser.removeListener(elms[i], "onblur", dojo.lang.hitch(this, this.nodeBlurred));
			dojo.event.browser.removeListener(elms[i], "onkeyup", dojo.lang.hitch(this, this.nodeBlurred));
		}
	}
}
