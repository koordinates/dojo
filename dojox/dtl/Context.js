dojo.provide("dojox.dtl.Context");

dojo.require("dojox.dtl._base");

dojo.required("dojox.dtl._base", function() {

dojox.dtl.Context = dojo.extend(function(dict){
	this._this = {};
	dojox.dtl._Context.call(this, dict);
}, dojox.dtl._Context.prototype,
{
	getKeys: function(){
		var keys = [];
		for(var key in this){
			if(dojo.isOwnProperty(this, key) && key != "_dicts" && key != "_this"){
				keys.push(key);
			}
		}
		return keys;
	},
	extend: function(/*dojox.dtl.Context|Object*/ obj){
		// summary: Returns a clone of this context object, with the items from the
		//		passed objecct mixed in.
		return  dojo.delegate(this, obj);
	},
	filter: function(/*dojox.dtl.Context|Object|String...*/ filter){
		// summary: Returns a clone of this context, only containing the items
		//		defined in the filter.
		var context = new dojox.dtl.Context();
		var keys = [];
		var i, arg;
		if(filter instanceof dojox.dtl.Context){
			keys = filter.getKeys();
		}else if(typeof filter == "object"){
			for(var key in filter){
				if (dojo.isOwnProperty(filter, key)) {
					keys.push(key);
				}
			}
		}else{
			for(i = 0; arg = arguments[i]; i++){
				if(typeof arg == "string"){
					keys.push(arg);
				}
			}
		}

		for(i = 0, key; key = keys[i]; i++){
			context[key] = this[key];
		}

		return context;
	},
	setThis: function(/*Object*/ _this){
		this._this = _this;
	},
	getThis: function(){
		return this._this;
	},
	hasKey: function(key){
		if(typeof this[key] != "undefined"){
			return true;
		}

		for(var i = 0, dict; dict = this._dicts[i]; i++){
			if(typeof dict[key] != "undefined"){
				return true;
			}
		}

		return false;
	}
});

});