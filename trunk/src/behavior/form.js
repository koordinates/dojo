dojo.provide("dojo.behavior.form");
dojo.require("dojo.html.style");
dojo.require("dojo.event.*");

dojo.require("dojo.experimental");
dojo.experimental("dojo.behavior.form");

//
// TODO: Document / get some code review
dojo.behavior.form=new function(){
	
	this.titleClass="title";
	
	function equals(val1, val2){
		if (val1 && val1.length > 0 && val2 && val2.length > 0
			&& val1.toLowerCase() == val2.toLowerCase()){
			return true;
		}
		return false;
	}
	
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
			
			dojo.event.browser.addListener(elms[i], "onfocus", dojo.lang.hitch(this, this.nodeFocused));
			dojo.event.browser.addListener(elms[i], "onblur", dojo.lang.hitch(this, this.nodeBlurred));
			dojo.event.browser.addListener(elms[i], "onkeyup", dojo.lang.hitch(this, this.nodeBlurred));
		}
		
		for (var f in forms){
			dojo.event.connect("before", forms[f], "onsubmit", dojo.lang.hitch(this, this.clearDecorations));
		}
	}
	
	this.decorateInput = function(node, title){
		var currVal=node.value;
		if (!title) {title=node.getAttribute("title");}
		if(!title) {return;}
		
		if (!equals(currVal,title) && currVal.length > 0) {return;}
		
		if(!dojo.html.hasClass(node, this.titleClass)){
			dojo.html.prependClass(node, this.titleClass);
		}
		node.value=title;
	}
	
	this.nodeFocused = function(evt){
		if(!evt){return;}
		
		var node;
		if(evt["currentTarget"]){node=evt.currentTarget;}
		else if(evt["target"]){node=evt.target;}
		if(!node){return;}
		
		node.removeAttribute("prevesc");
		dojo.html.removeClass(node, this.titleClass);
		
		// skip decoration if node has valid value
		var value=node.value;
		var title=node.getAttribute("title");
		if (!equals(value,title) && value.length > 0){return;}
		
		node.value="";
	}
	
	this.nodeBlurred = function(evt){
		if(!evt){return;}
		
		var node;
		if(evt["currentTarget"]){node=evt.currentTarget;}
		else if(evt["target"]){node=evt.target;}
		if(!node || dj_undef("value", node)){return;}
		
		// handle escape key
		if (!dj_undef("keyCode", evt)){
			if (evt.keyCode == evt.KEY_ESCAPE) {
				if (!node.getAttribute("prevesc")){
					var value=node.value;
					var title=node.getAttribute("title");
					if (value && value.length > 0 && !equals(value,title)){
						dojo.debug("escaped on node", value, title);
						node.setAttribute("prevesc","1");
						node.value="";
						return;
					} else {
						node.blur();
					}
				} else {
					node.value="";
					node.blur();
				}
			} else { // anything else is probably valid
				return;
			}
		}
		
		this.decorateInput(node);
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
			if (equals(value,title)){
				elms[i].value="";
			}
			
			dojo.event.browser.removeListener(elms[i], "onfocus", dojo.lang.hitch(this, this.nodeFocused));
			dojo.event.browser.removeListener(elms[i], "onblur", dojo.lang.hitch(this, this.nodeBlurred));
			dojo.event.browser.removeListener(elms[i], "onkeyup", dojo.lang.hitch(this, this.nodeBlurred));
		}
	}
}
