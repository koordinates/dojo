dojo.provide("dojo.collections.Dictionary");
dojo.require("dojo.collections.Collections");

dojo.collections.Dictionary = function(){
	var items = {};
	this.count = 0;
	this.add = function(k,v){
		items[k] = new dojo.collections.DictionaryEntry(k,v);
		this.count++;
	};
	this.clear = function(){
		items = {};
		this.count = 0;
	};
	this.clone = function(){
		var d = new dojo.collections.Dictionary();
		for (var p in items) d.add(items[p].key, items[p].value);
		return d;
	};
	this.contains = this.containsKey = function(k){
		return (items[k] != null);
	};
	this.containsValue = function(v){
		var e = this.getIterator();
		while (e.moveNext()) {
			if (e.value == v) return true;
		}
		return false;
	};
	this.item = function(f){
		return items[k];
	};
	this.getIterator = function(){
		return new dojo.collections.DictionaryIterator(items);
	};
	this.remove = function(k){
		delete items[k];
		this.count--;
	};
};
