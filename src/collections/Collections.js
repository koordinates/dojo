dojo.provide("dojo.collections.Collections");

dojo.collections = {Collections:true};
dojo.collections.DictionaryEntry = function(k,v){
	this.key = k;
	this.value = v;
	this.valueOf = function(){ return this.value; };
	this.toString = function(){ return this.value; };
}

dojo.collections.Iterator = function(a){
	var obj = a;
	var position = 0;
	this.atEnd = (position>=obj.length-1);
	if(this.atEnd) dojo.raise("dojo.collections.Iterator.ctor: array passed to ctor is empty.");
	this.current = obj[position];
	this.moveNext = function(){
		if(++position==obj.length){
			this.atEnd = true;
		}
		if(this.atEnd){
			dojo.raise("dojo.collections.Iterator.moveNext: iterator is at end position.");
		}
		this.current=obj[position];
	}
	this.reset = function(){
		position = 0;
		this.atEnd = false;
	}
}

dojo.collections.DictionaryIterator = function(obj){
	var arr = [] ;	//	Create an indexing array
	for (var p in obj) arr.push(obj[p]) ;	//	fill it up
	var position = 0 ;
	this.atEnd = (position>=arr.length-1);
	if(this.atEnd) dojo.raise("dojo.collections.DictionaryIterator.ctor: object passed to ctor has no properties.");
	this.current = arr[position] ;
	this.entry = this.current ;
	this.key = this.entry.key ;
	this.value = this.entry.value ;
	this.moveNext = function() { 
		if (++position == arr.length) {
			this.atEnd = true ;
		}
		if(this.atEnd){
			dojo.raise("dojo.collections.DictionaryIterator.moveNext: iterator is at end position.");
		}
		this.entry = this.current = arr[position] ;
		if (this.entry) {
			this.key = this.entry.key ;
			this.value = this.entry.value ;
		}
	} ;
	this.reset = function() { 
		position = 0 ; 
		this.atEnd = false ;
	} ;
};
